import { DeviceFamily, FeatureId } from '../types';
import { DEVICE_FEATURE_MAP } from './catalog';

export function getDeviceFamily(id: string): DeviceFamily {
  if (!id) return 'other';
  if (id.startsWith('ipad_pro'))  return 'ipad_pro';
  if (id.startsWith('ipad_air'))  return 'ipad_air';
  if (id.startsWith('ipad_mini')) return 'ipad_mini';
  if (id.startsWith('ipad'))      return 'ipad_std';
  if (id.startsWith('iphone'))    return 'iphone';
  if (id.startsWith('surface'))   return 'surface';
  return 'other';
}

export function isIphoneFamily(family: DeviceFamily): boolean {
  return family === 'iphone';
}

export function getAllowedFeatures(family: DeviceFamily): FeatureId[] {
  return DEVICE_FEATURE_MAP[family] ?? DEVICE_FEATURE_MAP['other'];
}

export function getDeviceFamilyLabel(family: DeviceFamily): string {
  const labels: Record<DeviceFamily, string> = {
    ipad_pro:  'iPad Pro',
    ipad_air:  'iPad Air',
    ipad_std:  'iPad',
    ipad_mini: 'iPad mini',
    iphone:    'iPhone',
    surface:   'Microsoft Surface',
    other:     'your device',
  };
  return labels[family] ?? 'your device';
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
