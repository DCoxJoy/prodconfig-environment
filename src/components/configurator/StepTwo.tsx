"use client";

import React from "react";

interface Option {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface StepTwoProps {
  selected: string;
  onChange: (value: string) => void;
}

export default function StepTwo({ selected, onChange }: StepTwoProps) {
  const options: Option[] = [
    {
      id: "logistics",
      title: "Warehousing & Logistics",
      description: "Inventory tracking, order fulfillment, cross-docking, and barcode scanning workflows.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
    {
      id: "field_service",
      title: "Field Service & Utilities",
      description: "Asset inspections, infrastructure maintenance, field dispatch, and mobile work orders.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 1021 17.25l-5.83-5.83m-3.75 3.75L4.81 7.42A2.67 2.67 0 118.59 3.64l6.34 6.34m-3.51 5.19c-.312-.312-.735-.487-1.177-.487H9a1.5 1.5 0 00-1.5 1.5v.727c0 .442-.175.865-.487 1.177L4.12 21H3v-1.12l3.11-3.11c.312-.312.487-.735.487-1.177V15a1.5 1.5 0 011.5-1.5h.727c.442 0 .865-.175 1.177-.487l3.11-3.11H12.24l-3.11 3.11z" />
        </svg>
      ),
    },
    {
      id: "manufacturing",
      title: "Manufacturing",
      description: "Work-in-progress tracking, quality control audits, material management, and assembly line tooling.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.128l1.41-.513M5.106 17.785l1.15-.827m11.379-8.16l1.15-.827M8.14 21.27l.707-1.03m10.74-6.43l.708-1.03M12 21.75V20m0-16V2.25M8.848 3.76l-.708-1.03m11.379 8.16l-.707-1.03m-14.1 5.13l-1.41-.513m14.095 5.128l-1.41-.513M5.106 6.215l-1.15-.827m11.379 8.16l-1.15-.827" />
        </svg>
      ),
    },
    {
      id: "public_safety",
      title: "Public Safety & Gov",
      description: "Emergency response, military operations, law enforcement citation, and municipal field services.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751A11.959 11.959 0 0112 2.714z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-100 bg-clip-text text-transparent">
          What industry are you in?
        </h2>
        <p className="mt-2 text-slate-400 text-sm">
          This helps us match industry standards and compliance certifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md outline-none ${
                isSelected
                  ? "bg-indigo-950/30 border-indigo-500 shadow-[0_0_20px_-3px_rgba(99,102,241,0.25)]"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-2xl`}
              ></div>

              <div className="flex gap-4 items-start relative z-10">
                <div
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105"
                      : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                  }`}
                >
                  {option.icon}
                </div>
                <div className="space-y-1">
                  <h3
                    className={`font-semibold text-base transition-colors duration-300 ${
                      isSelected ? "text-indigo-200" : "text-slate-100 group-hover:text-white"
                    }`}
                  >
                    {option.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {option.description}
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
