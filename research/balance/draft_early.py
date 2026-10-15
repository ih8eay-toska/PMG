from pathlib import Path
import sys,inspect,math,json
from functools import lru_cache
sys.path.insert(0,str(Path(__file__).resolve().parent));import calculate
scope={'math':math,'lru_cache':lru_cache};exec(inspect.getsource(calculate.evaluate).replace('enhancement=10):','enhancement=10,cap=.99):').replace('min(1,','min(cap,'),scope);evaluate=scope['evaluate']
profiles=calculate.DATA['profiles'][:3];families=calculate.DATA['families'];changes=[]
def best(r,p,f,mode='None'):return max((dict(level=k+1,**evaluate(r,p,f,k,mode)) for k in range(r['max_level'])),key=lambda x:x['gold_per_action'])
for t in range(2,6):
 refs=[best(families[0]['recipes'][t],p,0)['gold_per_action'] for p in profiles]
 for f in [1,2]:
  old=families[f]['recipes'][t]
  for step in range(3001):
   new=dict(old,multipliers=[round(m*(1+step*.001),2) for m in old['multipliers']]);previous=max((c['after'][0] for c in changes if c['family']==2),default=0) if f==2 else 0
   if f==2 and new['multipliers'][0]<previous:continue
   rates=[best(new,p,f)['gold_per_action'] for p in profiles]
   if all(a/2<=b<=a*2 for a,b in zip(refs,rates)):break
  else:raise RuntimeError('No feasible change')
  if new['multipliers']!=old['multipliers']:changes.append(dict(family=f,tier=t+1,name=old['name'],before=old['multipliers'],after=new['multipliers']))
print(json.dumps(changes,indent=2));Path(__file__).with_name('early-candidates.json').write_text(json.dumps(changes,indent=2))
for t in range(6):
 rs=[]
 for f in range(3):
  r=dict(families[f]['recipes'][t]);change=next((c for c in changes if c['family']==f and c['tier']==t+1),None)
  if change:r['multipliers']=change['after']
  rs.append(r)
 for mode in ['None','Fixed']:
  for p in profiles:
   old=[best(families[f]['recipes'][t],p,f,mode)['gold_per_action'] for f in range(3)];new=[best(rs[f],p,f,mode)['gold_per_action'] for f in range(3)];print(t+1,p['name'],mode,'spread',round(max(old)/min(old),2),'to',round(max(new)/min(new),2),'new',list(map(lambda x:round(x,2),new)))
