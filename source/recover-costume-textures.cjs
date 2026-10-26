// Restore only image data from pinned archives; never fetch or replace a runtime or rig.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const archives=read('research/costume-archive-index.json'),costumes=read('data/costumes.json');
const norm=s=>s.replace(/\.png$/i,'').replace(/-sprite-resources-assets-\d+$/,'').toLowerCase().replace(/[-_ ]/g,'');
const blob=b=>crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
const rigHashes=Object.fromEntries(['Pio','Tia'].map(ch=>[ch,blob(fs.readFileSync(path.join(root,`assets/live2d/${ch}/model.moc`)))]));
const prior=fs.existsSync(path.join(root,'research/restored-costume-textures.json'))?read('research/restored-costume-textures.json').restored:[];
const targets=costumes.entries.filter(c=>!c.live2d||prior.some(p=>p.id===c.id));
const jobs=[],missing=[];
for(const c of targets){
 const character=c.id==='healer-costume.png'?'Pio':c.character;
 const key=norm(c.id==='Voice_Story_Costume1.png'?'Voice_Story_Costume.png':c.id);
 const hits=archives.flatMap(a=>a.files.filter(f=>f.path.includes(`/${character}/textures/`)&&norm(path.basename(f.path))===key).map(f=>({archive:a,file:f})));
 const hit=hits.find(({archive:a})=>a.files.some(f=>f.path.includes(`/${character}/`)&&f.path.endsWith('.moc')&&f.sha===rigHashes[character]));
 if(!hit){missing.push({id:c.id,character:c.character,reason:'No matching texture under a byte-identical character rig in checked archives'});continue;}
 const {archive:a,file:f}=hit;
 const filename=path.basename(f.path).toLowerCase().replaceAll(' ','-');assert(/^[a-z0-9-]+\.png$/.test(filename));
 jobs.push({id:c.id,character,previousCharacter:c.character,repository:a.repository,commit:a.commit,sourcePath:f.path,gitBlob:f.sha,bytes:f.size,rigGitBlob:rigHashes[character],localPath:`assets/live2d/${character}/textures/${filename}`,texture:filename,url:`https://raw.githubusercontent.com/${a.repository}/${a.commit}/${f.path.split('/').map(encodeURIComponent).join('/')}`});
}
async function download(job){
 const dest=path.join(root,job.localPath);let bytes;
 if(fs.existsSync(dest))bytes=fs.readFileSync(dest);
 else{for(let attempt=0;attempt<3;attempt++){try{const response=await fetch(job.url,{signal:AbortSignal.timeout(30000)});assert(response.ok,`HTTP ${response.status}`);bytes=Buffer.from(await response.arrayBuffer());break;}catch(e){if(attempt===2)throw e;}}}
 assert.equal(bytes.length,job.bytes);assert.equal(blob(bytes),job.gitBlob,'Archive blob mismatch');
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(bytes.toString('ascii',12,16),'IHDR');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);assert(width===1024&&height===1024,'Unexpected atlas dimensions');
 if(!fs.existsSync(dest))fs.writeFileSync(dest,bytes,{flag:'wx'});
 return {...job,width,height,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
(async()=>{let cursor=0;const restored=[],failed=[];await Promise.all(Array.from({length:4},async()=>{while(cursor<jobs.length){const j=jobs[cursor++];try{restored.push(await download(j));}catch(e){failed.push({id:j.id,error:e.message});}}}));restored.sort((a,b)=>a.id.localeCompare(b.id));
 fs.writeFileSync(path.join(root,'research/restored-costume-textures.json'),JSON.stringify({sources:archives.map(a=>({repository:a.repository,commit:a.commit})),restored,missing,failed},null,2)+'\n');
 console.log(JSON.stringify({restored:restored.length,missing:missing.length,failed,bytes:restored.reduce((n,x)=>n+x.bytes,0)}));if(failed.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
