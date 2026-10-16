const SAVE_MODEL=typeof module!=='undefined'?require('./core.js'):{PotionGame,sanitizeSave};
function loadStoredGame(storage,key){
 let raw;try{raw=storage.getItem(key);}catch{return{game:new SAVE_MODEL.PotionGame(),blocked:true,warning:'Storage unavailable · export backups to keep progress'};}
 if(!raw)return{game:new SAVE_MODEL.PotionGame(),blocked:false,warning:''};
 let data,game;try{data=JSON.parse(raw);game=new SAVE_MODEL.PotionGame(SAVE_MODEL.sanitizeSave(data));}catch{let recovered;try{const backup=storage.getItem(key+'-recovery');if(backup){recovered=new SAVE_MODEL.PotionGame(SAVE_MODEL.sanitizeSave(JSON.parse(backup)));if(!storage.getItem(key+'-unreadable'))storage.setItem(key+'-unreadable',raw);storage.setItem(key,backup);const loaded=loadStoredGame(storage,key);return{...loaded,warning:loaded.warning||'Recovered previous save on this device'};}}catch{}return{game:recovered||new SAVE_MODEL.PotionGame(),blocked:true,raw,warning:recovered?'Recovery loaded · export a backup; storage could not restore saving':'Existing save unreadable · original preserved; import a backup'};}
 let warning='';if(data.version<game.state.version){try{const backup=key+'-v'+data.version+'-backup';if(!storage.getItem(backup))storage.setItem(backup,raw);}catch{return{game,blocked:true,raw,warning:'Shop loaded · migration backup unavailable; export a backup before importing it'};}}
 return{game,blocked:false,warning};
}
function writeStoredGame(storage,key,state){const next=JSON.stringify(state),previous=storage.getItem(key);if(previous===next)return;let valid=false;if(previous){try{SAVE_MODEL.sanitizeSave(JSON.parse(previous));valid=true;}catch{}}if(valid)storage.setItem(key+'-recovery',previous);storage.setItem(key,next);}
if(typeof module!=='undefined')module.exports={loadStoredGame,writeStoredGame};
