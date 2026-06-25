'use client';

interface QtyControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export default function QtyControl({ value, onChange, min = 0 }: QtyControlProps) {
  return (
    <div className="flex items-center border-[0.5px] border-stone-300 rounded-[8px] overflow-hidden flex-shrink-0">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-[30px] h-[30px] border-none bg-stone-100 cursor-pointer text-[15px] text-stone-900 flex items-center justify-center hover:bg-white"
      >
        −
      </button>
      <div className="w-[32px] text-center text-[13px] font-medium text-stone-900 border-l-[0.5px] border-r-[0.5px] border-stone-200 bg-white leading-[30px]">
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-[30px] h-[30px] border-none bg-stone-100 cursor-pointer text-[15px] text-stone-900 flex items-center justify-center hover:bg-white"
      >
        +
      </button>
    </div>
  );
}
