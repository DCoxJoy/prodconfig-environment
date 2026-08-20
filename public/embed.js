(function () {
  // Bundle Builder is USA-only for now — the WPCode snippet runs site-wide via
  // Header & Footer, but /apac, /tw, and /jp are other locale versions of the site
  // that shouldn't show the button at all, regardless of positioning mode
  // (floating corner or data-target/header-inline). Bail out before anything else
  // runs so those pages render nothing.
  const EXCLUDED_PATH_PREFIXES = ["/apac", "/tw", "/jp"];
  const currentPath = window.location.pathname.toLowerCase();
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => currentPath === prefix || currentPath.startsWith(prefix + "/"))) {
    return;
  }

  // Safe extraction of script element
  let scriptEl = document.currentScript;
  if (!scriptEl) {
    // Fallback: search for the script tag in the document
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf("/embed.js") !== -1) {
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
  const position = (scriptEl && scriptEl.getAttribute("data-position")) || "bottom-right"; // FAB trigger button corner: bottom-right, bottom-left, top-right, top-left. Also controls which edge the panel slides from when data-target is set.
  const startOpen = scriptEl && scriptEl.getAttribute("data-open") === "true";
  const width = (scriptEl && scriptEl.getAttribute("data-width")) || "25vw"; // panel width — a quarter of the viewport by default
  const height = (scriptEl && scriptEl.getAttribute("data-height")) || "74vh"; // panel height — a shorter floating window by default, sized closer to the site's own chat widget (was 100vh)
  const label = (scriptEl && scriptEl.getAttribute("data-label")) || "Bundle Builder"; // text shown next to the FAB icon so it's clear what it opens
  // Side panel slides in from whichever edge the FAB is on (left or right), so it
  // never opens on top of the button itself.
  const side = position.indexOf("left") !== -1 ? "left" : "right";

  // Optional: render the FAB inline inside a specific page element (e.g. a header)
  // instead of floating fixed in a viewport corner. Same data-target pattern as
  // embed-inline.js — a CSS selector for an element already on the page. The slide-in
  // panel itself is unaffected: it's always fixed to the viewport edge given by `side`.
  const targetSelector = scriptEl && scriptEl.getAttribute("data-target");
  const target = targetSelector ? document.querySelector(targetSelector) : null;

  // When data-target is configured, a missing target means "this page shouldn't show
  // the button at all" (e.g. the script runs site-wide via WPCode, but only the USA
  // header template has the #axtion-config-btn anchor — every other locale/header
  // doesn't). Bail out entirely rather than falling back to a floating corner button,
  // so those pages render nothing instead of an unwanted floating widget. Floating
  // mode remains the default only for deployments that never set data-target at all.
  if (targetSelector && !target) {
    console.warn(`[Configurator Embed] data-target "${targetSelector}" was not found on this page — the Bundle Builder button will not be shown here.`);
    return;
  }

  // Create styling
  const style = document.createElement("style");
  style.innerHTML = `
    .agc-widget-container {
      position: fixed;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      transition: all 0.3s ease;
    }
    
    /* Position variations — bottom offset nudged down a touch (was 20px) so the FAB
       sits further from the app's own in-panel "Next step" button near the same corner. */
    .agc-pos-bottom-right { bottom: 10px; right: 20px; align-items: flex-end; }
    .agc-pos-bottom-left { bottom: 10px; left: 20px; align-items: flex-start; }
    .agc-pos-top-right { top: 20px; right: 20px; align-items: flex-end; flex-direction: column-reverse; }
    .agc-pos-top-left { top: 20px; left: 20px; align-items: flex-start; flex-direction: column-reverse; }

    /* Floating Action Button (FAB) — a single white pill (sparkle icon + "Bundle
       Builder" label, balanced padding on both sides) with a small red send-icon
       button tucked into its right edge — no colored background behind the pill
       itself, just a soft shadow/border for definition against the page. Font-family
       is set directly here (not just on .agc-widget-container above) because in
       data-target/inline mode the button is appended straight into the host page's
       target element, bypassing that wrapper entirely. background/border/color carry
       !important for the same data-target reason as before: a bare <button> sitting
       directly in host page markup is exposed to that page's own button styling,
       which can otherwise silently override ours. */
    .agc-fab {
      height: 44px;
      padding: 4px 16px;
      border-radius: 20px !important;
      background: white !important;
      border: 1px solid #c8291c !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      outline: none;
      margin-top: 15px;
      margin-bottom: 15px;
    }

    .agc-fab:hover {
      transform: scale(1.04) translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
    }

    .agc-fab:hover .agc-fab-send svg {
      color: #a8221a;
    }

    .agc-fab:active {
      transform: scale(0.97);
    }

    /* Idle content: sparkle icon + label, balanced with equal gaps on both sides of
       the label, and a plain red arrow icon (no background box) at the right edge —
       a cleaner look than the earlier solid red end-cap. */
    .agc-fab-idle {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .agc-fab-sparkle {
      width: 16px;
      height: 16px;
      color: #c8291c !important;
      flex-shrink: 0;
    }

    .agc-fab-label {
      color: #44403c !important;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }

    .agc-fab-send {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: auto;
    }

    .agc-fab-send svg {
      width: 16px;
      height: 16px;
      color: #c8291c !important;
      transition: color 0.3s ease;
    }

    /* Collapsed-circle icon for the mobile idle state (sparkle only). Hidden by
       default; shown only on phone widths below. Red, since the collapsed circle
       is the same white pill background as the idle state, just round instead of
       pill-shaped. */
    #agc-icon-collapsed {
      display: none;
      width: 20px;
      height: 20px;
      color: #c8291c;
    }

    /* Panel open: hide the FAB entirely rather than collapsing it to a close (X)
       circle — the app's own in-panel header now carries the close control (see
       the "message" listener below), so a second close button floating over the
       page was redundant. Reopening happens the same way it always did: the FAB
       simply isn't there while the panel is open, and reappears once it closes
       (via the header's X or by whatever else calls toggleWidget). */
    .agc-fab.agc-active {
      display: none;
    }

    /* On phone-width screens, collapse to the same plain red circle while idle too
       (sparkle icon only, no label/send button) — the full chat-bar-style pill is
       too wide for a floating corner widget on a small screen. */
    @media (max-width: 640px) {
      .agc-fab:not(.agc-active) {
        width: 44px;
        padding: 0;
        border-radius: 22px !important;
      }

      .agc-fab:not(.agc-active) .agc-fab-idle {
        display: none;
      }

      .agc-fab:not(.agc-active) #agc-icon-collapsed {
        display: block;
      }
    }

    /* Floating panel — bottom-anchored near the FAB (like the site's own chat
       widget) instead of pinned to the very top of the viewport, so a shorter
       data-height (70vh default, was 100vh) leaves open space above it rather than
       an empty gap below. Slides in from the left or right edge (whichever side the
       FAB sits on), independent of the FAB's own container. */
    .agc-frame-container {
      position: fixed;
      bottom: 20px;
      height: ${height};
      width: ${width};
      max-height: calc(100vh - 40px);
      max-width: 100vw;
      background: #020617;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      pointer-events: none;
      transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      z-index: 2147483646;
    }

    .agc-frame-container.agc-side-right {
      right: 0;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      transform: translateX(100%);
    }

    .agc-frame-container.agc-side-left {
      left: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      transform: translateX(-100%);
    }

    .agc-frame-container.agc-active {
      transform: translateX(0);
      pointer-events: auto;
    }

    /* On phone-width screens, revert to the full-screen app experience instead of
       the smaller floating desktop card — fills the entire viewport (both width and
       height) with no rounding, regardless of the configured data-width/data-height. */
    @media (max-width: 640px) {
      .agc-frame-container {
        top: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
      }
    }

    .agc-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
    }
  `;
  document.head.appendChild(style);

  // Create markup structure
  const container = document.createElement("div");
  container.className = `agc-widget-container agc-pos-${position}`;

  const frameContainer = document.createElement("div");
  frameContainer.className = `agc-frame-container agc-side-${side}`;

  const iframe = document.createElement("iframe");
  iframe.className = "agc-iframe";
  iframe.src = `${baseUrl}/?embed=true`;
  iframe.title = "Product Configurator Widget";
  iframe.setAttribute("allow", "payment");

  frameContainer.appendChild(iframe);

  const fab = document.createElement("button");
  fab.className = "agc-fab";
  fab.ariaLabel = "Configure Product";

  // Idle content: sparkle icon + label with a red send-icon button tucked into the
  // pill's right edge, plus the collapsed-circle icon shown on mobile idle widths
  // (sparkle only) — shown/hidden purely via CSS off the .agc-active class and
  // media queries — see the toggleWidget function below. The FAB has no "open"
  // state of its own to render (see .agc-fab.agc-active above): it just hides
  // while the panel is open, since the panel's own header carries the close
  // control now. Label text is set separately via textContent (not string
  // interpolation) so a data-label value can never inject markup into the page.
  fab.innerHTML = `
    <span class="agc-fab-idle">
      <svg class="agc-fab-sparkle" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8Z" />
      </svg>
      <span class="agc-fab-label"></span>
      <span class="agc-fab-send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      </span>
    </span>
    <svg id="agc-icon-collapsed" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8Z" />
    </svg>
  `;
  fab.querySelector(".agc-fab-label").textContent = label;

  // frameContainer is appended directly to <body>, not inside the FAB's corner
  // container — it's a full-height side panel anchored to the left/right edge
  // of the viewport, sized independent of the FAB's own small corner box.
  document.body.appendChild(frameContainer);
  if (target) {
    // Inline mode: drop the bare button into the target element, in normal document
    // flow — no fixed positioning, no corner container/offsets.
    target.appendChild(fab);
  } else {
    container.appendChild(fab);
    document.body.appendChild(container);
  }

  // Toggle Functionality — icon/label visibility for every state (idle pill, open,
  // collapsed mobile) is driven purely by CSS off the .agc-active class and media
  // queries (see the .agc-fab rules above), so toggling is just a class flip.
  let isOpen = false;

  function toggleWidget() {
    isOpen = !isOpen;
    frameContainer.classList.toggle("agc-active", isOpen);
    fab.classList.toggle("agc-active", isOpen);
  }

  fab.addEventListener("click", toggleWidget);

  // The app's own in-panel header now carries the close (X) control (next to
  // "Bundle Builder" / "Powered by The Joy Factory"), matching the site's chat
  // widget design — clicking it posts a message from inside the iframe rather
  // than calling anything cross-origin directly, since the panel-open state
  // lives out here in the host page, not inside the iframe. event.source is
  // checked against our own iframe's contentWindow so only that iframe (not
  // some other embedded frame on the page) can trigger the close.
  window.addEventListener("message", function (event) {
    if (event.source !== iframe.contentWindow) return;
    if (event.data && event.data.type === "agc-close" && isOpen) {
      toggleWidget();
    }
  });

  // Initialize state
  if (startOpen) {
    toggleWidget();
  }
})();
