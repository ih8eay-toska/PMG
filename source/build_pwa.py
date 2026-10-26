"""Package the same offline game as an installable site; original assets stay intact."""
from pathlib import Path
import hashlib
import io
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def build_pwa(game):
    output = ROOT / 'dist' / 'pwa'
    (output / 'icons').mkdir(parents=True, exist_ok=True)
    artwork = Image.open(ROOT / 'assets/extracted/characters.png').convert('RGBA')
    icons = {}
    for filename, size, fraction in [('icon-192.png', 192, .86), ('icon-512.png', 512, .86),
                                     ('maskable-512.png', 512, .60), ('apple-180.png', 180, .86)]:
        canvas = Image.new('RGBA', (size, size), '#edece8')
        scale = size * fraction / max(artwork.size)
        image = artwork.resize((round(artwork.width * scale), round(artwork.height * scale)), Image.Resampling.NEAREST)
        canvas.alpha_composite(image, ((size - image.width) // 2, (size - image.height) // 2))
        buffer = io.BytesIO()
        canvas.convert('RGB').save(buffer, format='PNG', optimize=True)
        icons[filename] = buffer.getvalue()
        (output / 'icons' / filename).write_bytes(icons[filename])
    manifest = json.dumps({
        'id': './', 'name': 'Potion Maker', 'short_name': 'Potion Maker',
        'description': 'A cozy potion workshop. Brew, meet visitors and collect outfits.',
        'lang': 'en', 'start_url': './', 'scope': './', 'display': 'standalone',
        'background_color': '#edece8', 'theme_color': '#735582',
        'icons': [
            {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
            {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
            {'src': 'icons/maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
        ],
    }, ensure_ascii=False, indent=2) + '\n'
    client = (ROOT / 'source/pwa.js').read_text(encoding='utf-8')
    worker = (ROOT / 'source/service-worker.js').read_text(encoding='utf-8')
    version = hashlib.sha256((game + client + worker + manifest).encode('utf-8') + b''.join(icons.values())).hexdigest()[:20]
    head = ('<link rel="manifest" href="./manifest.webmanifest">'
            '<link rel="apple-touch-icon" href="./icons/apple-180.png">'
            '<meta name="theme-color" content="#735582">'
            '<meta name="apple-mobile-web-app-capable" content="yes">'
            '<meta name="apple-mobile-web-app-title" content="Potion Maker">'
            f'<meta name="pmg-pwa-build" content="{version}">')
    hosted = game.replace('</head>', head + '</head>', 1).replace('</body>', '<script data-pmg-pwa>' + client + '</script></body>', 1)
    (output / 'index.html').write_text(hosted, encoding='utf-8', newline='\n')
    (output / 'manifest.webmanifest').write_text(manifest, encoding='utf-8', newline='\n')
    (output / 'service-worker.js').write_text(worker.replace('__PWA_VERSION__', json.dumps(version)), encoding='utf-8', newline='\n')
    print('Built installable site:', version, '· complete offline game, manifest and original-art icons.')
