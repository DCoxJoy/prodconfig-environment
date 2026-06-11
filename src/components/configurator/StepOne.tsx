"use client";

import React from "react";

interface Option {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface StepOneProps {
  selected: string;
  onChange: (value: string) => void;
}

export default function StepOne({ selected, onChange }: StepOneProps) {
  const options: Option[] = [
    {
      id: "rugged_tablet",
      title: "Rugged Tablet",
      description: "Large 8-10\" display, durable casing, ideal for mobile data viewing and diagnostics.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      ),
    },
    {
      id: "handheld_computer",
      title: "Rugged Handheld",
      description: "Pocket-sized with integrated barcode scanner, optimized for high-volume scanning.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H13.5M10.5 22.5H13.5M9 3.75H15M6.75 20.25h10.5A2.25 2.25 0 0019.5 18V6A2.25 2.25 0 0017.25 3.75H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5h.008v.008H9v-.008zm3 0h.008v.008H12v-.008zm3 0h.008v.008H15v-.008zm-6 3h.008v.008H9v-.008zm3 0h.008v.008H12v-.008zm3 0h.008v.008H15v-.008z" />
        </svg>
      ),
    },
    {
      id: "vehicle_mount",
      title: "Vehicle-Mount Computer",
      description: "Heavy-duty terminals designed to withstand extreme vibration in forklift/cabin environments.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.32-5.112c-.053-.846-.74-1.504-1.59-1.504H13.5m0-6H7.575a1.125 1.125 0 00-1.124 1.125v9h12a1.125 1.125 0 001.124-1.125V8.25c0-.621-.504-1.125-1.125-1.125H13.5V3.75z" />
        </svg>
      ),
    },
    {
      id: "wearable_computer",
      title: "Industrial Wearable",
      description: "Hands-free arm-mount computers paired with ring-style scanners for maximum packing efficiency.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.5 1.5 0 11-2.1-.21 1.5 1.5 0 012.1.21zm0 0l-3.9 3.9M13.5 10.5v6.75a2.25 2.25 0 01-2.25 2.25H9A2.25 2.25 0 016.75 17.25V13.5M9 3h3a3 3 0 013 3v2.25M9 3v3.75M19.5 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-100 bg-clip-text text-transparent">
          What type of device are you configuring?
        </h2>
        <p className="mt-2 text-slate-400 text-sm">
          Select the form factor that best fits your workflow requirements.
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
              {/* Decorative gradient corner */}
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
