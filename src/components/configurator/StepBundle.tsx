'use client';

import { useEffect, useState, useRef } from 'react';
import {
  IconSparkles, IconShoppingCart, IconShare, IconX, IconCopy, IconSend, IconCheck,
} from '@tabler/icons-react';
import { getDeviceFamily } from '../../lib/utils';
import { getTablerIcon } from '../../lib/iconMap';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { buildReasoningParagraph } from '../../lib/reasoning';
import LoadingSpinner from '../ui/LoadingSpinner';

interface StepBundleProps {
  onContactSales: (source: 'manual') => void;
  onAddToCart: () => void;
}

export default function StepBundle({ onContactSales, onAddToCart }: StepBundleProps) {
  const { state, liveProducts, qtys } = useConfigurator();
  const { device, features, scenarios, appliedEdits } = state;

  const family = getDeviceFamily(device?.id ?? '');

  const [paragraph,   setParagraph]   = useState<string | null>(null);
  const [loadingPara, setLoadingPara] = useState(true);
  const [shareOpen,   setShareOpen]   = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const fetchedRef = useRef(false);

  const total    = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * qtys[i], 0);
  const totalQty = qtys.reduce((a, b) => a + b, 0);
  const hasItems = totalQty > 0;

  const matchedEdits    = appliedEdits.filter(e => e.matched);
  const lastChangedIndex = matchedEdits.length > 0
    ? liveProducts.findIndex(p => matchedEdits.some(e => e.detail?.includes(p.sku)))
    : -1;

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fallback = buildReasoningParagraph(
      device?.name ?? 'your device', family, features, scenarios, liveProducts, appliedEdits
    );

    fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceName: device?.name ?? 'your device',
        deviceFamily: family,
        features,
        scenarios,
        bundle: liveProducts.map((p, i) => ({ type: p.type, name: p.name, sku: p.sku, qty: qtys[i] })),
        appliedEdits,
      }),
    })
      .then(r => r.json())
      .then(data  => setParagraph(data.paragraph ?? fallback))
      .catch(()   => setParagraph(fallback))
      .finally(() => setLoadingPara(false));
  }, []);

  const shareMsg = [
    `Hi,\n\nHere's a bundle recommendation for the ${device?.name ?? 'your device'}.\n`,
    ...liveProducts
      .map((p, i) => qtys[i] > 0
        ? `• ${p.type}: ${p.name} (${p.sku}) ×${qtys[i]} — $${(p.unitPrice * qtys[i]).toFixed(2)}`
        : null)
      .filter(Boolean),
    `\nBundle sub-total: $${total.toFixed(2)}\n\nhttps://configurator.thejoyfactory.com/bundle/demo-12345`,
  ].join('\n');

  function copyLink() {
    navigator.clipboard.writeText('https://configurator.thejoyfactory.com/bundle/demo-12345').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function sendShare() {
    setSendSuccess(true);
    setTimeout(() => { setShareOpen(false); setSendSuccess(false); }, 1800);
  }

  return (
    <div className="px-6 py-6">
      {/* ── Edits applied banner ───────────────────────────────────────── */}
      {matchedEdits.length > 0 && (
        <div className="bg-[#f0faf6] border border-[#1D9E75] rounded-xl px-4 py-3.5 mb-5">
          <div className="flex items-center gap-2 text-[11px] text-[#136645] font-bold uppercase tracking-widest mb-2">
            <IconSparkles size={12} />
            Your requested changes were applied
          </div>
          {matchedEdits.map((edit, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-[#136645] py-1">
              <IconCheck size={13} className="flex-shrink-0 mt-0.5" />
              <span>
                &ldquo;{edit.text}&rdquo;
                {edit.detail && <span className="block text-[11px] opacity-80 mt-0.5">{edit.detail}</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Product rows ───────────────────────────────────────────────── */}
      <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-3">
        Your bundle
      </div>

      {liveProducts.map((p, i) => {
        const swapped  = i === lastChangedIndex && qtys[i] > 0;
        const excluded = qtys[i] === 0;
        const Icon     = getTablerIcon(p.icon);
        return (
          <div
            key={i}
            className={[
              'flex items-center gap-3.5 py-4 border-b border-stone-200 last:border-b-0 relative transition-opacity',
              swapped  ? 'bg-[#f0faf6] -mx-2 px-2 rounded-xl border-b-0 mb-1' : '',
              excluded ? 'opacity-40' : '',
            ].join(' ')}
          >
            {swapped && (
              <span className="absolute top-2 right-0 text-[10px] text-white bg-[#1D9E75] px-2 py-0.5 rounded-full font-bold tracking-wide">
                UPDATED
              </span>
            )}
            {excluded && (
              <span className="absolute top-2 right-0 text-[10px] text-white bg-stone-400 px-2 py-0.5 rounded-full font-bold tracking-wide">
                NOT IN CART
              </span>
            )}
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest mb-0.5">{p.type}</div>
              <div className="text-[14px] font-semibold text-stone-900 leading-tight">{p.name}</div>
              <div className="text-[11px] text-stone-400 font-mono mt-0.5">{p.sku}</div>
              <div className="text-[12px] text-stone-500 mt-0.5">
                {excluded ? <em className="text-stone-400">Excluded</em> : `Qty: ${qtys[i]}`}
              </div>
            </div>
            <div className={['text-[14px] font-semibold ml-auto flex-shrink-0 text-right', excluded ? 'text-stone-400' : 'text-stone-900'].join(' ')}>
              ${(p.unitPrice * qtys[i]).toFixed(2)}
              {qtys[i] > 1 && <div className="text-[11px] font-normal text-stone-400">${p.unitPrice.toFixed(2)} ×{qtys[i]}</div>}
            </div>
          </div>
        );
      })}

      {/* ── Bundle total ───────────────────────────────────────────────── */}
      <div className="flex justify-between items-center pt-5 pb-6 border-t border-stone-200 mt-1">
        <div>
          <div className="text-[13px] font-medium text-stone-600">Bundle sub-total</div>
          <div className="text-[11px] text-stone-400">{totalQty} item{totalQty !== 1 ? 's' : ''} · bundle pricing applied</div>
        </div>
        <div className="text-[26px] font-semibold text-stone-900">${total.toFixed(2)}</div>
      </div>

      {/* ── CTA grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          disabled={!hasItems}
          onClick={onAddToCart}
          className={[
            'flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 text-[12px] font-semibold transition-colors',
            hasItems
              ? 'bg-brand text-white cursor-pointer border-none'
              : 'bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed',
          ].join(' ')}
        >
          <IconShoppingCart size={18} />
          Add to cart
        </button>
        <button
          onClick={() => onContactSales('manual')}
          className="flex flex-col items-center justify-center gap-1.5 bg-white border border-stone-200 rounded-xl py-3.5 text-[12px] font-semibold text-stone-700 cursor-pointer hover:bg-stone-50 transition-colors"
        >
          <span className="text-[18px] leading-none">✉</span>
          Contact sales
        </button>
        <button
          onClick={() => setShareOpen(o => !o)}
          className={[
            'flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 text-[12px] font-semibold border transition-colors cursor-pointer',
            shareOpen ? 'bg-share text-white border-share' : 'bg-white text-share border-share hover:bg-share/5',
          ].join(' ')}
        >
          <IconShare size={18} />
          Share bundle
        </button>
      </div>

      {!hasItems && (
        <div className="text-[12px] text-stone-400 text-center mt-2">
          Add at least one item to continue to checkout
        </div>
      )}

      {/* ── Share panel ────────────────────────────────────────────────── */}
      {shareOpen && (
        <div className="border border-share rounded-2xl overflow-hidden mt-4 animate-[fadeIn_0.15s_ease]">
          <div className="flex items-center justify-between px-4 py-3 bg-share">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
              <IconShare size={15} />
              Share this bundle
            </div>
            <button
              onClick={() => setShareOpen(false)}
              className="bg-white/20 border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-white"
            >
              <IconX size={13} />
            </button>
          </div>
          <div className="px-4 py-4 bg-white">
            <div className="mb-3.5">
              <div className="text-[12px] font-semibold text-stone-700 mb-1.5">To — email addresses (comma separated)</div>
              <input className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 bg-white focus:outline-none focus:border-share" placeholder="colleague@company.com, manager@company.com" />
            </div>
            <div className="mb-3.5">
              <div className="text-[12px] font-semibold text-stone-700 mb-1.5">Message</div>
              <textarea
                defaultValue={shareMsg}
                rows={5}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-[12px] text-stone-500 bg-stone-50 resize-none leading-relaxed focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 my-3 text-[11px] text-stone-400 uppercase tracking-widest before:flex-1 before:h-px before:bg-stone-200 after:flex-1 after:h-px after:bg-stone-200">
              or copy link
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value="https://configurator.thejoyfactory.com/bundle/demo-12345"
                className="flex-1 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[12px] font-mono text-stone-400 bg-stone-50 min-w-0"
              />
              <button
                onClick={copyLink}
                className={[
                  'flex-shrink-0 border rounded-xl px-4 py-2.5 text-[12px] font-semibold cursor-pointer flex items-center gap-1.5',
                  copied
                    ? 'bg-[#f0faf6] border-[#a8e0c8] text-[#136645]'
                    : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-white',
                ].join(' ')}
              >
                <IconCopy size={13} />
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          {!sendSuccess ? (
            <div className="flex gap-2 px-4 py-3 border-t border-stone-100 bg-white">
              <button onClick={() => setShareOpen(false)} className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-[13px] font-medium text-stone-500 cursor-pointer">
                Cancel
              </button>
              <button onClick={sendShare} className="flex-1 bg-share border-none rounded-xl py-2.5 text-[13px] font-semibold text-white cursor-pointer flex items-center justify-center gap-2">
                <IconSend size={14} /> Send email
              </button>
            </div>
          ) : (
            <div className="text-[12px] text-[#1D9E75] text-center px-4 py-3 font-semibold border-t border-stone-100 bg-white">
              <IconCheck size={14} className="inline mr-1.5" /> Bundle shared successfully!
            </div>
          )}
        </div>
      )}

      {/* ── Why this bundle section ─────────────────────────────────────── */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden mt-5">
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
          <div className="flex items-center gap-2 text-[12px] font-bold text-stone-800 uppercase tracking-widest">
            <IconSparkles size={14} className="text-brand" />
            Why this bundle fits your needs
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fff0ef] border border-[#f09595] text-[#993C1D] font-bold ml-1 normal-case tracking-normal">Joy AI</span>
          </div>
        </div>
        <div className="px-4 py-4">
          {loadingPara ? (
            <div className="flex items-center gap-2.5 text-stone-400 text-[13px]">
              <LoadingSpinner size={16} /> Generating your recommendation…
            </div>
          ) : (
            <p className="text-[13px] text-stone-600 leading-relaxed">{paragraph}</p>
          )}
        </div>
      </div>
    </div>
  );
}
