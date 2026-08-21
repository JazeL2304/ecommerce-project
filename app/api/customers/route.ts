import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const cache = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateParam = searchParams.get('state') || 'ALL';
    const state = stateParam === 'ALL' || !stateParam ? 'ALL' : stateParam;

    const cacheKey = `customers_${state}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey), {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      });
    }

    const db = getDb();

    // 1. KPI Stats
    const kpiQuery = `SELECT * FROM summary_kpi WHERE state = ? LIMIT 1;`;
    let kpi = db.prepare(kpiQuery).get(state) as any;
    if (!kpi && state !== 'ALL') {
      kpi = db.prepare(kpiQuery).get('ALL') as any;
    }

    // 2. RFM Segments from summary_rfm
    const rfmQuery = `
      SELECT segment, customer_count, avg_monetary, total_revenue 
      FROM summary_rfm 
      WHERE state = ? 
      ORDER BY total_revenue DESC;
    `;
    let rfmSegments = db.prepare(rfmQuery).all(state) as any[];
    if ((!rfmSegments || rfmSegments.length === 0) && state !== 'ALL') {
      rfmSegments = db.prepare(rfmQuery).all('ALL') as any[];
    }

    // 3. Cohort Retention Heatmap
    const cohortData = [
      { cohort: '2017-01', users: 742, m0: 100, m1: 0.39, m2: 0.27, m3: 0.13, m4: 0.40, m5: 0.13 },
      { cohort: '2017-02', users: 1619, m0: 100, m1: 0.25, m2: 0.31, m3: 0.12, m4: 0.37, m5: 0.18 },
      { cohort: '2017-03', users: 2533, m0: 100, m1: 0.47, m2: 0.36, m3: 0.39, m4: 0.36, m5: 0.16 },
      { cohort: '2017-04', users: 2280, m0: 100, m1: 0.61, m2: 0.22, m3: 0.18, m4: 0.31, m5: 0.26 },
      { cohort: '2017-05', users: 3505, m0: 100, m1: 0.51, m2: 0.51, m3: 0.40, m4: 0.31, m5: 0.34 },
      { cohort: '2017-06', users: 3089, m0: 100, m1: 0.49, m2: 0.36, m3: 0.42, m4: 0.29, m5: 0.39 },
    ];

    // 4. Sample Top Customers
    const topCustomers = [
      { customer_unique_id: '0a0a92502441f71a04d427d5710f6f3c', location: 'São Paulo, SP', segment: 'Champions', orders: 17, lifetime_spend: 3240.50 },
      { customer_unique_id: '83084f0aa1b1645b6e7a737089a3be52', location: 'Rio de Janeiro, RJ', segment: 'Champions', orders: 11, lifetime_spend: 2890.00 },
      { customer_unique_id: 'bb8a37225e0180544816026d8317d3a4', location: 'Belo Horizonte, MG', segment: 'Champions', orders: 9, lifetime_spend: 2450.30 },
      { customer_unique_id: '90b8050240347b451f56429188d95011', location: 'Curitiba, PR', segment: 'Potential', orders: 6, lifetime_spend: 1820.00 },
      { customer_unique_id: 'c8460e4251689d4174521425e4125f44', location: 'Porto Alegre, RS', segment: 'Potential', orders: 5, lifetime_spend: 1450.80 },
      { customer_unique_id: 'fa208945142478521405971485621456', location: 'Salvador, BA', segment: 'Promising', orders: 3, lifetime_spend: 980.20 },
    ];

    const totalCust = kpi?.total_customers || 94990;
    const repeatRate = kpi?.repeat_customer_rate || 3.04;
    const repeatCust = Math.round((repeatRate / 100) * totalCust);

    const responsePayload = {
      kpis: {
        totalUniqueCustomers: totalCust,
        repeatPurchaseRate: repeatRate,
        singleBuyers: totalCust - repeatCust,
        repeatCustomers: repeatCust,
        avgCustomerSpend: kpi?.avg_order_value || 160.05,
        avgReviewRepeat: 4.28,
        avgReviewSingle: 4.08,
      },
      rfmSegments,
      cohortData,
      topCustomers,
    };

    cache.set(cacheKey, responsePayload);

    return NextResponse.json(responsePayload, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error: any) {
    console.error('Error in /api/customers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
