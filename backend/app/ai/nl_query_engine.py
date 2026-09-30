import time
import re
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text

QUERY_TEMPLATES = [
    {
        "keywords": ["top", "product", "revenue", "best selling", "sales"],
        "intent": "Identify highest revenue generating products",
        "sql": """
            SELECT 
                p.name as product_name,
                p.category,
                SUM(oi.quantity) as total_units_sold,
                ROUND(SUM(oi.line_total), 2) as total_revenue,
                ROUND(SUM(oi.gross_profit), 2) as gross_profit
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.status = 'Completed'
            GROUP BY p.name, p.category
            ORDER BY total_revenue DESC
            LIMIT 10
        """,
        "chart": {"type": "bar", "x": "product_name", "y": "total_revenue"},
        "summary_formatter": lambda df: f"The top performing product is '{df.iloc[0]['product_name']}' generating ${df.iloc[0]['total_revenue']:,.2f} in revenue across {df.iloc[0]['total_units_sold']:,} units sold."
    },
    {
        "keywords": ["region", "delivery", "delay", "carrier", "logistics", "shipping"],
        "intent": "Analyze regional delivery delays and carrier bottlenecks",
        "sql": """
            SELECT 
                region,
                carrier,
                COUNT(delivery_id) as shipments,
                ROUND(AVG(delay_days), 2) as avg_delay_days,
                ROUND(AVG(delivery_days), 2) as avg_transit_days,
                ROUND(AVG(rating), 2) as customer_rating
            FROM deliveries
            GROUP BY region, carrier
            ORDER BY avg_delay_days DESC
            LIMIT 10
        """,
        "chart": {"type": "bar", "x": "region", "y": "avg_delay_days"},
        "summary_formatter": lambda df: f"The highest transit latency is observed in the '{df.iloc[0]['region']}' region with '{df.iloc[0]['carrier']}' averaging {df.iloc[0]['avg_delay_days']} days of delay."
    },
    {
        "keywords": ["churn", "risk", "customer", "at risk", "lost"],
        "intent": "Inspect customer churn risk and high-value at-risk accounts",
        "sql": """
            SELECT 
                customer_id,
                first_name || ' ' || last_name as customer_name,
                region,
                segment,
                rfm_segment,
                clv_score,
                ROUND(churn_probability * 100, 1) as churn_probability_pct
            FROM customers
            WHERE churn_risk = 'HIGH'
            ORDER BY clv_score DESC
            LIMIT 10
        """,
        "chart": {"type": "bar", "x": "customer_name", "y": "clv_score"},
        "summary_formatter": lambda df: f"Identified {len(df)} key enterprise accounts at high risk of churn, representing ${df['clv_score'].sum():,.2f} in cumulative customer lifetime value."
    },
    {
        "keywords": ["monthly", "trend", "revenue growth", "month over month", "sales growth"],
        "intent": "Examine monthly revenue and margin growth trajectory",
        "sql": """
            SELECT 
                strftime('%Y-%m', order_date) as month,
                COUNT(DISTINCT order_id) as total_orders,
                ROUND(SUM(total_amount), 2) as monthly_revenue,
                ROUND(SUM(profit_amount), 2) as monthly_profit
            FROM orders
            WHERE status = 'Completed'
            GROUP BY month
            ORDER BY month ASC
        """,
        "chart": {"type": "line", "x": "month", "y": "monthly_revenue"},
        "summary_formatter": lambda df: f"Net monthly revenue expanded to ${df.iloc[-1]['monthly_revenue']:,.2f} in {df.iloc[-1]['month']}, supported by {df.iloc[-1]['total_orders']:,} completed transactions."
    },
    {
        "keywords": ["campaign", "marketing", "roas", "cac", "channel", "ad"],
        "intent": "Evaluate marketing channel efficiency and campaign ROAS",
        "sql": """
            SELECT 
                channel,
                ROUND(SUM(spend), 2) as total_spend,
                ROUND(SUM(attributed_revenue), 2) as total_revenue,
                ROUND(SUM(attributed_revenue) / NULLIF(SUM(spend), 0), 2) as roas,
                ROUND(SUM(spend) / NULLIF(SUM(conversions), 0), 2) as cac
            FROM marketing_campaigns
            GROUP BY channel
            ORDER BY roas DESC
        """,
        "chart": {"type": "bar", "x": "channel", "y": "roas"},
        "summary_formatter": lambda df: f"'{df.iloc[0]['channel']}' delivered the highest advertising return with an ROAS of {df.iloc[0]['roas']}x and CAC of ${df.iloc[0]['cac']}."
    },
    {
        "keywords": ["stockout", "inventory", "reorder", "stock", "supply"],
        "intent": "Identify low inventory items and stockout risks",
        "sql": """
            SELECT 
                p.name as product_name,
                p.category,
                i.stock_on_hand,
                i.reorder_point,
                i.days_of_supply,
                i.stock_status
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            WHERE i.days_of_supply < 20 OR i.stock_status = 'Potential Stockout'
            ORDER BY i.days_of_supply ASC
        """,
        "chart": {"type": "bar", "x": "product_name", "y": "days_of_supply"},
        "summary_formatter": lambda df: f"'{df.iloc[0]['product_name']}' is at critical stockout risk with only {df.iloc[0]['days_of_supply']} days of buffer supply remaining ({df.iloc[0]['stock_on_hand']} units in stock)."
    }
]

def ask_opspulse(question: str, db: Session) -> Dict[str, Any]:
    """
    Translates natural language questions into safe, validated analytical SQL queries.
    Prevents raw injection by matching semantic intent with allowlisted query builders.
    """
    t_start = time.time()
    clean_q = question.lower().strip()

    # Match best query template
    best_match = None
    max_score = -1

    for template in QUERY_TEMPLATES:
        score = sum(1 for kw in template["keywords"] if kw in clean_q)
        if score > max_score:
            max_score = score
            best_match = template

    if max_score <= 0 or not best_match:
        # Default fallback: Top products
        best_match = QUERY_TEMPLATES[0]

    # Execute SQL safely
    sql_text = text(best_match["sql"].strip())
    df = pd.read_sql(sql_text, db.bind)
    
    execution_time = round((time.time() - t_start) * 1000, 2)
    
    summary = best_match["summary_formatter"](df) if not df.empty else "No matching analytical records found."
    data_table = df.to_dict(orient="records")

    return {
        "question": question,
        "interpreted_intent": best_match["intent"],
        "sql_query": best_match["sql"].strip(),
        "answer_summary": summary,
        "data_table": data_table,
        "chart_suggestion": best_match["chart"],
        "execution_time_ms": execution_time
    }
