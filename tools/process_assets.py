from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "assets" / "img"

SOURCES = {
    "rif-chefchaouen": IMG_DIR / "rif-chefchaouen-source.jpg",
    "road-chefchaouen": IMG_DIR / "road-chefchaouen-source.jpg",
    "road-akchour": IMG_DIR / "road-akchour-source.jpg",
    "al-hoceima": IMG_DIR / "al-hoceima-source.jpg",
}


def editorial_grade(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    image = ImageEnhance.Color(image).enhance(0.78)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    wash = Image.new("RGB", image.size, "#b97a50")
    return Image.blend(image, wash, 0.075)


for name, source in SOURCES.items():
    with Image.open(source) as image:
        graded = editorial_grade(image)
        for width in (640, 1280, 1920):
            if width > graded.width:
                continue
            height = round(graded.height * width / graded.width)
            resized = graded.resize((width, height), Image.Resampling.LANCZOS)
            resized.save(IMG_DIR / f"{name}-{width}.webp", "WEBP", quality=82, method=6)


with Image.open(SOURCES["al-hoceima"]) as image:
    base = editorial_grade(ImageOps.fit(image, (1200, 630), method=Image.Resampling.LANCZOS))
    overlay = Image.new("RGBA", base.size, (27, 42, 47, 0))
    draw = ImageDraw.Draw(overlay)
    for x in range(1200):
        alpha = int(218 * (1 - min(x / 900, 1)))
        draw.line((x, 0, x, 630), fill=(27, 42, 47, alpha))
    draw.rectangle((0, 0, 1200, 630), outline=(242, 235, 221, 90), width=1)
    composed = Image.alpha_composite(base.convert("RGBA"), overlay)
    canvas = ImageDraw.Draw(composed)
    serif_path = Path("C:/Windows/Fonts/georgiab.ttf")
    sans_path = Path("C:/Windows/Fonts/arial.ttf")
    serif = ImageFont.truetype(str(serif_path), 86) if serif_path.exists() else ImageFont.load_default()
    sans = ImageFont.truetype(str(sans_path), 24) if sans_path.exists() else ImageFont.load_default()
    canvas.text((72, 84), "RifAccess", fill="#f2ebdd", font=serif)
    canvas.text((76, 205), "MESURER L'ENCLAVEMENT RURAL DANS LE RIF", fill="#f2ebdd", font=sans)
    canvas.line((76, 272, 660, 272), fill="#b5532f", width=4)
    canvas.text((76, 304), "Indice d'accès rural · Datathon Data-Territoires 2026", fill="#f2ebdd", font=sans)
    canvas.text((76, 530), "35°14′N 4°03′W", fill="#d5cbbb", font=sans)
    composed.convert("RGB").save(IMG_DIR / "og-rifaccess.jpg", "JPEG", quality=88, optimize=True, progressive=True)


icon = Image.new("RGBA", (180, 180), "#f2ebdd")
draw = ImageDraw.Draw(icon)
draw.ellipse((28, 28, 152, 152), outline="#5e6b3a", width=9)
draw.line((44, 122, 82, 88, 112, 96, 144, 56), fill="#1b2a2f", width=11, joint="curve")
draw.ellipse((72, 78, 94, 100), fill="#b5532f")
icon.save(IMG_DIR / "apple-touch-icon.png", "PNG", optimize=True)
