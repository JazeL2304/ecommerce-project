'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Star,
  ArrowUpRight,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

function OverviewContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get('state') || 'ALL';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/overview?state=${encodeURIComponent(state)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Not JSON');
      })
      .then((json) => {
        if (isMounted && json && json.kpi) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Overview fetch warning (using cached/fallback):', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [state]);

  const kpis = data?.kpi || {
    totalRevenue: 13591644,
    totalOrders: 99441,
    totalCustomers: 94990,
    avgOrderValue: 136.68,
    repeatCustomerRate: 3.04,
    avgReviewScore: 4.09,
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNum = (val: number) => {
    return new Intl.NumberFormat('pt-BR').format(val);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Olist Brazil — E-Commerce Performance Dashboard"
        subtitle="Real-time operations & marketplace health summary"
        availableStates={data?.availableStates || ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'GO', 'ES']}
      />

      <main className="p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {formatBRL(kpis.totalRevenue)}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A] mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% YoY Growth</span>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Total Orders</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {formatNum(kpis.totalOrders)}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A] mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.2% vs target</span>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Average Order Value</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {formatBRL(kpis.avgOrderValue)}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A] mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.8% basket size</span>
              </div>
            </div>
          </div>

          {/* Repeat Customer Rate */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Repeat Customer Rate</span>
              <div className="w-8 h-8 rounded-lg bg-[#8127CF]/15 text-[#8127CF] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {kpis.repeatCustomerRate}%
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280] mt-1">
                <span>Avg Rating: {kpis.avgReviewScore} / 5.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Chart: Monthly Sales & Order Velocity */}
        <div className="bento-card flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-[17px] font-bold text-[#141B2B]">Sales & Order Velocity (2017 – 2018)</h2>
              <p className="text-[12.5px] text-[#6B7280]">Monthly transaction volume and gross GMV progression</p>
            </div>
            <div className="flex items-center gap-4 text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FA9A00]"></span>
                <span className="text-[#374151] font-medium">Revenue (R$)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8127CF]"></span>
                <span className="text-[#374151] font-medium">Order Count</span>
              </div>
            </div>
          </div>

          <div className="h-[340px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.monthlyTrend || [
                { month: '2017-01', orders: 787, revenue: 136943.46 },
                { month: '2017-02', orders: 1718, revenue: 283561.69 },
                { month: '2017-03', orders: 2617, revenue: 425617.96 },
                { month: '2017-04', orders: 2377, revenue: 405848.61 },
                { month: '2017-05', orders: 3640, revenue: 582710.83 },
                { month: '2017-06', orders: 3205, revenue: 499652.24 },
                { month: '2017-07', orders: 3946, revenue: 578753.73 },
                { month: '2017-08', orders: 4272, revenue: 661903.52 },
                { month: '2017-09', orders: 4227, revenue: 717102.72 },
                { month: '2017-10', orders: 4547, revenue: 764756.03 },
                { month: '2017-11', orders: 7421, revenue: 1172191.68 },
                { month: '2017-12', orders: 5618, revenue: 861526.77 },
                { month: '2018-01', orders: 7187, revenue: 1101920.01 },
                { month: '2018-02', orders: 6624, revenue: 979486.16 },
                { month: '2018-03', orders: 7168, revenue: 1152656.99 },
                { month: '2018-04', orders: 6919, revenue: 1156248.89 },
                { month: '2018-05', orders: 6833, revenue: 1145686.46 },
                { month: '2018-06', orders: 6145, revenue: 1020381.90 },
                { month: '2018-07', orders: 6233, revenue: 1039783.58 },
                { month: '2018-08', orders: 6421, revenue: 996973.51 }
              ]} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#6B7280' }} 
                  axisLine={{ stroke: '#E5E7EB' }} 
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 11, fill: '#6B7280' }} 
                  axisLine={{ stroke: '#E5E7EB' }} 
                  tickLine={false}
                  tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 11, fill: '#8127CF' }} 
                  axisLine={{ stroke: '#E5E7EB' }} 
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatBRL(Number(value)) : `${Number(value).toLocaleString()} orders`,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#FA9A00" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#8127CF" strokeWidth={3} dot={{ r: 3, fill: '#8127CF' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Row: Top Categories & Regional Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Categories */}
          <div className="bento-card flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-[16px] font-bold text-[#141B2B]">Top 5 Product Categories</h3>
              <span className="text-[12px] font-medium text-[#FA9A00] bg-[#FA9A00]/10 px-2.5 py-0.5 rounded-full">
                By Revenue
              </span>
            </div>

            <div className="flex flex-col gap-4 pt-1">
              {(data?.topCategories || []).map((cat: any, idx: number) => {
                const maxRev = data?.topCategories?.[0]?.revenue || 1;
                const pct = Math.min(100, Math.round((cat.revenue / maxRev) * 100));

                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-medium text-[#1F2937] capitalize">
                        {cat.category?.replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold text-[#111827] tabular-nums">
                        {formatBRL(cat.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#FA9A00] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="bento-card flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-[16px] font-bold text-[#141B2B]">Regional Customer Distribution</h3>
              <span className="text-[12px] font-medium text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-0.5 rounded-full">
                Top States
              </span>
            </div>

            <div className="flex flex-col gap-4 pt-1">
              {(data?.topStates || []).map((st: any, idx: number) => {
                const totalCust = kpis.totalCustomers || 94990;
                const pct = ((st.customer_count / totalCust) * 100).toFixed(1);

                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-medium text-[#1F2937]">
                        {st.state} — State
                      </span>
                      <span className="text-[#6B7280] text-[12.5px] tabular-nums">
                        <strong className="text-[#111827]">{formatNum(st.customer_count)}</strong> ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#16A34A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, parseFloat(pct) * 2.2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#6B7280]">Loading Overview Dashboard...</div>}>
      <OverviewContent />
    </Suspense>
  );
}
