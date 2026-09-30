from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.analytics.kpi_engine import calculate_executive_kpis

def get_inventory_analytics(db: Session) -> Dict[str, Any]:
    """
    Computes inventory intelligence:
    - Stock status breakdown (Potential Stockout, Potential Overstock, Stable)
    - High-risk stockout SKUs and days of supply
    - Overstocked items with capital tie-up
    - Inventory turnover by category
    - Warehouse distribution
    """
    kpis = calculate_executive_kpis(db)

    # 1. Stock Status Breakdown
    status_sql = text("""
        SELECT 
            stock_status,
            COUNT(inventory_id) as item_count,
            SUM(stock_on_hand) as total_units
        FROM inventory
        GROUP BY stock_status
    """)
    status_rows = db.execute(status_sql).fetchall()
    stock_status_breakdown = [
        {"status": r[0], "item_count": r[1], "total_units": r[2]}
        for r in status_rows
    ]

    # 2. Stockout Risk Items
    risk_sql = text("""
        SELECT 
            p.product_id,
            p.name,
            p.category,
            i.stock_on_hand,
            i.available_stock,
            i.reorder_point,
            i.days_of_supply,
            i.inventory_turnover,
            i.warehouse_location
        FROM inventory i
        JOIN products p ON i.product_id = p.product_id
        WHERE i.stock_status = 'Potential Stockout' OR i.days_of_supply < 15
        ORDER BY i.days_of_supply ASC
    """)
    risk_rows = db.execute(risk_sql).fetchall()
    stockout_risk_items = [
        {
            "product_id": r[0],
            "name": r[1],
            "category": r[2],
            "stock_on_hand": r[3],
            "available_stock": r[4],
            "reorder_point": r[5],
            "days_of_supply": r[6],
            "turnover": r[7],
            "warehouse": r[8]
        }
        for r in risk_rows
    ]

    # 3. Overstock Risk Items
    over_sql = text("""
        SELECT 
            p.product_id,
            p.name,
            p.category,
            i.stock_on_hand,
            i.days_of_supply,
            ROUND(i.stock_on_hand * p.cost_price, 2) as capital_tied_up,
            i.warehouse_location
        FROM inventory i
        JOIN products p ON i.product_id = p.product_id
        WHERE i.stock_status = 'Potential Overstock' OR i.days_of_supply > 50
        ORDER BY capital_tied_up DESC
    """)
    over_rows = db.execute(over_sql).fetchall()
    overstock_risk_items = [
        {
            "product_id": r[0],
            "name": r[1],
            "category": r[2],
            "stock_on_hand": r[3],
            "days_of_supply": r[4],
            "capital_tied_up": r[5],
            "warehouse": r[6]
        }
        for r in over_rows
    ]

    # 4. Turnover by Category
    turn_sql = text("""
        SELECT 
            p.category,
            ROUND(AVG(i.inventory_turnover), 2) as avg_turnover,
            ROUND(AVG(i.days_of_supply), 1) as avg_days_supply,
            SUM(i.stock_on_hand) as total_stock
        FROM inventory i
        JOIN products p ON i.product_id = p.product_id
        GROUP BY p.category
        ORDER BY avg_turnover DESC
    """)
    turn_rows = db.execute(turn_sql).fetchall()
    turnover_by_category = [
        {
            "category": r[0],
            "avg_turnover": r[1],
            "avg_days_supply": r[2],
            "total_stock": r[3]
        }
        for r in turn_rows
    ]

    # 5. Warehouse distribution
    wh_sql = text("""
        SELECT 
            warehouse_location,
            COUNT(inventory_id) as sku_count,
            SUM(stock_on_hand) as total_units
        FROM inventory
        GROUP BY warehouse_location
    """)
    wh_rows = db.execute(wh_sql).fetchall()
    warehouse_distribution = [
        {"warehouse": r[0], "sku_count": r[1], "total_units": r[2]}
        for r in wh_rows
    ]

    return {
        "kpis": kpis,
        "stock_status_breakdown": stock_status_breakdown,
        "stockout_risk_items": stockout_risk_items,
        "overstock_risk_items": overstock_risk_items,
        "turnover_by_category": turnover_by_category,
        "warehouse_distribution": warehouse_distribution
    }
