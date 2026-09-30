from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.analytics.kpi_engine import calculate_executive_kpis

def get_marketing_analytics(db: Session) -> Dict[str, Any]:
    """
    Computes Marketing Campaign & Acquisition Analytics:
    - Channel Performance (Spend, Impressions, Clicks, Conversions, CTR, CPC, ROAS, CAC)
    - Campaign Comparison
    - CAC vs ROAS Matrix
    """
    kpis = calculate_executive_kpis(db)

    # 1. Channel Performance
    chan_sql = text("""
        SELECT 
            channel,
            ROUND(SUM(spend), 2) as total_spend,
            SUM(impressions) as total_impressions,
            SUM(clicks) as total_clicks,
            SUM(conversions) as total_conversions,
            ROUND(SUM(attributed_revenue), 2) as total_revenue,
            ROUND(SUM(attributed_revenue) / NULLIF(SUM(spend), 0), 2) as avg_roas,
            ROUND(SUM(spend) / NULLIF(SUM(conversions), 0), 2) as avg_cac
        FROM marketing_campaigns
        GROUP BY channel
        ORDER BY total_revenue DESC
    """)
    chan_rows = db.execute(chan_sql).fetchall()
    channel_performance = [
        {
            "channel": r[0],
            "spend": r[1],
            "impressions": r[2],
            "clicks": r[3],
            "conversions": r[4],
            "revenue": r[5],
            "roas": r[6],
            "cac": r[7],
            "ctr_pct": round((r[3] / max(1, r[2])) * 100, 2)
        }
        for r in chan_rows
    ]

    # 2. Campaign Comparison
    camp_sql = text("""
        SELECT 
            campaign_id,
            name,
            channel,
            target_region,
            spend,
            conversions,
            attributed_revenue,
            roas,
            cac
        FROM marketing_campaigns
        ORDER BY roas DESC
    """)
    camp_rows = db.execute(camp_sql).fetchall()
    campaign_comparison = [
        {
            "campaign_id": r[0],
            "name": r[1],
            "channel": r[2],
            "region": r[3],
            "spend": r[4],
            "conversions": r[5],
            "revenue": r[6],
            "roas": r[7],
            "cac": r[8]
        }
        for r in camp_rows
    ]

    # 3. CAC vs ROAS Scatter Matrix
    cac_vs_roas_matrix = [
        {
            "name": c["name"],
            "channel": c["channel"],
            "cac": c["cac"],
            "roas": c["roas"],
            "spend": c["spend"],
            "conversions": c["conversions"]
        }
        for c in campaign_comparison
    ]

    return {
        "kpis": kpis,
        "channel_performance": channel_performance,
        "campaign_comparison": campaign_comparison,
        "cac_vs_roas_matrix": cac_vs_roas_matrix
    }
