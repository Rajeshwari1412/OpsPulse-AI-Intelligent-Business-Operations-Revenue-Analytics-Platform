import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.analytics.kpi_engine import calculate_executive_kpis
from backend.app.analytics.sales import get_sales_analytics
from backend.app.analytics.customers import get_customer_analytics
from backend.app.ml.churn_model import train_and_evaluate_churn_models
from backend.app.ml.forecasting import generate_business_forecast
from backend.app.ml.anomaly_detector import detect_business_anomalies
from backend.app.api.sql_lab import execute_user_sql

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["platform"] == "OpsPulse AI"

def test_executive_overview_endpoint():
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert len(data["kpis"]) >= 5
    assert len(data["revenue_trend"]) > 0
    assert len(data["regional_breakdown"]) > 0

def test_kpi_engine_calculation():
    db = SessionLocal()
    try:
        kpis = calculate_executive_kpis(db)
        assert len(kpis) >= 6
        rev_kpi = next((k for k in kpis if k["id"] == "revenue"), None)
        assert rev_kpi is not None
        assert rev_kpi["value"] > 0
    finally:
        db.close()

def test_customer_analytics_rfm():
    db = SessionLocal()
    try:
        cust_res = get_customer_analytics(db)
        assert len(cust_res["rfm_segments"]) > 0
        assert len(cust_res["cohort_retention"]["matrix"]) > 0
    finally:
        db.close()

def test_churn_ml_workbench():
    db = SessionLocal()
    try:
        churn_res = train_and_evaluate_churn_models(db)
        assert "model_comparisons" in churn_res
        assert len(churn_res["model_comparisons"]) == 3
        assert len(churn_res["feature_importance"]) > 0
    finally:
        db.close()

def test_forecasting_module():
    db = SessionLocal()
    try:
        forecast_res = generate_business_forecast(db, metric="revenue", horizon_months=6)
        assert len(forecast_res["forecast_points"]) > 6
        assert forecast_res["mape_score"] >= 0
    finally:
        db.close()

def test_anomaly_detection():
    db = SessionLocal()
    try:
        anom_res = detect_business_anomalies(db)
        assert anom_res["total_anomalies"] > 0
        assert len(anom_res["anomalies"]) > 0
    finally:
        db.close()

def test_sql_lab_safe_execution():
    db = SessionLocal()
    try:
        # Safe SELECT
        res = execute_user_sql("SELECT COUNT(*) as total_orders FROM orders WHERE status = 'Completed'", db)
        assert res["is_safe"] is True
        assert res["row_count"] == 1
        assert res["rows"][0]["total_orders"] > 0

        # Unsafe DROP injection test
        unsafe_res = execute_user_sql("DROP TABLE orders;", db)
        assert unsafe_res["is_safe"] is False
        assert "Security Violation" in unsafe_res["error_message"]
    finally:
        db.close()

def test_ask_opspulse_assistant():
    response = client.post("/api/ask-opspulse", json={"question": "Which products generated highest profit?"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data_table"]) > 0
    assert "SELECT" in data["sql_query"]
