const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
let timers=[],contexts=[],started=[],buffers=0;
class Param{constructor(){this.value=0;}setValueAtTime(value){this.value=value;}linearRampToValueAtTime(value){this.value=value;}exponentialRampToValueAtTime(value){this.value=value;}}
class Node{constructor(kind){this.kind=kind;this.gain=new Param();this.frequency=new Param();this.Q=new Param();this.started=false;this.stopped=false;}connect(){}disconnect(){}start(...args){this.started=true;this.startedAt=args[0];started.push(this);}stop(){this.stopped=true;}}
class AudioContext{constructor(){this.currentTime=0;this.sampleRate=1000;this.destination={};this.state='running';this.nodes=[];contexts.push(this);}createGain(){const node=new Node('gain');this.nodes.push(node);return node;}createBiquadFilter(){const node=new Node('filter');this.nodes.push(node);return node;}createBufferSource(){const node=new Node('source');this.nodes.push(node);return node;}createOscillator(){const node=new Node('osc');this.nodes.push(node);return node;}createBuffer(channels,length,rate){buffers++;return{sampleRate:rate,getChannelData:()=>new Float32Array(length)};}resume(){return Promise.resolve();}}
const ctx=vm.createContext({document:{hidden:false},window:{AudioContext},gameSettings:{effectsVolume:.3},Math,setTimeout:fn=>{timers.push(fn);return timers.length;},console});
vm.runInContext('let effectAudio=null;',ctx);
vm.runInContext(app.slice(app.indexOf('const INGREDIENT_FLIGHT_MS='),app.indexOf('function flash(')),ctx);
const voices=()=>vm.runInContext('splashVoices',ctx);
const resetAudio=()=>{timers=[];contexts=[];started=[];buffers=0;vm.runInContext('effectAudio=null;splashNoise=null;splashVoices=0;',ctx);};
const runTimers=()=>{while(timers.length)timers.shift()();};

resetAudio();ctx.gameSettings.effectsVolume=0;ctx.playCauldronSplash();assert.equal(timers.length,0,'mute must not schedule audio');
ctx.gameSettings.effectsVolume=.3;ctx.document.hidden=true;ctx.playCauldronSplash();assert.equal(timers.length,0,'hidden page must not schedule audio');
ctx.document.hidden=false;ctx.playCauldronSplash();assert.equal(timers.length,1,'visible unmuted splash schedules once');runTimers();assert.equal(contexts.length,1);assert.equal(started.filter(n=>n.kind==='source').length,1);assert.equal(voices(),1);assert.ok(Math.abs(contexts[0].nodes[0].gain.value-.096)<1e-9,'effects volume scales the splash level');

resetAudio();ctx.playCauldronSplash();ctx.document.hidden=true;runTimers();assert.equal(started.length,0,'splash is cancelled if the page becomes hidden before impact');assert.equal(voices(),0);
ctx.document.hidden=false;resetAudio();ctx.playCauldronSplash();ctx.gameSettings.effectsVolume=0;runTimers();assert.equal(started.length,0,'splash is cancelled if muted before impact');ctx.gameSettings.effectsVolume=.3;

resetAudio();for(let i=0;i<5;i++)ctx.playCauldronSplash();runTimers();assert.equal(started.filter(n=>n.kind==='source').length,3,'overlap limit is three voices');assert.equal(contexts[0].nodes.length,18,'blocked splashes must not create audio nodes');assert.equal(buffers,1,'the noise buffer is allocated once and reused');const levels=[0,6,12].map(i=>contexts[0].nodes[i].gain.value);assert.ok(Math.abs(levels[0]-.096)<1e-9&&levels[0]>levels[1]&&levels[1]>levels[2],'overlapping splashes are gain-normalized');assert.equal(voices(),3);started.find(n=>n.kind==='source').onended();assert.equal(voices(),2);ctx.playCauldronSplash();runTimers();assert.equal(started.filter(n=>n.kind==='source').length,4,'a freed voice can be reused');assert.equal(buffers,1,'later splashes keep reusing the cached buffer');

const source={getBoundingClientRect:()=>({left:0,top:0,width:20,height:20})},target={getBoundingClientRect:()=>({left:100,top:100,width:20,height:20})},image={style:{},animate:()=>({finished:Promise.resolve()}),remove(){}};
Object.assign(ctx,{document:{hidden:false,createElement:()=>image,body:{append(){}},querySelector:()=>target},beltElements:new Map([[7,source]]),$:()=>({children:[source]}),art:x=>x,FAMILIES:[{materials:[{image:'x'}]}],helperCatElements:new Map(),reducedMotion:false});
vm.runInContext(app.slice(app.indexOf('function animateIngredient('),app.indexOf('function renderHelper(')),ctx);
const splashCalls=[];ctx.playCauldronSplash=delay=>splashCalls.push(delay);
ctx.animateIngredient(0,0,7);assert.deepEqual(splashCalls,[480],'a normal ingredient splash is delayed until impact');
splashCalls.length=0;ctx.reducedMotion=true;ctx.animateIngredient(0,0,7);assert.deepEqual(splashCalls,[0],'reduced motion plays when the ingredient is added');
splashCalls.length=0;ctx.reducedMotion=false;ctx.animateIngredient(0,0,7,null,'ticket');ctx.animateIngredient(0,0,7,null,'solution');assert.equal(splashCalls.length,0,'tickets and Miracle Solution are silent');
ctx.animateIngredient(0,0,7,{intervalMs:1000});assert.deepEqual(splashCalls,[480],'helper-caught ingredients splash too');

let collectOK=false,animateCalls=0,saves=0,renders=0;
Object.assign(ctx,{game:{state:{potion:null},collect:()=>collectOK,recipe:()=>({name:'Test potion'})},conveyor:{take(){}},notice(){},save:()=>saves++,render:()=>renders++,updateBeltLabels(){},syncBelt(){},drawSelectedIngredients(){},ingredientMode:'manual',animateIngredient:()=>animateCalls++});
vm.runInContext(app.slice(app.indexOf('function collectMaterial('),app.indexOf('function catchMaterial(')),ctx);
ctx.collectMaterial(0,0);assert.equal(animateCalls,0,'failed collection must not start a splash');assert.equal(saves,0);assert.equal(renders,0);
collectOK=true;ctx.collectMaterial(0,0);assert.equal(animateCalls,1,'successful manual collection starts the fall animation and splash');

animateCalls=0;Object.assign(ctx,{game:{state:{potion:null},collect:()=>true,collectTicket:()=>true,collectSolution:()=>true,recipe:()=>({name:'Test potion'})},conveyor:{items:[{id:1,kind:'ticket'},{id:2,kind:'solution'},{id:3,family:0,tier:0}],take(){}},notice(){},save(){},render(){},syncBelt(){},animateIngredient:()=>animateCalls++});
vm.runInContext(app.slice(app.indexOf('function catchMaterial('),app.indexOf('function animate(')),ctx);
ctx.catchMaterial(1);ctx.catchMaterial(2);assert.equal(animateCalls,0,'ticket and Miracle Solution catches must not splash');ctx.catchMaterial(3);assert.equal(animateCalls,1,'successful ingredient catch starts the fall animation and splash');
console.log('Passed: cauldron splash impact timing, ingredient-only triggers, helpers, reduced motion, mute/hidden guards, volume scaling, cached buffer reuse and three-voice overlap cap.');
