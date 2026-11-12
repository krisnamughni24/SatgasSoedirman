
/* ================================================================
   NETWORK (d3-force on canvas)
   ================================================================ */
const ETYPE={tim:['Koordinasi tim','#B6A57E'],bantuan:['Bantuan rekan','#B0476A'],referral:['Rujukan antar-Serdik','#6A4C93'],rapat:['Rapat','#4A86C8'],berbagi:['Berbagi pengetahuan','#C59A4A']};
let NET=null;
function initNet(){
  if(NET){resizeNet();syncLinks();NET.sim.alpha(.3).restart();renderNetSide();return;}
  const cv=$('#netCanvas');
  if(!window.d3){cv.insertAdjacentHTML('afterend','<div class="empty">Pustaka graf tidak dapat dimuat.</div>');cv.remove();return;}
  NET={cv,nodes:[],byId:new Map(),links:[],tf:d3.zoomIdentity,layout:'geo',color:'cluster',hover:null,ver:-1,W:0,H:0};
  resizeNet();rebuildNodes();
  NET.sim=d3.forceSimulation(NET.nodes).force('charge',d3.forceManyBody().strength(-6).distanceMax(90)).force('collide',d3.forceCollide(3.4))
    .force('x',d3.forceX(n=>geoXY(n.s)[0]).strength(.55)).force('y',d3.forceY(n=>geoXY(n.s)[1]).strength(.55)).force('link',d3.forceLink([]).id(d=>d.id)).alphaDecay(.035);
  syncLinks();
  d3.select(cv).call(d3.zoom().scaleExtent([.5,8]).on('zoom',e=>{NET.tf=e.transform;}));
  const at=e=>{const b=cv.getBoundingClientRect();const [x,y]=NET.tf.invert([e.clientX-b.left,e.clientY-b.top]);return NET.sim.find(x,y,10/NET.tf.k);};
  cv.addEventListener('mousemove',e=>{NET.hover=at(e)||null;cv.style.cursor=NET.hover?'pointer':'grab';});
  cv.addEventListener('mouseleave',()=>NET.hover=null);
  cv.addEventListener('click',e=>{const n=at(e);if(n)openProfile(n.s);});
  new ResizeObserver(()=>{resizeNet();}).observe(cv);
  renderNetSide();
}
function rebuildNodes(){
  const keep=new Map(NET.nodes.map(n=>[n.id,n]));
  NET.nodes=S.filter(s=>s.region).map(s=>{const o=keep.get(s.idx);if(o)return o;const g=geoXY(s);return{id:s.idx,s,x:g[0]+(Math.random()-.5)*30,y:g[1]+(Math.random()-.5)*30};});
  NET.byId=new Map(NET.nodes.map(n=>[n.id,n]));if(NET.sim)NET.sim.nodes(NET.nodes);
}
function resizeNet(){if(!NET)return;const cv=NET.cv,dpr=Math.min(2,window.devicePixelRatio||1);NET.W=cv.clientWidth;NET.H=cv.clientHeight;cv.width=NET.W*dpr;cv.height=NET.H*dpr;NET.dpr=dpr;
  if(NET.sim){NET.sim.force('x').x(n=>geoXY(n.s)[0]);NET.sim.force('y').y(n=>geoXY(n.s)[1]);NET.sim.alpha(.3).restart();}}
function geoXY(s){const W=NET.W||800,H=NET.H||500,k=Math.min(W/100,H/36);return[W/2+(s.px+1)*k,H/2+(s.pz-1.8)*k];}
function syncLinks(){
  if(NET.nodes.length!==S.filter(s=>s.region).length)rebuildNodes();
  NET.ver=net.ver;NET.links=[...net.edges.values()].filter(e=>NET.byId.has(e.a)&&NET.byId.has(e.b)).map(e=>({source:e.a,target:e.b,e}));
  const geo=NET.layout==='geo';
  NET.sim.force('link').links(NET.links).strength(l=>geo?.004:Math.min(.5,.04+l.e.w*.035)).distance(geo?30:16);
  NET.sim.force('charge').strength(geo?-6:-22);NET.sim.force('x').strength(geo?.55:.02);NET.sim.force('y').strength(geo?.55:.02);
  NET.sim.alpha(geo?.2:.6).restart();
}
function drawNet(dt){
  if(net.ver!==NET.ver)syncLinks();
  const {cv,tf,dpr}=NET,g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,NET.W,NET.H);
  g.save();g.translate(tf.x,tf.y);g.scale(tf.k,tf.k);
  const ego=$('#netEgo').checked,mid=me.idx,nb=new Set([mid]);
  if(ego)NET.links.forEach(l=>{if(l.source.id===mid)nb.add(l.target.id);if(l.target.id===mid)nb.add(l.source.id);});
  for(const l of NET.links){const a=l.source,b=l.target;if(a.x==null)continue;const inEgo=a.id===mid||b.id===mid;
    let al=.13+Math.min(.45,l.e.w*.04);if(ego&&!inEgo)al*=.12;if(inEgo)al=Math.max(al,.65);
    g.globalAlpha=al;g.strokeStyle=ETYPE[l.e.last]?ETYPE[l.e.last][1]:'#B6A57E';g.lineWidth=(.5+Math.min(2.6,l.e.w*.2))/tf.k*(inEgo?1.6:1);
    g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();}
  net.flash=net.flash.filter(f=>{f.t+=dt;const a=NET.byId.get(f.e.a),b=NET.byId.get(f.e.b);if(!a||!b)return false;const k=f.t/2.2;
    g.globalAlpha=Math.max(0,1-k);g.strokeStyle=ETYPE[f.type]?ETYPE[f.type][1]:'#13274A';g.lineWidth=(4-k*3)/tf.k;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
    const px=a.x+(b.x-a.x)*Math.min(1,k*1.6),py=a.y+(b.y-a.y)*Math.min(1,k*1.6);g.fillStyle=g.strokeStyle;g.beginPath();g.arc(px,py,4/tf.k,0,7);g.fill();return f.t<2.2;});
  const deg=NET.deg||new Map();
  for(const n of NET.nodes){if(n.x==null)continue;const r=(2.4+Math.min(4,(deg.get(n.id)||0)*.25))/Math.sqrt(tf.k)*1.2;
    g.globalAlpha=ego&&!nb.has(n.id)?.15:1;g.fillStyle=NET.color==='cluster'?CLHEX[n.s.dom]:PROVHEX[n.s.region.prov];
    g.beginPath();g.arc(n.x,n.y,r,0,7);g.fill();if(n.s.coord){g.strokeStyle='#0F1D38';g.lineWidth=.8/tf.k;g.stroke();}}
  g.globalAlpha=1;const m=NET.byId.get(mid);
  if(m){const t=(performance.now()/1400)%1;g.strokeStyle='#13274A';g.lineWidth=2/tf.k;g.beginPath();g.arc(m.x,m.y,(6+t*14)/tf.k,0,7);g.globalAlpha=1-t;g.stroke();g.globalAlpha=1;
    g.fillStyle='#13274A';g.beginPath();g.arc(m.x,m.y,6/tf.k,0,7);g.fill();g.fillStyle='#0F1D38';g.font=`600 ${12/tf.k}px IBM Plex Sans, sans-serif`;g.fillText('Anda',m.x+9/tf.k,m.y-8/tf.k);}
  if(NET.hover){const n=NET.hover;g.fillStyle='#0F1D38';g.font=`600 ${12/tf.k}px IBM Plex Sans, sans-serif`;g.fillText(`${n.s.name} · ${n.s.region.name}`,n.x+8/tf.k,n.y+4/tf.k);}
  g.restore();
}
function renderNetSide(){
  if(!NET)return;const deg=new Map(),wdeg=new Map(),regs=new Map();
  NET.links.forEach(l=>{const a=l.e.a,b=l.e.b;[a,b].forEach((x,i)=>{deg.set(x,(deg.get(x)||0)+1);wdeg.set(x,(wdeg.get(x)||0)+l.e.w);const o=S[i?a:b];if(!regs.has(x))regs.set(x,new Set());regs.get(x).add(o.region?o.region.id:-1);});});
  NET.deg=deg;const ranked=[...deg.entries()].sort((a,b)=>b[1]-a[1]);const myRank=ranked.findIndex(x=>x[0]===me.idx)+1;
  const mine=NET.links.filter(l=>l.e.a===me.idx||l.e.b===me.idx).map(l=>({o:S[l.e.a===me.idx?l.e.b:l.e.a],e:l.e})).sort((a,b)=>b.e.w-a.e.w);
  $('#netMe').innerHTML=`<div class="row between"><h3>Posisi Anda di jaringan</h3><span class="pill acc">peringkat ${myRank||'—'} / ${NET.nodes.length}</span></div>
   <div class="gauge"><div><b class="num">${deg.get(me.idx)||0}</b><span>rekan terhubung</span></div><div><b class="num">${(regs.get(me.idx)||new Set()).size}</b><span>kab/kota terjangkau</span></div><div><b class="num">${Math.round(wdeg.get(me.idx)||0)}</b><span>bobot interaksi</span></div></div>
   <div>${mine.slice(0,6).map(x=>`<div class="fi" data-psid="${x.o.idx}"><span class="sdot" style="background:${CLHEX[x.o.dom]};margin-top:4px"></span><span>${esc(x.o.name)}<br><span class="muted" style="font-size:.7rem">${esc(x.o.region?x.o.region.name:'—')} · ${Object.keys(x.e.types).map(t=>ETYPE[t]?ETYPE[t][0]:t).join(', ')}</span></span><span class="num small">${Math.round(x.e.w)}</span></div>`).join('')||'<div class="empty">Belum ada interaksi.</div>'}</div>`;
  const tc={};net.edges.forEach(e=>Object.entries(e.types).forEach(([t,w])=>tc[t]=(tc[t]||0)+w));const tm=Math.max(...Object.values(tc),1);
  $('#netTypes').innerHTML=Object.keys(ETYPE).map(t=>`<div class="barrow"><span><span class="sdot" style="background:${ETYPE[t][1]}"></span> ${ETYPE[t][0]}</span><div class="track"><i data-w="${Math.round((tc[t]||0)/tm*100)}" style="background:${ETYPE[t][1]}"></i></div><span class="num">${fmt(tc[t]||0)}</span></div>`).join('');
  $('#netTop').innerHTML=ranked.slice(0,8).map(([id,d],i)=>`<div class="fi${id===me.idx?' mine':''}" data-psid="${id}"><span class="num muted">${i+1}</span><span>${esc(S[id].name)}<br><span class="muted" style="font-size:.7rem">${esc(S[id].region?S[id].region.name:'—')} · ${(regs.get(id)||new Set()).size} kab/kota</span></span><span class="num small">${d}</span></div>`).join('');
  animateBars($('#netTypes'));
}
$('#pane-jaringan').addEventListener('click',e=>{const p=e.target.closest('[data-psid]');if(p)openProfile(S[+p.dataset.psid]);});
$('#netLayout').onclick=e=>{const b=e.target.closest('button');if(!b||!NET)return;NET.layout=b.dataset.l;$$('#netLayout button').forEach(x=>x.setAttribute('aria-pressed',x===b));syncLinks();};
$('#netColor').onclick=e=>{const b=e.target.closest('button');if(!b||!NET)return;NET.color=b.dataset.c;$$('#netColor button').forEach(x=>x.setAttribute('aria-pressed',x===b));};

/* ================================================================
   ISSUE BOARD (drag & drop)
   ================================================================ */
