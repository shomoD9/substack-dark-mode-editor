"""Render the simple page-and-moon icon. Requires Pillow only for rebuilding."""
from pathlib import Path
from PIL import Image, ImageDraw

out = Path(__file__).resolve().parents[1] / 'extension' / 'icons'
out.mkdir(exist_ok=True)
im = Image.new('RGBA', (512, 512))
d = ImageDraw.Draw(im)
d.rounded_rectangle((8, 8, 504, 504), radius=112, fill='#222222')
d.rounded_rectangle((134, 94, 378, 418), radius=25, outline='#eab786', width=24)
d.ellipse((191, 145, 315, 269), fill='#eab786')
d.ellipse((234, 125, 330, 231), fill='#222222')
d.rounded_rectangle((189, 311, 324, 326), radius=7, fill='#eab786')
d.rounded_rectangle((189, 349, 282, 364), radius=7, fill='#eab786')
for size in (16, 32, 48, 128):
    im.resize((size, size), Image.Resampling.LANCZOS).save(out / f'icon{size}.png')
