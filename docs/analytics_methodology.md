# OpsPulse AI — Analytics & Mathematical Methodology

## 1. Centralized KPI Mathematical Formulations

- **Gross Revenue ($R$):**
  $$R = \sum (\text{order\_item.quantity} \times \text{order\_item.unit\_price}) - \text{discounts}$$
- **Gross Profit ($GP$):**
  $$GP = R - \text{COGS}$$
- **Average Order Value ($AOV$):**
  $$AOV = \frac{\text{Gross Revenue}}{\text{Total Completed Orders}}$$
- **Customer Retention Rate ($CRR$):**
  $$CRR = \frac{\text{Customers with } >1 \text{ Completed Order}}{\text{Total Customer Accounts}} \times 100$$
- **On-Time Delivery Rate ($OTR$):**
  $$OTR = \frac{\text{Deliveries with Delay } \le 0.0}{\text{Total Completed Deliveries}} \times 100$$
- **Days of Supply ($DOS$):**
  $$DOS = \frac{\text{Stock On Hand}}{\text{Average Daily Unit Demand}}$$

---

## 2. RFM Segmentation Logic

Customers are partitioned into 5 quintiles ($1 \le Q \le 5$) for Recency ($R$), Frequency ($F$), and Monetary Value ($M$):

$$\text{FM}_{\text{avg}} = \frac{F + M}{2}$$

| Segment Classification | Quintile Rule |
| :--- | :--- |
| **Champions** | $R \ge 4 \land \text{FM}_{\text{avg}} \ge 4$ |
| **Loyal Customers** | $R \ge 3 \land \text{FM}_{\text{avg}} \ge 3$ |
| **Potential Loyalists** | $R \ge 3 \land \text{FM}_{\text{avg}} < 3$ |
| **New Customers** | $R \ge 4 \land F \le 2$ |
| **At Risk** | $R \le 2 \land \text{FM}_{\text{avg}} \ge 3$ |
| **Lost Customers** | $R \le 2 \land \text{FM}_{\text{avg}} < 3$ |

---

## 3. Time-Series Holt-Winters Formulation

Additive Holt-Winters model decomposes time-series $y_t$ into level ($l_t$), trend ($b_t$), and seasonal component ($s_t$):

$$\hat{y}_{t+h\mid t} = l_t + h b_t + s_{t+h-m(k+1)}$$
$$l_t = \alpha (y_t - s_{t-m}) + (1 - \alpha)(l_{t-1} + b_{t-1})$$
$$b_t = \beta (l_t - l_{t-1}) + (1 - \beta) b_{t-1}$$

---

## 4. Anomaly Detection Isolation Forest & Z-Score

Rolling Z-Score on window $W = 14$ days:

$$Z_t = \frac{y_t - \mu_{W}}{\sigma_{W}}$$

Points where $|Z_t| \ge 2.2$ or Isolation Forest decision function $s(x, n) \le 0$ are classified as operational anomalies.