state.isScope='mine';state.dragging=false;let boardSig='';
function issueList(){
  const sc=state.isScope,p=$('#isProv').value,c=$('#isCat').value,a=$('#isAuth').value;
  return I.filter(it=>(state.isRegion?it.region===state.isRegion:(sc==='all'||(sc==='mine'?it.owner===me:it.region===me.region)))&&(!p||it.region.prov===p)&&(!c||it.cat===c)&&(!a||AUTH[it.auth]===a));
}
function renderIssues(force){
  if(state.dragging)return;
  const list=issueList();const sig=state.isScope+list.length+'|'+ST.map((_,i)=>list.filter(x=>x.si===i).length).join(',')+(state.isRegion?state.isRegion.id:'');
  if(!force&&sig===boardSig)return;boardSig=sig;
  const n=list.length,rec=list.filter(i=>i.docOk).length,fwd=list.filter(i=>i.si>=3).length,mon=list.filter(i=>i.si>=3&&i.monitored).length,done=list.filter(i=>i.si>=6).length;
  $('#isKpis').innerHTML=[[n,'aspirasi dalam cakupan'],[pct(rec,n)+'%','dicatat lengkap'],[pct(fwd,n)+'%','tingkat tindak lanjut'],[pct(done,n)+'%','tingkat penyelesaian'],[list.filter(i=>i.fresh).length,'aspirasi baru']].map(([b,s],i)=>`<div class="kpi"${i===2?' style="border-color:var(--accent)"':''}><b>${b}</b><span>${s}</span></div>`).join('');
  $$('#isScope button').forEach(b=>b.setAttribute('aria-pressed',!state.isRegion&&b.dataset.v===state.isScope));
  const chip=state.isRegion?`<div class="row" style="margin-bottom:8px"><button class="btn sm" id="clrReg">Wilayah: ${esc(state.isRegion.name)} ×</button></div>`:'';
  $('#board').innerHTML=ST.map((st,si)=>{const items=list.filter(i=>i.si===si).sort((a,b)=>(b.fresh?1:0)-(a.fresh?1:0)||b.pr-a.pr);
    return `<div class="col" data-si="${si}"><h4><span>${st[2]}</span><span class="num muted">${items.length}</span></h4>${items.slice(0,14).map(it=>`<div class="icard ${pClass(it.pr)}${it.fresh?' fresh':''}${it.owner===me?' mine':''}" draggable="true" data-iid="${it.id}">
      <div class="row between" style="flex-wrap:nowrap"><span class="mono muted" style="font-size:.66rem">${it.id}${it.owner===me?' · saya':''}</span><b class="num">P${it.pr}</b></div><div style="font-weight:600">${esc(it.title)}</div>
      <div class="muted" style="font-size:.7rem">${esc(it.region.name)} · Desa ${esc(it.desa)}</div><div class="row" style="gap:4px"><span class="ch ${CAT_CL[it.cat]}">${esc(it.cat)}</span>${it.auth===2?'<span class="ch">rujuk</span>':''}${it.referredTo?'<span class="ch">antar-Serdik</span>':''}</div></div>`).join('')}${items.length>14?`<span class="small muted" style="padding:2px 4px">+${items.length-14} lainnya</span>`:''}</div>`;}).join('');
  const old=$('#regChipRow');if(old)old.remove();if(chip){$('#board').insertAdjacentHTML('beforebegin',`<div id="regChipRow">${chip}</div>`);$('#clrReg').onclick=()=>{state.isRegion=null;renderIssues(true);};}
  const fun=[['Didengar & diterima',n],['Dicatat lengkap',rec],['Divalidasi',list.filter(i=>i.si>=2).length],['Ditangani / diteruskan',fwd],['Dipantau berkala',mon],['Umpan balik ke warga',list.filter(i=>i.feedback).length],['Selesai',done]];
  $('#funnel').innerHTML=fun.map(([l,v],i)=>`<div class="frow"><span>${l}</span><div class="track"><i data-w="${pct(v,n)}" style="background:${i>=3&&i<=5?'var(--accent)':i===6?'var(--ok)':'#C9B48A'}"></i></div><span class="num">${v} · ${pct(v,n)}%</span></div>`).join('');
  animateBars($('#funnel'));renderPareto(list);
}
function renderPareto(list){
  const cnt=CATS.map(c=>[c,list.filter(i=>i.cat===c).length]).sort((a,b)=>b[1]-a[1]);const tot=cnt.reduce((a,b)=>a+b[1],0)||1,mx=Math.max(...cnt.map(c=>c[1]),1);
  const W=640,H=290,L=40,Rr=40,B=92,Tp=14,bw=(W-L-Rr)/cnt.length;let cum=0,pts=[],bars='';
  cnt.forEach(([c,v],i)=>{const h=(H-B-Tp)*v/mx,x=L+i*bw;cum+=v;
    bars+=`<rect x="${x+4}" y="${H-B-h}" width="${bw-8}" height="${h}" rx="3" fill="${CLHEX[CAT_CL[c]]}" opacity=".85"><animate attributeName="height" from="0" to="${h}" dur=".6s"/><animate attributeName="y" from="${H-B}" to="${H-B-h}" dur=".6s"/><title>${c}: ${v}</title></rect><text x="${x+bw/2}" y="${H-B-h-4}" text-anchor="middle" style="fill:#0F1D38">${v}</text><text transform="translate(${x+bw/2},${H-B+10}) rotate(40)" font-size="10">${c}</text>`;
    pts.push(`${x+bw/2},${Tp+(H-B-Tp)*(1-cum/tot)}`);});
  const y80=Tp+(H-B-Tp)*.2;
  $('#pareto').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pareto kategori"><line x1="${L}" x2="${W-Rr}" y1="${H-B}" y2="${H-B}" stroke="#D5DCD5"/><line x1="${L}" x2="${W-Rr}" y1="${y80}" y2="${y80}" stroke="#A3202C" stroke-dasharray="4 4"/><text x="${W-Rr+4}" y="${y80+4}" style="fill:#A3202C">80%</text>${bars}<polyline points="${pts.join(' ')}" fill="none" stroke="#0F1D38" stroke-width="1.6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"><animate attributeName="stroke-dashoffset" from="1" to="0" dur="1s" fill="freeze"/></polyline></svg>`;
}
const board=$('#board');
board.addEventListener('dragstart',e=>{const c=e.target.closest('.icard');if(!c)return;state.dragging=true;c.classList.add('dragging');e.dataTransfer.setData('text/plain',c.dataset.iid);e.dataTransfer.effectAllowed='move';});
board.addEventListener('dragend',e=>{state.dragging=false;$$('.icard.dragging').forEach(c=>c.classList.remove('dragging'));$$('.col.over').forEach(c=>c.classList.remove('over'));});
board.addEventListener('dragover',e=>{const col=e.target.closest('.col');if(!col)return;e.preventDefault();$$('.col.over').forEach(c=>c!==col&&c.classList.remove('over'));col.classList.add('over');});
board.addEventListener('drop',e=>{const col=e.target.closest('.col');if(!col)return;e.preventDefault();state.dragging=false;moveIssue(I.find(i=>i.id===e.dataTransfer.getData('text/plain')),+col.dataset.si);});
board.addEventListener('click',e=>{const c=e.target.closest('.icard');if(c)openIssue(I.find(i=>i.id===c.dataset.iid));});
function moveIssue(it,si){
  if(!it||it.si===si){renderIssues(true);return;}
  if(it.auth===2&&si>=6&&it.si<4){toast('Isu di luar kewenangan perlu diteruskan ke instansi lebih dulu');renderIssues(true);return;}
  if(si>=3)it.monitored=true;if(si>=6&&it.si<6)it.feedback=it.feedback||si===7;
  const from=ST[it.si][2];it.si=si;it.fresh=false;
  emit('monitor',{s:me,r:it.region,text:`Anda memindahkan ${it.id} dari ${from} ke ${ST[si][2]}`});if(it.owner&&it.owner!==me)addEdge(me,it.owner,'tim',.3);
  toast(`${it.id} → ${ST[si][2]}`);renderIssues(true);
}
$('#isScope').onclick=e=>{const b=e.target.closest('button');if(!b)return;state.isScope=b.dataset.v;state.isRegion=null;renderIssues(true);};
['#isProv','#isCat','#isAuth'].forEach(id=>$(id).onchange=()=>renderIssues(true));
$('#newIssueBtn').onclick=()=>openNewIssue({fromMe:true});

/* ================================================================
   PLACEMENT
   ================================================================ */
const WLBL2=WLBL;
function renderWeights(){
  $('#weights').innerHTML=Object.keys(WLBL2).map(k=>`<div class="wrow"><label for="w_${k}">${WLBL2[k]}</label><span class="num" id="wv_${k}">${state.weights[k]}</span><input type="range" id="w_${k}" min="0" max="60" value="${state.weights[k]}"></div>`).join('');
  Object.keys(WLBL2).forEach(k=>$('#w_'+k).oninput=e=>{state.weights[k]=+e.target.value;$('#wv_'+k).textContent=e.target.value;state.ahpApplied=false;$('#ahpNote').textContent='Bobot diubah manual.';});
  const kes=S.filter(s=>s.priority==='kes').length,kh=S.filter(s=>s.priority==='khusus').length;
  $('#polRules').innerHTML=`<div class="row" style="align-items:flex-start;flex-wrap:nowrap"><span class="pill crit">Aturan 1</span><span><b>${PRIO.kes}</b>: ${kes} Serdik berlatar kesehatan ke 20 wilayah kebutuhan kesehatan tertinggi, maksimal satu per wilayah.</span></div>
  <div class="row" style="align-items:flex-start;flex-wrap:nowrap"><span class="pill warn">Aturan 2</span><span><b>${PRIO.khusus}</b>: ${kh} Serdik yang bersedia ke ${R.filter(r=>r.remote).length} wilayah akses sulit.</span></div>
  <p class="muted small">Kesiapan komunikasi dan data sensitif tidak dipakai sebagai skor merit.</p>`;
}
function renderPlacement(){
  const placed=S.filter(s=>s.region),lm=placed.filter(s=>s.langs[s.region.lang]>=3).length,pm=prioMatchCount(),empty=R.reduce((a,r)=>a+(r.quota-r.team.length),0);
  const avg=placed.reduce((a,s)=>a+s.fit,0)/Math.max(1,placed.length);
  const k=[['comp',R.filter(r=>r.complete).length,'/119','tim saling melengkapi'],['lang',pct(lm,placed.length),'%','bahasa daerah ≥ percakapan'],['prio',pm.ok,'/'+pm.total,`prioritas di wilayah mandat${state.offStat?` (tanpa lapis 1: ${state.offStat.ok})`:''}`],['fit',Math.round(avg*10)/10,'','rerata skor kecocokan'],['empty',empty,'','slot kosong'],['buddy',S.filter(s=>s.region&&s.buddy).length,'','dipasangkan buddy']];
  const box=$('#plKpis');if(!box.children.length)box.innerHTML=k.map(x=>`<div class="kpi" id="pk_${x[0]}"><b>0</b><span></span></div>`).join('');
  k.forEach(([id,v,suf,lab])=>{const el=$('#pk_'+id);setNum(el.querySelector('b'),v,suf);el.querySelector('span').textContent=lab;});
  const cc=r=>r.team.length===0?'#A3202C':r.complete?(r.covN===4?'#2E7A52':'#13274A'):(r.missing.length>1?'#A3202C':'#C9932F');
  $('#matrix').innerHTML=PROV.map(p=>`<div class="grid" style="gap:4px"><span class="lbl">${p}</span><div class="mx-cells">${R.filter(r=>r.prov===p).map((r,i)=>`<button data-rid="${r.id}" title="${esc(r.name)} · ${r.covN}/4${r.missing.length?' · kurang '+r.missing.join(', '):''}" style="background:${cc(r)};animation:pop .4s ${i*12}ms both">${r.covN}</button>`).join('')}</div></div>`).join('');
}
$('#matrix').onclick=e=>{const b=e.target.closest('[data-rid]');if(!b)return;const r=R[+b.dataset.rid];state.sel=r;flyTo(r);toast(`${r.name}: ${r.team.map(s=>s.name.split(' ')[0]+' ('+s.dom+')').join(', ')}`);};
$('#polOn').onchange=e=>state.policyOn=e.target.checked;
$('#scAbsent').onchange=e=>state.absent=e.target.checked;
$('#scSurge').onchange=e=>state.surge=e.target.checked;
$('#scLang').onchange=e=>state.langReq=e.target.checked;
$('#runPl').onclick=runPlacementAnimated;
function runPlacementAnimated(){
  if(state.absent&&me&&ABSENT_IDS.includes(me.idx))ABSENT_IDS[ABSENT_IDS.indexOf(me.idx)]=(me.idx+7)%384;
  const old=new Map(S.map(s=>[s,{x:s.cx,z:s.cz,r:s.region,st:s.st}]));
  deriveRegions();runPlacement();
  let moved=0;
  S.forEach(s=>{const o=old.get(s);if(!s.region){s.st='off';return;}if(o.r!==s.region)moved++;
    s.tw={fx:o.x??s.px,fz:o.z??s.pz,t:0};s.purpose=null;s.st=o.st==='off'||!o.st?'off':'duty';s.act=s.st==='off'?'Belum check-in':'Siaga di posko desa';});
  sim.myVer++;sim.alertVer++;if(me)$('#meSub').textContent=`${me.id} · ${me.region.name}${me.coord?' · Koordinator':''}`;
  renderPlacement();updateColumns();if(NET)rebuildNodes();buildMinimap();
  toast(`Penempatan selesai · ${moved} Serdik berpindah · ${R.filter(r=>r.complete).length}/119 tim saling melengkapi`);
}
function moveAll(mv,dt){
  for(const s of S){
    if(!s.region)continue;
    if(s.tw){s.tw.t=Math.min(1,s.tw.t+dt/1.9);const e=s.tw.t<.5?2*s.tw.t*s.tw.t:1-Math.pow(-2*s.tw.t+2,2)/2;
      s.cx=s.tw.fx+(s.px-s.tw.fx)*e;s.cz=s.tw.fz+(s.pz-s.tw.fz)*e;s.ty=Math.sin(Math.PI*s.tw.t)*(2+hsh(s.idx)*2);if(s.tw.t>=1){s.tw=null;s.ty=0;}continue;}
    if(s.st==='travel'&&mv>0){const step=.07*mv,dx=s.dx-s.cx,dz=s.dz-s.cz,d=Math.hypot(dx,dz);
      if(d<=step){s.cx=s.dx;s.cz=s.dz;arrive(s);}else{s.cx+=dx/d*step;s.cz+=dz/d*step;}}
  }
}

