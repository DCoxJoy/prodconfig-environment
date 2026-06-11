import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin duration-1000"></div>
        {/* Inner reverse spinner */}
        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-pink-500 border-b-transparent border-l-cyan-400 animate-spin duration-700 animate-reverse"></div>
        {/* Center core */}
        <div className="absolute inset-5 bg-slate-900 rounded-full shadow-inner flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse tracking-wide">
        Processing Request...
      </p>
    </div>
  );
}
