'use client';

import { useState } from 'react';
import { IconSend, IconShield, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { usePartner } from '../../lib/PartnerContext';

interface StepContactProps {
  source: 'certified' | 'escalation' | 'manual';
  escalationRequest: string;
  onBack: () => void;
}

const INPUT =
  'w-full border border-stone-200 rounded-lg px-3 py-2.5 text-[14px] text-stone-900 bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors placeholder:text-stone-300';

const LABEL = 'block text-[11px] font-semibold text-stone-500 mb-1';

export default function StepContact({ source, escalationRequest, onBack }: StepContactProps) {
  const { state, liveProducts, qtys } = useConfigurator();
  const { device } = state;
  const partner = usePartner();

  // Pre-filled, not locked — the lead came in through this partner's embed, so their
  // name is a sensible default for "Company," but the visitor can still overwrite it
  // (e.g. if they're filling this out on the partner's behalf for a different company).
  const [form, setForm] = useState({
    firstname: '', lastname: '', company: partner?.name ?? '', industry: '',
    email: '', phone: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState('');

  const showBundle = source === 'escalation' || source === 'manual';
  const total      = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * qtys[i], 0);
  const hasZeroed  = qtys.some(q => q === 0);

  function setField(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function buildMessage() {
    const lines: string[] = [`Device: ${device?.name ?? '—'}`];
    if (source === 'escalation' && escalationRequest) {
      lines.push(`AI request: "${escalationRequest}"`);
    }
    if (showBundle && liveProducts.length > 0) {
      lines.push('', 'Recommended bundle:');
      liveProducts.forEach((p, i) => {
        const excluded = qtys[i] === 0;
        lines.push(`  ${p.type}: ${p.name} (${p.sku})${excluded ? ' [excluded]' : ` ×${qtys[i]}`}`);
      });
      lines.push(`  Sub-total: $${total.toFixed(2)}`);
    }
    lines.push('', '---', '');
    if (form.notes.trim()) lines.push('Customer notes:', form.notes.trim());
    return lines.join('\n');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, message: buildMessage() }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
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
      {/* ── Banners ─────────────────────────────────────────────────────── */}
      {source === 'escalation' && (
        <div className="bg-[#fff8f0] border border-[#f0a060] rounded-xl px-4 py-4 mb-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#c86000] mb-2">
            <IconAlertCircle size={13} />
            Your request needs a specialist
          </div>
          <p className="text-[13px] text-[#7a3a00] leading-relaxed mb-2.5">
            Our AI couldn&rsquo;t find an exact match. A Joy Factory sales rep will review your bundle and get back to you.
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

      {/* ── Device chip ─────────────────────────────────────────────────── */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mb-5">
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Device</div>
        <div className="text-[14px] font-medium text-stone-900">{device?.name ?? '—'}</div>
      </div>

      {/* ── Bundle summary ───────────────────────────────────────────────── */}
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

      {/* ── Contact form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>First name *</label>
            <input
              type="text" required value={form.firstname}
              onChange={e => setField('firstname', e.target.value)}
              className={INPUT} placeholder="Jane"
            />
          </div>
          <div>
            <label className={LABEL}>Last name *</label>
            <input
              type="text" required value={form.lastname}
              onChange={e => setField('lastname', e.target.value)}
              className={INPUT} placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <label className={LABEL}>Company *</label>
          <input
            type="text" required value={form.company}
            onChange={e => setField('company', e.target.value)}
            className={INPUT} placeholder="Acme Corp"
          />
        </div>

        <div>
          <label className={LABEL}>Industry</label>
          <input
            type="text" value={form.industry}
            onChange={e => setField('industry', e.target.value)}
            className={INPUT} placeholder="e.g. Healthcare, Construction…"
          />
        </div>

        <div>
          <label className={LABEL}>Email *</label>
          <input
            type="email" required value={form.email}
            onChange={e => setField('email', e.target.value)}
            className={INPUT} placeholder="jane@company.com"
          />
        </div>

        <div>
          <label className={LABEL}>Phone</label>
          <input
            type="tel" value={form.phone}
            onChange={e => setField('phone', e.target.value)}
            className={INPUT} placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className={LABEL}>Additional notes</label>
          <textarea
            rows={3} value={form.notes}
            onChange={e => setField('notes', e.target.value)}
            className={INPUT + ' resize-none'}
            placeholder="Anything else we should know…"
          />
        </div>

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand text-white rounded-xl py-3 text-[14px] font-semibold cursor-pointer hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconSend size={15} />
          {submitting ? 'Sending…' : 'Send request'}
        </button>
      </form>

      <button
        onClick={onBack}
        className="w-full mt-3 bg-transparent border-none text-[13px] text-stone-400 cursor-pointer py-2 hover:text-stone-600 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