/* ================================================================
   LAB ANALITIK & SPK
   ================================================================ */
const TOOLS=[['ahp','AHP','AHP Calculator','Bobot kriteria penempatan'],['smart','SM','SMART Calculator','Pilih intervensi wilayah saya'],['topsis','TP','TOPSIS Calculator','Peringkat prioritas 119 wilayah'],['tree','DT','Decision Tree Calculator','Eskalasi atau menunggu?'],['queue','QL','Queue Line Simulator','Antrean verifikasi aspirasi'],['forecast','FC','Forecast Calculator','Proyeksi aspirasi harian'],['words','WN','Word Network','Jaringan topik aspirasi warga']];
const lab={tool:'ahp'};
const LABFN={ahp:labAHP,smart:labSMART,topsis:labTOPSIS,tree:labTree,queue:labQueue,forecast:labForecast,words:labWords};
function renderLab(){
  $('#toolnav').innerHTML=TOOLS.map(t=>`<button data-tool="${t[0]}" aria-pressed="${lab.tool===t[0]}"><span class="ico">${t[1]}</span><span><b>${t[2]}</b><span>${t[3]}</span></span></button>`).join('');
  const body=$('#toolBody');body.style.animation='none';void body.offsetWidth;body.style.animation='fadeUp .35s both';
  LABFN[lab.tool]();
}
$('#toolnav').onclick=e=>{const b=e.target.closest('[data-tool]');if(!b)return;lab.tool=b.dataset.tool;renderLab();};
function labTick(){if(lab.tool==='topsis')topsisUpdate();if(lab.tool==='queue')queueMetrics();if(lab.tool==='forecast')fcToday();}
const card=(title,sub,inner)=>`<div class="card grid"><div><h3>${title}</h3>${sub?`<p class="muted small">${sub}</p>`:''}</div>${inner}</div>`;

/* AHP */
function ahpInit(){const K=Object.keys(WLBL),w=state.weights,v={};for(let i=0;i<K.length;i++)for(let j=i+1;j<K.length;j++){const r=(w[K[i]]||1)/(w[K[j]]||1);v[i+'_'+j]=r>=1?Math.min(8,Math.round(r)-1):-Math.min(8,Math.round(1/r)-1);}lab.ahp={v};}
function ahpCompute(){const K=Object.keys(WLBL),n=K.length,A=K.map(()=>K.map(()=>1));
  for(const key in lab.ahp.v){const[i,j]=key.split('_').map(Number),v=lab.ahp.v[key];A[i][j]=v>=0?v+1:1/(1-v);A[j][i]=1/A[i][j];}
  let w=Array(n).fill(1/n);for(let t=0;t<80;t++){const nw=A.map(r=>r.reduce((s,a,j)=>s+a*w[j],0));const sm=nw.reduce((a,b)=>a+b);w=nw.map(x=>x/sm);}
  const Aw=A.map(r=>r.reduce((s,a,j)=>s+a*w[j],0)),lam=Aw.reduce((s,x,i)=>s+x/w[i],0)/n,CI=(lam-n)/(n-1);return{K,A,w,lam,CI,CR:CI/1.24};}
const saaty=(v,a,b)=>v===0?'sama penting':v>0?`${a} ${v+1}× lebih penting`:`${b} ${1-v}× lebih penting`;
function labAHP(){
  if(!lab.ahp)ahpInit();const K=Object.keys(WLBL);
  let pairs='';for(let i=0;i<K.length;i++)for(let j=i+1;j<K.length;j++){const key=i+'_'+j,v=lab.ahp.v[key];
    pairs+=`<div class="pair"><span>${WSHORT[K[i]]}</span><div><input type="range" min="-8" max="8" step="1" value="${-v}" data-pair="${key}" aria-label="${WSHORT[K[i]]} dibanding ${WSHORT[K[j]]}"><output id="po_${key}">${saaty(v,WSHORT[K[i]],WSHORT[K[j]])}</output></div><span>${WSHORT[K[j]]}</span></div>`;}
  $('#toolBody').innerHTML=`<div class="wizard"><span class="on">1 · Bandingkan berpasangan</span><span>2 · Cek konsistensi</span><span>3 · Terapkan ke Lapis 2</span></div>
   <div class="split">${card('Perbandingan berpasangan (skala Saaty 1–9)','Geser ke arah kriteria yang lebih penting untuk penempatan Serdik.',`<div>${pairs}</div>`)}
   <div class="card grid" id="ahpRes"></div></div>`;
  $('#toolBody').querySelectorAll('[data-pair]').forEach(inp=>inp.oninput=()=>{const key=inp.dataset.pair,[i,j]=key.split('_').map(Number);lab.ahp.v[key]=-(+inp.value);$('#po_'+key).textContent=saaty(lab.ahp.v[key],WSHORT[K[i]],WSHORT[K[j]]);ahpResults();});
  ahpResults();
}
function ahpResults(){
  const r=ahpCompute(),ok=r.CR<=.1;
  $('#ahpRes').innerHTML=`<div class="row between"><h3>Bobot prioritas</h3><span class="pill ${ok?'ok':'crit'}">CR ${r.CR.toFixed(3)} · ${ok?'konsisten':'perlu ditinjau'}</span></div>
   <div class="bars">${r.K.map((k,i)=>`<div class="barrow"><span>${WSHORT[k]}</span><div class="track"><i data-w="${Math.round(r.w[i]*100/Math.max(...r.w))}"></i></div><span class="num">${(r.w[i]*100).toFixed(1)}%</span></div>`).join('')}</div>
   <div class="gauge"><div><b class="num">${r.lam.toFixed(3)}</b><span>λ maks</span></div><div><b class="num">${r.CI.toFixed(3)}</b><span>CI</span></div><div><b class="num">1.24</b><span>RI (n=6)</span></div></div>
   <div class="svgbox"><table><thead><tr><th></th>${r.K.map(k=>`<th>${WSHORT[k].slice(0,5)}</th>`).join('')}</tr></thead><tbody>${r.A.map((row,i)=>`<tr><td><b>${WSHORT[r.K[i]].slice(0,5)}</b></td>${row.map(a=>`<td class="num">${a>=1?a.toFixed(0):'1/'+Math.round(1/a)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
   <p class="note">${ok?'Matriks konsisten (CR ≤ 0,10). Bobot siap dipakai untuk Lapis 2.':'Perbandingan saling bertentangan. Tinjau pasangan yang ekstrem sebelum diterapkan.'}</p>
   <div class="row"><button class="btn primary" id="ahpApply"${ok?'':' disabled'}>Terapkan ke Lapis 2 &amp; jalankan penempatan</button><button class="btn" id="ahpReset">Atur ulang</button></div>`;
  animateBars($('#ahpRes'));
  $('#ahpApply').onclick=()=>{r.K.forEach((k,i)=>state.weights[k]=Math.round(r.w[i]*100));renderWeights();$('#ahpNote').textContent=`Bobot dari AHP Calculator (CR ${r.CR.toFixed(3)}).`;location.hash='penempatan';setTimeout(runPlacementAnimated,500);};
  $('#ahpReset').onclick=()=>{ahpInit();labAHP();};
}

/* SMART */
const INTERV={'Pendidikan':'Kelas belajar sore & pendampingan literasi','Kesehatan':'Penguatan kader posyandu','Ekonomi & UMKM':'Klinik legalitas & pemasaran UMKM','Ketenagakerjaan':'Bursa informasi kerja desa','Infrastruktur':'Advokasi perbaikan jalan ke Dinas PUPR','Lingkungan hidup':'Bank sampah warga','Pelayanan publik':'Pojok layanan adminduk keliling','Sosial & kesejahteraan':'Pendataan & pendampingan lansia','Pertanian & pangan':'Sekolah lapang pengendalian hama','Teknologi & digitalisasi':'Pelatihan literasi digital perangkat desa','Lainnya':'Forum aspirasi pemuda'};
const SCRIT=['Warga terdampak','Urgensi masalah','Kesesuaian kompetensi tim','Kemudahan pelaksanaan','Keberlanjutan'];
const CRITHEX=['#13274A','#A3202C','#3B6FB6','#C59A4A','#6A4C93'];
function smartInit(){
  const r=me.region,cnt={};I.filter(i=>i.region===r).forEach(i=>cnt[i.cat]=(cnt[i.cat]||0)+1);
  const cats=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,4).map(e=>e[0]);CATS.forEach(c=>{if(cats.length<4&&!cats.includes(c))cats.push(c);});
  const alts=cats.map(c=>({name:INTERV[c],cat:c}));
  const sc=alts.map(a=>{const is=I.filter(i=>i.region===r&&i.cat===a.cat),aff=is.reduce((s,i)=>s+i.aff,0),urg=is.length?is.reduce((s,i)=>s+i.urg,0)/is.length:2.5;
    return[Math.round(clamp(Math.log10(aff+10)/3.6*100)),Math.round(urg/5*100),r.cov[CAT_CL[a.cat]],Math.round(is.length?is.filter(i=>i.auth===0).length/is.length*55+35:50),40+Math.round(hsh(a.name.length*3+r.id)*45)];});
  lab.smart={step:0,alts,w:[30,25,20,15,10],sc,sensK:0,sensV:1};
}
function smartUtil(){const m=lab.smart,w=m.w.map((x,i)=>x*(i===m.sensK?m.sensV:1)),ws=w.reduce((a,b)=>a+b)||1;
  return m.alts.map((a,i)=>({a,i,parts:m.sc[i].map((v,k)=>v*w[k]/ws),u:m.sc[i].reduce((s,v,k)=>s+v*w[k]/ws,0)})).sort((x,y)=>y.u-x.u);}
function labSMART(){
  if(!lab.smart||lab.smart.region!==me.region){smartInit();lab.smart.region=me.region;}
  const m=lab.smart,steps=['Alternatif','Kriteria & bobot','Penilaian','Hasil & sensitivitas'];
  let body='';
  if(m.step===0)body=card('Langkah 1 · Alternatif intervensi',`Diambil dari kategori aspirasi terbanyak di ${esc(me.region.name)}. Ubah nama atau tambah alternatif.`,
    `<div class="grid" style="gap:8px">${m.alts.map((a,i)=>`<div class="row" style="flex-wrap:nowrap"><span class="ch ${CAT_CL[a.cat]}">${esc(a.cat)}</span><input type="text" value="${esc(a.name)}" data-alt="${i}" style="flex:1" aria-label="Nama alternatif ${i+1}">${m.alts.length>2?`<button class="btn sm" data-rm="${i}" aria-label="Hapus">×</button>`:''}</div>`).join('')}</div>${m.alts.length<6?'<button class="btn sm" id="smAdd">Tambah alternatif</button>':''}`);
  if(m.step===1)body=card('Langkah 2 · Bobot kriteria (swing weighting)','Beri 100 pada kriteria terpenting, lalu nilai kriteria lain relatif terhadapnya. Bobot dinormalisasi otomatis.',
    `<div class="grid">${SCRIT.map((c,k)=>`<div class="wrow"><label for="sw_${k}"><span class="sdot" style="background:${CRITHEX[k]}"></span> ${c}</label><span class="num" id="swv_${k}">${Math.round(m.w[k]/m.w.reduce((a,b)=>a+b)*100)}%</span><input type="range" id="sw_${k}" min="0" max="100" value="${m.w[k]}" data-w="${k}"></div>`).join('')}</div>`);
  if(m.step===2)body=card('Langkah 3 · Nilai tiap alternatif (0–100)','Nilai awal dihitung dari data wilayah: jumlah warga terdampak, urgensi, skor kluster tim, dan proporsi isu yang bisa ditangani langsung.',
    `<div class="grid" style="gap:14px">${m.alts.map((a,i)=>`<div class="grid" style="gap:6px"><b class="small">${esc(a.name)}</b>${SCRIT.map((c,k)=>`<div class="barrow"><span>${c}</span><input type="range" min="0" max="100" value="${m.sc[i][k]}" data-sc="${i}_${k}" aria-label="${esc(a.name)} – ${c}"><span class="num" id="scv_${i}_${k}">${m.sc[i][k]}</span></div>`).join('')}</div>`).join('')}</div>`);
  if(m.step===3)body=`<div class="split">${card('Langkah 4 · Peringkat utilitas','Utilitas = Σ (bobot × nilai). Batang berwarna menunjukkan kontribusi tiap kriteria.','<div class="rank" id="smRank"></div>')}
    ${card('Analisis sensitivitas','Ubah pengali bobot satu kriteria dan lihat apakah peringkat bergeser.',`<label class="field">Kriteria<select id="smSensK">${SCRIT.map((c,k)=>`<option value="${k}"${k===m.sensK?' selected':''}>${c}</option>`).join('')}</select></label>
     <div class="wrow"><label for="smSensV">Pengali bobot</label><span class="num" id="smSensO">${m.sensV.toFixed(1)}×</span><input type="range" id="smSensV" min="0" max="3" step=".1" value="${m.sensV}"></div><p class="note" id="smInsight"></p>
     <button class="btn" id="smTask">Jadikan rencana tim &amp; kirim ke chat</button>`)}</div>`;
  $('#toolBody').innerHTML=`<div class="wizard">${steps.map((s,i)=>`<span class="${i===m.step?'on':i<m.step?'done':''}">${i+1} · ${s}</span>`).join('')}</div>${body}
   <div class="row between"><button class="btn" id="smPrev"${m.step?'':' disabled'}>Kembali</button><button class="btn primary" id="smNext"${m.step===3?' hidden':''}>Lanjut</button></div>`;
  const tb=$('#toolBody');
  tb.querySelectorAll('[data-alt]').forEach(i=>i.oninput=()=>m.alts[+i.dataset.alt].name=i.value);
  tb.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rm;m.alts.splice(i,1);m.sc.splice(i,1);labSMART();});
  const add=$('#smAdd');if(add)add.onclick=()=>{m.alts.push({name:'Intervensi baru',cat:'Lainnya'});m.sc.push([50,50,50,50,50]);labSMART();};
  tb.querySelectorAll('[data-w]').forEach(i=>i.oninput=()=>{m.w[+i.dataset.w]=+i.value;const s=m.w.reduce((a,b)=>a+b)||1;m.w.forEach((w,k)=>$('#swv_'+k).textContent=Math.round(w/s*100)+'%');});
  tb.querySelectorAll('[data-sc]').forEach(i=>i.oninput=()=>{const[a,k]=i.dataset.sc.split('_').map(Number);m.sc[a][k]=+i.value;$('#scv_'+i.dataset.sc).textContent=i.value;});
  $('#smPrev').onclick=()=>{m.step--;labSMART();};$('#smNext').onclick=()=>{m.step++;labSMART();};
  if(m.step===3){smartRank(true);$('#smSensK').onchange=e=>{m.sensK=+e.target.value;smartRank();};$('#smSensV').oninput=e=>{m.sensV=+e.target.value;$('#smSensO').textContent=m.sensV.toFixed(1)+'×';smartRank();};
    $('#smTask').onclick=()=>{const top=smartUtil()[0];pushChat(me,`Usul rencana tim dari SMART Calculator: prioritas “${top.a.name}” (utilitas ${top.u.toFixed(1)}). Mohon masukan.`);sim.pendingReplies.push({at:abs()+3,from:me.region.team.find(t=>t!==me)||me,text:'Setuju, datanya masuk akal. Saya siapkan daftar warga sasaran.'});toast('Rencana terkirim ke chat tim');};}
}
function smartRank(first){
  const res=smartUtil(),box=$('#smRank');const H=58;box.style.height=(res.length*H)+'px';
  if(first||box.children.length!==res.length)box.innerHTML=lab.smart.alts.map((a,i)=>`<div class="rr" id="smr${i}"><span class="num" style="font-weight:700"></span><div style="min-width:0"><div class="small" style="font-weight:600">${esc(a.name)}</div><div class="stack" style="height:12px;margin-top:4px"></div></div><b class="num"></b></div>`).join('');
  res.forEach((r,rank)=>{const el=$('#smr'+r.i);el.style.transform=`translateY(${rank*H}px)`;el.children[0].textContent='#'+(rank+1);el.children[2].textContent=r.u.toFixed(1);
    el.querySelector('.stack').innerHTML=r.parts.map((p,k)=>`<i style="width:${p}%;background:${CRITHEX[k]}"></i>`).join('');});
  const base=(()=>{const m=lab.smart,v=m.sensV;m.sensV=1;const b=smartUtil()[0].a.name;m.sensV=v;return b;})();
  const ins=$('#smInsight');if(ins)ins.textContent=res[0].a.name===base?`Peringkat teratas stabil: “${res[0].a.name}” tetap unggul pada pengali ini.`:`Peringkat berubah: pada pengali ${lab.smart.sensV.toFixed(1)}× kriteria “${SCRIT[lab.smart.sensK]}”, alternatif teratas menjadi “${res[0].a.name}”.`;
}

