'use client';

import { useState } from 'react';
import { IconSend, IconShield, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { HubSpotPayload } from '../../types';

interface StepContactProps {
  source: 'certified' | 'escalation' | 'manual';
  escalationRequest: string;
  onBack: () => void;
}

export default function StepContact({ source, escalationRequest, onBack }: StepContactProps) {
  const { state, liveProducts, qtys } = useConfigurator();
  const { device, certified, features, scenarios, appliedEdits } = state;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [certification, setCertification] = useState('');
  const [notes, setNotes] = useState(
    source === 'escalation' ? `"${escalationRequest}" — no exact SKU match found, requesting specialist review.` : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const showBundle = source === 'escalation' || source === 'manual';
  const total = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * qtys[i], 0);
  const hasZeroed = qtys.some(q => q === 0);

  async function handleSubmit() {
    if (!firstName || !email) return;
    setSubmitting(true);
    setError('');

    const path =
      source === 'certified' ? 'certified_case_inquiry'
      : source === 'escalation' ? 'contact_sales_from_bundle'
      : 'contact_sales_from_bundle';

    const payload: HubSpotPayload = {
      path,
      device: device?.name ?? '',
      certified: certified === 'yes',
      features_selected: features,
      environment: scenarios,
      bundle: liveProducts.map((p, i) => ({
        type: p.type,
        name: p.name,
        sku: p.sku,
        qty: qtys[i],
        unit_price: p.unitPrice,
      })),
      bundle_total: total,
      ai_edits: appliedEdits.filter(e => e.matched).map(e => e.text),
      contact: { first_name: firstName, last_name: lastName, email, company },
    };

    try {
      const res = await fetch('/api/hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error ?? 'Submission failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="px-5 py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#f0faf6] border border-[#a8e0c8] flex items-center justify-center mx-auto mb-4">
          <IconSend size={20} style={{ color: '#1D9E75' }} />
        </div>
        <div className="text-[16px] font-medium text-stone-900 mb-2">Request submitted</div>
        <p className="text-[12px] text-stone-500 leading-relaxed">
          Our team will review your configuration and be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-3.5">
      {/* Banner */}
      {source === 'escalation' && (
        <div className="bg-[#fff8f0] border-[1.5px] border-[#f0a060] rounded-[8px] px-3 py-2.5 mb-3.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#c86000] mb-1 flex items-center gap-1.5">
            <IconAlertCircle size={11} />
            Your request needs a specialist
          </div>
          <p className="text-[12px] text-[#7a3a00] leading-[1.6]">
            Our AI couldn&rsquo;t find an exact match for your request. A Joy Factory sales rep will review your bundle and get back to you with the right product.
          </p>
          <div className="text-[12px] italic text-[#5a2a00] mt-1 px-2 py-1.5 bg-white/60 rounded-[8px] font-mono">
            &ldquo;{escalationRequest}&rdquo;
          </div>
        </div>
      )}
      {source === 'certified' && (
        <div className="bg-stone-50 border-l-2 border-brand px-3 py-2.5 mb-3.5 text-[12px] text-stone-500 leading-[1.5]">
          <IconShield size={13} className="inline mr-1.5 text-brand" />
          Certified cases require a compatibility check. A specialist will confirm the right product for your device and environment.
        </div>
      )}
      {source === 'manual' && (
        <div className="bg-stone-50 border-l-2 border-brand px-3 py-2.5 mb-3.5 text-[12px] text-stone-500 leading-[1.5]">
          <IconInfoCircle size={13} className="inline mr-1.5" />
          A Joy Factory representative will be in touch to help complete your order.
        </div>
      )}

      {/* Device chip */}
      <div className="bg-stone-50 border-[0.5px] border-stone-200 rounded-[8px] px-3 py-[9px] mb-3.5">
        <div className="text-[9px] text-stone-400 uppercase tracking-[0.04em] mb-[2px]">Device</div>
        <div className="text-[12px] text-stone-900">{device?.name ?? '—'}</div>
      </div>

      {/* Bundle summary — escalation + manual */}
      {showBundle && (
        <div className="bg-stone-50 border-[0.5px] border-stone-200 rounded-[8px] px-3 py-2.5 mb-3.5">
          <div className="text-[9px] text-stone-400 uppercase tracking-[0.04em] font-semibold mb-1.5">
            Recommended bundle
            {hasZeroed && (
              <span className="font-normal normal-case tracking-normal text-brand ml-1">— some items excluded by user</span>
            )}
          </div>
          {liveProducts.map((p, i) => {
            const excluded = qtys[i] === 0;
            return (
              <div key={i} className={['flex justify-between text-[11px] text-stone-500 py-[2px]', excluded ? 'opacity-50' : ''].join(' ')}>
                <span>
                  {p.type}: {p.name}
                  {excluded && <em className="italic text-[10px] ml-1">(excluded)</em>}
                </span>
                <span className="text-stone-900 font-medium font-mono">{excluded ? '×—0' : `×${qtys[i]}`}</span>
              </div>
            );
          })}
          <div className="flex justify-between text-[12px] font-semibold text-stone-900 border-t-[0.5px] border-stone-200 mt-1.5 pt-1.5">
            <span>Bundle sub-total{hasZeroed ? ' (active items only)' : ''}</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="mb-3">
        <div className="text-[11px] font-medium text-stone-900 mb-1">Full name</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Jane"
            className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-3 py-[9px] text-[12px] text-stone-900 bg-white focus:outline-none focus:border-brand font-sans"
          />
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Smith"
            className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-3 py-[9px] text-[12px] text-stone-900 bg-white focus:outline-none focus:border-brand font-sans"
          />
        </div>
      </div>
      <div className="mb-3">
        <div className="text-[11px] font-medium text-stone-900 mb-1">Work email</div>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jane@company.com"
          className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-3 py-[9px] text-[12px] text-stone-900 bg-white focus:outline-none focus:border-brand font-sans"
        />
      </div>
      <div className="mb-3">
        <div className="text-[11px] font-medium text-stone-900 mb-1">Company</div>
        <input
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Company name"
          className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-3 py-[9px] text-[12px] text-stone-900 bg-white focus:outline-none focus:border-brand font-sans"
        />
      </div>

      {source === 'certified' && (
        <div className="mb-3">
          <div className="text-[11px] font-medium text-stone-900 mb-1">Certification needed (optional)</div>
          <input
            value={certification}
            onChange={e => setCertification(e.target.value)}
            placeholder="e.g. Class I Division 2"
            className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-3 py-[9px] text-[12px] text-stone-900 bg-white focus:outline-none focus:border-brand font-sans"
          />
        </div>
      )}

      {source === 'escalation' && (
        <div className="mb-3">
          <div className="text-[11px] font-medium text-stone-900 mb-1">Additional notes for the sales team</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-3 py-[9px] text-[12px] text-stone-500 bg-stone-50 resize-none h-[72px] leading-[1.5] focus:outline-none font-sans"
          />
        </div>
      )}

      {error && (
        <div className="text-[11px] text-red-600 mb-2">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !firstName || !email}
        className={[
          'w-full border-none rounded-[8px] py-[11px] text-[13px] font-medium text-white cursor-pointer mt-1 flex items-center justify-center gap-1.5',
          submitting || !firstName || !email ? 'bg-stone-300 cursor-not-allowed' : 'bg-brand',
        ].join(' ')}
      >
        <IconSend size={13} />
        {submitting ? 'Submitting…' : 'Submit to sales team'}
      </button>
    </div>
  );
}
