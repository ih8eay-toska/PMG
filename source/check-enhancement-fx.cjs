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
const cauldron=new Element(),querySelector=selector=>['.cauldron','.potion-heading','#enhancement-progress'].includes(selector)?cauldron:null;
const ctx=vm.createContext({art:name=>name,document:{hidden:false,querySelector,createElement:()=>new Element()},gameSettings:{reducedMotion:false},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},console});
vm.runInContext(app.slice(app.indexOf('function showFailureSmoke('),app.indexOf('const INGREDIENT_FLIGHT_MS=')),ctx);
const clearCauldron=()=>cauldron.children.length=0;
for(const[kind,count,frames,size]of [['enhancing',53,25,'500% 500%'],['enhanced',5,15,'500% 300%'],['failed',36,16,'400% 400%'],['plop',1,4,'400% 100%']]){
 ctx.gameSettings.reducedMotion=false;clearCauldron();timers.length=0;ctx.showCauldronTexture(kind,1050);const layer=cauldron.children[0];assert.equal(layer.children.length,count);assert.equal(layer.getAttribute('aria-hidden'),'true');for(const sprite of layer.children){assert.equal(sprite.frames.length,frames);assert.equal(sprite.style.backgroundSize,size);assert.equal(sprite.animationOptions.easing,'linear','the whole timeline must advance continuously');assert(sprite.frames.every(frame=>frame.easing==='steps(1,end)'),'step between individual sprite frames');assert.equal(sprite.frames.at(-1).opacity,0);}timers[0].fn();assert.equal(cauldron.children.length,0,'particles clean up');
}
ctx.showSuccessRipple();const previous=cauldron.children[0];ctx.showSuccessRipple();assert.equal(cauldron.children.length,1);assert(previous.removed);clearCauldron();timers.length=0;for(let i=0;i<20;i++)ctx.showCauldronTexture('plop',350);assert.equal(cauldron.children.length,3);timers.forEach(t=>t.fn());assert.equal(cauldron.children.length,0);
ctx.gameSettings.reducedMotion=true;ctx.showFailureSmoke();assert.equal(cauldron.children[0].children.length,1);const sprite=cauldron.children[0].children[0];assert.equal(sprite.frames,undefined);assert.equal(sprite.style.opacity,'.55');assert.ok(sprite.style.backgroundPosition);
console.log('Passed: APK sprite grids, bounded particles, replacement, cleanup and static reduced-motion display.');

const ui={hidden:false},calls={success:0,failure:0,sounds:[],reveals:[],flash:0,save:0,render:0,belt:0};
const game={state:{tiaUnlocked:false,potion:{family:0,tier:0}},enhancementPending:null,finishEnhancement:()=>null};
const completeCtx=vm.createContext({FAMILIES:require('./core.js').FAMILIES,queueNewItemReveal:(...args)=>calls.reveals.push(args),game,gameSettings:{reducedMotion:false},document:{createElement:()=>new Element()},window:{pioReact(){}},ACHIEVEMENT_LORE:{entries:{}},ECONOMY:{costumes:{tiaMasteryPotions:['0-0','1-0','2-0']}},$:id=>id==='enhancement-progress'?ui:null,masteredPotionCount:()=>0,notice(){},showSuccessRipple:()=>calls.success++,showFailureSmoke:()=>calls.failure++,playOriginalSfx:(...args)=>calls.sounds.push(args),flash:()=>calls.flash++,save:()=>calls.save++,render:()=>calls.render++,updateBeltLabels:()=>calls.belt++,setTimeout:()=>0});
vm.runInContext(app.slice(app.indexOf('function completeEnhancement('),app.indexOf("\n$('sell')",app.indexOf('function completeEnhancement('))),completeCtx);
for(const [result,success,failure,sound] of [['success',1,0,'Enhanced.wav'],['protected',0,1,'Enhance Failed.wav'],['fairy-protected',0,1,'Enhance Failed.wav'],['lost',0,1,'Enhance Failed.wav']]){calls.success=calls.failure=0;calls.sounds=[];game.finishEnhancement=()=>result;completeCtx.completeEnhancement(0);assert.equal(calls.success,success,result+' success VFX guard');assert.equal(calls.failure,failure,result+' keeps existing failure VFX');assert.equal(calls.sounds[0]?.[0],sound,result+' uses its matching original sound');}
console.log('Passed: success/failure effect routing and sounds follow the actual enhancement result.');


game.state.potion={family:0,tier:0,level:2};game.finishEnhancement=()=>'success';completeCtx.completeEnhancement(0);assert.deepEqual(calls.reveals,[['potion',0,0,500]],'MAX reveals the correct potion after the native half-second delay');calls.reveals=[];game.state.potion.level=0;completeCtx.completeEnhancement(0);assert.equal(calls.reveals.length,0,'ordinary enhancements do not open an item book');console.log('Passed: MAX-only item reveal with the original 500 ms delay.');
