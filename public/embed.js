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
  const position = (scriptEl && scriptEl.getAttribute("data-position")) || "bottom-right"; // FAB trigger button corner: bottom-right, bottom-left, top-right, top-left
  const startOpen = scriptEl && scriptEl.getAttribute("data-open") === "true";
  const width = (scriptEl && scriptEl.getAttribute("data-width")) || "25vw"; // panel width — a quarter of the viewport by default
  const height = (scriptEl && scriptEl.getAttribute("data-height")) || "100vh"; // panel height — full viewport height by default
  // Side panel slides in from whichever edge the FAB is on (left or right), so it
  // never opens on top of the button itself.
  const side = position.indexOf("left") !== -1 ? "left" : "right";

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
    
    /* Position variations */
    .agc-pos-bottom-right { bottom: 20px; right: 20px; align-items: flex-end; }
    .agc-pos-bottom-left { bottom: 20px; left: 20px; align-items: flex-start; }
    .agc-pos-top-right { top: 20px; right: 20px; align-items: flex-end; flex-direction: column-reverse; }
    .agc-pos-top-left { top: 20px; left: 20px; align-items: flex-start; flex-direction: column-reverse; }

    /* Floating Action Button (FAB) */
    .agc-fab {
      width: 56px;
      height: 56px;
      border-radius: 28px;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      outline: none;
      margin-top: 15px;
      margin-bottom: 15px;
    }
    
    .agc-fab:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 6px 24px rgba(79, 70, 229, 0.5);
    }
    
    .agc-fab:active {
      transform: scale(0.95);
    }
    
    .agc-fab svg {
      width: 24px;
      height: 24px;
      transition: transform 0.4s ease;
    }
    
    .agc-fab.agc-active svg {
      transform: rotate(90deg);
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

  // frameContainer is appended directly to <body>, not inside the FAB's corner
  // container — it's a full-height side panel anchored to the left/right edge
  // of the viewport, sized independent of the FAB's own small corner box.
  container.appendChild(fab);
  document.body.appendChild(frameContainer);
  document.body.appendChild(container);

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
