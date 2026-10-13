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
