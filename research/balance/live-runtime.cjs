// Reuse the analytical solver against live rules without changing historical evidence.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const live=require('../../source/core.js'),file=path.join(__dirname,'baseline-current.cjs'),originalRequire=createRequire(file),loaded={exports:{}};
new Function('require','module','__dirname','console',fs.readFileSync(file,'utf8'))(id=>id==='./research-runtime.cjs'?live:originalRequire(id),loaded,__dirname,console);
module.exports={...live,...loaded.exports};
