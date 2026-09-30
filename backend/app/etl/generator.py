import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from backend.app.config import RAW_DATA_DIR, SAMPLE_DATA_DIR, settings

# Fixed seed for reproducible realistic generation
random.seed(42)
np.random.seed(42)

REGIONS = ["North", "South", "East", "West", "Central"]
CHANNELS = ["Web", "Mobile App", "B2B Portal", "Retail Store"]
PAYMENT_METHODS = ["Credit Card", "UPI / Instant", "Net Banking", "Corporate PO", "Debit Card"]
CARRIERS = ["BlueDart Express", "FedEx Supply", "Delhivery Logistics", "DHL Express", "Shadowfax Cargo"]
TICKET_CATEGORIES = ["Delivery Delay", "Damaged Item", "Billing Dispute", "Product Incompatibility", "Warranty Claim"]
TICKET_PRIORITIES = ["Low", "Medium", "High", "Critical"]

PRODUCT_CATALOG = [
    # Electronics
    {"sku": "ELEC-1001", "name": "PulseWave Pro ANC Headphones", "category": "Electronics", "subcategory": "Audio", "unit_price": 249.99, "cost_price": 115.00, "quadrant": "High Revenue / High Margin", "reorder_level": 40},
    {"sku": "ELEC-1002", "name": "Quantum 4K Ultra OLED Monitor 32\"", "category": "Electronics", "subcategory": "Displays", "unit_price": 699.99, "cost_price": 420.00, "quadrant": "High Revenue / High Margin", "reorder_level": 25},
    {"sku": "ELEC-1003", "name": "ThunderBolt Multi-Port Docking Hub", "category": "Electronics", "subcategory": "Accessories", "unit_price": 129.99, "cost_price": 78.00, "quadrant": "High Revenue / Low Margin", "reorder_level": 50},
    {"sku": "ELEC-1004", "name": "AeroCharge Mag-Wireless Fast Pad", "category": "Electronics", "subcategory": "Accessories", "unit_price": 49.99, "cost_price": 18.00, "quadrant": "Low Revenue / High Margin", "reorder_level": 60},
    {"sku": "ELEC-1005", "name": "Legacy MicroUSB Cable 2M Bulk", "category": "Electronics", "subcategory": "Accessories", "unit_price": 12.99, "cost_price": 9.50, "quadrant": "Low Revenue / Low Margin", "reorder_level": 100},
    
    # Office & Workspace
    {"sku": "OFFC-2001", "name": "ErgoFlex Carbon Mesh Executive Chair", "category": "Office & Furniture", "subcategory": "Chairs", "unit_price": 489.99, "cost_price": 230.00, "quadrant": "High Revenue / High Margin", "reorder_level": 20},
    {"sku": "OFFC-2002", "name": "Apex Dual-Motor Electric Standing Desk", "category": "Office & Furniture", "subcategory": "Desks", "unit_price": 599.99, "cost_price": 380.00, "quadrant": "High Revenue / Low Margin", "reorder_level": 15},
    {"sku": "OFFC-2003", "name": "Acoustic Noise-Dampening Desk Partition", "category": "Office & Furniture", "subcategory": "Acoustics", "unit_price": 159.99, "cost_price": 65.00, "quadrant": "Low Revenue / High Margin", "reorder_level": 30},
    {"sku": "OFFC-2004", "name": "Standard Wire Mesh Desk Organizers", "category": "Office & Furniture", "subcategory": "Storage", "unit_price": 24.99, "cost_price": 18.00, "quadrant": "Low Revenue / Low Margin", "reorder_level": 80},
    
    # Industrial & Ops Hardware
    {"sku": "IND-3001", "name": "SensAir IoT Multi-Zone Facility Sensor", "category": "Industrial IoT", "subcategory": "Sensors", "unit_price": 320.00, "cost_price": 140.00, "quadrant": "High Revenue / High Margin", "reorder_level": 35},
    {"sku": "IND-3002", "name": "Ruggedized 2D Barcode Logistics Scanner", "category": "Industrial IoT", "subcategory": "Handhelds", "unit_price": 450.00, "cost_price": 290.00, "quadrant": "High Revenue / Low Margin", "reorder_level": 20},
    {"sku": "IND-3003", "name": "Thermal Label Industrial Printer 300DPI", "category": "Industrial IoT", "subcategory": "Printers", "unit_price": 540.00, "cost_price": 260.00, "quadrant": "Low Revenue / High Margin", "reorder_level": 15},
    {"sku": "IND-3004", "name": "Standard Thermal Transfer Ribbon Pack", "category": "Industrial IoT", "subcategory": "Consumables", "unit_price": 35.00, "cost_price": 28.00, "quadrant": "Low Revenue / Low Margin", "reorder_level": 120},
    
    # Health & Ergonomics
    {"sku": "HLTH-4001", "name": "LumiGlow Smart Circadian Desk Lamp", "category": "Health & Lighting", "subcategory": "Lighting", "unit_price": 139.99, "cost_price": 52.00, "quadrant": "High Revenue / High Margin", "reorder_level": 40},
    {"sku": "HLTH-4002", "name": "ActivePosture Balance Core Stool", "category": "Health & Lighting", "subcategory": "Ergonomics", "unit_price": 199.99, "cost_price": 95.00, "quadrant": "Low Revenue / High Margin", "reorder_level": 25},
    {"sku": "HLTH-4003", "name": "Anti-Fatigue Gel Floor Mat 36x24", "category": "Health & Lighting", "subcategory": "Ergonomics", "unit_price": 79.99, "cost_price": 55.00, "quadrant": "Low Revenue / Low Margin", "reorder_level": 45},

    # Smart Facilities & Security
    {"sku": "SEC-5001", "name": "GateKeeper RFID Access Controller", "category": "Facilities & Security", "subcategory": "Access Control", "unit_price": 750.00, "cost_price": 340.00, "quadrant": "High Revenue / High Margin", "reorder_level": 15},
    {"sku": "SEC-5002", "name": "UltraCam 360 AI Facility Surveillance", "category": "Facilities & Security", "subcategory": "Surveillance", "unit_price": 890.00, "cost_price": 560.00, "quadrant": "High Revenue / Low Margin", "reorder_level": 12},
    {"sku": "SEC-5003", "name": "Backup Smart Battery Station 1500VA", "category": "Facilities & Security", "subcategory": "Power", "unit_price": 310.00, "cost_price": 160.00, "quadrant": "Low Revenue / High Margin", "reorder_level": 20},
    {"sku": "SEC-5004", "name": "NFC Key Fob Bulk Pack (100 pcs)", "category": "Facilities & Security", "subcategory": "Access Control", "unit_price": 65.00, "cost_price": 52.00, "quadrant": "Low Revenue / Low Margin", "reorder_level": 90},
]

