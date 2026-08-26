import { ConfiguratorProvider } from '../lib/ConfiguratorContext';
import { PartnerProvider } from '../lib/PartnerContext';
import { PartnerConfig, darkenHex } from '../lib/partners';
import { PartnerMode } from '../lib/partnerMailto';
import ConfiguratorShell from './configurator/ConfiguratorShell';
import AppHeader from './ui/AppHeader';

// Shared shell for both the default (/) and partner-branded (/p/[partnerSlug])
// routes — identical structure either way. `partner` is null on the default route,
// which is the only thing that keeps its output/behavior unchanged from before
// partner mode existed. `mode` (rep vs customer) is meaningless without a partner and
// defaults to 'customer' either way.
export default function ConfiguratorApp({
  partner,
  mode = 'customer',
}: {
  partner: PartnerConfig | null;
  mode?: PartnerMode;
}) {
  // A partner's brandColor overrides --color-brand/--color-brand-hover for everything
  // inside this wrapper (header, buttons, progress bar, etc. all read those CSS custom
  // properties via Tailwind's bg-brand/text-brand/border-brand utilities) — an inline
  // style here re-declares them lower in the DOM than globals.css's :root/@theme
  // declarations, so it wins for this subtree without touching any component's own
  // classes. Unset brandColor (default app, and any partner without one) means no
  // inline style at all — the app's own default red keeps flowing from :root untouched.
  const brandStyle = partner?.brandColor
    ? ({ '--color-brand': partner.brandColor, '--color-brand-hover': darkenHex(partner.brandColor) } as React.CSSProperties)
    : undefined;

  return (
    <main className="min-h-screen bg-stone-100 flex justify-center items-start">
      <div className="w-full max-w-[720px]" style={brandStyle}>
        <AppHeader partnerName={partner?.name} />
        <div className="page-outer">
          <PartnerProvider partner={partner} mode={mode}>
            <ConfiguratorProvider>
              <ConfiguratorShell />
            </ConfiguratorProvider>
          </PartnerProvider>
        </div>
      </div>
    </main>
  );
}
