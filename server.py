import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List

# ---------------- CONFIG ---------------- #

DATA_CSV = "data/indicvoices_rsml_ready.csv"
AUDIO_DIR = "data/audio"

# -------------------------------------- #

app = FastAPI()

# -------- Middleware -------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# -------- Static Audio Serving -------- #

if not os.path.exists(AUDIO_DIR):
    raise FileNotFoundError(f"{AUDIO_DIR} directory not found")

app.mount("/data/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

# -------- Load CSV -------- #

if not os.path.exists(DATA_CSV):
    raise FileNotFoundError(f"{DATA_CSV} not found")

# Force batch & file as strings (IMPORTANT)
df = pd.read_csv(DATA_CSV, dtype={"batch": str, "file": str})

# -------- Routes -------- #

@app.get("/", response_class=HTMLResponse)
def serve_index():
    if not os.path.exists("index.html"):
        raise HTTPException(status_code=404, detail="index.html not found")
    return open("index.html", encoding="utf-8").read()

@app.get("/batches")
def get_max_batch():
    if "batch" not in df.columns:
        raise HTTPException(status_code=500, detail="Missing 'batch' column")

    batches = pd.to_numeric(df["batch"], errors="coerce").dropna()

    if batches.empty:
        raise HTTPException(status_code=404, detail="No batches found")

    return {
        "max_batch": int(batches.max())
    }


@app.get("/batch/{batch_id}/files")
def get_max_file(batch_id: str):
    if "file" not in df.columns:
        raise HTTPException(status_code=500, detail="Missing 'file' column")

    batch_df = df[df["batch"] == str(batch_id)]

    if batch_df.empty:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")

    files = pd.to_numeric(batch_df["file"], errors="coerce").dropna()

    if files.empty:
        raise HTTPException(status_code=404, detail=f"No files for batch {batch_id}")

    return {
        "max_file": int(files.max())
    }

@app.get("/batch/{batch_id}/file/{file_number}")
def get_file(batch_id: str, file_number: str):
    required = {"batch", "file", "segment"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(status_code=500, detail=f"Missing columns: {missing}")

    filtered = df[
        (df["batch"] == str(batch_id)) &
        (df["file"] == str(file_number))
    ]

    if filtered.empty:
        raise HTTPException(status_code=404, detail="No data for given batch and file")

    return JSONResponse(
        content=(
            filtered
            .sort_values("segment")
            .fillna("")
            .to_dict(orient="records")
        )
    )
# -------- RSML Save -------- #


class RSMLSegment(BaseModel):
    segment: int
    rsml: str

@app.post("/batch/{batch_id}/file/{file_number}/save")
def save_rsml(batch_id: str, file_number: str, segments: List[RSMLSegment]):
    global df

    if "segment" not in df.columns:
        raise HTTPException(status_code=500, detail="Missing 'segment' column in dataframe")

    segment_map = {s.segment: s.rsml for s in segments}

    # Apply update to relevant subset only
    mask = (df["batch"] == batch_id) & (df["file"] == file_number)
    if not mask.any():
        raise HTTPException(status_code=404, detail="No matching rows found")

    df.loc[mask, "rsml"] = df[mask].apply(
        lambda row: segment_map.get(row["segment"], row["rsml"]),
        axis=1
    )

    df.to_csv(DATA_CSV, index=False)

    return {
        "message": f"RSML saved for batch {batch_id}, file {file_number}",
        "segments_updated": len(segment_map)
    }