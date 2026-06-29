'use client';

import { IconDeviceMobile, IconDeviceIpad } from '@tabler/icons-react';
import { ENV_QUESTIONS_IPHONE, getActiveTabletQuestions } from '../../lib/questions';
import { getDeviceFamily, isIphoneFamily } from '../../lib/utils';
import { useConfigurator } from '../../lib/ConfiguratorContext';

export default function StepEnvironment() {
  const { state, dispatch } = useConfigurator();
  const { device, scenarios } = state;

  const family    = getDeviceFamily(device?.id ?? '');
  const isIphone  = isIphoneFamily(family);
  const questions = isIphone
    ? ENV_QUESTIONS_IPHONE
    : getActiveTabletQuestions(scenarios.mount_surface);
  const answered  = questions.filter(q => !!scenarios[q.key as keyof typeof scenarios]).length;

  function pickScenario(key: string, value: string) {
    dispatch({ type: 'SET_SCENARIO', key, value });
  }

  return (
    <div className="px-6 py-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 bg-[#fff0ef] border border-[#f09595] rounded-full px-3 py-1.5 text-[12px] text-[#993C1D] font-medium">
          {isIphone
            ? <><IconDeviceMobile size={13} /> iPhone questions</>
            : <><IconDeviceIpad  size={13} /> Tablet / laptop questions</>
          }
        </div>
        <div className="text-[12px] text-stone-400 font-medium">
          <span className="text-brand font-semibold">{answered}</span>
          <span> / {questions.length}</span>
        </div>
      </div>

      {/* Question list */}
      <div className="item-list">
        {questions.map((item, qi) => {
          const answerVal = scenarios[item.key as keyof typeof scenarios];
          const isAnswered = !!answerVal;
          return (
            <div
              key={item.key}
              className={[
                'px-5 py-5',
                qi > 0 ? 'border-t border-stone-200' : '',
                isAnswered ? 'bg-white' : 'bg-white',
              ].join(' ')}
            >
              {/* Question + hint */}
              <div className="mb-3">
                <div className="text-[13px] font-semibold text-stone-900 leading-snug">{item.q}</div>
                {item.hint && (
                  <div className="text-[12px] text-stone-400 mt-0.5">{item.hint}</div>
                )}
              </div>

              {/* Pill choices */}
              <div className="flex gap-2 flex-wrap">
                {item.choices.map(ch => {
                  const selected = answerVal === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => pickScenario(item.key, ch.id)}
                      className={[
                        'px-4 py-2 border rounded-full text-[12px] font-medium cursor-pointer whitespace-nowrap transition-colors',
                        selected
                          ? 'bg-brand border-brand text-white shadow-[0_0_0_3px_rgba(200,41,28,0.12)]'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300',
                      ].join(' ')}
                    >
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hint-strip">
        {isIphone
          ? 'Mount questions are not shown for iPhone — only carry and accessory options.'
          : 'These questions determine which mount and accessories are recommended for your setup.'}
      </div>
    </div>
  );
}
