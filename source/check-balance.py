"""Check the applied tier-1–25 baseline; fairy/consumable balance is excluded."""
from copy import deepcopy
from itertools import product
from pathlib import Path
import json
import math

ROOT = Path(__file__).resolve().parent.parent
families = json.loads((ROOT / 'data/game-data.json').read_text(encoding='utf-8'))['families']
original = json.loads((ROOT / 'research/balance/inputs.json').read_text(encoding='utf-8'))['families']
changes = json.loads((ROOT / 'research/balance/applied-candidates.json').read_text(encoding='utf-8'))
late_changes = json.loads((ROOT / 'research/balance/applied-late-candidates.json').read_text(encoding='utf-8'))
expected = deepcopy(original)
assert len(changes) == 17
assert len({(c['family'], c['tier']) for c in changes}) == 17
for c in changes:
    recipe = expected[c['family']]['recipes'][c['tier'] - 1]
    assert recipe['multipliers'] == c['before']
    recipe['multipliers'] = c['after']
    recipe['notes'].append('Personal balance adjustment: enhancement multipliers differ from the original wiki values.')
assert len(late_changes) == 30
assert len({(c['family'], c['tier']) for c in late_changes}) == 30
for c in late_changes:
    assert 13 <= c['tier'] <= 25
    recipe = expected[c['family']]['recipes'][c['tier'] - 1]
    assert recipe['multipliers'] == c['before']
    assert recipe['chances'] == c['before_chances']
    assert len(c['after']) == len(c['before']) == recipe['max_level'] - 1
    assert len(c['after_chances']) == len(c['before_chances']) == len(c['after'])
    assert all(math.isfinite(a) and a >= b for a, b in zip(c['after'], c['before']))
    assert all(b <= a <= .99 for a, b in zip(c['after_chances'], c['before_chances']))
    recipe['multipliers'] = c['after']
    recipe['chances'] = c['after_chances']
    recipe['notes'].append('Personal late-game balance adjustment: enhancement values differ from the original wiki values.')
assert families == expected, 'Unexpected recipe, material, chance or early/middle change'


def ladder(recipe, luck, fortune):
    probability, attempts, value = 1.0, 0.0, float(recipe['base'])
    rows = [(probability, 2.0, value)]
    for chance, multiplier in zip(recipe['chances'], recipe['multipliers']):
        attempts += probability
        probability *= min(.99, chance + luck * (.10345 / 10) + fortune * .01)
        value = min(1e300, value * multiplier)
        rows.append((probability, 1 + attempts + probability, value))
    return rows


def best(rows, price, ruby_value):
    factor = 1 + price * .05 + ruby_value * .05
    return max(p * math.floor(min(1e300, value * factor)) / actions
               for p, actions, value in rows)


fixture = dict(base=100, chances=[.5, .4], multipliers=[2, 2])
p, actions, value = ladder(fixture, 0, 0)[-1]
assert math.isclose(p, .2) and math.isclose(actions, 1 + 1 + .5 + .2) and value == 400
assert ladder(dict(base=100, chances=[1], multipliers=[2]), 10, 10)[-1][0] == .99

worst = [0.0] * 25
minimum_adjacent = float('inf')
entry_ratio = float('inf')
minimum_late_adjacent = float('inf')
states = 0
for luck, fortune in product(range(11), repeat=2):
    ladders = [[ladder(f['recipes'][tier], luck, fortune) for f in families] for tier in range(25)]
    for price, ruby_value in product(range(5), range(11)):
        states += 1
        previous = None
        for tier, rows in enumerate(ladders):
            rates = [best(r, price, ruby_value) for r in rows]
            spread = max(rates) / min(rates)
            worst[tier] = max(worst[tier], spread)
            assert spread <= 2 + 1e-10, (tier + 1, luck, price, fortune, ruby_value, spread)
            if previous:
                ratios = [now / before for now, before in zip(rates, previous)]
                minimum_adjacent = min(minimum_adjacent, *ratios)
                assert min(ratios) >= 1 - 1e-12, (tier + 1, ratios)
                if tier >= 12:
                    minimum_late_adjacent = min(minimum_late_adjacent, *ratios)
                if tier == 12:
                    entry_ratio = min(entry_ratio, rates[2] / previous[2])
            previous = rates
assert states == 6655
print(f'Passed: tiers 1–25, {states} upgrade combinations each ({states * 25:,} tier/state checks); worst spread {max(worst):.9f}×; minimum adjacent ratio {minimum_adjacent:.9f}×.')
print(f'Late tiers worst spread {max(worst[12:]):.9f}×; minimum adjacent ratio including entry {minimum_late_adjacent:.9f}×; minimum Stamina tier-12→13 ratio {entry_ratio:.9f}×.')
