from pathlib import Path
import json,csv,math
root=Path(__file__).resolve().parent;data=json.loads((root/'inputs.json').read_text());early=json.loads((root/'early-candidates-revised.json').read_text());middle=json.loads((root/'middle-candidates.json').read_text());families=data['families']
def recipe(f,t):
 r=dict(families[f]['recipes'][t-1]);c=next((c for c in early+middle if c['family']==f and c['tier']==t),None)
 if c:r['multipliers']=c['after'];r['chances']=c.get('after_chances',r['chances'])
 return r
def gpa(r,bonus,sell):
 prob=1.;v=r['base'];attempts=0.;best=math.floor(v*sell)/2
 for p,m in zip(r['chances'],r['multipliers']):
  attempts+=prob;prob*=min(.99,p+bonus);v*=m;best=max(best,prob*math.floor(v*sell)/(1+attempts+prob))
 return best
worst={t:(0,None) for t in range(1,17)};drops=[]
for luck in range(11):
 for fortune in range(11):
  for selling in range(15):
   bonus=luck*.010345+fortune*.01;sell=1+selling*.05;prev=[0,0,0]
   for t in range(1,17):
    vals=[gpa(recipe(f,t),bonus,sell) for f in range(3)];spread=max(vals)/min(vals)
    if spread>worst[t][0]:worst[t]=(spread,[luck,fortune,selling])
    for f in range(3):
     if vals[f]<prev[f]-1e-7:drops.append([t,f,luck,fortune,selling])
    prev=vals
print('Worst partial-state spreads',worst);print('Unlock income regressions',len(drops))
(root/'partial-upgrade-check.json').write_text(json.dumps({'worst_by_tier':worst,'progression_regressions':len(drops),'state_count_per_tier':1815},indent=2))

assert not drops
assert all(x[0]<=2+1e-10 for x in worst.values())
print('Passed: 29,040 tier/upgrade-state comparisons satisfy 2x and have no income regressions.')
