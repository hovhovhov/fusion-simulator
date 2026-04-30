import { readFile } from "node:fs/promises";

const ONBOARDING_FILE = "/Users/hugo/Downloads/Fusion Onboarding.html";

function injectNavigationBridge(html: string) {
  const bridge = `
<script>
(function () {
  function go() { window.location.href = "/simulator"; }
  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target) return;
    var clickable = target.closest ? target.closest("button,a,[role='button']") : null;
    if (!clickable) return;
    var text = (clickable.textContent || "").toLowerCase();
    if (/start|launch|enter|continue|simulator|begin/.test(text)) {
      event.preventDefault();
      go();
    }
  }, true);
})();
</script>
`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${bridge}</body>`);
  }
  return `${html}${bridge}`;
}

export async function GET() {
  try {
    const html = await readFile(ONBOARDING_FILE, "utf8");
    return new Response(injectNavigationBridge(html), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(
      `<!doctype html><html><body style="background:#000;color:#fff;font-family:system-ui;padding:24px">
        <h1>Onboarding file not found</h1>
        <p>Expected at: <code>${ONBOARDING_FILE}</code></p>
        <p><a href="/simulator" style="color:#7dd3fc">Open simulator</a></p>
      </body></html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }
}
