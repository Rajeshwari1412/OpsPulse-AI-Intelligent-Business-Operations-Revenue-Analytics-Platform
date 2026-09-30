import time
import re
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text

PREBUILT_SQL_QUERIES = [
    {
        "id": 1,
        "title": "Top 10 Products by Revenue & Profit Contribution",
        "category": "Sales & Revenue",
        "difficulty": "Intermediate",
        "business_question": "Which products generate the highest gross revenue, and what is their corresponding profit margin percentage?",
        "sql": """
SELECT 
    p.product_id,
    p.name AS product_name,
    p.category,
    SUM(oi.quantity) AS units_sold,
    ROUND(SUM(oi.line_total), 2) AS total_revenue,
    ROUND(SUM(oi.gross_profit), 2) AS total_profit,
    ROUND((SUM(oi.gross_profit) * 100.0 / NULLIF(SUM(oi.line_total), 0)), 1) AS margin_percentage,
    RANK() OVER (ORDER BY SUM(oi.line_total) DESC) as revenue_rank
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status = 'Completed'
GROUP BY p.product_id, p.name, p.category
ORDER BY total_revenue DESC
LIMIT 10;
        """,
        "explanation": "Uses standard JOIN, aggregate SUM(), and window RANK() function to order and rank products by gross transaction volume."
    },
    {
        "id": 2,
        "title": "Month-over-Month Revenue Growth with LAG() Window Function",
        "category": "Trend & Forecasting",
        "difficulty": "Advanced",
        "business_question": "What is our historical month-over-month revenue growth rate, and when did the largest acceleration occur?",
        "sql": """
WITH monthly_revenue AS (
    SELECT 
        strftime('%Y-%m', order_date) AS month,
        ROUND(SUM(total_amount), 2) AS current_month_revenue,
        COUNT(DISTINCT order_id) AS total_orders
    FROM orders
    WHERE status = 'Completed'
    GROUP BY strftime('%Y-%m', order_date)
)
SELECT 
    month,
    current_month_revenue,
    total_orders,
    LAG(current_month_revenue, 1) OVER (ORDER BY month) AS prev_month_revenue,
    ROUND(
        (current_month_revenue - LAG(current_month_revenue, 1) OVER (ORDER BY month)) * 100.0 / 
        NULLIF(LAG(current_month_revenue, 1) OVER (ORDER BY month), 0),
        2
    ) AS mom_growth_pct
FROM monthly_revenue
ORDER BY month ASC;
        """,
        "explanation": "Demonstrates Common Table Expressions (CTE) combined with the LAG() window function to calculate period-over-period percentage delta."
    },
    {
        "id": 3,
        "title": "Customer RFM Quintile Scoring with NTILE() Window Function",
        "category": "Customer Intelligence",
        "difficulty": "Expert",
        "business_question": "How can we dynamically compute Recency, Frequency, and Monetary quintile scores using pure SQL window functions?",
        "sql": """
WITH customer_rfm_raw AS (
    SELECT 
        c.customer_id,
        c.first_name || ' ' || c.last_name AS customer_name,
        c.region,
        ROUND(JULIANDAY('2026-03-31') - JULIANDAY(MAX(o.order_date)), 0) AS recency_days,
        COUNT(o.order_id) AS frequency,
        ROUND(SUM(o.total_amount), 2) AS monetary
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'Completed'
    GROUP BY c.customer_id, c.first_name, c.last_name, c.region
),
rfm_scores AS (
    SELECT 
        customer_id,
        customer_name,
        region,
        recency_days,
        frequency,
        monetary,
        NTILE(5) OVER (ORDER BY recency_days DESC) AS r_score,
        NTILE(5) OVER (ORDER BY frequency ASC) AS f_score,
        NTILE(5) OVER (ORDER BY monetary ASC) AS m_score
    FROM customer_rfm_raw
)
SELECT 
    customer_id,
    customer_name,
    region,
    recency_days,
    frequency,
    monetary,
    r_score,
    f_score,
    m_score,
    (r_score || f_score || m_score) AS rfm_combined_code
FROM rfm_scores
ORDER BY monetary DESC
LIMIT 15;
        """,
        "explanation": "Leverages NTILE(5) window ranking to divide the customer base into five equal quintiles for statistical RFM segmentation."
    },
    {
        "id": 4,
        "title": "Rolling 3-Month Moving Average of Revenue",
        "category": "Financial Analytics",
        "difficulty": "Advanced",
        "business_question": "How do we smooth out seasonal fluctuations using a 3-month rolling window moving average?",
        "sql": """
WITH monthly_sales AS (
    SELECT 
        strftime('%Y-%m', order_date) as month,
        ROUND(SUM(total_amount), 2) as revenue
    FROM orders
    WHERE status = 'Completed'
    GROUP BY strftime('%Y-%m', order_date)
)
SELECT 
    month,
    revenue,
    ROUND(
        AVG(revenue) OVER (
            ORDER BY month 
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 2
    ) AS rolling_3m_avg_revenue
FROM monthly_sales
ORDER BY month ASC;
        """,
        "explanation": "Illustrates the powerful ROWS BETWEEN 2 PRECEDING AND CURRENT ROW window frame specification."
    },
    {
        "id": 5,
        "title": "Carrier Delivery Latency Benchmark by Region",
        "category": "Operations & Logistics",
        "difficulty": "Intermediate",
        "business_question": "Which logistics carrier has the highest on-time delivery rate across specific regional fulfillment zones?",
        "sql": """
SELECT 
    region,
    carrier,
    COUNT(delivery_id) AS total_deliveries,
    ROUND(AVG(delivery_days), 2) AS avg_transit_days,
    ROUND(AVG(delay_days), 2) AS avg_delay_days,
    ROUND(
        (SUM(CASE WHEN delay_days <= 0.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(delivery_id)), 
        1
    ) AS on_time_percentage,
    ROUND(AVG(rating), 2) AS avg_csat_score
FROM deliveries
GROUP BY region, carrier
HAVING COUNT(delivery_id) > 50
ORDER BY region ASC, on_time_percentage DESC;
        """,
        "explanation": "Uses conditional aggregation (SUM CASE WHEN) alongside GROUP BY and HAVING filters to benchmark partner SLAs."
    },
    {
        "id": 6,
        "title": "Customer Cohort Retention Rate Analysis",
        "category": "Customer Intelligence",
        "difficulty": "Expert",
        "business_question": "How many customers acquired in each cohort month returned to make repeat purchases in subsequent months?",
        "sql": """
WITH customer_cohort AS (
    SELECT 
        customer_id,
        strftime('%Y-%m', signup_date) AS cohort_month
    FROM customers
),
order_activity AS (
    SELECT 
        o.customer_id,
        cc.cohort_month,
        strftime('%Y-%m', o.order_date) AS order_month
    FROM orders o
    JOIN customer_cohort cc ON o.customer_id = cc.customer_id
    WHERE o.status = 'Completed'
)
SELECT 
    cohort_month,
    order_month,
    COUNT(DISTINCT customer_id) AS active_retained_customers
FROM order_activity
GROUP BY cohort_month, order_month
ORDER BY cohort_month ASC, order_month ASC
LIMIT 20;
        """,
        "explanation": "Classic Cohort Retention Matrix query using double CTEs and multi-dimensional grouping."
    },
    {
        "id": 7,
        "title": "Inventory Velocity & Days of Supply Risk",
        "category": "Supply Chain",
        "difficulty": "Intermediate",
        "business_question": "Which inventory items are in danger of stockout or excessive overstock capital tie-up?",
        "sql": """
SELECT 
    p.product_id,
    p.name AS product_name,
    p.category,
    i.stock_on_hand,
    i.reorder_point,
    i.days_of_supply,
    i.inventory_turnover,
    i.stock_status,
    CASE 
        WHEN i.days_of_supply < 15 THEN 'CRITICAL: Expedite PO'
        WHEN i.days_of_supply > 60 THEN 'WARNING: Overstock Markdown'
        ELSE 'OPTIMAL'
    END AS operational_action
FROM inventory i
JOIN products p ON i.product_id = p.product_id
ORDER BY i.days_of_supply ASC;
        """,
        "explanation": "Demonstrates CASE conditional logic on inventory health metrics to generate automated action tags."
    },
    {
        "id": 8,
        "title": "Marketing Attribution: CAC vs ROAS by Channel",
        "category": "Marketing ROI",
        "difficulty": "Intermediate",
        "business_question": "What is the Customer Acquisition Cost (CAC) and Return on Ad Spend (ROAS) across all marketing channels?",
        "sql": """
SELECT 
    channel,
    COUNT(campaign_id) AS active_campaigns,
    ROUND(SUM(spend), 2) AS total_ad_spend,
    SUM(conversions) AS total_conversions,
    ROUND(SUM(attributed_revenue), 2) AS total_revenue_generated,
    ROUND(SUM(attributed_revenue) / NULLIF(SUM(spend), 0), 2) AS realized_roas,
    ROUND(SUM(spend) / NULLIF(SUM(conversions), 0), 2) AS effective_cac
FROM marketing_campaigns
GROUP BY channel
ORDER BY realized_roas DESC;
        """,
        "explanation": "Calculates blended marketing unit economics using safe zero-division handling with NULLIF()."
    },
    {
        "id": 9,
        "title": "Cumulative Running Total of Revenue by Category",
        "category": "Sales & Revenue",
        "difficulty": "Advanced",
        "business_question": "How does cumulative running revenue accumulate month-by-month for each major product category?",
        "sql": """
WITH category_monthly AS (
    SELECT 
        p.category,
        strftime('%Y-%m', o.order_date) AS month,
        ROUND(SUM(oi.line_total), 2) AS monthly_category_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = 'Completed'
    GROUP BY p.category, strftime('%Y-%m', o.order_date)
)
SELECT 
    category,
    month,
    monthly_category_revenue,
    ROUND(
        SUM(monthly_category_revenue) OVER (
            PARTITION BY category 
            ORDER BY month ASC
        ), 2
    ) AS cumulative_running_revenue
FROM category_monthly
ORDER BY category, month ASC
LIMIT 25;
        """,
        "explanation": "Demonstrates PARTITION BY category alongside ORDER BY for segmented running cumulative totals."
    },
    {
        "id": 10,
        "title": "Order Channel Profitability & Average Basket Size",
        "category": "Sales & Revenue",
        "difficulty": "Intermediate",
        "business_question": "Which sales channels deliver the highest average order value and overall operating profit?",
        "sql": """
SELECT 
    channel,
    COUNT(order_id) AS total_orders,
    ROUND(SUM(total_amount), 2) AS total_revenue,
    ROUND(SUM(profit_amount), 2) AS total_profit,
    ROUND(AVG(total_amount), 2) AS aov,
    ROUND((SUM(profit_amount) * 100.0 / NULLIF(SUM(total_amount), 0)), 1) AS profit_margin_pct
FROM orders
WHERE status = 'Completed'
GROUP BY channel
ORDER BY total_revenue DESC;
        """,
        "explanation": "Calculates holistic channel-level economics to identify highest margin customer acquisition touchpoints."
    }
]

