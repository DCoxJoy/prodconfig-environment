'use client';

import { IconShieldCheck, IconCheck, IconFilter, IconAlertTriangle } from '@tabler/icons-react';
import { ALL_FEATURES } from '../../lib/catalog';
import { getAllowedFeatures, getDeviceFamilyLabel, getDeviceFamily } from '../../lib/utils';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { FeatureId } from '../../types';

interface StepFeaturesProps {
  onCertifiedYes: () => void;
}

export default function StepFeatures({ onCertifiedYes }: StepFeaturesProps) {
  const { state, dispatch } = useConfigurator();
  const { device, certified, features } = state;

  const family = getDeviceFamily(device?.id ?? '');
  const familyLabel = getDeviceFamilyLabel(family);
  const allowedIds = getAllowedFeatures(family);
  const filteredFeatures = ALL_FEATURES.filter(f => allowedIds.includes(f.id));

  function pickCertified(val: 'yes' | 'no') {
    if (val === 'yes') {
      dispatch({ type: 'SET_CERTIFIED', certified: 'yes' });
      onCertifiedYes();
      return;
    }
    dispatch({ type: 'SET_CERTIFIED', certified: 'no' });
  }

  function resetCertified() {
    dispatch({ type: 'CHANGE_CERTIFIED' });
  }

  return (
    <div className="p-3.5 pb-4">
      {/* Certified gate */}
      {certified === null && (
        <div className="pb-4">
          <div className="text-[13px] font-medium text-stone-900 mb-2.5">
            Do you need a certified rugged case (hazardous location rated)?
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => pickCertified('yes')}
              className="flex items-center gap-2.5 p-3 border-[0.5px] border-stone-200 rounded-[12px] cursor-pointer bg-white hover:bg-stone-50 text-left"
            >
              <div className="w-[30px] h-[30px] rounded-[8px] bg-stone-100 border-[0.5px] border-stone-200 flex items-center justify-center text-stone-500 flex-shrink-0">
                <IconAlertTriangle size={14} />
              </div>
              <div>
                <div className="text-[12px] font-medium text-stone-900">Yes, I need certified</div>
                <div className="text-[10px] text-stone-400">Class I/II Division 2 hazardous locations</div>
              </div>
            </button>
            <button
              onClick={() => pickCertified('no')}
              className="flex items-center gap-2.5 p-3 border-[0.5px] border-stone-200 rounded-[12px] cursor-pointer bg-white hover:bg-stone-50 text-left"
            >
              <div className="w-[30px] h-[30px] rounded-[8px] bg-stone-100 border-[0.5px] border-stone-200 flex items-center justify-center text-stone-500 flex-shrink-0">
                <IconCheck size={14} />
              </div>
              <div>
                <div className="text-[12px] font-medium text-stone-900">No, standard case is fine</div>
                <div className="text-[10px] text-stone-400">Continue to feature selection</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Certified = yes note */}
      {certified === 'yes' && (
        <div>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mb-2.5">
            <IconAlertTriangle size={11} style={{ color: '#c8291c' }} />
            Certified case selected.{' '}
            <button onClick={resetCertified} className="text-brand font-medium cursor-pointer">Change</button>
          </div>
          <div className="text-[10px] text-stone-400 bg-stone-50 px-2.5 py-1.5 border-l-2 border-stone-300">
            You will be routed directly to our sales team — certified cases require a compatibility check.
          </div>
        </div>
      )}

      {/* Standard case — feature list */}
      {certified === 'no' && (
        <div>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mb-2.5">
            <IconShieldCheck size={11} />
            Standard case selected.{' '}
            <button onClick={resetCertified} className="text-brand font-medium cursor-pointer">Change</button>
          </div>

          <div className="flex items-center gap-1.5 bg-[#fff8f8] border-[0.5px] border-[#f09595] rounded-[8px] px-2.5 py-[7px] text-[10px] text-[#993C1D] mb-2.5">
            <IconFilter size={12} />
            Showing features available for <strong className="ml-0.5">{familyLabel}</strong> cases only
          </div>

          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.05em] mb-2">
            Select features that matter to you
          </div>

          <div className="border-[0.5px] border-stone-200 rounded-[12px] overflow-hidden">
            {filteredFeatures.map((feat, i) => {
              const selected = features.includes(feat.id as FeatureId);
              return (
                <div
                  key={feat.id}
                  onClick={() => dispatch({ type: 'TOGGLE_FEATURE', id: feat.id as FeatureId })}
                  className={[
                    'flex items-center gap-2.5 px-3 py-1.5 cursor-pointer transition-colors',
                    i > 0 ? 'border-t-[0.5px] border-stone-200' : '',
                    selected ? 'bg-[#fff8f8]' : 'bg-white hover:bg-stone-50',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'w-4 h-4 rounded-[5px] flex-shrink-0 flex items-center justify-center',
                      selected
                        ? 'bg-brand border-brand text-white'
                        : 'border-[1.5px] border-stone-300',
                    ].join(' ')}
                  >
                    {selected && <IconCheck size={9} />}
                  </div>
                  <span className="text-[12px] font-medium text-stone-900 flex-shrink-0 whitespace-nowrap">{feat.title}</span>
                  <span className="text-[10px] text-stone-400 text-right flex-1 overflow-hidden text-ellipsis whitespace-nowrap ml-2.5">{feat.desc}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-stone-400 bg-stone-50 px-2.5 py-1.5 border-l-2 border-stone-300 mt-2.5">
            Features filtered to {familyLabel}-compatible options from the aXtion product line comparison chart.
          </div>
        </div>
      )}
    </div>
  );
}
