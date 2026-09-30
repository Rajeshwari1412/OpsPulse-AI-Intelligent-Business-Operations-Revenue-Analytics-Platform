import io
import json
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.core.database import get_db
from backend.app.config import RAW_DATA_DIR
from backend.app.models.schema import (
    ExecutiveOverview, SalesAnalyticsResponse, CustomerAnalyticsResponse,
    ChurnPredictionResponse, ProductAnalyticsResponse, InventoryAnalyticsResponse,
    DeliveryAnalyticsResponse, MarketingAnalyticsResponse, AnomalyDetectionResponse,
    ForecastResponse, AIInsightsResponse, AskOpsPulseRequest, AskOpsPulseResponse,
    DataQualityResponse, SqlLabQuery, SqlExecutionRequest, SqlExecutionResponse
)
from backend.app.analytics.kpi_engine import calculate_executive_kpis
from backend.app.analytics.sales import get_sales_analytics
from backend.app.analytics.customers import get_customer_analytics
from backend.app.analytics.products import get_product_analytics
from backend.app.analytics.inventory import get_inventory_analytics
from backend.app.analytics.delivery import get_delivery_analytics
from backend.app.analytics.marketing import get_marketing_analytics
from backend.app.analytics.root_cause import perform_root_cause_analysis
from backend.app.ml.churn_model import train_and_evaluate_churn_models
from backend.app.ml.anomaly_detector import detect_business_anomalies
from backend.app.ml.forecasting import generate_business_forecast
from backend.app.ai.insight_engine import generate_ai_business_insights
from backend.app.ai.nl_query_engine import ask_opspulse
from backend.app.etl.validator import run_data_quality_audit
from backend.app.api.sql_lab import PREBUILT_SQL_QUERIES, execute_user_sql
from backend.app.api.explorer import get_available_tables, get_table_details
from backend.app.reports.excel_exporter import generate_comprehensive_excel_report
from backend.app.models.db_models import BusinessAlert, DataQualityLog

router = APIRouter()

