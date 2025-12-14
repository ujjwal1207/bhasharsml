import pandas as pd
from IPython.display import Audio, display
import io
import base64
import ast

def loadParquet(parquet_file):
    parquet_file = f"data/telugu/{parquet_file}.parquet"
    try:
        df = pd.read_parquet(parquet_file)
        return df
    except Exception as e:
        print(f"❌ Error reading {parquet_file}: {e}")
    return None

def maxFileCount(parquet_file):
    parquet_file = f"data/telugu/{parquet_file}.parquet"
    try:
        df = pd.read_parquet(parquet_file)
        if 'file' in df.columns:
            return df['file'].max()
        print(f"⚠️ 'file' column not found in {parquet_file}")
    except Exception as e:
        print(f"❌ Error reading {parquet_file}: {e}")
    return None

def getFile(parquet_file=1, file_number=1):
    parquet_file = f"data/telugu/{parquet_file}.parquet"
    try:
        df = pd.read_parquet(parquet_file)
        if {'file', 'unsanitized_verbatim', 'unsanitized_normalized'}.issubset(df.columns):
            return df[df['file'] == file_number][['unsanitized_verbatim', 'unsanitized_normalized']].to_dict('records')
        print(f"⚠️ Required columns not found in {parquet_file}")
    except Exception as e:
        print(f"❌ Error reading {parquet_file}: {e}")
    return []

def getAudio(parquet_file=1, file_number=1, segment_number=1):
    parquet_file = f"data/telugu/{parquet_file}.parquet"
    try:
        df = pd.read_parquet(parquet_file)
        if {'file', 'segment', 'audio_filepath', 'samples'}.issubset(df.columns):
            row = df[(df['file'] == file_number) & (df['segment'] == segment_number)]
            if not row.empty:
                audio_data = row.iloc[0]['audio_filepath']
                if isinstance(audio_data, dict) and 'bytes' in audio_data:
                    return audio_data['bytes']
                print(f"⚠️ 'bytes' key not found in audio_filepath")
            else:
                print(f"⚠️ No matching file={file_number}, segment={segment_number}")
        else:
            print(f"⚠️ Required columns not found in {parquet_file}")
    except Exception as e:
        print(f"❌ Error reading {parquet_file}: {e}")
    return None

def play(audioStr, autoplay=True):
    audio_player = Audio(audioStr, autoplay=autoplay, rate=48000)
    display(audio_player)

def getMetadata(parquet_file=1, file_number=1, segment_number=1, columns=['lang', 'scenario', 'task_name', 'gender', 'age_group', 'area', 'district', 'state']):
    parquet_file = f"data/telugu/{parquet_file}.parquet"
    try:
        df = pd.read_parquet(parquet_file)
        if {'file', 'segment'}.issubset(df.columns) and all(col in df.columns for col in columns):
            row = df[(df['file'] == file_number) & (df['segment'] == segment_number)]
            if not row.empty:
                metadata = {col: row.iloc[0][col] for col in columns}
                return metadata
            print(f"⚠️ No matching file={file_number}, segment={segment_number}")
        else:
            print(f"⚠️ Required columns not found in {parquet_file}")
    except Exception as e:
        print(f"❌ Error reading {parquet_file}: {e}")
    return {}