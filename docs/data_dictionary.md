# OpsPulse AI — Data Dictionary

## 1. Relational Entities & Attributes

### Table: `customers`
| Column | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `customer_id` | `VARCHAR(50)` | NO (PK) | Unique customer identifier (`CUST-00001` format) |
| `first_name` | `VARCHAR(100)` | YES | Customer given name |
| `last_name` | `VARCHAR(100)` | YES | Customer family name |
| `email` | `VARCHAR(150)` | NO (Unique) | Unique customer email address |
| `region` | `VARCHAR(50)` | NO | Geographic territory (North, South, East, West, Central) |
| `signup_date` | `DATETIME` | NO | User account registration timestamp |
| `rfm_segment` | `VARCHAR(50)` | YES | RFM cohort (Champions, Loyal, Potential, At Risk, Lost) |
| `r_score` | `INTEGER` | YES | Recency quintile score (1 to 5) |
| `f_score` | `INTEGER` | YES | Frequency quintile score (1 to 5) |
| `m_score` | `INTEGER` | YES | Monetary quintile score (1 to 5) |
| `clv_score` | `FLOAT` | YES | Cumulative customer lifetime value ($) |
| `churn_risk` | `VARCHAR(20)` | YES | Categorical churn tier (`LOW`, `MEDIUM`, `HIGH`) |
| `churn_probability` | `FLOAT` | YES | Supervised model output probability (0.0 to 1.0) |

### Table: `products`
| Column | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `product_id` | `VARCHAR(50)` | NO (PK) | Unique SKU identifier (`PROD-001` format) |
| `sku` | `VARCHAR(50)` | NO (Unique) | Manufacturer catalog SKU code |
| `name` | `VARCHAR(200)` | NO | Commercial product title |
| `category` | `VARCHAR(100)` | NO | Top-level division (Electronics, Office, IoT, etc.) |
| `subcategory` | `VARCHAR(100)` | YES | Granular product family |
| `unit_price` | `FLOAT` | NO | Selling price to customer ($) |
| `cost_price` | `FLOAT` | NO | Cost of goods sold / unit manufacturing cost ($) |
| `margin_pct` | `FLOAT` | YES | Calculated gross profit margin percentage |
| `portfolio_quadrant`| `VARCHAR(50)` | YES | BCG Matrix quadrant assignment |

### Table: `orders`
| Column | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `order_id` | `VARCHAR(50)` | NO (PK) | Unique order reference (`ORD-0000001`) |
| `customer_id` | `VARCHAR(50)` | NO (FK) | Reference to `customers.customer_id` |
| `order_date` | `DATETIME` | NO | Transaction placement timestamp |
| `channel` | `VARCHAR(50)` | NO | Acquisition channel (Web, App, B2B Portal, Retail) |
| `status` | `VARCHAR(50)` | NO | Order state (`Completed`, `Cancelled`, `Returned`) |
| `subtotal` | `FLOAT` | NO | Gross basket value before deductions ($) |
| `discount_amount` | `FLOAT` | YES | Promotional discount applied ($) |
| `total_amount` | `FLOAT` | NO | Final transaction billed amount ($) |
| `profit_amount` | `FLOAT` | NO | Realized gross operating profit ($) |
| `region` | `VARCHAR(50)` | NO | Destination fulfillment region |

### Table: `order_items`
| Column | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `item_id` | `VARCHAR(50)` | NO (PK) | Itemized line item ID (`ITEM-00000001`) |
| `order_id` | `VARCHAR(50)` | NO (FK) | Reference to `orders.order_id` |
| `product_id` | `VARCHAR(50)` | NO (FK) | Reference to `products.product_id` |
| `quantity` | `INTEGER` | NO | Quantity of units purchased |
| `unit_price` | `FLOAT` | NO | Unit price billed ($) |
| `line_total` | `FLOAT` | NO | Total price for line item ($) |
| `gross_profit` | `FLOAT` | NO | Gross margin realized on line item ($) |

### Table: `deliveries`
| Column | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `delivery_id` | `VARCHAR(50)` | NO (PK) | Shipment tracking reference |
| `order_id` | `VARCHAR(50)` | NO (FK) | Reference to `orders.order_id` |
| `carrier` | `VARCHAR(100)` | NO | Freight partner (BlueDart, FedEx, Delhivery, etc.) |
| `dispatch_date` | `DATETIME` | YES | Warehouse handover timestamp |
| `actual_delivery` | `DATETIME` | YES | Final customer doorstep delivery timestamp |
| `delivery_days` | `FLOAT` | YES | Total transit duration (days) |
| `delay_days` | `FLOAT` | YES | Days past scheduled delivery SLA |
| `rating` | `FLOAT` | YES | Customer CSAT rating (1.0 to 5.0) |

### Table: `inventory`
| Column | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `inventory_id` | `VARCHAR(50)` | NO (PK) | Inventory record identifier |
| `product_id` | `VARCHAR(50)` | NO (FK) | Reference to `products.product_id` |
| `warehouse_location`| `VARCHAR(100)`| YES | Regional hub location |
| `stock_on_hand` | `INTEGER` | NO | Physical units in warehouse |
| `days_of_supply` | `FLOAT` | YES | Estimated days before depletion |
| `stock_status` | `VARCHAR(50)` | YES | `Potential Stockout`, `Potential Overstock`, `Stable` |
