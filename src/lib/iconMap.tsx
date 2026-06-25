import {
  IconShield, IconBriefcase, IconDeviceTablet, IconLayoutSidebar,
  IconDeviceIpad, IconDeviceMobile, IconDeviceLaptop, IconDots,
  IconCheck, IconAlertTriangle, IconFilter, IconSparkles,
  IconShoppingCart, IconShare, IconSend, IconX, IconRefresh,
  IconInfoCircle, IconAlertCircle, IconCopy, IconChevronDown,
  IconChevronRight, IconLoader2, IconShieldCheck,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

type TablerIcon = ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, TablerIcon> = {
  'shield':           IconShield,
  'briefcase':        IconBriefcase,
  'device-tablet':    IconDeviceTablet,
  'layout-sidebar':   IconLayoutSidebar,
  'device-ipad':      IconDeviceIpad,
  'device-mobile':    IconDeviceMobile,
  'device-laptop':    IconDeviceLaptop,
  'dots':             IconDots,
  'check':            IconCheck,
  'alert-triangle':   IconAlertTriangle,
  'filter':           IconFilter,
  'sparkles':         IconSparkles,
  'shopping-cart':    IconShoppingCart,
  'share':            IconShare,
  'send':             IconSend,
  'x':                IconX,
  'refresh':          IconRefresh,
  'info-circle':      IconInfoCircle,
  'alert-circle':     IconAlertCircle,
  'copy':             IconCopy,
  'chevron-down':     IconChevronDown,
  'chevron-right':    IconChevronRight,
  'loader-2':         IconLoader2,
  'shield-check':     IconShieldCheck,
};

export function getTablerIcon(name: string): TablerIcon {
  return ICON_MAP[name] ?? IconDots;
}

export {
  IconShield, IconBriefcase, IconDeviceTablet, IconLayoutSidebar,
  IconDeviceIpad, IconDeviceMobile, IconDeviceLaptop, IconDots,
  IconCheck, IconAlertTriangle, IconFilter, IconSparkles,
  IconShoppingCart, IconShare, IconSend, IconX, IconRefresh,
  IconInfoCircle, IconAlertCircle, IconCopy, IconChevronDown,
  IconChevronRight, IconLoader2, IconShieldCheck,
};
