# Olist Brazilian E-Commerce Analytics Dashboard

Executive-grade, end-to-end data analytics and business intelligence web application built from 99,441 Brazilian e-commerce orders (2016–2018).

---

## 📊 Business Problem & Questions Addressed

1. **Customer Behavior & Retention:**
   - How large is the repeat customer segment (`customer_unique_id`) and what does the RFM (*Recency, Frequency, Monetary*) segmentation look like?
   - **Key Finding:** Only **3.04%** (2,888 customers) are repeat buyers. Olist operates primarily as an acquisition funnel with untapped potential for post-purchase retention.
2. **Product & Category Performance:**
   - Which product categories generate the highest revenue and order volume? Which categories receive the highest/lowest customer satisfaction ratings?
   - **Key Finding:** `health_beauty` (R$ 1.25M), `watches_gifts` (R$ 1.20M), and `bed_bath_table` (R$ 1.03M) lead total revenue. Books maintain the highest ratings (4.45), while Security & Services suffers from lower ratings (2.40).
3. **Delivery SLAs & Regional Logistics:**
   - What is the nationwide on-time delivery rate (`order_delivered_customer_date <= order_estimated_delivery_date`) and average delivery duration per state?
   - **Key Finding:** **91.89%** overall on-time rate. Southeastern states (SP, PR, MG) enjoy fast deliveries (8.8–12.0 days), while Northern/Northeastern states experience longer delivery cycles (20–30 days).
4. **Payment Methods & Installment Financing:**
   - What is the dominant payment type, and does the number of installments impact basket size (*Average Order Value*)?
   - **Key Finding:** Credit cards represent **78.34%** of total transaction value. Higher installment plans correlate linearly with larger ticket sizes (1x: R$ 95 vs 10x: R$ 418).
5. **Logistics vs. Customer Satisfaction:**
   - Does delivery delay directly impair customer review scores?
   - **Key Finding:** Orders delivered in ≤ 5 days achieve an average score of **4.45** (69.9% 5-star). Deliveries exceeding 30 days drop to **1.72** (72.1% 1-star).

---

## 🛠️ Technology Stack & Architecture

- **Frontend & App Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling & Design System:** Tailwind CSS v4, Inter Typography, Google Stitch Bento Grid Design System
- **Visualizations:** Recharts (Composed Charts, Dual-Axis Line/Bar, Progress Bars, Heatmaps)
- **Database Engine:** SQLite 3 (`sql/olist.db`) with custom performance indexes
- **Backend API:** Next.js Server Route Handlers powered by `better-sqlite3`
- **Data Engineering & Documentation:** Python 3.12 (Pandas, Seaborn, Matplotlib, Jupyter Notebook)

---

## 📁 Repository Structure

```
ecommerce-project/
├── data/                                 # 9 Raw CSV files (Olist dataset)
├── sql/
│   ├── olist.db                          # Optimized SQLite database with indexes
│   └── queries.sql                       # 10 verified SQL queries answering all business questions
├── notebook/
│   └── ecommerce_analysis.ipynb          # End-to-end Python EDA, DQC, SQL integration & recommendations
├── app/
│   ├── api/
│   │   ├── overview/route.ts             # API for Executive Overview KPIs & trends
│   │   ├── customers/route.ts            # API for RFM segmentation & cohort retention
│   │   ├── products/route.ts             # API for category performance & catalog search
│   │   └── orders/route.ts               # API for delivery SLAs & payment financing
│   ├── overview/page.tsx                 # Overview Dashboard (KPIs, Sales Velocity, Regional Distribution)
│   ├── customers/page.tsx                # Customer Behavior (RFM Segments, Cohort Retention Heatmap)
│   ├── products/page.tsx                 # Product Performance (Revenue breakdown, Rating ranking, Search)
│   ├── orders/page.tsx                   # Orders & Delivery (SLA tracking, Review correlation, Installments)
│   ├── globals.css                       # Tailwind v4 theme tokens & Stitch design system
│   └── layout.tsx                        # Root layout with navigation sidebar
├── components/
│   ├── Sidebar.tsx                       # Navigation sidebar matching Stitch layout
│   └── Header.tsx                        # Header with State Filter and dynamic URL params
├── package.json                          # Pinned dependency definitions
├── next.config.mjs                       # Server external packages configuration for better-sqlite3
├── .gitignore                            # Preserves sql/olist.db for production runtime
└── README.md                             # Comprehensive project documentation
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js v18+ (Tested on Node v22)
- Python 3.10+ (for running ETL or Jupyter Notebook)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the interactive dashboard.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📈 Strategic Business Recommendations

1. **Automated Lifecycle & Re-Engagement Campaigns:**
   - Target the 38.7% *Recent Customers* within 14–30 days post-delivery with personalized incentives and complementary product recommendations to boost repeat purchase rates.
2. **Regional Fulfillment Hubs:**
   - Establish forward stocking or partnered distribution hubs in non-southeastern regions to reduce delivery transit times from 25+ days to <12 days, protecting customer ratings from severe delivery penalties.
3. **Promote High-Ticket Installment Options:**
   - Expand 0% interest installment campaigns on premium categories (computers, watches, electronics) where installment flexibility drives up Average Order Value (AOV).
4. **Seller SLA Enforcement:**
   - Implement strict SLAs on sellers with review scores below 3.5 and high fulfillment delays to maintain marketplace brand trust.
