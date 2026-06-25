'use client';

import { IconLoader2 } from '@tabler/icons-react';

interface LoadingSpinnerProps {
  size?: number;
}

export default function LoadingSpinner({ size = 20 }: LoadingSpinnerProps) {
  return (
    <IconLoader2
      size={size}
      className="animate-spin text-brand"
    />
  );
}