@router.get("/overview", response_model=ExecutiveOverview)
def get_executive_overview(
    region: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    filters = {"region": region, "category": category, "start_date": start_date, "end_date": end_date}
    kpis = calculate_executive_kpis(db, filters)
    sales = get_sales_analytics(db, filters)
    
    dq_score = 98.5
    latest_dq = db.query(DataQualityLog).order_by(DataQualityLog.timestamp.desc()).first()
    if latest_dq:
        dq_score = latest_dq.overall_score

    alerts_cnt = db.query(BusinessAlert).filter(BusinessAlert.severity.in_(["CRITICAL", "HIGH"])).count()

    return {
        "kpis": kpis,
        "revenue_trend": sales["revenue_timeline"],
        "regional_breakdown": sales["sales_by_region"],
        "category_breakdown": sales["sales_by_category"],
        "recent_anomalies_count": 3,
        "critical_alerts_count": alerts_cnt,
        "data_quality_score": dq_score
    }

@router.get("/kpis")
def get_kpi_cards(
    region: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    filters = {"region": region, "start_date": start_date, "end_date": end_date}
    return calculate_executive_kpis(db, filters)

@router.get("/sales", response_model=SalesAnalyticsResponse)
def sales_analytics(
    region: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    filters = {"region": region, "category": category, "start_date": start_date, "end_date": end_date}
    return get_sales_analytics(db, filters)

@router.get("/customers", response_model=CustomerAnalyticsResponse)
def customer_analytics(db: Session = Depends(get_db)):
    return get_customer_analytics(db)

@router.get("/churn", response_model=ChurnPredictionResponse)
def churn_workbench(db: Session = Depends(get_db)):
    return train_and_evaluate_churn_models(db)

@router.get("/products", response_model=ProductAnalyticsResponse)
def product_analytics(db: Session = Depends(get_db)):
    return get_product_analytics(db)

@router.get("/inventory", response_model=InventoryAnalyticsResponse)
def inventory_analytics(db: Session = Depends(get_db)):
    return get_inventory_analytics(db)

@router.get("/deliveries", response_model=DeliveryAnalyticsResponse)
def delivery_analytics(db: Session = Depends(get_db)):
    return get_delivery_analytics(db)

@router.get("/marketing", response_model=MarketingAnalyticsResponse)
def marketing_analytics(db: Session = Depends(get_db)):
    return get_marketing_analytics(db)

@router.get("/anomalies", response_model=AnomalyDetectionResponse)
def anomaly_detection(db: Session = Depends(get_db)):
    return detect_business_anomalies(db)

@router.get("/forecast", response_model=ForecastResponse)
def forecasting_lab(
    metric: str = Query("revenue", enum=["revenue", "orders"]),
    horizon: int = Query(6, ge=1, le=12),
    db: Session = Depends(get_db)
):
    return generate_business_forecast(db, metric=metric, horizon_months=horizon)

@router.get("/insights", response_model=AIInsightsResponse)
def ai_insights(db: Session = Depends(get_db)):
    return generate_ai_business_insights(db)

@router.get("/root-cause")
def root_cause_analysis(
    metric: str = Query("revenue"),
    db: Session = Depends(get_db)
):
    return perform_root_cause_analysis(db, target_metric=metric)

@router.post("/ask-opspulse", response_model=AskOpsPulseResponse)
def ask_assistant(req: AskOpsPulseRequest, db: Session = Depends(get_db)):
    return ask_opspulse(req.question, db)

@router.get("/data-quality", response_model=DataQualityResponse)
def data_quality_report(db: Session = Depends(get_db)):
    # Read CSVs for DQ profile
    datasets = {
        "customers": pd.read_sql("SELECT * FROM customers", db.bind),
        "products": pd.read_sql("SELECT * FROM products", db.bind),
        "orders": pd.read_sql("SELECT * FROM orders", db.bind),
        "order_items": pd.read_sql("SELECT * FROM order_items", db.bind),
        "deliveries": pd.read_sql("SELECT * FROM deliveries", db.bind),
        "inventory": pd.read_sql("SELECT * FROM inventory", db.bind),
        "marketing": pd.read_sql("SELECT * FROM marketing_campaigns", db.bind),
    }
    return run_data_quality_audit(datasets)

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(BusinessAlert).order_by(BusinessAlert.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "metric": a.metric,
            "threshold_value": a.threshold_value,
            "actual_value": a.actual_value,
            "description": a.description,
            "route_link": a.route_link,
            "is_active": a.is_active,
            "created_at": a.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for a in alerts
    ]

@router.get("/sql-lab/queries", response_model=List[SqlLabQuery])
def list_sql_lab_queries():
    return PREBUILT_SQL_QUERIES

@router.post("/sql-lab/execute", response_model=SqlExecutionResponse)
def execute_sql(req: SqlExecutionRequest, db: Session = Depends(get_db)):
    return execute_user_sql(req.sql, db)

@router.get("/explorer/tables")
def list_explorer_tables():
    return get_available_tables()

@router.get("/explorer/table/{table_name}")
def explore_table(
    table_name: str,
    limit: int = 50,
    offset: int = 0,
    search: str = "",
    db: Session = Depends(get_db)
):
    return get_table_details(table_name, db, limit=limit, offset=offset, search=search)

@router.get("/export/excel")
def download_excel(db: Session = Depends(get_db)):
    file_bytes = generate_comprehensive_excel_report(db)
    return StreamingResponse(
        file_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=OpsPulse_AI_Analytics_Report.xlsx"}
    )

@router.post("/upload")
async def upload_csv_dataset(
    file: UploadFile = File(...),
    dataset_type: str = Query("orders", enum=["orders", "customers", "products", "inventory", "deliveries", "marketing"])
):
    """
    Accepts CSV upload, saves to raw storage, runs validation audit, and returns feedback.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    content = await file.read()
    dest_path = RAW_DATA_DIR / f"uploaded_{dataset_type}_{file.filename}"
    with open(dest_path, "wb") as f:
        f.write(content)

    # Validate uploaded dataframe
    df_uploaded = pd.read_csv(dest_path)
    audit = run_data_quality_audit({dataset_type: df_uploaded})

    return {
        "status": "success",
        "filename": file.filename,
        "records_ingested": len(df_uploaded),
        "quality_score": audit["overall_score"],
        "message": f"Successfully ingested {len(df_uploaded):,} rows into {dataset_type} staging layer with a {audit['overall_score']}% data quality score."
    }
