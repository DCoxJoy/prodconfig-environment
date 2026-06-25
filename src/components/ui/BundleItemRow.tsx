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
        'prod-row flex items-center gap-2.5 py-2 border-b-[0.5px] border-stone-200 last:border-b-0 relative',
        swapped ? 'bg-[#f0faf6] mx-[-4px] px-1 rounded-[8px] border-b-0 mb-1' : '',
        excluded ? 'opacity-35' : '',
      ].join(' ')}
    >
      {swapped && (
        <span className="absolute top-1.5 right-1 text-[8px] text-white bg-[#1D9E75] px-[7px] py-[2px] rounded-full font-bold">
          UPDATED
        </span>
      )}
      {excluded && (
        <span className="absolute top-1.5 right-1 text-[8px] text-white bg-stone-400 px-[7px] py-[2px] rounded-full font-bold">
          NOT IN CART
        </span>
      )}
      <div className="w-9 h-9 rounded-[8px] bg-stone-100 border-[0.5px] border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] text-stone-400 font-medium uppercase tracking-[0.04em]">{item.type}</div>
        <div className="text-[12px] font-medium text-stone-900">{item.name}</div>
        <div className="text-[10px] text-stone-400 font-mono">{item.sku}</div>
        {excluded
          ? <div className="text-[10px] text-stone-400 italic">Excluded</div>
          : <div className="text-[10px] text-stone-500">Qty: {qty}</div>
        }
      </div>
      <div
        className={[
          'text-[13px] font-medium flex-shrink-0 text-right ml-auto',
          excluded ? 'text-stone-400' : 'text-stone-900',
        ].join(' ')}
      >
        ${lineTotal.toFixed(2)}
        {qty > 1 && (
          <div className="text-[10px] font-normal text-stone-400">${item.unitPrice.toFixed(2)} × {qty}</div>
        )}
      </div>
    </div>
  );
}
