'use client';

import React, { createContext, useContext } from 'react';
import { PartnerConfig } from './partners';
import { PartnerMode } from './partnerMailto';

// Separate from ConfiguratorContext on purpose — partner identity (and its rep/customer
// mode) is static for the lifetime of a page load (resolved server-side by the
// /p/[partnerSlug] route) and has nothing to do with the configurator's own
// step/selection state. Keeping it apart means the default (no-partner) flow never
// touches this file at all.
interface PartnerContextValue {
  partner: PartnerConfig | null;
  mode: PartnerMode;
}

const PartnerContext = createContext<PartnerContextValue>({ partner: null, mode: 'customer' });

export function PartnerProvider({
  partner,
  mode = 'customer',
  children,
}: {
  partner: PartnerConfig | null;
  mode?: PartnerMode;
  children: React.ReactNode;
}) {
  return <PartnerContext.Provider value={{ partner, mode }}>{children}</PartnerContext.Provider>;
}

// Returns null on the default (no-partner) flow — that's the expected, common case,
// not an error, so this doesn't throw the way useConfigurator() does outside its provider.
export function usePartner(): PartnerConfig | null {
  return useContext(PartnerContext).partner;
}

// 'rep' only when explicitly requested via ?mode=rep on a partner route; 'customer'
// otherwise (including the entire default, no-partner flow, where it's unused).
export function usePartnerMode(): PartnerMode {
  return useContext(PartnerContext).mode;
}
