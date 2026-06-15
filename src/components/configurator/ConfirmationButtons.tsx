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
        className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DB0032]/20"
      >
        Contact Sales
      </button>

      {/* Purchase Now Button */}
      <button
        onClick={onPurchaseNowClick}
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold bg-[#DB0032] hover:bg-[#b8002a] text-white shadow-md shadow-[#DB0032]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#DB0032]"
      >
        {loading ? "Processing..." : "Purchase Now"}
      </button>

      {/* Glassmorphic Contact Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all duration-300">
            {/* Ambient Background Branded Glow */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#DB0032]/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-slate-200/50 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Contact Sales
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-semibold text-slate-600 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 text-sm placeholder-slate-400 outline-none transition-all duration-200 ${
                      errors.firstName ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DB0032] focus:ring-1 focus:ring-[#DB0032]"
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <span className="text-[10px] text-red-600 font-medium mt-1 block">{errors.firstName}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 text-sm placeholder-slate-400 outline-none transition-all duration-200 ${
                      errors.lastName ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DB0032] focus:ring-1 focus:ring-[#DB0032]"
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <span className="text-[10px] text-red-600 font-medium mt-1 block">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Business Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 text-sm placeholder-slate-400 outline-none transition-all duration-200 ${
                    errors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DB0032] focus:ring-1 focus:ring-[#DB0032]"
                  }`}
                  placeholder="john.doe@company.com"
                />
                {errors.email && (
                  <span className="text-[10px] text-red-600 font-medium mt-1 block">{errors.email}</span>
                )}
              </div>

              <div>
                <label htmlFor="company" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 text-sm placeholder-slate-400 outline-none transition-all duration-200 ${
                    errors.company ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-[#DB0032] focus:ring-1 focus:ring-[#DB0032]"
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
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#DB0032] hover:bg-[#b8002a] text-white shadow-md shadow-[#DB0032]/10 transition-all"
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
