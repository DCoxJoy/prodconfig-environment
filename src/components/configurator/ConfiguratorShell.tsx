'use client';

import { useState } from 'react';
import { IconRefresh, IconArrowRight } from '@tabler/icons-react';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { getDeviceFamily } from '../../lib/utils';
import { ENV_QUESTIONS_IPHONE, getActiveTabletQuestions } from '../../lib/questions';
import ProgressBar from '../ui/ProgressBar';
import StepNav from '../ui/StepNav';
import StepDevices from './StepDevices';
import StepFeatures from './StepFeatures';
import StepEnvironment from './StepEnvironment';
import StepReview from './StepReview';
import StepBundle from './StepBundle';
import StepContact from './StepContact';

type StepId = 'intro' | 'devices' | 'features' | 'environment' | 'review' | 'bundle' | 'contact';

const NAV_LABELS = ['Devices', 'Features', 'Environment', 'Review', 'Bundle'];
const MAIN_STEPS: StepId[] = ['devices', 'features', 'environment', 'review', 'bundle'];

const STEP_META: Record<Exclude<StepId, 'intro'>, { q: string; sub: string; pct: number }> = {
  devices:     { q: 'Find your device',                              sub: 'Select your device category below, then tap your exact model — this determines which cases, mounts, and accessories we can recommend.', pct: 0   },
  features:    { q: 'What features matter most?',                    sub: 'Tell us if you need a certified rugged case, or select features that matter most for how you use your device.', pct: 25  },
  environment: { q: 'How and where do you use your device?',         sub: 'Answer a few quick questions about your daily use. Your answers determine which mount and accessories we recommend.', pct: 50  },
  review:      { q: 'Review your bundle',                            sub: "We've built a bundle from your answers below. Adjust quantities, or ask our AI agent to swap an item, then confirm to see your final bundle.", pct: 75  },
  bundle:      { q: 'Your recommended bundle',                       sub: "Here's your finished bundle with full pricing. Add it to your cart, share it by email, or contact our sales team if you'd like help.", pct: 100 },
  contact:     { q: 'Contact our sales team',                        sub: 'Fill out the form below and a Joy Factory specialist will follow up with you shortly.', pct: 100 },
};

