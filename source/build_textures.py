"""Lossless wardrobe payloads for the offline build; original textures stay untouched."""
from pathlib import Path
import base64
import hashlib
import io
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / 'dist' / 'texture-cache'
verified = {}


def texture_data_url(path):
    source = path.read_bytes()
    if path.suffix.lower() != '.png':
        return 'data:image/webp;base64,' + base64.b64encode(source).decode()
    digest = hashlib.sha256(source).hexdigest()
    cached = CACHE / ('lossless-v1-' + digest + '.webp')
    original = Image.open(io.BytesIO(source)).convert('RGBA')
    if not cached.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        output = io.BytesIO()
        original.save(output, format='WEBP', lossless=True, quality=100, method=4, exact=True,
                      icc_profile=original.info.get('icc_profile', b''))
        payload = output.getvalue()
    else:
        payload = cached.read_bytes()
    decoded = Image.open(io.BytesIO(payload)).convert('RGBA')
    pixels = original.tobytes()
    if decoded.size != original.size or decoded.tobytes() != pixels:
        raise ValueError('Lossless texture pixel verification failed: ' + str(path))
    if decoded.info.get('icc_profile', b'') != original.info.get('icc_profile', b''):
        raise ValueError('Texture color profile verification failed: ' + str(path))
    if not cached.exists():
        cached.write_bytes(payload)
    use_webp = len(payload) < len(source)
    verified[path.relative_to(ROOT).as_posix()] = {
        'sourceSha256': digest,
        'rgbaSha256': hashlib.sha256(pixels).hexdigest(),
        'size': list(original.size),
        'sourceBytes': len(source),
        'embeddedBytes': len(payload) if use_webp else len(source),
        'mime': 'image/webp' if use_webp else 'image/png',
        'cache': cached.relative_to(ROOT).as_posix(),
        'exactRgbaPixels': True,
    }
    if len(verified) % 25 == 0:
        print('Verified lossless wardrobe textures:', len(verified), flush=True)
    return 'data:' + verified[path.relative_to(ROOT).as_posix()]['mime'] + ';base64,' + base64.b64encode(payload if use_webp else source).decode()


def write_texture_report():
    CACHE.mkdir(parents=True, exist_ok=True)
    report = {
        'textures': verified,
        'originalBytes': sum(r['sourceBytes'] for r in verified.values()),
        'embeddedBytes': sum(r['embeddedBytes'] for r in verified.values()),
    }
    (CACHE / 'verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print('Lossless wardrobe:', len(verified), 'textures;', report['originalBytes'] - report['embeddedBytes'], 'binary bytes saved.', flush=True)
