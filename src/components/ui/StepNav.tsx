'use client';

import { IconCheck } from '@tabler/icons-react';

interface StepNavProps {
  steps: string[];
  currentStep: number;
}

export default function StepNav({ steps, currentStep }: StepNavProps) {
  return (
    <div className="flex gap-1.5 items-center flex-1 flex-wrap">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  'w-[26px] h-[26px] rounded-full border-[0.5px] flex items-center justify-center text-[10px] font-medium',
                  done || active
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-stone-300 text-stone-500',
                  active ? 'shadow-[0_0_0_3px_rgba(200,41,28,0.15)]' : '',
                ].join(' ')}
              >
                {done ? <IconCheck size={10} /> : i + 1}
              </div>
              <span
                className={[
                  'text-[10px]',
                  active ? 'text-stone-900 font-medium' : 'text-stone-400',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  'flex-1 h-[0.5px] min-w-[8px]',
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
