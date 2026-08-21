import os
import sqlite3
import pandas as pd

DATA_DIR = "data"
DB_PATH = os.path.join("sql", "olist.db")

# Delete existing DB if any to have a clean start
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("Starting ETL process...")

# 1. Customers
print("1. Loading customers...")
df_customers = pd.read_csv(os.path.join(DATA_DIR, "olist_customers_dataset.csv"))
df_customers.to_sql("customers", conn, if_exists="replace", index=False)

# 2. Geolocation (if needed/optional, load as geolocation)
if os.path.exists(os.path.join(DATA_DIR, "olist_geolocation_dataset.csv")):
    print("Loading geolocation...")
    df_geo = pd.read_csv(os.path.join(DATA_DIR, "olist_geolocation_dataset.csv"))
    df_geo.to_sql("geolocation", conn, if_exists="replace", index=False)

# 3. Orders with date conversions
print("2. Loading orders...")
df_orders = pd.read_csv(os.path.join(DATA_DIR, "olist_orders_dataset.csv"))
date_cols_orders = [
    "order_purchase_timestamp",
    "order_approved_at",
    "order_delivered_carrier_date",
    "order_delivered_customer_date",
    "order_estimated_delivery_date"
]
for col in date_cols_orders:
    df_orders[col] = pd.to_datetime(df_orders[col], errors="coerce").dt.strftime('%Y-%m-%d %H:%M:%S')

df_orders.to_sql("orders", conn, if_exists="replace", index=False)

# 4. Order Items
print("3. Loading order_items...")
df_order_items = pd.read_csv(os.path.join(DATA_DIR, "olist_order_items_dataset.csv"))
df_order_items["shipping_limit_date"] = pd.to_datetime(df_order_items["shipping_limit_date"], errors="coerce").dt.strftime('%Y-%m-%d %H:%M:%S')
df_order_items.to_sql("order_items", conn, if_exists="replace", index=False)

# 5. Order Payments
print("4. Loading payments...")
df_payments = pd.read_csv(os.path.join(DATA_DIR, "olist_order_payments_dataset.csv"))
df_payments.to_sql("payments", conn, if_exists="replace", index=False)

# 6. Order Reviews
print("5. Loading reviews...")
df_reviews = pd.read_csv(os.path.join(DATA_DIR, "olist_order_reviews_dataset.csv"))
date_cols_reviews = ["review_creation_date", "review_answer_timestamp"]
for col in date_cols_reviews:
    df_reviews[col] = pd.to_datetime(df_reviews[col], errors="coerce").dt.strftime('%Y-%m-%d %H:%M:%S')
df_reviews.to_sql("reviews", conn, if_exists="replace", index=False)

# 7. Products (fill missing categories with 'unknown' or keep null with clean string)
print("6. Loading products...")
df_products = pd.read_csv(os.path.join(DATA_DIR, "olist_products_dataset.csv"))
# Fill null category with 'unknown'
df_products["product_category_name"] = df_products["product_category_name"].fillna("unknown")
df_products.to_sql("products", conn, if_exists="replace", index=False)

# 8. Sellers
print("7. Loading sellers...")
df_sellers = pd.read_csv(os.path.join(DATA_DIR, "olist_sellers_dataset.csv"))
df_sellers.to_sql("sellers", conn, if_exists="replace", index=False)

# 9. Category Translation
print("8. Loading category_translation...")
df_cat = pd.read_csv(os.path.join(DATA_DIR, "product_category_name_translation.csv"))
# Add an entry for 'unknown' -> 'unknown'
if not (df_cat["product_category_name"] == "unknown").any():
    unknown_row = pd.DataFrame([{"product_category_name": "unknown", "product_category_name_english": "unknown"}])
    df_cat = pd.concat([df_cat, unknown_row], ignore_index=True)
df_cat.to_sql("category_translation", conn, if_exists="replace", index=False)

# Create indices on foreign keys and primary keys for fast query performance in SQLite / Next.js
print("Creating indices for performance...")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_purchase_timestamp ON orders(order_purchase_timestamp);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_unique_id ON customers(customer_unique_id);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products(product_category_name);")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_cat_trans_name ON category_translation(product_category_name);")

conn.commit()

# Verification
print("\n--- TABLE SUMMARY ---")
tables = ["orders", "customers", "order_items", "payments", "reviews", "products", "sellers", "category_translation", "geolocation"]
for t in tables:
    try:
        count = cursor.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"Table '{t}': {count:,} rows")
    except Exception as e:
        print(f"Table '{t}' error: {e}")

conn.close()
print("\nETL finished successfully!")