export default function ConfiguratorShell() {
  const { state, liveProducts, qtys, dispatch } = useConfigurator();
  const { device, certified, features, scenarios } = state;

  const [step, setStep]                   = useState<StepId>('intro');
  const [contactSource, setContactSource] = useState<'certified' | 'escalation' | 'manual'>('manual');
  const [escalationRequest, setEscalationRequest] = useState('');
  const [addingToCart, setAddingToCart]   = useState(false);

  // Intro screen — a standalone splash shown on first load and after Reset, separate
  // from the step-by-step flow below (no progress bar, no step circles).
  if (step === 'intro') {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="text-[12px] font-bold text-brand uppercase tracking-widest mb-3">Start Here</div>
        <h1 className="text-[32px] font-bold text-stone-900 mb-8">Solution Bundle Builder</h1>
        <button
          onClick={() => setStep('devices')}
          className="flex items-center gap-2 bg-brand text-white rounded-xl px-6 py-3.5 text-[15px] font-semibold cursor-pointer hover:bg-brand-hover transition-colors"
        >
          Get Started
          <IconArrowRight size={18} />
        </button>
      </div>
    );
  }

  const meta         = STEP_META[step];
  const mainStepIndex = MAIN_STEPS.indexOf(step);
  const navStep      = mainStepIndex >= 0 ? mainStepIndex : 4;

  function isNextEnabled(): boolean {
    if (step === 'features') return certified === 'yes' || features.length > 0;
    if (step === 'environment') {
      const activeQs = getDeviceFamily(device?.id ?? '') === 'iphone'
        ? ENV_QUESTIONS_IPHONE
        : getActiveTabletQuestions(scenarios.mount_surface);
      return activeQs.every(q => !!scenarios[q.key as keyof typeof scenarios]);
    }
    return false;
  }

  function handleNext() {
    if (step === 'features') {
      if (certified === 'yes') { goContactSales('certified'); return; }
      if (features.length > 0) setStep('environment');
      return;
    }
    if (step === 'environment') { setStep('review'); return; }
  }

  function handleBack() {
    if (step === 'contact') {
      if (contactSource === 'certified') {
        dispatch({ type: 'CHANGE_CERTIFIED' });
        setStep('features');
      } else {
        setStep('review');
      }
      return;
    }
    if (step === 'bundle')      { setStep('review');       return; }
    if (step === 'review')      { setStep('environment');  return; }
    if (step === 'environment') { setStep('features');     return; }
    if (step === 'features')    { setStep('devices');      return; }
  }

  function goContactSales(source: 'certified' | 'escalation' | 'manual', request = '') {
    setContactSource(source);
    setEscalationRequest(request);
    if (source === 'escalation') {
      STEP_META.contact.q = 'Connect with a specialist';
    } else {
      STEP_META.contact.q = 'Contact our sales team';
    }
    setStep('contact');
  }

  async function handleAddToCart() {
    setAddingToCart(true);
    try {
      const items = liveProducts
        .map((p, i) => ({ sku: p.sku, qty: qtys[i], bcProductId: p.bcProductId, bcVariantId: p.bcVariantId }))
        .filter(item => item.qty > 0);
      const res  = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        // Navigate the top-level page, not just this iframe. BC's checkout relies on a
        // SameSite=Strict cookie that browsers won't set/send inside a nested third-party
        // iframe (e.g. this app embedded on a HubSpot landing page) — redirecting only the
        // iframe leaves checkout unable to establish its session. window.top is always safe
        // to *write* to cross-origin (unlike reading it), and equals window itself when the
        // app isn't embedded, so this is a no-op change for the non-embedded case.
        (window.top || window).location.href = data.checkoutUrl;
      } else {
        alert(data.error ?? 'Cart error. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  }

  function handleReset() {
    dispatch({ type: 'RESET' });
    setStep('intro');
    setContactSource('manual');
    setEscalationRequest('');
  }

  const showNavRow  = step !== 'devices' && step !== 'review' && step !== 'bundle' && step !== 'contact';
  const showNextBtn = step === 'features' || step === 'environment';
  const nextEnabled = isNextEnabled();

  const nextHint = showNextBtn && !nextEnabled
    ? (step === 'features' ? 'Select at least one feature to continue' : 'Answer all questions to continue')
    : '';

  /* ── breadcrumb pieces ─────────────────────────────────────────────────── */
  const activeEnvQs = getDeviceFamily(device?.id ?? '') === 'iphone'
    ? ENV_QUESTIONS_IPHONE
    : getActiveTabletQuestions(scenarios.mount_surface);
  const totalEnvQs  = activeEnvQs.length;
  const answeredEnv = activeEnvQs.filter(q => !!scenarios[q.key as keyof typeof scenarios]).length;

  return (
    <div>
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <StepNav steps={NAV_LABELS} currentStep={navStep} />
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-3 py-2 text-[12px] text-stone-500 cursor-pointer hover:bg-stone-50 transition-colors whitespace-nowrap flex-shrink-0 ml-3"
        >
          <IconRefresh size={13} />
          Reset
        </button>
      </div>

      {/* ── Card ───────────────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">

        {/* Card header */}
        <div className="px-6 pt-6 pb-5 border-b border-stone-200">
          <ProgressBar pct={meta.pct} />

          <div className="flex justify-between items-center mt-4 mb-2">
            <span className="text-[12px] text-stone-400 font-medium">
              {mainStepIndex >= 0 ? `Step ${mainStepIndex + 1} of ${MAIN_STEPS.length}` : 'Step 5 of 5'}
            </span>
            <span className="text-[12px] text-brand font-semibold">{meta.pct}% complete</span>
          </div>

          {/* Breadcrumb */}
          {step !== 'devices' && (
            <div className="flex gap-1.5 items-center flex-wrap text-[12px] text-stone-400 mb-2.5">
              {device && (
                <>
                  <span className="text-brand font-medium">{device.name}</span>
                  <span className="text-stone-300">›</span>
                </>
              )}
              {features.length > 0 && (
                <>
                  <span className="text-brand font-medium">{features.length} feature{features.length !== 1 ? 's' : ''}</span>
                  <span className="text-stone-300">›</span>
                </>
              )}
              {answeredEnv > 0 && (
                <span className="text-brand font-medium">{answeredEnv}/{totalEnvQs} questions</span>
              )}
            </div>
          )}

          <h2 className="text-[18px] font-semibold text-stone-900 leading-snug mt-1">{meta.q}</h2>
          {meta.sub && <p className="text-[13px] text-stone-500 mt-1.5">{meta.sub}</p>}
        </div>

        {/* Step content */}
        <div>
          {step === 'devices'     && <StepDevices onDeviceSelected={() => setStep('features')} />}
          {step === 'features'    && <StepFeatures onCertifiedYes={() => goContactSales('certified')} />}
          {step === 'environment' && <StepEnvironment />}
          {step === 'review'      && (
            <StepReview
              onConfirm={() => setStep('bundle')}
              onEscalate={(req) => goContactSales('escalation', req)}
            />
          )}
          {step === 'bundle'  && (
            <StepBundle
              onContactSales={() => goContactSales('manual')}
              onFeatureGap={(req) => goContactSales('escalation', req)}
              onAddToCart={handleAddToCart}
            />
          )}
          {step === 'contact' && (
            <StepContact
              source={contactSource}
              escalationRequest={escalationRequest}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Nav footer — features and environment steps only */}
        {showNavRow && (
          <div className="px-6 py-5 border-t border-stone-200">
            <div className="flex justify-between items-center gap-3">
              <button
                onClick={handleBack}
                className="bg-white border border-stone-200 rounded-xl px-5 py-2.5 text-[13px] font-medium text-stone-600 cursor-pointer hover:bg-stone-50 transition-colors"
              >
                Back
              </button>
              {showNextBtn && (
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={handleNext}
                    disabled={!nextEnabled}
                    className={[
                      'rounded-xl px-6 py-2.5 text-[13px] font-semibold transition-all',
                      nextEnabled
                        ? 'bg-brand text-white cursor-pointer shadow-[0_0_0_3px_rgba(200,41,28,0.12)]'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200',
                    ].join(' ')}
                  >
                    Next step
                  </button>
                  {nextHint && (
                    <div className="text-[11px] text-stone-400">{nextHint}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add-to-cart overlay */}
      {addingToCart && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-6 py-4 text-[14px] text-stone-700 shadow-xl">
            Adding to cart…
          </div>
        </div>
      )}
    </div>
  );
}
