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
  hiddenFieldValues?: Record<string, string>;
  onSubmitted?: () => void;
}

let hsFormCounter = 0;

export default function HubSpotForm({
  portalId,
  formId,
  region = 'na1',
  hiddenFieldValues = {},
  onSubmitted,
}: HubSpotFormProps) {
  const containerId  = useRef(`hs-form-${++hsFormCounter}`);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized  = useRef(false);
  const callbacksRef = useRef({ onSubmitted });
  callbacksRef.current = { onSubmitted };

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
        // hiddenFieldValues is HubSpot's native pre-fill mechanism.
        // It sets field values through HubSpot's own internals before
        // submission, so it works even when reCAPTCHA is enabled.
        hiddenFieldValues,

        onFormSubmitted: () => {
          callbacksRef.current.onSubmitted?.();
        },
      });
    }

    if (window.hbspt) { create(); return; }

    if (document.querySelector('script[src*="js.hsforms.net"]')) {
      const poll = setInterval(() => {
        if (window.hbspt) { clearInterval(poll); create(); }
      }, 50);
      return () => clearInterval(poll);
    }

    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/embed/v2.js';
    script.charset = 'utf-8';
    script.async = true;
    script.addEventListener('load', create);
    document.body.appendChild(script);
  }, []);

  return <div id={containerId.current} ref={containerRef} />;
}
