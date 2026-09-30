from typing import Dict, Any, List
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text

TABLE_METADATA = [
    {"name": "customers", "display_name": "Customers Master", "description": "Customer demographic, RFM segmentation, and predictive churn risk scores."},
    {"name": "products", "display_name": "Products & Catalog", "description": "SKUs, categories, pricing, unit costs, and BCG portfolio quadrant."},
    {"name": "orders", "display_name": "Orders Fact", "description": "Header-level order transactions, channels, timestamps, and discounts."},
    {"name": "order_items", "display_name": "Order Items Fact", "description": "Itemized line items, quantities, gross margins, and product associations."},
    {"name": "deliveries", "display_name": "Deliveries & Carriers", "description": "Carrier logistics, dispatch dates, actual transit days, and delay metrics."},
    {"name": "inventory", "display_name": "Inventory & Stock Levels", "description": "Stock on hand, warehouse locations, days of supply, and stockout flags."},
    {"name": "marketing_campaigns", "display_name": "Marketing Campaigns", "description": "Multi-channel ad budgets, impressions, conversions, CAC, and ROAS."},
    {"name": "support_tickets", "display_name": "Customer Support Tickets", "description": "Customer service tickets, resolution durations, and satisfaction scores."},
]

def get_available_tables() -> List[Dict[str, Any]]:
    return TABLE_METADATA

def get_table_details(table_name: str, db: Session, limit: int = 50, offset: int = 0, search: str = "") -> Dict[str, Any]:
    """
    Returns column metadata, descriptive statistics, and paginated rows for any entity table.
    """
    valid_names = [t["name"] for t in TABLE_METADATA]
    if table_name not in valid_names:
        return {"error": f"Invalid table name '{table_name}'"}

    # Query full table data for profiling
    df = pd.read_sql(f"SELECT * FROM {table_name}", db.bind)
    total_rows = len(df)

    # Column profile
    columns_info = []
    for col in df.columns:
        s = df[col]
        null_cnt = int(s.isnull().sum())
        null_pct = round((null_cnt / max(1, total_rows)) * 100, 1)
        uniq_cnt = int(s.nunique())
        dtype_str = str(s.dtype)

        stats = {}
        if pd.api.types.is_numeric_dtype(s):
            stats = {
                "min": round(float(s.min()), 2) if not s.isnull().all() else None,
                "max": round(float(s.max()), 2) if not s.isnull().all() else None,
                "mean": round(float(s.mean()), 2) if not s.isnull().all() else None,
            }

        columns_info.append({
            "name": col,
            "type": dtype_str,
            "null_count": null_cnt,
            "null_pct": null_pct,
            "unique_count": uniq_cnt,
            "stats": stats
        })

    # Filter/Search if provided
    df_filtered = df
    if search:
        # Text search across string columns
        mask = False
        for col in df.select_dtypes(include=['object', 'string']).columns:
            mask = mask | df[col].astype(str).str.contains(search, case=False, na=False)
        df_filtered = df[mask] if isinstance(mask, pd.Series) else df

    # Paginate
    paged_df = df_filtered.iloc[offset:offset + limit]
    rows = paged_df.fillna("").to_dict(orient="records")

    return {
        "table_name": table_name,
        "total_records": total_rows,
        "filtered_records": len(df_filtered),
        "columns": columns_info,
        "rows": rows,
        "limit": limit,
        "offset": offset
    }
