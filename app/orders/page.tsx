'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  CreditCard,
  Star
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function OrdersContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get('state') || 'ALL';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/orders?state=${encodeURIComponent(state)}`)
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
        console.warn('Orders fetch warning (using cached/fallback):', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [state]);

  const kpis = data?.kpis || {
    totalDelivered: 96470,
    onTimeOrders: 88644,
    lateOrders: 7826,
    onTimeRate: 91.89,
    avgActualDays: 12.5,
    avgEstimatedDays: 23.9,
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
        title="Olist Brazil — Orders, Logistics & Payment Analytics"
        subtitle="Delivery SLAs, transit duration impact on CSAT, and payment methods"
      />

      <main className="p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Delivered Orders</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {formatNum(kpis.totalDelivered)}
              </div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-1">
                97.0% fulfillment rate
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">On-Time Delivery Rate</span>
              <div className="w-8 h-8 rounded-lg bg-[#16A34A]/15 text-[#16A34A] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {kpis.onTimeRate}%
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A] mt-1">
                <span>{formatNum(kpis.onTimeOrders)} on-time packages</span>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Avg Delivery Duration</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {kpis.avgActualDays} Days
              </div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-1">
                Estimated window: {kpis.avgEstimatedDays} Days
              </div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Late Deliveries</span>
              <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {formatNum(kpis.lateOrders)}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#EF4444] mt-1">
                <span>{(100 - kpis.onTimeRate).toFixed(2)}% delay rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Delivery Duration vs Customer Satisfaction (Review Score) */}
        <div className="bento-card flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-3">
            <div>
              <h2 className="text-[17px] font-bold text-[#141B2B]">Impact of Delivery Duration on Review Score</h2>
              <p className="text-[12.5px] text-[#6B7280]">Direct correlation between delivery lead time (days) and customer satisfaction (CSAT)</p>
            </div>
            <span className="text-[12px] font-semibold text-[#EF4444] bg-[#FEE2E2] px-2.5 py-0.5 rounded-full">
              Critical Business SLA
            </span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.deliveryVsReviews || []} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: '#374151' }} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
                <Tooltip 
                  formatter={(val: any, name: any) => [
                    `${val} / 5.0 Rating`,
                    'Avg Review Score'
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                />
                <Bar dataKey="avg_review_score" fill="#FA9A00" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-[#E5E7EB] text-center text-[12px]">
            {(data?.deliveryVsReviews || []).map((b: any, idx: number) => (
              <div key={idx} className="p-2 bg-[#F9FAFB] rounded-lg">
                <div className="text-[#6B7280] font-medium">{b.bucket}</div>
                <div className="font-bold text-[#111827] text-[14px] mt-0.5">★ {b.avg_review_score}</div>
                <div className="text-[11px] text-[#16A34A]">{b.pct_5_star}% 5-star</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: State Delivery Performance Table & Payment Installment Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* State Delivery SLAs (7 Cols) */}
          <div className="lg:col-span-7 bento-card flex flex-col gap-4">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h3 className="text-[16.5px] font-bold text-[#141B2B]">Delivery SLA by State (Top 12)</h3>
              <p className="text-[12.5px] text-[#6B7280]">Average delivery duration and on-time reliability per state</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase">State</th>
                    <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-right">Orders</th>
                    <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-right">Avg Days</th>
                    <th className="py-2.5 text-[12px] font-semibold text-[#6B7280] uppercase text-right">On-Time %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] text-[13px]">
                  {(data?.stateDelivery || []).map((st: any, idx: number) => {
                    const isOnTimeHigh = st.on_time_rate_pct >= 90;

                    return (
                      <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-2.5 font-bold text-[#111827]">{st.state}</td>
                        <td className="py-2.5 text-right text-[#6B7280] tabular-nums">
                          {formatNum(st.total_orders)}
                        </td>
                        <td className="py-2.5 text-right font-medium text-[#111827] tabular-nums">
                          {st.avg_delivery_days} d
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          <span
                            className={`font-semibold ${
                              isOnTimeHigh ? 'text-[#15803D]' : 'text-[#DC2626]'
                            }`}
                          >
                            {st.on_time_rate_pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods & Installments (5 Cols) */}
          <div className="lg:col-span-5 bento-card flex flex-col gap-4">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h3 className="text-[16.5px] font-bold text-[#141B2B]">Payment Methods & Installments</h3>
              <p className="text-[12.5px] text-[#6B7280]">Installment count impact on average order value</p>
            </div>

            {/* Payment Types list */}
            <div className="flex flex-col gap-2">
              {(data?.payments || []).map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[#F9FAFB] text-[13px]">
                  <span className="font-medium text-[#1F2937] capitalize flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#885200]" />
                    {p.payment_type?.replace(/_/g, ' ')}
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-[#111827] tabular-nums">{formatBRL(p.total_value)}</div>
                    <div className="text-[11px] text-[#6B7280]">{formatNum(p.total_orders)} orders</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Installments Trend */}
            <div className="mt-2 pt-3 border-t border-[#E5E7EB]">
              <div className="text-[13px] font-semibold text-[#141B2B] mb-2">
                Order Value by Installments (Credit Card)
              </div>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.installmentsData || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="installments" tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => `R$ ${v}`} />
                    <Tooltip 
                      formatter={(v: any) => [formatBRL(Number(v)), 'Avg Order Value']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="avg_order_value" stroke="#8127CF" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#6B7280]">Loading Orders & Delivery Dashboard...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
