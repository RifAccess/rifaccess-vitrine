import json
import pathlib
import re

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]

for path in ROOT.glob("**/*.json"):
    with path.open(encoding="utf-8") as handle:
        json.load(handle)

html = "".join((ROOT / name).read_text(encoding="utf-8") for name in ("index.html", "credits.html"))
references = re.findall(r'(?:src|href)="(/(?:assets|data|i18n)/[^"]+)', html)
missing = [reference for reference in references if not (ROOT / reference.lstrip("/")).exists()]
if missing:
    raise SystemExit(f"Missing local references: {missing}")

if re.findall(r'<img[^>]+src="https?://', html):
    raise SystemExit("Remote image reference found")

images = list((ROOT / "assets" / "img").glob("*.webp"))
images += [ROOT / "assets" / "img" / "og-rifaccess.jpg", ROOT / "assets" / "img" / "apple-touch-icon.png"]
for path in images:
    with Image.open(path) as image:
        image.verify()

text_suffixes = {".html", ".css", ".js", ".json", ".md", ".xml", ".txt"}
text = "".join(path.read_text(encoding="utf-8") for path in ROOT.rglob("*") if path.is_file() and path.suffix in text_suffixes)
emoji = re.findall(r"[\U0001F300-\U0001FAFF]", text)
if emoji:
    raise SystemExit(f"Emoji found: {emoji}")

print(f"JSON OK; {len(references)} local references OK; {len(images)} images OK; no emoji or remote images.")
