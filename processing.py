import os
import ast
import pandas as pd
import soundfile as sf
import io
from tqdm import tqdm

# ---------------- CONFIG ---------------- #

PARQUET_DIR = "data/telugu"
AUDIO_DIR = "data/audio"
OUTPUT_CSV = "data/indicvoices.csv"

os.makedirs(AUDIO_DIR, exist_ok=True)

# CSV header control
csv_exists = os.path.exists(OUTPUT_CSV)

# ---------------------------------------- #

parquet_files = sorted(os.listdir(PARQUET_DIR))
for parquet_name in tqdm(parquet_files, desc="Processing Parquet Files"):
    if not parquet_name.endswith(".parquet"):
        continue

    parquet_path = os.path.join(PARQUET_DIR, parquet_name)
    parquet_id = os.path.splitext(parquet_name)[0]

    print(f"🔹 Processing {parquet_name}")

    df = pd.read_parquet(parquet_path)

    rows_to_write = []

    for _, row in tqdm(df.iterrows(), total=len(df), desc=f"Processing Rows in {parquet_name}", leave=False):
        audio_dict = row["audio_filepath"]

        # Handle stringified dict safely
        if isinstance(audio_dict, str):
            audio_dict = ast.literal_eval(audio_dict)

        audio_bytes = audio_dict.get("bytes")
        if audio_bytes is None:
            raise ValueError(f"Missing audio bytes in {parquet_name}")

        lang = row['lang']
        file_id = row["file"]
        segment_id = row["segment"]

        audio_filename = f"{lang}-{parquet_id}-{file_id}-{segment_id}.wav"
        audio_path = os.path.join(AUDIO_DIR, audio_filename)

        # Write audio
        audio_buffer = io.BytesIO(audio_bytes)
        data, samplerate = sf.read(audio_buffer)
        sf.write(audio_path, data, samplerate)

        # Prepare CSV row
        row = row.drop(labels=["audio_filepath", "id"])
        row["audio"] = audio_filename

        rows_to_write.append(row)

    # Append to CSV
    out_df = pd.DataFrame(rows_to_write)
    out_df.to_csv(
        OUTPUT_CSV,
        mode="a",
        header=not csv_exists,
        index=False
    )
    csv_exists = True

    # Remove parquet after successful processing
    os.remove(parquet_path)
    print(f"🗑️ Deleted {parquet_name}")

print("✅ All parquet files processed and merged into CSV")
print(f"🎧 Audio dir: {AUDIO_DIR}")
print(f"📄 CSV file: {OUTPUT_CSV}")