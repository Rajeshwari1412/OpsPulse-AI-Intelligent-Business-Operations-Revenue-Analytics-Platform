from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.analytics.kpi_engine import calculate_executive_kpis

def get_sales_analytics(db: Session, filters: dict = None) -> Dict[str, Any]:
    """
    Computes comprehensive sales analytics using optimized SQL aggregation:
    - Monthly revenue and gross profit timeline
    - Sales distribution by region
    - Sales distribution by product category
    - Sales distribution by acquisition/sales channel
    - Top 10 performing products by revenue & margin
    - Bottom 5 declining / underperforming products
    - Margin variance analysis
    """
    kpis = calculate_executive_kpis(db, filters)

    # 1. Monthly Revenue & Profit Timeline
    timeline_sql = text("""
        SELECT 
            strftime('%Y-%m', order_date) as month,
            COUNT(DISTINCT order_id) as orders,
            ROUND(SUM(total_amount), 2) as revenue,
            ROUND(SUM(profit_amount), 2) as profit,
            ROUND((SUM(profit_amount) * 100.0 / NULLIF(SUM(total_amount), 0)), 1) as margin_pct
        FROM orders
        WHERE status = 'Completed'
        GROUP BY strftime('%Y-%m', order_date)
        ORDER BY month ASC
    """)
    timeline_rows = db.execute(timeline_sql).fetchall()
    revenue_timeline = [
        {
            "date": row[0],
            "orders": row[1],
            "revenue": row[2] or 0.0,
            "profit": row[3] or 0.0,
            "margin_pct": row[4] or 0.0
        }
        for row in timeline_rows
    ]

    # 2. Sales by Region
    region_sql = text("""
        SELECT 
            region,
            COUNT(DISTINCT order_id) as orders,
            ROUND(SUM(total_amount), 2) as revenue,
            ROUND(SUM(profit_amount), 2) as profit
        FROM orders
        WHERE status = 'Completed'
        GROUP BY region
        ORDER BY revenue DESC
    """)
    region_rows = db.execute(region_sql).fetchall()
    total_rev = sum(r[2] for r in region_rows) if region_rows else 1.0
    sales_by_region = [
        {
            "region": r[0],
            "orders": r[1],
            "revenue": r[2],
            "profit": r[3],
            "share_pct": round((r[2] / max(1.0, total_rev)) * 100, 1)
        }
        for r in region_rows
    ]

    # 3. Sales by Product Category
    cat_sql = text("""
        SELECT 
            p.category,
            COUNT(DISTINCT oi.order_id) as orders,
            SUM(oi.quantity) as units_sold,
            ROUND(SUM(oi.line_total), 2) as revenue,
            ROUND(SUM(oi.gross_profit), 2) as profit
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'Completed'
        GROUP BY p.category
        ORDER BY revenue DESC
    """)
    cat_rows = db.execute(cat_sql).fetchall()
    sales_by_category = [
        {
            "category": r[0],
            "orders": r[1],
            "units_sold": r[2],
            "revenue": r[3],
            "profit": r[4],
            "margin_pct": round((r[4] / max(1.0, r[3])) * 100, 1)
        }
        for r in cat_rows
    ]

    # 4. Sales by Channel
    channel_sql = text("""
        SELECT 
            channel,
            COUNT(order_id) as orders,
            ROUND(SUM(total_amount), 2) as revenue,
            ROUND(AVG(total_amount), 2) as aov
        FROM orders
        WHERE status = 'Completed'
        GROUP BY channel
        ORDER BY revenue DESC
    """)
    channel_rows = db.execute(channel_sql).fetchall()
    sales_by_channel = [
        {
            "channel": r[0],
            "orders": r[1],
            "revenue": r[2],
            "aov": r[3]
        }
        for r in channel_rows
    ]

    # 5. Top Performing Products
    top_prod_sql = text("""
        SELECT 
            p.product_id,
            p.name,
            p.category,
            SUM(oi.quantity) as units_sold,
            ROUND(SUM(oi.line_total), 2) as revenue,
            ROUND(SUM(oi.gross_profit), 2) as profit,
            ROUND((SUM(oi.gross_profit) * 100.0 / NULLIF(SUM(oi.line_total), 0)), 1) as margin_pct
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'Completed'
        GROUP BY p.product_id, p.name, p.category
        ORDER BY revenue DESC
        LIMIT 10
    """)
    top_prod_rows = db.execute(top_prod_sql).fetchall()
    top_products = [
        {
            "product_id": r[0],
            "name": r[1],
            "category": r[2],
            "units_sold": r[3],
            "revenue": r[4],
            "profit": r[5],
            "margin_pct": r[6]
        }
        for r in top_prod_rows
    ]

    # 6. Bottom Products
    bottom_prod_sql = text("""
        SELECT 
            p.product_id,
            p.name,
            p.category,
            SUM(oi.quantity) as units_sold,
            ROUND(SUM(oi.line_total), 2) as revenue,
            ROUND(SUM(oi.gross_profit), 2) as profit,
            ROUND((SUM(oi.gross_profit) * 100.0 / NULLIF(SUM(oi.line_total), 0)), 1) as margin_pct
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'Completed'
        GROUP BY p.product_id, p.name, p.category
        ORDER BY revenue ASC
        LIMIT 5
    """)
    bottom_prod_rows = db.execute(bottom_prod_sql).fetchall()
    bottom_products = [
        {
            "product_id": r[0],
            "name": r[1],
            "category": r[2],
            "units_sold": r[3],
            "revenue": r[4],
            "profit": r[5],
            "margin_pct": r[6]
        }
        for r in bottom_prod_rows
    ]

    # 7. Margin Analysis by Subcategory
    margin_sql = text("""
        SELECT 
            p.subcategory,
            p.category,
            ROUND(SUM(oi.line_total), 2) as revenue,
            ROUND(SUM(oi.gross_profit), 2) as profit,
            ROUND((SUM(oi.gross_profit) * 100.0 / NULLIF(SUM(oi.line_total), 0)), 1) as margin_pct
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        GROUP BY p.subcategory, p.category
        ORDER BY margin_pct DESC
    """)
    margin_rows = db.execute(margin_sql).fetchall()
    margin_analysis = [
        {
            "subcategory": r[0],
            "category": r[1],
            "revenue": r[2],
            "profit": r[3],
            "margin_pct": r[4]
        }
        for r in margin_rows
    ]

    return {
        "kpis": kpis,
        "revenue_timeline": revenue_timeline,
        "sales_by_region": sales_by_region,
        "sales_by_category": sales_by_category,
        "sales_by_channel": sales_by_channel,
        "top_products": top_products,
        "bottom_products": bottom_products,
        "margin_analysis": margin_analysis
    }
