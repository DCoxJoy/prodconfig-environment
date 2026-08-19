(function () {
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
  const height = (scriptEl && scriptEl.getAttribute("data-height")) || "100vh"; // panel height — full viewport height by default
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
  if (targetSelector && !target) {
    console.error(`[Configurator Embed] data-target "${targetSelector}" was not found — falling back to a floating corner button.`);
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

    /* Floating Action Button (FAB) — icon + label pill so it's clear what it opens.
       Collapses to a plain circle (icon only) while the panel is open. Font-family is
       set directly here (not just on .agc-widget-container above) because in
       data-target/inline mode the button is appended straight into the host page's
       target element, bypassing that wrapper entirely — Poppins matches the host
       site's other header buttons (falls back to the container's stack if Poppins
       isn't loaded on the page). */
    .agc-fab {
      height: 48px;
      padding: 0 20px 0 16px;
      border-radius: 24px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      border: 1.5px solid #c8291c;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #c8291c;
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      outline: none;
      margin-top: 15px;
      margin-bottom: 15px;
    }

    /* Label matches the button's overall color (red idle, white on hover — see
       .agc-fab:hover below) so it stays in sync with the icon, which also uses
       currentColor and flips the same way. */
    .agc-fab-label {
      color: inherit;
      transition: color 0.3s ease;
    }

    .agc-fab.agc-active {
      width: 48px;
      padding: 0;
    }

    .agc-fab.agc-active .agc-fab-label {
      display: none;
    }

    .agc-fab:hover {
      background: #c8291c;
      color: white;
      transform: scale(1.04) translateY(-2px);
      box-shadow: 0 6px 24px rgba(200, 41, 28, 0.4);
    }

    .agc-fab:active {
      transform: scale(0.97);
    }

    .agc-fab svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      transition: transform 0.4s ease;
    }

    .agc-fab.agc-active svg {
      transform: rotate(90deg);
    }

    /* Text-only pill above phone width: the open-state icon is dropped so the button
       is just the "Bundle Builder" label, shortening its width — useful when placed
       inline next to other plain-text buttons (e.g. in a header, via data-target).
       Scoped to non-active + non-mobile: the close (X) icon while the panel is open,
       and the icon-only circle forced on phone widths below, are untouched — both
       still need a visible icon since no label text is showing in those states.
       !important is needed to beat the inline display style the open/close toggle
       sets directly on the icon element. */
    @media (min-width: 641px) {
      .agc-fab:not(.agc-active) #agc-icon-open {
        display: none !important;
      }

      .agc-fab:not(.agc-active) {
        padding: 0 20px;
      }
    }

    /* On phone-width screens, always show the compact icon-only circle (never the
       text pill) — the widened label pill was overlapping other bottom-right page
       widgets (e.g. a chat widget's send button) on narrow screens. Shrinking it
       wasn't enough on its own: a chat widget commonly docks its own launcher/send
       button in that exact same bottom-right corner, so any button there collides
       with it once the chat panel is open. Moving the bottom-right corner variant
       over to the bottom-left on mobile only sidesteps that entirely — the panel's
       own slide-in side (data-position/side) is untouched, so it still opens from
       the same edge as before, just the small trigger button relocates. */
    @media (max-width: 640px) {
      .agc-fab {
        width: 48px;
        padding: 0;
      }

      .agc-fab-label {
        display: none;
      }

      .agc-pos-bottom-right {
        right: auto;
        left: 20px;
        align-items: flex-start;
      }
    }

    /* Side panel — full viewport height, slides in from the left or right edge
       (whichever side the FAB sits on), independent of the FAB's own container. */
    .agc-frame-container {
      position: fixed;
      top: 0;
      height: ${height};
      width: ${width};
      max-height: 100vh;
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
      border-top-left-radius: 16px;
      border-bottom-left-radius: 16px;
      transform: translateX(100%);
    }

    .agc-frame-container.agc-side-left {
      left: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      border-top-right-radius: 16px;
      border-bottom-right-radius: 16px;
      transform: translateX(-100%);
    }

    .agc-frame-container.agc-active {
      transform: translateX(0);
      pointer-events: auto;
    }

    /* On phone-width screens, the panel fills the full viewport instead of staying
       a narrow (e.g. 25vw) sliver — the configured data-width/data-height only apply
       at tablet width and up. Corner rounding/border are dropped too since the panel
       now reaches both screen edges. */
    @media (max-width: 640px) {
      .agc-frame-container {
        width: 100vw !important;
        max-width: 100vw !important;
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
  
  // Custom cog/lightning bolt svg icon
  const iconSvg = `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" id="agc-icon-open">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" id="agc-icon-close" style="display:none;">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;
  fab.innerHTML = iconSvg;

  // Label text appended via textContent (not string interpolation) so a data-label
  // value can never inject markup into the page.
  const fabLabel = document.createElement("span");
  fabLabel.className = "agc-fab-label";
  fabLabel.textContent = label;
  fab.appendChild(fabLabel);

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

  // Reference SVG nodes directly within the FAB container
  const iconOpen = fab.querySelector("#agc-icon-open");
  const iconClose = fab.querySelector("#agc-icon-close");

  // Toggle Functionality
  let isOpen = false;

  function toggleWidget() {
    isOpen = !isOpen;
    if (isOpen) {
      frameContainer.classList.add("agc-active");
      fab.classList.add("agc-active");
      if (iconOpen) iconOpen.style.display = "none";
      if (iconClose) iconClose.style.display = "block";
    } else {
      frameContainer.classList.remove("agc-active");
      fab.classList.remove("agc-active");
      if (iconOpen) iconOpen.style.display = "block";
      if (iconClose) iconClose.style.display = "none";
    }
  }

  fab.addEventListener("click", toggleWidget);

  // Initialize state
  if (startOpen) {
    toggleWidget();
  }
})();
