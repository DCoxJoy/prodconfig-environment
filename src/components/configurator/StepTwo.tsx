"use client";

import React from "react";
import { industries } from "../../lib/industries";

interface StepTwoProps {
  selected: string;
  onChange: (value: string) => void;
}

const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  food_beverage: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.432 14.07a2.25 2.25 0 00-.659 1.591v3.114c0 .256.044.514.13.766.32.92 1.18 1.45 2.111 1.45h9.976c.931 0 1.79-.53 2.111-1.45.087-.252.131-.51.131-.766v-3.114a2.25 2.25 0 00-.659-1.591l-3.661-3.661a2.25 2.25 0 01-.659-1.591V3.104M14.25 3.104c.251.023.501.05.75.082M9.75 3.104a24.301 24.301 0 014.5 0" />
    </svg>
  ),
  cpg: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  automotive: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-.5v5.5m0-5.5h2.605c-.052-.658-.121-1.31-.205-1.952" />
    </svg>
  ),
  life_sciences: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  industrial_hightech: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M15.75 3v1.5M8.25 19.5V21M15.75 19.5V21M3 8.25h1.5M3 12h1.5M3 15.75h1.5M19.5 8.25H21M19.5 12H21M19.5 15.75H21M5.25 5.25h13.5v13.5H5.25V5.25z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25h7.5v7.5h-7.5v-7.5z" />
    </svg>
  ),
  distribution_logistics: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
};

export default function StepTwo({ selected, onChange }: StepTwoProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* High contrast step header layout */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          What manufacturing sector are you in?
        </h2>
        <p className="mt-2 text-slate-500 text-sm">
          This helps us match the right device cases, mounts, and accessories for your industry.
        </p>
      </div>

      {/* Structured interactive options layout grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {industries.map((industry) => {
          const isSelected = selected === industry.id;
          return (
            <button
              key={industry.id}
              onClick={() => onChange(industry.id)}
              className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 outline-none ${
                isSelected
                  ? "bg-red-50/40 border-[#DB0032] shadow-md shadow-red-500/5 ring-1 ring-[#DB0032]/20"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-sm"
              }`}
            >
              {/* Subtle dynamic brand gradient corner */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#DB0032]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-2xl`}
              ></div>

              <div className="flex gap-4 items-start relative z-10">
                {/* Visual Icon Badge component */}
                <div
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? "bg-[#DB0032] text-white shadow-md shadow-[#DB0032]/20 scale-105"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
                  }`}
                >
                  {INDUSTRY_ICONS[industry.id]}
                </div>

                {/* Microtypography block */}
                <div className="space-y-1">
                  <h3
                    className={`font-semibold text-base transition-colors duration-300 ${
                      isSelected ? "text-slate-950 font-bold" : "text-slate-800 group-hover:text-slate-900"
                    }`}
                  >
                    {industry.name}
                  </h3>
                  <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                    isSelected ? "text-slate-700" : "text-slate-500"
                  }`}>
                    {industry.description}
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
