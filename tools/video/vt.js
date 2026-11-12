// Virtual clock: JS time, timers, rAF, CSS/WAAPI animations and SVG SMIL all advance only when __step(dt) is called.
(()=>{
  let vt=0;let q=[];let timers=[];let tid=1;
  const d0=Date.now();
  performance.now=()=>vt;
  Date.now=()=>d0+vt;
  window.requestAnimationFrame=f=>{q.push(f);return q.length;};
  window.cancelAnimationFrame=()=>{};
  window.setTimeout=(f,ms=0,...a)=>{const id=tid++;timers.push({id,at:vt+(+ms||0),f,a});return id;};
  window.clearTimeout=id=>{timers=timers.filter(t=>t.id!==id);};
  window.setInterval=(f,ms=0,...a)=>{const id=tid++;timers.push({id,at:vt+(+ms||16),f,a,every:+ms||16});return id;};
  window.clearInterval=window.clearTimeout;
  window.__step=dt=>{
    vt+=dt;
    for(let g=0;g<300;g++){let due=null;for(const t of timers)if(t.at<=vt&&(!due||t.at<due.at))due=t;if(!due)break;
      if(due.every)due.at+=due.every;else timers=timers.filter(t=>t!==due);
      try{if(typeof due.f==='function')due.f(...due.a);}catch(e){console.error('timer',e&&e.message);}}
    const cb=q;q=[];cb.forEach(f=>{try{f(vt);}catch(e){console.error('raf',e&&e.message);}});
    document.getAnimations().forEach(a=>{if(a.__v==null){a.__v=Number(a.currentTime)||0;}try{a.pause();}catch(e){}a.__v+=dt;try{a.currentTime=a.__v;}catch(e){}});
    document.querySelectorAll('svg').forEach(s=>{try{if(s.__t==null){s.__t=s.getCurrentTime();}s.pauseAnimations();s.__t+=dt/1000;s.setCurrentTime(s.__t);}catch(e){}});
  };
})();
