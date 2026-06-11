"use client";

import React from "react";
import { Bundle } from "../../types";

interface BundleDisplayProps {
  bundle: Bundle;
  children: React.ReactNode;
}

export default function BundleDisplay({ bundle, children }: BundleDisplayProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 20.062 3.745 3.745 0 016.704 19a3.745 3.745 0 01-1.043-3.296 3.745 3.745 0 01-3.296-1.043A3.745 3.745 0 014.063 12 3.745 3.745 0 013 8.704a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0110 3.938a3.745 3.745 0 013.296 1.043 3.745 3.745 0 013.296-1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0120 12z" />
          </svg>
          Recommended Configuration
        </div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-100 bg-clip-text text-transparent">
          {bundle.name}
        </h2>
        <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
          {bundle.description}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bundle.products.map((product) => (
          <div
            key={product.sku}
            className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden hover:border-slate-700 transition-all duration-300"
          >
            {/* Visual Image Placeholder with Tailwind Gradients */}
            <div className="h-40 bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-slate-950/60 flex items-center justify-center border-b border-slate-800/60 relative group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
              {/* Product Shape Sketch (CSS/SVG) */}
              <div className="w-16 h-16 rounded-xl bg-slate-800/70 flex items-center justify-center border border-slate-700 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-300 shadow-inner">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </div>
            </div>

            {/* Product details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  {product.sku}
                </span>
                <h4 className="font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                  {product.name}
                </h4>
              </div>
              <div className="text-lg font-bold text-slate-100">
                ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Box & Confirmation path */}
      <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/10 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Total Package Price
          </div>
          <div className="text-3xl font-black text-slate-50 tracking-tight mt-1">
            ${bundle.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Includes bundle discount and base setup services.
          </p>
        </div>

        {/* Action Buttons passed as children */}
        <div className="flex-shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}
