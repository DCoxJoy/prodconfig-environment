'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    hbspt?: {
      forms: { create: (config: Record<string, unknown>) => void };
    };
  }
}

export interface HubSpotFormProps {
  portalId: string;
  formId: string;
  region?: string;
  hiddenFields?: Record<string, string>;
  onBeforeSubmit?: (email: string) => void;
  onSubmitted?: () => void;
}

let hsFormCounter = 0;

export default function HubSpotForm({
  portalId,
  formId,
  region = 'na1',
  hiddenFields = {},
  onBeforeSubmit,
  onSubmitted,
}: HubSpotFormProps) {
  const containerId    = useRef(`hs-form-${++hsFormCounter}`);
  const containerRef   = useRef<HTMLDivElement>(null);
  const initialized    = useRef(false);
  // Refs so callbacks are never stale inside the HubSpot event handlers
  const hiddenFieldsRef = useRef(hiddenFields);
  const callbacksRef    = useRef({ onBeforeSubmit, onSubmitted });
  hiddenFieldsRef.current = hiddenFields;
  callbacksRef.current    = { onBeforeSubmit, onSubmitted };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    function create() {
      if (!window.hbspt || !containerRef.current) return;

      window.hbspt.forms.create({
        portalId,
        formId,
        region,
        target: `#${containerId.current}`,

        onFormReady: () => {
          // HubSpot does async setup after onFormReady and resets field values.
          // 300ms gives it time to finish before we inject. We also use the
          // native prototype setter + input event so React's internal state
          // stays in sync with the DOM value we're setting.
          setTimeout(() => {
            if (!containerRef.current) return;
            for (const [name, value] of Object.entries(hiddenFieldsRef.current)) {
              const el = containerRef.current.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                `input[name="${name}"], textarea[name="${name}"]`
              );
              if (!el) continue;
              const proto = (el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement).prototype;
              const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
              if (nativeSetter) {
                nativeSetter.call(el, value);
                el.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
          }, 300);
        },

        onFormSubmit: () => {
          // Capture email before the form clears on submission.
          const email =
            containerRef.current
              ?.querySelector<HTMLInputElement>('input[name="email"]')
              ?.value ?? '';
          callbacksRef.current.onBeforeSubmit?.(email);
        },

        onFormSubmitted: () => {
          callbacksRef.current.onSubmitted?.();
        },
      });
    }

    // HubSpot script already loaded (e.g. another form on the same page)
    if (window.hbspt) { create(); return; }

    // Script tag exists but hasn't finished loading — poll
    if (document.querySelector('script[src*="js.hsforms.net"]')) {
      const poll = setInterval(() => {
        if (window.hbspt) { clearInterval(poll); create(); }
      }, 50);
      return () => clearInterval(poll);
    }

    // Load the script for the first time
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/embed/v2.js';
    script.charset = 'utf-8';
    script.async = true;
    script.addEventListener('load', create);
    document.body.appendChild(script);
  }, []); // intentionally empty — form is created once on mount

  return <div id={containerId.current} ref={containerRef} />;
}
