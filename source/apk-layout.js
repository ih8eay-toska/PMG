// Main playable-screen measurements only; menu sizing remains with the web UI.
(() => {
 const room=document.querySelector('.room');
 const layout={referenceWidth:720,referenceHeight:1280};
 function resize(){
  const bounds=room.getBoundingClientRect(),height=Math.max(320,innerHeight-Math.max(0,bounds.top)-(innerWidth>650?16:0));
  const scale=Math.min(bounds.width/layout.referenceWidth,height/layout.referenceHeight);
  if(!scale)return;
  room.style.setProperty('--apk-u',scale+'px');
  room.style.setProperty('--apk-render-height',height+'px');
  room.dataset.apkLayout='true';
 }
 new ResizeObserver(resize).observe(room);
 window.addEventListener('resize',resize);
 window.addEventListener('scroll',resize,{passive:true});
})();
