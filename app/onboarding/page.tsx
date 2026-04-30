import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="relative h-screen w-screen bg-black">
      <iframe
        src="/onboarding.html"
        title="Fusion simulator onboarding"
        className="h-full w-full border-0"
      />
      <Link
        href="/simulator"
        className="absolute right-4 top-4 z-20 border border-white/20 bg-black/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/90 backdrop-blur"
      >
        Skip to simulator
      </Link>
    </main>
  );
}
