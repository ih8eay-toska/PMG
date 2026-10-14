const SAVE_MODEL=typeof module!=='undefined'?require('./core.js'):{PotionGame,sanitizeSave};
function loadStoredGame(storage,key){
 let raw;try{raw=storage.getItem(key);}catch{return{game:new SAVE_MODEL.PotionGame(),blocked:true,warning:'Storage unavailable · export backups to keep progress'};}
 if(!raw)return{game:new SAVE_MODEL.PotionGame(),blocked:false,warning:''};
 let data,game;try{data=JSON.parse(raw);game=new SAVE_MODEL.PotionGame(SAVE_MODEL.sanitizeSave(data));}catch{return{game:new SAVE_MODEL.PotionGame(),blocked:true,warning:'Existing save unreadable · original preserved; import a backup'};}
 let warning='';if(data.version<8){try{const backup=key+'-v'+data.version+'-backup';if(!storage.getItem(backup))storage.setItem(backup,raw);}catch{warning='Shop loaded · could not write migration backup; export a backup';}}
 return{game,blocked:false,warning};
}
if(typeof module!=='undefined')module.exports={loadStoredGame};
