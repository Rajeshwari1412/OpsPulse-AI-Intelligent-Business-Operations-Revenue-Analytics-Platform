import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
SAMPLE_DATA_DIR = DATA_DIR / "sample"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
DB_PATH = DATA_DIR / "opspulse.db"

# Ensure directories exist
for path in [DATA_DIR, RAW_DATA_DIR, SAMPLE_DATA_DIR, PROCESSED_DATA_DIR]:
    path.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "OpsPulse AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    IS_DEMO_MODE: bool = True
    MAX_UPLOAD_SIZE_MB: int = 50

settings = Settings()
