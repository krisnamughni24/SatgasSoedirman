(()=>{
const st=document.createElement('style');
st.textContent=`
.cine-bar{position:fixed;left:0;right:0;height:7.5vh;background:#05080F;z-index:99980;pointer-events:none;transition:transform .8s cubic-bezier(.7,0,.2,1)}
#cbT{top:0}#cbB{bottom:0}
body.nobars #cbT{transform:translateY(-100%)}body.nobars #cbB{transform:translateY(100%)}
#cFade{position:fixed;inset:0;background:#05080F;z-index:99985;pointer-events:none;opacity:0}
#cFlash{position:fixed;inset:0;background:#FFF6E2;z-index:99986;pointer-events:none;opacity:0}
#cWord{position:fixed;inset:0;z-index:99970;pointer-events:none;display:grid;place-items:center;background:radial-gradient(ellipse at center,rgba(5,10,22,.88),rgba(5,10,22,.55) 45%,rgba(5,10,22,.15) 80%);opacity:0}
#cWord .w{text-align:center;display:grid;gap:14px;justify-items:center}
#cWord h1{margin:0;font:800 150px/0.95 'Playfair Display',serif;color:#F6EBD3;letter-spacing:.02em;text-shadow:0 10px 40px rgba(0,0,0,.5)}
#cWord .line{height:4px;width:0;background:linear-gradient(90deg,transparent,#E3C68A,transparent)}
#cWord p{margin:0;font:700 22px 'Archivo',sans-serif;letter-spacing:.45em;text-transform:uppercase;color:#E3C68A}
#cWord.on{animation:wIn 2.1s cubic-bezier(.2,.8,.2,1) forwards}
#cWord.on h1{animation:wTrack 2.1s cubic-bezier(.2,.8,.2,1) forwards}
#cWord.on .line{animation:wLine 1.4s .2s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes wIn{0%{opacity:0}12%{opacity:1}78%{opacity:1}100%{opacity:0}}
@keyframes wTrack{0%{letter-spacing:.5em;filter:blur(10px);transform:scale(1.1)}25%{filter:blur(0)}100%{letter-spacing:.04em;transform:scale(1)}}
@keyframes wLine{to{width:520px}}
#cKick{position:fixed;left:64px;bottom:calc(7.5vh + 34px);z-index:99975;pointer-events:none;display:flex;align-items:center;gap:16px;opacity:0}
#cKick b{font:700 15px 'IBM Plex Mono',monospace;color:#E3C68A;letter-spacing:.2em}
#cKick i{display:block;height:2px;width:60px;background:#E3C68A}
#cKick span{font:700 15px 'Archivo',sans-serif;color:#fff;letter-spacing:.35em;text-transform:uppercase;text-shadow:0 2px 10px rgba(0,0,0,.6);background:rgba(5,10,22,.55);padding:6px 12px;border-radius:4px}
#cKick.on{animation:kIn .6s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes kIn{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:none}}
#cStage{position:fixed;inset:0;z-index:99960;background:radial-gradient(1400px 800px at 70% 30%,#1B3561,#0E1C38 55%,#05080F);display:grid;place-items:center;overflow:hidden;pointer-events:none}
#cStage canvas{position:absolute;inset:0;width:100%;height:100%}
#cStage .c{position:relative;text-align:center;display:grid;gap:10px;justify-items:center}
#cStage .num{font:800 230px/0.9 'Playfair Display',serif;color:#F6EBD3;font-variant-numeric:lining-nums tabular-nums;text-shadow:0 20px 60px rgba(0,0,0,.5)}
#cStage .lab{white-space:nowrap;font:700 28px 'Archivo',sans-serif;letter-spacing:.55em;color:#E3C68A;text-transform:uppercase}
#cStage .t{font:800 170px/0.92 'Playfair Display',serif;color:#F6EBD3;text-shadow:0 20px 60px rgba(0,0,0,.5)}
#cStage .eye{white-space:nowrap;font:700 24px 'Archivo',sans-serif;letter-spacing:.6em;color:#E3C68A}
#cStage .motto{font:italic 600 40px 'Playfair Display',serif;color:#E3C68A;display:flex;gap:22px;align-items:center}
#cStage .motto:before,#cStage .motto:after{content:'';width:120px;height:2px;background:linear-gradient(90deg,transparent,#C59A4A)}
#cStage .motto:after{transform:scaleX(-1)}
.rib{position:absolute;width:1400px;height:200px;background:linear-gradient(180deg,#7E1622 0 62%,#F6EBD3 62% 76%,#7E1622 76%);box-shadow:0 20px 50px rgba(0,0,0,.4);transform:rotate(-24deg)}
.rib.a{top:-120px;left:-600px;animation:ribA 1.2s cubic-bezier(.2,.8,.2,1) both}.rib.b{bottom:-120px;right:-600px;animation:ribB 1.2s cubic-bezier(.2,.8,.2,1) both}
@keyframes ribA{from{transform:rotate(-24deg) translateX(-900px)}}@keyframes ribB{from{transform:rotate(-24deg) translateX(900px)}}
.slam{animation:slam .9s cubic-bezier(.2,.9,.25,1) both}
@keyframes slam{0%{transform:scale(1.6);opacity:0;filter:blur(14px)}60%{opacity:1;filter:blur(0)}100%{transform:scale(1)}}
.rise{animation:rise2 .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes rise2{from{transform:translateY(50px);opacity:0}}
.tag3{font:800 120px/1 'Playfair Display',serif;color:#F6EBD3}
.cine-map #stage{position:fixed!important;inset:0!important;height:100vh!important;min-height:0!important;border-radius:0!important;border:0!important;z-index:60!important}
.cine-map #stage .legend,.cine-map #stage .hint{display:none!important}
.cine-map .plabel{font-size:15px!important;color:#C9D3E6!important;text-shadow:0 2px 8px #000;letter-spacing:.35em!important}
.cine-map .callout{font-size:15px!important;max-width:320px!important;padding:8px 12px!important}
#app{transform-origin:0 0}
.cine-map section[data-pane]{animation:none!important}
`;
document.head.appendChild(st);
const mk=(id,cls)=>{const d=document.createElement('div');d.id=id;if(cls)d.className=cls;document.body.appendChild(d);return d;};
mk('cbT','cine-bar');mk('cbB','cine-bar');mk('cFade');mk('cFlash');
const w=mk('cWord');w.innerHTML='<div class="w"><h1></h1><div class="line"></div><p></p></div>';
const k=mk('cKick');k.innerHTML='<b></b><i></i><span></span>';
const stg=mk('cStage');stg.innerHTML='<canvas id="cDust"></canvas><div class="c" id="cC"></div>';stg.hidden=true;
// gold dust
const P=Array.from({length:140},()=>({x:Math.random(),y:Math.random(),z:Math.random(),v:.02+Math.random()*.05}));
window.__dust=()=>{const c=document.getElementById('cDust');if(stg.hidden)return;const W=c.clientWidth,H=c.clientHeight;if(c.width!==W){c.width=W;c.height=H;}const g=c.getContext('2d');g.clearRect(0,0,W,H);
  P.forEach(p=>{p.y-=p.v*.016*(1+p.z);p.x+=Math.sin((p.y+p.z)*9)*.0006;if(p.y<0){p.y=1;p.x=Math.random();}g.globalAlpha=.25+.6*p.z;g.fillStyle=p.z>.85?'#FFF1CC':'#C59A4A';g.beginPath();g.arc(p.x*W,p.y*H,.8+p.z*2.4,0,7);g.fill();});g.globalAlpha=1;};
window.__word=(h,p)=>{w.classList.remove('on');w.querySelector('h1').textContent=h;w.querySelector('p').textContent=p||'';void w.offsetWidth;w.classList.add('on');};
window.__kick=(n,t)=>{k.classList.remove('on');if(!t){k.style.opacity=0;return;}k.querySelector('b').textContent=n;k.querySelector('span').textContent=t;void k.offsetWidth;k.classList.add('on');};
window.__fade=v=>{document.getElementById('cFade').style.opacity=v;};
window.__flash=v=>{document.getElementById('cFlash').style.opacity=v;};
window.__bars=on=>document.body.classList.toggle('nobars',!on);
window.__stage=html=>{if(html==null){stg.hidden=true;return;}stg.hidden=false;document.getElementById('cC').innerHTML=html;};
window.__cam=(s,ox,oy,tx,ty)=>{const a=document.getElementById('app');if(s===1&&!tx&&!ty){a.style.transform='none';return;}
  const y0=window.scrollY;a.style.transformOrigin=`${ox}px ${oy+y0}px`;a.style.transform=`translate(${tx||0}px,${ty||0}px) scale(${s})`;};
window.__orbit=(px,py,pz,tx,ty,tz)=>{if(!T)return;T.fly=null;T.camera.position.set(px,py,pz);T.controls.target.set(tx,ty,tz);};

window.__night=on=>{if(typeof T==='undefined'||!T)return;const sc=T.scene;window.__nightOn=on;
  const c=on?{bg:'#081227',sea:'#0A1A35',land:'#1A2E55',grid:'#1D3360',edge:'#C59A4A',hemi:.6}:{bg:'#DDE3EC',sea:'#DDE3EC',land:'#FBF6EA',grid:'#C3CCDA',edge:'#B6A57E',hemi:.9};
  sc.background=new THREE.Color(c.bg);sc.fog=new THREE.Fog(c.bg,on?110:140,260);
  sc.traverse(o=>{if(o.geometry&&o.geometry.type==='PlaneGeometry'&&o.material&&o.material.color)o.material.color.set(c.sea);
    if(o.geometry&&o.geometry.type==='ExtrudeGeometry')o.material.color.set(c.land);
    if(o.type==='GridHelper')o.material.color.set(c.grid);
    if(o.type==='Line'&&o.material&&o.material.color&&o.geometry.attributes.position.count>40)o.material.color.set(c.edge);
    if(o.type==='HemisphereLight')o.intensity=c.hemi;});
  updateColumns();};
const _uc=updateColumns;updateColumns=function(){_uc();if(window.__nightOn&&typeof T!=='undefined'&&T){const mx=Math.max(...T.cols.map(m=>m.userData.target));T.cols.forEach(m=>{const k=Math.min(1,m.userData.target/Math.max(1,mx));m.material.color.set(V.lerp('#2D4C80','#F3D38E',k));});}};
})();
