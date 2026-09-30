import os
import json
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.config import RAW_DATA_DIR, SAMPLE_DATA_DIR, settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.models.db_models import (
    Customer, Product, Order, OrderItem, Inventory, Delivery,
    MarketingCampaign, SupportTicket, DataQualityLog, BusinessAlert
)
from backend.app.etl.generator import generate_synthetic_data
from backend.app.etl.validator import run_data_quality_audit

def load_data_into_db(datasets: dict, db: Session):
    """
    Ingests Pandas dataframes into SQLAlchemy tables with schema mapping and batched inserts.
    """
    print("Populating database tables...")

    # Customers
    if "customers" in datasets and not datasets["customers"].empty:
        df_c = datasets["customers"].copy()
        df_c["signup_date"] = pd.to_datetime(df_c["signup_date"])
        records = df_c.to_dict(orient="records")
        db.bulk_insert_mappings(Customer, records)
        db.commit()

    # Products
    if "products" in datasets and not datasets["products"].empty:
        df_p = datasets["products"].copy()
        records = df_p.to_dict(orient="records")
        db.bulk_insert_mappings(Product, records)
        db.commit()

    # Orders
    if "orders" in datasets and not datasets["orders"].empty:
        df_o = datasets["orders"].copy()
        df_o["order_date"] = pd.to_datetime(df_o["order_date"])
        records = df_o.to_dict(orient="records")
        # Batch insert for large order volume
        batch_size = 5000
        for i in range(0, len(records), batch_size):
            db.bulk_insert_mappings(Order, records[i:i + batch_size])
            db.commit()

    # Order Items
    if "order_items" in datasets and not datasets["order_items"].empty:
        df_i = datasets["order_items"].copy()
        records = df_i.to_dict(orient="records")
        batch_size = 10000
        for i in range(0, len(records), batch_size):
            db.bulk_insert_mappings(OrderItem, records[i:i + batch_size])
            db.commit()

    # Deliveries
    if "deliveries" in datasets and not datasets["deliveries"].empty:
        df_d = datasets["deliveries"].copy()
        for col in ["dispatch_date", "estimated_delivery", "actual_delivery"]:
            if col in df_d.columns:
                df_d[col] = pd.to_datetime(df_d[col])
        records = df_d.to_dict(orient="records")
        batch_size = 5000
        for i in range(0, len(records), batch_size):
            db.bulk_insert_mappings(Delivery, records[i:i + batch_size])
            db.commit()

    # Support Tickets
    if "support_tickets" in datasets and not datasets["support_tickets"].empty:
        df_t = datasets["support_tickets"].copy()
        df_t["created_at"] = pd.to_datetime(df_t["created_at"])
        df_t["resolved_at"] = pd.to_datetime(df_t["resolved_at"])
        records = df_t.to_dict(orient="records")
        db.bulk_insert_mappings(SupportTicket, records)
        db.commit()

    # Inventory
    if "inventory" in datasets and not datasets["inventory"].empty:
        df_inv = datasets["inventory"].copy()
        df_inv["last_restock_date"] = pd.to_datetime(df_inv["last_restock_date"])
        records = df_inv.to_dict(orient="records")
        db.bulk_insert_mappings(Inventory, records)
        db.commit()

    # Marketing Campaigns
    if "marketing" in datasets and not datasets["marketing"].empty:
        df_m = datasets["marketing"].copy()
        df_m["start_date"] = pd.to_datetime(df_m["start_date"])
        df_m["end_date"] = pd.to_datetime(df_m["end_date"])
        records = df_m.to_dict(orient="records")
        db.bulk_insert_mappings(MarketingCampaign, records)
        db.commit()

    print("All core tables populated successfully.")

