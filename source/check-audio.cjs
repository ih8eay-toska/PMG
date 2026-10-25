const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
let timers=[],contexts=[],started=[],decodes=0,buffers=0;
class Param{constructor(){this.value=0;}setValueAtTime(value){this.value=value;}linearRampToValueAtTime(value){this.value=value;}exponentialRampToValueAtTime(value){this.value=value;}}
class Node{constructor(kind){this.kind=kind;this.gain=new Param();this.frequency=new Param();this.Q=new Param();this.started=false;this.stopped=false;}connect(){}disconnect(){this.disconnected=true;}start(...args){this.started=true;this.startedAt=args[0];started.push(this);}stop(){this.stopped=true;}}
const decodedBuffer={sampleRate:22050,duration:.649};
class AudioContext{constructor(){this.currentTime=0;this.sampleRate=48000;this.destination={};this.state='running';this.nodes=[];contexts.push(this);}createGain(){const node=new Node('gain');this.nodes.push(node);return node;}createBiquadFilter(){const node=new Node('filter');this.nodes.push(node);return node;}createBufferSource(){const node=new Node('source');this.nodes.push(node);return node;}createOscillator(){const node=new Node('osc');this.nodes.push(node);return node;}createBuffer(channels,length,rate){buffers++;return{sampleRate:rate,getChannelData:()=>new Float32Array(length)}}decodeAudioData(){decodes++;return Promise.resolve(decodedBuffer);}resume(){return Promise.resolve();}}
const splashData='data:audio/wav;base64,'+Buffer.from('decoded once').toString('base64');
const ctx=vm.createContext({document:{hidden:false},window:{AudioContext},gameSettings:{effectsVolume:.3},Math,Promise,Uint8Array,art:key=>key==='Plop.wav'?splashData:'',atob:value=>Buffer.from(value,'base64').toString('binary'),setTimeout:fn=>{timers.push(fn);return timers.length;},console});
vm.runInContext('let effectAudio=null;',ctx);
vm.runInContext(app.slice(app.indexOf('const INGREDIENT_FLIGHT_MS='),app.indexOf('function flash(')),ctx);
const voices=()=>vm.runInContext('plopVoices',ctx);
const sources=()=>started.filter(node=>node.kind==='source');
const gains=()=>started.length?contexts[0].nodes.filter(node=>node.kind==='gain'):[];
const resetAudio=()=>{timers=[];contexts=[];started=[];decodes=0;buffers=0;vm.runInContext('effectAudio=null;plopLoad=null;plopVoices=0;',ctx);};
const flush=async()=>{while(timers.length)timers.shift()();await Promise.resolve();await Promise.resolve();};

function readSplash(){
 const file=fs.readFileSync(path.join(__dirname,'..','assets','audio','original-apk','Plop.wav'));
 let offset=12,format=null,data=null;
 while(offset+8<=file.length){
  const id=file.toString('ascii',offset,offset+4),size=file.readUInt32LE(offset+4);
  if(id==='fmt ')format={channels:file.readUInt16LE(offset+10),rate:file.readUInt32LE(offset+12),bits:file.readUInt16LE(offset+22)};
  if(id==='data')data=file.subarray(offset+8,offset+8+size);
  offset+=8+size+(size&1);
 }
 assert.ok(format&&data,'cauldron splash WAV has fmt and data chunks');
 assert.equal(format.channels,1,'original Plop is mono');
 assert.equal(format.rate,22050,'original Plop is 22.05 kHz');
 assert.equal(format.bits,16,'original Plop is PCM16');
 assert.ok(Math.abs(data.length/2/format.rate-.649)<.001,'original Plop is 649 ms');
 const samples=new Float32Array(data.length/2);
 for(let i=0;i<samples.length;i++)samples[i]=data.readInt16LE(i*2)/32768;
 return{samples,rate:format.rate};
}
function renderSplash(samples,rate,volume,hits){
 const active=[],end=hits[hits.length-1]+samples.length/rate,output=new Float32Array(Math.ceil(end*rate)+2);
 let voicesStarted=0;
 for(const at of hits){
  for(let i=active.length-1;i>=0;i--)if(active[i]<=at)active.splice(i,1);
  if(active.length>=3)continue;
  const gain=volume/Math.sqrt(active.length+1),offset=Math.round(at*rate);
  for(let i=0;i<samples.length;i++)output[offset+i]+=samples[i]*gain;
  active.push(at+samples.length/rate);voicesStarted++;
 }
 let peak=0;
 for(const sample of output)peak=Math.max(peak,Math.abs(sample));
 return{peak,voicesStarted};
}

