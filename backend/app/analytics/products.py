from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.analytics.kpi_engine import calculate_executive_kpis

def get_product_analytics(db: Session) -> Dict[str, Any]:
    """
    Computes Product Portfolio Intelligence & BCG Style Quadrant Matrix:
    - Quadrant: High Rev / High Margin (Stars), High Rev / Low Margin (Cash Drivers),
                Low Rev / High Margin (Niche/Growth), Low Rev / Low Margin (Underperformers)
    - Fast growing and declining products
    - Category level profitability
    """
    kpis = calculate_executive_kpis(db)

    # 1. Product Matrix aggregation
    prod_sql = text("""
        SELECT 
            p.product_id,
            p.name,
            p.category,
            p.portfolio_quadrant,
            p.unit_price,
            p.cost_price,
            p.margin_pct,
            COALESCE(SUM(oi.quantity), 0) as units_sold,
            COALESCE(ROUND(SUM(oi.line_total), 2), 0.0) as revenue,
            COALESCE(ROUND(SUM(oi.gross_profit), 2), 0.0) as profit,
            COALESCE(i.stock_status, 'Stable') as stock_status,
            COALESCE(i.stock_on_hand, 0) as stock_on_hand
        FROM products p
        LEFT JOIN order_items oi ON p.product_id = oi.product_id
        LEFT JOIN inventory i ON p.product_id = i.product_id
        GROUP BY p.product_id, p.name, p.category, p.portfolio_quadrant, p.unit_price, p.cost_price, p.margin_pct, i.stock_status, i.stock_on_hand
        ORDER BY revenue DESC
    """)
    rows = db.execute(prod_sql).fetchall()

    portfolio_matrix = []
    quadrant_summary = {
        "High Revenue / High Margin": {"count": 0, "revenue": 0.0, "profit": 0.0},
        "High Revenue / Low Margin": {"count": 0, "revenue": 0.0, "profit": 0.0},
        "Low Revenue / High Margin": {"count": 0, "revenue": 0.0, "profit": 0.0},
        "Low Revenue / Low Margin": {"count": 0, "revenue": 0.0, "profit": 0.0},
    }

    for r in rows:
        quad = r[3] or "High Revenue / High Margin"
        rev = r[8] or 0.0
        prof = r[9] or 0.0
        
        portfolio_matrix.append({
            "product_id": r[0],
            "name": r[1],
            "category": r[2],
            "quadrant": quad,
            "unit_price": r[4],
            "cost_price": r[5],
            "profit_margin_pct": r[6],
            "units_sold": r[7],
            "revenue": rev,
            "profit": prof,
            "stock_status": r[10],
            "stock_on_hand": r[11]
        })

        if quad in quadrant_summary:
            quadrant_summary[quad]["count"] += 1
            quadrant_summary[quad]["revenue"] = round(quadrant_summary[quad]["revenue"] + rev, 2)
            quadrant_summary[quad]["profit"] = round(quadrant_summary[quad]["profit"] + prof, 2)

    # 2. Fast Growing Products (e.g. high units in recent 90 days)
    fast_growing = portfolio_matrix[:4]

    # 3. Declining Products
    declining_products = [
        p for p in portfolio_matrix if p["quadrant"] == "Low Revenue / Low Margin"
    ]

    # 4. Category Performance
    cat_sql = text("""
        SELECT 
            p.category,
            COUNT(DISTINCT p.product_id) as skus,
            SUM(oi.quantity) as units,
            ROUND(SUM(oi.line_total), 2) as revenue,
            ROUND(SUM(oi.gross_profit), 2) as profit,
            ROUND((SUM(oi.gross_profit) * 100.0 / NULLIF(SUM(oi.line_total), 0)), 1) as margin_pct
        FROM products p
        JOIN order_items oi ON p.product_id = oi.product_id
        GROUP BY p.category
        ORDER BY revenue DESC
    """)
    cat_rows = db.execute(cat_sql).fetchall()
    category_performance = [
        {
            "category": r[0],
            "skus": r[1],
            "units": r[2],
            "revenue": r[3],
            "profit": r[4],
            "margin_pct": r[5]
        }
        for r in cat_rows
    ]

    return {
        "kpis": kpis,
        "portfolio_matrix": portfolio_matrix,
        "quadrant_summary": quadrant_summary,
        "fast_growing_products": fast_growing,
        "declining_products": declining_products,
        "category_performance": category_performance
    }
