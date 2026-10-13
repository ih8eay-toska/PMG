from pathlib import Path
import json
root=Path(__file__).resolve().parent
out=root.parent if root.name=='source' else root.parent/'outputs'
out.mkdir(exist_ok=True)
records=json.loads((root/'assets.json').read_text(encoding='utf-8'))
assets={r['name']:r['data'] for r in records}
template=(root/'index.template.html').read_text(encoding='utf-8')
html=template.replace('__ASSETS__',json.dumps(assets)).replace('__CORE__',(root/'core.js').read_text(encoding='utf-8'))
(out/'Potion-Maker.html').write_text(html,encoding='utf-8')
manifest=[{k:v for k,v in record.items() if k!='data'} for record in records]
(out/'asset-sources.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('Built offline game:',len(html),'characters with',len(assets),'embedded images')
