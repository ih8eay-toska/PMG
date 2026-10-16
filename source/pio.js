// The portrait remains available when WebGL or a costume texture is unavailable.
window.pioReady=(async()=>{
 const portrait=document.getElementById('brew-character'),scene=document.getElementById('scene');
 window.brewerCharacter='Pio';
 try{if(localStorage.getItem('pmg-brewer-character')==='Tia')window.brewerCharacter='Tia';}catch{}
 function selectWardrobe(){const character=window.brewerCharacter;let id;try{id=localStorage.getItem('pmg-costume-'+character);}catch{}const current=COSTUMES.entries.find(c=>c.id===game.state.activeCostumeId);if(!id&&current?.character===character)return;const entry=COSTUMES.entries.find(c=>c.id===id&&c.character===character&&game.state.costumes.includes(c.id));id=entry?.id||(character==='Tia'?'Tia.png':COSTUMES.default);if(!game.state.costumes.includes(id))game.state.costumes.push(id);game.equipCostume(id);}
 selectWardrobe();
 const picker=document.createElement('dialog'),title=document.createElement('h2'),preview=document.createElement('img'),choices=document.createElement('div'),close=document.createElement('button'),trigger=document.createElement('button');
 title.textContent='Choose your potion maker';title.id='character-picker-title';picker.setAttribute('aria-labelledby',title.id);
 preview.src=art('Slider-characters.png');preview.alt='Pio on the left and Tia on the right';preview.style.cssText='display:block;width:100%;max-height:55vh;object-fit:contain';
 choices.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:12px';
 const buttons=[];
 function updateChoices(){for(const button of buttons){const selected=button.dataset.character===window.brewerCharacter;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('primary',selected);}trigger.textContent=window.brewerCharacter+' · Change character';portrait.alt=window.brewerCharacter;}
 for(const name of ['Pio','Tia']){const button=document.createElement('button');button.type='button';button.dataset.character=name;button.textContent='Play as '+name;button.onclick=()=>{try{localStorage.setItem('pmg-costume-'+window.brewerCharacter,game.state.activeCostumeId);}catch{}window.brewerCharacter=name;selectWardrobe();save();try{localStorage.setItem('pmg-brewer-character',name);}catch{}render();updateChoices();picker.close();};choices.append(button);buttons.push(button);}
 close.className='close';close.textContent='×';close.setAttribute('aria-label','Close character selection');close.onclick=()=>picker.close();
 picker.append(close,title,preview,choices);document.body.append(picker);trigger.type='button';trigger.className='mode-toggle';trigger.onclick=()=>picker.showModal();updateChoices();render();
 document.getElementById('menu-character').onclick=()=>trigger.click();
 let app,model,revision=0,lastCostume;
 const normalize=value=>value.toLowerCase().replace(/[_ -]/g,'');
 const canvas=document.createElement('canvas');
 canvas.className='pio-canvas';canvas.hidden=true;canvas.setAttribute('aria-hidden','true');
 const style=document.createElement('style');
 style.textContent='.pio-canvas{position:absolute;right:2%;bottom:18px;width:240px;height:265px;z-index:1;pointer-events:none}.pio-canvas[hidden]{display:none}@media(max-width:700px){.pio-canvas{width:190px;height:210px;right:1%;bottom:16px}}';
 document.head.append(style);scene.append(canvas);
 try{
  app=new PIXI.Application({view:canvas,width:380,height:420,transparent:true,antialias:true,autoDensity:false});
  app.ticker.maxFPS=30;
  app.ticker.add(()=>{if(model&&!canvas.hidden)model.update(app.ticker.deltaMS);});
  async function wear(){
   const character=window.brewerCharacter,costume=character+':'+game.state.activeCostumeId;if(costume===lastCostume)return;lastCostume=costume;
   const request=++revision,texture=character==='Tia'?TIA_DATA.costumeTextures[normalize(game.state.activeCostumeId)]:PIO_DATA.textures[normalize(game.state.activeCostumeId)];
   canvas.hidden=true;portrait.hidden=false;
   if(model){app.stage.removeChild(model);model.destroy({children:true,texture:true,baseTexture:true});model=null;}
   if(!texture)return;
   try{
    const settings={...(character==='Tia'?TIA_DATA:PIO_DATA.settings),url:'https://pio.invalid/index.json',textures:[texture]};
    const next=await PIXI.live2d.Live2DModel.from(settings,{autoInteract:false,autoUpdate:false});
    if(request!==revision){next.destroy({children:true,texture:true,baseTexture:true});return;}
    model=next;const scale=Math.min(380/model.width,420/model.height);model.scale.set(scale);
    model.x=(380-model.width)/2;model.y=420-model.height;app.stage.addChild(model);
    canvas.hidden=false;portrait.hidden=true;
   }catch(error){console.warn('Pio costume could not load; using portrait.',error);}
  }
  new MutationObserver(()=>{void wear();}).observe(portrait,{attributes:true,attributeFilter:['src']});
  const visibility=()=>document.hidden?app.stop():app.start();document.addEventListener('visibilitychange',visibility);visibility();
  window.pioReact=result=>{if(model&&!canvas.hidden)model.motion(result==='success'?'success':'failure',0,3);};
  await wear();
 }catch(error){canvas.hidden=true;portrait.hidden=false;if(app)app.destroy(false);console.warn('Live2D unavailable; using portrait.',error);}
})();
