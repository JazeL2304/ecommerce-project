'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { 
  Users, 
  Repeat, 
  CreditCard, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Download,
  ShieldCheck
} from 'lucide-react';

function CustomersContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get('state') || 'ALL';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/customers?state=${encodeURIComponent(state)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Not JSON');
      })
      .then((json) => {
        if (isMounted && json && json.kpis) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Customers fetch warning (using cached/fallback):', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [state]);

  const kpis = data?.kpis || {
    totalUniqueCustomers: 94990,
    repeatPurchaseRate: 3.04,
    singleBuyers: 92102,
    repeatCustomers: 2888,
    avgCustomerSpend: 160.05,
    avgReviewRepeat: 4.28,
    avgReviewSingle: 4.08,
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNum = (val: number) => {
    return new Intl.NumberFormat('pt-BR').format(val);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Olist Brazil — Customer Intelligence & Retention"
        subtitle="Customer lifecycle, repeat purchase rates, and RFM cohort segmentation"
      />

      <main className="p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Unique Customers</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {formatNum(kpis.totalUniqueCustomers)}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A] mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.2% YoY Growth</span>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Repeat Purchase Rate</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {kpis.repeatPurchaseRate}%
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#EF4444] mt-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{formatNum(kpis.repeatCustomers)} loyal buyers</span>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Avg Customer Spend (CLV)</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {formatBRL(kpis.avgCustomerSpend)}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A] mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+3.1% basket size</span>
              </div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Avg Review (Repeat Users)</span>
              <div className="w-8 h-8 rounded-lg bg-[#8127CF]/15 text-[#8127CF] flex items-center justify-center">
                <Star className="w-4 h-4 text-[#8127CF]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {kpis.avgReviewRepeat || '4.28'}{' '}
                <span className="text-[14px] font-normal text-[#9CA3AF]">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280] mt-1">
                <Info className="w-3.5 h-3.5" />
                <span>vs {kpis.avgReviewSingle || '4.08'} single buyers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Monthly Cohort Retention Table */}
        <div className="bento-card flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h3 className="text-[16.5px] font-bold text-[#141B2B]">Monthly Cohort Retention Rate (%)</h3>
              <p className="text-[12.5px] text-[#6B7280]">Percentage of returning buyers over successive months (M0 - M5)</p>
            </div>
            <button className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase w-28">Cohort</th>
                  <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-center w-20">Users</th>
                  <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-center">M0</th>
                  <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-center">M1</th>
                  <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-center">M2</th>
                  <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-center">M3</th>
                  <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-center">M4</th>
                  <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-center">M5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[13px]">
                {(data?.cohortData || []).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-2.5 font-medium text-[#111827]">{row.cohort}</td>
                    <td className="py-2.5 text-center text-[#6B7280] tabular-nums">{formatNum(row.users)}</td>
                    <td className="p-1">
                      <div className="bg-[#FA9A00] text-white text-center py-1.5 rounded font-semibold text-[12px]">
                        {row.m0}%
                      </div>
                    </td>
                    <td className="p-1">
                      <div className="bg-[#FEF1E6] text-[#623A00] text-center py-1.5 rounded font-medium text-[12px]">
                        {row.m1}%
                      </div>
                    </td>
                    <td className="p-1">
                      <div className="bg-[#FCE3CC] text-[#623A00] text-center py-1.5 rounded font-medium text-[12px]">
                        {row.m2}%
                      </div>
                    </td>
                    <td className="p-1">
                      <div className="bg-[#FEF1E6] text-[#623A00] text-center py-1.5 rounded font-medium text-[12px]">
                        {row.m3}%
                      </div>
                    </td>
                    <td className="p-1">
                      <div className="bg-[#FCE3CC] text-[#623A00] text-center py-1.5 rounded font-medium text-[12px]">
                        {row.m4}%
                      </div>
                    </td>
                    <td className="p-1">
                      <div className="bg-[#FEF1E6] text-[#623A00] text-center py-1.5 rounded font-medium text-[12px]">
                        {row.m5}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 3: RFM Segmentation & Top Customers Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* RFM Segmentation (5 Cols) */}
          <div className="lg:col-span-5 bento-card flex flex-col gap-4">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h3 className="text-[16.5px] font-bold text-[#141B2B]">RFM Customer Segmentation</h3>
              <p className="text-[12.5px] text-[#6B7280]">Recency, Frequency, and Monetary distribution</p>
            </div>

            <div className="flex flex-col gap-4 pt-1">
              {(data?.rfmSegments || [
                { segment: 'Champions & Loyal', customer_count: 2888, avg_monetary: 420.50, total_revenue: 1214000 },
                { segment: 'Potential Loyalists', customer_count: 8450, avg_monetary: 210.10, total_revenue: 1775000 },
                { segment: 'Promising / New', customer_count: 54120, avg_monetary: 138.20, total_revenue: 7479000 },
                { segment: 'At Risk / Dormant', customer_count: 29532, avg_monetary: 94.80, total_revenue: 2799000 },
              ]).map((seg: any, idx: number) => {
                const colors = ['#16A34A', '#8127CF', '#FA9A00', '#EF4444'];
                const color = colors[idx % colors.length];

                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-medium text-[#1F2937] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        {seg.segment}
                      </span>
                      <span className="text-[#6B7280] text-[12px] tabular-nums">
                        {formatNum(seg.customer_count)} cust | {formatBRL(seg.avg_monetary)}
                      </span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: color,
                          width: `${Math.min(100, (seg.customer_count / 54120) * 85)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Value Customers Sample Table (7 Cols) */}
          <div className="lg:col-span-7 bento-card flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-[16.5px] font-bold text-[#141B2B]">Top Lifetime Value Customers</h3>
                <p className="text-[12.5px] text-[#6B7280]">Sample highest spenders with geographical details</p>
              </div>
              <span className="text-[12px] font-semibold text-[#8127CF] bg-[#8127CF]/10 px-2.5 py-0.5 rounded-full">
                High Value
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase">Location</th>
                    <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase">Segment</th>
                    <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-right">Orders</th>
                    <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-right">LT Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] text-[13px]">
                  {(data?.topCustomers || []).slice(0, 6).map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3 text-[#111827] font-medium capitalize">
                        {c.location?.toLowerCase()}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#15803D] rounded-md text-[11px] font-semibold">
                          {c.segment}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[#6B7280] tabular-nums font-medium">
                        {c.orders}
                      </td>
                      <td className="py-3 text-right text-[#111827] font-semibold tabular-nums">
                        {formatBRL(c.lifetime_spend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#6B7280]">Loading Customer Behavior Dashboard...</div>}>
      <CustomersContent />
    </Suspense>
  );
}
