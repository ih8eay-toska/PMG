"""Find late-tier buffs from the live tier-12 boundary; never edit the game."""
from copy import deepcopy
from pathlib import Path
import json
import math
import sys
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
if len(sys.argv) != 2:
    raise SystemExit('Usage: python research/balance/draft_late.py OUTPUT_DIRECTORY')
OUT = Path(sys.argv[1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
data = json.loads((ROOT / 'research/balance/inputs.json').read_text(encoding='utf-8'))
families = deepcopy(data['families'])
for change in json.loads((ROOT / 'research/balance/applied-candidates.json').read_text(encoding='utf-8')):
    recipe = families[change['family']]['recipes'][change['tier'] - 1]
    assert recipe['multipliers'] == change['before']
    recipe['multipliers'] = change['after']
bonuses = np.array([luck * .010345 + fortune * .01
                    for luck in range(11) for fortune in range(11)])
BOUND = 1.98  # Rounding margin below the approved 2x limit.


def outcomes(recipe):
    chances = np.minimum(.99, np.array(recipe['chances'])[None, :] + bonuses[:, None])
    survival = np.cumprod(chances, axis=1)
    attempts = np.cumsum(np.concatenate([np.ones((len(bonuses), 1)), survival[:, :-1]], axis=1), axis=1)
    values = recipe['base'] * np.cumprod(recipe['multipliers'])
    rates = survival * values[None, :] / (1 + attempts + survival)
    all_rates = np.column_stack([np.full(len(bonuses), recipe['base'] / 2), rates])
    return all_rates.max(axis=1), all_rates.argmax(axis=1) + 1, values[-1]


def full_rates(recipe):
    chances = np.minimum(.99, np.array(recipe['chances'])[None, :] + bonuses[:, None])
    survival = np.cumprod(chances, axis=1)
    attempts = 1 + survival[:, :-1].sum(axis=1)
    return survival[:, -1] * recipe['base'] * math.prod(recipe['multipliers']) / (1 + attempts + survival[:, -1])


def scales(recipes, previous):
    rates = np.array([full_rates(r) for r in recipes])
    # x[i] is a log payout buff. Difference constraints enforce every pair
    # across all 121 chance profiles plus each family's previous-tier income.
    x = np.maximum(0, np.log(np.max(previous / rates, axis=1)))
    edges = np.array([[np.max(np.log(rates[j] / rates[i])) - math.log(BOUND)
                       for j in range(3)] for i in range(3)])
    for _ in range(4):
        new = np.maximum(x, np.max(edges + x[None, :], axis=1))
        if np.max(new - x) < 1e-10:
            return x
        x = new
    return None


previous = np.array([outcomes(f['recipes'][11])[0] for f in families])
changes, report = [], []
for tier in range(13, 26):
    original = [f['recipes'][tier - 1] for f in families]
    best = None
    multiplier_only = scales(original, previous) is not None
    for floor_unit in range(math.ceil(min(original[0]['chances']) * 100), 71):
        life_chances = [max(p, floor_unit / 100) for p in original[0]['chances']]
        for sp_unit in range(round(original[2]['chances'][0] * 100), 100):
            recipes = deepcopy(original)
            recipes[0]['chances'] = life_chances
            recipes[2]['chances'] = [sp_unit / 100] * len(recipes[2]['chances'])
            x = scales(recipes, previous)
            if x is None:
                continue
            chance_cost = np.mean(np.array(life_chances) - original[0]['chances']) + sp_unit / 100 - original[2]['chances'][0]
            score = (round(float(chance_cost), 8), float(x.sum()))
            if best is None or score < best[0]:
                best = score, recipes, x
    assert best is not None, tier
    score, recipes, x = best
    for f, r in enumerate(recipes):
        factor = math.exp(x[f] / len(r['multipliers']))
        # Round buffs up; subsequent constraints validate the actual table.
        r['multipliers'] = [math.ceil(m * factor * 1000 - 1e-9) / 1000 for m in r['multipliers']]
    # Quantization can move a pair slightly; raise only the lower recipe.
    for _ in range(100):
        rates = np.array([outcomes(r)[0] for r in recipes])
        limits = np.maximum(previous, rates.max(axis=0)[None, :] / BOUND)
        needed = (limits / rates).max(axis=1)
        if np.max(needed) <= 1 + 1e-12:
            break
        for f in range(3):
            if needed[f] > 1 + 1e-12:
                factor = needed[f] ** (1 / len(recipes[f]['multipliers']))
                recipes[f]['multipliers'] = [math.ceil(m * factor * 1000 - 1e-9) / 1000 for m in recipes[f]['multipliers']]
    else:
        raise AssertionError(('rounding failed', tier))
    spread = float(np.max(rates.max(axis=0) / rates.min(axis=0)))
    adjacent = float(np.min(rates / previous))
    row = {'tier': tier, 'multiplier_only_feasible_in_search': multiplier_only,
           'worst_spread': spread, 'minimum_adjacent': adjacent,
           'life_chances': recipes[0]['chances'], 'stamina_chance': recipes[2]['chances'][0],
           'multipliers': [r['multipliers'][0] for r in recipes],
           'maximum_payout': max(outcomes(r)[2] for r in recipes),
           'winning_targets': [sorted(set(outcomes(r)[1].tolist())) for r in recipes]}
    print(json.dumps(row), flush=True)
    report.append(row)
    for f, r in enumerate(recipes):
        if r['multipliers'] != original[f]['multipliers'] or r['chances'] != original[f]['chances']:
            changes.append({'family': f, 'tier': tier, 'name': r['name'],
                            'before': original[f]['multipliers'], 'after': r['multipliers'],
                            'before_chances': original[f]['chances'], 'after_chances': r['chances']})
        families[f]['recipes'][tier - 1] = r
    previous = rates
(OUT / 'late-candidates.json').write_text(json.dumps(changes, indent=2) + '\n', encoding='utf-8')
(OUT / 'search-summary.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
