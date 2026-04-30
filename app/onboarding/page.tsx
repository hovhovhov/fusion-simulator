"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [step4Active, setStep4Active] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let detachClickHandler: (() => void) | null = null;
    let intervalId: number | null = null;
    let observer: MutationObserver | null = null;

    const routeToSimulator = () => router.push("/simulator");

    const bindFrameHandlers = () => {
      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        if (!doc || !win) return;
        (win as Window & { __setOnboardingStep4Active?: (active: boolean) => void }).__setOnboardingStep4Active =
          setStep4Active;

        const clickHandler = (event: MouseEvent) => {
          const target = event.target as HTMLElement | null;
          const clickable = target?.closest("a,button,[role='button']") as HTMLElement | null;
          if (!clickable) return;
          const text = normalizeText(clickable.textContent || "");
          const href = (clickable as HTMLAnchorElement).getAttribute?.("href") || "";
          const isStep4 = isFinalStepActive(doc);
          const isPostOnboarding = isPostOnboardingStep(doc);
          const launchesSimulator =
            href.toLowerCase().includes("simulator") ||
            /enter the simulator|enter simulator|open simulator/.test(text);

          if (
            launchesSimulator
          ) {
            event.preventDefault();
            event.stopPropagation();
            routeToSimulator();
            return;
          }

          // If onboarding's own flow still shows a final "continue",
          // end the flow here and route to the simulator.
          if ((isStep4 || isPostOnboarding) && /continue/.test(text)) {
            event.preventDefault();
            event.stopPropagation();
            routeToSimulator();
          }
        };

        doc.addEventListener("click", clickHandler, true);
        detachClickHandler = () => doc.removeEventListener("click", clickHandler, true);
        patchFinalStepLayout(doc);
        observer = new MutationObserver(() => {
          patchFinalStepLayout(doc);
          if (isPostOnboardingStep(doc)) {
            routeToSimulator();
          }
        });
        observer.observe(doc.body, { childList: true, subtree: true });

        intervalId = window.setInterval(() => {
          try {
            const path = win.location.pathname.toLowerCase();
            if (path.includes("simulator")) {
              routeToSimulator();
            }
          } catch {
            // Ignore cross-document access errors.
          }
        }, 500);
      } catch {
        // Ignore access errors and keep top-level skip as fallback.
      }
    };

    iframe.addEventListener("load", bindFrameHandlers);
    bindFrameHandlers();

    return () => {
      iframe.removeEventListener("load", bindFrameHandlers);
      if (detachClickHandler) detachClickHandler();
      if (intervalId) window.clearInterval(intervalId);
      if (observer) observer.disconnect();
    };
  }, [router]);

  return (
    <main className="relative h-screen w-screen bg-black">
      <iframe
        ref={iframeRef}
        src="/onboarding.html"
        title="Fusion simulator onboarding"
        className="h-full w-full border-0"
      />
      <button
        type="button"
        onClick={() => router.push("/simulator")}
        className={`absolute bottom-10 left-1/2 z-30 -translate-x-1/2 border border-white/20 bg-black/55 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-white/90 backdrop-blur transition-opacity ${
          step4Active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        Enter the simulator →
      </button>
    </main>
  );
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function patchFinalStepLayout(doc: Document) {
  hideNoiseOverlays(doc);

  const step4Active = isFinalStepActive(doc);
  const win = doc.defaultView as (Window & { __setOnboardingStep4Active?: (active: boolean) => void }) | null;
  if (win?.__setOnboardingStep4Active) {
    win.__setOnboardingStep4Active(step4Active);
  }

  const enterButtons = Array.from(
    doc.querySelectorAll<HTMLElement>("a,button,[role='button']"),
  ).filter((el) => /enter the simulator|enter simulator/.test(normalizeText(el.textContent || "")));

  enterButtons.forEach((enterButton) => {
    // Hide embedded CTA to avoid right-side duplicate; external CTA is authoritative.
    enterButton.style.opacity = "0";
    enterButton.style.pointerEvents = "none";
    enterButton.style.visibility = "hidden";
  });
}

function hideNoiseOverlays(doc: Document) {
  const byId = ["__bundler_loading", "__bundler_err"];
  byId.forEach((id) => {
    const el = doc.getElementById(id) as HTMLElement | null;
    if (!el) return;
    el.style.display = "none";
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
  });

  // Defensive: hide tiny fixed badges in bottom-left (like "N" bubbles)
  const candidates = Array.from(doc.querySelectorAll<HTMLElement>("div,button,a,span"));
  candidates.forEach((el) => {
    const style = doc.defaultView?.getComputedStyle(el);
    if (!style) return;
    if (style.position !== "fixed") return;
    const rect = el.getBoundingClientRect();
    const nearBottomLeft = rect.left < 80 && rect.bottom > (doc.defaultView?.innerHeight ?? 0) - 80;
    const tiny = rect.width <= 40 && rect.height <= 40;
    const text = normalizeText(el.textContent || "");
    if (nearBottomLeft && tiny && (text === "n" || text === "issue" || text === "")) {
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
    }
  });
}

function isFinalStepActive(doc: Document) {
  return hasVisibleCopy(doc, [
    "everything above the line",
    "you are about to simulate",
    "we are here",
  ]);
}

function isPostOnboardingStep(doc: Document) {
  return hasVisibleCopy(doc, [
    "hold a star in your hand",
  ]);
}

function hasVisibleCopy(doc: Document, needles: string[]) {
  const nodes = Array.from(doc.querySelectorAll<HTMLElement>("p,div,span,h1,h2,h3,button,a"));
  return nodes.some((el) => {
    const text = normalizeText(el.textContent || "");
    if (!needles.some((needle) => text.includes(needle))) return false;
    const style = doc.defaultView?.getComputedStyle(el);
    if (!style) return true;
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || "1") > 0.05;
  });
}