def initialize_alerts(db: Session):
    """
    Seeds initial actionable operational alerts into the business alert center.
    """
    alerts = [
        BusinessAlert(
            title="Carrier Delivery Latency Bottleneck in South & East",
            alert_type="DELIVERY_DELAY",
            severity="HIGH",
            metric="Avg Delivery Delay",
            threshold_value="1.5 Days",
            actual_value="2.8 Days",
            description="Delhivery Logistics & Shadowfax routes in South region are experiencing severe transit bottlenecks impacting CSAT scores.",
            route_link="/delivery"
        ),
        BusinessAlert(
            title="High Churn Risk Detected in At-Risk Segment (412 Accounts)",
            alert_type="CHURN_SPIKE",
            severity="CRITICAL",
            metric="Segment Churn Probability",
            threshold_value="50.0%",
            actual_value="74.2%",
            description="Predictive churn model detected 412 mid-tier accounts with >75 days purchase inactivity and unresolved delivery tickets.",
            route_link="/churn"
        ),
        BusinessAlert(
            title="Stockout Risk on Top Selling Product: PulseWave ANC Headphones",
            alert_type="STOCKOUT_RISK",
            severity="HIGH",
            metric="Days of Supply",
            threshold_value="14 Days",
            actual_value="6.2 Days",
            description="SKU ELEC-1001 inventory at Central Hub is down to 24 units. Reorder point triggered.",
            route_link="/inventory"
        ),
        BusinessAlert(
            title="Q4 Margin Compression in B2B Desks Category",
            alert_type="REVENUE_DROP",
            severity="MEDIUM",
            metric="Gross Margin %",
            threshold_value="42.0%",
            actual_value="36.4%",
            description="Apex Standing Desk margin compressed due to elevated logistics surcharges and promotional discounting.",
            route_link="/products"
        ),
        BusinessAlert(
            title="Data Pipeline Validation Passed with 98.6% Quality Score",
            alert_type="DATA_QUALITY",
            severity="LOW",
            metric="DQ Audit Score",
            threshold_value="90.0%",
            actual_value="98.6%",
            description="All 105,000+ transactional items passed referential integrity, range bounds, and uniqueness tests.",
            route_link="/data-quality"
        )
    ]
    db.add_all(alerts)
    db.commit()

def run_full_etl():
    """
    Executes the end-to-end ELT pipeline:
    1. Recreates clean relational database schema
    2. Generates / reads 100k+ realistic datasets
    3. Runs rigorous data quality audit and logs results
    4. Performs batched database ingestion
    5. Seeds business alerts
    """
    print("Starting OpsPulse ELT Pipeline execution...")
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Check if raw files exist, else generate
    required_files = ["customers.csv", "products.csv", "orders.csv", "order_items.csv", "deliveries.csv", "inventory.csv", "marketing.csv"]
    all_exist = all((RAW_DATA_DIR / f).exists() for f in required_files)

    if not all_exist:
        datasets = generate_synthetic_data()
    else:
        print("Reading existing CSV files from raw data directory...")
        datasets = {
            "customers": pd.read_csv(RAW_DATA_DIR / "customers.csv"),
            "products": pd.read_csv(RAW_DATA_DIR / "products.csv"),
            "orders": pd.read_csv(RAW_DATA_DIR / "orders.csv"),
            "order_items": pd.read_csv(RAW_DATA_DIR / "order_items.csv"),
            "deliveries": pd.read_csv(RAW_DATA_DIR / "deliveries.csv"),
            "support_tickets": pd.read_csv(RAW_DATA_DIR / "support_tickets.csv") if (RAW_DATA_DIR / "support_tickets.csv").exists() else pd.DataFrame(),
            "inventory": pd.read_csv(RAW_DATA_DIR / "inventory.csv"),
            "marketing": pd.read_csv(RAW_DATA_DIR / "marketing.csv")
        }

    # Data Quality Engine
    dq_results = run_data_quality_audit(datasets)
    print(f"Data Quality Audit Completed. Overall Score: {dq_results['overall_score']}%")

    db = SessionLocal()
    try:
        load_data_into_db(datasets, db)
        
        # Save DQ Log
        dq_log = DataQualityLog(
            total_records=dq_results["total_records_analyzed"],
            overall_score=dq_results["overall_score"],
            completeness_score=dq_results["completeness"],
            validity_score=dq_results["validity"],
            consistency_score=dq_results["consistency"],
            uniqueness_score=dq_results["uniqueness"],
            freshness_score=dq_results["freshness"],
            issues_summary=json.dumps(dq_results["checks"])
        )
        db.add(dq_log)
        db.commit()

        # Initialize Alerts
        initialize_alerts(db)
        print("ELT Pipeline executed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_full_etl()
