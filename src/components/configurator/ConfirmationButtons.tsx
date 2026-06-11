"use client";

import React, { useState } from "react";
import { ContactInfo } from "../../types";

interface ConfirmationButtonsProps {
  onContactSalesSubmit: (contactInfo: ContactInfo) => void;
  onPurchaseNowClick: () => void;
  loading: boolean;
}

export default function ConfirmationButtons({
  onContactSalesSubmit,
  onPurchaseNowClick,
  loading,
}: ConfirmationButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
  });
  const [errors, setErrors] = useState<Partial<ContactInfo>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactInfo]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ContactInfo> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.company.trim()) newErrors.company = "Company is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onContactSalesSubmit(formData);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      {/* Contact Sales Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 hover:border-slate-600 text-slate-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        Contact Sales
      </button>

      {/* Purchase Now Button */}
      <button
        onClick={onPurchaseNowClick}
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {loading ? "Processing..." : "Purchase Now"}
      </button>

      {/* Glassmorphic Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl transition-all duration-300">
            {/* Background Glow */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-100 bg-clip-text text-transparent">
                Contact Sales
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-semibold text-slate-400 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-900/60 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-300 ${
                      errors.firstName ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <span className="text-[10px] text-red-400 font-medium mt-1 block">{errors.firstName}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-900/60 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-300 ${
                      errors.lastName ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <span className="text-[10px] text-red-400 font-medium mt-1 block">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Business Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-900/60 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-300 ${
                    errors.email ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                  placeholder="john.doe@company.com"
                />
                {errors.email && (
                  <span className="text-[10px] text-red-400 font-medium mt-1 block">{errors.email}</span>
                )}
              </div>

              <div>
                <label htmlFor="company" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-900/60 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-300 ${
                    errors.company ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                  placeholder="Acme Corp"
                />
                {errors.company && (
                  <span className="text-[10px] text-red-400 font-medium mt-1 block">{errors.company}</span>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
