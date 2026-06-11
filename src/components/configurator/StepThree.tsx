"use client";

import React from "react";

interface Option {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface StepThreeProps {
  selected: string;
  onChange: (value: string) => void;
}

export default function StepThree({ selected, onChange }: StepThreeProps) {
  const options: Option[] = [
    {
      id: "inventory",
      title: "Inventory Control & Picking",
      description: "Real-time stock queries, inventory counting, fast picking, sorting, and dispatch tracking.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24A2.25 2.25 0 019 8.25v10.5a2.25 2.25 0 002.25 2.25h6.75A2.25 2.25 0 0020.25 18.75V8.25A2.25 2.25 0 0118 6H9z" />
        </svg>
      ),
    },
    {
      id: "inspections",
      title: "Safety Inspections & Audits",
      description: "Asset compliance checklists, field incident reporting, photo capture, and electronic logs.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "delivery",
      title: "Proof of Delivery",
      description: "Courier route optimization, barcode tracking, signature capture, and delivery verification.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      id: "diagnostics",
      title: "Equipment Diagnostics",
      description: "Heavy machinery telemetry readings, maintenance logging, work order generation, and specs check.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-100 bg-clip-text text-transparent">
          What is your primary use case?
        </h2>
        <p className="mt-2 text-slate-400 text-sm">
          Select the core workflow function this device configuration will support.
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
