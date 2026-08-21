'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Calendar, Filter, Sparkles } from 'lucide-react';
import AIAdvisorModal from './AIAdvisorModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  availableStates?: string[];
}

function HeaderContent({ title, subtitle, availableStates = [] }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentState = searchParams.get('state') || 'ALL';
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newState === 'ALL') {
      params.delete('state');
    } else {
      params.set('state', newState);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20 px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[20px] text-[#141B2B] tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Date Range Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151]">
            <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>2016-09-04 — 2018-10-17</span>
          </div>

          {/* State Filter Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151]">
            <Filter className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="text-[#6B7280]">State:</span>
            <select
              value={currentState}
              onChange={handleStateChange}
              className="bg-transparent text-[#111827] font-medium text-[13px] outline-none cursor-pointer"
            >
              <option value="ALL">All States (Brazil)</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* AI Insights Action Button */}
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8127CF] hover:bg-[#6D20B0] text-white rounded-lg text-[13px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive Advisor</span>
          </button>
        </div>
      </header>

      {/* AI Advisor Modal */}
      <AIAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentPage={pathname}
        currentState={currentState}
      />
    </>
  );
}

export default function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b border-[#E5E7EB]" />}>
      <HeaderContent {...props} />
    </Suspense>
  );
}
