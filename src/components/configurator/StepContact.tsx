'use client';

import { useRef, useState } from 'react';
import { IconSend, IconShield, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';
import HubSpotForm from '../ui/HubSpotForm';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { HubSpotPayload } from '../../types';

const HS_PORTAL_ID = '20662622';
const HS_FORM_ID   = 'ba721aec-670d-456f-b004-c8434e9e3170';

interface StepContactProps {
  source: 'certified' | 'escalation' | 'manual';
  escalationRequest: string;
  onBack: () => void;
}

export default function StepContact({ source, escalationRequest, onBack }: StepContactProps) {
  const { state, liveProducts, qtys } = useConfigurator();
  const { device, certified, features, scenarios, appliedEdits } = state;

  const [submitted, setSubmitted] = useState(false);
  const capturedEmail = useRef('');

  const showBundle = source === 'escalation' || source === 'manual';
  const total      = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * qtys[i], 0);
  const hasZeroed  = qtys.some(q => q === 0);

  // Hidden fields injected into the HubSpot form on render.
  // lead_source is already set to "Web" in the HubSpot form definition — no override needed.
  // device_model and bundle_skus require matching hidden fields in the HubSpot form definition.
  const hiddenFields: Record<string, string> = {
    device_model: device?.name ?? '',
    bundle_skus:  liveProducts.map(p => p.sku).join(', '),
  };

  async function handleSubmitted() {
    setSubmitted(true);

    // Create a HubSpot deal with full bundle context.
    // Contact was already created by the form submission — the API route
    // searches by email to find it and associates the deal.
    const path: HubSpotPayload['path'] = source === 'certified'
      ? 'certified_case_inquiry'
      : 'contact_sales_from_bundle';

    const payload: HubSpotPayload = {
      path,
      device:            device?.name ?? '',
      certified:         certified === 'yes',
      features_selected: features,
      environment:       scenarios,
      bundle: liveProducts.map((p, i) => ({
        type: p.type, name: p.name, sku: p.sku, qty: qtys[i], unit_price: p.unitPrice,
      })),
      bundle_total: total,
      ai_edits:    appliedEdits.filter(e => e.matched).map(e => e.text),
      contact: capturedEmail.current
        ? { first_name: '', last_name: '', email: capturedEmail.current, company: '' }
        : undefined,
    };

    try {
      await fetch('/api/hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Deal creation is best-effort — form submission already succeeded
    }
  }

  /* ── Success state ─────────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-[#f0faf6] border border-[#a8e0c8] flex items-center justify-center mx-auto mb-5">
          <IconSend size={22} style={{ color: '#1D9E75' }} />
        </div>
        <div className="text-[18px] font-semibold text-stone-900 mb-2">Request submitted</div>
        <p className="text-[13px] text-stone-500 leading-relaxed max-w-xs mx-auto">
          Our team will review your configuration and be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      {/* ── Escalation banner ──────────────────────────────────────────── */}
      {source === 'escalation' && (
        <div className="bg-[#fff8f0] border border-[#f0a060] rounded-xl px-4 py-4 mb-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#c86000] mb-2">
            <IconAlertCircle size={13} />
            Your request needs a specialist
          </div>
          <p className="text-[13px] text-[#7a3a00] leading-relaxed mb-2.5">
            Our AI couldn&rsquo;t find an exact match for your request. A Joy Factory sales rep will review your bundle and get back to you.
          </p>
          <div className="text-[13px] italic text-[#5a2a00] px-3 py-2.5 bg-white/60 rounded-lg font-mono">
            &ldquo;{escalationRequest}&rdquo;
          </div>
        </div>
      )}

      {source === 'certified' && (
        <div className="flex gap-3 bg-stone-50 border-l-2 border-brand rounded-r-xl px-4 py-3.5 mb-5">
          <IconShield size={16} className="text-brand flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-stone-600 leading-relaxed">
            Certified cases require a compatibility check. A specialist will confirm the right product for your device and environment.
          </p>
        </div>
      )}

      {source === 'manual' && (
        <div className="flex gap-3 bg-stone-50 border-l-2 border-stone-400 rounded-r-xl px-4 py-3.5 mb-5">
          <IconInfoCircle size={16} className="text-stone-400 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-stone-600 leading-relaxed">
            A Joy Factory representative will be in touch to help complete your order.
          </p>
        </div>
      )}

      {/* ── Device chip ────────────────────────────────────────────────── */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mb-5">
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Device</div>
        <div className="text-[14px] font-medium text-stone-900">{device?.name ?? '—'}</div>
      </div>

      {/* ── Bundle summary ─────────────────────────────────────────────── */}
      {showBundle && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 mb-5">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
            Recommended bundle
            {hasZeroed && (
              <span className="font-normal normal-case tracking-normal text-brand ml-2">— some items excluded</span>
            )}
          </div>
          <div className="space-y-1.5">
            {liveProducts.map((p, i) => {
              const excluded = qtys[i] === 0;
              return (
                <div key={i} className={['flex justify-between text-[13px]', excluded ? 'opacity-45' : ''].join(' ')}>
                  <span className="text-stone-600">
                    {p.type}: {p.name}
                    {excluded && <em className="text-[12px] ml-1.5 text-stone-400">(excluded)</em>}
                  </span>
                  <span className={['font-semibold font-mono ml-3', excluded ? 'text-stone-400' : 'text-stone-900'].join(' ')}>
                    {excluded ? '—' : `×${qtys[i]}`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[13px] font-semibold text-stone-900 border-t border-stone-200 mt-3 pt-3">
            <span>Sub-total{hasZeroed ? ' (active items)' : ''}</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* ── HubSpot embedded form ────────────────────────────────────────── */}
      <HubSpotForm
        portalId={HS_PORTAL_ID}
        formId={HS_FORM_ID}
        hiddenFields={hiddenFields}
        onBeforeSubmit={email => { capturedEmail.current = email; }}
        onSubmitted={handleSubmitted}
      />

      <button
        onClick={onBack}
        className="w-full mt-3 bg-transparent border-none text-[13px] text-stone-400 cursor-pointer py-2 hover:text-stone-600 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