/* TOPSIS */
const TCRIT=['Isu aktif','Rata-rata prioritas','Warga terdampak','Kesenjangan tim','Kesulitan akses'];
function topsisCompute(){
  const w=lab.topsis.w,ws=w.reduce((a,b)=>a+b)||1;
  const X=R.map(r=>{const a=I.filter(i=>i.region===r&&active(i));return[a.length,a.length?a.reduce((s,i)=>s+i.pr,0)/a.length:0,Math.log10(a.reduce((s,i)=>s+i.aff,0)+1),r.missing.length+(r.quota-r.team.length)+.01,6-r.access];});
  const norm=TCRIT.map((_,j)=>Math.sqrt(X.reduce((s,x)=>s+x[j]*x[j],0))||1);
  const V=X.map(x=>x.map((v,j)=>v/norm[j]*w[j]/ws));
  const best=TCRIT.map((_,j)=>Math.max(...V.map(v=>v[j]))),worst=TCRIT.map((_,j)=>Math.min(...V.map(v=>v[j])));
  return R.map((r,i)=>{const dp=Math.sqrt(V[i].reduce((s,v,j)=>s+(v-best[j])**2,0)),dm=Math.sqrt(V[i].reduce((s,v,j)=>s+(v-worst[j])**2,0));return{r,c:dm/(dp+dm||1),x:X[i]};}).sort((a,b)=>b.c-a.c);
}
function labTOPSIS(){
  lab.topsis=lab.topsis||{w:[30,25,15,20,10]};
  $('#toolBody').innerHTML=`<div class="split">${card('Bobot kriteria','Semua kriteria bersifat benefit: makin tinggi makin perlu diprioritaskan. Data diperbarui langsung dari operasi.',`<div class="grid">${TCRIT.map((c,k)=>`<div class="wrow"><label for="tw_${k}">${c}</label><span class="num" id="twv_${k}">${lab.topsis.w[k]}</span><input type="range" id="tw_${k}" min="0" max="60" value="${lab.topsis.w[k]}" data-tw="${k}"></div>`).join('')}</div><p class="note" id="tpNote"></p>`)}
   ${card('15 wilayah prioritas teratas (closeness C*)','Klik baris untuk membuka wilayah di Pusat Operasi.','<div class="rank" id="tpRank" style="height:510px;overflow:hidden"></div>')}</div>`;
  $('#tpRank').innerHTML=R.map(r=>`<div class="rr" id="tpr${r.id}" data-rid="${r.id}" style="cursor:pointer;opacity:0"><span class="num muted"></span><div style="min-width:0"><div class="small" style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.name)}</div><div class="track" style="height:6px;margin-top:3px"><i></i></div></div><b class="num small"></b></div>`).join('');
  $('#toolBody').querySelectorAll('[data-tw]').forEach(i=>i.oninput=()=>{lab.topsis.w[+i.dataset.tw]=+i.value;$('#twv_'+i.dataset.tw).textContent=i.value;topsisUpdate();});
  $('#tpRank').onclick=e=>{const b=e.target.closest('[data-rid]');if(!b)return;location.hash='operasi';setTimeout(()=>selectRegion(R[+b.dataset.rid],true),200);};
  topsisUpdate();
}
function topsisUpdate(){
  const box=$('#tpRank');if(!box)return;const res=topsisCompute(),H=34;
  res.forEach((x,i)=>{const el=$('#tpr'+x.r.id);el.style.transform=`translateY(${i*H}px)`;el.style.opacity=i<15?1:0;el.style.pointerEvents=i<15?'auto':'none';el.children[0].textContent=i+1;el.querySelector('i').style.width=Math.round(x.c*100)+'%';el.children[2].textContent=x.c.toFixed(3);});
  const t=res[0];$('#tpNote').textContent=`Teratas: ${t.r.name} (C* ${t.c.toFixed(3)}) dengan ${t.x[0]} isu aktif dan ${t.r.missing.length} kluster tim kurang.`;
}

