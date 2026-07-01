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

function writeField(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = (el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement).prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (nativeSetter) {
    nativeSetter.call(el, value);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

export default function HubSpotForm({
  portalId,
  formId,
  region = 'na1',
  hiddenFields = {},
  onBeforeSubmit,
  onSubmitted,
}: HubSpotFormProps) {
  const containerId     = useRef(`hs-form-${++hsFormCounter}`);
  const containerRef    = useRef<HTMLDivElement>(null);
  const initialized     = useRef(false);
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

        onFormSubmit: () => {
          // onFormSubmit fires synchronously before HubSpot serializes and
          // POSTs the form — this is the only reliable injection point.
          // For the message field we prepend bundle context to any user text;
          // all other hiddenFields are written directly.
          if (!containerRef.current) return;

          const fields = hiddenFieldsRef.current;
          const msgValue = fields['message'];

          if (msgValue) {
            const msgEl = containerRef.current.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
            if (msgEl) {
              const userText = msgEl.value.trim();
              writeField(msgEl, userText ? `${msgValue}\n\nCustomer notes:\n${userText}` : msgValue);
            }
          }

          for (const [name, value] of Object.entries(fields)) {
            if (name === 'message') continue;
            const el = containerRef.current.querySelector<HTMLInputElement | HTMLTextAreaElement>(
              `input[name="${name}"], textarea[name="${name}"]`
            );
            if (el) writeField(el, value);
          }

          const email = containerRef.current
            .querySelector<HTMLInputElement>('input[name="email"]')?.value ?? '';
          callbacksRef.current.onBeforeSubmit?.(email);
        },

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
