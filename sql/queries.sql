-- ==============================================================================
-- Olist E-Commerce Analytics - SQL Queries
-- Database: sql/olist.db
-- Description: Queries to answer 5 core business questions + Category Translation Helper
-- ==============================================================================

-- ==============================================================================
-- HELPER / VIEW: Products with English Category Names
-- Menggabungkan products dengan category_translation sehingga nama kategori dalam Bahasa Inggris
-- Fallback ke 'unknown' jika nama kategori kosong / tidak ada terjemahan
-- ==============================================================================
-- Query Helper:
SELECT 
    p.product_id,
    COALESCE(ct.product_category_name_english, p.product_category_name, 'unknown') AS category_name_english,
    p.product_weight_g,
    p.product_length_cm,
    p.product_height_cm,
    p.product_width_cm
FROM products p
LEFT JOIN category_translation ct 
    ON p.product_category_name = ct.product_category_name;


-- ==============================================================================
-- PERTANYAAN BISNIS 1: PERILAKU CUSTOMER (Repeat Customer & Segmentasi RFM)
-- 1A. Repeat Customer Rate (menggunakan customer_unique_id)
-- ==============================================================================
WITH customer_order_counts AS (
    SELECT 
        c.customer_unique_id,
        COUNT(DISTINCT o.order_id) AS total_orders
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status NOT IN ('canceled', 'unavailable')
    GROUP BY c.customer_unique_id
)
SELECT 
    COUNT(*) AS total_unique_customers,
    SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) AS repeat_customers,
    SUM(CASE WHEN total_orders = 1 THEN 1 ELSE 0 END) AS one_time_customers,
    ROUND(100.0 * SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS repeat_customer_rate_pct
FROM customer_order_counts;


-- ==============================================================================
-- 1B. Segmentasi RFM (Recency, Frequency, Monetary)
-- Reference date: 2018-10-18 (tanggal order terakhir + margin aman di dataset)
-- ==============================================================================
WITH rfm_base AS (
    SELECT 
        c.customer_unique_id,
        -- Recency: Hari sejak order terakhir
        ROUND(julianday('2018-10-18 00:00:00') - julianday(MAX(o.order_purchase_timestamp))) AS recency_days,
        -- Frequency: Jumlah order
        COUNT(DISTINCT o.order_id) AS frequency,
        -- Monetary: Total belanja (item price + freight)
        ROUND(SUM(oi.price + oi.freight_value), 2) AS monetary_value
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status NOT IN ('canceled', 'unavailable')
    GROUP BY c.customer_unique_id
),
rfm_scores AS (
    SELECT 
        customer_unique_id,
        recency_days,
        frequency,
        monetary_value,
        NTILE(5) OVER (ORDER BY recency_days DESC) AS r_score, -- 5 = paling baru (recency days terkecil)
        CASE 
            WHEN frequency = 1 THEN 1
            WHEN frequency = 2 THEN 3
            ELSE 5 
        END AS f_score,
        NTILE(5) OVER (ORDER BY monetary_value ASC) AS m_score
    FROM rfm_base
),
rfm_segmented AS (
    SELECT 
        customer_unique_id,
        recency_days,
        frequency,
        monetary_value,
        r_score,
        f_score,
        m_score,
        CASE 
            WHEN r_score >= 4 AND f_score >= 4 THEN 'Champions'
            WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
            WHEN r_score >= 4 AND f_score <= 2 THEN 'Recent Customers'
            WHEN r_score >= 3 AND f_score <= 2 THEN 'Potential Loyalists'
            WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk / Need Attention'
            ELSE 'Lost / Inactive Customers'
        END AS customer_segment
    FROM rfm_scores
)
SELECT 
    customer_segment,
    COUNT(*) AS total_customers,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM rfm_segmented), 2) AS pct_of_total,
    ROUND(AVG(recency_days), 1) AS avg_recency_days,
    ROUND(AVG(frequency), 2) AS avg_frequency,
    ROUND(AVG(monetary_value), 2) AS avg_monetary_value,
    ROUND(SUM(monetary_value), 2) AS total_revenue
