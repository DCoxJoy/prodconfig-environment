(function () {
  // Get script elements to read parameters
  const scriptEl = document.currentScript;
  const scriptUrl = new URL(scriptEl.src);
  const baseUrl = scriptUrl.origin;

  // Configuration options from script data attributes
  const position = scriptEl.getAttribute("data-position") || "bottom-right"; // bottom-right, bottom-left, top-right, top-left
  const startOpen = scriptEl.getAttribute("data-open") === "true";

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

    /* Iframe Container */
    .agc-frame-container {
      width: 390px;
      height: 620px;
      max-height: calc(100vh - 120px);
      max-width: calc(100vw - 40px);
      background: #020617;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: none;
    }
    
    /* Frame animations based on vertical position */
    .agc-pos-top-right .agc-frame-container, .agc-pos-top-left .agc-frame-container {
      transform: translateY(-20px) scale(0.95);
    }

    .agc-frame-container.agc-active {
      display: block;
      opacity: 1;
      transform: translateY(0) scale(1);
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
  frameContainer.className = "agc-frame-container";

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

  container.appendChild(frameContainer);
  container.appendChild(fab);
  document.body.appendChild(container);

  // Toggle Functionality
  let isOpen = false;

  function toggleWidget() {
    isOpen = !isOpen;
    if (isOpen) {
      frameContainer.classList.add("agc-active");
      fab.classList.add("agc-active");
      document.getElementById("agc-icon-open").style.display = "none";
      document.getElementById("agc-icon-close").style.display = "block";
    } else {
      frameContainer.classList.remove("agc-active");
      fab.classList.remove("agc-active");
      document.getElementById("agc-icon-open").style.display = "block";
      document.getElementById("agc-icon-close").style.display = "none";
    }
  }

  fab.addEventListener("click", toggleWidget);

  // Initialize state
  if (startOpen) {
    toggleWidget();
  }
})();
