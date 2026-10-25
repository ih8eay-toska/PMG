const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),timers=[];
class Element{
 constructor(){this.children=[];this.className='';this.attrs={};this.style={setProperty:(key,value)=>this.style[key]=value};}
 append(...items){for(const item of items){item.parent=this;this.children.push(item);}}
 remove(){this.removed=true;if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
 setAttribute(key,value){this.attrs[key]=value;}
 getAttribute(key){return this.attrs[key];}
 querySelectorAll(selector){return this.children.filter(child=>child.className.split(' ').includes(selector.slice(1)));}
 animate(frames,options){this.frames=frames;this.animationOptions=options;return{finished:Promise.resolve()};}
}
const cauldron=new Element(),querySelector=selector=>selector==='.cauldron'?cauldron:null;
const ctx=vm.createContext({art:name=>name,document:{hidden:false,querySelector,createElement:()=>new Element()},gameSettings:{reducedMotion:false},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},console});
vm.runInContext(app.slice(app.indexOf('function showSuccessRipple('),app.indexOf('const INGREDIENT_FLIGHT_MS=')),ctx);
const clearCauldron=()=>cauldron.children.length=0;
const normal=()=>{ctx.gameSettings.reducedMotion=false;timers.length=0;clearCauldron();ctx.showSuccessRipple();};
normal();let fx=cauldron.children[0];assert.equal(cauldron.children.length,1);assert.match(fx.className,/enhancement-success-fx/);assert.doesNotMatch(fx.className,/still-success/);assert.equal(fx.children.filter(child=>child.className==='enhancement-success-glow').length,1);assert.equal(fx.children.filter(child=>child.className==='enhancement-success-ripple').length,1);assert.equal(fx.children.filter(child=>child.className==='enhancement-spark').length,7);assert.equal(fx.getAttribute('aria-hidden'),'true');assert.equal(timers[0].delay,900);timers[0].fn();assert.equal(cauldron.children.length,0,'success effect cleans itself up');
normal();const previous=cauldron.children[0];ctx.showSuccessRipple();assert.equal(cauldron.children.length,1,'a new success effect replaces the previous one');assert.equal(previous.removed,true);
ctx.gameSettings.reducedMotion=true;clearCauldron();timers.length=0;ctx.showSuccessRipple();fx=cauldron.children[0];assert.match(fx.className,/still-success/);assert.equal(fx.children.filter(child=>child.className==='enhancement-spark').length,0,'reduced motion omits moving sparks');assert.equal(timers[0].delay,650);assert.equal(cauldron.children.length,1,'reduced motion keeps a brief static success glow');timers[0].fn();assert.equal(cauldron.children.length,0,'reduced-motion success effect cleans itself up');

const ui={hidden:false},calls={success:0,failure:0,sounds:[],flash:0,save:0,render:0,belt:0};
const game={state:{tiaUnlocked:false,potion:{family:0,tier:0}},enhancementPending:null,finishEnhancement:()=>null};
const completeCtx=vm.createContext({game,gameSettings:{reducedMotion:false},document:{createElement:()=>new Element()},window:{pioReact(){}},ACHIEVEMENT_LORE:{entries:{}},ECONOMY:{costumes:{tiaMasteryStars:75}},$:id=>id==='enhancement-progress'?ui:null,masteredPotionCount:()=>0,notice(){},showSuccessRipple:()=>calls.success++,showFailureSmoke:()=>calls.failure++,playOriginalSfx:(...args)=>calls.sounds.push(args),flash:()=>calls.flash++,save:()=>calls.save++,render:()=>calls.render++,updateBeltLabels:()=>calls.belt++,setTimeout:()=>0});
vm.runInContext(app.slice(app.indexOf('function completeEnhancement('),app.indexOf("\n$('sell')",app.indexOf('function completeEnhancement('))),completeCtx);
for(const [result,success,failure,sound] of [['success',1,0,'Enhanced.wav'],['protected',0,1,'Enhance Failed.wav'],['fairy-protected',0,1,'Enhance Failed.wav'],['lost',0,1,'Enhance Failed.wav']]){calls.success=calls.failure=0;calls.sounds=[];game.finishEnhancement=()=>result;completeCtx.completeEnhancement(0);assert.equal(calls.success,success,result+' success VFX guard');assert.equal(calls.failure,failure,result+' keeps existing failure VFX');assert.equal(calls.sounds[0]?.[0],sound,result+' uses its matching original sound');}
console.log('Passed: success VFX is cauldron-local, spark/ripple animated, static and self-cleaning under reduced motion, replaces duplicate effects, and success/failure sounds follow the actual enhancement result.');

// Original sheets use their actual cell grids, remain bounded, and clean up.
for(const[kind,frames,size]of [['enhancing',26,'500% 500%'],['enhanced',16,'500% 300%'],['failed',17,'400% 400%'],['plop',9,'400% 200%']]){
 ctx.gameSettings.reducedMotion=false;clearCauldron();timers.length=0;ctx.showCauldronTexture(kind,350);const sprite=cauldron.children[0];assert.equal(sprite.frames.length,frames);assert.equal(sprite.style.backgroundSize,size);assert.equal(sprite.animationOptions.easing,'steps(1,end)');timers[0].fn();assert.equal(cauldron.children.length,0);
}
clearCauldron();timers.length=0;for(let i=0;i<20;i++)ctx.showCauldronTexture('plop',350);assert.equal(cauldron.children.length,3);timers.forEach(t=>t.fn());assert.equal(cauldron.children.length,0);
ctx.gameSettings.reducedMotion=true;ctx.showCauldronTexture('failed',180);assert.equal(cauldron.children[0].frames,undefined);assert.equal(cauldron.children[0].style.opacity,'.4');assert.ok(cauldron.children[0].style.backgroundPosition);
console.log('Passed: original enhancement/drop sprite grids, bounded rapid drops, cleanup and static reduced-motion frames.');
