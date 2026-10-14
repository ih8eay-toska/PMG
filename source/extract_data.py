"""Normalize numeric gameplay facts from locally cached wiki tables."""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parent.parent
def article(name):return json.loads((ROOT/'research/wiki'/f'{name}.json').read_text(encoding='utf-8'))['parse']['text']['*']
def clean(s):return re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',html.unescape(s))).strip()
def tables(name):
    return [[[clean(c) for c in re.findall(r'<t[dh]\b[^>]*>(.*?)</t[dh]>',row,re.S)]for row in re.findall(r'<tr\b.*?</tr>',table,re.S)]for table in re.findall(r'<table\b.*?</table>',article(name),re.S)]
def number(s):
    s=s.replace(',','').replace(' ','')
    if not s or s=='-':return None
    return float(s)
def sequence(s):return [float(x.replace(',','.')) for x in re.findall(r'\d+(?:[.,]\d+)?',s)]
families=[]
material_tables=[t for t in tables('Materials') if t and t[0][-1:] == ['Starting Potion']]
potion_tables=[t for t in tables('Potion') if t and 'Base sell price' in t[0]]
for family_index,identifier in enumerate(['Life','Mana','Stamina']):
    rows=[r for r in material_tables[family_index][1:] if len(r)>=4]
    material=[{'name':r[-3],'value':number(r[-2]),'starting_name':r[-1],'image':f'{identifier}_Material{i+1}.png'}for i,r in enumerate(rows)]
    recipes=[]
    potion_rows=[r for r in potion_tables[family_index][1:] if r and not r[0].startswith('1→')]
    for tier,row in enumerate(potion_rows):
        if not row[0]:row=row[1:]
        name=row[0];max_level=int(row[1]) if len(row)>1 and row[1].isdigit() else None
        base=number(row[2]) if len(row)>2 else None
        notes=[]
        if family_index==1 and tier==12 and row[2]=='8.500':base=8500;notes.append('Thousands separator normalized from 8.500.')
        steps=max_level-1 if max_level else 0
        if family_index==0:
            multipliers=[number(x) for x in row[3:7]][:steps]
            chances=[number(x.replace('%',''))/100 if x!='-' else None for x in row[7:11]][:steps]
        elif family_index==1:
            multipliers=sequence(row[3]) if len(row)>3 else []
            chances=[x/100 for x in sequence(row[4])] if len(row)>4 else []
            multipliers=(multipliers+[None]*steps)[:steps];chances=(chances+[None]*steps)[:steps]
            if tier==3:notes.append('Conflicts with another wiki: multiplier 1.57 vs 1.5. This wiki is used provisionally.')
            if tier==5:notes.append('Only three multipliers recorded for four enhancements; missing step disabled.')
        else:
            m=sequence(row[3]) if len(row)>3 else [];c=sequence(row[4]) if len(row)>4 else []
            multipliers=[m[0] if m else None]*steps;chances=[c[0]/100 if c else None]*steps
        complete=bool(max_level and base is not None and len(multipliers)==steps and len(chances)==steps and all(x is not None for x in multipliers+chances))
        if not complete:notes.append('Incomplete source data; unknown enhancement steps cannot be attempted.')
        recipes.append({'name':name,'base':base,'max_level':max_level,'multipliers':multipliers,'chances':chances,'image':f'{identifier}_Potion{tier+1}.png','complete':complete,'notes':notes})
    families.append({'id':identifier,'label':identifier,'color':['#e98d9c','#83b6dc','#ddbf66'][family_index],'materials':material,'recipes':recipes})
data={'schema':1,'source_pages':['https://potionmaker.fandom.com/wiki/Materials','https://potionmaker.fandom.com/wiki/Potion'],'families':families,'limits':{'material_tiers':25,'emission_level':20,'luck_bonus':.10345,'selling_bonus':.2,'pushcat_level':15},'quest_reward_delay_ms':0,'powerups':{'protection':{'image':'EnhancementFailureProtection.png','bundle':5},'enhancement':{'image':'EnhancementBonus.png','bundle':10,'chance_bonus':.1},'selling':{'image':'SellBonus.png','bundle':2,'multiplier':2}}}
# Reviewed supplementary values are applied after parsing the original wiki.
supplement_path=ROOT/'data/potion-supplements.json'
if supplement_path.exists():
    supplement=json.loads(supplement_path.read_text(encoding='utf-8'))
    if supplement['source'] not in data['source_pages']:data['source_pages'].append(supplement['source'])
    for key,patch in supplement['entries'].items():
        family,tier=map(int,key.split('-'))
        recipe=data['families'][family]['recipes'][tier]
        for field in ['base','max_level','multipliers','chances','notes']:
            if field in patch:recipe[field]=patch[field]
        steps=recipe['max_level']-1
        if 'constant_multiplier' in patch:recipe['multipliers']=[patch['constant_multiplier']]*steps
        if 'constant_chance' in patch:recipe['chances']=[patch['constant_chance']]*steps
        recipe['complete']=bool(recipe['base'] is not None and len(recipe['multipliers'])==steps and len(recipe['chances'])==steps and all(x is not None for x in recipe['multipliers']+recipe['chances']))
        recipe['supplement_source']=supplement['source']

(ROOT/'data').mkdir(exist_ok=True)
(ROOT/'data/game-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('Recipes',sum(len(f['recipes']) for f in families),'fully documented',sum(r['complete']for f in families for r in f['recipes']))
print('Missing',[(f['id'],i+1)for f in families for i,r in enumerate(f['recipes']) if not r['complete']])
