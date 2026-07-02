'use client';

import { useState, useEffect } from 'react';
import { IconSparkles, IconSend, IconCheck, IconLoader2, IconInfoCircle } from '@tabler/icons-react';
import { BP_IPHONE, BP_TABLET } from '../../lib/catalog';
import { getDeviceFamily, isIphoneFamily } from '../../lib/utils';
import { getTablerIcon } from '../../lib/iconMap';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import QtyControl from '../ui/QtyControl';
import LoadingSpinner from '../ui/LoadingSpinner';

interface StepReviewProps {
  onConfirm: () => void;
  onEscalate: (requestText: string) => void;
}

export default function StepReview({ onConfirm, onEscalate }: StepReviewProps) {
  const { state, liveProducts, liveBundleOptions, qtys, selectedBundleOption, dispatch } = useConfigurator();
  const { device, features, scenarios, editNote, appliedEdits } = state;

  const family   = getDeviceFamily(device?.id ?? '');
  const isIphone = isIphoneFamily(family);

  // bundleLoading: true until BC bundle options arrive (or if already loaded, start false)
  const [bundleLoading, setBundleLoading] = useState(liveBundleOptions === null);
  const [noProductsFound, setNoProductsFound] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Fetch live bundle from BC on first render. If liveBundleOptions is already set
  // (e.g. user navigated back and forward), skip the fetch.
  useEffect(() => {
    if (liveBundleOptions !== null) {
      setBundleLoading(false);
      return;
    }
    if (!device) {
      setBundleLoading(false);
      return;
    }

    let cancelled = false;
    setBundleLoading(true);
    setNoProductsFound(false);

    fetch('/api/bundle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceName: device.name, isIphone, features, scenarios }),
    })
      .then(async r => {
        if (!r.ok) throw new Error(`Bundle API error: ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        if (data.options && data.options.length > 0) {
          dispatch({ type: 'SET_BUNDLE_OPTIONS', options: data.options });
        } else {
          console.warn('[StepReview] No BC products found for device:', device?.name, data);
          setNoProductsFound(true);
        }
      })
      .catch(err => {
        console.error('[StepReview] Bundle fetch failed:', err);
        if (!cancelled) setNoProductsFound(true);
      })
      .finally(() => { if (!cancelled) setBundleLoading(false); });

    return () => { cancelled = true; };
  }, [liveBundleOptions]); // re-run whenever liveBundleOptions resets to null (device change or HMR)

  // Bundle option tabs come from live BC data when available, else from hardcoded catalog
  const bundleOptions = liveBundleOptions ?? (isIphone ? BP_IPHONE : BP_TABLET);

  const total    = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * (qtys[i] ?? 0), 0);
  const totalQty = qtys.reduce((a, b) => a + b, 0);

  const aiHint = isIphone
    ? 'Try "swap for a shoulder strap" or "I need a screen protector instead"'
    : 'Try "I need a vehicle mount" or "swap for a shoulder strap"';

  const matchedEdits = appliedEdits.filter(e => e.matched);

  function changeQty(index: number, value: number) {
    dispatch({ type: 'SET_QTYS', qtys: qtys.map((q, i) => (i === index ? value : q)) });
  }

  async function applyAiEdit() {
    const note = editNote.trim();
    if (!note || thinking) return;
    setThinking(true);
    setAiMessage(null);

    try {
      const res = await fetch('/api/ai-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: note,
          currentBundle: liveProducts,
          deviceName: device?.name ?? '',
          isIphone,
          features,
          scenarios,
        }),
      });
      const data = await res.json();

      if (data.action === 'case_change_request') {
        setAiMessage('To change your case, go back to Step 2 and adjust your feature preferences — your bundle will update automatically.');
        dispatch({ type: 'ADD_APPLIED_EDIT', edit: { text: note, matched: false } });
      } else if (data.matched && data.updatedItem) {
        const updatedProducts = liveProducts.map(p =>
          p.type === data.updatedItem.type ? data.updatedItem : p
        );
        dispatch({ type: 'SET_LIVE_PRODUCTS', products: updatedProducts });
        dispatch({ type: 'ADD_APPLIED_EDIT', edit: { text: note, matched: true, detail: data.reason } });
      } else {
        dispatch({ type: 'ADD_APPLIED_EDIT', edit: { text: note, matched: false } });
        onEscalate(note);
      }
    } catch {
      dispatch({ type: 'ADD_APPLIED_EDIT', edit: { text: note, matched: false } });
      onEscalate(note);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="px-6 py-6">
      {/* ── Bundle option tabs — only when > 1 option ─────────────────── */}
      {bundleOptions.length > 1 && (
        <div className="flex w-full border border-stone-200 rounded-xl overflow-hidden mb-5">
          {bundleOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: 'SET_BUNDLE_OPTION', index: i })}
              className={[
                'flex-1 px-3 py-3 text-[13px] font-semibold cursor-pointer border-r border-stone-200 last:border-r-0 text-center transition-colors',
                i === selectedBundleOption
                  ? 'bg-brand text-white'
                  : 'bg-stone-50 text-stone-500 hover:bg-white hover:text-stone-900',
              ].join(' ')}
            >
              Option {i + 1}
              <div className="text-[11px] font-normal mt-0.5 opacity-80">{opt.items[0].name}</div>
            </button>
          ))}
        </div>
      )}

      {/* ── Loading state while BC bundle fetches ──────────────────────── */}
      {bundleLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-400">
          <LoadingSpinner size={24} />
          <div className="text-[13px]">Building your bundle from live catalog…</div>
        </div>
      ) : noProductsFound ? (
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
          <div className="text-[15px] font-semibold text-stone-700">No products found for {device?.name}</div>
          <div className="text-[13px] text-stone-400 max-w-[300px] leading-relaxed">
            We don&rsquo;t have a catalog match for this device yet. Our sales team can build a custom recommendation.
          </div>
          <button
            onClick={() => onEscalate(`No BC products found for ${device?.name ?? 'selected device'}`)}
            className="mt-2 bg-brand text-white rounded-xl px-5 py-2.5 text-[13px] font-semibold cursor-pointer hover:bg-brand-hover transition-colors"
          >
            Contact Sales for a recommendation
          </button>
        </div>
      ) : (
        <>
          {/* ── Section label ────────────────────────────────────────────── */}
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-3">
            Bundle items — adjust quantities as needed
          </div>

          {/* ── Item list ────────────────────────────────────────────────── */}
          {liveProducts.map((p, i) => {
            const isZero = (qtys[i] ?? 0) === 0;
            const Icon   = getTablerIcon(p.icon);
            return (
              <div
                key={i}
                className={[
                  'flex items-center gap-3.5 py-5 border-b border-stone-200 last:border-b-0 transition-opacity',
                  isZero ? 'opacity-40' : '',
                ].join(' ')}
              >
                <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest mb-0.5">{p.type}</div>
                  <div className="text-[14px] font-semibold text-stone-900 leading-tight">{p.name}</div>
                  <div className="text-[11px] text-stone-400 font-mono mt-0.5">{p.sku}</div>
                  <div className="text-[12px] text-stone-500 mt-0.5">
                    {isZero
                      ? <span className="text-stone-400 italic">Excluded from cart</span>
                      : `$${p.unitPrice.toFixed(2)} each`
                    }
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <QtyControl value={qtys[i] ?? 0} onChange={v => changeQty(i, v)} />
                  <div className={[
                    'text-[14px] font-semibold text-right',
                    isZero ? 'text-stone-300' : 'text-stone-900',
                  ].join(' ')}>
                    {isZero ? '—' : `$${(p.unitPrice * (qtys[i] ?? 0)).toFixed(2)}`}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Bundle total ──────────────────────────────────────────────── */}
          <div className="flex justify-between items-center pt-5 border-t border-stone-200 mt-1 mb-6">
            <div>
              <div className="text-[13px] font-medium text-stone-600">Bundle sub-total</div>
              <div className="text-[11px] text-stone-400">{totalQty} item{totalQty !== 1 ? 's' : ''} · bundle pricing</div>
            </div>
            <div className="text-[24px] font-semibold text-stone-900">${total.toFixed(2)}</div>
          </div>
        </>
      )}

      {/* ── AI Agent box ─────────────────────────────────────────────────── */}
      <div className="border border-brand rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-brand">
          <IconSparkles size={15} className="text-white flex-shrink-0" />
          <span className="text-[13px] font-semibold text-white">Need something different? Ask the AI Agent</span>
        </div>
        <div className="px-4 py-4">
          <div className="text-[12px] text-stone-400 mb-3 leading-relaxed">{aiHint}</div>
          <textarea
            value={editNote}
            onChange={e => dispatch({ type: 'SET_EDIT_NOTE', note: e.target.value })}
            placeholder="Type your request here..."
            disabled={thinking || bundleLoading}
            rows={2}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[13px] text-stone-900 bg-white resize-none leading-relaxed focus:outline-none focus:border-brand font-sans placeholder:text-stone-400"
          />
          <div className="flex justify-end mt-2.5">
            <button
              onClick={applyAiEdit}
              disabled={thinking || !editNote.trim() || bundleLoading}
              className={[
                'flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-colors',
                thinking || !editNote.trim() || bundleLoading
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                  : 'bg-brand text-white cursor-pointer',
              ].join(' ')}
            >
              {thinking
                ? <><IconLoader2 size={14} className="animate-spin" /> Asking Claude…</>
                : <><IconSend    size={14} /> Send</>
              }
            </button>
          </div>

          {/* Applied edit chips */}
          {matchedEdits.map((edit, i) => (
            <div key={i} className="flex items-start gap-2 bg-[#f0faf6] border border-[#a8e0c8] rounded-xl px-3.5 py-3 mt-3 text-[12px] text-[#136645]">
              <IconCheck size={14} className="flex-shrink-0 mt-0.5 text-[#1D9E75]" />
              <span>
                &ldquo;{edit.text}&rdquo;
                {edit.detail && <span className="block text-[11px] opacity-80 mt-0.5">{edit.detail}</span>}
              </span>
            </div>
          ))}

          {/* Case-change guidance message */}
          {aiMessage && (
            <div className="flex items-start gap-2 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-3.5 py-3 mt-3 text-[12px] text-[#1e40af]">
              <IconInfoCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{aiMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm button ─────────────────────────────────────────────────── */}
      <button
        onClick={onConfirm}
        disabled={bundleLoading}
        className={[
          'w-full text-[14px] font-semibold py-3.5 rounded-xl border-none cursor-pointer mt-5 flex items-center justify-center gap-2 transition-colors',
          bundleLoading
            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
            : 'bg-brand text-white hover:bg-brand-hover',
        ].join(' ')}
      >
        <IconCheck size={15} />
        Confirm and see bundle
      </button>
      <div className="text-[12px] text-brand font-medium text-center mt-2">
        Press to continue to your final bundle
      </div>
    </div>
  );
}
