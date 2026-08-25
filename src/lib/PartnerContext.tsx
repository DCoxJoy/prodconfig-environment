'use client';

import React, { createContext, useContext } from 'react';
import { PartnerConfig } from './partners';

// Separate from ConfiguratorContext on purpose — partner identity is static for the
// lifetime of a page load (resolved server-side by the /p/[partnerSlug] route) and
// has nothing to do with the configurator's own step/selection state. Keeping it
// apart means the default (no-partner) flow never touches this file at all.
const PartnerContext = createContext<PartnerConfig | null>(null);

export function PartnerProvider({
  partner,
  children,
}: {
  partner: PartnerConfig | null;
  children: React.ReactNode;
}) {
  return <PartnerContext.Provider value={partner}>{children}</PartnerContext.Provider>;
}

// Returns null on the default (no-partner) flow — that's the expected, common case,
// not an error, so this doesn't throw the way useConfigurator() does outside its provider.
export function usePartner(): PartnerConfig | null {
  return useContext(PartnerContext);
}
