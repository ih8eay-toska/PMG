// Historical calculations use the pre-rebalance engine and its original inputs.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const before=require('./stage-five-before.json'),runtime={exports:{}};
const source=fs.readFileSync(path.join(__dirname,'stage-five-before-core.js'),'utf8');
// This is trusted local source, evaluated in the host realm to retain Node assertion compatibility.
new Function('GAME_DATA','ECONOMY_DATA','require','module',source)(
 JSON.parse(JSON.stringify(before.gameData)),JSON.parse(JSON.stringify(before.economy)),
 createRequire(path.resolve(__dirname,'../../source/core.js')),runtime);
module.exports=runtime.exports;
