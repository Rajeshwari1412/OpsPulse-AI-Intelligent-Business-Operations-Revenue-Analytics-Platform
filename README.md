# OpsPulse AI — Intelligent Business Operations, Revenue & Customer Analytics Platform

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-cyan.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.4-orange.svg)](https://scikit-learn.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Compatible-336791.svg)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

OpsPulse AI is an enterprise-grade SaaS analytics and operations intelligence platform designed to transform raw business transaction data into executive visibility, predictive machine learning models, time-series forecasts, and grounded AI insights.

---

## Key Capabilities & Features

### 1. Executive & Operations Dashboards
- **Consolidated KPIs:** Net Revenue, Gross Operating Margin, Orders, AOV, Customer Retention Rate, On-Time SLA %, and Inventory Valuation.
- **Dynamic Filtering:** Global multi-dimensional filtering by Region, Product Category, and Date Presets (FY 2025, Q1 2026, Full Timeline).
- **Interactive Visualizations:** Area charts, Bar breakdowns, and Donut share visualizers built with Recharts.

### 2. Customer Intelligence & RFM Segmentation
- **Mathematical RFM Quintiles:** Classifies customers into Champions, Loyal Customers, Potential Loyalists, New Customers, At-Risk, and Lost Customers.
- **Cohort Retention Heatmap:** Visualizes monthly cohort retention decay ($M_0$ through $M_6$).
- **Customer Lifetime Value (CLV):** Value tier concentration brackets and VIP account rankings.

### 3. Machine Learning Churn Workbench
- **Supervised Classification:** Benchmarks Gradient Boosting, Random Forest, and Logistic Regression on holdout validation data.
- **Evaluation Transparency:** Accuracy, Precision, Recall, F1 Score, ROC-AUC, and Confusion Matrix visualizer.
- **Feature Importance:** Identifies behavioral drivers of attrition (Recency decay, order frequency velocity, carrier delays, and support tickets).

### 4. Time-Series Forecasting & Anomaly Detection
- **Holt-Winters Triple Exponential Smoothing:** Generates 3, 6, or 12-month projections with 95% statistical confidence envelopes.
- **Automated Outlier Detection:** Combines Isolation Forest with rolling 14-day Z-Score envelopes to flag revenue drops, spikes, and logistics bottlenecks with root causes.

### 5. Product Portfolio BCG Matrix
- **Four-Quadrant Matrix:** High Rev / High Margin (Stars), High Rev / Low Margin (Cash Drivers), Low Rev / High Margin (Niche/Growth), Low Rev / Low Margin (Underperformers).
- SKU catalog economics with unit pricing, margin percentages, and inventory health.

### 6. Supply Chain & Logistics Analytics
- **Inventory Intelligence:** Days of supply estimation, stockout risk alerts, and overstock capital tie-up.
- **Carrier Logistics Benchmarks:** Compares BlueDart, FedEx, Delhivery, DHL, and Shadowfax transit speeds, delay durations, and customer CSAT ratings.

### 7. SQL Analytics Lab
- **10+ Prebuilt SQL Queries:** Demonstrates CTEs, Window Functions (`LAG`, `NTILE`, `RANK`, `ROW_NUMBER`, Moving Averages), conditional aggregation, and cohort matrices.
- **Safe Read-Only Console:** Interactive SQL editor with strict query allowlisting.

### 8. Data Engineering & Quality Engine
- **5-Dimensional Quality Audit:** Evaluates Completeness, Validity, Consistency, Uniqueness, and Freshness to produce an overall Data Quality Score (98.5%).
- **CSV Ingestion:** Upload interface validating staging datasets against domain constraints.

### 9. AI Business Insights & Conversational SQL Assistant
- **Grounded AI Explanations:** Zero-hallucination business summaries with analytical evidence checklists and root-cause factor attribution.
- **Ask OpsPulse:** Translates plain-English inquiries into safe parameterized SQL queries and instant data tables.

### 10. Automated Reports Studio
- **Multi-Tab Excel Export:** Formatted openpyxl workbooks with Executive, Sales, RFM, Product, and Inventory worksheets.
- **Print / PDF Briefings:** Clean presentation layout for executive reviews.

---

## Technical Architecture

```
opspulse-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (kpis, sales, churn, sql_lab, explorer, etc.)
│   │   ├── analytics/    # Centralized calculation engines & root-cause decomposition
│   │   ├── ml/           # Scikit-Learn churn models, Isolation Forest, Holt-Winters
│   │   ├── ai/           # Grounded insight engine & Ask OpsPulse NL-SQL assistant
│   │   ├── etl/          # Generator (100k+ records), Validator, and ELT pipeline
│   │   ├── models/       # SQLAlchemy 2.0 and Pydantic v2 schemas
│   │   ├── core/         # Database engine & session management
│   │   └── reports/      # Multi-tab styled openpyxl Excel exporter
│   └── tests/            # Pytest test suite (100% endpoint & analytical test pass rate)
├── frontend/
│   ├── src/
│   │   ├── components/   # Header, Sidebar, GlobalFilterBar, CommandMenu, KpiCard
│   │   ├── pages/        # 16 Specialized analytical pages
│   │   └── services/     # Axios typed API client
├── docs/                 # System architecture, data dictionary, methodology
├── data/                 # Raw and sample CSV datasets (100k+ rows)
├── PROJECT_CASE_STUDY.md # Technical Case Study for Recruiters
├── docker-compose.yml    # Docker container configuration
└── README.md
```

---

## Quick Start & Running Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### 1. Backend Setup
```bash
# Navigate to project root
pip install -r backend/requirements.txt

# Run full ELT pipeline (generates 100k+ records & initializes database)
python -m backend.app.etl.pipeline

# Run pytest test suite
python -m pytest backend/tests/test_opspulse.py

# Start FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API will be accessible at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Vite React development server
npm run dev
```

Frontend application will be accessible at: `http://localhost:3000`

---

## Docker Deployment

To launch the full stack (Frontend, Backend, and Database) with a single command:

```bash
docker-compose up --build
```

---

## Recruiter Summary

This project demonstrates comprehensive capabilities in:
- Full-stack SaaS application development
- Star-schema data warehouse modeling
- Advanced SQL (CTEs, Window Functions, Quintiles, Rolling Averages)
- Applied Machine Learning (Ensemble Classifiers, ROC-AUC, Feature Importance)
- Time-series statistical forecasting & anomaly detection
- Data Quality assurance and business communication
