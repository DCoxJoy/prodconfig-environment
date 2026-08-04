(function () {
  // Safe extraction of script element
  let scriptEl = document.currentScript;
  if (!scriptEl) {
    // Fallback: search for the script tag in the document
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf("/embed-inline.js") !== -1) {
        scriptEl = scripts[i];
        break;
      }
    }
  }

  // Determine base URL (Next.js server location)
  let baseUrl = window.location.origin;
  if (scriptEl && scriptEl.src) {
    try {
      baseUrl = new URL(scriptEl.src).origin;
    } catch (e) {
      console.error("[Configurator Embed] Failed to parse script source URL:", e);
    }
  }

  // Configuration options from script data attributes with defaults
  const width = (scriptEl && scriptEl.getAttribute("data-width")) || "100%";
  const height = (scriptEl && scriptEl.getAttribute("data-height")) || "900px";
  const maxWidth = (scriptEl && scriptEl.getAttribute("data-max-width")) || "1200px";

  // Build the iframe — the entire configurator app, sized inline in the page's
  // own layout flow (no floating button, no open/close toggle).
  const iframe = document.createElement("iframe");
  iframe.src = `${baseUrl}/?embed=true`;
  iframe.title = "Product Configurator";
  iframe.setAttribute("allow", "payment");
  iframe.style.width = width;
  iframe.style.height = height;
  iframe.style.maxWidth = maxWidth;
  iframe.style.border = "none";
  iframe.style.display = "block";

  // Where to render: an explicit container (data-target, a CSS selector) if given —
  // needed because many CMS/page builders move injected <script> tags to the page
  // head or footer, so relying on the script's own position isn't reliable there.
  // Falls back to dropping the iframe right where the <script> tag sits.
  const targetSelector = scriptEl && scriptEl.getAttribute("data-target");
  const target = targetSelector ? document.querySelector(targetSelector) : null;

  if (targetSelector && !target) {
    console.error(`[Configurator Embed] data-target "${targetSelector}" was not found on the page.`);
  }

  if (target) {
    target.appendChild(iframe);
  } else if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.insertBefore(iframe, scriptEl.nextSibling);
  } else {
    document.body.appendChild(iframe);
  }
})();
