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

  const family        = getDeviceFamily(device?.id ?? '');
  const familyLabel   = getDeviceFamilyLabel(family);
  const allowedIds    = getAllowedFeatures(family);
  const filteredFeats = ALL_FEATURES.filter(f => allowedIds.includes(f.id));

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
    <div className="px-6 py-6">
      {/* ── Certified gate ─────────────────────────────────────────────── */}
      {certified === null && (
        <div className="mb-2">
          <p className="text-[14px] font-medium text-stone-800 mb-4">
            Do you need a certified rugged case<br className="hidden sm:block" /> (hazardous location rated)?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => pickCertified('yes')}
              className="flex items-start gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer bg-white hover:bg-stone-50 hover:border-stone-300 text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 flex-shrink-0 mt-0.5">
                <IconAlertTriangle size={16} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-stone-900">Yes, I need certified</div>
                <div className="text-[12px] text-stone-400 mt-0.5">Class I/II Division 2 hazardous locations</div>
              </div>
            </button>
            <button
              onClick={() => pickCertified('no')}
              className="flex items-start gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer bg-white hover:bg-stone-50 hover:border-stone-300 text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 flex-shrink-0 mt-0.5">
                <IconCheck size={16} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-stone-900">No, standard case</div>
                <div className="text-[12px] text-stone-400 mt-0.5">Continue to feature selection</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── Certified = yes ─────────────────────────────────────────────── */}
      {certified === 'yes' && (
        <div>
          <div className="flex items-center gap-2 text-[12px] text-stone-500 mb-3">
            <IconAlertTriangle size={13} className="text-brand" />
            Certified case selected.{' '}
            <button onClick={resetCertified} className="text-brand font-semibold cursor-pointer">Change</button>
          </div>
          <div className="hint-strip">
            You will be routed directly to our sales team — certified cases require a compatibility check.
          </div>
        </div>
      )}

      {/* ── Standard case — feature list ────────────────────────────────── */}
      {certified === 'no' && (
        <div>
          <div className="flex items-center gap-2 text-[12px] text-stone-500 mb-4">
            <IconShieldCheck size={13} className="text-stone-400" />
            Standard case selected.{' '}
            <button onClick={resetCertified} className="text-brand font-semibold cursor-pointer">Change</button>
          </div>

          {/* Filter badge */}
          <div className="flex items-center gap-2 bg-[#fff8f8] border border-[#f09595] rounded-lg px-3 py-2.5 text-[12px] text-[#993C1D] mb-4">
            <IconFilter size={13} className="flex-shrink-0" />
            <span>Showing features for <strong>{familyLabel}</strong> cases only</span>
          </div>

          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">
            Select features that matter to you
          </div>

          <div className="item-list">
            {filteredFeats.map((feat, i) => {
              const selected = features.includes(feat.id as FeatureId);
              return (
                <div
                  key={feat.id}
                  onClick={() => dispatch({ type: 'TOGGLE_FEATURE', id: feat.id as FeatureId })}
                  className={[
                    'flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors',
                    i > 0 ? 'border-t border-stone-200' : '',
                    selected ? 'bg-[#fff8f8]' : 'bg-white hover:bg-stone-50',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5',
                      selected
                        ? 'bg-brand text-white'
                        : 'border-2 border-stone-300 bg-white',
                    ].join(' ')}
                  >
                    {selected && <IconCheck size={11} strokeWidth={2.5} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-stone-900 leading-tight">{feat.title}</div>
                    <div className="text-[12px] text-stone-400 mt-0.5 leading-snug">{feat.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hint-strip">
            Features are filtered to {familyLabel}-compatible options from the aXtion product line.
          </div>
        </div>
      )}
    </div>
  );
}
