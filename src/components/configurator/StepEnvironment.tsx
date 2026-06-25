'use client';

import { IconDeviceMobile, IconDeviceIpad } from '@tabler/icons-react';
import { ENV_QUESTIONS_IPHONE, ENV_QUESTIONS_TABLET } from '../../lib/questions';
import { getDeviceFamily, isIphoneFamily } from '../../lib/utils';
import { useConfigurator } from '../../lib/ConfiguratorContext';

export default function StepEnvironment() {
  const { state, dispatch } = useConfigurator();
  const { device, scenarios } = state;

  const family = getDeviceFamily(device?.id ?? '');
  const isIphone = isIphoneFamily(family);
  const questions = isIphone ? ENV_QUESTIONS_IPHONE : ENV_QUESTIONS_TABLET;
  const answered = Object.keys(scenarios).length;

  function pickScenario(key: string, value: string) {
    dispatch({ type: 'SET_SCENARIO', key, value });
  }

  return (
    <div className="p-3.5 pb-4">
      <div className="inline-flex items-center gap-1.5 bg-[#fff0ef] border-[0.5px] border-[#f09595] rounded-full px-2.5 py-1 text-[10px] text-[#993C1D] font-medium mb-2.5">
        {isIphone
          ? <><IconDeviceMobile size={11} /> iPhone carry &amp; accessory questions</>
          : <><IconDeviceIpad size={11} /> Tablet / laptop mount &amp; carry questions</>
        }
      </div>

      <div className="text-[10px] text-stone-400 text-right mb-2">
        {answered} of {questions.length} answered
      </div>

      <div className="border-[0.5px] border-stone-200 rounded-[12px] overflow-hidden mb-1">
        {questions.map((item, qi) => (
          <div
            key={item.key}
            className={[
              'flex items-center gap-3 px-3.5 py-[9px] flex-wrap',
              qi > 0 ? 'border-t-[0.5px] border-stone-200' : '',
            ].join(' ')}
          >
            <div className="flex-1 min-w-[180px]">
              <div className="text-[12px] font-medium text-stone-900 mb-[1px]">{item.q}</div>
              <div className="text-[10px] text-stone-400">{item.hint}</div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
              {item.choices.map(ch => {
                const selected = scenarios[item.key as keyof typeof scenarios] === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => pickScenario(item.key, ch.id)}
                    className={[
                      'px-[11px] py-[5px] border-[0.5px] rounded-full text-[11px] cursor-pointer whitespace-nowrap transition-colors',
                      selected
                        ? 'bg-brand border-brand text-white font-medium'
                        : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50',
                    ].join(' ')}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-stone-400 bg-stone-50 px-2.5 py-1.5 border-l-2 border-stone-300 mt-2.5">
        {isIphone
          ? 'Mount questions are not shown for iPhone.'
          : 'These 7 questions determine which mount and accessories are recommended.'}
      </div>
    </div>
  );
}
