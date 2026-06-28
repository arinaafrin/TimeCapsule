from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import uuid
from datetime import datetime

app = FastAPI(title="TimeCapsule VR Core Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_FILE = "timecapsule_vr.db"

def get_db():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS exhibits (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            year_original INTEGER,
            historical_360_url TEXT NOT NULL,
            modern_360_url TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS stories (
            id TEXT PRIMARY KEY,
            exhibit_id TEXT NOT NULL,
            language_code TEXT NOT NULL,
            story_title TEXT NOT NULL,
            story_description TEXT,
            video_url TEXT NOT NULL,
            FOREIGN KEY (exhibit_id) REFERENCES exhibits(id)
        );
    """)
    conn.commit()
    conn.close()

init_db()

class ExhibitCreate(BaseModel):
    title: str
    year_original: Optional[int] = None
    historical_360_url: str
    modern_360_url: Optional[str] = None

class StoryCreate(BaseModel):
    language_code: str
    story_title: str
    story_description: str
    video_url: str

@app.get("/")
def health_check():
    return {"status": "active", "engine": "TimeCapsule VR Gateway"}

@app.post("/api/exhibits")
def create_exhibit(payload: ExhibitCreate):
    exhibit_id = str(uuid.uuid4())
    conn = get_db()
    conn.execute("""
        INSERT INTO exhibits (id, title, year_original, historical_360_url, modern_360_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (exhibit_id, payload.title, payload.year_original, payload.historical_360_url, payload.modern_360_url, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    return {"exhibit_id": exhibit_id, "message": "Historical location initialized successfully."}

@app.post("/api/exhibits/{exhibit_id}/stories")
def add_localized_story(exhibit_id: str, payload: StoryCreate):
    story_id = str(uuid.uuid4())
    conn = get_db()
    exhibit = conn.execute("SELECT id FROM exhibits WHERE id = ?", (exhibit_id,)).fetchone()
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit target not found")
    conn.execute("""
        INSERT INTO stories (id, exhibit_id, language_code, story_title, story_description, video_url)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (story_id, exhibit_id, payload.language_code, payload.story_title, payload.story_description, payload.video_url))
    conn.commit()
    conn.close()
    return {"story_id": story_id, "message": "Localization narrative appended successfully."}

@app.get("/api/vr/{exhibit_id}")
def get_vr_payload(exhibit_id: str, lang: str = Query("en")):
    conn = get_db()
    ex_row = conn.execute("SELECT * FROM exhibits WHERE id = ?", (exhibit_id,)).fetchone()
    if not ex_row:
        conn.close()
        raise HTTPException(status_code=404, detail="VR Destination not found")
    story_row = conn.execute("""
        SELECT * FROM stories WHERE exhibit_id = ? AND language_code = ?
    """, (exhibit_id, lang)).fetchone()
    if not story_row and lang != "en":
        story_row = conn.execute("""
            SELECT * FROM stories WHERE exhibit_id = ? AND language_code = 'en'
        """, (exhibit_id,)).fetchone()
    conn.close()
    exhibit = dict(ex_row)
    story = dict(story_row) if story_row else {}
    return {
        "id": exhibit["id"],
        "year": exhibit["year_original"],
        "historical_360": exhibit["historical_360_url"],
        "modern_360": exhibit["modern_360_url"],
        "configured_lang": story.get("language_code", "default"),
        "title": story.get("story_title", exhibit["title"]),
        "description": story.get("story_description", "No narrative script provided for this track."),
        "video_story": story.get("video_url", None)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)