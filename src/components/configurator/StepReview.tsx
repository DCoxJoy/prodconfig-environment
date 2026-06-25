'use client';

import { useState } from 'react';
import { IconSparkles, IconSend, IconCheck, IconLoader2 } from '@tabler/icons-react';
import { BP_IPHONE, BP_TABLET } from '../../lib/catalog';
import { getDeviceFamily, isIphoneFamily } from '../../lib/utils';
import { getTablerIcon } from '../../lib/iconMap';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { interpretEditRequest } from '../../lib/aiEdit';
import QtyControl from '../ui/QtyControl';

interface StepReviewProps {
  onConfirm: () => void;
  onEscalate: (requestText: string) => void;
}

export default function StepReview({ onConfirm, onEscalate }: StepReviewProps) {
  const { state, liveProducts, qtys, selectedBundleOption, dispatch } = useConfigurator();
  const { device, editNote, appliedEdits } = state;
  const [thinking, setThinking] = useState(false);

  const family = getDeviceFamily(device?.id ?? '');
  const isIphone = isIphoneFamily(family);
  const bundleOptions = isIphone ? BP_IPHONE : BP_TABLET;

  const total = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * qtys[i], 0);
  const totalQty = qtys.reduce((a, b) => a + b, 0);

  const aiHint = isIphone
    ? 'Tell Claude what to adjust — try "swap the holster for a shoulder strap" or "switch to the rugged Extreme case".'
    : 'Tell Claude what to adjust — try "swap the mount for a vehicle mount" or "switch to the slim case".';

  const matchedEdits = appliedEdits.filter(e => e.matched);

  function changeQty(index: number, value: number) {
    const updated = qtys.map((q, i) => (i === index ? value : q));
    dispatch({ type: 'SET_QTYS', qtys: updated });
  }

  function changeBundleOption(index: number) {
    dispatch({ type: 'SET_BUNDLE_OPTION', index });
  }

  function applyAiEdit() {
    const note = editNote.trim();
    if (!note || thinking) return;
    setThinking(true);

    setTimeout(() => {
      const result = interpretEditRequest(note, liveProducts, qtys, isIphone);
      setThinking(false);

      if (result.matched) {
        if (result.updatedProducts) dispatch({ type: 'SET_LIVE_PRODUCTS', products: result.updatedProducts });
        if (result.updatedQtys) dispatch({ type: 'SET_QTYS', qtys: result.updatedQtys });
        dispatch({ type: 'ADD_APPLIED_EDIT', edit: { text: note, matched: true, detail: result.detail } });
      } else {
        dispatch({ type: 'ADD_APPLIED_EDIT', edit: { text: note, matched: false } });
        onEscalate(note);
      }
    }, 700);
  }

  return (
    <div className="px-5 py-3.5">
      {/* Bundle option tabs — only when > 1 option */}
      {bundleOptions.length > 1 && (
        <div className="flex w-full border-[0.5px] border-stone-300 rounded-[8px] overflow-hidden mb-3.5">
          {bundleOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => changeBundleOption(i)}
              className={[
                'flex-1 px-2.5 py-2 text-[12px] font-medium cursor-pointer border-r-[0.5px] border-stone-300 last:border-r-0 text-center overflow-hidden text-ellipsis transition-colors',
                i === selectedBundleOption
                  ? 'bg-brand text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-white hover:text-stone-900',
              ].join(' ')}
            >
              Option {i + 1}: {opt.items[0].name}
            </button>
          ))}
        </div>
      )}

      {/* Item list */}
      <div className="text-[11px] font-medium text-stone-500 mb-2">Bundle items — adjust quantities as needed</div>

      {liveProducts.map((p, i) => {
        const isZero = qtys[i] === 0;
        const Icon = getTablerIcon(p.icon);
        return (
          <div
            key={i}
            className={[
              'flex items-center gap-3 py-2.5 border-b-[0.5px] border-stone-200 last:border-b-0 transition-[opacity] duration-400',
              isZero ? 'opacity-45' : '',
            ].join(' ')}
          >
            <div className="w-10 h-10 rounded-[8px] bg-stone-100 border-[0.5px] border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-stone-400 font-medium uppercase tracking-[0.04em]">{p.type}</div>
              <div className="text-[13px] font-medium text-stone-900">{p.name}</div>
              <div className="text-[10px] text-stone-400 font-mono">{p.sku}</div>
              <div className="text-[10px] text-stone-500 mt-[1px]">
                {isZero
                  ? <span className="text-stone-400 italic">Excluded from cart</span>
                  : `$${p.unitPrice.toFixed(2)} each`
                }
              </div>
            </div>
            <QtyControl value={qtys[i]} onChange={v => changeQty(i, v)} />
            <div
              className={[
                'text-[13px] font-medium min-w-[48px] text-right flex-shrink-0',
                isZero ? 'text-stone-400' : 'text-stone-900',
              ].join(' ')}
            >
              ${(p.unitPrice * qtys[i]).toFixed(2)}
            </div>
          </div>
        );
      })}

      {/* Bundle total */}
      <div className="flex justify-between items-center pt-3 border-t-[0.5px] border-stone-200 mt-1">
        <div>
          <div className="text-[12px] text-stone-500">Bundle sub-total</div>
          <div className="text-[10px] text-stone-400">{totalQty} item{totalQty !== 1 ? 's' : ''} · bundle pricing</div>
        </div>
        <div className="text-[20px] font-medium text-stone-900">${total.toFixed(2)}</div>
      </div>

      {/* AI Agent box */}
      <div className="border-[0.5px] border-brand rounded-[12px] overflow-hidden mt-3.5">
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-brand">
          <IconSparkles size={14} style={{ color: '#fff' }} />
          <span className="text-[12px] font-medium text-white">Can our AI Agent assist you with any additional help?</span>
        </div>
        <div className="px-3 py-2.5 pb-3">
          <div className="text-[11px] text-stone-400 mb-2 leading-[1.4]">{aiHint}</div>
          <textarea
            value={editNote}
            onChange={e => dispatch({ type: 'SET_EDIT_NOTE', note: e.target.value })}
            placeholder="Type your request here..."
            disabled={thinking}
            className="w-full border-[0.5px] border-stone-200 rounded-[8px] px-3 py-[9px] text-[12px] text-stone-900 bg-white resize-none h-14 leading-[1.5] focus:outline-none focus:border-brand font-sans"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={applyAiEdit}
              disabled={thinking || !editNote.trim()}
              className={[
                'flex items-center gap-1.5 rounded-[8px] px-4 py-[7px] text-[12px] font-medium transition-colors',
                thinking || !editNote.trim()
                  ? 'bg-stone-100 border-[0.5px] border-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-brand text-white cursor-pointer',
              ].join(' ')}
            >
              {thinking
                ? <><IconLoader2 size={12} className="animate-spin" /> Asking Claude...</>
                : <><IconSend size={12} /> Send</>
              }
            </button>
          </div>

          {/* Applied edit chips */}
          {matchedEdits.map((edit, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-[#f0faf6] border-[0.5px] border-[#a8e0c8] rounded-[8px] px-2.5 py-[7px] mt-2.5 text-[11px] text-[#136645]">
              <IconCheck size={12} style={{ color: '#1D9E75', flexShrink: 0, marginTop: 1 }} />
              <span>
                &ldquo;{edit.text}&rdquo;
                {edit.detail && <span className="block text-[10px] text-[#1D9E75] opacity-85 mt-[2px]">{edit.detail}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className="w-full bg-brand text-white text-[13px] font-medium py-3 rounded-[8px] border-none cursor-pointer mt-3.5"
      >
        <IconCheck size={13} className="inline mr-1.5 align-[-1px]" />
        Confirm and see bundle
      </button>
      <div className="text-[10px] text-brand font-medium text-center mt-1.5">
        Press this button to continue to your final bundle
      </div>
    </div>
  );
}
