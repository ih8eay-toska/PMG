from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent.parent
manifest=json.loads((ROOT/'asset-manifest.json').read_text(encoding='utf-8'))
paths=set();keys=set();count=0
for r in manifest['assets']:
    if r['status']!='downloaded':continue
    assert r['path'].casefold() not in paths, 'Windows filename collision: '+r['path']
    assert r['key'] not in keys,'Duplicate asset key: '+r['key']
    path=(ROOT/r['path']).resolve()
    assert path.is_relative_to(ROOT.resolve()),'Path leaves project'
    data=path.read_bytes()
    assert len(data)==r['bytes'],'Byte size mismatch: '+r['key']
    assert hashlib.sha256(data).hexdigest()==r['sha256'],'Hash mismatch: '+r['key']
    paths.add(r['path'].casefold());keys.add(r['key']);count+=1
assert count==manifest['summary']['downloaded']
print('Verified',count,'unique media files: paths, sizes, and SHA-256 hashes.')

removal=json.loads((ROOT/'research/art/wiki-media-removal.json').read_text(encoding='utf-8'))
for removed in removal['removedFiles']:
    assert not (ROOT/removed).exists(), 'Removed wiki media returned: '+removed
assert not any('wikia' in (r.get('url') or '') or 'fandom' in (r.get('url') or '') for r in manifest['assets'] if not r.get('retained_event_banner')), 'Unapproved wiki media returned to the catalog'
print('Verified non-banner wiki media remains removed; historical banners are retained.')