FROM rfm_segmented
GROUP BY customer_segment
ORDER BY total_revenue DESC;


-- ==============================================================================
-- PERTANYAAN BISNIS 2: PERFORMA PRODUK & KATEGORI
-- 2A. Top 10 Kategori Paling Laris Berdasarkan Total Revenue & Volume Penjualan
-- ==============================================================================
SELECT 
    COALESCE(ct.product_category_name_english, p.product_category_name, 'unknown') AS category_name,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    COUNT(oi.order_item_id) AS total_items_sold,
    ROUND(SUM(oi.price), 2) AS total_sales_value,
    ROUND(AVG(oi.price), 2) AS avg_item_price
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
LEFT JOIN category_translation ct ON p.product_category_name = ct.product_category_name
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status NOT IN ('canceled', 'unavailable')
GROUP BY category_name
ORDER BY total_sales_value DESC
LIMIT 10;


-- ==============================================================================
-- 2B. Top 5 Kategori dengan Rating Review Tertinggi & Terendah (Min. 100 review)
-- ==============================================================================
WITH category_reviews AS (
    SELECT 
        COALESCE(ct.product_category_name_english, p.product_category_name, 'unknown') AS category_name,
        COUNT(r.review_id) AS review_count,
        ROUND(AVG(r.review_score), 2) AS avg_review_score
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN category_translation ct ON p.product_category_name = ct.product_category_name
    JOIN reviews r ON oi.order_id = r.order_id
    GROUP BY category_name
    HAVING COUNT(r.review_id) >= 100
)
-- Top 5 Highest Rated
SELECT 'Top 5 Highest Rating' AS category_type, category_name, review_count, avg_review_score
FROM (
    SELECT * FROM category_reviews ORDER BY avg_review_score DESC LIMIT 5
)
UNION ALL
-- Top 5 Lowest Rated
SELECT 'Top 5 Lowest Rating' AS category_type, category_name, review_count, avg_review_score
FROM (
    SELECT * FROM category_reviews ORDER BY avg_review_score ASC LIMIT 5
);


-- ==============================================================================
-- PERTANYAAN BISNIS 3: PERFORMA PENGIRIMAN (On-Time Delivery Rate & Rata-rata Durasi)
-- 3A. Overall On-Time Delivery Rate
-- ==============================================================================
SELECT 
    COUNT(*) AS total_delivered_orders,
    SUM(CASE WHEN datetime(order_delivered_customer_date) <= datetime(order_estimated_delivery_date) THEN 1 ELSE 0 END) AS on_time_deliveries,
    SUM(CASE WHEN datetime(order_delivered_customer_date) > datetime(order_estimated_delivery_date) THEN 1 ELSE 0 END) AS late_deliveries,
    ROUND(100.0 * SUM(CASE WHEN datetime(order_delivered_customer_date) <= datetime(order_estimated_delivery_date) THEN 1 ELSE 0 END) / COUNT(*), 2) AS on_time_delivery_rate_pct
FROM orders
WHERE order_status = 'delivered'
  AND order_delivered_customer_date IS NOT NULL
  AND order_estimated_delivery_date IS NOT NULL;


-- ==============================================================================
-- 3B. Rata-rata Durasi Pengiriman & On-Time Rate per Customer State
-- ==============================================================================
SELECT 
    c.customer_state,
    COUNT(o.order_id) AS total_orders,
    ROUND(AVG(julianday(o.order_delivered_customer_date) - julianday(o.order_purchase_timestamp)), 1) AS avg_delivery_days,
    ROUND(AVG(julianday(o.order_estimated_delivery_date) - julianday(o.order_purchase_timestamp)), 1) AS avg_estimated_days,
    ROUND(100.0 * SUM(CASE WHEN datetime(o.order_delivered_customer_date) <= datetime(o.order_estimated_delivery_date) THEN 1 ELSE 0 END) / COUNT(o.order_id), 2) AS on_time_rate_pct
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_status = 'delivered'
  AND o.order_delivered_customer_date IS NOT NULL
