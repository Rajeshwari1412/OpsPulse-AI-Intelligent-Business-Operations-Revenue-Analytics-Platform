from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, ForeignKey, Index, Text, Boolean
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(50), primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    phone = Column(String(50))
    region = Column(String(50), index=True)
    city = Column(String(100))
    state = Column(String(100))
    signup_date = Column(DateTime, index=True)
    segment = Column(String(50), default="Standard")
    rfm_segment = Column(String(50), default="New Customers")
    r_score = Column(Integer, default=3)
    f_score = Column(Integer, default=3)
    m_score = Column(Integer, default=3)
    clv_score = Column(Float, default=0.0)
    churn_risk = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH
    churn_probability = Column(Float, default=0.1)

    orders = relationship("Order", back_populates="customer")
    tickets = relationship("SupportTicket", back_populates="customer")

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String(50), primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True)
    name = Column(String(200), index=True)
    category = Column(String(100), index=True)
    subcategory = Column(String(100))
    unit_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    margin_pct = Column(Float, default=0.0)
    stock_quantity = Column(Integer, default=100)
    reorder_level = Column(Integer, default=20)
    safety_stock = Column(Integer, default=15)
    portfolio_quadrant = Column(String(50), default="High Revenue / High Margin")
    status = Column(String(50), default="Active")

    order_items = relationship("OrderItem", back_populates="product")
    inventory = relationship("Inventory", back_populates="product", uselist=False)

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String(50), primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), index=True)
    order_date = Column(DateTime, index=True)
    channel = Column(String(50), default="Web") # Web, Mobile App, Store, B2B
    status = Column(String(50), default="Completed") # Completed, Cancelled, Returned, Processing
    payment_method = Column(String(50), default="Credit Card")
    subtotal = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    profit_amount = Column(Float, default=0.0)
    region = Column(String(50), index=True)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    item_id = Column(String(50), primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.order_id"), index=True)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    line_total = Column(Float, nullable=False)
    gross_profit = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Inventory(Base):
    __tablename__ = "inventory"

    inventory_id = Column(String(50), primary_key=True, index=True)
    product_id = Column(String(50), ForeignKey("products.product_id"), unique=True, index=True)
    warehouse_location = Column(String(100), default="Central Hub")
    stock_on_hand = Column(Integer, default=100)
    reserved_stock = Column(Integer, default=10)
    available_stock = Column(Integer, default=90)
    reorder_point = Column(Integer, default=25)
    days_of_supply = Column(Float, default=30.0)
    inventory_turnover = Column(Float, default=4.5)
    stock_status = Column(String(50), default="Stable") # Potential Stockout, Potential Overstock, Stable
    last_restock_date = Column(DateTime)

    product = relationship("Product", back_populates="inventory")

class Delivery(Base):
    __tablename__ = "deliveries"

    delivery_id = Column(String(50), primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.order_id"), unique=True, index=True)
    carrier = Column(String(100), index=True) # BlueDart, FedEx, Delhivery, DHL, ExpressAir
    tracking_code = Column(String(100))
    dispatch_date = Column(DateTime)
    estimated_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    delivery_days = Column(Float, default=3.0)
    delay_days = Column(Float, default=0.0)
    status = Column(String(50), default="Delivered") # Delivered, In Transit, Delayed, Failed
    region = Column(String(50), index=True)
    rating = Column(Float, default=4.5)

    order = relationship("Order", back_populates="delivery")

class MarketingCampaign(Base):
    __tablename__ = "marketing_campaigns"

    campaign_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), index=True)
    channel = Column(String(100), index=True) # Google Search, Meta Ads, LinkedIn, Email, Affiliate
    target_region = Column(String(50))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    budget = Column(Float, default=10000.0)
    spend = Column(Float, default=9500.0)
    impressions = Column(Integer, default=500000)
    clicks = Column(Integer, default=25000)
    conversions = Column(Integer, default=1200)
    attributed_revenue = Column(Float, default=48000.0)
    roas = Column(Float, default=5.05)
    cac = Column(Float, default=7.92)

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    ticket_id = Column(String(50), primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), index=True)
    category = Column(String(100)) # Delivery Delay, Product Quality, Payment Issue, Refund Request
    priority = Column(String(50), default="Medium") # Low, Medium, High, Critical
    status = Column(String(50), default="Resolved") # Open, Pending, Resolved, Closed
    created_at = Column(DateTime, index=True)
    resolved_at = Column(DateTime)
    resolution_time_hrs = Column(Float, default=12.0)
    satisfaction_score = Column(Float, default=4.0)

    customer = relationship("Customer", back_populates="tickets")

class DataQualityLog(Base):
    __tablename__ = "data_quality_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    dataset_name = Column(String(100), default="Enterprise Consolidated")
    total_records = Column(Integer, default=0)
    overall_score = Column(Float, default=98.5)
    completeness_score = Column(Float, default=99.2)
    validity_score = Column(Float, default=98.0)
    consistency_score = Column(Float, default=97.5)
    uniqueness_score = Column(Float, default=99.9)
    freshness_score = Column(Float, default=98.0)
    issues_summary = Column(Text) # JSON string

class BusinessAlert(Base):
    __tablename__ = "business_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    alert_type = Column(String(50)) # REVENUE_DROP, CHURN_SPIKE, STOCKOUT_RISK, DELIVERY_DELAY, DATA_QUALITY
    severity = Column(String(20)) # LOW, MEDIUM, HIGH, CRITICAL
    metric = Column(String(100))
    threshold_value = Column(String(100))
    actual_value = Column(String(100))
    description = Column(Text)
    route_link = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
