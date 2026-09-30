# OpsPulse AI — System Architecture & Design Document

## 1. Architectural Overview

OpsPulse AI is structured as a modern multi-tier analytics platform designed for high throughput, sub-second query performance, and reliable zero-hallucination insights:

```
[ Client Layer (React 18 / Vite / Tailwind / Recharts) ]
                           │
                           ▼ (HTTP / JSON REST API)
[ API & Services Layer (FastAPI 0.110 / Pydantic v2) ]
     ├── Analytics & KPI Engine
     ├── Machine Learning Workbench (Scikit-Learn)
     ├── Time-Series Forecasting (Statsmodels Holt-Winters)
     ├── Anomaly Detector (Isolation Forest & Z-Score)
     ├── Grounded AI Insights Engine
     └── Natural Language to Safe SQL Translator
                           │
                           ▼ (SQLAlchemy 2.0 ORM & Core)
[ Analytical Data Marts (PostgreSQL / SQLite Star Schema) ]
     ├── Fact Orders & Order Items (100k+ Transactions)
     ├── Dim Customers (RFM Scores & Churn Risk)
     ├── Dim Products & Catalog (Margins & Quadrants)
     ├── Dim Logistics & Deliveries (Carrier SLAs)
     └── Dim Inventory & Warehouses (Days of Supply)
```

## 2. Component Design

### 2.1. Ingestion & ELT Pipeline
- Ingests raw CSV source feeds (`customers`, `products`, `orders`, `order_items`, `deliveries`, `inventory`, `marketing`).
- Runs five-dimensional data profiling: Completeness, Validity, Consistency, Uniqueness, and Freshness.
- Bulk loads data into indexed relational tables using batched SQLAlchemy mappings.

### 2.2. Centralized KPI Engine
- Ensures single source of truth across all dashboards.
- Computes Net Revenue, Gross Profit, Operating Margin %, AOV, Customer Retention Rate, On-Time Delivery SLA %, and Inventory Valuation.

### 2.3. Supervised Churn Classification
- Preprocesses recency, frequency, monetary value, ticket counts, and delivery latency.
- Trains Gradient Boosting, Random Forest, and Logistic Regression with stratified cross-validation.
- Produces feature importances and probability risk scores.

### 2.4. Time-Series Forecasting
- Models monthly sales trajectory using Statsmodels Triple Exponential Smoothing (Holt-Winters).
- Calculates in-sample Mean Absolute Percentage Error (MAPE) and generates 95% statistical prediction bounds.

### 2.5. Natural Language Analytics Assistant
- Matches semantic inquiries with parameterized, allowlisted analytical SQL templates.
- Enforces strict read-only execution to prevent SQL injection vulnerabilities.
