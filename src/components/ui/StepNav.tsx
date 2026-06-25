'use client';

import { IconCheck } from '@tabler/icons-react';

interface StepNavProps {
  steps: string[];
  currentStep: number;
}

export default function StepNav({ steps, currentStep }: StepNavProps) {
  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      {steps.map((label, i) => {
        const done   = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 transition-all',
                  done || active
                    ? 'bg-brand text-white'
                    : 'bg-white border border-stone-300 text-stone-400',
                  active ? 'shadow-[0_0_0_3px_rgba(200,41,28,0.15)]' : '',
                ].join(' ')}
              >
                {done ? <IconCheck size={12} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={[
                  'text-[11px] whitespace-nowrap hidden sm:block',
                  active ? 'text-stone-800 font-medium' : done ? 'text-stone-500' : 'text-stone-400',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  'h-px w-4 flex-shrink-0 mx-0.5',
                  done ? 'bg-brand' : 'bg-stone-200',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
