'use client';

import { useEffect, useState } from 'react';
import { IconTool, IconX } from '@tabler/icons-react';

// Persistent title bar shown above the app on every step (including the intro
// splash), styled to match the site's own chat-widget header. The close (X)
// button only appears when the app is running inside the embed.js floating
// panel (?embed=true in an actual iframe, not a direct/standalone visit) —
// there's nothing for it to close otherwise. Clicking it posts a message to
// the parent page rather than calling window.close()/history, since the app
// itself can't collapse the panel — that's DOM embed.js owns on the host page.
//
// partnerName (from the /p/[partnerSlug] route) replaces "BUNDLE BUILDER" with the
// partner's own name; the "Powered by The Joy Factory" subtitle is unchanged either
// way. Undefined on the default route, which keeps its title exactly as before.
export default function AppHeader({ partnerName }: { partnerName?: string }) {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    const embedParam = new URLSearchParams(window.location.search).get('embed') === 'true';
    setIsEmbedded(embedParam && window.parent !== window);
  }, []);

  function handleClose() {
    window.parent.postMessage({ type: 'agc-close' }, '*');
  }

  return (
    <div className="bg-brand rounded-t-[10px] px-5 py-3.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center flex-shrink-0">
          <IconTool size={20} className="text-white" stroke={1.75} />
        </div>
        <div className="min-w-0">
          <div className="text-white font-bold text-[14px] tracking-wide leading-tight truncate">{partnerName ?? 'BUNDLE BUILDER'}</div>
          <div className="text-white/75 text-[12px] leading-tight truncate">Powered by The Joy Factory</div>
        </div>
      </div>
      {isEmbedded && (
        <button
          onClick={handleClose}
          aria-label="Close"
          className="text-white/90 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
        >
          <IconX size={22} stroke={1.75} />
        </button>
      )}
    </div>
  );
}
