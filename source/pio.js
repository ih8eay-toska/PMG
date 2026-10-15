// The portrait remains available when WebGL or a costume texture is unavailable.
window.pioReady=(async()=>{
 const portrait=document.getElementById('brew-character'),scene=document.getElementById('scene');
 let app,model,revision=0,lastCostume;
 const normalize=value=>value.toLowerCase().replace(/[_ -]/g,'');
 const canvas=document.createElement('canvas');
 canvas.className='pio-canvas';canvas.hidden=true;canvas.setAttribute('aria-hidden','true');
 const style=document.createElement('style');
 style.textContent='.pio-canvas{position:absolute;right:2%;bottom:14px;width:190px;height:210px;z-index:1;pointer-events:none}.pio-canvas[hidden]{display:none}@media(max-width:700px){.pio-canvas{width:150px;height:170px}}';
 document.head.append(style);scene.append(canvas);
 try{
  app=new PIXI.Application({view:canvas,width:380,height:420,transparent:true,antialias:true,autoDensity:false});
  app.ticker.maxFPS=30;
  app.ticker.add(()=>{if(model&&!canvas.hidden)model.update(app.ticker.deltaMS);});
  async function wear(){
   const costume=game.state.activeCostumeId;if(costume===lastCostume)return;lastCostume=costume;
   const request=++revision,texture=PIO_DATA.textures[normalize(costume)];
   canvas.hidden=true;portrait.hidden=false;
   if(model){app.stage.removeChild(model);model.destroy({children:true,texture:true,baseTexture:true});model=null;}
   if(!texture)return;
   try{
    const settings={...PIO_DATA.settings,url:'https://pio.invalid/index.json',textures:[texture]};
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
