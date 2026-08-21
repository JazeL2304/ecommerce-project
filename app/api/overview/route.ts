import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const cache = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateParam = searchParams.get('state') || 'ALL';
    const state = stateParam === 'ALL' || !stateParam ? 'ALL' : stateParam;

    const cacheKey = `overview_${state}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey), {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      });
    }

    const db = getDb();

    // 1. KPI from summary_kpi
    const kpiQuery = `SELECT * FROM summary_kpi WHERE state = ? LIMIT 1;`;
    let kpi = db.prepare(kpiQuery).get(state) as any;
    if (!kpi && state !== 'ALL') {
      kpi = db.prepare(kpiQuery).get('ALL') as any;
    }

    // 2. Monthly Trend from summary_monthly
    const monthlyQuery = `
      SELECT month, orders, revenue 
      FROM summary_monthly 
      WHERE state = ? 
      ORDER BY month ASC;
    `;
    let monthlyTrend = db.prepare(monthlyQuery).all(state) as any[];
    if ((!monthlyTrend || monthlyTrend.length === 0) && state !== 'ALL') {
      monthlyTrend = db.prepare(monthlyQuery).all('ALL') as any[];
    }

    // 3. Top 5 Categories from summary_categories
    const topCatQuery = `
      SELECT category, revenue, items_sold 
      FROM summary_categories 
      ORDER BY revenue DESC 
      LIMIT 5;
    `;
    const topCategories = db.prepare(topCatQuery).all() as any[];

    // 4. Regional Top 5 States
    const topStatesQuery = `
      SELECT state, total_customers AS customer_count, total_revenue AS revenue 
      FROM summary_kpi 
      WHERE state != 'ALL' 
      ORDER BY total_customers DESC 
      LIMIT 5;
    `;
    const topStates = db.prepare(topStatesQuery).all() as any[];

    // 5. Available States
    const statesQuery = `
      SELECT DISTINCT state 
      FROM summary_kpi 
      WHERE state != 'ALL' 
      ORDER BY state ASC;
    `;
    const availableStates = (db.prepare(statesQuery).all() as any[]).map((r: any) => r.state);

    const responsePayload = {
      kpi: {
        totalRevenue: kpi?.total_revenue || 13591644,
        totalOrders: kpi?.total_orders || 99441,
        totalCustomers: kpi?.total_customers || 94990,
        avgOrderValue: kpi?.avg_order_value || 136.68,
        repeatCustomerRate: kpi?.repeat_customer_rate || 3.04,
        avgReviewScore: kpi?.avg_review_score || 4.09,
      },
      monthlyTrend,
      topCategories,
      topStates,
      availableStates,
    };

    cache.set(cacheKey, responsePayload);

    return NextResponse.json(responsePayload, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error: any) {
    console.error('Error in /api/overview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