/* Decision tree */
function labTree(){
  const it=I.find(i=>i.owner===me&&(i.si===4||i.si===5))||I.find(i=>i.region===me.region&&i.auth===2)||I[0];
  lab.tree=lab.tree||{it,opts:[{n:'Eskalasi ke Posko sekarang',p:.7,s:80,f:35,c:8},{n:'Tunggu respons instansi 7 hari',p:.45,s:85,f:20,c:0},{n:'Kolaborasi Serdik lintas wilayah',p:.6,s:75,f:45,c:5}]};
  const T2=lab.tree;
  $('#toolBody').innerHTML=`<div class="card grid"><div class="row between"><div><h3>Kasus: ${esc(T2.it.id)} · ${esc(T2.it.title)}</h3><p class="muted small">${esc(T2.it.region.name)} · ${AUTH[T2.it.auth]} · rujukan ke ${INST[T2.it.cat]}. Skor manfaat warga 0–100; biaya = beban sumber daya tim.</p></div><button class="btn sm" id="dtPick">Ganti kasus</button></div>
   <div class="tbl-wrap"><table><thead><tr><th>Opsi keputusan</th><th>P(berhasil)</th><th>Manfaat jika berhasil</th><th>Manfaat jika gagal</th><th>Biaya</th><th>Nilai harapan</th></tr></thead><tbody>${T2.opts.map((o,i)=>`<tr><td>${esc(o.n)}</td><td><input class="dt-input" type="number" min="0" max="1" step=".05" value="${o.p}" data-dt="${i}_p"></td><td><input class="dt-input" type="number" min="0" max="100" value="${o.s}" data-dt="${i}_s"></td><td><input class="dt-input" type="number" min="0" max="100" value="${o.f}" data-dt="${i}_f"></td><td><input class="dt-input" type="number" min="0" max="50" value="${o.c}" data-dt="${i}_c"></td><td class="num" id="ev_${i}"></td></tr>`).join('')}</tbody></table></div>
   <div class="svgbox" id="treeSvg"></div><p class="note" id="dtNote"></p></div>`;
  $('#toolBody').querySelectorAll('[data-dt]').forEach(i=>i.oninput=()=>{const[k,f]=i.dataset.dt.split('_');let v=+i.value;if(f==='p')v=Math.max(0,Math.min(1,v));T2.opts[+k][f]=v;drawTree();});
  $('#dtPick').onclick=()=>{const c=I.filter(i=>i.auth>=1&&i.si>=3&&i.si<6);T2.it=pick(c.length?c:I);labTree();};
  drawTree(true);
}
function drawTree(first){
  const T2=lab.tree,ev=T2.opts.map(o=>o.p*o.s+(1-o.p)*o.f-o.c),best=ev.indexOf(Math.max(...ev));
  T2.opts.forEach((o,i)=>{const el=$('#ev_'+i);el.innerHTML=`<b style="color:${i===best?'#13274A':'inherit'}">${ev[i].toFixed(1)}</b>`;});
  const W=760,H=380,ys=[70,190,310];let s=`<rect x="20" y="${H/2-16}" width="32" height="32" fill="#0F1D38" rx="3"/><text x="36" y="${H/2+46}" text-anchor="middle">Keputusan</text>`;
  T2.opts.forEach((o,i)=>{const y=ys[i],b=i===best,col=b?'#13274A':'#CDBF9F',w=b?3:1.5;
    s+=`<path d="M52 ${H/2} C 140 ${H/2}, 160 ${y}, 260 ${y}" fill="none" stroke="${col}" stroke-width="${w}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${first?1:0}">${first?`<animate attributeName="stroke-dashoffset" from="1" to="0" dur=".7s" begin="${i*.15}s" fill="freeze"/>`:''}</path>
    <text x="150" y="${y-(i===1?10:12)+(i===0?-8:i===2?20:0)}" style="fill:#0F1D38;font-weight:${b?700:400}">${esc(o.n)}</text><text x="150" y="${y+8+(i===0?-8:i===2?20:0)}">biaya −${o.c}</text>
    <circle cx="276" cy="${y}" r="16" fill="${b?'#13274A':'#FFFFFF'}" stroke="${col}" stroke-width="2"/><text x="276" y="${y+40}" text-anchor="middle" style="fill:#0F1D38;font-weight:700">EV ${ev[i].toFixed(1)}</text>
    <path d="M292 ${y} L 480 ${y-34}" stroke="${col}" stroke-width="${w}"/><path d="M292 ${y} L 480 ${y+34}" stroke="${col}" stroke-width="${w*.8}" stroke-dasharray="${b?'':'4 3'}"/>
    <text x="370" y="${y-26}">p = ${o.p.toFixed(2)}</text><text x="370" y="${y+44}">1 − p = ${(1-o.p).toFixed(2)}</text>
    <polygon points="480,${y-44} 500,${y-34} 480,${y-24}" fill="#2E7A52"/><text x="508" y="${y-30}" style="fill:#0F1D38">Berhasil · manfaat ${o.s}</text>
    <polygon points="480,${y+24} 500,${y+34} 480,${y+44}" fill="#A3202C"/><text x="508" y="${y+38}" style="fill:#0F1D38">Gagal · manfaat ${o.f}</text>`;});
  $('#treeSvg').innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="min-width:640px" role="img" aria-label="Pohon keputusan">${s}</svg>`;
  $('#dtNote').textContent=`Rekomendasi: “${T2.opts[best].n}” dengan nilai harapan ${ev[best].toFixed(1)}, selisih ${(ev[best]-[...ev].sort((a,b)=>b-a)[1]).toFixed(1)} poin dari opsi berikutnya. Keputusan akhir tetap mempertimbangkan konteks lapangan.`;
}

/* Queue */
function erlang(lam,mu,c){const a=lam/mu,rho=a/c;if(rho>=1)return{rho,unstable:true};let sum=0,f=1;for(let n=0;n<c;n++){if(n>0)f*=n;sum+=Math.pow(a,n)/f;}const fc=f*(c>0?c:1);
  const last=Math.pow(a,c)/(fc*(1-rho)),P0=1/(sum+last),Pw=last*P0,Lq=Pw*rho/(1-rho),Wq=Lq/lam;return{rho,Pw,Lq,Wq,W:Wq+1/mu,L:lam*(Wq+1/mu)};}
function queueLam(){const q=lab.queue;if(q.manual)return q.lamManual;const since=abs()-120;const n=I.filter(i=>i.region.prov===q.prov&&i.createdAbs>=since).length;return Math.round((Math.max(1,n/2)+(q.prov==='Jawa Timur'||q.prov==='Jawa Tengah'||q.prov==='Jawa Barat'?6:3))*2)/2;}
function labQueue(){
  lab.queue=lab.queue||{prov:me.region.prov,mu:5,c:2,target:30,manual:false,lamManual:8,cust:[],spawn:0,served:0};
  const q=lab.queue;
  $('#toolBody').innerHTML=`<div class="split">${card('Antrean verifikasi aspirasi di posko provinsi','Model M/M/c: aspirasi datang acak (λ), tiap verifikator memproses μ aspirasi per jam, c verifikator bertugas.',`
   <label class="field">Posko provinsi<select id="qProv">${PROV.map(p=>`<option${p===q.prov?' selected':''}>${p}</option>`).join('')}</select></label>
   <label class="tog"><input type="checkbox" id="qMan"${q.manual?' checked':''}> Atur λ manual (bawaan: dari aspirasi 2 jam terakhir)</label>
   <div class="wrow"><label for="qLam">λ kedatangan per jam</label><span class="num" id="qLamO"></span><input type="range" id="qLam" min="1" max="30" step=".5" value="${q.lamManual}"${q.manual?'':' disabled'}></div>
   <div class="wrow"><label for="qMu">μ per verifikator per jam</label><span class="num" id="qMuO">${q.mu}</span><input type="range" id="qMu" min="1" max="15" value="${q.mu}"></div>
   <div class="wrow"><label for="qC">c verifikator</label><span class="num" id="qCO">${q.c}</span><input type="range" id="qC" min="1" max="8" value="${q.c}"></div>
   <div class="wrow"><label for="qT">Target waktu tunggu (menit)</label><span class="num" id="qTO">${q.target}</span><input type="range" id="qT" min="5" max="120" step="5" value="${q.target}"></div>`)}
   <div class="card grid"><div class="kpis" id="qK" style="margin:0"></div><canvas id="queueCanvas"></canvas><div class="tbl-wrap"><table><thead><tr><th>c</th><th>Utilisasi ρ</th><th>P(menunggu)</th><th>Lq</th><th>Wq (menit)</th></tr></thead><tbody id="qTbl"></tbody></table></div><p class="note" id="qNote"></p></div></div>`;
  $('#qProv').onchange=e=>{q.prov=e.target.value;queueMetrics();};$('#qMan').onchange=e=>{q.manual=e.target.checked;$('#qLam').disabled=!q.manual;queueMetrics();};
  $('#qLam').oninput=e=>{q.lamManual=+e.target.value;queueMetrics();};$('#qMu').oninput=e=>{q.mu=+e.target.value;$('#qMuO').textContent=q.mu;queueMetrics();};
  $('#qC').oninput=e=>{q.c=+e.target.value;$('#qCO').textContent=q.c;q.cust.forEach(c=>{if(c.srv>=q.c){c.srv=-1;c.state='q';}});queueMetrics();};$('#qT').oninput=e=>{q.target=+e.target.value;$('#qTO').textContent=q.target;queueMetrics();};
  queueMetrics();
}
function queueMetrics(){
  const q=lab.queue;if(!$('#qK'))return;const lam=queueLam();q.lam=lam;$('#qLamO').textContent=lam.toFixed(1);
  const m=erlang(lam,q.mu,q.c);
  $('#qK').innerHTML=m.unstable?`<div class="kpi" style="grid-column:1/-1;border-color:var(--signal)"><b style="color:var(--signal)">ρ = ${m.rho.toFixed(2)}</b><span>Antrean tidak stabil: kedatangan melebihi kapasitas. Tambah verifikator.</span></div>`
    :[[`${(m.rho*100).toFixed(0)}%`,'utilisasi'],[m.Lq.toFixed(2),'rata-rata antrean (Lq)'],[(m.Wq*60).toFixed(1)+' mnt','waktu tunggu (Wq)'],[(m.Pw*100).toFixed(0)+'%','peluang harus menunggu']].map(([b,s])=>`<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  let rec=null;$('#qTbl').innerHTML=[1,2,3,4,5,6,7,8].map(c=>{const r=erlang(lam,q.mu,c);const ok=!r.unstable&&r.Wq*60<=q.target;if(ok&&rec===null)rec=c;
    return `<tr class="${c===q.c?'me':''}"><td class="num">${c}${ok&&rec===c?' <span class="pill ok">minimum</span>':''}</td><td class="num">${(r.rho*100).toFixed(0)}%</td><td class="num">${r.unstable?'—':(r.Pw*100).toFixed(0)+'%'}</td><td class="num">${r.unstable?'∞':r.Lq.toFixed(2)}</td><td class="num">${r.unstable?'∞':(r.Wq*60).toFixed(1)}</td></tr>`;}).join('');
  $('#qNote').textContent=rec?`Dengan λ ${lam.toFixed(1)}/jam di ${q.prov}, minimal ${rec} verifikator diperlukan agar waktu tunggu ≤ ${q.target} menit.`:`Target ${q.target} menit tidak tercapai dengan 8 verifikator. Naikkan μ (misalnya formulir lebih ringkas) atau tambah personel.`;
}
function queueAnim(dt){
  const q=lab.queue,cv=$('#queueCanvas');if(!q||!cv)return;const w=cv.clientWidth,h=cv.clientHeight,dpr=Math.min(2,devicePixelRatio||1);
  if(cv.width!==w*dpr){cv.width=w*dpr;cv.height=h*dpr;}const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
  const hourSec=6;q.spawn+=dt*(q.lam||5)/hourSec;while(q.spawn>=1){q.spawn-=1;if(q.cust.length<70)q.cust.push({x:-10,y:h/2,state:'q',srv:-1});}
  const sx=w-120,sy=i=>20+i*((h-40)/Math.max(1,q.c-1||1));const busy=new Set(q.cust.filter(c=>c.state==='s').map(c=>c.srv));
  for(let i=0;i<q.c;i++){g.fillStyle=busy.has(i)?'#E4E9F2':'#FFFFFF';g.strokeStyle='#13274A';g.lineWidth=1.5;g.beginPath();(g.roundRect?g.roundRect.bind(g):g.rect.bind(g))(sx,(q.c===1?h/2:sy(i))-13,64,26,6);g.fill();g.stroke();g.fillStyle='#0F1D38';g.font='11px IBM Plex Sans, sans-serif';g.fillText('Verifikator '+(i+1),sx+70,(q.c===1?h/2:sy(i))+4);}
  let qi=0;
  q.cust.forEach(c=>{
    if(c.state==='q'){const free=[...Array(q.c).keys()].find(i=>!busy.has(i));if(free!==undefined&&qi===0){c.state='s';c.srv=free;busy.add(free);c.t=-Math.log(1-Math.random())/q.mu*hourSec;}else{const tx=sx-30-qi*13;c.x+=(tx-c.x)*Math.min(1,dt*5);c.y+=(h/2-c.y)*Math.min(1,dt*5);qi++;}}
    if(c.state==='s'){const ty=q.c===1?h/2:sy(c.srv);c.x+=(sx+32-c.x)*Math.min(1,dt*6);c.y+=(ty-c.y)*Math.min(1,dt*6);c.t-=dt;if(c.t<=0){c.state='o';q.served++;}}
    if(c.state==='o'){c.x+=dt*160;}
    g.fillStyle=c.state==='s'?'#13274A':c.state==='o'?'#2E7A52':'#C59A4A';g.beginPath();g.arc(c.x,c.y,5,0,7);g.fill();});
  q.cust=q.cust.filter(c=>c.x<w+10);
  g.fillStyle='#5E6577';g.font='12px IBM Plex Sans, sans-serif';g.fillText(`Dalam antrean: ${qi} · Selesai diverifikasi: ${q.served} · 1 jam = ${hourSec} detik`,10,h-10);
}

