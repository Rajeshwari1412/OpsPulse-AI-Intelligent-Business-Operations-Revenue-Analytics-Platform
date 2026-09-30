from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.analytics.kpi_engine import calculate_executive_kpis

def get_delivery_analytics(db: Session) -> Dict[str, Any]:
    """
    Computes Delivery and Logistics Analytics:
    - Carrier performance benchmark
    - Regional delivery delay heatmap
    - Delay duration distribution
    - Timeline trends
    """
    kpis = calculate_executive_kpis(db)

    # 1. Carrier Performance
    carrier_sql = text("""
        SELECT 
            carrier,
            COUNT(delivery_id) as total_shipments,
            SUM(CASE WHEN delay_days <= 0.0 THEN 1 ELSE 0 END) as on_time_shipments,
            ROUND(AVG(delivery_days), 2) as avg_transit_days,
            ROUND(AVG(delay_days), 2) as avg_delay_days,
            ROUND(AVG(rating), 2) as avg_rating
        FROM deliveries
        GROUP BY carrier
        ORDER BY total_shipments DESC
    """)
    carrier_rows = db.execute(carrier_sql).fetchall()
    carrier_performance = [
        {
            "carrier": r[0],
            "total_shipments": r[1],
            "on_time_pct": round((r[2] / max(1, r[1])) * 100, 1),
            "avg_transit_days": r[3],
            "avg_delay_days": r[4],
            "avg_rating": r[5]
        }
        for r in carrier_rows
    ]

    # 2. Regional Delivery Heatmap Matrix
    heat_sql = text("""
        SELECT 
            region,
            carrier,
            ROUND(AVG(delay_days), 2) as avg_delay,
            ROUND((SUM(CASE WHEN delay_days <= 0.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(delivery_id)), 1) as on_time_rate
        FROM deliveries
        GROUP BY region, carrier
        ORDER BY region, carrier
    """)
    heat_rows = db.execute(heat_sql).fetchall()
    region_delivery_heatmap = [
        {
            "region": r[0],
            "carrier": r[1],
            "avg_delay_days": r[2],
            "on_time_rate": r[3]
        }
        for r in heat_rows
    ]

    # 3. Delay Duration Distribution
    dist_sql = text("""
        SELECT 
            CASE 
                WHEN delay_days <= 0.0 THEN 'On-Time (0 Days)'
                WHEN delay_days <= 1.0 THEN 'Slight Delay (<1 Day)'
                WHEN delay_days <= 2.5 THEN 'Moderate Delay (1-2.5 Days)'
                ELSE 'Severe Delay (>2.5 Days)'
            END as bucket,
            COUNT(delivery_id) as count
        FROM deliveries
        GROUP BY bucket
    """)
    dist_rows = db.execute(dist_sql).fetchall()
    delay_distribution = [
        {"bucket": r[0], "count": r[1]}
        for r in dist_rows
    ]

    # 4. Daily Delivery Trend (Sample recent 30 entries)
    trend_sql = text("""
        SELECT 
            strftime('%Y-%m', dispatch_date) as month,
            COUNT(delivery_id) as shipments,
            ROUND(AVG(delay_days), 2) as avg_delay,
            ROUND((SUM(CASE WHEN delay_days <= 0.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(delivery_id)), 1) as on_time_pct
        FROM deliveries
        WHERE dispatch_date IS NOT NULL
        GROUP BY strftime('%Y-%m', dispatch_date)
        ORDER BY month ASC
    """)
    trend_rows = db.execute(trend_sql).fetchall()
    daily_delivery_trend = [
        {
            "date": r[0],
            "shipments": r[1],
            "avg_delay": r[2],
            "on_time_pct": r[3]
        }
        for r in trend_rows
    ]

    return {
        "kpis": kpis,
        "carrier_performance": carrier_performance,
        "region_delivery_heatmap": region_delivery_heatmap,
        "delay_distribution": delay_distribution,
        "daily_delivery_trend": daily_delivery_trend
    }
