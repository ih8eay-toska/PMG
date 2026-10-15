from pathlib import Path
import sys,inspect,math,csv
from functools import lru_cache
sys.path.insert(0,str(Path(__file__).parent))
import calculate
scope={'math':math,'lru_cache':lru_cache}
source=inspect.getsource(calculate.evaluate).replace('enhancement=10):','enhancement=10,cap=1):').replace('min(1,','min(cap,')
exec(source,scope);evaluate=scope['evaluate'];root=Path(__file__).parent
rows=[]
for cap in [1,.95,.97,.98,.99]:
 for profile in calculate.DATA['profiles']:
  for f,family in enumerate(calculate.DATA['families']):
   for tier,recipe in enumerate(family['recipes'],1):
    for mode in ['None','Fixed','Unlimited']:
     result=evaluate(recipe,profile,f,recipe['max_level']-1,mode,cap=cap)
     rows.append(dict(cap=cap,profile=profile['name'],family=family['label'],tier=tier,resources=mode,**result))
with (root/'cap-comparisons.csv').open('w',newline='',encoding='utf-8-sig') as out:
 writer=csv.DictWriter(out,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
def get(cap,profile,f,mode):return next(r for r in rows if r['cap']==cap and r['profile']==profile and r['family']==f and r['tier']==25 and r['resources']==mode)
def table(head,body):return '\n'.join(['| '+' | '.join(head)+' |','| '+' | '.join(['---']*len(head))+' |']+['| '+' | '.join(map(str,r))+' |' for r in body])
parts=['''# Success-cap comparison

15 October 2026. Analytical extension of BALANCE_REPORT.md. Gameplay unchanged. No random simulations.

## Recommendation

Use 99% as the first candidate for the final per-attempt ceiling, applied after all chance bonuses. It preserves a chance of failure at every step while penalizing a 24-step ladder less than lower caps. This is a candidate, not a claim about player frustration or a complete balance patch.

A ceiling is not a minimum chance: low-probability Life steps stay low. A chance cap also does not solve stacked fairy multipliers or resource acquisition balance.

## The hidden cost of a long ladder

If every step reaches the cap and every failure destroys the potion, completion is cap^steps. These are hypothetical equal-chance ladders, not the current Life/Mana recipes.
''']
body=[]
for cap in [.95,.97,.98,.99]:body.append([f'{cap:.0%}']+[f'{cap**k:.2%}' for k in [4,5,24]])
parts.append(table(['Per-attempt cap','4-step completion','5-step completion','24-step completion'],body))
parts.append('''## Current final-tier recipes with specialized level-10 fairies

Each family uses its own loadout: permanent-max upgrades plus fairy-29 for Life, fairy-26 for Mana, or fairy-28 for Stamina. These are different equipped fairies. Their passive protection on unshielded failures is included (20%, 15%, 15% respectively). Target maximum enhancement in every row; this comparison does not re-optimize stopping levels after each proposed cap.

No charges means no consumable shields, enhancement charges or sale boosts. Fixed means 5 shields, 10 enhancement charges and 2 sale charges at the start of an isolated brew. Unlimited means free unlimited charges as a mathematical upper-bound scenario; ordinary failures consume shields and retry, so eventual completion is guaranteed even though each attempt can fail.
''')
profiles=['Permanent max + fairy-29 L10','Permanent max + fairy-26 L10','Permanent max + fairy-28 L10']
for mode in ['None','Fixed','Unlimited']:
 body=[]
 for cap in [1,.95,.97,.98,.99]:
  vals=[get(cap,p,f,mode) for p,f in zip(profiles,['Life','Mana','Stamina'])]
  body.append([f'{cap:.0%}']+[f"{r['probability']:.3%}" for r in vals]+[f"{vals[2]['actions']:.2f}",f"{vals[2]['gold_per_action']/get(1,profiles[2],'Stamina',mode)['gold_per_action']:.2%}"])
 parts.append('### '+mode+' charges\n\n'+table(['Cap','Life completion','Mana completion','Stamina completion','Stamina actions/brew','Stamina gold/action versus current'],body))
parts.append('''## Failure exposure: 24 capped steps without protection

For success chance c on every step and no protection:

- P = c^24.
- Expected enhancement attempts A = (1-P)/(1-c).
- Expected actions per fresh brew D = 1+A+P (collect, attempts, sale only on completion).
- Failed brews average [1+A-25P]/(1-P) actions each; this counts their initial collect and enhancements, but not any wait to obtain ingredients or rebuild value.
- Chance of three consecutive failed brews = (1-P)^3, for a specified block of three independent fresh brews. It is not the chance of seeing any streak over an entire play session.

This table isolates the cap's consequence and excludes fairy retries and shields.
''')
body=[]
for cap in [.95,.97,.98,.99]:
 p=cap**24;a=(1-p)/(1-cap)
 body.append([f'{cap:.0%}',f'{1-p:.2%}',f'{(1-p)**3:.2%}',f'{(1+a-25*p)/(1-p):.2f}'])
parts.append(table(['Cap','A brew fails','Three specified brews all fail','Actions per failed brew'],body))
parts.append('''## Design implications

1. 95% is a harsh general ceiling for Stamina: even 24 individually high-chance steps complete only about 29% of the time without protection. It is poorly suited to the requested longer-but-safer role.
2. 99% leaves meaningful whole-run risk: a completely unprotected 24-step run still fails about 21% of the time. With Stamina's specialized 15% passive protection, the actual completion rate is higher, but is below 100% without consumable shields.
3. Finite shields make the tested fully upgraded Stamina loadout extremely reliable. They can absorb several unlucky attempts. That is different from guaranteed success; the exact remaining failure risk is in cap-comparisons.csv.
4. With unlimited protection and positive chance, eventual completion is mathematically 100% under every cap. If 'never guaranteed' means eventual completion must also stay below 100% even with unlimited protection, a chance cap alone cannot satisfy that. The real-game question is whether protection can be replenished indefinitely at acceptable cost.
5. Life's small base chances are largely untouched by these high ceilings. Its potentially frustrating failure burden must be addressed through the base curve, protection access, or reward/choice design separately; raising the cap does not fix it.
6. Stamina's fairy enhancement multiplier still compounds across 24 steps. A chance cap by itself cannot make family earnings comparable.

## Proposed next decision

Approve 99% as the candidate ceiling for an eventual coordinated balance proposal, while keeping failure recovery/protection availability as a separate design constraint. Do not apply only a ceiling and assume the economy is balanced.

Before changing values, clarify whether the player intends 'no guarantee' to mean each individual enhancement remains risky, or a brew can never become effectively safe with accumulated protection. These are different requirements.

## Method and limitations

compare_caps.py reuses the deterministic recurrence from calculate.py and changes only its chance ceiling. It calculates maximum-target outcomes for all 75 recipes, 21 upgrade/fairy profiles, three resource scenarios, and five ceilings (including the existing 100% baseline): 23,625 scenarios. CSV probabilities retain floating-point precision; printed percentages are rounded and can appear as 100% even when a small failure probability remains. No acquisition costs, human timing, random sampling or player-wellbeing thresholds were invented.
''')
(root/'SUCCESS_CAP_COMPARISON.md').write_text('\n\n'.join(parts),encoding='utf-8')
# Known analytical values independently check cap application and fairy retry behavior.
simple={'base':100,'max_level':2,'chances':[1.],'multipliers':[2.]};profile={'bonus':0,'sell':1,'effects':{}}
x=evaluate(simple,profile,0,1,'None',cap=.99);assert math.isclose(x['probability'],.99)
x=evaluate(simple,profile,0,1,'Unlimited',cap=.99);assert x['probability']==1;assert math.isclose(x['actions'],2+1/.99)
assert math.isclose(get(.99,profiles[2],'Stamina','None')['probability'],(.99/(1-.01*.15))**24)
print('Compared',len(rows),'scenarios. Cap, protected retry, and unlimited resource identities passed.')
for cap in [.95,.97,.98,.99]:
 r=get(cap,profiles[2],'Stamina','None');f=get(cap,profiles[2],'Stamina','Fixed');print(cap,'Stamina completion',r['probability'],'fixed failure',1-f['probability'])
