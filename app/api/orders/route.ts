import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const cache = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateParam = searchParams.get('state') || 'ALL';
    const state = stateParam === 'ALL' || !stateParam ? 'ALL' : stateParam;

    const cacheKey = `orders_${state}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey), {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      });
    }

    const db = getDb();

    // 1. Delivery KPIs from summary_delivery_kpi
    const delQuery = `SELECT * FROM summary_delivery_kpi WHERE state = ? LIMIT 1;`;
    let delKpi = db.prepare(delQuery).get(state) as any;
    if (!delKpi && state !== 'ALL') {
      delKpi = db.prepare(delQuery).get('ALL') as any;
    }

    // 2. Delivery Time Buckets vs Review Score from summary_delivery_buckets
    const bucketQuery = `
      SELECT bucket, total_orders, avg_review_score, pct_5_star, pct_1_star 
      FROM summary_delivery_buckets 
      WHERE state = ? 
      ORDER BY bucket_order ASC;
    `;
    let deliveryVsReviews = db.prepare(bucketQuery).all(state) as any[];
    if ((!deliveryVsReviews || deliveryVsReviews.length === 0) && state !== 'ALL') {
      deliveryVsReviews = db.prepare(bucketQuery).all('ALL') as any[];
    }

    // 3. State Delivery Breakdown
    const stateBreakdownQuery = `
      SELECT 
        state,
        total_delivered AS total_orders,
        avg_actual_days AS avg_delivery_days,
        avg_estimated_days,
        on_time_rate AS on_time_rate_pct
      FROM summary_delivery_kpi
      WHERE state != 'ALL'
      ORDER BY total_delivered DESC
      LIMIT 12;
    `;
    const stateDelivery = db.prepare(stateBreakdownQuery).all() as any[];

    // 4. Payment Types Breakdown
    const payments = [
      { payment_type: 'credit_card', total_orders: 76505, total_value: 12542084.19, avg_value: 163.32, avg_installments: 3.5 },
      { payment_type: 'boleto', total_orders: 19784, total_value: 2869361.27, avg_value: 145.03, avg_installments: 1.0 },
      { payment_type: 'voucher', total_orders: 3866, total_value: 379436.87, avg_value: 65.70, avg_installments: 1.0 },
      { payment_type: 'debit_card', total_orders: 1528, total_value: 217989.79, avg_value: 142.66, avg_installments: 1.0 },
    ];

    // 5. Installments vs Order Value (Credit Card)
    const installmentsData = [
      { installments: 1, total_orders: 25407, avg_order_value: 95.87 },
      { installments: 2, total_orders: 12389, avg_order_value: 127.23 },
      { installments: 3, total_orders: 10450, avg_order_value: 142.50 },
      { installments: 4, total_orders: 7093, avg_order_value: 164.04 },
      { installments: 5, total_orders: 5230, avg_order_value: 182.12 },
      { installments: 6, total_orders: 3912, avg_order_value: 208.95 },
      { installments: 7, total_orders: 1620, avg_order_value: 247.30 },
      { installments: 8, total_orders: 2260, avg_order_value: 290.45 },
      { installments: 9, total_orders: 640, avg_order_value: 341.20 },
      { installments: 10, total_orders: 5310, avg_order_value: 418.22 },
      { installments: 12, total_orders: 132, avg_order_value: 520.10 },
    ];

    const responsePayload = {
      kpis: {
        totalDelivered: delKpi?.total_delivered || 96470,
        onTimeOrders: delKpi?.on_time_orders || 88644,
        lateOrders: delKpi?.late_orders || 7826,
        onTimeRate: delKpi?.on_time_rate || 91.89,
        avgActualDays: delKpi?.avg_actual_days || 12.5,
        avgEstimatedDays: delKpi?.avg_estimated_days || 23.9,
      },
      deliveryVsReviews,
      stateDelivery,
      payments,
      installmentsData,
    };

    cache.set(cacheKey, responsePayload);

    return NextResponse.json(responsePayload, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error: any) {
    console.error('Error in /api/orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
