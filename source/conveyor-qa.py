"""Create an isolated browser fixture for ticket collection and mode changes."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
page = (root / 'Potion-Maker.html').read_text(encoding='utf-8').replace('pmg-offline-v1', 'pmg-conveyor-qa')
fixture = """<script>
const prepare=document.createElement('button');prepare.id='prepare-ticket-test';prepare.textContent='Prepare ticket test';
const result=document.createElement('pre');result.id='ticket-test-result';document.body.prepend(prepare,result);
let heldTicket,heldPotion;
prepare.onclick=()=>{
 game=new PotionGame();saveBlocked=false;game.collect(0,0);game.state.nextVisitorAt=Date.now()+3600000;
 ingredientMode='conveyor';$('ingredient-mode-toggle').textContent='Choose exact ingredients';render();startBelt();
 conveyor.baseSpeed=0;conveyor.items=[{kind:'ticket',id:1000,x:60},{family:0,tier:0,id:1001,x:136}];
 heldTicket=conveyor.items[0];heldPotion=JSON.stringify(game.state.potion);syncBelt();
 result.textContent='Ready: catch ticket with mouse or key 1. Potion must stay unchanged.';
};
const verify=document.createElement('button');verify.id='verify-ticket-test';verify.textContent='Verify ticket test';document.body.prepend(verify);
verify.onclick=()=>{
 try{
  if(game.state.tickets!==1)throw Error('Expected one ticket');
  if(JSON.stringify(game.state.potion)!==heldPotion||game.state.ingredients!==1)throw Error('Ticket changed potion/ingredient counters');
  catchMaterial(heldTicket.id);if(game.state.tickets!==1)throw Error('Repeated collection paid twice');
  const existing=conveyor,items=JSON.stringify(conveyor.items);
  $('ingredient-mode-toggle').click();
  setTimeout(()=>{
   try{
    if($('ingredients').children.length!==3||$('ingredients').querySelector('[data-belt]'))throw Error('Conveyor leaked into manual mode');
    if(conveyor!==existing||JSON.stringify(conveyor.items)!==items)throw Error('Manual mode changed conveyor');
    $('ingredient-mode-toggle').click();
    if(conveyor!==existing||JSON.stringify(conveyor.items)!==items)throw Error('Mode switch rerolled conveyor');
    save(true);if(JSON.parse(localStorage.getItem(KEY)).tickets!==1)throw Error('Ticket not saved');
    result.textContent='PASS: ticket caught once; potion/counters preserved; manual mode stays clean; conveyor preserved; reward saved.';
   }catch(error){result.textContent='FAIL: '+error.message;}
  },250);
 }catch(error){result.textContent='FAIL: '+error.message;}
};
</script>"""
page = page.replace('</body>', fixture + '</body>')
(root / 'Conveyor-QA.html').write_text(page, encoding='utf-8')
print('Open Conveyor-QA.html; prepare, collect the ticket, then verify. Uses a separate save key.')