MARKETING_CHANNELS = [
    {"name": "Q1 Performance Search Scale", "channel": "Google Search", "budget": 45000, "spend": 43200, "cpc": 1.75, "conv_rate": 0.048, "target_region": "North"},
    {"name": "Social Video Enterprise Retargeting", "channel": "Meta Ads", "budget": 38000, "spend": 37100, "cpc": 1.45, "conv_rate": 0.038, "target_region": "West"},
    {"name": "B2B Decision Maker Outreach", "channel": "LinkedIn Ads", "budget": 55000, "spend": 54200, "cpc": 4.80, "conv_rate": 0.062, "target_region": "Central"},
    {"name": "Omnichannel Lifecycle Email Funnel", "channel": "Email Marketing", "budget": 12000, "spend": 11800, "cpc": 0.35, "conv_rate": 0.095, "target_region": "South"},
    {"name": "Regional Tech Partner Co-Op", "channel": "Affiliate Partners", "budget": 28000, "spend": 26900, "cpc": 2.10, "conv_rate": 0.051, "target_region": "East"},
    {"name": "Q4 Black Friday Mega Boost", "channel": "Google Search", "budget": 85000, "spend": 84300, "cpc": 2.20, "conv_rate": 0.075, "target_region": "North"},
]

def generate_synthetic_data(num_customers: int = 2500, num_orders: int = 35000, target_order_items: int = 105000):
    """
    Generates a full relational dataset containing 100,000+ transaction items with realistic business dynamics:
    - Seasonality curves (Q4 boost, summer dip)
    - Realistic RFM behavior (Champions buy frequently, At-Risk have support tickets and churn decay)
    - Regional logistics delay bias (South & East carriers face realistic bottlenecks)
    - Product margin variations & inventory turnover dynamics
    """
    print(f"Generating realistic dataset: {num_customers} customers, {num_orders} orders, ~{target_order_items} items...")

    start_date = datetime(2024, 1, 1)
    end_date = datetime(2026, 3, 31)
    total_days = (end_date - start_date).days

    # 1. Generate Customers
    first_names = ["Aarav", "Priya", "Rahul", "Ananya", "Vikram", "Neha", "Rohan", "Sneha", "Aditya", "Pooja", "Arjun", "Kavya", "Sanjay", "Divya", "Deepak", "Meera", "Karan", "Tanvi", "Nikhil", "Isha", "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Chris", "Pat", "Devon"]
    last_names = ["Sharma", "Patel", "Verma", "Reddy", "Gupta", "Nair", "Iyer", "Choudhury", "Mehta", "Singh", "Joshi", "Bhat", "Rao", "Das", "Menon", "Mukherjee", "Kapoor", "Agarwal", "Bose", "Saxena", "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson"]

    customers_data = []
    customer_personas = [] # stores weight profile for order simulation

    for i in range(1, num_customers + 1):
        cid = f"CUST-{i:05d}"
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        region = random.choice(REGIONS)
        # Signup spread across 2 years
        signup_offset = random.randint(0, int(total_days * 0.8))
        signup_dt = start_date + timedelta(days=signup_offset)

        # Assign latent persona
        persona_rand = random.random()
        if persona_rand < 0.15:
            persona = "Champion" # High spend, low churn, frequent
            churn_p = random.uniform(0.02, 0.08)
            freq_weight = 4.5
        elif persona_rand < 0.40:
            persona = "Loyal"
            churn_p = random.uniform(0.08, 0.20)
            freq_weight = 2.8
        elif persona_rand < 0.65:
            persona = "Standard"
            churn_p = random.uniform(0.20, 0.45)
            freq_weight = 1.2
        elif persona_rand < 0.85:
            persona = "At-Risk"
            churn_p = random.uniform(0.60, 0.88)
            freq_weight = 0.6
        else:
            persona = "Churned"
            churn_p = random.uniform(0.88, 0.98)
            freq_weight = 0.2

        churn_risk = "HIGH" if churn_p >= 0.60 else ("MEDIUM" if churn_p >= 0.25 else "LOW")

        customers_data.append({
            "customer_id": cid,
            "first_name": fn,
            "last_name": ln,
            "email": f"{fn.lower()}.{ln.lower()}{i}@example.com",
            "phone": f"+91-{random.randint(9000000000, 9999999999)}",
            "region": region,
            "city": f"{region} City {random.randint(1, 10)}",
            "state": f"State-{region[:2]}",
            "signup_date": signup_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "segment": persona,
            "churn_risk": churn_risk,
            "churn_probability": round(churn_p, 3),
            "clv_score": 0.0,
            "rfm_segment": "New Customers",
            "r_score": 3,
            "f_score": 3,
            "m_score": 3,
        })
        customer_personas.append({
            "customer_id": cid,
            "signup_dt": signup_dt,
            "persona": persona,
            "region": region,
            "churn_p": churn_p,
            "freq_weight": freq_weight
        })

    df_customers = pd.DataFrame(customers_data)

    # 2. Products Data
    products_data = []
    for idx, p in enumerate(PRODUCT_CATALOG, 1):
        pid = f"PROD-{idx:03d}"
        margin = round(((p["unit_price"] - p["cost_price"]) / p["unit_price"]) * 100, 2)
        products_data.append({
            "product_id": pid,
            "sku": p["sku"],
            "name": p["name"],
            "category": p["category"],
            "subcategory": p["subcategory"],
            "unit_price": p["unit_price"],
            "cost_price": p["cost_price"],
            "margin_pct": margin,
            "stock_quantity": random.randint(80, 500),
            "reorder_level": p["reorder_level"],
            "safety_stock": int(p["reorder_level"] * 0.7),
            "portfolio_quadrant": p["quadrant"],
            "status": "Active"
        })
    df_products = pd.DataFrame(products_data)

    # 3. Generate Orders & Order Items
    orders_data = []
    order_items_data = []
    deliveries_data = []
    support_tickets_data = []

    order_item_counter = 1
    carrier_weights = {"North": [0.4, 0.3, 0.15, 0.1, 0.05], "South": [0.15, 0.2, 0.35, 0.1, 0.2], "East": [0.1, 0.15, 0.4, 0.15, 0.2], "West": [0.35, 0.35, 0.15, 0.1, 0.05], "Central": [0.25, 0.25, 0.25, 0.15, 0.1]}

    # Product popularity weight profile
    prod_weights = [12, 8, 10, 15, 6,  11, 7, 5, 4,  6, 5, 4, 3,  9, 6, 5,  4, 3, 5, 4]
    prod_weights = np.array(prod_weights) / sum(prod_weights)

    order_id_num = 1
    
    # Simulate realistic order distribution
    for cp in customer_personas:
        cid = cp["customer_id"]
        c_signup = cp["signup_dt"]
        c_region = cp["region"]
        persona = cp["persona"]
        
        # Decide number of orders based on persona
        if persona == "Champion":
            num_cust_orders = random.randint(18, 35)
            order_span_days = (end_date - c_signup).days
        elif persona == "Loyal":
            num_cust_orders = random.randint(10, 22)
            order_span_days = (end_date - c_signup).days
        elif persona == "Standard":
            num_cust_orders = random.randint(4, 12)
            order_span_days = (end_date - c_signup).days
        elif persona == "At-Risk":
            # Orders clustered early, zero or rare in last 180 days
            num_cust_orders = random.randint(3, 8)
            order_span_days = max(30, int((end_date - c_signup).days * 0.5))
        else: # Churned
            num_cust_orders = random.randint(1, 4)
            order_span_days = max(15, int((end_date - c_signup).days * 0.25))

        if order_span_days <= 0:
            order_span_days = 1

        # Generate order timestamps
        order_offsets = sorted([random.randint(0, order_span_days) for _ in range(num_cust_orders)])

        for offset in order_offsets:
            order_dt = c_signup + timedelta(days=offset, hours=random.randint(8, 22), minutes=random.randint(0, 59))
            if order_dt > end_date:
                continue

            oid = f"ORD-{order_id_num:07d}"
            order_id_num += 1

            # Seasonality modifier for basket size & revenue
            month = order_dt.month
            is_q4 = month in [10, 11, 12]
            is_summer = month in [6, 7]
            
            # Number of items per order (average ~3 items per order = ~105,000 items total)
            basket_size = random.choices([1, 2, 3, 4, 5, 6], weights=[0.15, 0.30, 0.30, 0.15, 0.07, 0.03])[0]
            if is_q4 and random.random() < 0.3:
                basket_size += 1

            # Pick products
            chosen_indices = np.random.choice(len(PRODUCT_CATALOG), size=basket_size, p=prod_weights, replace=True)

            order_subtotal = 0.0
            order_cost = 0.0

            for p_idx in chosen_indices:
                prod = products_data[p_idx]
                qty = random.choices([1, 2, 3, 4, 10], weights=[0.70, 0.20, 0.06, 0.03, 0.01])[0]
                unit_p = prod["unit_price"]
                cost_p = prod["cost_price"]
                
                # Dynamic promotional discount (higher in Q4)
                item_discount_pct = 0.15 if (is_q4 and random.random() < 0.4) else (0.05 if random.random() < 0.2 else 0.0)
                item_total = round(unit_p * qty * (1 - item_discount_pct), 2)
                item_profit = round(item_total - (cost_p * qty), 2)

                order_subtotal += item_total
                order_cost += (cost_p * qty)

                order_items_data.append({
                    "item_id": f"ITEM-{order_item_counter:08d}",
                    "order_id": oid,
                    "product_id": prod["product_id"],
                    "quantity": qty,
                    "unit_price": unit_p,
                    "cost_price": cost_p,
                    "discount": round(unit_p * qty * item_discount_pct, 2),
                    "line_total": item_total,
                    "gross_profit": item_profit
                })
                order_item_counter += 1

            # Order Level Metrics
            discount_total = round(order_subtotal * (0.05 if random.random() < 0.15 else 0.0), 2)
            shipping_fee = 0.0 if order_subtotal > 200 else 15.0
            tax = round(order_subtotal * 0.08, 2)
            final_total = round(order_subtotal - discount_total + tax + shipping_fee, 2)
            order_profit = round((order_subtotal - order_cost) - discount_total, 2)

            channel = random.choices(CHANNELS, weights=[0.45, 0.35, 0.12, 0.08])[0]
            status = "Completed" if random.random() < 0.94 else ("Cancelled" if random.random() < 0.5 else "Returned")
            payment = random.choice(PAYMENT_METHODS)

            orders_data.append({
                "order_id": oid,
                "customer_id": cid,
                "order_date": order_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "channel": channel,
                "status": status,
                "payment_method": payment,
                "subtotal": round(order_subtotal, 2),
                "discount_amount": discount_total,
                "tax_amount": tax,
                "shipping_cost": shipping_fee,
                "total_amount": final_total,
                "profit_amount": order_profit,
                "region": c_region
            })

            # Delivery Simulation
            carrier_probs = carrier_weights.get(c_region, [0.2]*5)
            carrier = random.choices(CARRIERS, weights=carrier_probs)[0]
            dispatch_dt = order_dt + timedelta(hours=random.randint(6, 24))
            
            # South and East have intentional logistical delay bias
            base_transit_days = 2.5
            if c_region in ["South", "East"]:
                base_transit_days += random.uniform(1.2, 3.5)
            if carrier in ["Delhivery Logistics", "Shadowfax Cargo"] and random.random() < 0.25:
                base_transit_days += random.uniform(1.5, 4.0)

            actual_delivery_dt = dispatch_dt + timedelta(days=base_transit_days)
            est_delivery_dt = dispatch_dt + timedelta(days=3.0)
            
            delay_days = max(0.0, round((actual_delivery_dt - est_delivery_dt).total_seconds() / 86400, 1))
            del_status = "Delayed" if delay_days > 0.5 else ("Delivered" if status == "Completed" else "Returned")
            rating = 5.0 if delay_days == 0 else max(1.0, round(5.0 - (delay_days * 0.8) + random.uniform(-0.3, 0.3), 1))

            deliveries_data.append({
                "delivery_id": f"DEL-{order_id_num:07d}",
                "order_id": oid,
                "carrier": carrier,
                "tracking_code": f"TRK{random.randint(100000000, 999999999)}",
                "dispatch_date": dispatch_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "estimated_delivery": est_delivery_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "actual_delivery": actual_delivery_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "delivery_days": round(base_transit_days, 1),
                "delay_days": delay_days,
                "status": del_status,
                "region": c_region,
                "rating": rating
            })

            # Support ticket correlation with delays and at-risk churn personas
            if (delay_days > 1.5 or persona in ["At-Risk", "Churned"]) and random.random() < 0.35:
                ticket_cat = "Delivery Delay" if delay_days > 1.5 else random.choice(TICKET_CATEGORIES)
                ticket_prio = "Critical" if delay_days > 3.0 else random.choice(TICKET_PRIORITIES)
                t_create = actual_delivery_dt + timedelta(hours=random.randint(2, 48))
                res_hrs = random.uniform(4.0, 48.0)
                t_resolve = t_create + timedelta(hours=res_hrs)
                satisfaction = 1.5 if delay_days > 2.0 else random.choice([2.0, 3.0, 4.0, 5.0])

                support_tickets_data.append({
                    "ticket_id": f"TCK-{len(support_tickets_data)+1:06d}",
                    "customer_id": cid,
                    "category": ticket_cat,
                    "priority": ticket_prio,
                    "status": "Resolved",
                    "created_at": t_create.strftime("%Y-%m-%d %H:%M:%S"),
                    "resolved_at": t_resolve.strftime("%Y-%m-%d %H:%M:%S"),
                    "resolution_time_hrs": round(res_hrs, 1),
                    "satisfaction_score": satisfaction
                })

    df_orders = pd.DataFrame(orders_data)
    df_order_items = pd.DataFrame(order_items_data)
    df_deliveries = pd.DataFrame(deliveries_data)
    df_tickets = pd.DataFrame(support_tickets_data)

    # 4. Inventory Data
    inventory_data = []
    for p in products_data:
        pid = p["product_id"]
        # Calculate approximate daily sales from order items
        p_items = df_order_items[df_order_items["product_id"] == pid]
        total_units = p_items["quantity"].sum()
        avg_daily_demand = max(1.0, total_units / total_days)

        stock_on_hand = random.randint(15, 300)
        reorder = p["reorder_level"]
        days_supply = round(stock_on_hand / avg_daily_demand, 1)
        turnover = round((total_units * p["cost_price"]) / (max(1, stock_on_hand) * p["cost_price"]), 2)

        if days_supply < 12:
            stock_status = "Potential Stockout"
        elif days_supply > 65:
            stock_status = "Potential Overstock"
        else:
            stock_status = "Stable"

        inventory_data.append({
            "inventory_id": f"INV-{pid}",
            "product_id": pid,
            "warehouse_location": f"{random.choice(REGIONS)} Regional Hub",
            "stock_on_hand": stock_on_hand,
            "reserved_stock": int(stock_on_hand * 0.12),
            "available_stock": int(stock_on_hand * 0.88),
            "reorder_point": reorder,
            "days_of_supply": days_supply,
            "inventory_turnover": turnover,
            "stock_status": stock_status,
            "last_restock_date": (end_date - timedelta(days=random.randint(3, 45))).strftime("%Y-%m-%d %H:%M:%S")
        })
    df_inventory = pd.DataFrame(inventory_data)

    # 5. Marketing Campaigns
    mkt_data = []
    for idx, c in enumerate(MARKETING_CHANNELS, 1):
        clicks = int(c["spend"] / c["cpc"])
        convs = int(clicks * c["conv_rate"])
        rev = round(convs * random.uniform(180, 240), 2)
        roas = round(rev / c["spend"], 2)
        cac = round(c["spend"] / max(1, convs), 2)
        
        mkt_data.append({
            "campaign_id": f"CMP-{idx:03d}",
            "name": c["name"],
            "channel": c["channel"],
            "target_region": c["target_region"],
            "start_date": "2024-01-15 00:00:00",
            "end_date": "2026-03-31 23:59:59",
            "budget": c["budget"],
            "spend": c["spend"],
            "impressions": clicks * 25,
            "clicks": clicks,
            "conversions": convs,
            "attributed_revenue": rev,
            "roas": roas,
            "cac": cac
        })
    df_marketing = pd.DataFrame(mkt_data)

    # Compute actual customer RFM scores and lifetime value
    snapshot_date = end_date
    df_orders_temp = df_orders.copy()
    df_orders_temp["order_date_dt"] = pd.to_datetime(df_orders_temp["order_date"])

    rfm_grouped = df_orders_temp.groupby("customer_id").agg(
        recency=("order_date_dt", lambda x: (snapshot_date - x.max()).days),
        frequency=("order_id", "count"),
        monetary=("total_amount", "sum")
    ).reset_index()

    # Calculate quintiles for R, F, M
    rfm_grouped["r_score"] = pd.qcut(rfm_grouped["recency"], 5, labels=[5, 4, 3, 2, 1]).astype(int)
    rfm_grouped["f_score"] = pd.qcut(rfm_grouped["frequency"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
    rfm_grouped["m_score"] = pd.qcut(rfm_grouped["monetary"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)

    def assign_rfm_segment(row):
        r, f, m = row["r_score"], row["f_score"], row["m_score"]
        fm_avg = (f + m) / 2
        if r >= 4 and fm_avg >= 4:
            return "Champions"
        elif r >= 3 and fm_avg >= 3:
            return "Loyal Customers"
        elif r >= 3 and fm_avg < 3:
            return "Potential Loyalists"
        elif r >= 4 and f <= 2:
            return "New Customers"
        elif r <= 2 and fm_avg >= 3:
            return "At Risk"
        else:
            return "Lost Customers"

    rfm_grouped["rfm_segment"] = rfm_grouped.apply(assign_rfm_segment, axis=1)

    # Merge RFM back to df_customers
    df_customers = df_customers.drop(columns=["r_score", "f_score", "m_score", "rfm_segment"], errors="ignore")
    df_customers = df_customers.merge(
        rfm_grouped[["customer_id", "recency", "frequency", "monetary", "r_score", "f_score", "m_score", "rfm_segment"]],
        on="customer_id",
        how="left"
    )
    df_customers["r_score"] = df_customers["r_score"].fillna(1).astype(int)
    df_customers["f_score"] = df_customers["f_score"].fillna(1).astype(int)
    df_customers["m_score"] = df_customers["m_score"].fillna(1).astype(int)
    df_customers["rfm_segment"] = df_customers["rfm_segment"].fillna("New Customers")
    df_customers["clv_score"] = df_customers["monetary"].fillna(0.0).round(2)
    df_customers = df_customers.drop(columns=["recency", "frequency", "monetary"], errors="ignore")

    print(f"Dataset generated successfully:")
    print(f"  Customers: {len(df_customers)}")
    print(f"  Products: {len(df_products)}")
    print(f"  Orders: {len(df_orders)}")
    print(f"  Order Items: {len(df_order_items)}")
    print(f"  Deliveries: {len(df_deliveries)}")
    print(f"  Support Tickets: {len(df_tickets)}")
    print(f"  Inventory: {len(df_inventory)}")
    print(f"  Marketing Campaigns: {len(df_marketing)}")

    # Save to Raw and Sample CSVs
    for out_dir in [RAW_DATA_DIR, SAMPLE_DATA_DIR]:
        df_customers.to_csv(out_dir / "customers.csv", index=False)
        df_products.to_csv(out_dir / "products.csv", index=False)
        df_orders.to_csv(out_dir / "orders.csv", index=False)
        df_order_items.to_csv(out_dir / "order_items.csv", index=False)
        df_deliveries.to_csv(out_dir / "deliveries.csv", index=False)
        df_tickets.to_csv(out_dir / "support_tickets.csv", index=False)
        df_inventory.to_csv(out_dir / "inventory.csv", index=False)
        df_marketing.to_csv(out_dir / "marketing.csv", index=False)

    return {
        "customers": df_customers,
        "products": df_products,
        "orders": df_orders,
        "order_items": df_order_items,
        "deliveries": df_deliveries,
        "support_tickets": df_tickets,
        "inventory": df_inventory,
        "marketing": df_marketing
    }

if __name__ == "__main__":
    generate_synthetic_data()
