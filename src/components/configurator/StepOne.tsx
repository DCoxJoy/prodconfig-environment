"use client";

import React, { useState } from "react";
import { deviceFamilies, DeviceFamily } from "../../lib/deviceTypes";

interface StepOneProps {
  selected: string;
  onChange: (value: string) => void;
}

const FAMILY_ICONS: Record<string, React.ReactNode> = {
  ipad_pro: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 7.5h1.5" />
    </svg>
  ),
  ipad_air: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  ),
  ipad: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
    </svg>
  ),
  ipad_mini: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 17.25v.75a2.25 2.25 0 01-.659 1.591L9 20.25h6l-.841-.659A2.25 2.25 0 0113.5 18v-.75m4.5-9V15a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 15V8.25m13.5 0A2.25 2.25 0 0015.75 6H8.25A2.25 2.25 0 006 8.25m12 0V6.75A2.25 2.25 0 0015.75 4.5h-7.5A2.25 2.25 0 006 6.75v1.5" />
    </svg>
  ),
};

function findFamilyByModelId(modelId: string): DeviceFamily | undefined {
  return deviceFamilies.find((family) => family.models.some((model) => model.id === modelId));
}

export default function StepOne({ selected, onChange }: StepOneProps) {
  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(
    () => findFamilyByModelId(selected)?.id ?? null
  );
  const [query, setQuery] = useState("");

  const activeFamily = deviceFamilies.find((family) => family.id === activeFamilyId) ?? null;

  const handleFamilyClick = (family: DeviceFamily) => {
    if (family.models.length === 1) {
      onChange(family.models[0].id);
      setActiveFamilyId(family.id);
      return;
    }
    setActiveFamilyId(family.id);
    setQuery("");
  };

  const handleBackToFamilies = () => {
    setActiveFamilyId(null);
    setQuery("");
  };

  if (activeFamily) {
    const filteredModels = activeFamily.models.filter((model) =>
      model.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center sm:text-left">
          <button
            onClick={handleBackToFamilies}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#DB0032] transition-colors mb-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All device families
          </button>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Which {activeFamily.name} model do you have?
          </h2>
          <p className="mt-2 text-slate-500 text-sm">
            We&apos;ll match RedZone-compatible cases built specifically for your device.
          </p>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DB0032]/20 focus:border-[#DB0032]/40 transition-all"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {filteredModels.map((model) => {
            const isSelected = selected === model.id;
            return (
              <button
                key={model.id}
                onClick={() => onChange(model.id)}
                className={`group relative text-left px-4 py-3 rounded-xl border transition-all duration-200 outline-none flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-red-50/40 border-[#DB0032] shadow-sm ring-1 ring-[#DB0032]/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <span
                  className={`font-medium text-sm ${
                    isSelected ? "text-slate-950" : "text-slate-700 group-hover:text-slate-900"
                  }`}
                >
                  {model.name}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex-shrink-0">
                  {model.compatibleProducts} case {model.compatibleProducts === 1 ? "option" : "options"}
                </span>
              </button>
            );
          })}
          {filteredModels.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-400 py-6">
              No models match &quot;{query}&quot;.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          What type of device are you configuring?
        </h2>
        <p className="mt-2 text-slate-500 text-sm">
          Select your iPad line to see RedZone-compatible case options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deviceFamilies.map((family) => {
          const isSelected =
            activeFamilyId === family.id || findFamilyByModelId(selected)?.id === family.id;
          return (
            <button
              key={family.id}
              onClick={() => handleFamilyClick(family)}
              className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 outline-none ${
                isSelected
                  ? "bg-red-50/40 border-[#DB0032] shadow-md shadow-red-500/5 ring-1 ring-[#DB0032]/20"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-sm"
              }`}
            >
              {/* Decorative brand gradient corner */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#DB0032]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-2xl`}
              ></div>

              <div className="flex gap-4 items-start relative z-10">
                {/* Icon Container Frame */}
                <div
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? "bg-[#DB0032] text-white shadow-md shadow-[#DB0032]/20 scale-105"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
                  }`}
                >
                  {FAMILY_ICONS[family.id]}
                </div>

                {/* Text Content Area */}
                <div className="space-y-1">
                  <h3
                    className={`font-semibold text-base transition-colors duration-300 ${
                      isSelected ? "text-slate-950 font-bold" : "text-slate-800 group-hover:text-slate-900"
                    }`}
                  >
                    {family.name}
                  </h3>
                  <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                    isSelected ? "text-slate-700" : "text-slate-500"
                  }`}>
                    {family.description}
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
