
/* ================================================================
   VISUAL TOOLKIT
   ================================================================ */
const V={
  hx(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];},
  lerp(a,b,t){t=Math.max(0,Math.min(1,t));const A=V.hx(a),B=V.hx(b);return'#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join('');},
  seq(t){return t<.5?V.lerp('#F4EAD2','#C59A4A',t*2):V.lerp('#C59A4A','#13274A',(t-.5)*2);},
  div(t){return t<0?V.lerp('#F1E8D6','#7E1622',-t):V.lerp('#F1E8D6','#2E7A52',t);},
  ring(p,big,label,col,size=86){const r=34,c=2*Math.PI*r;p=Math.max(0,Math.min(1,p||0));
    return `<div class="r"><svg width="${size}" height="${size}" viewBox="0 0 84 84" role="img" aria-label="${label} ${big}"><circle cx="42" cy="42" r="${r}" fill="none" stroke="#EFE6D3" stroke-width="8"/><circle class="ringarc" cx="42" cy="42" r="${r}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c*(1-p)).toFixed(1)}" style="--c:${c.toFixed(1)}" transform="rotate(-90 42 42)"/><text x="42" y="48" text-anchor="middle" style="font:700 17px 'Playfair Display',serif;fill:#0F1D38">${big}</text></svg><span>${label}</span></div>`;},
  spark(vals,w=120,h=32,col='#C59A4A'){if(!vals.length)vals=[0];const mx=Math.max(1,...vals),n=vals.length;
    const X=i=>n<2?w/2:2+i*(w-4)/(n-1),Y=v=>h-3-(h-6)*v/mx;const pts=vals.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="M${X(0)},${h} L${pts.replace(/ /g,' L')} L${X(n-1)},${h}Z" fill="${col}" opacity=".16"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="${X(n-1)}" cy="${Y(vals[n-1])}" r="2.8" fill="${col}"/></svg>`;},
  donut(parts,size=150,center='',anim=true){const r=size/2-14,C=2*Math.PI*r,tot=parts.reduce((a,p)=>a+p.v,0)||1;let acc=0;
    const segs=parts.filter(p=>p.v>0).map((p,i)=>{const len=p.v/tot*C;const s=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${p.c}" stroke-width="20" stroke-dasharray="${Math.max(0,len-1.5).toFixed(1)} ${(C-len+1.5).toFixed(1)}" stroke-dashoffset="${(-acc).toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})" data-tt="${esc(p.l)}: ${fmt(p.v)} (${Math.round(p.v/tot*100)}%)"${anim?` style="animation:fade .5s ${i*80}ms both"`:''}/>`;acc+=len;return s;}).join('');
    return `<svg class="vis" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="width:${size}px;max-width:100%">${segs}<text x="${size/2}" y="${size/2}" text-anchor="middle">${center}</text></svg>`;},
  radar(axes,series,size=260){const n=axes.length,c=size/2,R=size/2-46;const P=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[c+Math.cos(a)*R*v,c+Math.sin(a)*R*v];};
    let s='';for(let k=1;k<=4;k++)s+=`<polygon points="${axes.map((_,i)=>P(i,k/4).join(',')).join(' ')}" fill="${k%2?'#FBF6EA':'#F5EEDF'}" stroke="#E2D6BE"/>`;
    axes.forEach((a,i)=>{const[x,y]=P(i,1),[lx,ly]=P(i,1.2);s+=`<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="#E2D6BE"/><text x="${lx}" y="${ly+4}" text-anchor="middle" class="t-strong">${a}</text>`;});
    series.forEach(se=>{const pts=se.vals.map((v,i)=>P(i,Math.max(.02,Math.min(1,v))).join(',')).join(' ');
      s+=`<polygon points="${pts}" fill="${se.col}" fill-opacity="${se.fill}" stroke="${se.col}" stroke-width="2" style="transform-origin:${c}px ${c}px;animation:pop .7s both"/>`;
      se.vals.forEach((v,i)=>{const[x,y]=P(i,Math.max(.02,Math.min(1,v)));s+=`<circle cx="${x}" cy="${y}" r="3.5" fill="${se.col}" data-tt="${axes[i]}: ${Math.round(v*100)}"/>`;});});
    return `<svg class="vis" viewBox="0 0 ${size} ${size}" style="max-width:${size+40}px;margin:auto" role="img" aria-label="Diagram radar kinerja">${s}</svg>`;},
  dayline(evs){const W=600,H=78,L=16,Rr=16,X=m=>L+(W-L-Rr)*(m-420)/(1050-420);
    let s=`<rect x="${L}" y="34" width="${W-L-Rr}" height="10" rx="5" fill="#EFE6D3"/><rect x="${L}" y="34" width="${Math.max(0,X(Math.min(1050,sim.min))-L)}" height="10" rx="5" fill="#E3C68A"/>`;
    for(let h=7;h<=17;h++)s+=`<text x="${X(h*60)}" y="66" text-anchor="middle">${String(h).padStart(2,'0')}</text>`;
    const lane={};evs.forEach(e=>{const m=e.abs%1440,x=X(m);const k=Math.round(x/14);lane[k]=(lane[k]||0)+1;const y=39-(lane[k]-1)*12;
      s+=`<circle cx="${x}" cy="${y}" r="6" fill="${EVT[e.type][2]}" stroke="#fff" stroke-width="2" data-tt="${e.time} · ${esc(e.text)}" style="animation:pop .4s both"/>`;});
    s+=`<line x1="${X(sim.min)}" x2="${X(sim.min)}" y1="20" y2="52" stroke="#7E1622" stroke-width="2"/><text x="${X(sim.min)}" y="16" text-anchor="middle" class="t-strong">${hhmm(sim.min)}</text>`;
    return `<svg class="vis" viewBox="0 0 ${W} ${H}" role="img" aria-label="Linimasa aktivitas saya hari ini">${s}</svg>`;},
  gauge(v,label,sub){const a0=Math.PI,ang=a0-(v+1)/2*Math.PI,cx=110,cy=100,R=80;let s='';
    for(let i=0;i<40;i++){const t1=Math.PI-i*Math.PI/40,t2=Math.PI-(i+1)*Math.PI/40;const p=(t,r)=>`${cx+Math.cos(t)*r},${cy-Math.sin(t)*r}`;s+=`<path d="M${p(t1,R)} A${R},${R} 0 0 1 ${p(t2,R)} L${p(t2,R-18)} A${R-18},${R-18} 0 0 0 ${p(t1,R-18)}Z" fill="${V.div(i/39*2-1)}"/>`;}
    const nx=cx+Math.cos(ang)*(R-8),ny=cy-Math.sin(ang)*(R-8);
    s+=`<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="#0F1D38" stroke-width="3.5" stroke-linecap="round" style="transform-origin:${cx}px ${cy}px;animation:needle 1s cubic-bezier(.2,.8,.2,1) both"/><circle cx="${cx}" cy="${cy}" r="7" fill="#0F1D38"/>`;
    s+=`<text x="${cx}" y="${cy+26}" text-anchor="middle" style="font:700 24px 'Playfair Display',serif;fill:#0F1D38">${v>=0?'+':''}${v.toFixed(2)}</text><text x="${cx}" y="${cy+44}" text-anchor="middle">${label}</text><text x="18" y="${cy+14}">negatif</text><text x="202" y="${cy+14}" text-anchor="end">positif</text>`;
    return `<svg class="vis" viewBox="0 0 220 150" style="max-width:260px;margin:auto" role="img" aria-label="${label}">${s}</svg>${sub?`<p class="small muted" style="text-align:center">${sub}</p>`:''}`;},
};
(()=>{const st=document.createElement('style');st.textContent='@keyframes needle{from{transform:rotate(-90deg)}}';document.head.appendChild(st);
  const tt=document.createElement('div');tt.className='tt';tt.hidden=true;document.body.appendChild(tt);
  document.addEventListener('mousemove',e=>{const t=e.target.closest&&e.target.closest('[data-tt]');if(!t){tt.hidden=true;return;}tt.textContent=t.getAttribute('data-tt');tt.hidden=false;
    tt.style.left=Math.min(window.innerWidth-270,e.clientX+14)+'px';tt.style.top=(e.clientY+14)+'px';});})();

/* ================================================================
   SENTIMENT (lexicon-based, Bahasa Indonesia)
   ================================================================ */
const POSW=new Set('terima kasih terbantu membantu bantu baik bagus senang puas cepat lancar setuju siap berhasil jelas mantap tuntas responsif ramah sigap semangat solid alhamdulillah sukses apresiasi hebat beres terbuka mudah aman rapi ramai diperbaiki ditindaklanjuti tanggap peduli'.split(' '));
const NEGW=new Set('rusak lama sulit kecewa marah lambat mahal tertunda hilang macet menolak terlambat padam tersumbat putus lemah buruk capek lelah bingung khawatir keluhan ditekan mengancam mogok tertutup ditunda bermasalah berbelit longsor menumpuk tercemar kekurangan antre antrean diabaikan'.split(' '));
const NEGATORS=new Set(['tidak','belum','bukan','kurang','tak','tanpa']);
function sentiment(text){
  const toks=(text.toLowerCase().match(/[a-z-]+/g)||[]);let s=0,n=0;const mark={};
  for(let i=0;i<toks.length;i++){const w=toks[i],nx=toks[i+1];
    if(NEGATORS.has(w)){if(nx&&POSW.has(nx)){s-=1;n++;mark[i]=mark[i+1]='n';i++;}else if(nx&&NEGW.has(nx)){s+=.5;n++;mark[i]=mark[i+1]='p';i++;}else{s-=.4;n++;mark[i]='n';}continue;}
    if(POSW.has(w)){s+=1;n++;mark[i]='p';}else if(NEGW.has(w)){s-=1;n++;mark[i]='n';}}
  return{score:Math.max(-1,Math.min(1,n?s/Math.sqrt(n+1):0)),toks,mark,n};
}
function hiSent(text){const r=sentiment(text);let i=-1;return text.replace(/[A-Za-z-]+/g,w=>{i++;const m=r.mark[i];return m?`<span class="${m==='p'?'wpos':'wneg'}">${esc(w)}</span>`:esc(w);});}
const sentCol=v=>v>.15?'#2E7A52':v<-.15?'#7E1622':'#C59A4A';
const FBT={pos:['Terima kasih, jalannya sudah mulai diperbaiki.','Alhamdulillah, posyandu sekarang lebih ramai kadernya.','Petugasnya ramah dan cepat menindaklanjuti.','Senang ada yang mendengar keluhan kami, sangat membantu.','Informasinya jelas, kami jadi tahu harus ke mana.','Bagus, prosesnya lebih mudah dari dugaan kami.'],
  neu:['Sudah dicatat, kami tunggu kabar selanjutnya.','Katanya sudah diteruskan ke dinas.','Kami ikut jadwal dari desa saja.','Nanti kami sampaikan ke warga lain.'],
  neg:['Sudah lama menunggu tapi belum ada kabar.','Kecewa, laporan bulan lalu tidak ditanggapi.','Prosesnya lambat dan berbelit.','Jalannya masih rusak, warga khawatir saat hujan.','Antrean masih panjang, belum ada perubahan.']};
function genFb(it){const r=rnd();let pool;
  if(it.si>=6)pool=r<.72?'pos':r<.92?'neu':'neg';else if((it.si===4||it.si===5)&&it.days>12)pool=r<.6?'neg':r<.88?'neu':'pos';else pool=r<.3?'pos':r<.72?'neu':'neg';
  const text=pick(FBT[pool]);it.fb={text,s:sentiment(text).score,abs:abs()-rint(0,600)};}
I.forEach(it=>{if(it.si>=3&&rnd()<.72)genFb(it);});
window.__fb=it=>{genFb(it);it.fb.abs=abs();};

/* ================================================================
   HUB SERDIK
   ================================================================ */
const hub={seen:{},ch:'tim',msgs:{prov:[],angkatan:[],bantuan:[],praktik:[],posko:[]},dms:{},unread:{},showSent:false,pending:[],posted:new Set(),mid:0,lastLen:-1,lastCh:''};
const HUBT={prov:['Ada kontak Dinas Kesehatan {prov} yang responsif?','Rekap minggu ini: aspirasi infrastruktur paling banyak di wilayah kami.','Terima kasih tim {kab} sudah bantu rujukan kemarin, sangat membantu!','Jalan ke desa kami putus karena longsor, kegiatan ditunda dulu.','Siap mendukung rapat koordinasi provinsi Jumat ini.','Puskesmas di kecamatan kami responsif, warga senang.','Laporan ke dinas masih tertunda, belum ada jawaban.'],
  angkatan:['Semangat semua, hari ke-{day} penugasan!','Ada yang punya template formulir persetujuan dokumentasi?','Capek tapi senang, warga mulai terbuka.','Sinyal di lokasi sangat lemah, laporan sering tertunda.','Berbagi: teknik bertanya terbuka sangat membantu menggali masalah.','Alhamdulillah rujukan pertama saya berhasil ditindaklanjuti dinas.','Agak bingung soal batas kewenangan untuk kasus bansos.','Terima kasih Posko, responsnya cepat sekali.'],
  praktik:['Praktik baik: rapat dengan kader sebelum kunjungan rumah membuat warga lebih terbuka.','Gunakan peta desa sederhana untuk menandai lokasi keluhan, hasilnya lebih jelas.','Sampaikan batas kewenangan di awal, warga jadi tidak salah harap.','Bawa daftar kontak instansi, rujukan jadi lebih cepat.','Catat keluhan langsung di formulir digital sebelum lupa detailnya.'],
  posko:['Pengingat: laporan harian dikirim paling lambat 17.00 WIB.','Rapat evaluasi mingguan Jumat 15.00 via daring.','Update SOP: aspirasi prioritas P≥80 wajib divalidasi dalam 60 menit.']};
function hubMsg(ch,from,text,extra={}){const m=Object.assign({id:++hub.mid,from,text,time:hhmm(sim.min),abs:abs(),reacts:{'Siap':rint(0,3),'+1':rint(0,4),'Terima kasih':rint(0,2)},myR:new Set()},extra);
  m.sent=sentiment(text||'').score;(ch.startsWith('dm:')?(hub.dms[ch]=hub.dms[ch]||[]):hub.msgs[ch]).push(m);
  const arr=ch.startsWith('dm:')?hub.dms[ch]:hub.msgs[ch];if(arr.length>120)arr.shift();
  if(!(state.tab==='hub'&&hub.ch===ch)&&from!==me)hub.unread[ch]=(hub.unread[ch]||0)+1;return m;}
