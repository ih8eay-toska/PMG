const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const report=read('research/restored-costume-textures.json'),costumes=read('data/costumes.json').entries;
const additions=read('research/approved-costume-additions.json');report.restored.push(...additions.restored);
const {PotionGame,sanitizeSave}=require('./core.js');
for(const r of report.restored){
 const c=costumes.find(x=>x.id===r.id),bytes=fs.readFileSync(path.join(root,r.localPath));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),r.sha256);assert(c.live2d&&c.free&&c.texture===r.texture&&c.character===r.character);
 if(r.previewSha256)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r.previewPath))).digest('hex'),r.previewSha256);
 const game=new PotionGame();game.state.tiaUnlocked=true;assert(game.buyCostume(c.id));assert.equal(game.state.tickets,0);assert.equal(game.state.activeCostumeId,c.id);
 const saved=sanitizeSave(JSON.parse(JSON.stringify(game.state)));assert.equal(saved.activeCostumeId,c.id);assert(saved.costumes.includes(c.id));
}
const artwork=read('data/original-assets.json').assets;
for(const r of [...additions.restored,...additions.previewCorrections]){assert.equal(artwork[r.id],r.previewPath);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,r.previewPath))).digest('hex'),r.previewSha256);}
console.log(`Passed: ${report.restored.length} restored image hashes, free equipping, and save round trips.`);
// Optional isolated browser fixture: no game/save scripts and no network resources.
if(process.argv[2]){
 const html=fs.readFileSync(path.join(root,'Potion-Maker.html'),'utf8');
 const scripts=[...html.matchAll(/<script data-pio-runtime>([\s\S]*?)<\/script>/g)].slice(0,4).map(m=>'<script>'+m[1]+'</script>').join('');
 const map=read('data/original-assets.json').assets;
 const entries=report.restored.map(r=>({id:r.id,character:r.character,preview:'data:image/png;base64,'+fs.readFileSync(path.join(root,map[r.id])).toString('base64')}));
 const runner=`const entries=${JSON.stringify(entries)};const norm=s=>s.toLowerCase().replace(/[_ -]/g,'');
 (async()=>{const app=new PIXI.Application({width:160,height:180,transparent:true,antialias:true,preserveDrawingBuffer:true});app.stop();const results=[];
 for(const c of entries){let model;try{const settings=c.character==='Pio'?PIO_DATA.settings:TIA_DATA;const texture=(c.character==='Pio'?PIO_DATA.textures:TIA_DATA.costumeTextures)[norm(c.id)];if(!texture)throw Error('Missing wearable mapping');
 model=await PIXI.live2d.Live2DModel.from({...settings,url:'https://pio.invalid/index.json',textures:[texture]},{autoInteract:false,autoUpdate:false});model.scale.set(Math.min(160/model.width,180/model.height));model.x=(160-model.width)/2;model.y=180-model.height;app.stage.addChild(model);
 model.update(100);app.renderer.render(app.stage);const before=app.renderer.extract.pixels();await model.motion('idle',0,3);for(let i=0;i<20;i++)model.update(100);app.renderer.render(app.stage);const after=app.renderer.extract.pixels();let opaque=0,changed=0;for(let i=3;i<after.length;i+=4){if(after[i]>0)opaque++;if(after[i]!==before[i]||after[i-1]!==before[i-1])changed++;}if(opaque<100)throw Error('Blank model');
 const figure=document.createElement('figure'),preview=new Image(),render=new Image(),caption=document.createElement('figcaption');preview.src=c.preview;render.src=app.view.toDataURL();caption.textContent=c.character+' '+c.id;figure.append(preview,render,caption);document.getElementById('gallery').append(figure);results.push({id:c.id,character:c.character,opaque,changed,ok:true});
 }catch(e){results.push({id:c.id,ok:false,error:String(e)});}finally{if(model){app.stage.removeChild(model);model.destroy({children:true,texture:true,baseTexture:true});}}}
 const summary={total:results.length,passed:results.filter(r=>r.ok).length,animated:results.filter(r=>r.changed>0).length,results};document.getElementById('result').textContent=JSON.stringify(summary);document.title='DONE '+summary.passed+'/'+summary.total;
 })().catch(e=>{document.getElementById('result').textContent=JSON.stringify({error:String(e)});});`;
 fs.writeFileSync(process.argv[2],'<!doctype html><meta charset="utf-8"><title>Costume QA running</title><style>body{background:#e9e1d9;font:11px sans-serif}#gallery{display:grid;grid-template-columns:repeat(5,220px)}figure{margin:4px;border:1px solid #aaa}img{width:105px;height:120px;object-fit:contain}figcaption{overflow-wrap:anywhere}</style><pre id="result">running</pre><div id="gallery"></div>'+scripts+'<script>'+runner+'</script>');
 console.log('Created isolated browser fixture:',process.argv[2]);
}