/* Forecast */
function labForecast(){
  lab.fc=lab.fc||{n:3,a:.4};const f=lab.fc;
  $('#toolBody').innerHTML=`<div class="card grid"><div class="row between"><div><h3>Peramalan aspirasi harian</h3><p class="muted small">Data historis bertambah otomatis setiap kali hari simulasi berganti.</p></div><span class="pill info" id="fcToday"></span></div>
   <div class="split"><div class="wrow"><label for="fcN">Simple moving average · n hari</label><span class="num" id="fcNO">${f.n}</span><input type="range" id="fcN" min="2" max="7" value="${f.n}"></div>
   <div class="wrow"><label for="fcA">Exponential smoothing · α</label><span class="num" id="fcAO">${f.a.toFixed(2)}</span><input type="range" id="fcA" min=".05" max=".95" step=".05" value="${f.a}"></div></div>
   <div class="svgbox" id="fcChart"></div><div class="tbl-wrap"><table><thead><tr><th>Metode</th><th>MAD</th><th>MAPE</th><th>Ramalan 3 hari ke depan</th></tr></thead><tbody id="fcTbl"></tbody></table></div><p class="note" id="fcNote"></p></div>`;
  $('#fcN').oninput=e=>{f.n=+e.target.value;$('#fcNO').textContent=f.n;fcDraw();};$('#fcA').oninput=e=>{f.a=+e.target.value;$('#fcAO').textContent=f.a.toFixed(2);fcDraw();};
  fcDraw(true);fcToday();
}
function fcDraw(first){
  const y=sim.history,f=lab.fc,N=y.length;
  const sma=y.map((_,t)=>t>=f.n?y.slice(t-f.n,t).reduce((a,b)=>a+b)/f.n:null);let F=y[0];const ses=y.map((v,t)=>{if(t===0)return null;F=f.a*y[t-1]+(1-f.a)*F;return F;});
  const smaNext=y.slice(-f.n).reduce((a,b)=>a+b)/f.n,sesNext=f.a*y[N-1]+(1-f.a)*(ses[N-1]??y[N-1]);
  const err=arr=>{const e=arr.map((p,t)=>p==null?null:[Math.abs(y[t]-p),Math.abs(y[t]-p)/y[t]]).filter(Boolean);return[e.reduce((s,x)=>s+x[0],0)/e.length,e.reduce((s,x)=>s+x[1],0)/e.length*100];};
  const [m1,p1]=err(sma),[m2,p2]=err(ses);
  const W=760,H=300,L=44,Rr=16,Tp=16,B=34,tot=N+3,mx=Math.max(...y,smaNext,sesNext)*1.12,mn=Math.min(...y)*.8;
  const X=i=>L+(W-L-Rr)*i/(tot-1),Y=v=>Tp+(H-Tp-B)*(1-(v-mn)/(mx-mn));
  const path=(arr,off=0)=>arr.map((v,i)=>v==null?null:`${X(i+off).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean).join(' ');
  let s='';for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4;s+=`<line x1="${L}" x2="${W-Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#E8E0CE"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${Math.round(v)}</text>`;}
  y.forEach((_,i)=>{if(i%2===0)s+=`<text x="${X(i)}" y="${H-12}" text-anchor="middle">H${sim.day-N+i}</text>`;});
  s+=`<rect x="${X(N-.5)}" y="${Tp}" width="${X(tot-1)-X(N-.5)+8}" height="${H-Tp-B}" fill="#F1E9D7"/><text x="${X(N+1)}" y="${Tp+14}" text-anchor="middle">ramalan</text>`;
  const anim=first?' pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"':'';const an=first?'<animate attributeName="stroke-dashoffset" from="1" to="0" dur="1.1s" fill="freeze"/>':'';
  s+=`<polyline points="${path(y)}" fill="none" stroke="#0F1D38" stroke-width="2"${anim}>${an}</polyline>${y.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="3" fill="#0F1D38"><title>Hari ${sim.day-N+i}: ${v}</title></circle>`).join('')}`;
  s+=`<polyline points="${path(sma)}" fill="none" stroke="#C59A4A" stroke-width="2"${anim}>${an}</polyline><polyline points="${path(ses)}" fill="none" stroke="#3B6FB6" stroke-width="2"${anim}>${an}</polyline>`;
  s+=`<polyline points="${X(N-1)},${Y(y[N-1])} ${[0,1,2].map(k=>`${X(N+k)},${Y(smaNext)}`).join(' ')}" fill="none" stroke="#C59A4A" stroke-width="2" stroke-dasharray="5 4"/><polyline points="${X(N-1)},${Y(y[N-1])} ${[0,1,2].map(k=>`${X(N+k)},${Y(sesNext)}`).join(' ')}" fill="none" stroke="#3B6FB6" stroke-width="2" stroke-dasharray="5 4"/>`;
  s+=`<g transform="translate(${L+6},${Tp+4})"><rect width="9" height="9" fill="#0F1D38"/><text x="13" y="9">Aktual</text><rect x="70" width="9" height="9" fill="#C59A4A"/><text x="83" y="9">SMA(${f.n})</text><rect x="160" width="9" height="9" fill="#3B6FB6"/><text x="173" y="9">SES(α=${f.a.toFixed(2)})</text></g>`;
  $('#fcChart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="min-width:600px" role="img" aria-label="Grafik peramalan">${s}</svg>`;
  const bestSES=m2<m1;
  $('#fcTbl').innerHTML=`<tr class="${!bestSES?'me':''}"><td>SMA (n=${f.n})</td><td class="num">${m1.toFixed(1)}</td><td class="num">${p1.toFixed(1)}%</td><td class="num">${Math.round(smaNext)} / hari</td></tr><tr class="${bestSES?'me':''}"><td>SES (α=${f.a.toFixed(2)})</td><td class="num">${m2.toFixed(1)}</td><td class="num">${p2.toFixed(1)}%</td><td class="num">${Math.round(sesNext)} / hari</td></tr>`;
  $('#fcNote').textContent=`${bestSES?'SES':'SMA'} lebih akurat pada data ini (MAD lebih kecil). Gunakan ramalan ≈ ${Math.round(bestSES?sesNext:smaNext)} aspirasi/hari untuk merencanakan kapasitas verifikator di Queue Line Simulator.`;
}
function fcToday(){const el=$('#fcToday');if(!el)return;const fr=Math.max(.05,Math.min(1,(sim.min-440)/(1050-440)));el.textContent=`Hari ini: ${sim.today.aspirasi||0} aspirasi · proyeksi ≈ ${Math.round((sim.today.aspirasi||0)/fr)}`;}

/* Word network */
const STOPW=new Set('yang di ke dari dan untuk tidak dengan karena saat ada belum lebih dalam pada oleh atau sudah akan masih terlalu jauh lama tanpa sendiri atas bisa dapat ini itu tadi sesuai tidak memakan sampai desa warga'.split(' '));
function labWords(){
  lab.words=lab.words||{prov:'',cat:''};const wv=lab.words;
  $('#toolBody').innerHTML=`<div class="card grid"><div class="row between"><div><h3>Word Network aspirasi</h3><p class="muted small">Kata yang sering muncul bersama dalam judul aspirasi. Ukuran simpul = frekuensi, tebal garis = kemunculan bersama. Seret simpul untuk menata, klik kata untuk melihat aspirasinya.</p></div>
   <div class="row"><select id="wProv" aria-label="Provinsi"><option value="">Semua provinsi</option>${PROV.map(p=>`<option${p===wv.prov?' selected':''}>${p}</option>`).join('')}</select><select id="wCat" aria-label="Kategori"><option value="">Semua kategori</option>${CATS.map(c=>`<option${c===wv.cat?' selected':''}>${c}</option>`).join('')}</select></div></div>
   <svg id="topicSvg" role="img" aria-label="Jaringan kata"></svg><div id="wList"></div></div>`;
  $('#wProv').onchange=e=>{wv.prov=e.target.value;drawWords();};$('#wCat').onchange=e=>{wv.cat=e.target.value;drawWords();};
  drawWords();
}
function drawWords(){
  const wv=lab.words,svg=$('#topicSvg');if(!svg)return;
  const iss=I.filter(i=>(!wv.prov||i.region.prov===wv.prov)&&(!wv.cat||i.cat===wv.cat));
  const toks=iss.map(i=>[...new Set(i.title.toLowerCase().replace(/[^a-z\s-]/g,' ').split(/\s+/).filter(w=>w.length>=4&&!STOPW.has(w)))]);
  const fq={};toks.forEach(t=>t.forEach(w=>fq[w]=(fq[w]||0)+1));
  const top=Object.entries(fq).sort((a,b)=>b[1]-a[1]).slice(0,34).map(e=>e[0]),set=new Set(top);
  const co={};toks.forEach(t=>{const f=t.filter(w=>set.has(w));for(let i=0;i<f.length;i++)for(let j=i+1;j<f.length;j++){const k=[f[i],f[j]].sort().join('|');co[k]=(co[k]||0)+1;}});
  if(!window.d3){svg.outerHTML='<div class="empty">Pustaka graf tidak dapat dimuat.</div>';return;}
  const W=svg.clientWidth||700,H=420,mx=Math.max(...top.map(w=>fq[w]),1);
  const nodes=top.map(w=>({id:w,f:fq[w],cl:CAT_CL[(iss.find(i=>i.title.toLowerCase().includes(w))||{cat:'Lainnya'}).cat]})),links=Object.entries(co).filter(([,c])=>c>=2).map(([k,c])=>{const[a,b]=k.split('|');return{source:a,target:b,c};});
  const s=d3.select(svg).attr('viewBox',`0 0 ${W} ${H}`);s.selectAll('*').remove();
  const lk=s.append('g').selectAll('line').data(links).join('line').attr('stroke','#CDBF9F').attr('stroke-opacity',.7).attr('stroke-width',d=>Math.min(6,.6+d.c*.5));
  const nd=s.append('g').selectAll('g').data(nodes).join('g').style('cursor','pointer');
  nd.append('circle').attr('r',0).attr('fill',d=>CLHEX[d.cl]).attr('fill-opacity',.85).transition().duration(600).delay((d,i)=>i*20).attr('r',d=>6+Math.sqrt(d.f/mx)*20);
  nd.append('text').text(d=>d.id).attr('text-anchor','middle').attr('dy',d=>-(9+Math.sqrt(d.f/mx)*20)).attr('font-size',11).attr('font-weight',600).attr('fill','#0F1D38');
  const fs=d3.forceSimulation(nodes).force('link',d3.forceLink(links).id(d=>d.id).distance(70).strength(d=>Math.min(1,.1+d.c*.08))).force('charge',d3.forceManyBody().strength(-160)).force('center',d3.forceCenter(W/2,H/2)).force('collide',d3.forceCollide(d=>14+Math.sqrt(d.f/mx)*20))
    .on('tick',()=>{nodes.forEach(d=>{d.x=Math.max(30,Math.min(W-30,d.x));d.y=Math.max(30,Math.min(H-20,d.y));});lk.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);nd.attr('transform',d=>`translate(${d.x},${d.y})`);});
  nd.call(d3.drag().on('start',(e,d)=>{if(!e.active)fs.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y;}).on('drag',(e,d)=>{d.fx=e.x;d.fy=e.y;}).on('end',(e,d)=>{if(!e.active)fs.alphaTarget(0);d.fx=null;d.fy=null;}));
  nd.on('click',(e,d)=>{const m=iss.filter(i=>i.title.toLowerCase().includes(d.id)).sort((a,b)=>b.pr-a.pr);
    $('#wList').innerHTML=`<div class="row between"><b>“${esc(d.id)}” · ${m.length} aspirasi</b><span class="small muted">${[...new Set(m.map(i=>i.region.prov))].length} provinsi</span></div>${m.slice(0,8).map(i=>`<div class="fi" data-wi="${i.id}"><span class="pill ${i.pr>=70?'crit':i.pr>=50?'warn':'ok'}">P${i.pr}</span><span>${esc(i.title)}<br><span class="muted" style="font-size:.7rem">${esc(i.region.name)} · ${ST[i.si][2]}</span></span><span></span></div>`).join('')}`;
    $('#wList').querySelectorAll('[data-wi]').forEach(x=>x.onclick=()=>openIssue(I.find(i=>i.id===x.dataset.wi)));});
}

/* ================================================================
   DIRECTORY
   ================================================================ */
function renderDirectory(force){
  const pl=S.filter(s=>s.region);
  const W=760,H=340,L=46,Rr=16,Tp=16,B=40,sx=v=>L+(W-L-Rr)*v/125,sy=v=>Tp+(H-Tp-B)*(1-v/100);
  let g='';for(let v=0;v<=120;v+=20)g+=`<line x1="${sx(v)}" x2="${sx(v)}" y1="${Tp}" y2="${H-B}" stroke="#E8E0CE"/><text x="${sx(v)}" y="${H-B+16}" text-anchor="middle">${v}</text>`;
  for(let v=0;v<=100;v+=25)g+=`<line x1="${L}" x2="${W-Rr}" y1="${sy(v)}" y2="${sy(v)}" stroke="#E8E0CE"/><text x="${L-8}" y="${sy(v)+4}" text-anchor="end">${v}</text>`;
  const dots=pl.map((s,i)=>s===me?'':`<circle data-sid="${s.idx}" cx="${sx(s.vol).toFixed(1)}" cy="${sy(s.quality).toFixed(1)}" r="${(2.5+s.outcome/16).toFixed(1)}" fill="${s.outcome>=60?'#2E7A52':s.outcome>=40?'#C9932F':'#A3202C'}" fill-opacity=".55" style="cursor:pointer${force?`;animation:pop .5s ${Math.round(i*2.5)}ms both`:''}"><title>${esc(s.name)} · volume ${s.vol} · kualitas ${s.quality} · outcome ${s.outcome}%</title></circle>`).join('');
  const mx=sx(me.vol),my=sy(me.quality);
  const meM=`<g data-sid="${me.idx}" style="cursor:pointer"><rect x="${mx-8}" y="${my-8}" width="16" height="16" transform="rotate(45 ${mx} ${my})" fill="#13274A" stroke="#fff" stroke-width="2"/><circle cx="${mx}" cy="${my}" r="12" fill="none" stroke="#13274A" stroke-width="2"><animate attributeName="r" values="10;24" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite"/></circle><text x="${mx+14}" y="${my-10}" style="fill:#13274A;font-weight:700">Anda</text></g>`;
  $('#scatter').innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="min-width:560px" role="img" aria-label="Sebaran volume terhadap kualitas">${g}<text x="${(W+L)/2}" y="${H-4}" text-anchor="middle">Volume interaksi (6 minggu, bertambah saat kunjungan)</text><text transform="translate(12,${(H-B)/2}) rotate(-90)" text-anchor="middle">Indeks kualitas</text>${dots}${meM}</svg>`;
  const q=$('#pfQ').value.trim().toLowerCase(),c=$('#pfCl').value,so=$('#pfSort').value;
  const list=pl.filter(s=>(!q||s.name.toLowerCase().includes(q)||s.id.toLowerCase().includes(q)||s.region.name.toLowerCase().includes(q))&&(!c||s.dom===c))
    .sort((a,b)=>so==='id'?a.idx-b.idx:b[so]-a[so]);
  $('#pfCount').textContent=`${list.length} Serdik`;
  $('#pfRows').innerHTML=list.map(s=>`<tr class="click${s===me?' me':''}" data-sid="${s.idx}"><td class="mono">${s.id}</td><td style="font-weight:600;white-space:nowrap">${s===me?'Anda · ':''}${esc(s.name)}</td><td style="white-space:nowrap">${esc(s.region.name)}</td><td style="white-space:nowrap"><span class="sdot" style="background:${STAT[s.st][1]}"></span> ${STAT[s.st][0]}</td><td><span class="ch ${s.dom}">${s.dom}</span></td><td class="num">${s.vol}</td><td class="num">${s.quality}</td><td class="num">${s.outcome}%</td><td>${s.conf<=2||s.publicExp<=1?'<span class="pill acc">pembekalan</span>':'<span class="muted small">siap</span>'}</td></tr>`).join('');
}
$('#scatter').addEventListener('click',e=>{const d=e.target.closest('[data-sid]');if(d)openProfile(S[+d.dataset.sid]);});
$('#pfRows').addEventListener('click',e=>{const d=e.target.closest('[data-sid]');if(d)openProfile(S[+d.dataset.sid]);});
['#pfQ','#pfCl','#pfSort'].forEach(id=>$(id).addEventListener('input',()=>renderDirectory(false)));

/* ================================================================
   DRAWERS
   ================================================================ */
function openDrawer(html){const d=$('#drawer');d.innerHTML=html;d.hidden=false;$('#scrim').hidden=false;d.style.animation='none';void d.offsetWidth;d.style.animation='';d.scrollTop=0;const x=d.querySelector('.x');if(x){x.onclick=closeDrawer;x.focus();}animateBars(d);}
function closeDrawer(){$('#drawer').hidden=true;$('#scrim').hidden=true;}
$('#scrim').onclick=closeDrawer;
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(tour)endTour();else if(!$('#drawer').hidden)closeDrawer();}});
function openProfile(s){
  const r=s.region,W=state.weights,ws=Object.values(W).reduce((a,b)=>a+b,0)||1;
  const k=s.idx<me.idx?s.idx+'|'+me.idx:me.idx+'|'+s.idx,e=net.edges.get(k);
  const why=r&&s.breakdown?Object.keys(WLBL).map(k2=>{const v=s.breakdown[k2];return `<div class="barrow"><span>${WSHORT[k2]}</span><div class="track"><i data-w="${Math.round(v*100)}"></i></div><span class="num">+${(W[k2]*v/ws*100).toFixed(1)}</span></div>`;}).join(''):'';
  openDrawer(`<div class="dhead"><div style="min-width:0"><span class="lbl mono">${s.id}${s===me?' · Anda':''}</span><h2>${esc(s.name)}</h2>
   <div class="row" style="margin-top:6px"><span class="ch ${s.dom}">${s.dom}</span><span class="small muted">${CL[s.dom]}</span>${s.priority?`<span class="pill ${s.priority==='kes'?'crit':'warn'}">${PRIO[s.priority]}</span>`:''}</div></div><button class="x" aria-label="Tutup">×</button></div>
  ${r?`<div class="card grid" style="gap:6px"><div class="row between"><span class="pill" style="color:${STAT[s.st][1]};border-color:${STAT[s.st][1]}">● ${STAT[s.st][0]}</span><span class="small muted">${esc(r.name)}${s.coord?' · Koordinator':''}</span></div><span class="small">${esc(s.act||'')}</span>
   <div class="row">${s!==me?`<button class="btn sm primary" id="pfContact">${r===me.region?'Kirim pesan tim':'Hubungi untuk rujukan'}</button>`:''}<button class="btn sm" id="pfFly">Lihat di peta</button></div></div>`:''}
  ${s!==me?`<div class="card grid" style="gap:4px"><span class="lbl">Interaksi dengan Anda</span>${e?`<span class="small">${Object.entries(e.types).map(([t,w])=>`${ETYPE[t]?ETYPE[t][0]:t}: ${Math.round(w*10)/10}`).join(' · ')}</span>`:'<span class="small muted">Belum pernah berinteraksi.</span>'}</div>`:''}
  ${why?`<div class="grid" style="gap:6px"><div class="row between"><span class="lbl">Mengapa ditempatkan di ${esc(r.name)}?</span><b class="num">${s.fit.toFixed(1)}</b></div><p class="small muted">${s.layer===1?`Lapis 1: dikunci aturan “${PRIO[s.priority]}”.`:'Lapis 2: skor kecocokan tertinggi saat slot diisi.'}${s.buddy?` Buddy: ${esc(s.buddy.name)}.`:''}</p><div class="bars">${why}</div></div>`:''}
  <div><span class="lbl">Skills</span><div class="bars" style="margin-top:6px">${SK.map(([k2,l])=>`<div class="barrow"><span>${l}</span><div class="track"><i data-w="${s.sk[k2]}"></i></div><span class="num">${s.sk[k2]}</span></div>`).join('')}</div></div>
  <div><span class="lbl">Profil</span><dl class="kv"><dt>Asal</dt><dd>${esc(s.java?s.originR.name+', '+s.originProv:s.originProv)}</dd><dt>KKN</dt><dd>${s.kkn?`${s.kknLoc}, ${s.kknMonths} bulan`:'Belum pernah'}</dd><dt>Profesional</dt><dd>${s.work} tahun · ${s.role}, ${s.industry}</dd><dt>Sertifikasi</dt><dd>${s.certs.length?esc(s.certs.join(', ')):'—'}</dd><dt>Usaha</dt><dd>${s.usaha?'Ya · '+s.usahaField:'Tidak'}</dd>${Object.keys(LANGS).filter(l=>s.langs[l]).map(l=>`<dt>Bahasa ${LANGS[l]}</dt><dd>${LVL[s.langs[l]]}</dd>`).join('')}</dl></div>
  <div class="card grid" style="gap:6px"><span class="lbl">Kesiapan komunikasi</span><span class="small">Percaya diri ${s.conf}/5 · mendengar ${s.listen}/5 · publik ${s.publicExp}/5</span><p class="note">${s.conf<=2||s.publicExp<=1?'Rekomendasi pembekalan komunikasi dan pendampingan buddy. Tidak memengaruhi kelayakan penempatan.':'Siap berinteraksi dan dapat menjadi buddy rekan.'}</p></div>
  <div><span class="lbl">Kinerja</span><div class="gauge" style="margin-top:6px"><div><b>${s.vol}</b><span>volume</span></div><div><b>${s.quality}</b><span>kualitas</span></div><div><b>${s.outcome}%</b><span>outcome</span></div></div></div>`);
  const c=$('#pfContact');if(c)c.onclick=()=>{if(r===me.region){closeDrawer();location.hash='saya';setTimeout(()=>{$('#chatIn').value=`@${s.name.split(' ')[0]} `;$('#chatIn').focus();},300);}
    else{addEdge(me,s,'referral');fx.arc(me,s,EVT.referral[2]);emit('referral',{s:me,text:`Anda menghubungi ${s.name} (${r.name}) untuk rujukan kluster ${s.dom}`});toast(`Permintaan rujukan terkirim ke ${s.name}`);openProfile(s);}};
  const f=$('#pfFly');if(f)f.onclick=()=>{closeDrawer();location.hash='operasi';setTimeout(()=>{selectRegion(r,false);flyTo({x:s.cx,z:s.cz,close:true});},250);};
}
function openIssue(it){
  if(!it)return;const reached=stepReached(it);
  const comp=[['Urgensi',it.urg/5,.30],['Dampak',it.imp/5,.25],['Warga terdampak',Math.min(1,Math.log10(it.aff)/3.3),.20],['Risiko bila diabaikan',it.risk/5,.15],['Kewenangan',it.auth===0?1:it.auth===1?.75:.55,.10]];
  openDrawer(`<div class="dhead"><div style="min-width:0"><span class="lbl mono">${it.id} · ${ST[it.si][1]}</span><h2>${esc(it.title)}</h2><p class="small muted" style="margin-top:4px">Desa ${esc(it.desa)}, ${esc(it.region.name)} · pencatat ${it.owner?(it.owner===me?'Anda':esc(it.owner.name)):'—'}${it.referredTo?` · dirujuk ke ${esc(it.referredTo.name)}`:''}</p></div><button class="x" aria-label="Tutup">×</button></div>
  <div class="row"><span class="ch ${CAT_CL[it.cat]}">${esc(it.cat)}</span><span class="pill ${it.auth===0?'ok':it.auth===1?'warn':'crit'}">${AUTH[it.auth]}</span><span class="pill">${fmt(it.aff)} warga</span></div>
  <div class="card grid"><div class="row between"><span class="lbl">Skor prioritas</span><b class="num" style="font-size:1.4rem">${it.pr}</b></div><div class="bars">${comp.map(([l,v,w])=>`<div class="barrow"><span>${l} <span class="muted">×${w}</span></span><div class="track"><i data-w="${Math.round(v*100)}"></i></div><span class="num">+${Math.round(v*w*100)}</span></div>`).join('')}</div></div>
  <div><span class="lbl">Alur tindak lanjut</span><div class="steps" style="margin-top:6px">${STEPS.map((s,i)=>`<div class="step ${i<reached?'done':i===reached?'now':''}"><i>${i+1}</i><span><b>${s}</b> <span class="muted">— ${STEP_ID[i]}</span>${i===5&&it.si>=4?`<br><span class="small">Dirujuk ke <b>${INST[it.cat]}</b></span>`:''}</span></div>`).join('')}</div></div>
  <p class="note">${it.auth===2?`Di luar kewenangan Satgas: dokumentasikan, rujuk ke ${INST[it.cat]}, pantau, dan kabarkan ke warga tanpa menjanjikan penyelesaian.`:it.auth===1?`Butuh kolaborasi dengan ${INST[it.cat]} dan rekan yang kompetensinya sesuai.`:'Dapat ditangani langsung bersama warga.'}</p>
  <div class="row"><label class="field" for="isMove">Pindahkan status<select id="isMove">${ST.map((s,i)=>`<option value="${i}"${i===it.si?' selected':''}>${s[2]}</option>`).join('')}</select></label>${!it.feedback&&it.si>=3?'<button class="btn" id="fbBtn" style="align-self:end">Tandai umpan balik ke warga</button>':''}</div>`);
  $('#isMove').onchange=e=>{moveIssue(it,+e.target.value);openIssue(it);};
  const f=$('#fbBtn');if(f)f.onclick=()=>{it.feedback=true;emit('respons',{s:me,r:it.region,text:`Umpan balik ${it.id} dikabarkan ke warga`});toast('Umpan balik tercatat');openIssue(it);};
}
function openNewIssue(o={}){
  const r=me.region,v=o.village||me.lastVillage||r.villages[0];
  openDrawer(`<div class="dhead"><div><span class="lbl">Digital Community Feedback Form</span><h2>Catat aspirasi warga</h2><p class="small muted">${esc(r.name)} · dicatat oleh ${esc(me.name)}</p></div><button class="x" aria-label="Tutup">×</button></div>
  <form id="nf" class="form">
   <label class="full">Ringkasan aspirasi/keluhan<input type="text" id="nfTitle" required placeholder="Contoh: Jalan menuju posyandu tergenang saat hujan"></label>
   <div class="full row" id="nfSuggest"></div>
   <label>Desa/kelurahan<select id="nfDesa">${r.villages.map(x=>`<option${x===v?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
   <label>Kategori<select id="nfCat">${CATS.map(c=>`<option>${c}</option>`).join('')}</select></label>
   <label>Kewenangan<select id="nfAuth">${AUTH.map((a,i)=>`<option value="${i}">${a}</option>`).join('')}</select></label>
   <label>Warga terdampak<input type="number" id="nfAff" min="1" value="40"></label>
   <label>Urgensi <output id="nfUrgO">3</output><input type="range" id="nfUrg" min="1" max="5" value="3"></label>
   <label>Dampak <output id="nfImpO">3</output><input type="range" id="nfImp" min="1" max="5" value="3"></label>
   <label>Risiko bila diabaikan <output id="nfRiskO">3</output><input type="range" id="nfRisk" min="1" max="5" value="3"></label>
   <div class="full card grid" style="gap:4px"><span class="lbl">Pratinjau skor prioritas</span><b class="num" id="nfPr" style="font-size:1.5rem">—</b><span class="small muted" id="nfPrN"></span></div>
   <label class="full tog"><input type="checkbox" id="nfAnon"> Catat tanpa identitas pelapor</label>
   <label class="full tog"><input type="checkbox" id="nfConsent" checked> Warga menyetujui dokumentasi foto/bukti</label>
   <div class="full row"><button class="btn primary" type="submit">Simpan aspirasi</button><span class="small muted">Langsung muncul di peta, log, dan papan tindak lanjut.</span></div></form>`);
  const sug=pick(CATS.slice(0,10));$('#nfSuggest').innerHTML=[...new Set([sug,...CATS.slice(0,10).sort(()=>rnd()-.5)])].slice(0,3).map(c=>`<button type="button" class="btn sm" data-sg="${esc(c)}">Saran: ${esc(TPL[c][0])}</button>`).join('');
  $('#nfSuggest').onclick=e=>{const b=e.target.closest('[data-sg]');if(!b)return;$('#nfTitle').value=TPL[b.dataset.sg][0];$('#nfCat').value=b.dataset.sg;prev();};
  const prev=()=>{['Urg','Imp','Risk'].forEach(k=>$('#nf'+k+'O').textContent=$('#nf'+k).value);const p=priorityOf({urg:+$('#nfUrg').value,imp:+$('#nfImp').value,aff:Math.max(1,+$('#nfAff').value||1),risk:+$('#nfRisk').value,auth:+$('#nfAuth').value});
    setNum($('#nfPr'),p);$('#nfPr').style.color=p>=82?'#A3202C':p>=60?'#B7802A':'#2E7A52';$('#nfPrN').textContent=p>=82?'Prioritas tinggi: akan memicu peringatan di Pusat Operasi.':p>=60?'Prioritas sedang.':'Prioritas rendah.';};
  $('#nf').addEventListener('input',prev);prev();
  $('#nf').onsubmit=e=>{e.preventDefault();const t=$('#nfTitle').value.trim();if(!t){toast('Isi ringkasan aspirasi terlebih dahulu');$('#nfTitle').focus();return;}
    const vv=r.villages.find(x=>x.name===$('#nfDesa').value);me.lastVillage=vv;
    const it=createAspirasi(me,{title:t,cat:$('#nfCat').value,auth:+$('#nfAuth').value,urg:+$('#nfUrg').value,imp:+$('#nfImp').value,aff:Math.max(1,+$('#nfAff').value||1),risk:+$('#nfRisk').value,anon:$('#nfAnon').checked,docOk:$('#nfConsent').checked,desa:vv.name});
    me.vol++;closeDrawer();toast(`${it.id} tercatat · prioritas ${it.pr}`);renderHome(true);};
}
function openHelpRequest(){
  const k0=['A','B','C','D'].sort((a,b)=>me['c'+a]-me['c'+b])[0];
  openDrawer(`<div class="dhead"><div><span class="lbl">Peer Assistance Request</span><h2>Minta bantuan rekan</h2><p class="small muted">Sistem merekomendasikan rekan berdasarkan kompetensi dan jarak.</p></div><button class="x" aria-label="Tutup">×</button></div>
   <div class="seg" id="hrSeg" role="group" aria-label="Kompetensi dibutuhkan">${['A','B','C','D'].map(k=>`<button data-k="${k}" aria-pressed="${k===k0}">${k} · ${CL[k].split(' ')[0]}</button>`).join('')}</div>
   <div id="hrList" class="grid" style="gap:8px"></div>`);
  const draw=k=>{const a={s:me,need:k};const hs=helpersFor(a);
    $('#hrList').innerHTML=hs.map(h=>`<div class="task"><div class="avatar" style="background:${CLHEX[h.s.dom]}">${esc(initials(h.s.name))}<span class="sdot" style="background:${STAT[h.s.st][1]}"></span></div><div class="grid" style="gap:4px"><b class="small">${esc(h.s.name)} · ${esc(h.s.region.name)}</b><span class="small muted">Skor ${k} ${h.s['c'+k]} · ${Math.round(h.d*11)} km · ${STAT[h.s.st][0]} · kecocokan ${(h.sc*100).toFixed(0)}</span><div class="track"><i data-w="${Math.round(h.sc*100)}"></i></div><button class="btn sm primary" data-h="${h.s.idx}" style="justify-self:start">${h.d<4.5?'Minta datang':'Minta dukungan daring'}</button></div></div>`).join('')||'<div class="empty">Belum ada rekan tersedia saat ini.</div>';
    animateBars($('#hrList'));
    $('#hrList').querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{const al=addAlert({type:'bantuan',s:me,need:k,text:`Anda meminta bantuan kluster ${k}`});assignHelper(al,S[+b.dataset.h]);closeDrawer();toast(`${S[+b.dataset.h].name} menerima permintaan Anda`);if(S[+b.dataset.h].region===me.region)pushChat(S[+b.dataset.h],'Siap, saya merapat ke lokasi.');});};
  draw(k0);$('#hrSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('#hrSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw(b.dataset.k);};
}

/* ================================================================
   CLOCK, LOOP, BOOT
   ================================================================ */
function clock(){
  $('#clockT').textContent=hhmm(sim.min);
  const ph=sim.min<8*60?'apel pagi':sim.min<12*60?'kunjungan pagi':sim.min<13*60?'istirahat siang':sim.min<16*60?'kunjungan siang':'pelaporan sore';
  $('#clockD').textContent=`Hari ke-${sim.day} · ${ph}`;$('#liveDot').classList.toggle('paused',!sim.playing);
}
function updateBadges(){const n=sim.alerts.filter(a=>a.toMe&&a.state==='open').length+sim.myTasks.length;const b=$('#bdgSaya');b.hidden=!n;b.textContent=n;const m=sim.alerts.filter(a=>a.state==='open').length;const o=$('#bdgOps');o.hidden=!m;o.textContent=m;if(typeof hub!=='undefined'&&state.tab!=='hub'){const t=Object.values(hub.unread).reduce((x,y)=>x+y,0);const h=$('#bdgHub');h.hidden=!t;h.textContent=t>99?'99+':t;}}
$('#playBtn').onclick=()=>{sim.playing=!sim.playing;$('#playBtn').textContent=sim.playing?'Jeda':'Lanjut';$('#playBtn').setAttribute('aria-label',sim.playing?'Jeda simulasi':'Lanjutkan simulasi');clock();};
$('#speedSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;sim.speed=+b.dataset.v;$$('#speedSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));toast(`Kecepatan ${sim.speed}× · 1 detik = ${sim.speed*2} menit operasi`);};
$('#isProv').innerHTML+=PROV.map(p=>`<option>${p}</option>`).join('');
$('#isCat').innerHTML+=CATS.map(c=>`<option>${c}</option>`).join('');
let lastT=performance.now();const tick={a:0,b:0,c:0,d:0};
function frame(t){
  requestAnimationFrame(frame);const dt=Math.min(.1,Math.max(0,(t-lastT)/1000));lastT=t;
  if(!me){drawLoginBg(dt);return;}
  if(sim.playing){sim.acc+=dt*sim.speed*2;let n=0;while(sim.acc>=1&&n<120){sim.acc-=1;stepMinute();n++;}if(n>=120)sim.acc=0;}
  moveAll(sim.playing?dt*sim.speed*2:0,dt);stepTweens(dt);
  if(state.tab==='operasi'||state.tab==='penempatan')render3D(dt,t);else{fx.queue.length=0;fx.arcs.length=0;}
  if(state.tab==='jaringan'&&NET)drawNet(dt);else if(net.flash.length>40)net.flash.splice(0,net.flash.length-40);
  if(state.tab==='lab'&&lab.tool==='queue')queueAnim(dt);
  tick.a+=dt;tick.b+=dt;tick.c+=dt;tick.d+=dt;
  if(tick.a>.25){tick.a=0;clock();flushFeed();if(state.tab==='operasi'){renderOpsKpis();renderStatus();}}
  if(tick.b>.5){tick.b=0;if(state.tab==='saya')renderHome();if(state.tab==='operasi')renderSide(false);if(state.tab==='hub')renderHub(false);updateBadges();}
  if(tick.c>1.5){tick.c=0;if(state.tab==='operasi'||state.tab==='penempatan'){updateColumns();}if(state.tab==='operasi')renderHourly();if(state.tab==='isu')renderIssues(false);if(state.tab==='jaringan')renderNetSide();if(state.tab==='lab')labTick();if(state.tab==='analitik')renderAnalytics(false);}
  if(tick.d>4){tick.d=0;if(state.tab==='saya')renderPerf();if(state.tab==='direktori')renderDirectory(false);}
}

