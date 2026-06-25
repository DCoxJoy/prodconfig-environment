'use client';

import { BundleItem } from '../../types';
import { getTablerIcon } from '../../lib/iconMap';

interface BundleItemRowProps {
  item: BundleItem;
  qty: number;
  swapped?: boolean;
  excluded?: boolean;
}

export default function BundleItemRow({ item, qty, swapped = false, excluded = false }: BundleItemRowProps) {
  const Icon = getTablerIcon(item.icon);
  const lineTotal = item.unitPrice * qty;

  return (
    <div
      className={[
        'flex items-center gap-3 py-3.5 border-b border-stone-100 last:border-b-0 relative transition-opacity',
        swapped ? 'bg-[#f0faf6] -mx-1 px-1 rounded-xl border-b-0 mb-1' : '',
        excluded ? 'opacity-40' : '',
      ].join(' ')}
    >
      {swapped && (
        <span className="absolute top-2 right-1 text-[10px] text-white bg-[#1D9E75] px-2 py-0.5 rounded-full font-bold tracking-wide">
          UPDATED
        </span>
      )}
      {excluded && (
        <span className="absolute top-2 right-1 text-[10px] text-white bg-stone-400 px-2 py-0.5 rounded-full font-bold tracking-wide">
          NOT IN CART
        </span>
      )}
      <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest mb-0.5">{item.type}</div>
        <div className="text-[14px] font-medium text-stone-900 leading-tight">{item.name}</div>
        <div className="text-[11px] text-stone-400 font-mono mt-0.5">{item.sku}</div>
        {excluded
          ? <div className="text-[11px] text-stone-400 italic mt-0.5">Excluded from cart</div>
          : <div className="text-[11px] text-stone-500 mt-0.5">Qty: {qty}</div>
        }
      </div>
      <div
        className={[
          'text-[14px] font-semibold flex-shrink-0 text-right ml-auto',
          excluded ? 'text-stone-400' : 'text-stone-900',
        ].join(' ')}
      >
        ${lineTotal.toFixed(2)}
        {qty > 1 && (
          <div className="text-[11px] font-normal text-stone-400">${item.unitPrice.toFixed(2)} ×{qty}</div>
        )}
      </div>
    </div>
  );
}
