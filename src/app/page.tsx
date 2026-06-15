"use client";

import React, { useState, Suspense } from "react";
import Image from 'next/image';
import { useSearchParams } from "next/navigation";
import StepOne from "../components/configurator/StepOne";
import StepTwo from "../components/configurator/StepTwo";
import StepThree from "../components/configurator/StepThree";
import StepFour from "../components/configurator/StepFour";
import BundleDisplay from "../components/configurator/BundleDisplay";
import ConfirmationButtons from "../components/configurator/ConfirmationButtons";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { fallbackBundle } from "../lib/redzoneCatalog";
import { CustomerAnswers, ContactInfo, BundleRecommendation } from "../types";

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
  const [recommendation, setRecommendation] = useState<BundleRecommendation | null>(null);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  // Fall back to the first catalog bundle if Claude's recommendation hasn't loaded.
  const selectedBundle = recommendation?.bundle ?? fallbackBundle;

  const updateAnswer = (key: keyof CustomerAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (step === 1 && !answers.deviceType) return;
    if (step === 2 && !answers.industry) return;
    if (step === 3 && !answers.jobTitle) return;
    if (step === 4 && !answers.useCase) return;

    if (step === 4) {
      setLoading(true);
      setRecommendError(null);
      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerAnswers: answers }),
        });

        const data = await response.json();
        if (data.success) {
          setRecommendation(data.recommendation);
        } else {
          setRecommendError(data.error || "Unable to generate a recommendation.");
          setRecommendation(null);
        }
      } catch (err) {
        console.error("Error fetching recommendation:", err);
        setRecommendError("An unexpected error occurred while generating your recommendation.");
        setRecommendation(null);
      } finally {
        setLoading(false);
      }
    }

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
            id: selectedBundle.id,
            name: selectedBundle.name,
            totalPrice: selectedBundle.totalPrice,
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
            id: selectedBundle.id,
            name: selectedBundle.name,
            totalPrice: selectedBundle.totalPrice,
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
    setRecommendation(null);
    setRecommendError(null);
  };

  // Determine if next button should be disabled
  const isNextDisabled = () => {
    if (step === 1 && !answers.deviceType) return true;
    if (step === 2 && !answers.industry) return true;
    if (step === 3 && !answers.jobTitle) return true;
    if (step === 4 && !answers.useCase) return true;
    return false;
  };

  // Progress Bar percentage
  const progressPercent = ((step - 1) / 4) * 100;

  // Layout styling variables based on embed mode
const pageClass = isEmbed
  ? "flex-1 w-full bg-slate-50 text-slate-900 flex flex-col justify-start relative p-4 h-screen overflow-y-auto select-none"
  : "flex-1 w-full bg-slate-50 text-slate-900 flex flex-col items-center justify-center relative overflow-hidden px-4 py-12";

const cardClass = isEmbed
  ? "w-full bg-transparent flex flex-col space-y-6"
  : "rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 animate-fadeIn";

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
              <div className="w-8 h-8 rounded-lg bg-[#DB0032] flex items-center justify-center shadow-lg shadow-[#DB0032]/20">
                <Image
                  src="/Logo-TJF-V2-250.svg" // Replace with your exact filename in /public
                  alt="Brand Logo"
                  width={32}            // Explicitly force it to 16px (matches Tailwind's w-4)
                  height={32}           // Explicitly force it to 16px (matches Tailwind's h-4)
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                REDZONE PRODUCT CONFIGURATOR
              </span>
            </div>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">
              Enterprise Device Setup Configurator — Phase 1
            </p>
          </header>
        )}

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xl">
            <LoadingSpinner />
          </div>
        ) : step === 6 ? (
          /* Success Screen */
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-md">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent">
                {resultPath === "contact_sales" ? "Request Submitted" : "Bundle Confirmed!"}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {successInfo?.message}
              </p>
            </div>

            {successInfo?.contactInfo && (
              <div className="text-left w-full max-w-xs p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5 text-slate-600">
                <div className="font-semibold text-slate-700 border-b border-slate-200 pb-1.5 mb-1.5 uppercase tracking-wider text-[10px]">
                  Submitted Lead Information
                </div>
                <div>Name: <span className="text-slate-900 font-medium">{successInfo.contactInfo.firstName} {successInfo.contactInfo.lastName}</span></div>
                <div>Email: <span className="text-slate-900 font-medium">{successInfo.contactInfo.email}</span></div>
                <div>Company: <span className="text-slate-900 font-medium">{successInfo.contactInfo.company}</span></div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors shadow-sm focus:outline-none"
            >
              Configure Another Device
            </button>
          </div>
        ) : step === 5 ? (
          /* Bundle Display Screen */
          <div className={cardClass}>
            {recommendation?.reasoning && (
              <div className="mb-6 p-4 rounded-2xl border border-[#DB0032]/20 bg-red-50/30 text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold text-[#DB0032]">Why we picked this: </span>
                {recommendation.reasoning}
              </div>
            )}
            {recommendError && (
              <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-sm text-amber-800 leading-relaxed">
                We couldn&apos;t generate a personalized recommendation ({recommendError}), so here&apos;s our default configuration.
              </div>
            )}
            <BundleDisplay bundle={selectedBundle}>
              <ConfirmationButtons
                onContactSalesSubmit={handleContactSalesSubmit}
                onPurchaseNowClick={handlePurchaseNowClick}
                loading={loading}
              />
            </BundleDisplay>
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 hover:text-slate-800 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to step 4
              </button>
              <button
                onClick={handleReset}
                className="hover:text-slate-800 transition-colors font-medium"
              >
                Reset configurator
              </button>
            </div>
          </div>
        ) : (
          /* Wizard Steps 1-4 */
          <div className={isEmbed ? "w-full flex flex-col space-y-6" : "rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden"}>
            {/* Top Progress bar */}
            <div className="w-full h-1 bg-slate-100">
              <div
                className="h-full bg-[#DB0032] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Inner content wrapper */}
            <div className={isEmbed ? "space-y-6" : "p-6 sm:p-8 space-y-8"}>
              {/* Steps Progress text */}
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono tracking-wider">
                <span>STEP {step} OF 4</span>
                <span className="text-[#DB0032] font-bold">{Math.round(progressPercent)}% COMPLETE</span>
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
                    selected={answers.jobTitle}
                    onChange={(val) => updateAnswer("jobTitle", val)}
                    industry={answers.industry}
                  />
                )}
                {step === 4 && (
                  <StepFour
                    selected={answers.useCase}
                    onChange={(val) => updateAnswer("useCase", val)}
                  />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={isNextDisabled()}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#DB0032] hover:bg-[#b8002a] disabled:bg-slate-100 disabled:text-slate-400 transition-all duration-200 disabled:cursor-not-allowed shadow-md shadow-[#DB0032]/10"
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
