import ast
import base64
import os
import duckdb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

DATA_DIR = "data/telugu"

app = FastAPI()

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# --- DuckDB connection (global, fast) ---
con = duckdb.connect(database=":memory:")

# --- Helpers ---
def parquet_path(name: str):
    path = os.path.join(DATA_DIR, name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"{name} not found")
    return path


# ---------------- ROUTES ---------------- #

@app.get("/", response_class=HTMLResponse)
def serve_index():
    if not os.path.exists("index.html"):
        raise HTTPException(status_code=404, detail="index.html not found")
    return open("index.html", encoding="utf-8").read()


@app.get("/parquets")
def list_parquets():
    return sorted(f for f in os.listdir(DATA_DIR) if f.endswith(".parquet"))


@app.get("/parquet/{parquet_name}/files")
def list_files(parquet_name: str):
    path = parquet_path(parquet_name)

    query = f"""
        SELECT DISTINCT file
        FROM '{path}'
        ORDER BY file
    """

    return [row[0] for row in con.execute(query).fetchall()]


@app.get("/parquet/{parquet_name}/file/{file_number}")
def get_file(parquet_name: str, file_number: int):
    path = parquet_path(parquet_name)

    query = f"""
        SELECT *
        FROM '{path}'
        WHERE file = {file_number}
        ORDER BY segment
    """

    df = con.execute(query).df()

    if df.empty:
        raise HTTPException(status_code=404, detail="No data")

    # Convert audio_filepath from dict → base64 string
    if "audio_filepath" in df.columns:
        def safe_encode(cell):
            try:
                audio_dict = ast.literal_eval(str(cell))
                if isinstance(audio_dict, dict) and "bytes" in audio_dict:
                    return base64.b64encode(audio_dict["bytes"]).decode("utf-8")
            except:
                return None
        df["audio_filepath"] = df["audio_filepath"].apply(safe_encode)

    return df.to_dict(orient="records")