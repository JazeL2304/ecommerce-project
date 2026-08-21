'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, Truck, Sparkles, BarChart3 } from 'lucide-react';
import AIAdvisorModal from './AIAdvisorModal';

const NAV_ITEMS = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/customers', label: 'Customer Behavior', icon: Users },
  { href: '/products', label: 'Product Performance', icon: Package },
  { href: '/orders', label: 'Orders & Delivery', icon: Truck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <>
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col h-screen fixed left-0 top-0 z-30 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FA9A00] flex items-center justify-center text-white shadow-sm font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-[17px] text-[#141B2B] leading-tight">Olist Executive</h1>
              <p className="text-[12px] font-medium text-[#6B7280]">Brazil Operations</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
          <div className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase px-3 mb-1">
            Analytics Pages
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/overview');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#FA9A00]/15 text-[#885200] font-semibold shadow-xs border border-[#FA9A00]/30'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#885200]' : 'text-[#6B7280]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Banner - Clickable AI Advisor */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="w-full text-left bg-[#F9F5FF] hover:bg-[#F3E8FF] border border-[#E9D5FF] p-3.5 rounded-xl flex flex-col gap-2 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-[#8127CF] font-semibold text-[12.5px]">
                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>AI Executive Advisor</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#8127CF]/10 text-[#8127CF] font-bold uppercase">
                Open
              </span>
            </div>
            <p className="text-[11.5px] text-[#6B7280] leading-relaxed">
              Klik untuk simulasi strategi & analisis real-time dari 99.4k data.
            </p>
          </button>
        </div>
      </aside>

      {/* AI Advisor Modal */}
      <AIAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentPage={pathname}
      />
    </>
  );
}
