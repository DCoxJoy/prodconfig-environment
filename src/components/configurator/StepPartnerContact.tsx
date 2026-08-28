'use client';

import { IconSend } from '@tabler/icons-react';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { usePartner, usePartnerMode } from '../../lib/PartnerContext';
import { buildPartnerMailto } from '../../lib/partnerMailto';
import { formatPrice } from '../../lib/partners';

interface StepPartnerContactProps {
  source: 'certified' | 'escalation' | 'manual';
  escalationRequest: string;
  onBack: () => void;
}

// Replaces StepContact (the HubSpot-backed lead form) for any partner whose
// contactEmail is configured — see ConfiguratorShell's goContactSales. The mailto:
// hand-off already fired at the moment the user clicked through (Contact sales, Send a
// Quote, certified-yes, or an escalation banner); this screen is purely a confirmation,
// with a manual retry link in case the OS didn't have a mail client to hand it to —
// there's no reliable way for JS to detect that failure, so a plain link is the honest
// fallback rather than a fake success/failure detector.
export default function StepPartnerContact({ source, escalationRequest, onBack }: StepPartnerContactProps) {
  const { state, liveProducts, qtys } = useConfigurator();
  const { device } = state;
  const partner = usePartner();
  const mode = usePartnerMode();

  if (!partner) return null; // defensive only — this step never renders without one

  const mailtoHref = buildPartnerMailto({
    partner,
    mode,
    deviceName: device?.name ?? 'your device',
    source,
    escalationRequest,
    liveProducts,
    qtys,
  });

  const showBundle = source === 'escalation' || source === 'manual';
  const total = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * (qtys[i] ?? 0), 0);

  return (
    <div className="px-6 py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-[#f0faf6] border border-[#a8e0c8] flex items-center justify-center mx-auto mb-5">
        <IconSend size={22} style={{ color: '#1D9E75' }} />
      </div>
      <div className="text-[18px] font-semibold text-stone-900 mb-2">
        {mode === 'rep' ? 'Quote ready to send' : 'Message ready to send'}
      </div>
      <p className="text-[13px] text-stone-500 leading-relaxed max-w-xs mx-auto mb-6">
        Your email client should have opened with the details below pre-filled.{' '}
        Didn&rsquo;t open?{' '}
        <a href={mailtoHref} className="text-brand font-semibold underline">
          Click here
        </a>.
      </p>

      {showBundle && liveProducts.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 mb-5 text-left max-w-sm mx-auto">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Recommended bundle</div>
          <div className="space-y-1.5">
            {liveProducts.map((p, i) => (
              <div key={i} className="flex justify-between text-[13px]">
                <span className="text-stone-600">{p.type}: {p.name}</span>
                <span className="font-semibold font-mono ml-3 text-stone-900">×{qtys[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[13px] font-semibold text-stone-900 border-t border-stone-200 mt-3 pt-3">
            <span>Sub-total</span>
            <span>{formatPrice(total, partner)}</span>
          </div>
        </div>
      )}

      <p className="text-[11px] text-stone-400 max-w-sm mx-auto mb-6">
        *No data is saved. Following privacy laws, Joy Factory does not capture any
        information entered here. Your selections are only shared when you choose to
        send an email.
      </p>

      <button
        onClick={onBack}
        className="bg-transparent border-none text-[13px] text-stone-400 cursor-pointer py-2 hover:text-stone-600 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
