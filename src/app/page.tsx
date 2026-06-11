"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StepOne from "../components/configurator/StepOne";
import StepTwo from "../components/configurator/StepTwo";
import StepThree from "../components/configurator/StepThree";
import StepFour from "../components/configurator/StepFour";
import BundleDisplay from "../components/configurator/BundleDisplay";
import ConfirmationButtons from "../components/configurator/ConfirmationButtons";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { bundles } from "../lib/hardcodedBundles";
import { CustomerAnswers, ContactInfo } from "../types";

function ConfiguratorContent() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<CustomerAnswers>({
    deviceType: "",
    industry: "",
    useCase: "",
    jobTitle: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [resultPath, setResultPath] = useState<"contact_sales" | "purchase_now" | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    contactInfo?: ContactInfo;
    message: string;
  } | null>(null);

  const updateAnswer = (key: keyof CustomerAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !answers.deviceType) return;
    if (step === 2 && !answers.industry) return;
    if (step === 3 && !answers.useCase) return;
    if (step === 4 && !answers.jobTitle) return;

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Submit to HubSpot
  const handleContactSalesSubmit = async (contactInfo: ContactInfo) => {
    setLoading(true);
    setResultPath("contact_sales");
    try {
      const response = await fetch("/api/hubspot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerAnswers: answers,
          selectedBundle: {
            id: bundles[0].id,
            name: bundles[0].name,
            totalPrice: bundles[0].totalPrice,
          },
          path: "contact_sales",
          contactInfo,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessInfo({
          contactInfo,
          message: "Thank you! Our sales team has received your configuration and will contact you shortly.",
        });
        setStep(6); // Success screen
      } else {
        alert(`Failed to submit: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error submitting to HubSpot:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit to Cart Stub
  const handlePurchaseNowClick = async () => {
    setLoading(true);
    setResultPath("purchase_now");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerAnswers: answers,
          selectedBundle: {
            id: bundles[0].id,
            name: bundles[0].name,
            totalPrice: bundles[0].totalPrice,
          },
          path: "purchase_now",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessInfo({
          message: "Redirecting to checkout... (Phase 1 mock success: bundle successfully added to cart!)",
        });
        setStep(6); // Success screen
      } else {
        alert(`Failed to add to cart: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error submitting to Cart:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({
      deviceType: "",
      industry: "",
      useCase: "",
      jobTitle: "",
    });
    setStep(1);
    setResultPath(null);
    setSuccessInfo(null);
  };

  // Determine if next button should be disabled
  const isNextDisabled = () => {
    if (step === 1 && !answers.deviceType) return true;
    if (step === 2 && !answers.industry) return true;
    if (step === 3 && !answers.useCase) return true;
    if (step === 4 && !answers.jobTitle) return true;
    return false;
  };

  // Progress Bar percentage
  const progressPercent = ((step - 1) / 4) * 100;

  // Layout styling variables based on embed mode
  const pageClass = isEmbed
    ? "flex-1 w-full bg-slate-950 text-slate-100 flex flex-col justify-start relative p-4 h-screen overflow-y-auto select-none"
    : "flex-1 w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden px-4 py-12";

  const cardClass = isEmbed
    ? "w-full bg-transparent flex flex-col space-y-6"
    : "rounded-3xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl p-6 sm:p-8 shadow-2xl animate-fadeIn";

  return (
    <div className={pageClass}>
      {/* Decorative Blur Spheres (Only show if not embedded to keep background clean) */}
      {!isEmbed && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        </>
      )}

      {/* Main container */}
      <div className={isEmbed ? "w-full flex flex-col" : "w-full max-w-4xl relative z-10 flex flex-col"}>
        {/* Logo and Brand Header */}
        {!isEmbed && (
          <header className="mb-10 text-center flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg className="w-4 h-4 text-white font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                ANTIGRAVITY CONFIGURATOR
              </span>
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
              Enterprise Device Setup Configurator — Phase 1
            </p>
          </header>
        )}

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center rounded-3xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl p-8 shadow-2xl">
            <LoadingSpinner />
          </div>
        ) : step === 6 ? (
          /* Success Screen */
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-2xl space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-slate-100 bg-clip-text text-transparent">
                {resultPath === "contact_sales" ? "Request Submitted" : "Bundle Confirmed!"}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {successInfo?.message}
              </p>
            </div>

            {successInfo?.contactInfo && (
              <div className="text-left w-full max-w-xs p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 text-xs space-y-1.5 text-slate-400">
                <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1.5 mb-1.5 uppercase tracking-wider text-[10px]">
                  Submitted Lead Information
                </div>
                <div>Name: <span className="text-slate-200">{successInfo.contactInfo.firstName} {successInfo.contactInfo.lastName}</span></div>
                <div>Email: <span className="text-slate-200">{successInfo.contactInfo.email}</span></div>
                <div>Company: <span className="text-slate-200">{successInfo.contactInfo.company}</span></div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors shadow-md hover:shadow-lg focus:outline-none"
            >
              Configure Another Device
            </button>
          </div>
        ) : step === 5 ? (
          /* Bundle Display Screen */
          <div className={cardClass}>
            <BundleDisplay bundle={bundles[0]}>
              <ConfirmationButtons
                onContactSalesSubmit={handleContactSalesSubmit}
                onPurchaseNowClick={handlePurchaseNowClick}
                loading={loading}
              />
            </BundleDisplay>
            <div className="mt-8 pt-6 border-t border-slate-900 flex justify-between items-center text-xs text-slate-500">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 hover:text-slate-300 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to step 4
              </button>
              <button
                onClick={handleReset}
                className="hover:text-slate-300 transition-colors font-medium"
              >
                Reset configurator
              </button>
            </div>
          </div>
        ) : (
          /* Wizard Steps 1-4 */
          <div className={isEmbed ? "w-full flex flex-col space-y-6" : "rounded-3xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-xl shadow-2xl overflow-hidden"}>
            {/* Top Progress bar */}
            <div className="w-full h-1 bg-slate-900">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Inner content wrapper (no padding/borders if embed, since frameContainer handles it) */}
            <div className={isEmbed ? "space-y-6" : "p-6 sm:p-8 space-y-8"}>
              {/* Steps Progress text */}
              <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>STEP {step} OF 4</span>
                <span className="text-indigo-400 font-semibold">{Math.round(progressPercent)}% COMPLETE</span>
              </div>

              {/* Render step UI */}
              <div className={isEmbed ? "min-h-[220px] flex flex-col justify-start" : "min-h-[260px] flex flex-col justify-center"}>
                {step === 1 && (
                  <StepOne
                    selected={answers.deviceType}
                    onChange={(val) => updateAnswer("deviceType", val)}
                  />
                )}
                {step === 2 && (
                  <StepTwo
                    selected={answers.industry}
                    onChange={(val) => updateAnswer("industry", val)}
                  />
                )}
                {step === 3 && (
                  <StepThree
                    selected={answers.useCase}
                    onChange={(val) => updateAnswer("useCase", val)}
                  />
                )}
                {step === 4 && (
                  <StepFour
                    selected={answers.jobTitle}
                    onChange={(val) => updateAnswer("jobTitle", val)}
                  />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 border-t border-slate-900/60 flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/30 text-slate-300 hover:bg-slate-900 hover:border-slate-700 text-sm font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={isNextDisabled()}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 transition-all duration-300 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10"
                >
                  {step === 4 ? "Review Bundle" : "Next Step"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfiguratorPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    }>
      <ConfiguratorContent />
    </Suspense>
  );
}