FORBIDDEN_SQL_PATTERNS = [
    r"\bDROP\b", r"\bDELETE\b", r"\bINSERT\b", r"\bUPDATE\b", r"\bALTER\b", 
    r"\bTRUNCATE\b", r"\bCREATE\b", r"\bGRANT\b", r"\bREVOKE\b", r"\bEXEC\b"
]

def execute_user_sql(sql: str, db: Session) -> Dict[str, Any]:
    """
    Safely executes user SQL queries on read-only session with strict allowlisting.
    """
    t_start = time.time()
    clean_sql = sql.strip()

    # Check forbidden SQL commands
    for pattern in FORBIDDEN_SQL_PATTERNS:
        if re.search(pattern, clean_sql, re.IGNORECASE):
            return {
                "columns": [],
                "rows": [],
                "row_count": 0,
                "execution_time_ms": 0.0,
                "is_safe": False,
                "error_message": f"Security Violation: '{pattern.replace(r'\b', '')}' statement is not permitted in read-only Analytics Lab."
            }

    try:
        df = pd.read_sql(text(clean_sql), db.bind)
        # Cap results at 100 rows for frontend performance
        df_limited = df.head(100)
        cols = list(df.columns)
        rows = df_limited.to_dict(orient="records")
        exec_time = round((time.time() - t_start) * 1000, 2)

        return {
            "columns": cols,
            "rows": rows,
            "row_count": len(df),
            "execution_time_ms": exec_time,
            "is_safe": True,
            "error_message": None
        }
    except Exception as e:
        return {
            "columns": [],
            "rows": [],
            "row_count": 0,
            "execution_time_ms": round((time.time() - t_start) * 1000, 2),
            "is_safe": True,
            "error_message": str(e)
        }
