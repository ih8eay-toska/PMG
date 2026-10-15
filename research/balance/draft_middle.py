from pathlib import Path
import json,math,csv
root=Path(__file__).resolve().parent;data=json.loads((root/'inputs.json').read_text());families=data['families'];profiles=data['profiles'][:3];early=json.loads((root/'early-candidates.json').read_text())
def rates(recipe):
 out=[]
 for p in profiles:
  survival=1.;value=recipe['base'];attempts=0.;best=math.floor(value*p['sell'])/2
  for chance,m in zip(recipe['chances'],recipe['multipliers']):
   attempts+=survival;survival*=min(.99,chance+p['bonus']);value*=m
   best=max(best,survival*math.floor(value*p['sell'])/(1+attempts+survival))
  out.append(best)
 return out
def drafted(f,t):
 r=dict(families[f]['recipes'][t-1]);c=next((c for c in early if c['family']==f and c['tier']==t),None)
 if c:r['multipliers']=c['after']
 return r
previous=[rates(drafted(f,6)) for f in range(3)];changes=[];comparisons=[]
for tier in range(7,17):
 original=[families[f]['recipes'][tier-1] for f in range(3)];life=rates(original[0]);winner=None
 for chance_increase in [x/100 for x in range(11)]:
  for unit in range(200,2001):
   scale=unit/1000;mana=dict(original[1],multipliers=[round(m*scale,2) for m in original[1]['multipliers']]);mr=rates(mana)
   if any(v<prev-1e-8 for v,prev in zip(mr,previous[1])):continue
   if any(max(l,m)/min(l,m)>2 for l,m in zip(life,mr)):continue
   lower=[max(l,m)/2 for l,m in zip(life,mr)];lower=[max(v,prev) for v,prev in zip(lower,previous[2])]
   a,b=1,10000
   while a<b:
    mid=(a+b)//2;srecipe=dict(original[2],chances=[min(.99,p+chance_increase) for p in original[2]['chances']],multipliers=[mid/1000]*len(original[2]['multipliers']));sr=rates(srecipe)
    if all(v>=lo for v,lo in zip(sr,lower)):b=mid
    else:a=mid+1
   stamina=dict(original[2],chances=[min(.99,p+chance_increase) for p in original[2]['chances']],multipliers=[a/1000]*len(original[2]['multipliers']));sr=rates(stamina)
   if any(max(l,m,s)/min(l,m,s)>2+1e-10 for l,m,s in zip(life,mr,sr)):continue
   score=abs(math.log(scale))+abs(math.log((a/1000)/original[2]['multipliers'][0]))
   if winner is None or score<winner[0]:winner=(score,mana,stamina,[life,mr,sr])
  if winner is not None:break
 if winner is None:print('No joint feasible multiplier-only candidate at tier',tier);break
 _,mana,stamina,after=winner
 for f,r in [(1,mana),(2,stamina)]:
  if r['multipliers']!=original[f]['multipliers']:changes.append(dict(family=f,tier=tier,name=r['name'],before=original[f]['multipliers'],after=r['multipliers'],before_chances=original[f]['chances'],after_chances=r['chances']))
 for i,p in enumerate(profiles):
  before=[rates(r)[i] for r in original];new=[after[f][i] for f in range(3)]
  comparisons.append(dict(tier=tier,profile=p['name'],before_spread=max(before)/min(before),after_spread=max(new)/min(new),life=new[0],mana=new[1],stamina=new[2]))
 assert all(all(x<=y+1e-8 for x,y in zip(previous[f],after[f])) for f in range(3));previous=after
 print(tier,'Mana',mana['multipliers'],'Stamina',stamina['multipliers'][0],'chance',stamina['chances'][0],'worst',max(c['after_spread'] for c in comparisons if c['tier']==tier))
(root/'middle-candidates.json').write_text(json.dumps(changes,indent=2))
with (root/'middle-comparisons.csv').open('w',newline='',encoding='utf-8-sig') as out:
 w=csv.DictWriter(out,fieldnames=list(comparisons[0]));w.writeheader();w.writerows(comparisons)
assert len(comparisons)==30,'Incomplete middle tier proposal';assert all(c['after_spread']<=2+1e-10 for c in comparisons)
print('Passed: all 30 joint family comparisons and every draft unlock from tier 6 to 16 is nondecreasing across three profiles.')
