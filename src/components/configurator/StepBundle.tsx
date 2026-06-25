'use client';

import { useEffect, useState, useRef } from 'react';
import {
  IconSparkles, IconShoppingCart, IconShare, IconX, IconCopy, IconSend,
  IconCheck,
} from '@tabler/icons-react';
import { getDeviceFamily, isIphoneFamily } from '../../lib/utils';
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
  const isIphone = isIphoneFamily(family);

  const [paragraph, setParagraph] = useState<string | null>(null);
  const [loadingPara, setLoadingPara] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const fetchedRef = useRef(false);

  const total = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * qtys[i], 0);
  const totalQty = qtys.reduce((a, b) => a + b, 0);
  const hasActiveItems = totalQty > 0;

  const matchedEdits = appliedEdits.filter(e => e.matched);

  // Find the "last swapped" index (last matched edit that changed an item)
  const lastChangedIndex = matchedEdits.length > 0 ? liveProducts.findIndex(p =>
    matchedEdits.some(e => e.detail?.includes(p.sku))
  ) : -1;

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fallback = buildReasoningParagraph(
      device?.name ?? 'your device',
      family,
      features,
      scenarios,
      liveProducts,
      appliedEdits
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
      .then(data => {
        setParagraph(data.paragraph ?? fallback);
      })
      .catch(() => {
        setParagraph(fallback);
      })
      .finally(() => setLoadingPara(false));
  }, []);

  const shareMsg = buildShareMsg();

  function buildShareMsg() {
    const lines = liveProducts
      .map((p, i) => qtys[i] > 0 ? `• ${p.type}: ${p.name} (${p.sku}) ×${qtys[i]} — $${(p.unitPrice * qtys[i]).toFixed(2)}` : null)
      .filter(Boolean);
    return `Hi,\n\nI'd like to share a bundle recommendation for the ${device?.name ?? 'your device'}.\n\n${lines.join('\n')}\n\nBundle sub-total: $${total.toFixed(2)}\n\nhttps://configurator.thejoyfactory.com/bundle/demo-12345\n\nLet me know your thoughts!`;
  }

  function copyLink() {
    navigator.clipboard.writeText('https://configurator.thejoyfactory.com/bundle/demo-12345').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function sendShare() {
    setSendSuccess(true);
    setTimeout(() => {
      setShareOpen(false);
      setSendSuccess(false);
    }, 1800);
  }

  return (
    <div className="px-5 py-3.5">
      {/* Edits applied banner */}
      {matchedEdits.length > 0 && (
        <div className="bg-[#f0faf6] border-[1.5px] border-[#1D9E75] rounded-[8px] px-3 py-2.5 mb-3.5">
          <div className="text-[10px] text-[#136645] font-bold uppercase tracking-[0.05em] mb-[5px] flex items-center gap-1.5">
            <IconSparkles size={11} />
            Your requested changes were applied
          </div>
          {matchedEdits.map((edit, i) => (
            <div key={i} className="text-[11px] text-[#136645] py-[3px] flex items-start gap-1.5">
              <IconCheck size={11} className="flex-shrink-0 mt-[1px]" />
              <span>
                &ldquo;{edit.text}&rdquo;
                {edit.detail && <span className="block text-[10px] opacity-80 mt-[1px]">{edit.detail}</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Product rows */}
      {liveProducts.map((p, i) => {
        const swapped = i === lastChangedIndex && qtys[i] > 0;
        const excluded = qtys[i] === 0;
        const Icon = getTablerIcon(p.icon);
        return (
          <div
            key={i}
            className={[
              'flex items-center gap-2.5 py-2 border-b-[0.5px] border-stone-200 last:border-b-0 relative',
              swapped ? 'bg-[#f0faf6] mx-[-4px] px-1 rounded-[8px] border-b-0 mb-1' : '',
              excluded ? 'opacity-35' : '',
            ].join(' ')}
          >
            {swapped && (
              <span className="absolute top-1.5 right-1 text-[8px] text-white bg-[#1D9E75] px-[7px] py-[2px] rounded-full font-bold">UPDATED</span>
            )}
            {excluded && (
              <span className="absolute top-1.5 right-1 text-[8px] text-white bg-stone-400 px-[7px] py-[2px] rounded-full font-bold">NOT IN CART</span>
            )}
            <div className="w-9 h-9 rounded-[8px] bg-stone-100 border-[0.5px] border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-stone-400 font-medium uppercase tracking-[0.04em]">{p.type}</div>
              <div className="text-[12px] font-medium text-stone-900">{p.name}</div>
              <div className="text-[10px] text-stone-400 font-mono">{p.sku}</div>
              <div className="text-[10px] text-stone-500">
                {excluded ? <em className="text-stone-400">Excluded</em> : `Qty: ${qtys[i]}`}
              </div>
            </div>
            <div className={['text-[13px] font-medium ml-auto flex-shrink-0 text-right', excluded ? 'text-stone-400' : 'text-stone-900'].join(' ')}>
              ${(p.unitPrice * qtys[i]).toFixed(2)}
              {qtys[i] > 1 && <div className="text-[10px] font-normal text-stone-400">${p.unitPrice.toFixed(2)} × {qtys[i]}</div>}
            </div>
          </div>
        );
      })}

      {/* Bundle total */}
      <div className="flex justify-between items-center pt-3 pb-3.5 border-t-[0.5px] border-stone-200 mt-1">
        <div>
          <div className="text-[12px] text-stone-500">Bundle sub-total</div>
          <div className="text-[10px] text-stone-400">{totalQty} item{totalQty !== 1 ? 's' : ''} · bundle pricing applied</div>
        </div>
        <div className="text-[22px] font-medium text-stone-900">${total.toFixed(2)}</div>
      </div>

      {/* CTA grid */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <button
          disabled={!hasActiveItems}
          onClick={onAddToCart}
          className={[
            'flex items-center justify-center gap-1.5 rounded-[8px] py-[11px] text-[12px] font-medium transition-colors',
            hasActiveItems
              ? 'bg-brand text-white cursor-pointer border-none'
              : 'bg-stone-100 border-[0.5px] border-stone-200 text-stone-400 cursor-not-allowed',
          ].join(' ')}
        >
          <IconShoppingCart size={13} />
          Add to cart
        </button>
        <button
          onClick={() => onContactSales('manual')}
          className="bg-transparent border-[0.5px] border-stone-300 rounded-[8px] py-[11px] text-[12px] text-stone-900 cursor-pointer hover:bg-stone-50"
        >
          Contact sales
        </button>
        <button
          onClick={() => setShareOpen(o => !o)}
          className={[
            'flex items-center justify-center gap-1.5 rounded-[8px] py-[11px] text-[12px] font-medium border-[0.5px] border-share cursor-pointer transition-colors',
            shareOpen ? 'bg-share text-white' : 'bg-transparent text-share hover:bg-share hover:text-white',
          ].join(' ')}
        >
          <IconShare size={13} />
          Share bundle
        </button>
      </div>

      {!hasActiveItems && (
        <div className="text-[10px] text-stone-400 text-center mt-1.5">Add at least one item to continue to checkout</div>
      )}
      {hasActiveItems && (
        <p className="text-[11px] text-stone-400 text-center mt-2">
          Add to cart routes to BigCommerce checkout · Contact Sales creates a HubSpot deal
        </p>
      )}

      {/* Share panel */}
      {shareOpen && (
        <div className="border-[0.5px] border-share rounded-[12px] overflow-hidden mt-3.5 animate-[fadeIn_0.15s_ease]">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-share">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white">
              <IconShare size={14} />
              Share this bundle
            </div>
            <button
              onClick={() => setShareOpen(false)}
              className="bg-white/20 border-none rounded-full w-[22px] h-[22px] flex items-center justify-center cursor-pointer text-white text-[13px]"
            >
              <IconX size={13} />
            </button>
          </div>
          <div className="px-3.5 py-3">
            <div className="mb-2.5">
              <div className="text-[11px] font-medium text-stone-900 mb-1">To — email addresses (comma separated)</div>
              <input className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-2.5 py-2 text-[12px] text-stone-900 bg-white focus:outline-none" placeholder="colleague@company.com, manager@company.com" />
            </div>
            <div className="mb-2.5">
              <div className="text-[11px] font-medium text-stone-900 mb-1">Message</div>
              <textarea
                defaultValue={shareMsg}
                className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-2.5 py-2 text-[11px] text-stone-500 bg-stone-50 min-h-[90px] resize-none leading-[1.5] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2.5 my-2.5 text-[10px] text-stone-400 uppercase tracking-[0.05em] before:flex-1 before:h-[0.5px] before:bg-stone-200 after:flex-1 after:h-[0.5px] after:bg-stone-200">
              or copy a shareable link
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value="https://configurator.thejoyfactory.com/bundle/demo-12345"
                className="flex-1 border-[0.5px] border-stone-200 rounded-[8px] px-2.5 py-2 text-[11px] font-mono text-stone-400 bg-stone-50"
              />
              <button
                onClick={copyLink}
                className={[
                  'flex-shrink-0 border-[0.5px] rounded-[8px] px-3 py-2 text-[11px] font-medium cursor-pointer flex items-center gap-1',
                  copied
                    ? 'bg-[#f0faf6] border-[#a8e0c8] text-[#136645]'
                    : 'bg-stone-100 border-stone-300 text-stone-900 hover:bg-white',
                ].join(' ')}
              >
                <IconCopy size={12} />
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          {!sendSuccess ? (
            <div className="flex gap-2 px-3.5 py-2.5 border-t-[0.5px] border-stone-200">
              <button onClick={() => setShareOpen(false)} className="bg-transparent border-[0.5px] border-stone-300 rounded-[8px] px-3.5 py-[9px] text-[12px] text-stone-500 cursor-pointer">Cancel</button>
              <button onClick={sendShare} className="flex-1 bg-share border-none rounded-[8px] py-[9px] text-[12px] font-medium text-white cursor-pointer flex items-center justify-center gap-1.5">
                <IconSend size={12} /> Send email
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-[#1D9E75] text-center px-3.5 py-2.5 font-medium border-t-[0.5px] border-stone-200">
              <IconCheck size={13} className="inline mr-1" /> Bundle shared successfully!
            </div>
          )}
        </div>
      )}

      {/* Why this bundle section */}
      <div className="border-[0.5px] border-stone-200 rounded-[12px] overflow-hidden mt-3.5">
        <div className="px-3.5 py-2.5 bg-stone-50 border-b-[0.5px] border-stone-200">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-900 uppercase tracking-[0.04em]">
            <IconSparkles size={13} style={{ color: '#c8291c' }} />
            Why this bundle fits your needs
            <span className="text-[9px] px-[7px] py-[2px] rounded-full bg-[#fff0ef] border-[0.5px] border-[#f09595] text-[#993C1D] font-semibold ml-1">Joy AI</span>
          </div>
        </div>
        <div className="px-3.5 py-3">
          {loadingPara ? (
            <div className="flex items-center gap-2 text-stone-400 text-[12px]">
              <LoadingSpinner size={14} /> Generating your recommendation...
            </div>
          ) : (
            <p className="text-[12px] text-stone-500 leading-[1.7]">{paragraph}</p>
          )}
        </div>
      </div>
    </div>
  );
}
