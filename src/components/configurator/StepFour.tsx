"use client";

import React from "react";

interface Option {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface StepFourProps {
  selected: string;
  onChange: (value: string) => void;
}

export default function StepFour({ selected, onChange }: StepFourProps) {
  const options: Option[] = [
    {
      id: "operations_manager",
      title: "Operations / Operations Manager",
      description: "Responsible for daily facility workflows, resource scheduling, and throughput efficiency.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.771m.94 3.197a5.971 5.971 0 00-.94 3.198M12 10a3 3 0 110-6 3 3 0 010 6zm0 0a3 3 0 100-6 3 3 0 000 6zm5.83 5.378a3 3 0 11-3.07-5.045 3 3 0 013.07 5.045zm-11.66 0a3 3 0 10-3.07-5.045 3 3 0 003.07 5.045z" />
        </svg>
      ),
    },
    {
      id: "it_director",
      title: "IT Director / Systems Admin",
      description: "Handles device fleet provisioning, MDM configuration, network security, and app deployments.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3V5.25a3 3 0 013-3h13.5a3 3 0 013 3v6a3 3 0 01-3 3m-13.5 0v3a3 3 0 003 3h13.5a3 3 0 003-3v-3M12 17.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      id: "field_supervisor",
      title: "Field Supervisor / Team Lead",
      description: "Directs dispatch, coordinates on-site teams, performs inspections, and reports to operations.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      id: "procurement_officer",
      title: "Procurement / Purchasing Agent",
      description: "Manages hardware budgets, supplier relations, bulk device leasing, and contract negotiations.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.2 0 .75.75 0 011.2 0zm12.75 0a.75.75 0 11-1.2 0 .75.75 0 011.2 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-100 bg-clip-text text-transparent">
          What is your Job Title / Position?
        </h2>
        <p className="mt-2 text-slate-400 text-sm">
          This helps us customize our setup support and integration guides for your specific role.
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
