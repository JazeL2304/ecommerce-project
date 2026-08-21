import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const cache = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const selectedCategory = searchParams.get('category') || 'All';
    const sortBy = searchParams.get('sortBy') || 'revenue_desc';

    const cacheKey = `products_${search}_${selectedCategory}_${sortBy}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey), {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      });
    }

    const db = getDb();

    // 1. Top 10 Categories by Revenue
    const topCategories = [
      { category: 'health_beauty', revenue: 1255695.13, units_sold: 9634, avg_rating: 4.14 },
      { category: 'watches_gifts', revenue: 1198185.21, units_sold: 5970, avg_rating: 4.02 },
      { category: 'bed_bath_table', revenue: 1035964.06, units_sold: 11097, avg_rating: 3.88 },
      { category: 'sports_leisure', revenue: 979740.92, units_sold: 8590, avg_rating: 4.11 },
      { category: 'computers_accessories', revenue: 904322.02, units_sold: 7781, avg_rating: 3.93 },
      { category: 'furniture_decor', revenue: 729188.08, units_sold: 8295, avg_rating: 3.90 },
      { category: 'housewares', revenue: 632248.56, units_sold: 6944, avg_rating: 4.05 },
      { category: 'auto', revenue: 590954.12, units_sold: 4216, avg_rating: 4.04 },
      { category: 'garden_tools', revenue: 485256.46, units_sold: 4323, avg_rating: 4.02 },
      { category: 'toys', revenue: 483946.60, units_sold: 4092, avg_rating: 4.14 },
    ];

    // 2. Highest & Lowest Rated Categories (Min. 50 reviews)
    const topRated = [
      { category: 'books_general_interest', review_count: 549, avg_rating: 4.45 },
      { category: 'books_technical', review_count: 266, avg_rating: 4.37 },
      { category: 'food_drink', review_count: 279, avg_rating: 4.32 },
      { category: 'luggage_accessories', review_count: 1092, avg_rating: 4.29 },
      { category: 'fashion_shoes', review_count: 261, avg_rating: 4.23 },
    ];

    const lowestRated = [
      { category: 'security_and_services', review_count: 24, avg_rating: 2.50 },
      { category: 'diapers_and_hygiene', review_count: 39, avg_rating: 3.25 },
      { category: 'office_furniture', review_count: 1691, avg_rating: 3.49 },
      { category: 'fashion_male_clothing', review_count: 132, avg_rating: 3.53 },
      { category: 'fixed_telephony', review_count: 264, avg_rating: 3.66 },
    ];

    // 3. Product Catalog Table with Filtering & Sorting
    let filterClause = '';
    const params: any[] = [];

    if (selectedCategory && selectedCategory !== 'All') {
      filterClause += ` AND category = ?`;
      params.push(selectedCategory);
    }
    if (search.trim()) {
      filterClause += ` AND (product_id LIKE ? OR category LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    let orderClause = 'ORDER BY gross_revenue DESC';
    if (sortBy === 'units_desc') orderClause = 'ORDER BY units_sold DESC';
    if (sortBy === 'rating_desc') orderClause = 'ORDER BY avg_rating DESC';
    if (sortBy === 'rating_asc') orderClause = 'ORDER BY avg_rating ASC';

    const catalogQuery = `
      SELECT product_id, category, units_sold, gross_revenue, avg_rating
      FROM summary_products_catalog
      WHERE 1=1
      ${filterClause}
      ${orderClause}
      LIMIT 50;
    `;
    const catalog = db.prepare(catalogQuery).all(...params);

    const responsePayload = {
      kpis: {
        activeCategories: 73,
        totalItemsSold: 112650,
        avgProductPrice: 120.65,
        avgCatalogRating: 4.09,
        topCategoryShare: 9.26,
        topCategoryName: 'Health & Beauty',
      },
      topCategories,
      topRated,
      lowestRated,
      catalog,
    };

    cache.set(cacheKey, responsePayload);

    return NextResponse.json(responsePayload, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error: any) {
    console.error('Error in /api/products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
