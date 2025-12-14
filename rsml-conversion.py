import csv
import re
from tqdm import tqdm

RAW_TO_NOISE_TAG = {

    # -------------------------
    # Generic / fallback
    # -------------------------
    "noise": "@noise",
    "persistent-noise-start": "@noise-start",
    "persistent-noise-end": "@noise-end",

    # -------------------------
    # Background environments / chatter
    # -------------------------
    "tv": "@background-tv",
    "music": "@background-music",
    "tones": "@background-music",
    "tone": "@background-music",
    "trill": "@background-music",

    "baby": "@background-chatter",
    "child": "@background-chatter",
    "children": "@background-chatter",
    "talking": "@background-chatter",
    "child_talking": "@background-chatter",
    "children_talking": "@background-chatter",
    "baby_talking": "@background-chatter",
    "whispering": "@whispers",

    # -------------------------
    # Background human sounds
    # -------------------------
    "baby_crying": "@background-crying",
    "child_crying": "@background-crying",
    "child_whining": "@background-crying",

    "child_laughing": "@background-laughter",
    "laughter": "@background-laughter",

    "child_yelling": "@background-yelling",
    "children_yelling": "@background-yelling",
    "yelling": "@background-yelling",

    "singing": "@background-singing",
    "whistling": "@background-whistling",
    "hum": "@background-humming",
    "humming": "@background-humming",
    "sigh": "@background-sighing",

    # -------------------------
    # Animals
    # -------------------------
    "animal": "@animal-sounds",
    "barking": "@animal-sounds",
    "meow": "@animal-sounds",

    "bird_squawk": "@bird-sounds",
    "squawking": "@bird-sounds",

    # -------------------------
    # Vehicles / machines
    # -------------------------
    "motorcycle": "@vehicle-noise",
    "printer": "@mechanical-noise",
    "typewriter": "@typing",
    "phone_vibrating": "@mechanical-noise",

    # -------------------------
    # Discrete background noises
    # -------------------------
    "dishes": "@mechanical-noise",
    "door": "@mechanical-noise",

    "footsteps": "@footsteps",
    "click": "@click",
    "clicking": "@click",
    "clink": "@clinking",
    "clinking": "@clinking",
    "clanking": "@clanking",
    "clanging": "@clanging",
    "tapping": "@tapping",
    "scratching": "@scratching",
    "squeak": "@squeak",
    "thumping": "@thumping",
    "pounding": "@pounding",
    "screeching": "@screeching",
    "rattling": "@rattling",
    "rustling": "@rustling",
    "popping": "@pounding",
    "smack": "@smack",

    "static": "@static",
    "hiss": "@hiss",

    # -------------------------
    # Signals / alerts
    # -------------------------
    "beep": "@beep",
    "bell": "@bell",
    "buzz": "@buzz",
    "buzzer": "@buzz",
    "ringing": "@ringing",
    "phone_ringing": "@phone-ringing",
    "horn": "@horn",
    "siren": "@siren",
    "chiming": "@chiming",

    # -------------------------
    # Speaker disfluencies
    # -------------------------
    "uhh": "@uhh",
    "umm": "@umm",
    "hmm": "@hmm",
    "uh-huh": "@uh-huh",
    "tsk": "@tsk",
    "stammers": "@stammering",

    # -------------------------
    # Speaker-produced sounds (non-persistent)
    # -------------------------
    "breathing": "@breathing",
    "inhaling": "@inhaling",
    "sniffing": "@sniffing",
    "sniffle": "@sniffing",
    "nose_blowing": "@nose-blowing",
    "cough": "@cough",
    "sneezing": "@sneezing",
    "throat_clearing": "@throat-clearing",
    "yawning": "@yawning",
    "swallowing": "@eating",
    "snoring": "@snoring",
    "wheezing": "@wheezing",
    "gasp": "@breathing",

    "groan": "@groan",
    "ugh": "@ugh",

    # -------------------------
    # Other
    # -------------------------
    "unintelligible": "@unintelligible"
}


# Match <token> or [token]
WRAPPED_TOKEN_REGEX = re.compile(r'(<|\[)([^>\]]+)(>|\])')

def replace_wrapped_tokens(text, mapping):
    """
    Replace wrapped tokens like <word> or [word] with mapped tag.
    Transcript is lowercased BEFORE matching.
    Wrapper (< > or [ ]) is REMOVED in output.
    """
    if not text:
        return text

    # Normalize transcript text to lowercase
    text = text.lower()

    def replacer(match):
        token = match.group(2)
        if token in mapping:
            return mapping[token]
        return match.group(0)

    return WRAPPED_TOKEN_REGEX.sub(replacer, text)



def fetch_data(file_path):
    data = []
    header = []
    try:
        with open(file_path, mode="r", encoding="utf-8") as file:
            reader = csv.reader(file)
            header = next(reader)
            for row in reader:
                data.append(row)
    except Exception as e:
        print(f"Error reading file: {e}")
    return header, data


# -------------------------
# Main processing
# -------------------------

path = "data/indicvoices.csv"
header, data = fetch_data(path)

# Get column indices safely
try:
    verbatim_idx = header.index("unsanitized_verbatim")
    normalized_idx = header.index("unsanitized_normalized")
except ValueError as e:
    raise RuntimeError(f"Missing required column: {e}")

# Process rows with progress bar
for row in tqdm(data, desc="Tagging transcripts", unit="rows"):
    row[verbatim_idx] = replace_wrapped_tokens(
        row[verbatim_idx], RAW_TO_NOISE_TAG
    )
    row[normalized_idx] = replace_wrapped_tokens(
        row[normalized_idx], RAW_TO_NOISE_TAG
    )

# Write output with progress feedback
output_path = "data/indicvoices_tagged.csv"
with open(output_path, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(data)

print(f"✅ Tagging complete. Output saved to: {output_path}")