const fillT=(t,s)=>t.replace('{prov}',s.region?s.region.prov:'').replace('{kab}',s.region?s.region.name:'').replace('{day}',sim.day);
function hubPeople(ch){if(!me)return S.filter(s=>s.region);if(ch==='staf')return STAFF_PEOPLE.filter(p=>p!==me);if(ch==='prov')return S.filter(s=>s.region&&s.region.prov===me.region.prov&&s!==me);return S.filter(s=>s.region&&s!==me);}
(function seedHub(){const pl=S.filter(s=>s.region);
  for(let i=0;i<9;i++){const s=pick(pl);hubMsg('angkatan',s,fillT(pick(HUBT.angkatan),s));}
  for(let i=0;i<6;i++){const s=pick(pl);hubMsg('praktik',s,pick(HUBT.praktik));}
  hubMsg('posko',null,HUBT.posko[0],{kind:'ann'});
  hubMsg('posko',null,'Polling: kapan rapat evaluasi provinsi?',{kind:'poll',poll:{opts:[{t:'Jumat 15.00',v:41},{t:'Sabtu 09.00',v:27},{t:'Senin 16.00',v:12}],my:-1}});
  hubMsg('posko',null,HUBT.posko[2],{kind:'ann'});
  Object.keys(hub.unread).forEach(k=>hub.unread[k]=0);
})();
window.__hubTick=f=>{
  if(!me)return;const pl=S.filter(s=>s.region&&s!==me&&s.st!=='off');if(!pl.length)return;
  const prov=pl.filter(s=>s.region.prov===me.region.prov);
  if(rnd()<.03*f&&prov.length){const s=pick(prov);hubMsg('prov',s,fillT(pick(HUBT.prov),s));}
  if(rnd()<.045*f){const s=pick(pl);hubMsg('angkatan',s,fillT(pick(HUBT.angkatan),s));}
  if(rnd()<.012*f){const s=pick(pl);hubMsg('praktik',s,pick(HUBT.praktik));}
  if(rnd()<.004){hubMsg('posko',null,pick(HUBT.posko),{kind:'ann'});}
  hub.msgs.posko.forEach(m=>{if(m.poll&&rnd()<.15)m.poll.opts[Math.floor(rnd()*rnd()*m.poll.opts.length)].v++;});
  sim.alerts.forEach(a=>{if(a.type==='bantuan'&&a.s!==me&&!hub.posted.has(a.id)){hub.posted.add(a.id);hubMsg('bantuan',a.s,a.text,{kind:'help',alert:a});}});
  const now=abs();hub.pending=hub.pending.filter(p=>{if(now>=p.at){hubMsg(p.ch,p.from,p.text);return false;}return true;});
};
const CHANS=()=>!isField()?[['staf','shield','Ruang Komando'],['posko','mega','Pengumuman Posko'],['angkatan','users','Angkatan P3MD'],['bantuan','hand','Bantuan lintas wilayah'],['praktik','star','Praktik baik']]:[['tim','hash',`Tim ${me.region.name}`],['prov','hash',`Provinsi ${me.region.prov}`],['angkatan','users','Angkatan P3MD'],['bantuan','hand','Bantuan lintas wilayah'],['praktik','star','Praktik baik'],['posko','mega','Pengumuman Posko']];
function hubList(ch){if(ch==='tim')return sim.chat.map((m,i)=>({id:'t'+i,from:m.from,text:m.text,time:m.time,sys:m.sys,sent:sentiment(m.text).score,reacts:null}));return ch.startsWith('dm:')?(hub.dms[ch]||[]):hub.msgs[ch];}
function renderHub(force){
  if(!me)return;const ch=hub.ch;hub.unread[ch]=0;
  const list=hubList(ch),len=list.length+(ch==='tim'?sim.chatVer*1000:0);
  $('#hubCh').innerHTML=`<span class="sep">Kanal</span>`+CHANS().map(([k,i,l])=>`<button data-ch="${k}" aria-pressed="${k===ch}"><svg class="ic"><use href="#i-${i}"/></svg>${esc(l)}${hub.unread[k]?`<span class="n">${hub.unread[k]}</span>`:''}</button>`).join('')
    +`<span class="sep">Pesan langsung</span>`+(Object.keys(hub.dms).map(k=>{const s=S[+k.slice(3)];return `<button data-ch="${k}" aria-pressed="${k===ch}"><span class="sdot" style="background:${STAT[s.st][1]}"></span>${esc(s.name)}${hub.unread[k]?`<span class="n">${hub.unread[k]}</span>`:''}</button>`;}).join('')||'<span class="small muted" style="padding:4px 10px">Klik avatar rekan untuk mulai.</span>');
  const title=ch.startsWith('dm:')?S[+ch.slice(3)].name:CHANS().find(c=>c[0]===ch)[2];
  const ppl=ch==='tim'?me.region.team:ch.startsWith('dm:')?[S[+ch.slice(3)]]:hubPeople(ch);
  const ms=list.filter(m=>!m.sys).map(m=>m.sent);const avgS=ms.length?ms.reduce((a,b)=>a+b,0)/ms.length:0;
  $('#hubTop').innerHTML=`<h3 style="font-family:var(--f-display);font-size:1.15rem">${esc(title)}</h3><span class="small muted">${ppl.length} anggota</span><span class="pill" style="color:${sentCol(avgS)};border-color:${sentCol(avgS)}" data-tt="Rata-rata sentimen pesan di kanal ini">sentimen ${avgS>=0?'+':''}${avgS.toFixed(2)}</span><label class="tog" style="margin-left:auto"><input type="checkbox" id="hubSent"${hub.showSent?' checked':''}> Sorot sentimen</label>`;
  $('#hubSent').onchange=e=>{hub.showSent=e.target.checked;hub.lastLen=-1;renderHub(true);};
  if(force||len!==hub.lastLen||ch!==hub.lastCh){hub.lastLen=len;hub.lastCh=ch;
    const st=$('#hubStream');const atBottom=st.scrollTop+st.clientHeight>=st.scrollHeight-60;
    const seen=hub.seen[ch]||0;st.innerHTML=list.slice(-60).map(m=>hubMsgHtml(m,ch,typeof m.id==='number'&&m.id>seen&&seen>0)).join('')||'<div class="empty">Belum ada pesan. Mulai percakapan.</div>';
    hub.seen[ch]=Math.max(seen,...list.map(m=>typeof m.id==='number'?m.id:0),1);
    if(atBottom||force)st.scrollTop=st.scrollHeight;}
  renderHubSide();
  const tot=Object.values(hub.unread).reduce((a,b)=>a+b,0);const bd=$('#bdgHub');bd.hidden=!tot;bd.textContent=tot>99?'99+':tot;
}
function hubMsgHtml(m,ch,isNew){
  if(m.sys)return `<div class="msg sys" style="justify-self:center"><span class="bub">${esc(m.text)}</span></div>`;
  const s=m.from,mine=s===me;const av=s?`<div class="avatar" style="background:${CLHEX[s.dom]};width:36px;height:36px">${esc(initials(s.name))}<span class="sdot" style="background:${STAT[s.st][1]}"></span></div>`:`<div class="avatar" style="background:#7E1622;width:36px;height:36px"><svg class="ic" style="color:#F6EBD3"><use href="#i-mega"/></svg></div>`;
  const txt=hub.showSent?hiSent(m.text):esc(m.text);
  let extra='';
  if(m.kind==='poll'){const tot=m.poll.opts.reduce((a,o)=>a+o.v,0)||1;extra=`<div class="pollcard"><b class="small">${esc(m.text)}</b>${m.poll.opts.map((o,i)=>`<button class="pollopt${m.poll.my===i?' mine':''}" data-poll="${m.id}|${i}|${ch}"><i style="width:${Math.round(o.v/tot*100)}%"></i><span>${esc(o.t)}</span><b class="num">${Math.round(o.v/tot*100)}%</b></button>`).join('')}<span class="small muted">${tot} suara</span></div>`;}
  if(m.kind==='help'){const a=m.alert;extra=`<div class="helpcard"><div class="row between"><span class="row small" style="gap:6px"><svg class="ic" style="color:var(--rose)"><use href="#i-hand"/></svg><b>Butuh kluster ${a.need}</b> · ${esc(a.s.region.name)}</span><span class="pill ${a.state==='open'?'warn':'ok'}">${a.state==='open'?'menunggu':'ditangani '+esc(a.handler||'')}</span></div>${a.state==='open'&&isField()?`<button class="btn sm primary" data-helpme="${a.id}" style="justify-self:start">Saya bisa bantu · ${Math.round(Math.hypot(a.s.cx-me.cx,a.s.cz-me.cz)*11)} km</button>`:''}</div>`;}
  if(m.kind==='report')extra=`<div class="repcard">${m.card}</div>`;
  const body=m.kind==='ann'?`<div class="anncard"><span class="lbl" style="color:var(--gold-2)">Pengumuman Posko</span><div>${txt}</div></div>`:m.kind==='poll'?'':`<div class="txt">${txt}</div>`;
  const rx=m.reacts?`<div class="reacts">${Object.entries(m.reacts).map(([l,n])=>`<button class="${m.myR.has(l)?'on':''}" data-react="${m.id}|${esc(l)}|${ch}">${esc(l)} ${n||''}</button>`).join('')}</div>`:'';
  return `<div class="hm${mine?' mine':''}${isNew?' in':''}">${av}<div style="min-width:0"><div class="who">${mine?'Anda':s?esc(dispName(s)):'Posko Satgas'}${s&&(s.isStaff||s.region)?`<span class="muted" style="font-weight:400">· ${esc(s.isStaff?s.unit:s.region.name)}</span>`:''}<time>${m.time}</time>${hub.showSent?`<span class="sent" style="background:${sentCol(m.sent)}" data-tt="Skor sentimen ${m.sent.toFixed(2)}"></span>`:''}</div>${body}${extra}${rx}</div></div>`;
}
function renderHubSide(){
  const pl=S.filter(s=>s.region);const recent=[...hub.msgs.angkatan,...hub.msgs.prov].slice(-40).map(m=>m.sent);
  const moral=recent.length?recent.reduce((a,b)=>a+b,0)/recent.length:0;
  const online=isField()?me.region.team.filter(s=>s!==me).concat(pl.filter(s=>s.region.prov===me.region.prov&&s.region!==me.region&&s.st!=='off').slice(0,16)):pl.filter(s=>inScope(s.region)&&s.st!=='off'&&s.st!=='rest').slice(0,24);
  const openHelp=sim.alerts.filter(a=>a.type==='bantuan'&&a.state==='open');
  const k=[Math.round(moral*100),online.map(s=>s.st).join(''),openHelp.length].join('|');if(k===renderHubSide._k)return;renderHubSide._k=k;
  $('#hubSide').innerHTML=`<div class="card grid" style="gap:6px"><div class="row between"><h3>Pulse moral Serdik</h3><span class="small muted">40 pesan terakhir</span></div>${V.gauge(moral,'kanal angkatan & provinsi')}</div>
   <div class="card grid" style="gap:8px"><div class="row between"><h3>Online · ${esc(isField()?me.region.prov:USER.provs?USER.title:'Satgas')}</h3><span class="small muted">klik untuk DM</span></div><div class="online">${online.map(s=>`<div class="avatar" data-dm="${s.idx}" style="background:${CLHEX[s.dom]}" data-tt="${esc(s.name)} · ${esc(s.region.name)} · ${STAT[s.st][0]}">${esc(initials(s.name))}<span class="sdot" style="background:${STAT[s.st][1]}"></span></div>`).join('')}</div></div>
   <div class="card grid" style="gap:8px"><div class="row between"><h3>Bantuan terbuka</h3><span class="pill ${openHelp.length?'warn':'ok'}">${openHelp.length}</span></div>${openHelp.slice(0,4).map(a=>`<div class="fi" data-hubhelp="${a.id}"><span class="sdot" style="background:${CLHEX[a.need]};margin-top:5px"></span><span>${esc(a.s.name)} · kluster ${a.need}<br><span class="muted" style="font-size:.7rem">${esc(a.s.region.name)} · ${Math.round(Math.hypot(a.s.cx-me.cx,a.s.cz-me.cz)*11)} km</span></span><span></span></div>`).join('')||'<span class="small muted">Tidak ada permintaan terbuka.</span>'}</div>`;
}
$('#hubCh').onclick=e=>{const b=e.target.closest('[data-ch]');if(!b)return;hub.ch=b.dataset.ch;renderHub(true);$('#hubIn').focus();};
$('#pane-hub').addEventListener('click',e=>{
  const r=e.target.closest('[data-react]');if(r){const[id,l,ch]=r.dataset.react.split('|');const m=hubList(ch).find(x=>String(x.id)===id);if(m){if(m.myR.has(l)){m.myR.delete(l);m.reacts[l]--;}else{m.myR.add(l);m.reacts[l]=(m.reacts[l]||0)+1;if(isField()&&m.from&&m.from!==me&&!m.from.isStaff)addEdge(me,m.from,'berbagi',.2);}hub.lastLen=-1;renderHub();}return;}
  const p=e.target.closest('[data-poll]');if(p){const[id,i,ch]=p.dataset.poll.split('|');const m=hubList(ch).find(x=>String(x.id)===id);if(m&&m.poll.my!==+i){if(m.poll.my>=0)m.poll.opts[m.poll.my].v--;m.poll.my=+i;m.poll.opts[+i].v++;hub.lastLen=-1;renderHub();toast('Suara tercatat');}return;}
  const h=e.target.closest('[data-helpme]');if(h&&isField()){const a=sim.alerts.find(x=>x.id===h.dataset.helpme);if(a&&a.state==='open'){assignHelper(a,me);hubMsg('bantuan',me,`Saya bantu ${a.s.name} di ${a.s.region.name}.`);toast('Anda berangkat membantu');hub.lastLen=-1;renderHub(true);}return;}
  const d=e.target.closest('[data-dm]');if(d){const k='dm:'+d.dataset.dm;hub.dms[k]=hub.dms[k]||[];hub.ch=k;renderHub(true);$('#hubIn').focus();return;}
  const hh=e.target.closest('[data-hubhelp]');if(hh){const a=sim.alerts.find(x=>x.id===hh.dataset.hubhelp);hub.ch='bantuan';renderHub(true);return;}
});
$('#hubForm').onsubmit=e=>{e.preventDefault();const v=$('#hubIn').value.trim();if(!v)return;$('#hubIn').value='';const ch=hub.ch;
  if(ch==='posko'&&!can('announce')){toast('Kanal pengumuman hanya untuk Komando dan Konten & Layanan');$('#hubIn').value=v;return;}
  if(ch==='tim'){myChat(v);}
  else{hubMsg(ch,me,v);const ppl=ch.startsWith('dm:')?[S[+ch.slice(3)]]:hubPeople(ch);const from=pick(ppl);
    if(from&&ch!=='posko'){const low=v.toLowerCase();const rep=/bantu|tolong/.test(low)?'Siap, saya bisa bantu. Kirim lokasinya ya.':/terima kasih|makasih/.test(low)?'Sama-sama, semangat terus!':/\?/.test(v)?'Setahu saya bisa lewat rujukan ke dinas terkait, nanti saya kirim kontaknya.':pick(['Setuju!','Mantap, terima kasih sudah berbagi.','Siap, dicatat.','Bagus idenya, nanti saya coba di desa saya.']);
      hub.pending.push({at:abs()+rint(2,6),ch,from,text:rep});if(isField()&&!from.isStaff)addEdge(me,from,ch.startsWith('dm:')?'referral':'berbagi',.3);}}
  hub.lastLen=-1;renderHub(true);};
$('#hubPoll').onclick=()=>{const ch=hub.ch==='tim'?'prov':hub.ch;if(ch.startsWith('dm:')){toast('Polling tersedia di kanal');return;}
  hubMsg(ch,me,'Polling: fokus kolaborasi minggu depan?',{kind:'poll',poll:{opts:[{t:'Kesehatan & posyandu',v:0},{t:'UMKM & ekonomi',v:0},{t:'Infrastruktur & rujukan',v:0}],my:-1}});
  if(hub.ch!==ch){hub.ch=ch;}hub.lastLen=-1;renderHub(true);toast('Polling dibuat, rekan mulai memberi suara');
  const m=hub.msgs[ch][hub.msgs[ch].length-1];let n=0;const iv=setInterval(()=>{m.poll.opts[Math.floor(Math.random()*3)].v++;if(state.tab==='hub'){hub.lastLen=-1;renderHub();}if(++n>14)clearInterval(iv);},700);};
$('#hubHelp').onclick=()=>openHelpRequest();

/* ================================================================
   ANALYTICS
   ================================================================ */