GROUP BY c.customer_state
ORDER BY avg_delivery_days ASC;


-- ==============================================================================
-- PERTANYAAN BISNIS 4: METODE PEMBAYARAN & HUBUNGAN JUMLAH CICILAN
-- 4A. Distribusi Metode Pembayaran
-- ==============================================================================
SELECT 
    payment_type,
    COUNT(DISTINCT order_id) AS total_orders,
    ROUND(SUM(payment_value), 2) AS total_payment_value,
    ROUND(100.0 * SUM(payment_value) / (SELECT SUM(payment_value) FROM payments), 2) AS payment_value_pct,
    ROUND(AVG(payment_value), 2) AS avg_payment_value,
    ROUND(AVG(payment_installments), 1) AS avg_installments
FROM payments
GROUP BY payment_type
ORDER BY total_payment_value DESC;


-- ==============================================================================
-- 4B. Hubungan Jumlah Cicilan (Payment Installments) dengan Nilai Order
-- (Khusus kartu kredit yang mendukung cicilan)
-- ==============================================================================
SELECT 
    payment_installments,
    COUNT(DISTINCT order_id) AS total_orders,
    ROUND(AVG(payment_value), 2) AS avg_order_value,
    ROUND(MIN(payment_value), 2) AS min_order_value,
    ROUND(MAX(payment_value), 2) AS max_order_value,
    ROUND(SUM(payment_value), 2) AS total_value
FROM payments
WHERE payment_type = 'credit_card'
GROUP BY payment_installments
ORDER BY payment_installments ASC;


-- ==============================================================================
-- PERTANYAAN BISNIS 5: HUBUNGAN DURASI PENGIRIMAN DAN REVIEW SCORE
-- Analisis Skor Review Berdasarkan Bucket Waktu Pengiriman (Hari)
-- ==============================================================================
WITH delivery_performance AS (
    SELECT 
        o.order_id,
        r.review_score,
        ROUND(julianday(o.order_delivered_customer_date) - julianday(o.order_purchase_timestamp)) AS actual_delivery_days,
        CASE 
            WHEN datetime(o.order_delivered_customer_date) <= datetime(o.order_estimated_delivery_date) THEN 'On Time'
            ELSE 'Delayed'
        END AS delivery_status,
        CASE 
            WHEN (julianday(o.order_delivered_customer_date) - julianday(o.order_purchase_timestamp)) <= 5 THEN '1. 0 - 5 Days'
            WHEN (julianday(o.order_delivered_customer_date) - julianday(o.order_purchase_timestamp)) <= 10 THEN '2. 6 - 10 Days'
            WHEN (julianday(o.order_delivered_customer_date) - julianday(o.order_purchase_timestamp)) <= 15 THEN '3. 11 - 15 Days'
            WHEN (julianday(o.order_delivered_customer_date) - julianday(o.order_purchase_timestamp)) <= 20 THEN '4. 16 - 20 Days'
            WHEN (julianday(o.order_delivered_customer_date) - julianday(o.order_purchase_timestamp)) <= 30 THEN '5. 21 - 30 Days'
            ELSE '6. > 30 Days'
        END AS delivery_time_bucket
    FROM orders o
    JOIN reviews r ON o.order_id = r.order_id
    WHERE o.order_status = 'delivered'
      AND o.order_delivered_customer_date IS NOT NULL
)
SELECT 
    delivery_time_bucket,
    COUNT(order_id) AS total_orders,
    ROUND(AVG(review_score), 2) AS avg_review_score,
    SUM(CASE WHEN review_score = 5 THEN 1 ELSE 0 END) AS score_5_count,
    SUM(CASE WHEN review_score = 1 THEN 1 ELSE 0 END) AS score_1_count,
    ROUND(100.0 * SUM(CASE WHEN review_score = 5 THEN 1 ELSE 0 END) / COUNT(*), 2) AS score_5_pct,
    ROUND(100.0 * SUM(CASE WHEN review_score = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS score_1_pct
FROM delivery_performance
GROUP BY delivery_time_bucket
ORDER BY delivery_time_bucket ASC;