(async()=>{
 resetAudio();ctx.gameSettings.effectsVolume=0;ctx.playIngredientPlop();assert.equal(timers.length,0,'mute must not schedule audio');await flush();assert.equal(decodes,0,'mute must not decode the splash');
 ctx.gameSettings.effectsVolume=.3;ctx.document.hidden=true;ctx.playIngredientPlop();assert.equal(timers.length,0,'hidden page must not schedule audio');await flush();assert.equal(decodes,0,'hidden page must not decode the splash');
 ctx.document.hidden=false;ctx.playIngredientPlop();assert.equal(timers.length,1,'visible unmuted splash schedules once');await flush();
 assert.equal(contexts.length,1,'splash reuses one shared audio context');assert.equal(decodes,1,'splash decodes once');assert.equal(sources().length,1,'one splash voice starts');assert.equal(voices(),1);
 assert.equal(sources()[0].buffer,decodedBuffer,'splash plays the decoded recording');assert.equal(sources()[0].startedAt,.004,'splash starts at impact');assert.equal(sources()[0].stopped,false,'splash plays the full recording without a cut-off timer');
 const firstGain=gains()[0];assert.ok(Math.abs(firstGain.gain.value-.3)<1e-9,'effects volume sets the recording gain once');assert.equal(contexts[0].nodes.filter(n=>n.kind==='filter').length,0,'recorded splash has no synthesized filter graph');assert.equal(contexts[0].nodes.filter(n=>n.kind==='osc').length,0,'recorded splash has no oscillator');
 assert.equal(buffers,0,'splash no longer allocates a synthesized noise buffer');

 resetAudio();ctx.playIngredientPlop();ctx.document.hidden=true;await flush();assert.equal(sources().length,0,'splash is cancelled if the page becomes hidden before impact');assert.equal(voices(),0);
 ctx.document.hidden=false;resetAudio();ctx.playIngredientPlop();ctx.gameSettings.effectsVolume=0;await flush();assert.equal(sources().length,0,'splash is cancelled if muted before impact');ctx.gameSettings.effectsVolume=.3;

 resetAudio();for(let i=0;i<5;i++)ctx.playIngredientPlop();await flush();assert.equal(sources().length,3,'overlap limit is three voices');assert.equal(contexts[0].nodes.length,6,'blocked splashes must not create audio nodes');assert.equal(decodes,1,'the recording is decoded once across the voice cap');const levels=gains().map(n=>n.gain.value);assert.ok(Math.abs(levels[0]-.3)<1e-9&&levels[0]>levels[1]&&levels[1]>levels[2],'overlapping splashes are gain-normalized without an extra fixed attenuation');assert.equal(voices(),3);
 const ended=sources()[0];ended.onended();assert.equal(ended.disconnected,true,'a finished splash disconnects its source');assert.equal(ended.stopped,false);assert.equal(voices(),2);ctx.playIngredientPlop();await flush();assert.equal(sources().length,4,'a freed voice can be reused');assert.equal(decodes,1,'later splashes keep using the decoded recording');assert.equal(contexts.length,1,'later splashes keep the shared context');
 for(const source of sources())source.onended?.();assert.equal(voices(),0,'voice tracking returns to zero after all hits end');

 const{ samples,rate }=readSplash(),isolated=renderSplash(samples,rate,1,[0]),rapid=renderSplash(samples,rate,1,[0,.1,.2,.3,.4,.5,.6,.7,.8]),normalIsolated=renderSplash(samples,rate,.3,[0]),normalRapid=renderSplash(samples,rate,.3,[0,.1,.2,.3,.4,.5,.6,.7,.8]);
 assert.ok(Math.abs(isolated.peak-.282)<2e-3,'isolated max-volume peak matches original Plop recording');
 assert.ok(rapid.peak<.5,'rapid max-volume peaks stay well below clipping');
 assert.ok(normalRapid.peak<.1&&rapid.peak<.99,'rapid helper catches do not clip at normal or maximum effects volume');
 assert.ok(Math.abs(rapid.peak/isolated.peak-normalRapid.peak/normalIsolated.peak)<1e-6,'effects volume scales the recording linearly rather than attenuating twice');
 assert.equal(rapid.voicesStarted,5,'the review overlap pattern starts five voices under the three-voice cap');

 const source={getBoundingClientRect:()=>({left:0,top:0,width:20,height:20})},target={getBoundingClientRect:()=>({left:100,top:100,width:20,height:20})},image={style:{},animate:()=>({finished:Promise.resolve()}),remove(){}};
 Object.assign(ctx,{document:{hidden:false,createElement:()=>image,body:{append(){}},querySelector:()=>target},beltElements:new Map([[7,source]]),$:()=>({children:[source]}),art:x=>x,FAMILIES:[{materials:[{image:'x'}]}],helperCatElements:new Map(),showCauldronTexture(){},reducedMotion:false});
 vm.runInContext(app.slice(app.indexOf('function animateIngredient('),app.indexOf('function renderHelper(')),ctx);
 const plopCalls=[],helperHits=[];ctx.playOriginalSfx=(...args)=>helperHits.push(args);const splashCalls=plopCalls;ctx.playIngredientPlop=delay=>splashCalls.push(delay);
 ctx.animateIngredient(0,0,7);assert.deepEqual(splashCalls,[480],'a normal ingredient splash is delayed until impact');
 splashCalls.length=0;ctx.reducedMotion=true;ctx.animateIngredient(0,0,7);assert.deepEqual(splashCalls,[0],'reduced motion plays when the ingredient is added');
 splashCalls.length=0;ctx.reducedMotion=false;ctx.animateIngredient(0,0,7,null,'ticket');ctx.animateIngredient(0,0,7,null,'solution');assert.equal(splashCalls.length,0,'tickets and Miracle Solution are silent');
 ctx.animateIngredient(0,0,7,{intervalMs:1000});assert.deepEqual(splashCalls,[],'helper-caught ingredients do not use the manual plop');assert.deepEqual(helperHits.map(args=>args[0]),['Pushcat Hit.wav'],'helper catches use the original Pushcat hit');
 splashCalls.length=0;helperHits.length=0;for(let i=0;i<5;i++)ctx.animateIngredient(0,0,7,{intervalMs:1000});assert.deepEqual(splashCalls,[],'helper catches do not also trigger the ingredient plop');assert.deepEqual(helperHits.map(args=>args[0]),Array(5).fill('Pushcat Hit.wav'),'helper catch sound requests go through the shared throttled player');

 let collectOK=false,animateCalls=0,saves=0,renders=0;
 Object.assign(ctx,{game:{state:{potion:null},collect:()=>collectOK,recipe:()=>({name:'Test potion'})},conveyor:{take(){}},notice(){},save:()=>saves++,render:()=>renders++,updateBeltLabels(){},syncBelt(){},drawSelectedIngredients(){},ingredientMode:'manual',animateIngredient:()=>animateCalls++});
 vm.runInContext(app.slice(app.indexOf('function collectMaterial('),app.indexOf('function catchMaterial(')),ctx);
 ctx.collectMaterial(0,0);assert.equal(animateCalls,0,'failed collection must not start a splash');assert.equal(saves,0);assert.equal(renders,0);
 collectOK=true;ctx.collectMaterial(0,0);assert.equal(animateCalls,1,'successful manual collection starts the fall animation and splash');

 animateCalls=0;Object.assign(ctx,{game:{state:{potion:null},collect:()=>true,collectTicket:()=>true,collectSolution:()=>true,recipe:()=>({name:'Test potion'})},conveyor:{items:[{id:1,kind:'ticket'},{id:2,kind:'solution'},{id:3,family:0,tier:0}],take(){}},notice(){},save(){},render(){},syncBelt(){},animateIngredient:()=>animateCalls++});
 vm.runInContext(app.slice(app.indexOf('function catchMaterial('),app.indexOf('function animate(')),ctx);
 ctx.catchMaterial(1);ctx.catchMaterial(2);assert.equal(animateCalls,0,'ticket and Miracle Solution catches must not splash');ctx.catchMaterial(3);assert.equal(animateCalls,1,'successful ingredient catch starts the fall animation and splash');

 let clock=0,visibility=null;const played=[];class FakeAudio{constructor(src){this.src=src;this.currentTime=0;this.volume=1;this.pauses=0;this.plays=0;played.push(this);}pause(){this.pauses++;}play(){this.plays++;return Promise.resolve();}}
 const sfxCtx=vm.createContext({Audio:FakeAudio,performance:{now:()=>clock},document:{hidden:false,addEventListener:(name,fn)=>{if(name==='visibilitychange')visibility=fn;}},gameSettings:{effectsVolume:.5},art:name=>'data:audio/wav;base64,'+name});
 vm.runInContext(app.slice(app.indexOf('const originalSfxPlayers='),app.indexOf('const stored=')),sfxCtx);
 sfxCtx.playOriginalSfx('Pushcat Hit.wav',.12,120);assert.equal(played.length,1);assert.equal(played[0].volume,.06,'original sound respects the effects-volume scale');assert.equal(played[0].plays,1);
 clock=50;sfxCtx.playOriginalSfx('Pushcat Hit.wav',.12,120);assert.equal(played[0].plays,1,'rapid helper hits are rate-limited');
 clock=130;sfxCtx.playOriginalSfx('Pushcat Hit.wav',.12,120);assert.equal(played.length,1,'the same clip reuses one audio player');assert.equal(played[0].plays,2);
 sfxCtx.document.hidden=true;visibility();assert.ok(played[0].pauses>0,'hiding the page stops original effects');
 sfxCtx.document.hidden=false;sfxCtx.gameSettings.effectsVolume=0;sfxCtx.playOriginalSfx('Sell.wav',.3);assert.equal(played.length,1,'muted effects do not create or play audio');
 console.log(`Passed: original ingredient Plop decodes once, reuses the shared context, starts at impact, respects mute/hidden/reduced-motion/effects-volume, caps overlap at three voices, cleans up nodes, and excludes tickets/solutions/failed catches. Measured isolated peak ${isolated.peak.toFixed(6)} and rapid peak ${rapid.peak.toFixed(6)} at maximum volume; ${normalRapid.peak.toFixed(6)} at normal volume.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
