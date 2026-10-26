// Only the hosted edition includes this client. Gameplay and save formats are unchanged.
(()=>{
 if(!/^https?:$/.test(location.protocol)||document.getElementById('pwa-tools'))return;
 const anchor=document.getElementById('save-device-note');if(!anchor)return;
 const card=document.createElement('section');card.id='pwa-tools';card.className='save-tool-card';card.setAttribute('aria-labelledby','pwa-title');
 card.innerHTML='<h3 id="pwa-title">Install &amp; play offline</h3><p id="pwa-status" role="status" aria-live="polite">Preparing the offline copy. Keep this page open until it is ready.</p><p id="pwa-update-status" class="small" role="status"></p><div class="pwa-actions"><button id="pwa-install" type="button" class="save-primary" hidden>Install app</button><button id="pwa-check" type="button" class="save-secondary">Check for updates / retry offline download</button><button id="pwa-update" type="button" class="save-primary" hidden>Save &amp; update app</button></div><p id="pwa-install-help" class="small">Use your browser’s Install app option. On iPhone or iPad, use Share → Add to Home Screen. The complete offline copy stores about 100 MB. Browser storage can be cleared; keep an exported save backup.</p>';
 anchor.after(card);
 const style=document.createElement('style');style.textContent='#pwa-tools{margin-block:var(--ui-space-4);min-width:0}#pwa-tools h3{margin-top:0}#pwa-tools .pwa-actions{display:flex;flex-wrap:wrap;gap:var(--ui-space-2)}#pwa-tools button{white-space:normal;max-width:100%;min-height:var(--ui-control-height)}#pwa-tools button[hidden]{display:none}#pwa-tools p{overflow-wrap:anywhere}';document.head.append(style);
 const get=id=>document.getElementById(id),status=get('pwa-status'),note=get('pwa-update-status'),install=get('pwa-install'),update=get('pwa-update'),check=get('pwa-check');
 let registration,prompt,installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,applying=false,repairing=false,lastError='';
 const badge=document.createElement('small');badge.hidden=true;badge.textContent='Update ready';document.getElementById('save-tools')?.append(badge);
 function installState(){install.hidden=installed||!prompt;get('pwa-install-help').hidden=installed;}
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;installState();});
 window.addEventListener('appinstalled',()=>{installed=true;prompt=null;installState();});
 install.onclick=async()=>{const current=prompt;if(!current)return;prompt=null;install.disabled=true;try{await current.prompt();const choice=await current.userChoice;if(choice.outcome==='accepted')installed=true;}catch{note.textContent='Use your browser’s Install app option instead.';}finally{install.disabled=false;installState();}};
 if(!('serviceWorker' in navigator)||!isSecureContext){status.textContent='This browser cannot prepare an installed offline app here. The web game and downloaded HTML remain available.';check.hidden=true;installState();return;}
 function workerStatus(worker){return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Offline status unavailable'));},5000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};worker.postMessage({type:'PMG_OFFLINE_STATUS'},[channel.port2]);});}
 async function refresh(){
  if(!registration)return;
  const waiting=registration.waiting;
  update.hidden=!waiting;badge.hidden=!waiting;
  if(!applying)note.textContent=lastError||(waiting?'An update is ready. Your current game will stay open until you choose Save & update app.':'');
  if(registration.installing||repairing){status.textContent='Downloading the complete offline copy. Keep this page open; this may take a while.';return;}
  if(!registration.active){status.textContent=lastError||'Offline copy is not ready yet. Check your connection and retry.';return;}
  try{const result=await workerStatus(registration.active);status.textContent=result.ready?(navigator.onLine?'Ready to play offline. Your complete game is stored on this device.':'You are offline. Playing the saved offline copy.'):'Offline copy is incomplete. Connect and retry the offline download.';}catch{status.textContent='Offline readiness could not be verified. Connect and retry.';}
 }
 function track(){const worker=registration.installing;if(!worker)return;refresh();worker.addEventListener('statechange',()=>{if(worker.state==='redundant'&&!registration.waiting)lastError='The new offline copy did not finish. Retry when connected; your current game is unchanged.';refresh();});}
 check.onclick=async()=>{check.disabled=true;lastError='';note.textContent='Checking for updates…';try{if(!registration)await register();else{await registration.update();if(!registration.installing&&!registration.waiting&&registration.active&&!(await workerStatus(registration.active)).ready){repairing=true;registration.active.postMessage({type:'PMG_REPAIR_OFFLINE'});}}if(!registration.installing&&!registration.waiting&&!repairing)note.textContent='No newer version found.';}catch{lastError='Could not check for updates. Connect to the internet and try again.';}finally{check.disabled=false;refresh();}};
 update.onclick=()=>{
  if(!registration?.waiting||applying)return;
  if(game.enhancementPending||typeof rewardBusy!=='undefined'&&rewardBusy){note.textContent='Wait for the current enhancement or chest opening to finish, then update.';return;}
  save(true);if(saveBlocked||!saveOK){note.textContent='Your shop could not be saved. Export a backup or restore saving before updating.';return;}
  applying=true;update.disabled=true;note.textContent='Shop saved. Applying the update…';registration.waiting.postMessage({type:'PMG_ACTIVATE_UPDATE'});
  setTimeout(()=>{if(applying){applying=false;update.disabled=false;note.textContent='The update has not finished. Your saved shop is safe; try again.';}},15000);
 };
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(applying){location.reload();return;}refresh();});
 navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='PMG_OFFLINE_STATUS'){repairing=!!event.data.preparing;if(event.data.error)lastError=event.data.error;refresh();}});
 window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
 document.getElementById('save-dialog').addEventListener('toggle',()=>{if(document.getElementById('save-dialog').open)refresh();});
 async function register(){registration=await navigator.serviceWorker.register(new URL('service-worker.js',location.href),{scope:new URL('./',location.href).pathname,updateViaCache:'none'});registration.addEventListener('updatefound',track);track();await refresh();}
 installState();register().catch(()=>{lastError='Offline download could not start. Check your connection, browser storage and permissions, then retry.';status.textContent=lastError;});
})();
