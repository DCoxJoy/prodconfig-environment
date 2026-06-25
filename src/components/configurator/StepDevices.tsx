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
    <div className="p-3.5 pb-4">
      <div className="border-[0.5px] border-stone-200 rounded-[12px] overflow-hidden">
        {DEVICE_GROUPS.map((group, gi) => {
          const isOpen = !!openGroups[gi];
          const GroupIcon = getTablerIcon(group.icon);
          return (
            <div key={gi}>
              <div
                onClick={() => toggleGroup(gi)}
                className={[
                  'flex items-center justify-between px-3.5 py-[9px] cursor-pointer select-none transition-colors',
                  'text-[11px] font-semibold uppercase tracking-[0.05em]',
                  'border-t-[0.5px] border-stone-200 first:border-t-0',
                  isOpen
                    ? 'bg-[#fff0ef] text-[#993C1D] border-l-2 border-l-brand'
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100',
                ].join(' ')}
              >
                <div className="flex items-center gap-1.5">
                  <GroupIcon size={13} />
                  <span>{group.label}</span>
                  <span className="text-[9px] font-normal normal-case tracking-normal text-stone-400 ml-1">
                    {group.devices.length} device{group.devices.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <IconChevronDown
                  size={13}
                  className="flex-shrink-0 transition-transform duration-200"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: isOpen ? '#c8291c' : undefined,
                  }}
                />
              </div>
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
                    className="flex items-center gap-2.5 px-3.5 py-[7px] pl-7 cursor-pointer border-t-[0.5px] border-stone-200 bg-white hover:bg-[#fff8f8] transition-colors"
                  >
                    <div className="w-[22px] h-[22px] rounded-[8px] bg-stone-100 border-[0.5px] border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
                      <GroupIcon size={11} />
                    </div>
                    <span className="text-[12px] font-medium text-stone-900 flex-1">{device.name}</span>
                    <IconChevronRight size={11} className="text-stone-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-stone-400 bg-stone-50 px-2.5 py-1.5 border-l-2 border-stone-300 mt-2.5">
        Tap a category to expand it, then select your device model to continue.
      </div>
    </div>
  );
}
