"""Create an isolated browser regression page; never touches the player's save."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
page = (root / 'Potion-Maker.html').read_text(encoding='utf-8')
page = page.replace("pmg-offline-v1", "pmg-rendering-qa")
setup = """<script>
localStorage.removeItem('pmg-rendering-qa');
const fixture = new PotionGame();
fixture.state.coins = 100000;
fixture.state.nextVisitorAt = Date.now() + 3600000;
localStorage.setItem('pmg-rendering-qa', JSON.stringify(fixture.state));
let qaWrites = 0;
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  if (key === 'pmg-rendering-qa') qaWrites++;
  return originalSetItem.call(this, key, value);
};
</script>"""
page = page.replace('<script>const $=', setup + '<script>const $=')
tests = """<script>
const qaButton = document.createElement('button');
qaButton.id = 'run-rendering-qa'; qaButton.textContent = 'Run rendering checks';
const qaResult = document.createElement('pre'); qaResult.id = 'qa-result';
document.body.prepend(qaButton, qaResult);
qaButton.onclick = async () => {
  const passed = [];
  const check = (ok, name) => { if (!ok) throw Error(name); passed.push(name); };
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {
    const upgrades = $('upgrades').firstElementChild;
    const powerups = $('powerups').firstElementChild;
    const travelers = $('travelers').firstElementChild;
    catchMaterial(belt[0].id);
    const bottle = $('bottle-wrap').firstElementChild;
    const before = qaWrites;
    for (let i = 0; i < 3; i++) catchMaterial(belt[0].id);
    check(qaWrites === before, 'rapid actions defer writes');
    check($('upgrades').firstElementChild === upgrades, 'upgrade elements retained');
    check($('powerups').firstElementChild === powerups, 'powerup elements retained');
    check($('travelers').firstElementChild === travelers, 'unchanged visitor retained');
    check($('bottle-wrap').firstElementChild === bottle, 'potion image retained');
    await pause(500);
    check(qaWrites === before + 1, 'rapid actions use one save write');
    check(JSON.parse(localStorage.getItem(KEY)).ingredients === game.state.ingredients, 'batched save contains latest progress');
    $('statistics').click();
    const row = $('statistics-content').querySelector('tbody tr');
    const playTime = $('statistics-play-time').textContent;
    await pause(2100);
    check($('statistics-content').querySelector('tbody tr') === row, 'statistics rows retained across timer ticks');
    check($('statistics-play-time').textContent !== playTime, 'active play time updates');
    renderStatistics();
    check($('statistics-content').querySelector('tbody tr') === row, 'statistics rows retained during refresh');
    $('statistics-dialog').close();
    let accessibilityChanges = 0;
    const observer = new MutationObserver(records => accessibilityChanges += records.length);
    observer.observe($('ingredients'), {subtree:true, attributes:true, attributeFilter:['tabindex','aria-hidden','aria-label','data-visible-slot']});
    await pause(700); observer.disconnect();
    check(accessibilityChanges < 80, 'conveyor accessibility updates only as slots change');
    check([...$('ingredients').querySelectorAll('[data-visible-slot]')].every(el => el.tabIndex === 0 && el.getAttribute('aria-hidden') === 'false'), 'visible ingredients keyboard accessible');
    const beforeFlush = qaWrites; save(); window.dispatchEvent(new Event('pagehide'));
    check(qaWrites === beforeFlush + 1, 'page exit flushes pending progress');
    qaResult.textContent = 'PASS: ' + passed.join('\\nPASS: ');
  } catch (error) { qaResult.textContent = 'FAIL: ' + error.message + '\\nPassed: ' + passed.join(', '); }
};
</script>"""
page = page.replace('</body>', tests + '</body>')
target = root / 'Rendering-QA.html'
target.write_text(page, encoding='utf-8')
print('Open', target, 'and click Run rendering checks.')
