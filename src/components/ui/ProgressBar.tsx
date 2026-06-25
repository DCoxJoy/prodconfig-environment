'use client';

interface ProgressBarProps {
  pct: number;
}

export default function ProgressBar({ pct }: ProgressBarProps) {
  return (
    <div className="h-[3px] bg-stone-100 rounded-full overflow-hidden mb-3">
      <div
        className="h-full rounded-full bg-brand transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
