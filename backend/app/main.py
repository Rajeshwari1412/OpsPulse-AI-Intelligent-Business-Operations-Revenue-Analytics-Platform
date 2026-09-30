import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.routes import router as api_router
from backend.app.core.database import engine, Base
from backend.app.etl.pipeline import run_full_etl

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="OpsPulse AI — Intelligent Business Operations, Revenue & Customer Analytics Platform API"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    """
    On server boot, check if database tables exist. If empty, automatically run the demo ELT pipeline.
    """
    print("Checking database initialization...")
    # Verify tables
    Base.metadata.create_all(bind=engine)
    # Check if orders table has data
    from backend.app.core.database import SessionLocal
    from backend.app.models.db_models import Order
    db = SessionLocal()
    try:
        count = db.query(Order).count()
        if count == 0:
            print("Database is empty. Automatically initializing demo dataset...")
            run_full_etl()
        else:
            print(f"Database online with {count:,} orders.")
    except Exception as e:
        print(f"Startup check note: {e}")
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.IS_DEMO_MODE,
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
