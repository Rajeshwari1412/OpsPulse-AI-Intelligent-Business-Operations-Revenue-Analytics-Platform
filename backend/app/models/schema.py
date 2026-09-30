from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class DateRangeFilter(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    region: Optional[str] = None
    category: Optional[str] = None
    customer_segment: Optional[str] = None
    channel: Optional[str] = None

class KPICard(BaseModel):
    id: str
    title: str
    value: float
    formatted_value: str
    previous_value: float
    change_pct: float
    trend: str  # "up", "down", "neutral"
    is_positive: bool
    sparkline: List[float] = []
    unit: str = "$"
    benchmark_note: Optional[str] = None

class ExecutiveOverview(BaseModel):
    kpis: List[KPICard]
    revenue_trend: List[Dict[str, Any]]
    regional_breakdown: List[Dict[str, Any]]
    category_breakdown: List[Dict[str, Any]]
    recent_anomalies_count: int
    critical_alerts_count: int
    data_quality_score: float

class SalesAnalyticsResponse(BaseModel):
    kpis: List[KPICard]
    revenue_timeline: List[Dict[str, Any]]
    sales_by_region: List[Dict[str, Any]]
    sales_by_category: List[Dict[str, Any]]
    sales_by_channel: List[Dict[str, Any]]
    top_products: List[Dict[str, Any]]
    bottom_products: List[Dict[str, Any]]
    margin_analysis: List[Dict[str, Any]]

class RFMDistribution(BaseModel):
    segment: str
    customer_count: int
    avg_recency_days: float
    avg_frequency: float
    avg_monetary: float
    total_revenue: float
    churn_rate: float
    share_pct: float

class CohortRetentionResponse(BaseModel):
    cohorts: List[str]
    periods: List[str]
    matrix: List[Dict[str, Any]] # {"cohort": "2025-01", "size": 420, "m0": 100.0, "m1": 42.5, ...}

class CustomerAnalyticsResponse(BaseModel):
    kpis: List[KPICard]
    rfm_segments: List[RFMDistribution]
    cohort_retention: CohortRetentionResponse
    clv_distribution: List[Dict[str, Any]]
    churn_risk_summary: Dict[str, int]
    top_customers: List[Dict[str, Any]]

class ChurnModelEvaluation(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    is_selected: bool

class ChurnPredictionResponse(BaseModel):
    model_comparisons: List[ChurnModelEvaluation]
    confusion_matrix: Dict[str, Any]
    feature_importance: List[Dict[str, Any]]
    risk_distribution: Dict[str, int]
    high_risk_customers: List[Dict[str, Any]]
    churn_drivers_summary: List[str]

class ProductPortfolioItem(BaseModel):
    product_id: str
    name: str
    category: str
    revenue: float
    profit_margin_pct: float
    units_sold: int
    quadrant: str
    stock_status: str

class ProductAnalyticsResponse(BaseModel):
    kpis: List[KPICard]
    portfolio_matrix: List[ProductPortfolioItem]
    quadrant_summary: Dict[str, Any]
    fast_growing_products: List[Dict[str, Any]]
    declining_products: List[Dict[str, Any]]
    category_performance: List[Dict[str, Any]]

class InventoryAnalyticsResponse(BaseModel):
    kpis: List[KPICard]
    stock_status_breakdown: List[Dict[str, Any]]
    stockout_risk_items: List[Dict[str, Any]]
    overstock_risk_items: List[Dict[str, Any]]
    turnover_by_category: List[Dict[str, Any]]
    warehouse_distribution: List[Dict[str, Any]]

class DeliveryAnalyticsResponse(BaseModel):
    kpis: List[KPICard]
    carrier_performance: List[Dict[str, Any]]
    region_delivery_heatmap: List[Dict[str, Any]]
    delay_distribution: List[Dict[str, Any]]
    daily_delivery_trend: List[Dict[str, Any]]

class MarketingAnalyticsResponse(BaseModel):
    kpis: List[KPICard]
    channel_performance: List[Dict[str, Any]]
    campaign_comparison: List[Dict[str, Any]]
    cac_vs_roas_matrix: List[Dict[str, Any]]

class AnomalyItem(BaseModel):
    anomaly_date: str
    metric: str
    actual_value: float
    expected_value: float
    deviation_pct: float
    severity: str # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    dimension: str
    possible_explanation: str
    suggested_action: str

class AnomalyDetectionResponse(BaseModel):
    total_anomalies: int
    anomalies: List[AnomalyItem]
    anomalies_timeline: List[Dict[str, Any]]
    methodology: str

class ForecastPoint(BaseModel):
    date: str
    historical: Optional[float] = None
    forecast: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class ForecastResponse(BaseModel):
    metric_name: str
    model_used: str
    mape_score: float
    trend_direction: str
    forecast_points: List[ForecastPoint]
    executive_takeaway: str

class AIInsightItem(BaseModel):
    id: str
    category: str # "Revenue", "Customers", "Operations", "Inventory"
    title: str
    severity: str # "Positive", "Warning", "Critical", "Opportunity"
    observation: str
    evidence: List[str]
    root_cause_analysis: str
    recommended_action: str
    confidence_score: float

class AIInsightsResponse(BaseModel):
    generated_at: str
    engine_mode: str # "Rule-Based Grounded Engine" or "LLM Assisted"
    summary: str
    insights: List[AIInsightItem]
    waterfall_factors: List[Dict[str, Any]]

class AskOpsPulseRequest(BaseModel):
    question: str

class AskOpsPulseResponse(BaseModel):
    question: str
    interpreted_intent: str
    sql_query: str
    answer_summary: str
    data_table: List[Dict[str, Any]]
    chart_suggestion: Optional[Dict[str, Any]] = None
    execution_time_ms: float

class DataQualityCheck(BaseModel):
    check_name: str
    dimension: str # Completeness, Validity, Consistency, Uniqueness, Freshness
    status: str # "PASS", "WARN", "FAIL"
    score: float
    affected_rows: int
    description: str
    recommended_fix: str

class DataQualityResponse(BaseModel):
    overall_score: float
    completeness: float
    validity: float
    consistency: float
    uniqueness: float
    freshness: float
    total_records_analyzed: int
    checks: List[DataQualityCheck]
    dataset_profiles: List[Dict[str, Any]]

class SqlLabQuery(BaseModel):
    id: int
    title: str
    category: str
    difficulty: str # "Intermediate", "Advanced", "Expert"
    business_question: str
    sql: str
    explanation: str

class SqlExecutionRequest(BaseModel):
    sql: str

class SqlExecutionResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    is_safe: bool
    error_message: Optional[str] = None
