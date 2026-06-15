"use client";

import React from "react";
import { useCases } from "../../lib/useCases";

interface StepFourProps {
  selected: string;
  onChange: (value: string) => void;
}

const USE_CASE_ICONS: Record<string, React.ReactNode> = {
  floor_walks: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  ),
  fixed_workstation: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  ),
  forklift_mobile_equipment: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-.5v5.5m0-5.5h2.605c-.052-.658-.121-1.31-.205-1.952" />
    </svg>
  ),
  wall_kiosk: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4.5 21V3h6v18M16.5 21V9h3.75v12M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5" />
    </svg>
  ),
  maintenance_work_orders: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-3.61 7.794l3.61-7.794m0 0L8.93 6.652" />
    </svg>
  ),
};

export default function StepFour({ selected, onChange }: StepFourProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* High-contrast accessible title and subheader layout */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          What is your primary use case?
        </h2>
        <p className="mt-2 text-slate-500 text-sm">
          This determines the mounting hardware and accessories included in your bundle.
        </p>
      </div>

      {/* Grid framework mapped to white layouts and corporate branding hooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {useCases.map((useCase) => {
          const isSelected = selected === useCase.id;
          return (
            <button
              key={useCase.id}
              onClick={() => onChange(useCase.id)}
              className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 outline-none ${
                isSelected
                  ? "bg-red-50/40 border-[#DB0032] shadow-md shadow-red-500/5 ring-1 ring-[#DB0032]/20"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-sm"
              }`}
            >
              {/* Subtle top-right branded mesh highlight */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#DB0032]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-2xl`}
              ></div>

              <div className="flex gap-4 items-start relative z-10">
                {/* Micro icon container wrapper */}
                <div
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? "bg-[#DB0032] text-white shadow-md shadow-[#DB0032]/20 scale-105"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
                  }`}
                >
                  {USE_CASE_ICONS[useCase.id]}
                </div>

                {/* Local typographic elements mapped to light canvas depth parameters */}
                <div className="space-y-1">
                  <h3
                    className={`font-semibold text-base transition-colors duration-300 ${
                      isSelected ? "text-slate-950 font-bold" : "text-slate-800 group-hover:text-slate-900"
                    }`}
                  >
                    {useCase.title}
                  </h3>
                  <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                    isSelected ? "text-slate-700" : "text-slate-500"
                  }`}>
                    {useCase.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
