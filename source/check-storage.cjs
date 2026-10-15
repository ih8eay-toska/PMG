const assert=require('node:assert/strict');
const {INITIAL}=require('./core.js');const {loadStoredGame}=require('./storage.js');
const old={...INITIAL(),version:7,coins:123};const raw=JSON.stringify(old);const items=new Map([['test',raw]]);
const storage={getItem:key=>items.get(key)||null,setItem:()=>{throw Error('Quota exceeded');}};
let loaded=loadStoredGame(storage,'test');assert.equal(loaded.blocked,false);assert.equal(loaded.game.state.coins,123);assert.match(loaded.warning,/backup/);assert.equal(items.get('test'),raw);
loaded=loadStoredGame({getItem:()=>'{broken'},'test');assert.equal(loaded.blocked,true);
loaded=loadStoredGame({getItem:()=>{throw Error('Unavailable');}},'test');assert.equal(loaded.blocked,true);assert.match(loaded.warning,/unavailable/);
loaded=loadStoredGame({getItem:()=>null},'test');assert.equal(loaded.blocked,false);assert.equal(loaded.game.state.version,10);
console.log('Passed: backup quota failure preserves a loaded shop; invalid/unavailable storage never overwrites its original.');
