'use client';

import { useState } from 'react';
import { IconRefresh } from '@tabler/icons-react';
import { useConfigurator } from '../../lib/ConfiguratorContext';
import { getDeviceFamily } from '../../lib/utils';
import { ENV_QUESTIONS_IPHONE, ENV_QUESTIONS_TABLET } from '../../lib/questions';
import ProgressBar from '../ui/ProgressBar';
import StepNav from '../ui/StepNav';
import StepDevices from './StepDevices';
import StepFeatures from './StepFeatures';
import StepEnvironment from './StepEnvironment';
import StepReview from './StepReview';
import StepBundle from './StepBundle';
import StepContact from './StepContact';

type StepId = 'devices' | 'features' | 'environment' | 'review' | 'bundle' | 'contact';

const NAV_LABELS = ['Devices', 'Features', 'Environment', 'Review', 'Bundle'];
const MAIN_STEPS: StepId[] = ['devices', 'features', 'environment', 'review', 'bundle'];

const STEP_META: Record<StepId, { q: string; sub: string; pct: number }> = {
  devices:     { q: 'Find your device',                             sub: 'Select a category to expand, then tap your model to continue.',  pct: 0   },
  features:    { q: 'What features matter most?',                   sub: '',  pct: 25  },
  environment: { q: 'What environment and how are you using your device?', sub: '', pct: 50 },
  review:      { q: 'Review your bundle',                           sub: '',  pct: 75  },
  bundle:      { q: 'Your recommended bundle',                      sub: '',  pct: 100 },
  contact:     { q: 'Contact our sales team',                       sub: '',  pct: 100 },
};