const AN={view:'ringkas',metric:'isu',color:'sent'};
$('#anSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;AN.view=b.dataset.v;$$('#anSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderAnalytics(true);};
const hist7=(()=>{const d=[];for(let k=6;k>=1;k--){const row=[];for(let h=7;h<=17;h++){const base=Math.max(.1,Math.sin(Math.PI*(h-6.5)/11))*(h===12?.5:1);row.push(Math.round(base*(38+hsh(k*31+h)*24)));}d.push(row);}return d;})();
const kendHist=(()=>Array.from({length:14},(_,i)=>Math.round(9+hsh(i*7.3)*8+(i===9?10:0))))();
const pHist=(()=>Array.from({length:14},(_,i)=>({n:160+Math.round(hsh(i*5.1)*60),p:.7+(hsh(i*3.7)-.5)*.1-(i===11?.13:0)})))();
function card2(cls,title,sub,inner){return `<div class="card grid ${cls}" style="gap:10px"><div class="row between"><h3>${title}</h3>${sub?`<span class="small muted">${sub}</span>`:''}</div>${inner}</div>`;}
function renderAnalytics(force){
  if(!force&&!['ringkas','sentimen'].includes(AN.view))return;
  if(!force&&renderAnalytics._t&&performance.now()-renderAnalytics._t<5000)return;renderAnalytics._t=performance.now();
  $$('#anSeg button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===AN.view));
  const f={ringkas:anRingkas,wilayah:anWilayah,penetrasi:anPenetrasi,aspirasi:anAspirasi,sentimen:anSentimen,spc:anSPC}[AN.view];
  const sy=window.scrollY;f(force);if(!force)window.scrollTo(0,sy);
}
const GROUPS=[['Kunjungan',['visit'],'#4A86C8'],['Aspirasi',['aspirasi'],'#C59A4A'],['Tindak lanjut',['rujukan','respons','monitor'],'#2A7F86'],['Kolaborasi',['bantuan','referral','rapat'],'#B0476A'],['Kendala',['kendala','eskalasi'],'#A3202C']];
function anRingkas(anim){
  const act=I.filter(active),fb=I.filter(i=>i.fb),sw=fb.length?fb.reduce((a,i)=>a+i.fb.s,0)/fb.length:0;
  const hrs=[];for(let h=7;h<=17;h++)hrs.push(h);
  const ser=k=>hrs.filter(h=>h<=Math.floor(sim.min/60)).map(h=>GROUPS.find(g=>g[0]===k)[1].reduce((a,t)=>a+((sim.hourly[t]||{})[h]||0),0));
  const kp=[['Aspirasi / hari',sim.history.slice(-10).concat([sim.today.aspirasi||0]),fmt(sim.today.aspirasi||0),'hari ini','#C59A4A'],['Kunjungan warga',ser('Kunjungan'),fmt(sim.today.visit||0),'hari ini','#4A86C8'],['Tingkat tindak lanjut',[62,64,63,66,68,67,70,pct(I.filter(i=>i.si>=3).length,I.length)],pct(I.filter(i=>i.si>=3).length,I.length)+'%','diteruskan atau ditangani','#2A7F86'],['Indeks suara warga',[.05,.08,.02,.1,.12,.09,sw],(sw>=0?'+':'')+sw.toFixed(2),`${fb.length} umpan balik`,sentCol(sw)]];
  // stacked area
  const W=640,H=230,L=34,B=28,Tp=10,X=i=>L+(W-L-10)*i/(hrs.length-1);const data=hrs.map(h=>GROUPS.map(g=>g[1].reduce((a,t)=>a+((sim.hourly[t]||{})[h]||0),0)));
  const mx=Math.max(10,...data.map(d=>d.reduce((a,b)=>a+b,0)));const Y=v=>H-B-(H-B-Tp)*v/mx;let base=hrs.map(()=>0),area='';
  GROUPS.forEach((g,j)=>{const top=base.map((b,i)=>b+data[i][j]);area+=`<path d="M${hrs.map((_,i)=>`${X(i)},${Y(top[i])}`).join(' L')} L${[...hrs.keys()].reverse().map(i=>`${X(i)},${Y(base[i])}`).join(' L')}Z" fill="${g[2]}" opacity=".85" data-tt="${g[0]}: ${data.reduce((a,d)=>a+d[j],0)} hari ini"${anim?` class="fadeIn" style="animation-delay:${j*90}ms"`:''}/>`;base=top;});
  let ax='';for(let i=0;i<=4;i++){const v=Math.round(mx*i/4);ax+=`<line x1="${L}" x2="${W-10}" y1="${Y(v)}" y2="${Y(v)}" stroke="#EDE4D2"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${v}</text>`;}
  hrs.forEach((h,i)=>ax+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle">${String(h).padStart(2,'0')}</text>`);
  ax+=`<line x1="${X(Math.min(10,(sim.min/60)-7))}" x2="${X(Math.min(10,(sim.min/60)-7))}" y1="${Tp}" y2="${H-B}" stroke="#7E1622" stroke-dasharray="3 3"/>`;
  // heatmap hour x day
  const today=hrs.map(h=>Object.values(sim.hourly).reduce((a,o)=>a+(o[h]||0),0));const tk=Math.max(30,...today.slice(0,Math.max(1,Math.floor(sim.min/60)-7)));const hm=[...hist7.map(r=>r.map(v=>Math.round(v/62*tk))),today];const hmx=Math.max(...hm.flat(),1);
  const HW=520,cw=(HW-70)/11,chh=26;let heat='';hm.forEach((row,r)=>{heat+=`<text x="62" y="${18+r*chh+16}" text-anchor="end">${r===6?'Hari ini':'H-'+(6-r)}</text>`;row.forEach((v,c)=>heat+=`<rect x="${70+c*cw}" y="${18+r*chh}" width="${cw-3}" height="${chh-3}" rx="4" fill="${V.seq(v/hmx)}" data-tt="${r===6?'Hari ini':'H-'+(6-r)} ${hrs[c]}:00 · ${v} aktivitas"${anim?` style="animation:fade .4s ${(r*11+c)*8}ms both"`:''}/>`);});
  hrs.forEach((h,c)=>heat+=`<text x="${70+c*cw+cw/2-1}" y="12" text-anchor="middle">${h}</text>`);
  // category donut + province bars
  const cc=CATS.map(c=>({l:c,v:act.filter(i=>i.cat===c).length,c:V.seq(.15+.85*CATS.indexOf(c)/10)})).sort((a,b)=>b.v-a.v);
  const pv=PROV.map(p=>{const rs=R.filter(r=>r.prov===p);return{p,act:act.filter(i=>i.region.prov===p).length,inc:rs.filter(r=>!r.complete).length,n:rs.length};});const pm=Math.max(...pv.map(x=>x.act),1);
  $('#anBody').innerHTML=`<div class="kpis" style="margin:0">${kp.map(k=>`<div class="kpi has-spark"><b>${k[2]}</b><span>${k[0]} · ${k[3]}</span>${V.spark(k[1],96,34,k[4])}</div>`).join('')}</div>
   <div class="an-grid">${card2('s7','Ritme kejadian hari ini','area bertumpuk per jam',`<svg class="vis" viewBox="0 0 ${W} ${H}">${ax}${area}</svg><div class="legend-row">${GROUPS.map(g=>`<span><i style="background:${g[2]}"></i>${g[0]}</span>`).join('')}</div>`)}
   ${card2('s5','Peta panas aktivitas','jam × 7 hari',`<svg class="vis" viewBox="0 0 ${HW} ${18+7*chh}">${heat}</svg>`)}
   ${card2('s5','Aspirasi aktif per kategori',`${act.length} aspirasi`,`<div class="row" style="flex-wrap:nowrap;gap:12px;align-items:center">${V.donut(cc,170,`<tspan x="85" dy="-2" class="t-strong" style="font-size:24px;font-family:Playfair Display,serif">${act.length}</tspan><tspan x="85" dy="18">aktif</tspan>`,anim)}<div class="legend-row" style="display:grid;gap:3px">${cc.slice(0,6).map(c=>`<span><i style="background:${c.c}"></i>${c.l} · <b>${c.v}</b></span>`).join('')}</div></div>`)}
   ${card2('s7','Provinsi: beban aspirasi vs tim belum lengkap','',`<div class="grid" style="gap:10px">${pv.map(x=>`<div class="barrow" style="grid-template-columns:120px 1fr 80px"><span>${x.p}</span><div style="display:grid;gap:3px"><div class="track"><i data-w="${Math.round(x.act/pm*100)}" style="background:var(--navy)"></i></div><div class="track" style="height:5px"><i data-w="${Math.round(x.inc/x.n*100)}" style="background:var(--maroon)"></i></div></div><span class="num small">${x.act} · ${x.inc} tim</span></div>`).join('')}<div class="legend-row"><span><i style="background:var(--navy)"></i>aspirasi aktif</span><span><i style="background:var(--maroon)"></i>% tim kurang kluster</span></div></div>`)}</div>`;
  animateBars($('#anBody'));
}
function anWilayah(anim){
  const mets={isu:['Isu aktif',r=>I.filter(i=>i.region===r&&active(i)).length],warga:['Warga terdampak',r=>I.filter(i=>i.region===r&&active(i)).reduce((a,i)=>a+i.aff,0)],need:['Indeks kebutuhan',r=>r.needTot],act:['Aktivitas hari ini',r=>r.actToday||0]};
  const cols={sent:['Sentimen warga',r=>{const f=I.filter(i=>i.region===r&&i.fb);return f.length?f.reduce((a,i)=>a+i.fb.s,0)/f.length:0;},v=>V.div(v*1.6)],tim:['Kelengkapan tim',r=>r.covN,v=>V.seq(v/4)],prio:['Rata-rata prioritas',r=>{const a=I.filter(i=>i.region===r&&active(i));return a.length?a.reduce((s,i)=>s+i.pr,0)/a.length:0;},v=>V.seq((v-40)/50)]};
  const m=mets[AN.metric],c=cols[AN.color];const W=900,H=420;
  const vals=R.map(m[1]),mx=Math.max(...vals,1),k=Math.min(W/100,H/36);
  const nodes=R.map((r,i)=>({r,v:vals[i],cv:c[1](r),rad:4+Math.sqrt(vals[i]/mx)*20,x:W/2+(r.x+1)*k,y:H/2+(r.z-1.8)*k,gx:W/2+(r.x+1)*k,gy:H/2+(r.z-1.8)*k}));
  if(window.d3){const fs=d3.forceSimulation(nodes).force('x',d3.forceX(n=>n.gx).strength(.25)).force('y',d3.forceY(n=>n.gy).strength(.25)).force('c',d3.forceCollide(n=>n.rad+1.2)).stop();for(let i=0;i<220;i++)fs.tick();}
  const circles=nodes.map((n,i)=>`<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.rad.toFixed(1)}" fill="${c[2](n.cv)}" stroke="#0F1D38" stroke-opacity=".25" data-rid="${n.r.id}" data-tt="${esc(n.r.name)} · ${m[0]}: ${fmt(n.v)} · ${c[0]}: ${typeof n.cv==='number'?(Math.abs(n.cv)<5?n.cv.toFixed(2):Math.round(n.cv)):n.cv}" style="cursor:pointer${anim?`;transform-box:fill-box;transform-origin:center;animation:pop .5s ${i*6}ms both`:''}"/>`).join('');
  const labels=nodes.filter(n=>n.rad>15).map(n=>`<text x="${n.x}" y="${n.y+3}" text-anchor="middle" style="fill:#fff;font-size:9px;font-weight:600;pointer-events:none">${esc(n.r.name.replace(/^(Kab\.|Kota) /,'').slice(0,9))}</text>`).join('');
  const top=[...nodes].sort((a,b)=>b.v-a.v).slice(0,8);
  // bubble scatter need vs coverage
  const SW=440,SH=300,sl=40,sb=34,sx=v=>sl+(SW-sl-10)*(v-1.4)/2.6,syy=v=>SH-sb-(SH-sb-12)*v/4;const pmx=Math.max(...R.map(r=>r.pop));
  const bub=R.map(r=>`<circle cx="${sx(r.needTot).toFixed(1)}" cy="${(syy(r.covN)+(hsh(r.id)-.5)*18).toFixed(1)}" r="${(3+Math.sqrt(r.pop/pmx)*12).toFixed(1)}" fill="${r.complete?'#13274A':'#7E1622'}" fill-opacity=".45" stroke="${r.complete?'#13274A':'#7E1622'}" data-rid="${r.id}" data-tt="${esc(r.name)} · kebutuhan ${r.needTot.toFixed(2)} · ${r.covN}/4 kluster" style="cursor:pointer"/>`).join('');
  let bax='';for(let v=0;v<=4;v++)bax+=`<line x1="${sl}" x2="${SW-10}" y1="${syy(v)}" y2="${syy(v)}" stroke="#EDE4D2"/><text x="${sl-6}" y="${syy(v)+4}" text-anchor="end">${v}</text>`;
  bax+=`<text x="${(SW+sl)/2}" y="${SH-6}" text-anchor="middle">indeks kebutuhan wilayah →</text><text transform="translate(12,${(SH-sb)/2}) rotate(-90)" text-anchor="middle">kluster tim terpenuhi</text>`;
  // correlation
  const MS=[['Isu',r=>I.filter(i=>i.region===r&&active(i)).length],['Kebutuhan',r=>r.needTot],['Tim',r=>r.covN],['Akses',r=>r.access],['Aktivitas',r=>r.actToday||0],['Sentimen',cols.sent[1]]];
  const M=MS.map(x=>R.map(x[1]));const corr=(a,b)=>{const n=a.length,ma=a.reduce((s,x)=>s+x,0)/n,mb=b.reduce((s,x)=>s+x,0)/n;let sab=0,sa=0,sb2=0;for(let i=0;i<n;i++){sab+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sb2+=(b[i]-mb)**2;}return sa&&sb2?sab/Math.sqrt(sa*sb2):0;};
  const cs=44;let cm='';MS.forEach((a,i)=>{cm+=`<text x="76" y="${30+i*cs+cs/2+4}" text-anchor="end">${a[0]}</text><text x="${84+i*cs+cs/2}" y="22" text-anchor="middle">${a[0].slice(0,5)}</text>`;MS.forEach((b,j)=>{const v=corr(M[i],M[j]);cm+=`<rect x="${84+j*cs}" y="${30+i*cs}" width="${cs-3}" height="${cs-3}" rx="6" fill="${V.div(v)}" data-tt="${a[0]} × ${b[0]}: r = ${v.toFixed(2)}"/><text x="${84+j*cs+cs/2-1}" y="${30+i*cs+cs/2+3}" text-anchor="middle" style="fill:${Math.abs(v)>.5?'#fff':'#0F1D38'};font-size:10px">${v.toFixed(2)}</text>`;});});
  $('#anBody').innerHTML=`<div class="an-grid">${card2('s8','Kartogram 119 kabupaten/kota','ukuran = '+m[0].toLowerCase()+' · warna = '+c[0].toLowerCase(),`<div class="row"><div class="seg" id="anMet">${Object.entries(mets).map(([k,v])=>`<button data-k="${k}" aria-pressed="${k===AN.metric}">${v[0]}</button>`).join('')}</div><div class="seg" id="anCol">${Object.entries(cols).map(([k,v])=>`<button data-k="${k}" aria-pressed="${k===AN.color}">${v[0]}</button>`).join('')}</div></div><svg class="vis" viewBox="0 0 ${W} ${H}" id="dorling">${circles}${labels}</svg><div class="legend-row"><span>${AN.color==='sent'?'<i style="background:#7E1622"></i>negatif <i style="background:#F1E8D6"></i>netral <i style="background:#2E7A52"></i>positif':'<i style="background:#F4EAD2"></i>rendah <i style="background:#C59A4A"></i> <i style="background:#13274A"></i>tinggi'}</span><span>Klik lingkaran untuk membuka wilayah di Operasi.</span></div>`)}
   ${card2('s4','Tertinggi: '+m[0].toLowerCase(),'',`<div class="grid" style="gap:8px">${top.map((n,i)=>`<div class="barrow" style="grid-template-columns:22px 1fr 54px;cursor:pointer" data-rid="${n.r.id}"><b class="num">${i+1}</b><div><div class="small" style="font-weight:600">${esc(n.r.name)}</div><div class="track" style="height:6px;margin-top:3px"><i data-w="${Math.round(n.v/top[0].v*100)}" style="background:${c[2](n.cv)}"></i></div></div><span class="num small">${fmt(n.v)}</span></div>`).join('')}</div>`)}
   ${card2('s6','Kebutuhan vs kelengkapan tim','ukuran = populasi · marun = tim belum lengkap',`<svg class="vis" viewBox="0 0 ${SW} ${SH}">${bax}${bub}</svg>`)}
   ${card2('s6','Korelasi antar-indikator wilayah','Pearson r, 119 wilayah',`<svg class="vis" viewBox="0 0 ${84+MS.length*cs+6} ${36+MS.length*cs}" style="max-width:420px;margin:auto">${cm}</svg>`)}</div>`;
  $('#anMet').onclick=e=>{const b=e.target.closest('button');if(b){AN.metric=b.dataset.k;anWilayah(true);}};
  $('#anCol').onclick=e=>{const b=e.target.closest('button');if(b){AN.color=b.dataset.k;anWilayah(true);}};
  animateBars($('#anBody'));
}
function anPenetrasi(anim){
  // 2D map: Voronoi cell per regency, masked to a coastline-like blob of circles around the regency points
  const W=900,H=310,k=96,px=lon=>(lon-105.55)*k;
  const P=R.map(r=>[px(r.lon),(-(r.lat)-5.55)*k+12]);
  let cells='',mask='',marks='';
  if(window.d3){const vor=d3.Delaunay.from(P).voronoi([0,0,W,H]);
    R.forEach((r,i)=>{const c=IRCAT[irCat(r.ir)];cells+=`<path d="${vor.renderCell(i)}" fill="${irColor(r.ir)}" stroke="#fff" stroke-width=".8" data-rid="${r.id}" data-tt="${esc(r.name)} · IR ${r.ir}% · ${c.n} · intensitas ${Math.round(irIntensity(r.ir)*100)}% · ${r.team.length} Serdik" style="cursor:pointer${anim?`;animation:fade .4s ${i*5}ms both`:''}"/>`;});}
  R.forEach((r,i)=>{mask+=`<circle cx="${P[i][0].toFixed(1)}" cy="${P[i][1].toFixed(1)}" r="${r.name==='Kab. Kepulauan Seribu'?12:30}" fill="#fff"/>`;
    const n=r.team.length;r.team.forEach((s,j)=>{const a=j/Math.max(n,1)*Math.PI*2-Math.PI/2,rad=n>1?7:0,x=P[i][0]+Math.cos(a)*rad,y=P[i][1]+Math.sin(a)*rad,t=TIER[s.tier];
      const tt=`data-tt="${esc(s.name)} · ${s.sex==='P'?'Perempuan':'Laki-laki'} · ${t.n} · ${esc(r.name)}"`;
      marks+=s.sex==='L'?`<path d="M${x.toFixed(1)},${(y-5).toFixed(1)} L${(x+4.6).toFixed(1)},${(y+3.4).toFixed(1)} L${(x-4.6).toFixed(1)},${(y+3.4).toFixed(1)}Z" fill="${t.fill}" stroke="${t.stroke}" stroke-width="1.2" ${tt}/>`
        :`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${t.fill}" stroke="${t.stroke}" stroke-width="1.2" ${tt}/>`;});});
  // stats per category
  const all=S.filter(s=>s.region),st=IRKEYS.map(key=>{const rs=R.filter(r=>irCat(r.ir)===key),ss=all.filter(s=>irCat(s.region.ir)===key);
    const tc={sup:0,nor:0,inf:0};ss.forEach(s=>tc[s.tier]++);
    return{key,c:IRCAT[key],n:rs.length,pr:rs.length/R.length*100,avg:rs.length?rs.reduce((a,r)=>a+r.ir,0)/rs.length:0,ns:ss.length,ps:all.length?ss.length/all.length*100:0,tc,dens:rs.length?ss.length/rs.length:0,
      noSup:rs.filter(r=>r.team.length&&!r.team.some(s=>s.tier==='sup')).length};});
  const p1=v=>v.toFixed(1).replace('.',',');
  const statCard=x=>{const sw=mixHex(x.c.light,x.c.dark,.65),tot=x.ns||1;
    return `<div style="background:var(--bg,#FBF8F1);border:1px solid var(--line,#EDE4D2);border-radius:12px;padding:12px 14px;display:grid;gap:6px">
      <div class="row" style="gap:6px;align-items:center"><span style="width:12px;height:12px;border-radius:3px;background:${sw}"></span><b class="small">${x.c.n}</b><span class="small muted">IR ${x.c.lo}–${x.c.hi}%</span></div>
      <div class="row between" style="align-items:baseline"><b class="num" style="font-size:1.6rem">${p1(x.pr)}%</b><span class="small muted">${x.n} kab/kota · rerata IR ${p1(x.avg)}%</span></div>
      <div class="small muted">${x.ns} Serdik (${p1(x.ps)}% dari total) · ${p1(x.dens)} Serdik/wilayah</div>
      <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:#EDE4D2">${['sup','nor','inf'].map(t=>`<i style="width:${x.tc[t]/tot*100}%;background:${TIER[t].fill};${t==='nor'?'box-shadow:inset 0 0 0 1px #13274A':''}" data-tt="${TIER[t].n}: ${x.tc[t]} (${p1(x.tc[t]/tot*100)}%)"></i>`).join('')}</div>
      <div class="small muted">Superior ${p1(x.tc.sup/tot*100)}% · Normal ${p1(x.tc.nor/tot*100)}% · Inferior ${p1(x.tc.inf/tot*100)}%</div></div>`;};
  // gradient legend
  const legend=`<div style="display:grid;gap:4px"><div style="height:14px;border-radius:4px;background:${irGradientCSS()}"></div>
    <div style="position:relative;height:14px" class="small muted"><span style="position:absolute;left:0">0%</span><span style="position:absolute;left:33.5%;transform:translateX(-50%)">33%</span><span style="position:absolute;left:66.5%;transform:translateX(-50%)">66%</span><span style="position:absolute;right:0">100%</span></div>
    <div class="legend-row" style="justify-content:space-between"><span>Aman: hijau makin pekat = makin aman</span><span>Tidak terlalu resisten</span><span>Resisten: merah makin pekat = makin resisten</span></div>
    <div class="legend-row"><span><svg width="12" height="11"><path d="M6,1 L11,10 L1,10Z" fill="#13274A"/></svg> laki-laki</span><span><svg width="11" height="11"><circle cx="5.5" cy="5.5" r="4.5" fill="#13274A"/></svg> perempuan</span>${['sup','nor','inf'].map(t=>`<span><i style="background:${TIER[t].fill};border:1px solid #13274A"></i>${TIER[t].n} (${TIER[t].d.toLowerCase()})</span>`).join('')}</div></div>`;
  // insights
  const [sa,ss2,sr]=st,worst=[...R].sort((a,b)=>b.ir-a.ir).slice(0,8);
  const ins=[`${p1(sr.pr)}% kab/kota masuk kategori resisten, tetapi hanya ${p1(sr.ps)}% Serdik ditempatkan di sana.`,
    `Kepadatan penempatan: ${p1(sa.dens)} Serdik/wilayah di wilayah aman vs ${p1(sr.dens)} di wilayah resisten.`,
    `${sr.noSup} wilayah resisten belum memiliki Serdik Superior di timnya.`];
  $('#anBody').innerHTML=`<div class="an-grid">${card2('s8','Peta penetrasi Serdik & resistensi wilayah','warna = kategori · kepekatan = IR (%)',`<svg class="vis" viewBox="0 0 ${W} ${H}"><defs><mask id="javaMask">${mask}</mask></defs><g mask="url(#javaMask)">${cells}</g><g>${marks}</g></svg>${legend}`)}
   ${card2('s4','Persentase per kategori','dari 119 kab/kota',`<div class="grid" style="gap:10px">${st.map(statCard).join('')}</div>`)}
   ${card2('s6','Temuan','dihitung langsung dari data',`<div class="grid" style="gap:8px">${ins.map(t=>`<div class="insight"><span class="ico"><svg class="ic"><use href="#i-alert"/></svg></span><span>${t}</span></div>`).join('')}</div>`)}
   ${card2('s6','IR tertinggi','klik untuk membuka di Operasi',`<div class="grid" style="gap:8px">${worst.map((r,i)=>`<div class="barrow" style="grid-template-columns:22px 1fr 140px;cursor:pointer" data-rid="${r.id}"><b class="num">${i+1}</b><div><div class="small" style="font-weight:600">${esc(r.name)}</div><div class="track" style="height:6px;margin-top:3px"><i data-w="${r.ir}" style="background:${irColor(r.ir)}"></i></div></div><span class="num small">${r.ir}% · ${r.team.length} Serdik</span></div>`).join('')}</div>`)}</div>`;
  animateBars($('#anBody'));
}
function anAspirasi(anim){
  const act=I.filter(active);
  // treemap
  const W=640,H=360;let tm='';
  if(window.d3){const root=d3.hierarchy({children:CATS.map(c=>({name:c,children:PROV.map(p=>({name:p,cat:c,value:act.filter(i=>i.cat===c&&i.region.prov===p).length})).filter(x=>x.value)})).filter(x=>x.children.length)}).sum(d=>d.value||0).sort((a,b)=>b.value-a.value);
    d3.treemap().size([W,H]).paddingInner(2).paddingTop(18).round(true)(root);
    root.children.forEach((c,ci)=>{tm+=`<rect x="${c.x0}" y="${c.y0}" width="${c.x1-c.x0}" height="${c.y1-c.y0}" fill="#F5EEDF" rx="4"/><text x="${c.x0+5}" y="${c.y0+13}" class="t-strong" style="font-size:10.5px">${c.x1-c.x0>70?esc(c.data.name)+' · '+c.value:''}</text>`;
      c.children.forEach((l,li)=>{const w=l.x1-l.x0,h=l.y1-l.y0;tm+=`<rect x="${l.x0}" y="${l.y0}" width="${w}" height="${h}" rx="3" fill="${PROVHEX[l.data.name]}" fill-opacity="${.55+.4*(l.value/c.value)}" data-tt="${esc(c.data.name)} · ${l.data.name}: ${l.value}"${anim?` style="animation:fade .5s ${(ci*6+li)*20}ms both"`:''}/>${w>46&&h>20?`<text x="${l.x0+4}" y="${l.y0+13}" style="fill:#fff;font-size:9.5px">${esc(l.data.name.replace('Jawa ','J. ').replace('DI ',''))}</text>`:''}`;});});}
  // alluvial flow
  const stages=ST.map((s,i)=>({l:s[2],n:I.filter(x=>x.si>=i).length,here:I.filter(x=>x.si===i).length}));const FW=900,FH=260,top=20,colw=26,gap=(FW-40-colw)/(stages.length-1),mxn=stages[0].n,sc=(FH-60)/mxn;let fl='';
  stages.forEach((s,i)=>{const x=20+i*gap,h=s.n*sc,y=top+(FH-60-h)/2;s.x=x;s.y=y;s.h=h;});
  stages.forEach((s,i)=>{if(i<stages.length-1){const t=stages[i+1],x1=s.x+colw,x2=t.x;const h2=t.h;
      fl+=`<path d="M${x1},${s.y} C${(x1+x2)/2},${s.y} ${(x1+x2)/2},${t.y} ${x2},${t.y} L${x2},${t.y+h2} C${(x1+x2)/2},${t.y+h2} ${(x1+x2)/2},${s.y+h2} ${x1},${s.y+h2}Z" fill="#C59A4A" opacity=".28" data-tt="${s.l} → ${t.l}: ${t.n} aspirasi berlanjut"${anim?` style="animation:fade .6s ${i*120}ms both"`:''}/>`;
      const drop=s.n-t.n;if(drop>0)fl+=`<path d="M${x1},${s.y+h2} C${x1+30},${s.y+h2} ${x1+20},${s.y+s.h+8} ${x1+40},${s.y+s.h+18}" stroke="#7E1622" stroke-opacity=".5" stroke-width="${Math.max(1,(s.h-h2))}" fill="none" data-tt="${drop} aspirasi saat ini di tahap ${s.l}"/>`;}
    fl+=`<rect x="${s.x}" y="${s.y}" width="${colw}" height="${s.h}" rx="4" fill="${i>=6?'#2E7A52':i>=3?'#13274A':'#5E6577'}" data-tt="${s.l}: ${s.here} saat ini · ${s.n} mencapai tahap ini"${anim?` class="growY" style="animation-delay:${i*100}ms"`:''}/><text x="${s.x+colw/2}" y="${FH-24}" text-anchor="middle" class="t-strong">${s.l}</text><text x="${s.x+colw/2}" y="${FH-10}" text-anchor="middle">${s.n}</text>`;});
  // aging histogram
  const bins=[0,3,7,14,21,30,46],bc=bins.slice(0,-1).map((b,i)=>act.filter(x=>x.days>=b&&x.days<bins[i+1]).length);const bm=Math.max(...bc,1);const AW=420,AH=200;
  let ag='';bc.forEach((v,i)=>{const w=(AW-60)/bc.length,h=(AH-50)*v/bm,x=40+i*w;ag+=`<rect x="${x+3}" y="${AH-30-h}" width="${w-6}" height="${h}" rx="4" fill="${bins[i]>=14?'#7E1622':bins[i]>=7?'#C59A4A':'#13274A'}"${anim?` class="growY" style="animation-delay:${i*70}ms"`:''} data-tt="${bins[i]}–${bins[i+1]-1} hari: ${v}"/><text x="${x+w/2}" y="${AH-14}" text-anchor="middle">${bins[i]}–${bins[i+1]-1}h</text><text x="${x+w/2}" y="${AH-34-h}" text-anchor="middle" class="t-strong">${v}</text>`;});
  ag+=`<line x1="${40+2*(AW-60)/bc.length}" x2="${40+2*(AW-60)/bc.length}" y1="10" y2="${AH-30}" stroke="#7E1622" stroke-dasharray="4 3"/><text x="${44+2*(AW-60)/bc.length}" y="20" style="fill:#7E1622">SLA 7 hari</text>`;
  const au=AUTH.map((a,i)=>({l:a,v:act.filter(x=>x.auth===i).length,c:['#2E7A52','#C59A4A','#7E1622'][i]}));
  $('#anBody').innerHTML=`<div class="an-grid">${card2('s7','Treemap aspirasi aktif','kategori → provinsi',`<svg class="vis" viewBox="0 0 ${W} ${H}">${tm}</svg><div class="legend-row">${PROV.map(p=>`<span><i style="background:${PROVHEX[p]}"></i>${p}</span>`).join('')}</div>`)}
   <div class="grid s5" style="gap:12px">${card2('','Kewenangan penanganan','',`<div class="row" style="flex-wrap:nowrap;gap:12px;align-items:center">${V.donut(au,150,`<tspan x="75" dy="4" class="t-strong" style="font-size:20px;font-family:Playfair Display,serif">${pct(au[2].v,act.length)}%</tspan><tspan x="75" dy="16">dirujuk</tspan>`,anim)}<div class="legend-row" style="display:grid;gap:4px">${au.map(a=>`<span><i style="background:${a.c}"></i>${a.l} · <b>${a.v}</b></span>`).join('')}</div></div>`)}
   ${card2('','Umur aspirasi aktif','hari sejak dicatat',`<svg class="vis" viewBox="0 0 ${AW} ${AH}">${ag}</svg>`)}</div>
   ${card2('s12','Alur status aspirasi','lebar pita = jumlah yang mencapai tahap berikutnya · garis marun = berhenti di tahap itu',`<div class="svgbox"><svg class="vis" viewBox="0 0 ${FW} ${FH}" style="min-width:700px">${fl}</svg></div>`)}</div>`;
}
function anSentimen(anim){
  const fb=I.filter(i=>i.fb),sw=fb.length?fb.reduce((a,i)=>a+i.fb.s,0)/fb.length:0;
  const chat=[...hub.msgs.angkatan,...hub.msgs.prov,...hub.msgs.praktik];const ss=chat.length?chat.reduce((a,m)=>a+m.sent,0)/chat.length:0;
  // trend per day (synthetic history + today)
  const days=14,tw=Array.from({length:days},(_,i)=>i<days-1?.02+(hsh(i*2.2)-.5)*.22+(i>9?.06:0):sw),ts=Array.from({length:days},(_,i)=>i<days-1?.18+(hsh(i*4.1)-.5)*.2-(i===8?.18:0):ss);
  const W=620,H=220,L=36,B=26,X=i=>L+(W-L-12)*i/(days-1),Y=v=>12+(H-B-12)*(1-(v+.6)/1.2);
  const line=(arr,col)=>`<polyline points="${arr.map((v,i)=>`${X(i)},${Y(v)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="2.4" pathLength="1"${anim?' class="draw"':''}/>${arr.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="3.2" fill="${col}" data-tt="H${sim.day-days+1+i}: ${v.toFixed(2)}"/>`).join('')}`;
  let ax=`<rect x="${L}" y="${Y(.6)}" width="${W-L-12}" height="${Y(.15)-Y(.6)}" fill="#2E7A52" opacity=".06"/><rect x="${L}" y="${Y(-.15)}" width="${W-L-12}" height="${Y(-.6)-Y(-.15)}" fill="#7E1622" opacity=".06"/>`;
  [-.5,0,.5].forEach(v=>ax+=`<line x1="${L}" x2="${W-12}" y1="${Y(v)}" y2="${Y(v)}" stroke="#E2D6BE"${v===0?'':' stroke-dasharray="3 3"'}/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end">${v}</text>`);
  for(let i=0;i<days;i+=2)ax+=`<text x="${X(i)}" y="${H-6}" text-anchor="middle">H${sim.day-days+1+i}</text>`;
  // heat prov x cat
  const hc=CATS.slice(0,10);const cw=46,ch=30;let hm='';PROV.forEach((p,r)=>{hm+=`<text x="102" y="${56+r*ch+19}" text-anchor="end">${p.replace('DI ','')}</text>`;hc.forEach((c,j)=>{const f=fb.filter(i=>i.region.prov===p&&i.cat===c);const v=f.length?f.reduce((a,i)=>a+i.fb.s,0)/f.length:null;
    hm+=`<rect x="${110+j*cw}" y="${56+r*ch}" width="${cw-3}" height="${ch-3}" rx="5" fill="${v==null?'#F3EDE1':V.div(v*1.6)}" data-tt="${p} · ${c}: ${v==null?'belum ada umpan balik':v.toFixed(2)+' ('+f.length+')'}"${anim?` style="animation:fade .4s ${(r*10+j)*10}ms both"`:''}/>`;});});
  hc.forEach((c,j)=>hm+=`<text transform="translate(${110+j*cw+cw/2-6},50) rotate(-35)" style="font-size:9.5px">${c.split(' ')[0]}</text>`);
  // words
  const wc={};[...fb.map(i=>i.fb.text),...chat.map(m=>m.text)].forEach(t=>{const r=sentiment(t);r.toks.forEach((w,i)=>{if(r.mark[i]&&!NEGATORS.has(w)){wc[w]=wc[w]||{p:0,n:0};wc[w][r.mark[i]==='p'?'p':'n']++;}});});
  const pw=Object.entries(wc).filter(([,v])=>v.p).sort((a,b)=>b[1].p-a[1].p).slice(0,7),nw=Object.entries(wc).filter(([,v])=>v.n).sort((a,b)=>b[1].n-a[1].n).slice(0,7);const wm=Math.max(1,...pw.map(x=>x[1].p),...nw.map(x=>x[1].n));
  const dv=`<div class="row" style="flex-wrap:nowrap;gap:0;align-items:flex-start"><div style="flex:1;display:grid;gap:5px">${nw.map(([w,v])=>`<div style="display:grid;grid-template-columns:1fr 104px;gap:6px;align-items:center;font-size:.8rem"><div style="display:flex;justify-content:flex-end"><i class="growX" style="display:block;height:12px;border-radius:3px;background:#7E1622;width:${v.n/wm*100}%;transform-origin:right"></i></div><span>${w} ${v.n}</span></div>`).join('')}</div><div style="width:1px;align-self:stretch;background:var(--line)"></div><div style="flex:1;display:grid;gap:5px">${pw.map(([w,v])=>`<div style="display:grid;grid-template-columns:104px 1fr;gap:6px;align-items:center;font-size:.8rem"><span style="text-align:right">${w} ${v.p}</span><i class="growX" style="display:block;height:12px;border-radius:3px;background:#2E7A52;width:${v.p/wm*100}%"></i></div>`).join('')}</div></div>`;
  const recent=[...fb].sort((a,b)=>b.fb.abs-a.fb.abs).slice(0,6);
  $('#anBody').innerHTML=`<div class="an-grid">
   ${card2('s3','Suara warga','',V.gauge(sw,'umpan balik warga',`${fb.length} umpan balik setelah tindak lanjut`))}
   ${card2('s3','Moral Serdik','',V.gauge(ss,'pesan Hub Serdik',`${chat.length} pesan kanal terbuka`))}
   ${card2('s6','Tren sentimen 14 hari','',`<svg class="vis" viewBox="0 0 ${W} ${H}">${ax}${line(tw,'#13274A')}${line(ts,'#C59A4A')}</svg><div class="legend-row"><span><i style="background:#13274A"></i>Suara warga</span><span><i style="background:#C59A4A"></i>Moral Serdik</span></div>`)}
   ${card2('s7','Sentimen warga per provinsi × kategori','',`<div class="svgbox"><svg class="vis" viewBox="0 0 ${112+hc.length*cw} ${60+PROV.length*ch}" style="min-width:520px">${hm}</svg></div>`)}
   ${card2('s5','Kata pemicu sentimen','negatif ← → positif',dv)}
   ${card2('s6','Uji sentimen','ketik kalimat dari warga atau rekan',`<div class="senttest"><input type="text" id="stIn" value="Terima kasih, tapi jalannya belum diperbaiki dan warga kecewa." aria-label="Kalimat uji sentimen"><div class="out" id="stOut"></div></div>`)}
   ${card2('s6','Umpan balik warga terbaru','kata disorot otomatis',`<div class="grid" style="gap:8px">${recent.map(i=>`<div class="fi" data-iid="${i.id}"><span class="sent" style="background:${sentCol(i.fb.s)};margin-top:6px"></span><span>“${hiSent(i.fb.text)}”<br><span class="muted" style="font-size:.7rem">${esc(i.region.name)} · ${i.id} · ${esc(i.cat)}</span></span><b class="num small" style="color:${sentCol(i.fb.s)}">${i.fb.s>=0?'+':''}${i.fb.s.toFixed(2)}</b></div>`).join('')}</div>`)}</div>`;
  const upd=()=>{const t=$('#stIn').value;const r=sentiment(t);$('#stOut').innerHTML=`${hiSent(t)}<div class="row" style="margin-top:6px"><span class="pill" style="color:${sentCol(r.score)};border-color:${sentCol(r.score)}">skor ${r.score>=0?'+':''}${r.score.toFixed(2)} · ${r.score>.15?'positif':r.score<-.15?'negatif':'netral'}</span><span class="small muted">${r.n} kata bermuatan · negasi seperti “belum”, “tidak” membalik makna</span></div>`;};
  $('#stIn').oninput=upd;upd();
  $('#anBody').querySelectorAll('[data-iid]').forEach(x=>x.onclick=()=>openIssue(I.find(i=>i.id===x.dataset.iid)));
}
function controlChart(vals,{type,ns,title,unit}){
  const n=vals.length,W=640,H=250,L=40,B=30,Tp=14;let cl,ucl,lcl;
  if(type==='c'){cl=vals.slice(0,-1).reduce((a,b)=>a+b,0)/(n-1);ucl=cl+3*Math.sqrt(cl);lcl=Math.max(0,cl-3*Math.sqrt(cl));}
  else{const pb=vals.slice(0,-1).reduce((a,b,i)=>a+b*ns[i],0)/ns.slice(0,-1).reduce((a,b)=>a+b,0);cl=pb;const nb=ns.reduce((a,b)=>a+b,0)/n;ucl=pb+3*Math.sqrt(pb*(1-pb)/nb);lcl=pb-3*Math.sqrt(pb*(1-pb)/nb);}
  const mx=Math.max(ucl*1.15,...vals),mn=Math.min(lcl*.85,...vals),X=i=>L+(W-L-14)*i/(n-1),Y=v=>Tp+(H-B-Tp)*(1-(v-mn)/(mx-mn));
  const fmtv=v=>type==='p'?Math.round(v*100)+'%':v.toFixed(1);
  let s=`<rect x="${L}" y="${Y(ucl)}" width="${W-L-14}" height="${Y(lcl)-Y(ucl)}" fill="#13274A" opacity=".05"/>`;
  [['UCL',ucl,'#7E1622'],['CL',cl,'#13274A'],['LCL',lcl,'#7E1622']].forEach(([l,v,c])=>s+=`<line x1="${L}" x2="${W-14}" y1="${Y(v)}" y2="${Y(v)}" stroke="${c}" stroke-dasharray="${l==='CL'?'':'5 4'}"/><text x="${W-14}" y="${Y(v)-4}" text-anchor="end" style="fill:${c}">${l} ${fmtv(v)}</text>`);
  s+=`<polyline points="${vals.map((v,i)=>`${X(i)},${Y(v)}`).join(' ')}" fill="none" stroke="#5E6577" stroke-width="1.6" pathLength="1" class="draw"/>`;
  const out=[];vals.forEach((v,i)=>{const o=v>ucl||v<lcl;if(o)out.push(i);s+=`<circle cx="${X(i)}" cy="${Y(v)}" r="${o?6:4}" fill="${o?'#7E1622':i===n-1?'#C59A4A':'#13274A'}" stroke="#fff" stroke-width="1.5" data-tt="H${sim.day-n+1+i}${i===n-1?' (hari ini)':''}: ${fmtv(v)}${o?' · di luar batas kendali':''}" style="animation:pop .4s ${i*50}ms both;transform-box:fill-box;transform-origin:center"/>`;});
  for(let i=0;i<n;i+=2)s+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle">H${sim.day-n+1+i}</text>`;
  let run=0,maxRun=0;vals.forEach(v=>{run=v>cl?run+1:0;maxRun=Math.max(maxRun,run);});
  return{svg:`<svg class="vis" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">${s}</svg>`,out,maxRun,cl,ucl,lcl};
}
function anSPC(){
  const kv=[...kendHist,sim.today.kendala||0];const c1=controlChart(kv,{type:'c',title:'c-chart kendala'});
  const todayN=Math.max(1,I.filter(i=>i.createdAbs>=sim.day*1440).length),todayP=I.filter(i=>i.createdAbs>=sim.day*1440&&i.si>=2).length/todayN;
  const useToday=todayN>=20;const pv=[...pHist.map(x=>x.p),...(useToday?[todayP]:[])],ns=[...pHist.map(x=>x.n),...(useToday?[todayN]:[])];const c2=controlChart(pv,{type:'p',ns,title:'p-chart validasi'});
  const rules=(c,name)=>`<div class="insight"><span class="ico"><svg class="ic"><use href="#i-${c.out.length?'alert':'check'}"/></svg></span><span><b>${name}</b>: ${c.out.length?`${c.out.length} titik di luar batas kendali (${c.out.map(i=>'H'+(sim.day-kv.length+1+i)).join(', ')}). Telusuri penyebab khusus.`:'semua titik dalam batas kendali.'}${c.maxRun>=7?' Ada 7+ titik berturut-turut di atas rata-rata: indikasi pergeseran proses.':''}</span></div>`;
  $('#anBody').innerHTML=`<div class="an-grid">${card2('s8','c-chart: jumlah kendala lapangan per hari','statistical process control',c1.svg)}
   ${card2('s4','Bacaan cepat','',`<div class="grid" style="gap:10px">${rules(c1,'Kendala lapangan')}${rules(c2,'Validasi hari yang sama')}<p class="note">Titik di luar UCL/LCL menandai penyebab khusus (cuaca, akses, kebijakan) yang perlu ditindaklanjuti, bukan variasi biasa.</p></div>`)}
   ${card2('s8','p-chart: proporsi aspirasi tervalidasi di hari yang sama','n berbeda tiap hari',c2.svg)}
   ${card2('s4','Kapabilitas hari ini','',`<div class="rings">${V.ring(Math.min(1,(sim.today.kendala||0)/Math.max(1,c1.ucl)),String(sim.today.kendala||0),'Kendala','#7E1622')}${V.ring(todayP,Math.round(todayP*100)+'%','Validasi','#13274A')}${V.ring(pct(sim.stats.onTime,sim.stats.handled)/100,pct(sim.stats.onTime,sim.stats.handled)+'%','SLA','#2E7A52')}</div>`)}</div>`;
}
$('#anBody').addEventListener('click',e=>{const c=e.target.closest('[data-rid]');if(c){location.hash='operasi';setTimeout(()=>selectRegion(R[+c.dataset.rid],true),200);}});

/* ================================================================
   REPORTS
   ================================================================ */
const RP={view:'auto',scope:'tim',period:'hari',streak:Array.from({length:9},(_,i)=>hsh(i*3.3)>.25),mood:3,sent:false};
$('#rpSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;RP.view=b.dataset.v;$$('#rpSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderReport(true);};
function scopeSet(sc){if(sc.startsWith('kw:')){const k=KORWIL[sc.slice(3)],regs=R.filter(r=>k.provs.includes(r.prov));return{label:`${k.name} · ${k.area}`,serd:S.filter(s=>s.region&&regs.includes(s.region)),regs,iss:I.filter(i=>regs.includes(i.region))};}
  if(sc==='saya')return{label:`${me.name}`,serd:[me],regs:[me.region],iss:I.filter(i=>i.owner===me)};
  if(sc==='tim')return{label:`Tim ${me.region.name}`,serd:me.region.team,regs:[me.region],iss:I.filter(i=>i.region===me.region)};
  if(sc==='prov'){const regs=R.filter(r=>r.prov===me.region.prov);return{label:`Provinsi ${me.region.prov}`,serd:S.filter(s=>s.region&&s.region.prov===me.region.prov),regs,iss:I.filter(i=>i.region.prov===me.region.prov)};}
  return{label:'Satgas Soedirman · Pulau Jawa',serd:S.filter(s=>s.region),regs:R,iss:I};}
function reportData(){
  const sc=scopeSet(RP.scope),since=RP.period==='hari'?sim.day*1440:(sim.day-6)*1440;
  const ev=sim.events.filter(e=>e.abs>=since&&(e.s?sc.serd.includes(e.s):e.r&&sc.regs.includes(e.r)));
  const newI=sc.iss.filter(i=>i.createdAbs>=since),act=sc.iss.filter(active),fb=sc.iss.filter(i=>i.fb);
  const cnt=t=>ev.filter(e=>e.type===t).length;const sw=fb.length?fb.reduce((a,i)=>a+i.fb.s,0)/fb.length:0;
  const cats={};act.forEach(i=>cats[i.cat]=(cats[i.cat]||0)+1);const topCat=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
  const inc=sc.regs.filter(r=>!r.complete);const old=act.filter(i=>i.days>=14);
  return{sc,ev,newI,act,fb,sw,cnt,topCat,inc,old,visits:cnt('visit'),kend:cnt('kendala'),fwd:cnt('rujukan')+cnt('referral'),help:cnt('bantuan'),fu:pct(sc.iss.filter(i=>i.si>=3).length,sc.iss.length)};
}
function insights(d){
  const L=[];const avg=sim.history.slice(-7).reduce((a,b)=>a+b,0)/7*(RP.scope==='satgas'?1:d.sc.regs.length/119);
  if(RP.period==='hari'&&d.newI.length)L.push(['mega',`${d.newI.length} aspirasi baru tercatat${avg?`, ${d.newI.length>=avg*.8?'sejalan dengan':'di bawah'} ritme rata-rata harian.`:'.'}`]);
  if(d.topCat[0])L.push(['chart',`Kategori dominan: <b>${esc(d.topCat[0][0])}</b> (${pct(d.topCat[0][1],d.act.length)}% dari aspirasi aktif)${d.topCat[1]?`, disusul ${esc(d.topCat[1][0])}`:''}.`]);
  L.push(['check',`Tingkat tindak lanjut ${d.fu}%: aspirasi sudah divalidasi lalu ditangani atau diteruskan ke instansi.`]);
  if(d.fb.length)L.push([d.sw>=0?'star':'alert',`Sentimen warga ${d.sw>=0?'positif':'negatif'} (${d.sw.toFixed(2)}) dari ${d.fb.length} umpan balik.`]);
  if(d.old.length)L.push(['alert',`${d.old.length} aspirasi aktif berumur ≥14 hari, perlu pemantauan ulang ke instansi.`]);
  if(d.kend)L.push(['alert',`${d.kend} kendala lapangan dilaporkan; ${pct(sim.stats.onTime,sim.stats.handled)}% peringatan ditangani tepat waktu.`]);
  return L;
}
function recos(d){const R2=[];
  if(d.inc.length)R2.push(`Lengkapi kluster ${[...new Set(d.inc.flatMap(r=>r.missing))].join(', ')} di ${d.inc.slice(0,3).map(r=>r.name).join(', ')} lewat rujukan antar-Serdik.`);
  if(d.old.length)R2.push(`Jadwalkan pengecekan status ${Math.min(5,d.old.length)} aspirasi tertua ke ${INST[d.old[0].cat]}.`);
  if(d.topCat[0])R2.push(`Gunakan SMART Calculator untuk memilih intervensi kategori ${d.topCat[0][0]}.`);
  if(d.sw<0)R2.push('Kirim kabar perkembangan ke warga yang menunggu lama untuk memperbaiki sentimen.');
  R2.push('Bagikan praktik baik minggu ini di kanal Hub #praktik.');return R2.slice(0,4);}
function renderReport(force){
  if(!me)return;if(!force&&RP.view==='harian')return;
  if(RP.view==='harian'){renderDaily();return;}
  const d=reportData();
  const evBy=GROUPS.map(g=>({l:g[0],c:g[2],v:d.ev.filter(e=>g[1].includes(e.type)).length}));
  const tiles=[['Kunjungan',d.visits,'#4A86C8'],['Aspirasi baru',d.newI.length,'#C59A4A'],['Diteruskan',d.fwd,'#2A7F86'],['Bantuan rekan',d.help,'#B0476A'],['Kendala',d.kend,'#A3202C']];
  const tm=Math.max(1,...tiles.map(t=>t[1]));
  const html=`<div class="rp"><div class="card grid" style="gap:12px;position:sticky;top:120px">
    <h3>Susun laporan</h3>
    <label class="field">Cakupan<div class="seg" id="rpScope">${reportScopes().map(([k,l])=>`<button type="button" data-k="${k}" aria-pressed="${RP.scope===k}">${l}</button>`).join('')}</div></label>
    <label class="field">Periode<div class="seg" id="rpPer">${[['hari','Hari ini'],['minggu','7 hari']].map(([k,l])=>`<button type="button" data-k="${k}" aria-pressed="${RP.period===k}">${l}</button>`).join('')}</div></label>
    <button class="btn primary" id="rpSend"><svg class="ic"><use href="#i-send"/></svg>Kirim ke Hub</button><button class="btn" id="rpCopy"><svg class="ic"><use href="#i-copy"/></svg>Salin ringkasan</button>
    <p class="small muted">Semua angka dihitung dari data operasi saat ini.</p></div>
   <article class="paper"><div class="paper-head"><span class="lbl" style="color:var(--gold-2)">Laporan ${RP.period==='hari'?'harian':'mingguan'} · Hari ke-${sim.day} · ${hhmm(sim.min)} WIB</span><h2>${esc(d.sc.label)}</h2><p style="opacity:.85;margin-top:4px">Satgas Soedirman · Berani · Cepat · Terhormat</p></div>
   <div class="paper-body">
     <div class="kpis" style="margin:0;grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">${tiles.map(t=>`<div class="kpi" style="border-top-color:${t[2]}"><b>${fmt(t[1])}</b><span>${t[0]}</span><div class="track" style="height:5px;margin-top:6px"><i data-w="${Math.round(t[1]/tm*100)}" style="background:${t[2]}"></i></div></div>`).join('')}</div>
     <div class="row" style="gap:18px;align-items:center;flex-wrap:wrap">${V.donut(evBy,150,`<tspan x="75" dy="-2" class="t-strong" style="font-size:22px;font-family:Playfair Display,serif">${d.ev.length}</tspan><tspan x="75" dy="18">kejadian</tspan>`)}
      <div class="rings" style="flex:1;min-width:260px">${V.ring(d.fu/100,d.fu+'%','Tindak lanjut','#13274A')}${V.ring((d.sw+1)/2,(d.sw>=0?'+':'')+d.sw.toFixed(2),'Sentimen warga',sentCol(d.sw))}${V.ring(d.sc.regs.filter(r=>r.complete).length/d.sc.regs.length,d.sc.regs.filter(r=>r.complete).length+'/'+d.sc.regs.length,'Tim lengkap','#C59A4A')}</div></div>
     <div class="legend-row">${evBy.map(g=>`<span><i style="background:${g.c}"></i>${g.l} ${g.v}</span>`).join('')}</div>
     <div><span class="lbl">Temuan utama</span><div class="grid" style="gap:10px;margin-top:8px">${insights(d).map((x,i)=>`<div class="insight" style="animation-delay:${i*80}ms"><span class="ico"><svg class="ic"><use href="#i-${x[0]}"/></svg></span><span>${x[1]}</span></div>`).join('')}</div></div>
     <div><span class="lbl">Rekomendasi tindak lanjut</span><ol style="margin:8px 0 0;padding-left:20px;display:grid;gap:6px;font-size:.9rem">${recos(d).map(r=>`<li>${esc(r)}</li>`).join('')}</ol></div>
     <div><span class="lbl">Aspirasi prioritas</span><div class="grid" style="gap:4px;margin-top:6px">${[...d.act].sort((a,b)=>b.pr-a.pr).slice(0,5).map(i=>`<div class="fi" data-iid="${i.id}"><span class="pill ${i.pr>=70?'crit':i.pr>=50?'warn':'ok'}">P${i.pr}</span><span>${esc(i.title)}<br><span class="muted" style="font-size:.7rem">${esc(i.region.name)} · ${ST[i.si][2]} · ${i.days} hari</span></span><span></span></div>`).join('')||'<span class="small muted">Tidak ada aspirasi aktif.</span>'}</div></div>
   </div></article></div>`;
  $('#rpBody').innerHTML=html;animateBars($('#rpBody'));
  $('#rpScope').onclick=e=>{const b=e.target.closest('[data-k]');if(b){RP.scope=b.dataset.k;renderReport(true);}};
  $('#rpPer').onclick=e=>{const b=e.target.closest('[data-k]');if(b){RP.period=b.dataset.k;renderReport(true);}};
  const summary=()=>`Laporan ${RP.period==='hari'?'harian':'mingguan'} ${d.sc.label} (Hari ke-${sim.day}): ${d.visits} kunjungan, ${d.newI.length} aspirasi baru, ${d.fwd} diteruskan, tindak lanjut ${d.fu}%, sentimen warga ${d.sw.toFixed(2)}.`;
  $('#rpCopy').onclick=()=>{const t=summary();const done=()=>toast('Ringkasan disalin');try{navigator.clipboard.writeText(t).then(done,()=>{$('#rpCopy').insertAdjacentHTML('afterend',`<textarea style="width:100%;height:90px">${esc(t)}</textarea>`);});}catch(e){$('#rpCopy').insertAdjacentHTML('afterend',`<textarea style="width:100%;height:90px">${esc(t)}</textarea>`);}};
  $('#rpSend').onclick=()=>{if(!tabAllowed('hub')){audit('Meneruskan laporan '+d.sc.label);toast('Laporan diteruskan ke Komando');return;}const ch=!isField()?'staf':RP.scope==='tim'||RP.scope==='saya'?'prov':'angkatan';hubMsg(ch,me,summary(),{kind:'report',card:`<b class="small">Laporan · ${esc(d.sc.label)}</b><div class="row" style="gap:6px">${tiles.map(t=>`<span class="pill" style="border-color:${t[2]};color:${t[2]}">${t[0]} ${t[1]}</span>`).join('')}</div>`});toast(`Laporan terkirim ke Hub #${ch}`);};
  $('#rpBody').querySelectorAll('[data-iid]').forEach(x=>x.onclick=()=>openIssue(I.find(i=>i.id===x.dataset.iid)));
}
const FACES=[['Berat','M7 16c2-2.5 8-2.5 10 0'],['Lelah','M7 15.5c2-1.2 8-1.2 10 0'],['Biasa','M7 15h10'],['Baik','M7 14.5c2 1.5 8 1.5 10 0'],['Semangat','M7 14c2 3 8 3 10 0']];
const face=(i,sz=32)=>`<svg width="${sz}" height="${sz}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${['#E7C9C9','#F0DCC2','#F1E8D6','#DCEBD9','#C9E3D2'][i]}" stroke="#0F1D38" stroke-width="1.2"/><circle cx="8.5" cy="10" r="1.1" fill="#0F1D38"/><circle cx="15.5" cy="10" r="1.1" fill="#0F1D38"/><path d="${FACES[i][1]}" fill="none" stroke="#0F1D38" stroke-width="1.4" stroke-linecap="round"/></svg>`;
function renderDaily(){
  const mine=I.filter(i=>i.owner===me&&i.createdAbs>=sim.day*1440),myEv=sim.events.filter(e=>e.s===me&&e.abs>=sim.day*1440);
  const tiles=[['Kunjungan',me.visitsToday,'walk'],['Aspirasi',mine.length,'mega'],['Bantuan',myEv.filter(e=>e.type==='bantuan').length,'hand'],['Rujukan',myEv.filter(e=>e.type==='referral'||e.type==='rujukan').length,'route']];
  $('#rpBody').innerHTML=`<div class="rp"><div class="card grid" style="gap:12px"><h3>Konsistensi pelaporan</h3><div class="streak">${RP.streak.map(x=>`<i class="${x?'on':''}"></i>`).join('')}<i class="${RP.sent?'on':''}" style="outline:2px solid var(--navy)"></i></div><p class="small muted">${RP.streak.filter(Boolean).length+(RP.sent?1:0)} dari 10 hari terakhir terkirim. Batas kirim 17.00 WIB.</p>${RP.sent?'<span class="badge-earned"><svg class="ic"><use href="#i-check"/></svg>Laporan hari ini terkirim</span>':''}</div>
   <form class="paper" id="dailyForm"><div class="paper-head"><span class="lbl" style="color:var(--gold-2)">Laporan harian ringkas · Hari ke-${sim.day}</span><h2>${esc(me.name)}</h2><p style="opacity:.85">${esc(me.region.name)} · ${me.id}</p></div>
   <div class="paper-body"><div class="kpis" style="margin:0">${tiles.map(t=>`<div class="kpi"><div class="row between"><b>${t[1]}</b><svg class="ic" style="color:var(--gold)"><use href="#i-${t[2]}"/></svg></div><span>${t[0]} (otomatis)</span></div>`).join('')}</div>
   <div><span class="lbl">Kondisi Anda hari ini</span><div class="mood" style="margin-top:6px">${FACES.map((f,i)=>`<button type="button" data-mood="${i}" aria-pressed="${RP.mood===i}">${face(i)}<span>${f[0]}</span></button>`).join('')}</div></div>
   <label class="field">Kegiatan utama<textarea id="dKeg" rows="2">${myEv.filter(e=>e.type==='visit').map(e=>e.text.replace(/^Anda memulai /,'')).slice(0,3).join('; ')||'Siaga di posko desa dan koordinasi tim.'}</textarea></label>
   <label class="field">Kendala<textarea id="dKend" rows="2" placeholder="Opsional"></textarea></label>
   <label class="field">Rencana besok<textarea id="dPlan" rows="2">Menindaklanjuti ${I.filter(i=>i.owner===me&&active(i)).length} aspirasi aktif dan memantau rujukan ke instansi.</textarea></label>
   <div><span class="lbl">Butuh dukungan</span><div class="row" style="margin-top:6px" id="dNeeds">${['Kontak instansi','Rekan kluster lain','Transportasi','Materi sosialisasi'].map(n=>`<label class="tog" style="border:1px solid var(--line);border-radius:999px;padding:4px 10px"><input type="checkbox" value="${n}"> ${n}</label>`).join('')}</div></div>
   <div class="row"><button class="btn primary big" type="submit"><svg class="ic"><use href="#i-send"/></svg>Kirim ke koordinator &amp; tim</button><span class="small muted">Ringkasan muncul di Hub kanal tim.</span></div></div></form></div>`;
  $('#rpBody').querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{RP.mood=+b.dataset.mood;$$('[data-mood]').forEach(x=>x.setAttribute('aria-pressed',x===b));});
  $('#dailyForm').onsubmit=e=>{e.preventDefault();const needs=[...$$('#dNeeds input:checked')].map(x=>x.value);
    pushChat(me,`Laporan harian: ${tiles.map(t=>t[0]+' '+t[1]).join(', ')}. Kondisi: ${FACES[RP.mood][0]}.${$('#dKend').value.trim()?' Kendala: '+$('#dKend').value.trim()+'.':''}${needs.length?' Butuh: '+needs.join(', ')+'.':''}`);
    if(me.region.coord&&me.region.coord!==me)sim.pendingReplies.push({at:abs()+3,from:me.region.coord,text:`Terima kasih laporannya, ${me.name.split(' ')[0]}. ${needs.length?'Dukungan '+needs[0].toLowerCase()+' saya bantu carikan.':'Lanjutkan!'}`});
    RP.sent=true;toast('Laporan harian terkirim');renderDaily();};
}

/* ================================================================
   ARENA (mini games)
   ================================================================ */
const AR={game:null,best:{dialog:0,sort:0,rute:0},pts:0,badges:new Set()};
try{const b=JSON.parse(localStorage.getItem('ssArena')||'null');if(b)Object.assign(AR.best,b);}catch(e){}
const saveBest=()=>{try{localStorage.setItem('ssArena',JSON.stringify(AR.best));}catch(e){}};
const LBN=Array.from({length:10},(_,i)=>({n:S[(i*37+11)%384].name,s:Math.round(260-i*17+hsh(i)*20)}));
function renderArena(){
  if(AR.game){({dialog:gDialog,sort:gSort,rute:gRoute})[AR.game]();return;}
  const total=AR.best.dialog+AR.best.sort+AR.best.rute;
  $('#arenaPts').innerHTML=`<span class="badge-earned"><svg class="ic"><use href="#i-star"/></svg>${total} poin terbaik</span>`;
  const lb=[...LBN,{n:me.name,s:total,me:1}].sort((a,b)=>b.s-a.s);
  const G=[['dialog','chat','Dialog Warga','Pilih respons terbaik saat warga marah, meminta hal di luar kewenangan, atau menolak kegiatan. Jaga empati, kejelasan, dan batas kewenangan.',AR.best.dialog],
    ['sort','bolt','Sortir Kewenangan','45 detik. Tentukan cepat: tangani langsung, kolaborasi, atau rujuk ke instansi. Beruntun memberi bonus.',AR.best.sort],
    ['rute','route','Rute Kunjungan','Susun urutan kunjungan 8 desa di kabupaten Anda. Bandingkan dengan rute optimal hasil perhitungan.',AR.best.rute]];
  $('#arenaBody').innerHTML=`<div class="an-grid"><div class="games s8">${G.map((g,i)=>`<div class="game-card" data-game="${g[0]}" tabindex="0" role="button"><div class="game-art"><svg class="ic"><use href="#i-${g[1]}"/></svg><svg viewBox="0 0 300 140" style="position:absolute;inset:0;width:100%;height:100%;opacity:.25" aria-hidden="true">${Array.from({length:14},(_,k)=>`<circle cx="${hsh(k+i*20)*300}" cy="${hsh(k*3+i)*140}" r="${2+hsh(k*7)*4}" fill="#E3C68A"/>`).join('')}</svg></div><div class="body"><h3 style="font-family:var(--f-display);font-size:1.2rem">${g[2]}</h3><p class="small muted">${g[3]}</p><div class="row between"><span class="pill acc">Terbaik ${g[4]}</span><span class="btn sm primary">Main</span></div></div></div>`).join('')}</div>
   <div class="card grid s4" style="gap:10px"><div class="row between"><h3>Papan peringkat angkatan</h3><span class="small muted">total poin</span></div><div class="lb">${lb.slice(0,11).map((x,i)=>`<div class="${x.me?'me':''}"><b class="num">${i+1}</b><span>${x.me?'Anda':esc(x.n)}</span><b class="num">${x.s}</b></div>`).join('')}</div>
    <div class="row">${[...AR.badges].map(b=>`<span class="badge-earned"><svg class="ic"><use href="#i-star"/></svg>${b}</span>`).join('')||'<span class="small muted">Lencana muncul setelah Anda bermain.</span>'}</div></div></div>`;
  $('#arenaBody').querySelectorAll('[data-game]').forEach(c=>{const go=()=>{AR.game=c.dataset.game;AR.state=null;renderArena();};c.onclick=go;c.onkeydown=e=>{if(e.key==='Enter')go();};});
}
const backBtn=`<button class="btn sm" id="arBack">← Arena</button>`;
function bindBack(){$('#arBack').onclick=()=>{AR.game=null;clearInterval(AR.timer);renderArena();};}
const DIALOGS=[{t:'Jalan rusak, warga marah',rounds:[
  {w:'Sudah tiga kali kami lapor, jalan tetap rusak! Kalian cuma datang foto-foto saja.',o:[['Saya mengerti Bapak kecewa. Boleh ceritakan kapan terakhir melapor dan ke siapa?',[2,1,1],'Empati dulu, lalu gali fakta. Warga merasa didengar.'],['Kami bukan dinas PU, Pak. Itu bukan urusan kami.',[-2,0,1],'Benar soal kewenangan, tetapi menutup percakapan dan memperkeruh suasana.'],['Tenang, Pak. Minggu depan pasti diperbaiki.',[1,-1,-3],'Menjanjikan hal di luar kewenangan akan merusak kepercayaan.']]},
  {w:'Ya sudah, lalu apa yang bisa kalian lakukan?',o:[['Saya catat lengkap dengan foto dan titik lokasi, lalu teruskan ke Dinas PUPR dan pantau perkembangannya.',[1,2,2],'Jelas, jujur soal peran, dan ada tindak lanjut.'],['Nanti saya sampaikan.',[0,-2,0],'Terlalu kabur. Warga tidak tahu apa yang terjadi berikutnya.'],['Kami akan usahakan perbaiki sendiri bersama warga.',[1,0,-2],'Niat baik, tetapi berisiko di luar kapasitas dan kewenangan.']]},
  {w:'Kapan kami dapat kabar?',o:[['Saya kabari paling lambat Jumat, apa pun hasilnya. Ini kontak posko desa.',[1,2,1],'Tenggat jelas dan kanal komunikasi tersedia.'],['Tunggu saja ya, Pak.',[-1,-2,0],'Tanpa kepastian, keluhan akan berulang.'],['Pasti selesai bulan ini.',[1,0,-3],'Janji penyelesaian bukan wewenang Serdik.']]}]},
 {t:'Permintaan di luar kewenangan',rounds:[
  {w:'Mas, tolong bantu saya dapat bansos. Anak saya tiga, suami baru kena PHK.',o:[['Saya turut prihatin, Bu. Boleh saya catat kondisi keluarga Ibu agar bisa saya bantu arahkan ke jalurnya?',[2,1,1],'Empati dan langkah konkret tanpa janji.'],['Bansos bukan dari kami, Bu. Silakan ke desa.',[-2,0,1],'Dingin dan melempar tanpa bantuan.'],['Nanti saya masukkan Ibu ke daftar penerima.',[1,0,-3],'Serdik tidak menentukan penerima bansos.']]},
  {w:'Saya sudah ke desa, katanya data sudah tutup.',o:[['Saya cek ke Dinas Sosial soal jadwal pemutakhiran data, lalu kabari Ibu dokumen yang perlu disiapkan.',[1,2,2],'Menghubungkan ke instansi berwenang dengan langkah yang jelas.'],['Kalau sudah tutup ya tunggu tahun depan.',[-2,-1,0],'Tidak membantu dan mematikan harapan.'],['Saya minta kepala desa membuka lagi datanya.',[0,0,-2],'Menekan aparat desa di luar peran Serdik.']]}]},
 {t:'Warga menolak sosialisasi',rounds:[
  {w:'Kami sudah bosan sosialisasi. Tiap tahun datang, tidak ada hasilnya.',o:[['Wajar kalau Bapak bosan. Boleh saya tahu sosialisasi apa yang dulu tidak ada tindak lanjutnya?',[2,1,1],'Mengakui perasaan dan mencari akar masalah.'],['Kali ini berbeda, Pak, percaya saja.',[0,-1,-1],'Klaim tanpa bukti tidak membangun kepercayaan.'],['Kalau tidak mau ya tidak apa-apa.',[-2,0,0],'Melewatkan kesempatan mendengar.']]},
  {w:'Dulu janji air bersih, sampai sekarang belum ada.',o:[['Saya catat itu sebagai aspirasi, dan hari ini saya hanya mendengar, tanpa acara. Kapan waktu yang enak untuk ngobrol dengan warga lain?',[2,2,1],'Mengubah format menjadi mendengar, bukan menceramahi.'],['Itu program lama, bukan dari kami.',[-1,0,1],'Benar, tetapi tidak menyelesaikan ketidakpercayaan.'],['Saya pastikan air bersih masuk tahun ini.',[1,0,-3],'Janji yang tidak dapat ditepati.']]}]}];
function gDialog(){
  const st=AR.state=AR.state||{sc:Math.floor(Math.random()*DIALOGS.length),r:0,m:[5,5,5],log:[],picked:null};const D=DIALOGS[st.sc];
  const mood=Math.max(0,Math.min(4,Math.round((st.m[0]+st.m[1]-6)/3)));
  const done=st.r>=D.rounds.length;
  const meters=['Empati','Kejelasan','Batas kewenangan'].map((l,i)=>`<div class="meter"><span>${l}</span><div class="track"><i data-w="${st.m[i]*10}" style="background:${st.m[i]>=7?'var(--ok)':st.m[i]>=4?'var(--gold)':'var(--maroon)'}"></i></div><b class="num">${st.m[i]}</b></div>`).join('');
  let body;
  if(done){const score=Math.round(st.m.reduce((a,b)=>a+b,0)*10);if(score>AR.best.dialog){AR.best.dialog=score;saveBest();}if(score>=200)AR.badges.add('Pendengar empatik');
    body=`<div class="grid" style="gap:12px;justify-items:center;text-align:center">${face(mood,96)}<h2>${score} poin</h2><p class="muted">${score>=220?'Luar biasa: empati, jelas, dan tetap dalam kewenangan.':score>=170?'Baik. Perhatikan janji yang tidak bisa ditepati.':'Coba lagi: dengarkan dulu, jelaskan peran, beri tenggat yang realistis.'}</p><div class="row"><button class="btn primary" id="dAgain">Skenario lain</button></div></div>`;}
  else{const R0=D.rounds[st.r];
    body=`<div class="row" style="align-items:flex-start;gap:14px;flex-wrap:nowrap"><div style="flex:none;text-align:center">${face(mood,72)}<div class="small muted">Warga</div></div><div class="bubble">${esc(R0.w)}</div></div>
    <div class="grid" style="gap:8px">${R0.o.map((o,i)=>`<button class="choice${st.picked!=null?(o[1][0]+o[1][1]+o[1][2]>=3?' good':(st.picked===i?' bad':'')):''}" data-ch="${i}"${st.picked!=null?' disabled':''}>${esc(o[0])}${st.picked===i?`<div class="small" style="margin-top:6px;color:var(--muted)">${esc(o[2])}</div>`:''}</button>`).join('')}</div>
    ${st.picked!=null?`<button class="btn primary" id="dNext" style="justify-self:end">${st.r===D.rounds.length-1?'Lihat hasil':'Lanjut'}</button>`:''}`;}
  $('#arenaBody').innerHTML=`<div class="stage-game"><div class="row between">${backBtn}<span class="lbl">Dialog Warga · ${esc(D.t)} · ${Math.min(st.r+1,D.rounds.length)}/${D.rounds.length}</span></div><div class="an-grid"><div class="s8 grid" style="gap:12px">${body}</div><div class="s4 card grid" style="gap:10px"><h3>Meter interaksi</h3>${meters}</div></div></div>`;
  bindBack();animateBars($('#arenaBody'));
  $$('#arenaBody [data-ch]').forEach(b=>b.onclick=()=>{const o=D.rounds[st.r].o[+b.dataset.ch];st.picked=+b.dataset.ch;o[1].forEach((d,i)=>st.m[i]=Math.max(0,Math.min(10,st.m[i]+d)));gDialog();});
  const n=$('#dNext');if(n)n.onclick=()=>{st.r++;st.picked=null;gDialog();};
  const ag=$('#dAgain');if(ag)ag.onclick=()=>{AR.state={sc:(st.sc+1)%DIALOGS.length,r:0,m:[5,5,5],picked:null};gDialog();};
}
const DECK=[['Warga minta dijelaskan cara mendaftar BPJS',0],['Kelompok UMKM minta pelatihan pemasaran online',0],['Pemuda minta difasilitasi forum diskusi',0],['Warga belum paham cara mengurus NIB',0],['Kader posyandu minta pendampingan pencatatan',0],['Warga minta info jadwal layanan puskesmas',0],
  ['Sekolah kekurangan buku bacaan',1],['Bank sampah warga butuh pembeli tetap',1],['Lansia hidup sendiri perlu pendataan',1],['Pelatihan literasi digital perangkat desa',1],['Hama wereng menyerang sawah warga',1],['Posyandu butuh kader tambahan',1],
  ['Jembatan gantung tidak layak dilalui',2],['Pengurusan KTP-el memakan waktu lama',2],['Puskesmas kekurangan dokter',2],['Jalan kabupaten rusak berat',2],['Bansos tidak tepat sasaran',2],['Lampu jalan padam di jalur sekolah',2],['Sengketa batas tanah antarwarga',2]];
const BINS=[['Tangani langsung','check','#2E7A52'],['Kolaborasi','meet','#C59A4A'],['Rujuk ke instansi','route','#7E1622']];
function gSort(){
  const st=AR.state=AR.state||{t:45,score:0,streak:0,hits:0,miss:0,deck:[...DECK].sort(()=>Math.random()-.5),i:0,run:false,fb:null};
  const card=st.deck[st.i%st.deck.length];const over=st.run&&st.t<=0;
  $('#arenaBody').innerHTML=`<div class="stage-game"><div class="row between">${backBtn}<span class="lbl">Sortir Kewenangan</span><div class="row"><span class="pill acc">Skor <b id="sgS">${st.score}</b></span><span class="pill warn">Beruntun ${st.streak}</span></div></div>
   <div class="timerbar"><i id="sgT" style="width:${st.t/45*100}%"></i></div>
   ${!st.run?`<div class="grid" style="justify-items:center;gap:12px;padding:30px"><h2>Siap?</h2><p class="muted">Klik kotak tujuan atau tekan 1, 2, 3.</p><button class="btn primary big" id="sgGo">Mulai 45 detik</button></div>`
    :over?`<div class="grid" style="justify-items:center;gap:10px;padding:24px;text-align:center"><h2>${st.score} poin</h2><p class="muted">${st.hits} tepat · ${st.miss} keliru · akurasi ${pct(st.hits,st.hits+st.miss)}%</p><button class="btn primary" id="sgAgain">Main lagi</button></div>`
    :`<div class="sortcard" id="sgCard">${esc(card[0])}</div><p class="small muted" style="text-align:center;min-height:20px">${st.fb||''}</p>
   <div class="bins">${BINS.map((b,i)=>`<button class="bin" data-bin="${i}" style="color:${b[2]}"><svg class="ic" style="width:28px;height:28px"><use href="#i-${b[1]}"/></svg>${i+1}. ${b[0]}</button>`).join('')}</div>`}</div>`;
  bindBack();
  const go=$('#sgGo');if(go)go.onclick=()=>{st.run=true;clearInterval(AR.timer);AR.timer=setInterval(()=>{st.t-=.25;const t=$('#sgT');if(t)t.style.width=Math.max(0,st.t/45*100)+'%';if(st.t<=0){clearInterval(AR.timer);if(st.score>AR.best.sort){AR.best.sort=st.score;saveBest();}if(st.hits>=15)AR.badges.add('Paham kewenangan');gSort();}},250);gSort();};
  const ag=$('#sgAgain');if(ag)ag.onclick=()=>{AR.state=null;gSort();};
  $$('#arenaBody [data-bin]').forEach(b=>b.onclick=()=>sortPick(+b.dataset.bin,b));
}
function sortPick(i,el){const st=AR.state;if(!st||!st.run||st.t<=0)return;const card=st.deck[st.i%st.deck.length];
  if(card[1]===i){st.streak++;st.hits++;st.score+=10+Math.min(10,st.streak*2);st.fb=`Tepat. ${['Bisa dibantu langsung oleh Serdik.','Perlu rekan atau pihak lain bersama-sama.','Wewenang instansi: catat, rujuk, pantau.'][i]}`;el&&el.classList.add('hit');}
  else{st.streak=0;st.miss++;st.score=Math.max(0,st.score-5);st.fb=`Kurang tepat. Jawaban: ${BINS[card[1]][0]}.`;el&&el.classList.add('miss');}
  st.i++;setTimeout(gSort,280);}
document.addEventListener('keydown',e=>{if(state.tab==='arena'&&AR.game==='sort'&&['1','2','3'].includes(e.key)){const b=$(`[data-bin="${+e.key-1}"]`);sortPick(+e.key-1,b);}});
function gRoute(){
  const r=me.region,pts=[{name:'Posko',x:me.px,z:me.pz,base:1},...r.villages.slice(0,8)];
  const st=AR.state=AR.state||{order:[0],done:false,opt:null};
  const d=(a,b)=>Math.hypot(pts[a].x-pts[b].x,pts[a].z-pts[b].z)*11;
  const len=o=>{let s=0;for(let i=1;i<o.length;i++)s+=d(o[i-1],o[i]);return s+(o.length>1?d(o[o.length-1],0):0);};
  if(st.done&&!st.opt){let best=1e9,bo=null;const rest=[1,2,3,4,5,6,7,8];const perm=(arr,cur)=>{if(!arr.length){const L=len([0,...cur]);if(L<best){best=L;bo=[0,...cur];}return;}for(let i=0;i<arr.length;i++){perm(arr.slice(0,i).concat(arr.slice(i+1)),cur.concat(arr[i]));}};perm(rest,[]);st.opt=bo;}
  const W=640,H=360,mnx=Math.min(...pts.map(p=>p.x)),mxx=Math.max(...pts.map(p=>p.x)),mnz=Math.min(...pts.map(p=>p.z)),mxz=Math.max(...pts.map(p=>p.z));
  const sc=Math.min((W-80)/(mxx-mnx||1),(H-80)/(mxz-mnz||1)),X=p=>40+(p.x-mnx)*sc+((W-80)-(mxx-mnx)*sc)/2,Y=p=>40+(p.z-mnz)*sc+((H-80)-(mxz-mnz)*sc)/2;
  const path=(o,col,dash,cls)=>`<polyline points="${o.concat(st.done?[0]:[]).map(i=>`${X(pts[i])},${Y(pts[i])}`).join(' ')}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round"${dash?` stroke-dasharray="${dash}"`:''} pathLength="1"${cls?` class="${cls}"`:''}/>`;
  let s=`<rect width="${W}" height="${H}" rx="12" fill="#EFE8D8"/>`;
  if(st.opt)s+=path(st.opt,'#2E7A52','6 5','');
  s+=path(st.order,'#13274A','',st.done?'draw':'');
  pts.forEach((p,i)=>{const k=st.order.indexOf(i);s+=`<g data-pt="${i}" style="cursor:${k<0?'pointer':'default'}"><circle cx="${X(p)}" cy="${Y(p)}" r="${p.base?14:12}" fill="${p.base?'#7E1622':k>=0?'#13274A':'#FFFDF8'}" stroke="#13274A" stroke-width="2"/>${k>0?`<text x="${X(p)}" y="${Y(p)+4}" text-anchor="middle" style="fill:#F6EBD3;font-weight:700">${k}</text>`:''}${p.base?`<text x="${X(p)}" y="${Y(p)+4}" text-anchor="middle" style="fill:#fff;font-weight:700">P</text>`:''}<text x="${X(p)}" y="${Y(p)+28}" text-anchor="middle" class="t-strong">${esc(p.name)}</text></g>`;});
  const cur=len(st.order);
  let res='';if(st.done){const ef=Math.round(len(st.opt)/cur*100);const score=Math.round(ef*1.2);if(score>AR.best.rute){AR.best.rute=score;saveBest();}if(ef>=95)AR.badges.add('Navigator ulung');
    res=`<div class="rings">${V.ring(ef/100,ef+'%','Efisiensi','#13274A')}${V.ring(1,Math.round(cur)+' km','Rute Anda','#C59A4A')}${V.ring(1,Math.round(len(st.opt))+' km','Rute optimal','#2E7A52')}</div><p class="small muted">Optimal dihitung dengan mencoba seluruh 40.320 urutan (travelling salesman). ${score} poin.</p><button class="btn primary" id="rAgain" style="justify-self:start">Coba lagi</button>`;}
  $('#arenaBody').innerHTML=`<div class="stage-game"><div class="row between">${backBtn}<span class="lbl">Rute Kunjungan · ${esc(r.name)}</span><span class="pill acc">${st.order.length-1}/8 desa · ${Math.round(cur)} km</span></div>
   <div class="an-grid"><div class="s8"><svg class="vis" viewBox="0 0 ${W} ${H}" id="routeSvg">${s}</svg><div class="legend-row"><span><i style="background:#13274A"></i>rute Anda</span>${st.opt?'<span><i style="background:#2E7A52"></i>rute optimal</span>':''}<span><i style="background:#7E1622"></i>posko</span></div></div>
   <div class="s4 card grid" style="gap:10px">${st.done?res:`<h3>Klik desa berurutan</h3><p class="small muted">Mulai dari posko, kunjungi 8 desa, lalu kembali. Jarak dihitung dari peta.</p><button class="btn" id="rUndo"${st.order.length>1?'':' disabled'}>Batalkan langkah</button>`}</div></div></div>`;
  bindBack();
  $$('#routeSvg [data-pt]').forEach(g=>g.onclick=()=>{const i=+g.dataset.pt;if(st.done||st.order.includes(i))return;st.order.push(i);if(st.order.length===9)st.done=true;gRoute();});
  const u=$('#rUndo');if(u)u.onclick=()=>{st.order.pop();gRoute();};
  const ag=$('#rAgain');if(ag)ag.onclick=()=>{AR.state=null;gRoute();};
}

/* ================================================================
   HELP CENTER
   ================================================================ */
const LADDER=[['users','Rekan tim','≤ 15 mnt','Chat tim atau minta bantuan rekan dengan kluster yang cocok.'],['meet','Koordinator kab/kota','≤ 30 mnt','Koordinator memutuskan pembagian tugas dan menghubungi pihak desa.'],['globe','Koordinator provinsi','≤ 60 mnt','Untuk isu lintas kabupaten atau butuh sumber daya tambahan.'],['mega','Posko Satgas','≤ 2 jam','Eskalasi kendala keselamatan, kebijakan, atau isu prioritas tinggi.'],['route','Instansi berwenang','sesuai SLA instansi','Rujukan resmi: catat, teruskan, pantau, kabarkan ke warga.']];
const SITU=[['Warga marah karena keluhan lama','Akui perasaannya, minta cerita kronologi, jelaskan langkah dan tenggat kabar.','Saya mengerti ini sudah lama. Saya catat lengkap hari ini dan kabari Bapak paling lambat Jumat.','Berdebat soal siapa yang salah, atau menjanjikan perbaikan.'],
  ['Permintaan di luar kewenangan','Jelaskan peran Serdik dengan jujur, lalu hubungkan ke instansi yang tepat.','Keputusan itu ada di Dinas Sosial. Yang bisa saya lakukan: mencatat dan meneruskan, lalu memantau.','Mengiyakan agar cepat selesai.'],
  ['Penolakan kegiatan','Ganti format menjadi mendengar; minta waktu yang cocok bagi warga.','Hari ini saya hanya ingin mendengar. Kapan waktu yang enak untuk ngobrol bersama?','Memaksa acara tetap berjalan.'],
  ['Isu sensitif atau konflik','Jaga netralitas, catat tanpa menghakimi, eskalasi ke koordinator.','Terima kasih sudah percaya. Saya catat dan saya sampaikan ke koordinator agar ditangani tepat.','Memihak atau menyebarkan cerita.']];
const FAQ=[['Apa saja yang termasuk kewenangan Serdik?','Mendengar, mencatat, memvalidasi, menghubungkan ke pihak berwenang, memantau, dan mengabarkan ke warga. Penyelesaian teknis tetap di instansi terkait.'],
  ['Kapan aspirasi wajib dieskalasi?','Aspirasi prioritas P≥80, isu keselamatan, atau yang melibatkan konflik antarwarga dieskalasi ke koordinator dalam 60 menit.'],
  ['Bagaimana dengan foto dan data warga?','Ambil foto hanya dengan persetujuan. Gunakan opsi tanpa identitas bila pelapor tidak ingin dikenali. Lokasi dicatat sebatas kebutuhan operasional.'],
  ['Saya kurang percaya diri berbicara di depan warga.','Itu wajar. Gunakan Arena Dialog Warga untuk berlatih dan minta buddy mendampingi pada kunjungan awal.'],
  ['Laporan harian dikirim kapan?','Paling lambat 17.00 WIB lewat menu Laporan → Laporan harian saya.'],
  ['Aplikasi bermasalah, ke mana melapor?','Gunakan Tech Helpdesk P3MDI di halaman ini. Helpdesk buka 24/7.']];
const HELP={ladder:0,situ:0,q:'',tickets:[{id:'TKT-041',t:'Sinkronisasi foto aspirasi gagal',st:2,c:'Teknis aplikasi'},{id:'TKT-038',t:'Lupa PIN akun',st:3,c:'Akun'}]};
function renderHelp(){
  const L=LADDER[HELP.ladder],sx=SITU[HELP.situ],q=HELP.q.toLowerCase();
  $('#helpBody').innerHTML=`<div class="card grid" style="gap:12px"><div class="row between"><h3>Jalur eskalasi</h3><span class="small muted">klik tiap tingkat</span></div>
   <div class="ladder">${LADDER.map((l,i)=>`<div class="rung${i===HELP.ladder?' on':''}" data-rung="${i}"><span class="dot"><svg class="ic"><use href="#i-${l[0]}"/></svg></span><b class="small">${l[1]}</b><small>${l[2]}</small></div>`).join('')}</div>
   <div class="insight"><span class="ico"><svg class="ic"><use href="#i-${L[0]}"/></svg></span><span><b>${L[1]}</b> · target respons ${L[2]}. ${L[3]}</span></div></div>
   <div class="an-grid"><div class="card grid s7" style="gap:12px"><div class="row between"><h3>Asisten komunikasi</h3><a href="#arena" class="btn sm" id="toArena"><svg class="ic"><use href="#i-game"/></svg>Latih di Arena</a></div>
    <div class="row">${SITU.map((s2,i)=>`<button class="btn sm${i===HELP.situ?' primary':''}" data-situ="${i}">${esc(s2[0])}</button>`).join('')}</div>
    <p>${esc(sx[1])}</p><div class="bubble" style="background:var(--accent-soft)">“${esc(sx[2])}”</div>
    <div class="dodont"><div class="do"><b class="small">Lakukan</b><br>${esc(sx[1].split(',')[0])}.</div><div class="dont"><b class="small">Hindari</b><br>${esc(sx[3])}</div></div></div>
   <div class="card grid s5" style="gap:10px;background:linear-gradient(160deg,#1A3360,var(--navy));color:var(--cream);border:1px solid var(--gold)"><span class="lbl" style="color:var(--gold-2)">P3MDI</span><h2 style="color:var(--cream)">Tech Helpdesk</h2><span class="pill" style="background:var(--gold);color:var(--navy-2);justify-self:start">Buka 24/7 · Satu kontak, satu solusi</span>
    <form id="tkForm" class="grid" style="gap:8px;color:var(--fg)"><select id="tkCat" aria-label="Kategori tiket"><option>Teknis aplikasi</option><option>Akun</option><option>Data & sinkronisasi</option><option>Perangkat</option></select><input type="text" id="tkText" placeholder="Jelaskan masalah singkat" aria-label="Masalah" required><button class="btn" type="submit" style="background:var(--gold);color:var(--navy-2);border-color:var(--gold)">Buat tiket</button></form>
    <div class="grid" style="gap:6px" id="tkList">${HELP.tickets.map(t=>`<div class="ticket" style="background:rgba(255,255,255,.06);border-color:rgba(227,198,138,.35)"><span class="small"><b>${t.id}</b> · ${esc(t.t)}</span><span class="small" style="color:var(--gold-2)">${['Diterima','Ditinjau','Dikerjakan','Selesai'][t.st]}</span><div class="tsteps">${[0,1,2,3].map(k=>`<i class="${k<=t.st?'on':''}"></i>`).join('')}</div></div>`).join('')}</div></div></div>
   <div class="card grid faq" style="gap:6px"><div class="row between"><h3>Pertanyaan umum</h3><input type="search" id="faqQ" placeholder="Cari…" value="${esc(HELP.q)}" aria-label="Cari FAQ"></div>${FAQ.filter(f=>!q||(f[0]+f[1]).toLowerCase().includes(q)).map(f=>`<details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join('')||'<p class="small muted">Tidak ditemukan.</p>'}</div>`;
  $$('#helpBody [data-rung]').forEach(b=>b.onclick=()=>{HELP.ladder=+b.dataset.rung;renderHelp();});
  $$('#helpBody [data-situ]').forEach(b=>b.onclick=()=>{HELP.situ=+b.dataset.situ;renderHelp();});
  $('#toArena').onclick=()=>{AR.game='dialog';AR.state=null;};
  $('#faqQ').oninput=e=>{HELP.q=e.target.value;const p=e.target.selectionStart;renderHelp();const f=$('#faqQ');f.focus();f.setSelectionRange(p,p);};
  $('#tkForm').onsubmit=e=>{e.preventDefault();const t=$('#tkText').value.trim();if(!t)return;const tk={id:'TKT-'+String(42+HELP.tickets.length).padStart(3,'0'),t,st:0,c:$('#tkCat').value};HELP.tickets.unshift(tk);toast(`${tk.id} dibuat · helpdesk akan merespons`);renderHelp();
    let k=0;const iv=setInterval(()=>{tk.st++;if(state.tab==='bantuan')renderHelp();if(tk.st>=3||++k>3)clearInterval(iv);},4000);};
}
$('#sosBtn').onclick=()=>{if(!me||!isField())return;me.st='kendala';me.purpose=null;me.act='Kendala: darurat lapangan';const a=addAlert({type:'kendala',s:me,text:'Darurat lapangan dilaporkan dari tombol bantuan'});alertAct(a,'eskalasi');toast('Darurat terkirim ke koordinator dan Posko Satgas');sim.myVer++;};

/* ================================================================
   LAB additions: Monte Carlo risk & budget
   ================================================================ */
TOOLS.push(['monte','MC','Monte Carlo Risk Calculator','Peluang target tindak lanjut tercapai'],['budget','BG','Budget Calculator','Kebutuhan biaya operasional']);
LABFN.monte=labMonte;LABFN.budget=labBudget;
function labMonte(){
  lab.mc=lab.mc||{days:14,vis:[2,4],asp:.35,fu:[.55,.8],target:11,runs:2000};const m=lab.mc;
  $('#toolBody').innerHTML=`<div class="split">${card('Asumsi (distribusi seragam)','Ketidakpastian kunjungan, aspirasi per kunjungan, dan tingkat tindak lanjut disimulasikan ribuan kali.',`
   <div class="wrow"><label for="mcD">Horizon (hari)</label><span class="num" id="mcDo">${m.days}</span><input type="range" id="mcD" min="5" max="30" value="${m.days}"></div>
   <div class="wrow"><label for="mcV">Kunjungan per hari (maks)</label><span class="num" id="mcVo">${m.vis[0]}–${m.vis[1]}</span><input type="range" id="mcV" min="2" max="8" value="${m.vis[1]}"></div>
   <div class="wrow"><label for="mcA">Peluang aspirasi per kunjungan</label><span class="num" id="mcAo">${Math.round(m.asp*100)}%</span><input type="range" id="mcA" min=".1" max=".8" step=".05" value="${m.asp}"></div>
   <div class="wrow"><label for="mcF">Tingkat tindak lanjut (maks)</label><span class="num" id="mcFo">${Math.round(m.fu[0]*100)}–${Math.round(m.fu[1]*100)}%</span><input type="range" id="mcF" min=".6" max="1" step=".05" value="${m.fu[1]}"></div>
   <div class="wrow"><label for="mcT">Target aspirasi ditindaklanjuti</label><span class="num" id="mcTo">${m.target}</span><input type="range" id="mcT" min="5" max="60" value="${m.target}"></div>`)}
   <div class="card grid"><div class="row between"><h3>Distribusi hasil · ${m.runs} simulasi</h3><span class="pill" id="mcP"></span></div><div id="mcChart"></div><p class="note" id="mcNote"></p></div></div>`;
  const bind=(id,fn)=>$('#'+id).oninput=e=>{fn(+e.target.value);mcRun();};
  bind('mcD',v=>{m.days=v;$('#mcDo').textContent=v;});bind('mcV',v=>{m.vis[1]=v;$('#mcVo').textContent=m.vis[0]+'–'+v;});bind('mcA',v=>{m.asp=v;$('#mcAo').textContent=Math.round(v*100)+'%';});
  bind('mcF',v=>{m.fu[1]=v;$('#mcFo').textContent=Math.round(m.fu[0]*100)+'–'+Math.round(v*100)+'%';});bind('mcT',v=>{m.target=v;$('#mcTo').textContent=v;});
  mcRun(true);
}
function mcRun(first){
  const m=lab.mc,out=[];for(let r=0;r<m.runs;r++){let a=0;for(let d=0;d<m.days;d++){const v=m.vis[0]+Math.floor(Math.random()*(m.vis[1]-m.vis[0]+1));for(let k=0;k<v;k++)if(Math.random()<m.asp)a++;}out.push(Math.round(a*(m.fu[0]+Math.random()*(m.fu[1]-m.fu[0]))));}
  out.sort((a,b)=>a-b);const mx=out[out.length-1],mn=out[0],nb=24,bw=Math.max(1,Math.ceil((mx-mn+1)/nb)),bins=Array(Math.ceil((mx-mn+1)/bw)).fill(0);out.forEach(v=>bins[Math.floor((v-mn)/bw)]++);
  const p=out.filter(v=>v>=m.target).length/out.length,p10=out[Math.floor(out.length*.1)],p50=out[Math.floor(out.length*.5)],p90=out[Math.floor(out.length*.9)];
  const W=560,H=240,L=30,B=30,bm=Math.max(...bins),cw=(W-L-10)/bins.length;let s='';
  bins.forEach((c,i)=>{const lo=mn+i*bw,h=(H-B-14)*c/bm,ok=lo>=m.target;s+=`<rect x="${L+i*cw+1}" y="${H-B-h}" width="${cw-2}" height="${h}" rx="2" fill="${ok?'#2E7A52':'#C59A4A'}" class="growY" style="animation-delay:${first?i*25:0}ms" data-tt="${lo}–${lo+bw-1}: ${c} simulasi"/>`;if(i%4===0)s+=`<text x="${L+i*cw+cw/2}" y="${H-12}" text-anchor="middle">${lo}</text>`;});
  const tx=L+(m.target-mn)/bw*cw;if(tx>=L&&tx<=W)s+=`<line x1="${tx}" x2="${tx}" y1="6" y2="${H-B}" stroke="#7E1622" stroke-width="2" stroke-dasharray="5 4"/><text x="${tx+4}" y="16" style="fill:#7E1622">target ${m.target}</text>`;
  $('#mcChart').innerHTML=`<svg class="vis" viewBox="0 0 ${W} ${H}">${s}</svg>`;
  const pe=$('#mcP');pe.textContent=`P(capai target) ${Math.round(p*100)}%`;pe.className='pill '+(p>=.8?'ok':p>=.5?'warn':'crit');
  $('#mcNote').textContent=`Median ${p50} aspirasi ditindaklanjuti dalam ${m.days} hari (P10 ${p10}, P90 ${p90}). ${p<.5?'Target berisiko: tambah kunjungan atau perkuat tindak lanjut.':p<.8?'Cukup realistis, siapkan rencana cadangan.':'Target sangat mungkin tercapai.'}`;
}
function labBudget(){
  lab.bg=lab.bg||{km:18,tarif:2500,mak:35000,pulsa:150000,cetak:60000,hari:30,scope:'tim'};const b=lab.bg;
  const n=b.scope==='saya'?1:b.scope==='tim'?me.region.team.length:384;
  $('#toolBody').innerHTML=`<div class="split">${card('Komponen biaya per Serdik','Ubah asumsi; total dihitung untuk cakupan yang dipilih.',`
   <div class="seg" id="bgScope">${[['saya','Saya'],['tim','Tim'],['satgas','Satgas (384)']].map(([k,l])=>`<button data-k="${k}" aria-pressed="${b.scope===k}">${l}</button>`).join('')}</div>
   ${[['km','Jarak kunjungan per hari (km)',5,60,1],['tarif','Biaya transport per km (Rp)',1000,6000,250],['mak','Konsumsi per hari (Rp)',15000,80000,5000],['pulsa','Komunikasi per bulan (Rp)',50000,400000,25000],['cetak','Materi & cetak per bulan (Rp)',0,300000,10000],['hari','Hari penugasan',10,90,5]].map(([k,l,mn,mx,stp])=>`<div class="wrow"><label for="bg_${k}">${l}</label><span class="num" id="bgo_${k}">${fmt(b[k])}</span><input type="range" id="bg_${k}" min="${mn}" max="${mx}" step="${stp}" value="${b[k]}" data-bg="${k}"></div>`).join('')}`)}
   <div class="card grid" id="bgOut"></div></div>`;
  $('#bgScope').onclick=e=>{const x=e.target.closest('[data-k]');if(x){b.scope=x.dataset.k;labBudget();}};
  $$('#toolBody [data-bg]').forEach(i=>i.oninput=()=>{b[i.dataset.bg]=+i.value;$('#bgo_'+i.dataset.bg).textContent=fmt(+i.value);bgCalc(n,false);});
  bgCalc(n,true);
}
function bgCalc(n,anim){const b=lab.bg,mon=b.hari/30;
  const parts=[{l:'Transportasi',v:b.km*b.tarif*b.hari*n,c:'#13274A'},{l:'Konsumsi',v:b.mak*b.hari*n,c:'#C59A4A'},{l:'Komunikasi',v:b.pulsa*mon*n,c:'#2A7F86'},{l:'Materi & cetak',v:b.cetak*mon*n,c:'#7E1622'}];
  const tot=parts.reduce((a,p)=>a+p.v,0);const W=520,H=200;let x=40,s='';const sc=(W-80)/tot;
  parts.forEach((p,i)=>{const w=p.v*sc;s+=`<rect x="${x}" y="${60}" width="${w}" height="60" fill="${p.c}"${anim?` class="growX" style="animation-delay:${i*120}ms"`:''} data-tt="${p.l}: Rp${fmt(p.v)}"/>${w>60?`<text x="${x+w/2}" y="95" text-anchor="middle" style="fill:#fff;font-weight:600">${Math.round(p.v/tot*100)}%</text>`:''}`;x+=w;});
  s+=`<text x="40" y="40" class="t-strong" style="font:700 22px 'Playfair Display',serif">Rp${fmt(tot)}</text><text x="40" y="145">total untuk ${n} Serdik · ${b.hari} hari · Rp${fmt(tot/n/b.hari)} per Serdik per hari</text>`;
  $('#bgOut').innerHTML=`<h3>Estimasi anggaran</h3><svg class="vis" viewBox="0 0 ${W} ${H}">${s}</svg><div class="row" style="flex-wrap:nowrap;gap:14px;align-items:center">${V.donut(parts,150,`<tspan x="75" dy="4" class="t-strong">komposisi</tspan>`,anim)}<div class="legend-row" style="display:grid;gap:4px">${parts.map(p=>`<span><i style="background:${p.c}"></i>${p.l} · Rp${fmt(p.v)}</span>`).join('')}</div></div>`;}
