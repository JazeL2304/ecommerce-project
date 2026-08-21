'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Header from '@/components/Header';
import { 
  Package, 
  PieChart, 
  DollarSign, 
  Star, 
  Search, 
  TrendingUp, 
  Download,
  AlertTriangle,
  Award
} from 'lucide-react';

function ProductsContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('revenue_desc');

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    params.set('sortBy', sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Not JSON');
      })
      .then((json) => {
        if (json && json.kpis) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Products fetch warning (using cached/fallback):', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const kpis = data?.kpis || {
    activeCategories: 73,
    topCategoryShare: 9.26,
    topCategoryName: 'Health & Beauty',
    avgProductPrice: 120.65,
    avgCatalogRating: 4.09,
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

  const FILTER_CATEGORIES = ['All', 'health_beauty', 'watches_gifts', 'bed_bath_table', 'sports_leisure', 'computers_accessories'];

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Olist Brazil — Product & Category Analytics"
        subtitle="Catalog performance, revenue concentration, and customer review scores"
      />

      <main className="p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Active Categories</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {kpis.activeCategories} Categories
              </div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-1">
                99.441 items sold
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Top Category Share</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {kpis.topCategoryShare}%
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280] mt-1">
                <span className="w-2 h-2 rounded-full bg-[#FA9A00]"></span>
                <span className="capitalize">{kpis.topCategoryName?.replace(/_/g, ' ')} leads</span>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Avg Product Price</span>
              <div className="w-8 h-8 rounded-lg bg-[#FA9A00]/15 text-[#885200] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {formatBRL(kpis.avgProductPrice)}
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A] mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+2.1% YoY</span>
              </div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7280]">
              <span className="text-[13px] font-medium">Avg Catalog Rating</span>
              <div className="w-8 h-8 rounded-lg bg-[#8127CF]/15 text-[#8127CF] flex items-center justify-center">
                <Star className="w-4 h-4 text-[#8127CF]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[26px] font-bold text-[#141B2B] tracking-tight tabular-nums">
                {kpis.avgCatalogRating}{' '}
                <span className="text-[14px] font-normal text-[#9CA3AF]">/ 5.0</span>
              </div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-1">
                77% rated 4-5 stars
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Revenue by Top Categories Horizontal Chart */}
        <div className="bento-card flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h2 className="text-[17px] font-bold text-[#141B2B]">Revenue by Top Product Categories (R$)</h2>
              <p className="text-[12.5px] text-[#6B7280]">Leading categories by gross merchandise volume</p>
            </div>
            <button className="p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5 pt-2">
            {(data?.topCategories || []).slice(0, 8).map((cat: any, idx: number) => {
              const maxVal = data?.topCategories?.[0]?.revenue || 1255695;
              const pct = Math.max(8, Math.round((cat.revenue / maxVal) * 100));

              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-44 text-right text-[13px] font-medium text-[#374151] truncate capitalize">
                    {cat.category?.replace(/_/g, ' ')}
                  </div>
                  <div className="flex-1 flex items-center">
                    <div
                      className="bg-[#FA9A00] h-7 rounded-r-md flex items-center justify-end pr-3 text-white text-[11.5px] font-semibold transition-all duration-500 min-w-[75px]"
                      style={{ width: `${pct}%` }}
                    >
                      {formatBRL(cat.revenue)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 3: Highest vs Lowest Rated Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Rated */}
          <div className="bento-card flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 text-[#16A34A]">
              <Award className="w-5 h-5" />
              <h3 className="text-[16px] font-bold text-[#141B2B]">Top 5 Highest Rated Categories</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {(data?.topRated || []).map((cat: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[13px]">
                  <span className="font-medium text-[#166534] capitalize">{cat.category?.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B7280] text-[12px]">({cat.review_count} reviews)</span>
                    <span className="font-bold text-[#15803D] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#15803D]" />
                      {cat.avg_rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lowest Rated */}
          <div className="bento-card flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 text-[#EF4444]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-[16px] font-bold text-[#141B2B]">Top 5 Lowest Rated Categories</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {(data?.lowestRated || []).map((cat: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2] text-[13px]">
                  <span className="font-medium text-[#991B1B] capitalize">{cat.category?.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B7280] text-[12px]">({cat.review_count} reviews)</span>
                    <span className="font-bold text-[#DC2626] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#DC2626]" />
                      {cat.avg_rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Catalog Table with Live Search and Filters */}
        <div className="bento-card flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5E7EB] pb-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search product ID or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[13px] outline-none focus:border-[#FA9A00] focus:ring-1 focus:ring-[#FA9A00]"
                />
              </form>

              {/* Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
                {FILTER_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#141B2B] text-white'
                        : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {cat === 'All' ? 'All' : cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end text-[13px]">
              <span className="text-[#6B7280]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-[#E5E7EB] rounded-lg px-3 py-1.5 bg-white text-[#111827] outline-none text-[13px] cursor-pointer"
              >
                <option value="revenue_desc">Gross Revenue (Desc)</option>
                <option value="units_desc">Units Sold (Desc)</option>
                <option value="rating_desc">Avg Rating (Desc)</option>
                <option value="rating_asc">Avg Rating (Asc)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[#6B7280] uppercase">Product ID</th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[#6B7280] uppercase">Category</th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[#6B7280] uppercase text-right">Units Sold</th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[#6B7280] uppercase text-right">Gross Revenue</th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[#6B7280] uppercase text-center">Avg Rating</th>
                  <th className="px-4 py-3 text-[11.5px] font-semibold text-[#6B7280] uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[13px]">
                {(data?.catalog || []).map((p: any, idx: number) => {
                  const rating = p.avg_rating || 4.0;
                  const isHigh = rating >= 4.2;
                  const isLow = rating < 3.5;

                  return (
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 font-mono text-[12px] text-[#6B7280]">
                        #{p.product_id?.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 font-medium text-[#111827] capitalize">
                        {p.category?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#374151]">
                        {formatNum(p.units_sold)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#111827] tabular-nums">
                        {formatBRL(p.gross_revenue)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1 font-semibold text-[#F59E0B]">
                          ★ {rating}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            isHigh
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : isLow
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#FEF3C7] text-[#D97706]'
                          }`}
                        >
                          {isHigh ? 'Excellent' : isLow ? 'Critical' : 'Average'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#6B7280]">Loading Product Performance Dashboard...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