export default function ConfiguratorShell() {
  const { state, liveProducts, qtys, dispatch } = useConfigurator();
  const { device, certified, features, scenarios } = state;

  const [step, setStep] = useState<StepId>('devices');
  const [contactSource, setContactSource] = useState<'certified' | 'escalation' | 'manual'>('manual');
  const [escalationRequest, setEscalationRequest] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  const meta = STEP_META[step];
  const mainStepIndex = MAIN_STEPS.indexOf(step);
  const navStep = mainStepIndex >= 0 ? mainStepIndex : 4;

  // Determine if next button is enabled
  function isNextEnabled(): boolean {
    if (step === 'features') {
      return certified === 'yes' || features.length > 0;
    }
    if (step === 'environment') {
      const family = getDeviceFamily(device?.id ?? '');
      const questions = family === 'iphone' ? ENV_QUESTIONS_IPHONE : ENV_QUESTIONS_TABLET;
      return Object.keys(scenarios).length === questions.length;
    }
    return false;
  }

  function handleNext() {
    if (step === 'features') {
      if (certified === 'yes') { goContactSales('certified'); return; }
      if (features.length > 0) setStep('environment');
      return;
    }
    if (step === 'environment') {
      setStep('review');
      return;
    }
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
    if (step === 'bundle')      { setStep('review'); return; }
    if (step === 'review')      { setStep('environment'); return; }
    if (step === 'environment') { setStep('features'); return; }
    if (step === 'features')    { setStep('devices'); return; }
  }

  function goContactSales(source: 'certified' | 'escalation' | 'manual', request = '') {
    setContactSource(source);
    setEscalationRequest(request);
    if (source === 'certified') {
      STEP_META.contact.q = 'Contact our sales team';
    } else if (source === 'escalation') {
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
        .map((p, i) => ({ sku: p.sku, qty: qtys[i] }))
        .filter(item => item.qty > 0);

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
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
    setStep('devices');
    setContactSource('manual');
    setEscalationRequest('');
  }

  const showNavRow = step !== 'devices' && step !== 'review' && step !== 'bundle';
  const showNextBtn = step === 'features' || step === 'environment';
  const nextEnabled = isNextEnabled();

  const nextHint = showNextBtn && !nextEnabled
    ? (step === 'features' ? 'Select at least one feature or choose certified' : 'Answer all questions to continue')
    : '';

  return (
    <div>
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <StepNav steps={NAV_LABELS} currentStep={navStep} />
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 bg-transparent border-[0.5px] border-stone-300 rounded-[8px] px-3 py-[5px] text-[11px] cursor-pointer text-stone-500 whitespace-nowrap flex-shrink-0 ml-3 hover:bg-stone-50"
        >
          <IconRefresh size={13} /> Reset demo
        </button>
      </div>

      {/* Card */}
      <div className="bg-white border-[0.5px] border-stone-200 rounded-[12px] overflow-hidden">
        {/* Card header */}
        <div className="px-5 pt-4 pb-3.5 border-b-[0.5px] border-stone-200">
          <ProgressBar pct={meta.pct} />
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-stone-400">
              {mainStepIndex >= 0 ? `Step ${mainStepIndex + 1} of ${MAIN_STEPS.length}` : 'Step 5 of 5'}
            </span>
            <span className="text-[11px] text-brand font-medium">{meta.pct}% complete</span>
          </div>

          {/* Breadcrumb */}
          {step !== 'devices' && (
            <div className="flex gap-1 items-center flex-wrap text-[11px] text-stone-400 mb-1.5">
              {device && <><span className="text-brand">{device.name}</span><span className="text-stone-200">›</span></>}
              {features.length > 0 && <><span className="text-brand">{features.length} feature{features.length !== 1 ? 's' : ''}</span><span className="text-stone-200">›</span></>}
              {Object.keys(scenarios).length > 0 && (
                <span className="text-brand">
                  {Object.keys(scenarios).length}/{getDeviceFamily(device?.id ?? '') === 'iphone' ? ENV_QUESTIONS_IPHONE.length : ENV_QUESTIONS_TABLET.length} answered
                </span>
              )}
            </div>
          )}

          <p className="text-[17px] font-medium text-stone-900 mb-1">{meta.q}</p>
          {meta.sub && <p className="text-[12px] text-stone-500">{meta.sub}</p>}
        </div>

        {/* Step content */}
        <div id="step-content">
          {step === 'devices' && (
            <StepDevices onDeviceSelected={() => setStep('features')} />
          )}
          {step === 'features' && (
            <StepFeatures onCertifiedYes={() => goContactSales('certified')} />
          )}
          {step === 'environment' && <StepEnvironment />}
          {step === 'review' && (
            <StepReview
              onConfirm={() => setStep('bundle')}
              onEscalate={(req) => goContactSales('escalation', req)}
            />
          )}
          {step === 'bundle' && (
            <StepBundle
              onContactSales={() => goContactSales('manual')}
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

        {/* Nav row — only for features and environment steps */}
        {showNavRow && (
          <div className="flex flex-col gap-1.5 px-5 py-3 border-t-[0.5px] border-stone-200">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                className="bg-transparent border-[0.5px] border-stone-300 rounded-[8px] px-4 py-[7px] text-[12px] cursor-pointer text-stone-500"
              >
                Back
              </button>
              {showNextBtn && (
                <button
                  onClick={handleNext}
                  disabled={!nextEnabled}
                  className={[
                    'rounded-[8px] px-[22px] py-[9px] text-[12px] font-medium transition-all duration-150',
                    nextEnabled
                      ? 'bg-brand border-brand text-white cursor-pointer shadow-[0_0_0_3px_rgba(200,41,28,0.12)]'
                      : 'bg-stone-100 border-[0.5px] border-stone-200 text-stone-400 cursor-not-allowed',
                  ].join(' ')}
                >
                  Next step
                </button>
              )}
              {step === 'contact' && (
                <div /> // Submit button is inside StepContact
              )}
            </div>
            {nextHint && (
              <div className="text-[10px] text-stone-400 text-right">{nextHint}</div>
            )}
          </div>
        )}
      </div>

      {addingToCart && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-[12px] px-6 py-4 text-[13px] text-stone-700 shadow-xl">
            Adding to cart…
          </div>
        </div>
      )}
    </div>
  );
}
