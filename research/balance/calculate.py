import json,csv,math
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parent
DATA=json.loads((ROOT/'inputs.json').read_text())

def evaluate(recipe,profile,family,target,mode,shields=5,enhancement=10):
 effects=profile['effects']
 def effect(key):return effects.get(key,[0,0,0])[family]
 chances=[min(1,p+profile['bonus']+effect('enhancementChance')) for p in recipe['chances']]
 multipliers=[m*(1+effect('enhancementMultiplier')) for m in recipe['multipliers']]
 q=effect('failureProtection')
 if mode=='Unlimited':
  p=[min(1,x+.1) for x in chances[:target]]
  probability=1.;attempts=sum(1/x for x in p);used_e=attempts;used_h=sum((1-x)/x for x in p)
 else:
  @lru_cache(None)
  def dp(level,h,e):
   if level==target:return (1.,0.,0.,0.)
   p=min(1,chances[level]+(.1 if e else 0));e2=max(0,e-1)
   success=dp(level+1,h,e2);survive=(1-p)*(1 if h else q)
   if h==0 and e==0:
    den=1-survive
    return (p*success[0]/den,(1+p*success[1])/den,p*success[2]/den,p*success[3]/den)
   failure=dp(level,max(0,h-1),e2) if survive else (0.,0.,0.,0.)
   return (p*success[0]+survive*failure[0],1+p*success[1]+survive*failure[1],(1 if e else 0)+p*success[2]+survive*failure[2],((1-p) if h else 0)+p*success[3]+survive*failure[3])
  probability,attempts,used_e,used_h=dp(0,shields if mode=='Fixed' else 0,enhancement if mode=='Fixed' else 0)
 sell=profile['sell']+effect('sellBonus');sell*=2 if mode!='None' else 1
 payout=math.floor(recipe['base']*math.prod(multipliers[:target])*sell)
 gold=probability*payout;actions=1+attempts+probability
 return dict(probability=probability,payout=payout,expected_gold=gold,actions=actions,gold_per_action=gold/actions,enhancement_used=used_e,shields_used=used_h)

def run(shields=5,enhancement=10):
 rows=[]
 for profile in DATA['profiles']:
  for f,family in enumerate(DATA['families']):
   for tier,recipe in enumerate(family['recipes'],1):
    for mode in ['None','Fixed','Unlimited']:
     for target in range(recipe['max_level']):
      row=dict(profile=profile['name'],family=family['label'],tier=tier,potion=recipe['name'],resources=mode,stop_level=target+1,max_level=recipe['max_level'])
      row.update(evaluate(recipe,profile,f,target,mode,shields,enhancement));rows.append(row)
 with (ROOT/'all-strategies.csv').open('w',newline='',encoding='utf-8-sig') as out:
  w=csv.DictWriter(out,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
 best={}
 for r in rows:
  key=(r['profile'],r['family'],r['tier'],r['resources'])
  if key not in best or r['gold_per_action']>best[key]['gold_per_action']:best[key]=r
 with (ROOT/'best-fixed-targets.csv').open('w',newline='',encoding='utf-8-sig') as out:
  w=csv.DictWriter(out,fieldnames=list(rows[0]));w.writeheader();w.writerows(best.values())
 (ROOT/'summary.json').write_text(json.dumps([r for r in best.values() if r['tier'] in [1,5,10,15,20,25]],indent=2))
 # Independent identities validate the recurrences, including finite-shield retries.
 r=DATA['families'][0]['recipes'][0];base=DATA['profiles'][0]
 x=evaluate(r,base,0,2,'None');assert math.isclose(x['probability'],.9*.85);assert math.isclose(x['actions'],1+1+.9+.9*.85)
 simple={'base':100,'max_level':2,'chances':[.5],'multipliers':[2]}
 x=evaluate(simple,base,0,1,'Fixed',1,0);assert math.isclose(x['probability'],.75);assert math.isclose(x['actions'],1+1.5+.75);assert math.isclose(x['shields_used'],.5)
 x=evaluate(simple,base,0,1,'Unlimited');assert x['probability']==1;assert math.isclose(x['actions'],2+1/.6)
 print('Calculated',len(rows),'strategies;',len(best),'best fixed-target comparisons. Probability/attempt/resource identities passed.')
 for name in ['Base','Shop max','Permanent max']:
  for mode in ['None','Fixed','Unlimited']:
   print(name,mode,[(r['family'],r['stop_level'],round(r['gold_per_action'],3),r['probability'],round(r['actions'],3)) for r in best.values() if r['profile']==name and r['resources']==mode and r['tier']==25])
if __name__=='__main__':run()

