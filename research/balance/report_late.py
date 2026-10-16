"""Reproduce isolated-brew late outcomes, including finite consumables."""
from copy import deepcopy
from functools import lru_cache
from pathlib import Path
import csv
import json
import math
import sys

ROOT = Path(__file__).resolve().parents[2]
if len(sys.argv) != 2:
    raise SystemExit('Usage: python research/balance/report_late.py OUTPUT_DIRECTORY')
out = Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=True)
after = json.loads((ROOT / 'data/game-data.json').read_text(encoding='utf-8'))['families']
changes = json.loads((ROOT / 'research/balance/applied-late-candidates.json').read_text(encoding='utf-8'))
before = deepcopy(after)
for change in changes:
    recipe = before[change['family']]['recipes'][change['tier'] - 1]
    recipe['multipliers'] = change['before']
    recipe['chances'] = change['before_chances']


def evaluate(recipe, bonus, sell, target, shields=0, enhancement=0, selling=0):
    @lru_cache(None)
    def dp(level, h, e):
        if level == target:
            return 1., 0., 0., 0.
        chance = min(.99, recipe['chances'][level] + bonus + (.1 if e else 0))
        success = dp(level + 1, h, max(0, e - 1))
        failure = dp(level, h - 1, max(0, e - 1)) if h else (0., 0., 0., 0.)
        p = chance * success[0] + (1 - chance) * failure[0]
        attempts = 1 + chance * success[1] + (1 - chance) * failure[1]
        used_h = ((1 - chance) if h else 0) + chance * success[2] + (1 - chance) * failure[2]
        used_e = (1 if e else 0) + chance * success[3] + (1 - chance) * failure[3]
        return p, attempts, used_h, used_e
    p, attempts, used_h, used_e = dp(0, shields, enhancement)
    # Multiply sequentially, matching PotionGame.enhance rather than regrouping.
    value = float(recipe['base'])
    for multiplier in recipe['multipliers'][:target]:
        value = min(1e300, value * multiplier)
    payout = math.floor(min(1e300, value * sell * (2 if selling else 1)))
    actions = 1 + attempts + p
    return dict(stop_level=target + 1, probability=p, payout=payout,
                expected_gold=p * payout, actions=actions, gold_per_action=p * payout / actions,
                shields_used=used_h, enhancement_used=used_e, selling_used=p if selling else 0.)


fixture = dict(base=100, chances=[.5], multipliers=[2])
check = evaluate(fixture, 0, 1, 1, shields=1)
assert math.isclose(check['probability'], .75) and math.isclose(check['actions'], 3.25)
assert math.isclose(check['shields_used'], .5)
check = evaluate(fixture, 0, 1, 1, enhancement=1, selling=2)
assert math.isclose(check['probability'], .6) and check['payout'] == 400
assert check['enhancement_used'] == 1 and check['selling_used'] == .6

profiles = [('Base', 0, 0, 0, 0), ('Shop max', 10, 0, 4, 0), ('Permanent max', 10, 10, 4, 10)]
rows = []
for phase, families in [('Before', before), ('After', after)]:
    for profile, luck, fortune, price, ruby_value in profiles:
        for tier in range(13, 26):
            for f, family in enumerate(families):
                recipe = family['recipes'][tier - 1]
                for mode, charges in [('None', {}), ('Fixed', dict(shields=5, enhancement=10, selling=2))]:
                    best = max((evaluate(recipe, luck * .010345 + fortune * .01,
                                         1 + price * .05 + ruby_value * .05, target, **charges)
                                for target in range(recipe['max_level'])), key=lambda r: r['gold_per_action'])
                    assert all(math.isfinite(v) for v in best.values())
                    rows.append(dict(phase=phase, profile=profile, tier=tier, family=family['label'],
                                     potion=recipe['name'], resources=mode, **best))
with (out / 'late-outcomes.csv').open('w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
spreads = []
for profile, *_ in profiles:
    for tier in range(13, 26):
        for mode in ['None', 'Fixed']:
            selected = [r for r in rows if r['phase'] == 'After' and r['profile'] == profile
                        and r['tier'] == tier and r['resources'] == mode]
            rates = [r['gold_per_action'] for r in selected]
            spreads.append(dict(profile=profile, tier=tier, resources=mode, spread=max(rates) / min(rates)))
summary = dict(changed_recipes=len(changes),
               multiplier_changes=sum(c['before'] != c['after'] for c in changes),
               chance_changes=sum(c['before_chances'] != c['after_chances'] for c in changes),
               baseline_worst_three_profiles=max((r for r in spreads if r['resources'] == 'None'), key=lambda r: r['spread']),
               fixed_worst_three_profiles=max((r for r in spreads if r['resources'] == 'Fixed'), key=lambda r: r['spread']),
               tier_25=[r for r in rows if r['phase'] == 'After' and r['tier'] == 25],
               maximum_selected_payout=max(r['payout'] for r in rows if r['phase'] == 'After'),
               limitations=['Baseline has no fairies, charges or additional ingredients.',
                            'Fixed inventory is per isolated brew; refill and purchase costs are excluded.',
                            'Whole-gold precision beyond JavaScript MAX_SAFE_INTEGER is approximate.',
                            'This does not model conveyor waits, upgrade payback, quests or player enjoyment.'])
(out / 'late-outcomes-summary.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in summary.items() if k != 'tier_25'}, indent=2), flush=True)
print(f'Produced {len(rows)} before/after best-target outcomes; finite-resource fixtures passed.')
