export interface KPICardData {
  id: string;
  title: string;
  value: number;
  formatted_value: string;
  previous_value: number;
  change_pct: number;
  trend: 'up' | 'down' | 'neutral';
  is_positive: boolean;
  sparkline: number[];
  unit: string;
  benchmark_note?: string;
}

export interface ExecutiveOverviewData {
  kpis: KPICardData[];
  revenue_trend: Array<{ date: string; revenue: number; profit: number; orders: number }>;
  regional_breakdown: Array<{ region: string; revenue: number; orders: number; share_pct: number }>;
  category_breakdown: Array<{ category: string; revenue: number; profit: number; margin_pct: number }>;
  recent_anomalies_count: number;
  critical_alerts_count: number;
  data_quality_score: number;
}

export interface RFMSegment {
  segment: string;
  customer_count: number;
  avg_recency_days: number;
  avg_frequency: number;
  avg_monetary: number;
  total_revenue: number;
  churn_rate: number;
  share_pct: number;
}

export interface ChurnModelEval {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  is_selected: boolean;
}

export interface ProductPortfolioItem {
  product_id: string;
  name: string;
  category: string;
  revenue: number;
  profit_margin_pct: number;
  units_sold: number;
  quadrant: string;
  stock_status: string;
}

export interface BusinessAlertItem {
  id: number;
  title: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metric: string;
  threshold_value: string;
  actual_value: string;
  description: string;
  route_link: string;
  is_active: boolean;
  created_at: string;
}

export interface AIInsightItem {
  id: string;
  category: string;
  title: string;
  severity: 'Positive' | 'Warning' | 'Critical' | 'Opportunity';
  observation: string;
  evidence: string[];
  root_cause_analysis: string;
  recommended_action: string;
  confidence_score: number;
}
