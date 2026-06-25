'use client';

import { useState } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { DEVICE_GROUPS } from '../../lib/catalog';
import { getTablerIcon } from '../../lib/iconMap';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { getDeviceFamily } from '../../lib/utils';
import { Device } from '../../types';

interface StepDevicesProps {
  onDeviceSelected: () => void;
}

export default function StepDevices({ onDeviceSelected }: StepDevicesProps) {
  const { dispatch } = useConfigurator();
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});

  function toggleGroup(i: number) {
    setOpenGroups(prev => ({ ...prev, [i]: !prev[i] }));
  }

  function pickDevice(device: Device) {
    dispatch({ type: 'SET_DEVICE', device });
    onDeviceSelected();
  }

  return (
    <div className="px-6 py-6">
      <div className="item-list">
        {DEVICE_GROUPS.map((group, gi) => {
          const isOpen   = !!openGroups[gi];
          const GroupIcon = getTablerIcon(group.icon);
          return (
            <div key={gi}>
              {/* Group header */}
              <div
                onClick={() => toggleGroup(gi)}
                className={[
                  'flex items-center justify-between px-5 py-5 cursor-pointer select-none transition-colors',
                  'border-t border-stone-200 first:border-t-0',
                  isOpen
                    ? 'bg-[#fff0ef] border-l-2 border-l-brand'
                    : 'bg-stone-50 hover:bg-stone-100',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <div className={[
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    isOpen ? 'bg-[#ffdfdc] text-brand' : 'bg-stone-200 text-stone-500',
                  ].join(' ')}>
                    <GroupIcon size={15} />
                  </div>
                  <div>
                    <div className={[
                      'text-[13px] font-semibold leading-tight',
                      isOpen ? 'text-[#993C1D]' : 'text-stone-700',
                    ].join(' ')}>
                      {group.label}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      {group.devices.length} model{group.devices.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <IconChevronDown
                  size={16}
                  className="flex-shrink-0 transition-transform duration-200 text-stone-400"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </div>

              {/* Device list */}
              <div
                className={[
                  'overflow-hidden transition-[max-height] duration-[250ms] ease-in-out',
                  isOpen ? 'max-h-[800px]' : 'max-h-0',
                ].join(' ')}
              >
                {group.devices.map((device, di) => (
                  <div
                    key={di}
                    onClick={() => pickDevice({ ...device, family: getDeviceFamily(device.id) })}
                    className="flex items-center gap-3 px-5 py-4 pl-16 cursor-pointer border-t border-stone-200 bg-white hover:bg-[#fff8f8] transition-colors"
                  >
                    <span className="text-[14px] font-medium text-stone-800 flex-1">{device.name}</span>
                    <IconChevronRight size={14} className="text-stone-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="hint-strip">
        Tap a category to expand it, then select your device model to continue.
      </div>
    </div>
  );
}
