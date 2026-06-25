'use client';

interface QtyControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export default function QtyControl({ value, onChange, min = 0 }: QtyControlProps) {
  return (
    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden flex-shrink-0 bg-white">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 border-none bg-stone-50 hover:bg-stone-100 cursor-pointer text-lg text-stone-600 flex items-center justify-center leading-none transition-colors"
      >
        −
      </button>
      <div className="w-9 text-center text-[13px] font-semibold text-stone-900 border-l border-r border-stone-200 bg-white leading-9">
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 border-none bg-stone-50 hover:bg-stone-100 cursor-pointer text-lg text-stone-600 flex items-center justify-center leading-none transition-colors"
      >
        +
      </button>
    </div>
  );
}
