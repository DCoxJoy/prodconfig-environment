"use client";

import React from "react";
import { industries } from "../../lib/industries";

interface StepTwoProps {
  selected: string;
  onChange: (value: string) => void;
}

const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  manufacturing: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  oil_gas: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 3.75 3.75 0 001.43 3.92z" />
    </svg>
  ),
  construction: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-3.61 7.794l3.61-7.794m0 0L8.93 6.652" />
    </svg>
  ),
  energy_utilities: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  warehouse_logistics: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  healthcare: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  retail: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  ),
  hospitality: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
};

export default function StepTwo({ selected, onChange }: StepTwoProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* High contrast step header layout */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          What industry are you in?
        </h2>
        <p className="mt-2 text-slate-500 text-sm">
          This helps us match industry standards and compliance certifications.
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
