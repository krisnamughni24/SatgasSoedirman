
/* ================================================================
   OPERATIONS SIMULATION ENGINE
   ================================================================ */
const STAT={off:['Belum check-in','#B5B0A4'],duty:['Siaga di desa','#13274A'],travel:['Dalam perjalanan','#C59A4A'],visit:['Kunjungan warga','#4A86C8'],meet:['Rapat koordinasi','#6A4C93'],help:['Membantu rekan','#B0476A'],rest:['Istirahat','#9A958A'],kendala:['Kendala lapangan','#A3202C']};
const EVT={checkin:['Check-in','CI','#13274A'],visit:['Kunjungan warga','KJ','#4A86C8'],aspirasi:['Aspirasi baru','AS','#C59A4A'],rujukan:['Diteruskan ke instansi','RJ','#2A7F86'],respons:['Respons instansi','RI','#2E7A52'],monitor:['Validasi & pantau','PM','#6E7487'],bantuan:['Bantuan rekan','BR','#B0476A'],referral:['Rujukan antar-Serdik','RS','#6A4C93'],kendala:['Kendala lapangan','KD','#A3202C'],eskalasi:['Eskalasi ke posko','ES','#6B0F18'],rapat:['Rapat koordinasi','RP','#6A4C93'],selesai:['Peringatan ditangani','OK','#2E7A52'],sistem:['Sistem','SY','#5E6577']};
const CLHEX={A:'#B07A1E',B:'#9E2A3A',C:'#2E7A52',D:'#3B6FB6'};
const PROVHEX={'Banten':'#B07A1E','DKI Jakarta':'#A3202C','Jawa Barat':'#2E7A52','Jawa Tengah':'#3B6FB6','DI Yogyakarta':'#6A4C93','Jawa Timur':'#2A7F86'};
const KENDALA=['Kendaraan mogok di jalur desa','Akses jalan tertutup longsor kecil','Sinyal hilang, laporan tertunda','Penolakan warga saat sosialisasi','Hujan deras, kegiatan ditunda','Jembatan darurat tidak bisa dilalui','Perangkat desa belum memberi izin kegiatan'];
const WLBL={komp:'Kesesuaian kompetensi dengan kebutuhan wilayah',bahasa:'Bahasa daerah & budaya lokal',pengabdian:'KKN & pengabdian masyarakat',pengalaman:'Pengalaman kerja, kepemimpinan, sertifikasi',preferensi:'Asal daerah / preferensi wilayah',komplementer:'Komplementaritas dengan anggota tim'};
const WSHORT={komp:'Kompetensi',bahasa:'Bahasa daerah',pengabdian:'Pengabdian',pengalaman:'Pengalaman',preferensi:'Preferensi/asal',komplementer:'Komplementaritas'};
let me=null;

R.forEach(r=>{r.villages=[];for(let k=0;k<9;k++){const a=hsh(r.id*31+k*7)*Math.PI*2,d=.55+hsh(r.id*17+k*3)*1.85;
  const nm=DESA_A[Math.floor(hsh(r.id*7+k)*DESA_A.length)]+DESA_B[Math.floor(hsh(r.id*13+k*5)*DESA_B.length)];
  r.villages.push({name:nm,x:r.x+Math.cos(a)*d,z:r.z+Math.sin(a)*d});}});
I.forEach(it=>{it.owner=reporter(it);it.createdAbs=0;});

const sim={day:12,min:7*60+15,speed:1,playing:true,acc:0,events:[],alerts:[],aid:0,newEv:[],today:{},hourly:{},
  stats:{handled:0,onTime:0,resp:[]},chat:[],pendingReplies:[],myTasks:[],tid:0,history:[],alertVer:0,myVer:0,chatVer:0,silent:false};
const abs=()=>sim.day*1440+sim.min;
const hhmm=m=>{m=((Math.round(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
function actF(){const t=(sim.min-450)/600;return Math.max(.12,Math.sin(Math.PI*Math.min(1,Math.max(0,t))))*(sim.min>=720&&sim.min<780?.45:1);}
for(let d=0;d<14;d++){const dow=(d+3)%7;sim.history.push(Math.round(170+d*3.2+(dow>=5?-38:0)+(hsh(d*9.7)-.5)*36));}
function resetDay(){sim.today={};Object.keys(EVT).forEach(k=>sim.today[k]=0);sim.hourly={};R.forEach(r=>r.actToday=0);
  S.forEach(s=>{s.visitsToday=0;s.checkinAt=rint(7*60+12,8*60+45);});}
function initSimState(){
  S.forEach(s=>{s.weekVisits=s.weekVisits??rint(6,22);
    if(!s.region){s.st='off';return;}
    s.cx=s.px;s.cz=s.pz;s.purpose=null;s.until=0;s.pendingAsp=0;
    s.st=s===me?'off':(s.checkinAt<=sim.min?'duty':'off');s.act=s.st==='duty'?'Siaga di posko desa':'Belum check-in';});
}
resetDay();

let evid=0;
function emit(type,o){
  const ev={id:++evid,type,abs:abs(),time:hhmm(sim.min),text:o.text,s:o.s||null,r:o.r||(o.s&&o.s.region)||null,x:o.x,z:o.z,important:!!o.important};
  if(ev.x==null&&ev.s){ev.x=ev.s.cx;ev.z=ev.s.cz;}
  if(ev.x==null&&ev.r){ev.x=ev.r.x;ev.z=ev.r.z;}
  ev.mine=!!(me&&(isField()?(ev.s===me||(ev.r&&ev.r===me.region)):(USER&&USER.provs&&ev.r&&inScope(ev.r))));
  sim.events.unshift(ev);if(sim.events.length>600)sim.events.length=600;
  sim.today[type]=(sim.today[type]||0)+1;
  const h=Math.floor(sim.min/60);(sim.hourly[type]=sim.hourly[type]||{})[h]=(sim.hourly[type][h]||0)+1;
  if(ev.r)ev.r.actToday=(ev.r.actToday||0)+1;
  if(!sim.silent){sim.newEv.push(ev);fx.queue.push(ev);if(fx.queue.length>60)fx.queue.splice(0,fx.queue.length-60);}
  return ev;
}
function startTravel(s,x,z,purpose,ctx={}){
  s.st='travel';s.dx=x;s.dz=z;s.purpose=purpose;s.ctx=ctx;
  s.act=purpose==='visit'?`Menuju Desa ${ctx.v.name}`:purpose==='help'?`Menuju lokasi ${ctx.target.name}`:purpose==='meet'?'Menuju rapat koordinasi':'Kembali ke posko desa';
  if(s===me)sim.myVer++;
}
function goHome(s){startTravel(s,s.px,s.pz,'home');}
function arrive(s){
  const now=abs(),c=s.ctx||{};
  if(s.purpose==='visit'){
    s.st='visit';s.until=now+rint(28,70);s.visitsToday++;s.vol++;s.weekVisits++;s.lastVillage=c.v;s.act=`Kunjungan warga di Desa ${c.v.name}`;
    emit('visit',{s,text:`${s===me?'Anda':s.name} memulai kunjungan warga di Desa ${c.v.name}`});
    if(s===me||rnd()<.34)s.pendingAsp=now+rint(6,20);
  }else if(s.purpose==='help'){
    s.st='help';s.until=now+rint(30,50);s.act=`Membantu ${c.target.name}`;
    addEdge(s,c.target,'bantuan');
    emit('bantuan',{s,text:`${s===me?'Anda':s.name} tiba membantu ${c.target===me?'Anda':c.target.name} (${c.target.region.name})`});
    if(c.alert)resolveAlert(c.alert,s===me?'Anda':s.name);
  }else if(s.purpose==='meet'){s.st='meet';s.until=Math.max(c.end,now+20);s.act='Rapat koordinasi tim';}
  else{s.st='duty';s.act='Siaga di posko desa';}
  s.purpose=null;if(s===me)sim.myVer++;
}
function nearestWith(k,r,excl){
  let best=null,bd=1e9;
  S.forEach(s=>{if(!s.region||s.region===r||s===excl||s['c'+k]<70)return;const d=Math.hypot(s.px-r.x,s.pz-r.z);if(d<bd&&d<30){bd=d;best=s;}});
  return best;
}
function createAspirasi(s,o={}){
  const r=s.region;
  const it=makeIssue(r,Object.assign({si:0,days:0,fresh:true,desa:(s.lastVillage||pick(r.villages)).name},o));
  it.owner=s;it.createdAbs=abs();it.monitored=false;it.feedback=false;
  emit('aspirasi',{s,important:it.pr>=82,text:`${s===me?'Anda':s.name} mencatat: “${it.title}” · ${r.name}`});
  if(it.pr>=82)addAlert({type:'kritis',s,r,it,text:`P${it.pr} · ${it.title} (Desa ${it.desa})`});
  const k=CAT_CL[it.cat];
  if(r.cov[k]<60){const h=nearestWith(k,r,s);if(h){it.referredTo=h;addEdge(s,h,'referral');fx.arc(s,h,EVT.referral[2]);
    emit('referral',{s,text:`${s===me?'Anda':s.name} merujuk ${it.id} ke ${h===me?'Anda':h.name} (${h.region.name}), kuat di kluster ${k}`});
    if(h===me)addTask({type:'ref',it,from:s});}}
  r.bump=1;if(s===me)sim.myVer++;
  return it;
}
function randIssue(pred){for(let t=0;t<40;t++){const it=I[Math.floor(rnd()*I.length)];if(pred(it))return it;}return null;}
function evRujukan(){const it=randIssue(i=>(i.si===2||i.si===3)&&i.auth>=1&&i.owner!==me);if(!it)return;it.si=4;it.monitored=true;
  emit('rujukan',{s:it.owner,r:it.region,text:`${it.id} diteruskan ke ${INST[it.cat]} · ${it.region.name}`});}
function evRespons(){const it=randIssue(i=>i.si===4||i.si===5);if(!it)return;const ok=rnd()<.6;it.si=ok?6:5;if(ok&&it.owner!==me&&rnd()<.8)it.feedback=true;if(window.__fb)window.__fb(it);
  emit('respons',{s:it.owner,r:it.region,text:ok?`${INST[it.cat]} menindaklanjuti ${it.id} · ${it.region.name}`:`${INST[it.cat]} meminta data tambahan untuk ${it.id}`});
  if(it.owner===me)addTask({type:'resp',it,ok});}
function evMonitor(){const it=randIssue(i=>i.si<6&&i.owner!==me);if(!it)return;
  if(it.si<=1){it.si++;emit('monitor',{s:it.owner,r:it.region,text:`${it.id} ${it.si===1?'masuk verifikasi':'tervalidasi'} · ${it.region.name}`});}
  else{it.monitored=true;emit('monitor',{s:it.owner,r:it.region,text:`Pemantauan tindak lanjut ${it.id} oleh ${it.owner?it.owner.name:'tim'}`});}}
function evBantuan(){const s=pick(S.filter(x=>x.region&&x!==me&&(x.st==='duty'||x.st==='visit')));if(!s)return;
  if(sim.alerts.some(a=>a.s===s&&a.state!=='done'))return;
  const need=['A','B','C','D'].sort((a,b)=>s['c'+a]-s['c'+b])[0];
  addAlert({type:'bantuan',s,need,text:`${s.name} butuh dukungan ${CL[need].toLowerCase()} untuk warga di ${s.lastVillage?'Desa '+s.lastVillage.name:s.region.name}`});}
function evKendala(){const s=pick(S.filter(x=>x.region&&x!==me&&(x.st==='travel'||x.st==='visit')));if(!s)return;
  s.st='kendala';s.until=0;s.purpose=null;s.act='Kendala: '+pick(KENDALA);
  addAlert({type:'kendala',s,text:s.act.replace('Kendala: ','')});}
function evRequestToMe(){
  if(sim.alerts.some(a=>a.toMe&&a.state==='open'))return;
  const cand=S.filter(x=>x.region&&x!==me&&x.st!=='off'&&x.st!=='kendala'&&Math.hypot(x.cx-me.cx,x.cz-me.cz)<16);if(!cand.length)return;
  const s=pick(cand);
  addAlert({type:'bantuan',s,need:me.dom,toMe:true,text:`${s.name} (${s.region.name}) meminta bantuan Anda di kluster ${me.dom}: ${CL[me.dom].toLowerCase()}`});
  if(s.region===me.region)pushChat(s,`${me.name.split(' ')[0]}, boleh minta tolong? Ada warga yang butuh pendampingan ${CL[me.dom].split(' ')[0].toLowerCase()}.`);
}
function addAlert(o){
  const a=Object.assign({id:'ALR-'+String(++sim.aid).padStart(3,'0'),created:abs(),state:'open'},o);
  a.due=a.created+(a.type==='kendala'?40:a.type==='kritis'?60:50);
  sim.alerts.unshift(a);sim.alertVer++;if(a.toMe||a.s===me)sim.myVer++;
  if(a.type==='kendala')emit('kendala',{s:a.s,important:true,text:`Kendala: ${a.text} · ${a.s.name}, ${a.s.region.name}`});
  else if(a.type==='bantuan')emit('bantuan',{s:a.s,important:a.toMe,text:a.toMe?`Permintaan bantuan untuk Anda dari ${a.s.name}`:`${a.s.name} meminta bantuan rekan (kluster ${a.need})`});
  return a;
}
function resolveAlert(a,who,auto){
  if(a.state==='done')return;
  a.state='done';a.doneAt=abs();a.handler=who;const late=a.doneAt>a.due;
  sim.stats.handled++;sim.stats.resp.push(a.doneAt-a.created);if(!late)sim.stats.onTime++;
  if(a.type==='kendala'&&a.s.st==='kendala'){a.s.st='duty';a.s.act='Kendala teratasi, kembali bertugas';}
  sim.alertVer++;sim.myVer++;
  emit('selesai',{s:a.s,text:`${a.id} ditangani ${who}${late?' · melewati SLA':' · tepat waktu'}${auto?' (otomatis)':''}`});
}
function helpersFor(a){
  const k=a.need||a.s.dom;
  return S.filter(s=>s.region&&s!==a.s&&!s.unavailable&&['duty','visit','rest'].includes(s.st))
    .map(s=>{const d=Math.hypot(s.cx-a.s.cx,s.cz-a.s.cz);return{s,d,sc:s['c'+k]/100*.6+Math.max(0,1-d/25)*.4+(s.region===a.s.region?.08:0)};})
    .sort((x,y)=>y.sc-x.sc).slice(0,3);
}
function assignHelper(a,h){
  a.state='handling';a.handler=h===me?'Anda':h.name;a.helper=h;
  const d=Math.hypot(h.cx-a.s.cx,h.cz-a.s.cz);fx.arc(h,a.s,EVT.bantuan[2]);addEdge(h,a.s,'bantuan');
  if(d<4.5)startTravel(h,a.s.cx+.18,a.s.cz+.12,'help',{target:a.s,alert:a});
  else{h.st='help';h.until=abs()+35;h.act=`Dukungan daring untuk ${a.s.name}`;a.resolveAt=abs()+rint(15,25);}
  emit('bantuan',{s:h,text:`${h===me?'Anda':h.name} ${d<4.5?'berangkat membantu':'memberi dukungan daring kepada'} ${a.s===me?'Anda':a.s.name} (${a.s.region.name})`});
  sim.alertVer++;sim.myVer++;
}
function alertAct(a,act){
  if(!a||a.state!=='open')return;
  const now=abs();
  if(act==='koord'){a.state='handling';a.resolveAt=now+rint(14,28);a.handler=(a.s.region.coord&&a.s.region.coord!==a.s?a.s.region.coord.name:'Koordinator wilayah');
    if(a.s.region.coord)addEdge(a.s,a.s.region.coord,'tim');emit('monitor',{s:a.s,text:`${a.id}: koordinator ${a.handler} menghubungi ${a.s.name}`});toast('Koordinator wilayah dihubungi');}
  else if(act==='eskalasi'){a.state='handling';a.resolveAt=now+rint(28,50);a.handler='Posko Satgas';
    emit('eskalasi',{s:a.s,important:true,text:`${a.id} dieskalasi ke Posko Satgas · ${a.s.region.name}`});fx.arcPos(a.s,POSKO,EVT.eskalasi[2]);toast('Dieskalasi ke Posko Satgas');}
  else if(act==='validasi'){a.it.si=Math.max(a.it.si,2);resolveAlert(a,'Anda (validasi)');toast(`${a.it.id} divalidasi dan diprioritaskan`);}
  else if(act==='rujuk'){a.it.si=4;a.it.monitored=true;emit('rujukan',{s:a.s,text:`${a.it.id} dirujuk ke ${INST[a.it.cat]} · ${a.s.region.name}`});resolveAlert(a,'Anda (rujukan)');toast(`Dirujuk ke ${INST[a.it.cat]}`);}
  else if(act==='accept'){a.toMe=false;assignHelper(a,me);toast('Anda menerima permintaan bantuan');}
  else if(act==='decline'){a.toMe=false;const h=helpersFor(a).find(x=>x.s!==me);if(h)assignHelper(a,h.s);toast(h?`Dialihkan ke ${h.s.name}`:'Dikembalikan ke antrean');}
  else if(act.startsWith('help:')){assignHelper(a,S[+act.split(':')[1]]);toast('Bantuan rekan ditugaskan');}
  sim.alertVer++;sim.myVer++;
}
function addTask(t){t.id=++sim.tid;t.created=abs();sim.myTasks.unshift(t);sim.myVer++;}
function doneTask(id){sim.myTasks=sim.myTasks.filter(t=>t.id!==id);sim.myVer++;}

/* team chat (my team only) */
const CHAT_T=['Update: kunjungan di Desa {v} selesai, ada {n} warga yang menyampaikan keluhan.','Ada yang lewat arah {v}? Saya perlu titip formulir persetujuan dokumentasi.','Catatan: Pak Kades minta jadwal sosialisasi minggu depan dipercepat.','Saya sudah unggah bukti foto untuk aspirasi tadi, mohon dicek.','Info: sinyal di Desa {v} lemah, laporan saya kirim sore.','Apakah ada yang punya kontak bidang kesehatan di puskesmas kecamatan?','Rekap sementara: {n} kunjungan pagi ini, semua lancar.','Warga Desa {v} menanyakan kelanjutan aspirasi bulan lalu, saya bantu cek statusnya.'];
const REPLY_T={bantu:'Siap, saya bisa merapat setelah kunjungan ini selesai.',rapat:'Oke, saya ikut rapatnya.',cek:'Sudah saya cek, statusnya masih menunggu respons instansi.',default:['Siap, dicatat.','Terima kasih infonya.','Baik, nanti saya tindak lanjuti.','Noted, saya kabari lagi sore ini.']};
function pushChat(s,text,sys){sim.chat.push({abs:abs(),time:hhmm(sim.min),from:s,text,mine:s===me,sys:!!sys});if(sim.chat.length>80)sim.chat.shift();sim.chatVer++;}
function chatTick(){const tm=me.region.team.filter(x=>x!==me&&x.st!=='off');if(!tm.length)return;const s=pick(tm);
  pushChat(s,pick(CHAT_T).replace('{v}',(s.lastVillage||pick(s.region.villages)).name).replace('{n}',rint(2,7)));}
function myChat(text){
  pushChat(me,text);
  const tm=me.region.team.filter(x=>x!==me);if(!tm.length)return;
  const low=text.toLowerCase();const rep=/bantu|tolong/.test(low)?REPLY_T.bantu:/rapat|kumpul/.test(low)?REPLY_T.rapat:/status|cek/.test(low)?REPLY_T.cek:pick(REPLY_T.default);
  sim.pendingReplies.push({at:abs()+rint(2,6),from:pick(tm),text:rep});tm.forEach(t=>addEdge(me,t,'tim',.2));
}

function stepMinute(){
  sim.min++;
  if(sim.min>=17*60+30){endDay();return;}
  const f=actF(),now=abs();
  for(const s of S){
    if(!s.region||s.unavailable||s.tw)continue;
    const auto=s!==me;
    if(s.pendingAsp&&now>=s.pendingAsp&&s.st==='visit'){s.pendingAsp=0;
      if(s===me)addTask({type:'asp',v:s.lastVillage});else createAspirasi(s);}
    if(s.st==='off'){if(auto&&sim.min>=s.checkinAt){s.st='duty';s.act='Siaga di posko desa';emit('checkin',{s,text:`${s.name} check-in di ${s.region.name}`});}continue;}
    if((s.st==='visit'||s.st==='help'||s.st==='meet')&&now>=s.until){if(auto||s.st!=='visit')goHome(s);continue;}
    if(s.st==='rest'&&s.until&&now>=s.until&&auto){s.st='duty';s.act='Siaga di posko desa';continue;}
    if(!auto)continue;
    if(s.st==='duty'){
      if(sim.min===12*60&&rnd()<.55){s.st='rest';s.until=now+rint(40,65);s.act='Istirahat siang';continue;}
      if(rnd()<.0048*f){startTravel(s,0,0,'visit',{v:pick(s.region.villages)});s.dx=s.ctx.v.x;s.dz=s.ctx.v.z;}
    }
  }
  const roll=(p,fn)=>{if(rnd()<p*f)fn();};
  roll(.24,evRujukan);roll(.15,evRespons);roll(.2,evMonitor);roll(.045,evBantuan);roll(.03,evKendala);
  if(me&&isField()&&me.st!=='off'&&rnd()<.011*f)evRequestToMe();
  if(me&&isField()&&rnd()<.028*f)chatTick();
  if(window.__hubTick)window.__hubTick(f);
  sim.pendingReplies=sim.pendingReplies.filter(p=>{if(now>=p.at){pushChat(p.from,p.text);return false;}return true;});
  for(const a of sim.alerts){
    if(a.state==='handling'&&a.resolveAt&&now>=a.resolveAt)resolveAlert(a,a.handler);
    else if(a.state==='open'&&a.toMe&&now>a.due){a.toMe=false;const h=helpersFor(a).find(x=>x.s!==me);if(h)assignHelper(a,h.s);}
    else if(a.state==='open'&&now>a.due+40){if(a.type==='kritis'){a.it.si=Math.max(a.it.si,2);}resolveAlert(a,'Koordinator wilayah',true);}
  }
  if(sim.min%15===0){const n=sim.alerts.length;sim.alerts=sim.alerts.filter(a=>a.state!=='done'||now-a.doneAt<180);if(n!==sim.alerts.length)sim.alertVer++;}
}
function endDay(){
  sim.history.push(sim.today.aspirasi||0);
  sim.day++;sim.min=7*60+10;resetDay();
  S.forEach(s=>{if(!s.region)return;s.cx=s.px;s.cz=s.pz;s.st='off';s.act='Belum check-in';s.purpose=null;s.pendingAsp=0;});
  sim.alerts=sim.alerts.filter(a=>a.state!=='done');sim.alertVer++;sim.myVer++;
  emit('sistem',{text:`Hari ke-${sim.day} penugasan dimulai`});pushChat(null,`Hari ke-${sim.day} dimulai. Jangan lupa check-in.`,true);
}

/* interaction network */
const net={edges:new Map(),flash:[],ver:0};
function addEdge(a,b,type,w=1){
  if(!a||!b||a===b)return;const k=a.idx<b.idx?a.idx+'|'+b.idx:b.idx+'|'+a.idx;
  let e=net.edges.get(k);if(!e){e={a:Math.min(a.idx,b.idx),b:Math.max(a.idx,b.idx),w:0,types:{}};net.edges.set(k,e);net.ver++;}
  e.w+=w;e.types[type]=(e.types[type]||0)+w;e.last=type;if(!sim.silent)net.flash.push({e,t:0,type});
}
function seedEdges(){
  sim.silent=true;
  R.forEach(r=>{for(let i=0;i<r.team.length;i++)for(let j=i+1;j<r.team.length;j++)addEdge(r.team[i],r.team[j],'tim',rint(3,8));});
  const pl=S.filter(s=>s.region);
  for(let n=0;n<460;n++){const a=pick(pl);const near=pl.filter(b=>b.region!==a.region&&Math.hypot(b.px-a.px,b.pz-a.pz)<13);if(near.length)addEdge(a,pick(near),pick(['bantuan','referral','rapat','bantuan']),rint(1,3));}
  for(let n=0;n<80;n++){const a=pick(pl);const same=pl.filter(x=>x.dom===a.dom&&x!==a);addEdge(a,pick(same),'berbagi',1);}
  sim.silent=false;
}
seedEdges();
initSimState();
// warm up so the console is already alive at login
sim.silent=true;for(let i=0;i<25;i++)stepMinute();sim.silent=false;sim.newEv=[];

/* ================================================================
   3D SCENE
   ================================================================ */
const JAVA=[[105.21,-6.75],[105.55,-6.48],[105.83,-5.92],[106.05,-5.88],[106.4,-6.0],[106.75,-6.08],[107.0,-6.0],[107.4,-5.95],[107.7,-6.2],[108.0,-6.25],[108.33,-6.25],[108.55,-6.68],[108.85,-6.8],[109.3,-6.85],[109.7,-6.85],[110.2,-6.9],[110.45,-6.92],[110.6,-6.52],[110.9,-6.4],[111.1,-6.62],[111.5,-6.62],[112.0,-6.85],[112.55,-6.88],[112.65,-7.2],[112.8,-7.25],[112.85,-7.55],[113.3,-7.68],[113.8,-7.7],[114.05,-7.62],[114.45,-7.8],[114.4,-8.4],[114.6,-8.75],[114.2,-8.65],[113.5,-8.38],[113.0,-8.32],[112.5,-8.42],[112.0,-8.32],[111.4,-8.27],[110.7,-8.17],[110.3,-8.02],[109.8,-7.82],[109.2,-7.78],[108.8,-7.72],[108.5,-7.82],[108.0,-7.77],[107.5,-7.58],[107.0,-7.47],[106.45,-7.38],[106.38,-6.98],[105.85,-6.87],[105.45,-6.88]];
const MADU=[[112.68,-6.92],[113.2,-6.87],[113.7,-6.87],[114.12,-6.95],[114.1,-7.17],[113.6,-7.23],[113.0,-7.22],[112.7,-7.16]];
const POSKO=(()=>{const p=proj(106.83,-6.0);return{x:p.x,z:p.z};})();
const fx={queue:[],pulses:[],arcs:[],callouts:[],lastFollow:0,
  arc(a,b,col){this.arcs.push({ax:a.cx,az:a.cz,bx:b.cx,bz:b.cz,col,t:0});},
  arcPos(a,p,col){this.arcs.push({ax:a.cx,az:a.cz,bx:p.x,bz:p.z,col,t:0});}};
let T=null,dotIndex=[];
state.metric='isu';state.colorMode='status';state.side='alert';
function initScene(){
  const stage=$('#stage');
  if(!window.THREE||!THREE.OrbitControls){stage.insertAdjacentHTML('beforeend','<div class="empty" style="margin:40px">Pustaka 3D tidak dapat dimuat. Modul lain tetap berjalan.</div>');return;}
  let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(e){stage.insertAdjacentHTML('beforeend','<div class="empty" style="margin:40px">Peramban ini tidak mendukung WebGL.</div>');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#DDE3EC');scene.fog=new THREE.Fog('#DDE3EC',140,260);
  const camera=new THREE.PerspectiveCamera(36,1,.5,800);
  const controls=new THREE.OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.08;controls.maxPolarAngle=1.36;controls.minDistance=6;controls.maxDistance=170;controls.autoRotateSpeed=.5;
  const HOME={cam:new THREE.Vector3(-4,56,60),tgt:new THREE.Vector3(1,0,1)};
  camera.position.set(-30,150,150);controls.target.copy(HOME.tgt);
  scene.add(new THREE.HemisphereLight(0xffffff,0x9fb3a8,.9));
  const sun=new THREE.DirectionalLight(0xffffff,.65);sun.position.set(-30,60,40);scene.add(sun);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(500,300),new THREE.MeshBasicMaterial({color:'#DDE3EC'}));sea.rotation.x=-Math.PI/2;scene.add(sea);
  const grid=new THREE.GridHelper(500,100,'#C3CCDA','#D3D9E3');grid.position.y=.02;scene.add(grid);
  const landMat=new THREE.MeshStandardMaterial({color:'#FBF6EA',roughness:.95});
  const edgeMat=new THREE.LineBasicMaterial({color:'#B6A57E'});
  const mkLand=pts=>{const sh=new THREE.Shape(pts.map(([lo,la])=>{const p=proj(lo,la);return new THREE.Vector2(p.x,-p.z);}));
    const g=new THREE.ExtrudeGeometry(sh,{depth:.5,bevelEnabled:true,bevelThickness:.12,bevelSize:.2,bevelSegments:2});g.rotateX(-Math.PI/2);scene.add(new THREE.Mesh(g,landMat));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.concat([pts[0]]).map(([lo,la])=>{const p=proj(lo,la);return new THREE.Vector3(p.x,.66,p.z);})),edgeMat));};
  mkLand(JAVA);mkLand(MADU);
  // village markers (tiny)
  const vg=new THREE.InstancedMesh(new THREE.CircleGeometry(.09,8),new THREE.MeshBasicMaterial({color:'#CDBF9F'}),R.length*9);
  const vm=new THREE.Matrix4(),rx=new THREE.Matrix4().makeRotationX(-Math.PI/2);let vi=0;
  R.forEach(r=>r.villages.forEach(v=>{vm.copy(rx);vm.setPosition(v.x,.665,v.z);vg.setMatrixAt(vi++,vm);}));scene.add(vg);
  const colGeo=new THREE.CylinderGeometry(.34,.38,1,6);colGeo.translate(0,.5,0);
  const cols=R.map(r=>{const m=new THREE.Mesh(colGeo,new THREE.MeshStandardMaterial({color:'#C9B48A',roughness:.55,transparent:true,opacity:.92,emissive:'#000000'}));
    m.position.set(r.x,.62,r.z);m.scale.y=.05;m.userData={r,target:1};scene.add(m);return m;});
  const dots=new THREE.InstancedMesh(new THREE.SphereGeometry(.16,12,8),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.45}),S.length);
  dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(dots);
  const lineGeo=new THREE.BufferGeometry();const lines=new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({color:'#8C8676',transparent:true,opacity:.5}));scene.add(lines);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.3,.05,8,64),new THREE.MeshBasicMaterial({color:'#13274A'}));ring.rotation.x=Math.PI/2;ring.visible=false;scene.add(ring);
  const meMark=new THREE.Mesh(new THREE.OctahedronGeometry(.42),new THREE.MeshStandardMaterial({color:'#13274A',emissive:'#13274A',emissiveIntensity:.35}));scene.add(meMark);
  const meRing=new THREE.Mesh(new THREE.RingGeometry(.42,.56,40),new THREE.MeshBasicMaterial({color:'#13274A',transparent:true,side:THREE.DoubleSide,depthWrite:false}));meRing.rotation.x=-Math.PI/2;scene.add(meRing);
  // posko
  const posko=new THREE.Group();const pb=new THREE.Mesh(new THREE.CylinderGeometry(.5,.7,2.4,8),new THREE.MeshStandardMaterial({color:'#FFFFFF'}));pb.position.y=1.2;posko.add(pb);
  const pt=new THREE.Mesh(new THREE.ConeGeometry(.65,.9,8),new THREE.MeshStandardMaterial({color:'#A3202C'}));pt.position.y=2.85;posko.add(pt);posko.position.set(POSKO.x,.3,POSKO.z);scene.add(posko);
  const pulseGeo=new THREE.RingGeometry(.5,.66,40);
  const pulses=Array.from({length:48},()=>{const m=new THREE.Mesh(pulseGeo,new THREE.MeshBasicMaterial({color:'#fff',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);return{m,t:9};});
  const labels=PROV.map(p=>{const rs=R.filter(r=>r.prov===p);const el=document.createElement('div');el.className='plabel';el.textContent=p;stage.appendChild(el);
    let x=rs.reduce((a,r)=>a+r.x,0)/rs.length,z=rs.reduce((a,r)=>a+r.z,0)/rs.length;if(p==='DKI Jakarta')z-=4;if(p==='DI Yogyakarta')z+=4.5;if(p==='Banten')z+=1.5;
    return{el,v:new THREE.Vector3(x,1.3,z)};});
  const pl=document.createElement('div');pl.className='plabel';pl.style.color='#A3202C';pl.textContent='Posko Satgas';stage.appendChild(pl);labels.push({el:pl,v:new THREE.Vector3(POSKO.x,4.2,POSKO.z)});
  T={renderer,scene,camera,controls,HOME,cols,dots,lines,ring,meMark,meRing,pulses,labels,stage,hover:null,fly:null,arcObjs:[]};
  new ResizeObserver(resize).observe(stage);resize();
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;
  const pickAt=e=>{const b=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);
    const h=ray.intersectObjects([dots,...cols],false)[0];if(!h)return null;
    if(h.object===dots){const s=dotIndex[h.instanceId];return s?{kind:'s',s}:null;}return{kind:'r',r:h.object.userData.r};};
  renderer.domElement.addEventListener('pointermove',e=>{
    const tip=$('#tip'),h=pickAt(e);T.hover=h&&h.kind==='r'?h.r:null;
    if(!h){tip.hidden=true;renderer.domElement.style.cursor='';return;}
    renderer.domElement.style.cursor='pointer';const b=stage.getBoundingClientRect();
    tip.innerHTML=h.kind==='r'?`<b>${esc(h.r.name)}</b><br><span class="muted">${esc(h.r.prov)}</span><br>${metricLabel(h.r)}`
      :`<b>${esc(h.s.name)}</b>${h.s===me?' <span class="pill acc">Anda</span>':''}<br><span style="color:${STAT[h.s.st][1]}">● ${STAT[h.s.st][0]}</span><br><span class="muted">${esc(h.s.act||'')}</span>`;
    tip.hidden=false;tip.style.left=Math.max(4,Math.min(e.clientX-b.left+14,b.width-260))+'px';tip.style.top=Math.max(4,Math.min(e.clientY-b.top+14,b.height-90))+'px';});
  renderer.domElement.addEventListener('pointerleave',()=>{$('#tip').hidden=true;T.hover=null;});
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};T.fly=null;$('#tRotate').checked=false;});
  renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5){down=null;return;}down=null;
    const h=pickAt(e);if(!h)return;if(h.kind==='r')selectRegion(h.r,true);else openProfile(h.s);});
  flyTo(null,2.6);
}
function resize(){if(!T)return;const w=T.stage.clientWidth,h=T.stage.clientHeight;if(!w||!h)return;T.renderer.setSize(w,h,false);T.camera.aspect=w/h;T.camera.updateProjectionMatrix();}
function metricVal(r){
  if(state.metric==='aktivitas')return r.actToday||0;
  if(state.metric==='alert')return sim.alerts.filter(a=>a.state!=='done'&&a.s.region===r).length;
  if(state.metric==='komplementer')return r.covN;
  return I.filter(it=>it.region===r&&active(it)).length;
}
function metricLabel(r){const v=metricVal(r);return{isu:`${v} isu aktif`,aktivitas:`${v} aktivitas hari ini`,alert:`${v} peringatan terbuka`,komplementer:`${v}/4 kluster terpenuhi${r.missing.length?' · kurang '+r.missing.join(', '):''}`}[state.metric];}
let colCache=0;
function updateColumns(){
  if(!T)return;const vals=R.map(metricVal),mx=Math.max(...vals,1);
  const c0=new THREE.Color('#EADFC3'),c1=new THREE.Color('#13274A'),crit=new THREE.Color('#A3202C'),warn=new THREE.Color('#C9932F'),ok=new THREE.Color('#2E7A52');
  T.cols.forEach((m,i)=>{const r=R[i],v=vals[i],n=v/mx;
    if(state.metric==='komplementer'){m.userData.target=.6+v*1.3;m.material.color.copy(r.team.length===0?crit:r.complete?(r.covN===4?ok:c1):(r.missing.length>1?crit:warn));}
    else if(state.metric==='alert'){m.userData.target=v?1+v*2.2:.15;m.material.color.copy(v?crit:c0);}
    else{m.userData.target=.25+n*6.5;m.material.color.copy(c0).lerp(c1,n);}});
  renderLegend();
}
function renderLegend(){
  const m=state.metric;let h='';
  if(m==='komplementer')h='<div><b>Kelengkapan tim</b></div><div><span class="sw" style="background:#2E7A52"></span>A–D <span class="sw" style="background:#13274A;margin-left:6px"></span>A–C <span class="sw" style="background:#C9932F;margin-left:6px"></span>kurang 1 <span class="sw" style="background:#A3202C;margin-left:6px"></span>kurang ≥2</div>';
  else if(m==='alert')h='<div><b>Peringatan terbuka per wilayah</b></div>';
  else h=`<div><b>${m==='isu'?'Isu aktif':'Aktivitas hari ini'}</b></div><div style="height:7px;border-radius:4px;width:150px;max-width:100%;background:linear-gradient(90deg,#EADFC3,#13274A)"></div>`;
  if(state.colorMode==='status')h+='<div style="display:flex;flex-wrap:wrap;gap:2px 8px">'+['duty','travel','visit','help','meet','kendala','off'].map(k=>`<span><span class="sw" style="background:${STAT[k][1]}"></span>${STAT[k][0]}</span>`).join('')+'</div>';
  else h+='<div>'+['A','B','C','D'].map(k=>`<span class="sw" style="background:${CLHEX[k]};margin-left:4px"></span>${k}`).join(' ')+'</div>';
  h+='<div class="muted">◆ = posisi Anda · garis = ke koordinator</div>';
  $('#legend').innerHTML=h;
}
const _M=typeof THREE!=='undefined'?new THREE.Matrix4():null,_C=typeof THREE!=='undefined'?new THREE.Color():null;
function render3D(dt,now){
  if(!T)return;
  T.controls.autoRotate=$('#tRotate').checked&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(T.fly){const f=T.fly;f.t=Math.min(1,f.t+dt/f.dur);const e=f.t<.5?4*f.t*f.t*f.t:1-Math.pow(-2*f.t+2,3)/2;
    T.camera.position.lerpVectors(f.c0,f.c1,e);T.controls.target.lerpVectors(f.t0,f.t1,e);if(f.t>=1)T.fly=null;}
  T.cols.forEach(m=>{const r=m.userData.r;m.scale.y+=(m.userData.target-m.scale.y)*Math.min(1,dt*6);
    if(r.bump){r.bump=Math.max(0,r.bump-dt*1.6);}const b=1+(r.bump||0)*.7;m.scale.x=m.scale.z=b;
    m.material.emissive.setHex(0);if(r===state.sel||r===T.hover)m.material.emissive.set('#13274A').multiplyScalar(r===state.sel?.4:.22);});
  let k=0;dotIndex=[];const blink=.75+.45*Math.abs(Math.sin(now/220));
  for(const s of S){if(!s.region)continue;
    let sc=s.coord?1.4:1;if(s.st==='kendala')sc*=blink*1.3;if(s===me)sc=0;
    const y=.8+(s.ty||0);_M.makeScale(sc,sc,sc);_M.setPosition(s.cx,y,s.cz);T.dots.setMatrixAt(k,_M);
    _C.set(state.colorMode==='status'?STAT[s.st][1]:CLHEX[s.dom]);T.dots.setColorAt(k,_C);dotIndex[k]=s;k++;}
  T.dots.count=k;T.dots.instanceMatrix.needsUpdate=true;if(T.dots.instanceColor)T.dots.instanceColor.needsUpdate=true;
  if($('#tLines').checked){const pts=[];R.forEach(r=>{const c=r.coord;if(!c)return;r.team.forEach(s=>{if(s!==c)pts.push(c.cx,.8,c.cz,s.cx,.8,s.cz);});});
    T.lines.geometry.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));T.lines.visible=true;}else T.lines.visible=false;
  if(me&&me.region&&isField()){T.meMark.visible=T.meRing.visible=true;T.meMark.position.set(me.cx,1.45+Math.sin(now/400)*.2,me.cz);T.meMark.rotation.y+=dt*1.5;
    const rp=(now/1400)%1;T.meRing.position.set(me.cx,.7,me.cz);T.meRing.scale.setScalar(1+rp*2.4);T.meRing.material.opacity=1-rp;}else T.meMark.visible=T.meRing.visible=false;
  if(state.sel){T.ring.visible=true;T.ring.position.set(state.sel.x,.72,state.sel.z);T.ring.rotation.z+=dt*.4;}else T.ring.visible=false;
  // event pulses
  let spawned=0;
  while(fx.queue.length&&spawned<5){const ev=fx.queue.shift();if(ev.x==null)continue;
    const p=T.pulses.find(p=>p.t>=1.8)||T.pulses[0];p.t=0;p.m.visible=true;p.m.position.set(ev.x,.72,ev.z);p.m.material.color.set(EVT[ev.type][2]);p.big=ev.important||ev.type==='kendala';spawned++;
    if(ev.important)spawnCallout(ev);
    if(ev.important&&$('#tFollow').checked&&now-fx.lastFollow>6000&&state.tab==='operasi'&&!T.fly){fx.lastFollow=now;flyTo({x:ev.x,z:ev.z,close:true},1.4);}}
  T.pulses.forEach(p=>{if(p.t>=1.8){p.m.visible=false;return;}p.t+=dt;const k2=p.t/1.8;p.m.scale.setScalar(.4+k2*(p.big?6:3.4));p.m.material.opacity=Math.max(0,1-k2);});
  // arcs
  while(fx.arcs.length){const a=fx.arcs.shift();const d=Math.hypot(a.bx-a.ax,a.bz-a.az),hgt=1.4+d*.28,pts=[];
    for(let i=0;i<=40;i++){const t=i/40;pts.push(new THREE.Vector3(a.ax+(a.bx-a.ax)*t,.8+Math.sin(Math.PI*t)*hgt,a.az+(a.bz-a.az)*t));}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:a.col,transparent:true,opacity:1}));
    const ball=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color:a.col}));T.scene.add(line,ball);T.arcObjs.push({line,ball,pts,t:0});}
  T.arcObjs=T.arcObjs.filter(o=>{o.t+=dt/2.6;const i=Math.min(40,Math.floor(Math.min(1,o.t*1.4)*40));o.ball.position.copy(o.pts[i]);
    o.line.material.opacity=o.t<.7?1:Math.max(0,1-(o.t-.7)/.3);o.ball.visible=o.t<.72;
    if(o.t>=1){T.scene.remove(o.line,o.ball);o.line.geometry.dispose();o.ball.geometry.dispose();return false;}return true;});
  T.controls.update();T.renderer.render(T.scene,T.camera);
  const w=T.stage.clientWidth,h=T.stage.clientHeight;
  T.labels.forEach(p=>{const v=p.v.clone().project(T.camera);p.el.hidden=v.z>1;p.el.style.left=((v.x+1)/2*w)+'px';p.el.style.top=((1-v.y)/2*h)+'px';});
  fx.callouts=fx.callouts.filter(c=>{const age=now-c.born;const v=new THREE.Vector3(c.x,1.2,c.z).project(T.camera);
    c.el.style.left=((v.x+1)/2*w)+'px';c.el.style.top=((1-v.y)/2*h)+'px';c.el.hidden=v.z>1;
    if(age>4200&&!c.out){c.out=true;c.el.classList.add('out');}if(age>4800){c.el.remove();return false;}return true;});
}
function spawnCallout(ev){if(!T)return;if(fx.callouts.length>=3){const o=fx.callouts.shift();o.el.remove();}
  const el=document.createElement('div');el.className='callout';el.style.borderLeftColor=EVT[ev.type][2];
  el.innerHTML=`<b>${EVT[ev.type][0]}</b> · ${ev.time}<br>${esc(anonText(ev.text))}`;T.stage.appendChild(el);fx.callouts.push({el,x:ev.x,z:ev.z,born:performance.now()});}
function flyTo(r,dur=1.2){
  if(!T)return;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t1=r?new THREE.Vector3(r.x,0,r.z):T.HOME.tgt.clone();
  const c1=r?new THREE.Vector3(r.x-3,r.close?13:20,r.z+(r.close?12:19)):T.HOME.cam.clone();
  if(reduce){T.camera.position.copy(c1);T.controls.target.copy(t1);return;}
  T.fly={t:0,dur,c0:T.camera.position.clone(),c1,t0:T.controls.target.clone(),t1};
}

/* ================================================================
   LOGIN, ROUTING, TOUR
   ================================================================ */
function personaList(){
  const garut=R.find(r=>r.name==='Kab. Garut');
  const p=[];
  const add=(s,why)=>{if(s&&s.region&&!p.some(x=>x.s===s))p.push({s,why});};
  add(garut.coord,'Koordinator kabupaten');
  add(S.find(s=>s.priority==='kes'&&s.region),'Lapis 1 · mandat kesehatan');
  add(S.find(s=>!s.java&&s.region&&!s.coord),'Asal luar Jawa');
  add(S.find(s=>s.conf<=2&&s.region&&!s.coord&&s.java),'Perlu pembekalan, punya buddy');
  return p;
}
function initLogin(){
  const ps=personaList();
  $('#personas').innerHTML=ps.map((p,i)=>`<button type="button" class="persona" data-sid="${p.s.idx}" aria-pressed="${i===0}"><div class="avatar" style="background:${CLHEX[p.s.dom]}">${esc(initials(p.s.name))}</div><div><b>${esc(p.s.name)} · ${p.s.id}</b><span>${esc(p.why)} · ${esc(p.s.region.name)}</span></div></button>`).join('');
  $('#loginId').value=ps[0].s.id;
  $('#personas').onclick=e=>{const b=e.target.closest('[data-sid]');if(!b)return;$$('.persona').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#loginId').value=S[+b.dataset.sid].id;};
  $('#randomPersona').onclick=()=>{const s=pick(S.filter(x=>x.region));$('#loginId').value=s.id;$$('.persona').forEach(x=>x.setAttribute('aria-pressed','false'));};
  $('#loginForm').onsubmit=e=>{e.preventDefault();const id=$('#loginId').value.trim().toUpperCase();
    const s=S.find(x=>x.id===id||x.id==='SRD-'+id.replace(/\D/g,'').padStart(3,'0'));
    const err=$('#loginErr');
    if(!s){err.textContent='ID tidak ditemukan. Gunakan format SRD-001 sampai SRD-384.';err.hidden=false;return;}
    if(!s.region){err.textContent='Serdik ini sedang disimulasikan berhalangan. Pilih ID lain.';err.hidden=false;return;}
    if(!/^\d{4}$/.test($('#loginPin').value)){err.textContent='PIN demo terdiri dari 4 angka.';err.hidden=false;return;}
    err.hidden=true;login(s);};
  const tk=$('#loginTicker');const lines=()=>{const on=S.filter(s=>s.region&&s.st!=='off').length;return[`${hhmm(sim.min)} WIB · ${on} Serdik sudah check-in`,`${I.filter(active).length} aspirasi aktif dipantau`,`${sim.alerts.filter(a=>a.state!=='done').length} peringatan lapangan terbuka`];};
  const upd=()=>{if(me)return;tk.innerHTML=lines().map((l,i)=>`<span style="animation-delay:${i*.15}s">● ${l}</span>`).join('');};upd();setInterval(upd,4000);
}
const loginBG={pts:Array.from({length:70},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.02,vy:(Math.random()-.5)*.02}))};
function drawLoginBg(dt){
  const c=$('#loginBg');if(!c||$('#login').hidden)return;const w=c.clientWidth,h=c.clientHeight;if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;
  const g=c.getContext('2d');g.clearRect(0,0,w,h);
  loginBG.pts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;});
  const P=loginBG.pts;g.lineWidth=1;
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const dx=(P[i].x-P[j].x)*w,dy=(P[i].y-P[j].y)*h,d=Math.hypot(dx,dy);if(d<140){g.strokeStyle=`rgba(227,198,138,${(1-d/140)*.28})`;g.beginPath();g.moveTo(P[i].x*w,P[i].y*h);g.lineTo(P[j].x*w,P[j].y*h);g.stroke();}}
  P.forEach((p,i)=>{g.fillStyle=i%7===0?'#C0303C':'#E3C68A';g.beginPath();g.arc(p.x*w,p.y*h,i%7===0?3.5:2.4,0,7);g.fill();});
}
const initials=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('');
function login(s){
  me=s;me.st='off';me.act='Belum check-in';me.purpose=null;me.pendingAsp=0;me.tw=null;me.cx=me.px;me.cz=me.pz;
  sim.chat=[];pushChat(null,`Anda masuk sebagai ${me.name}. Tim ${me.region.name}: ${me.region.team.map(x=>x.name.split(' ')[0]).join(', ')}.`,true);
  const c=me.region.coord;if(c&&c!==me)pushChat(c,`Selamat pagi tim. Hari ini fokus tindak lanjut aspirasi ${topCat(me.region)}. Jangan lupa check-in ya.`);
  sim.myVer++;sim.alertVer++;
  $('#login').hidden=true;$('#app').hidden=false;
  $('#meAvatar').style.background=CLHEX[me.dom];$('#meAvatar').innerHTML=esc(initials(me.name))+'<span class="sdot" id="meDot"></span>';
  $('#meName').textContent=me.name;$('#meSub').textContent=`${me.id} · ${me.region.name}${me.coord?' · Koordinator':''}`;
  state.sel=me.region;state.isScope='mine';
  if(location.hash!=='#saya')location.hash='saya';else route();
  if(!T)initScene();else flyTo(null,2);
  buildMinimap();
  setTimeout(()=>startTour(tourFor()),500);
}
function topCat(r){const c={};I.filter(i=>i.region===r&&active(i)).forEach(i=>c[i.cat]=(c[i.cat]||0)+1);const e=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];return e?e[0].toLowerCase():'warga';}

const TABS=['saya','operasi','hub','analitik','isu','jaringan','laporan','penempatan','lab','arena','bantuan','direktori'];
function route(){
  if(!me)return;
  const h=location.hash.replace('#','');const tab=TABS.includes(h)&&tabAllowed(h)?h:'saya';if(h!==tab&&h){location.replace('#'+tab);}const prev=state.tab;state.tab=tab;
  const pane=tab==='saya'&&!isField()?'kendali':tab;$$('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==pane);
  $$('nav.tabs a').forEach(a=>{if(a.dataset.tab===tab)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const stage=$('#stage');
  if(tab==='penempatan'){$('#plStageSlot').appendChild(stage);state.prevMetric=state.prevMetric||state.metric;state.metric='komplementer';state.colorMode='cluster';updateColumns();renderPlacement();}
  else if(stage.parentElement.id!=='opsStageSlot'){$('#opsStageSlot').appendChild(stage);if(state.prevMetric){state.metric=state.prevMetric;state.prevMetric=null;}state.colorMode=$('#colorSeg [aria-pressed="true"]').dataset.c;$$('#metricSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===state.metric));updateColumns();}
  if(tab==='operasi'||tab==='penempatan')requestAnimationFrame(resize);
  if(tab==='jaringan')initNet();
  if(tab==='isu')renderIssues(true);
  if(tab==='lab')renderLab();
  if(tab==='direktori')renderDirectory(true);
  if(tab==='hub')renderHub(true);
  if(tab==='analitik')renderAnalytics(true);
  if(tab==='laporan')renderReport(true);
  if(tab==='arena')renderArena();
  if(tab==='bantuan')renderHelp();
  if(tab==='saya'){if(isField()){sim.myVer++;buildMinimap();renderHome(true);renderPerf();}else renderRoleHome(true);}
  if(tab==='operasi'){renderSide(true);renderOpsKpis();renderStatus();renderHourly();updateColumns();}
  if(prev!==tab)window.scrollTo({top:0});
}
window.addEventListener('hashchange',route);

const TOUR_MAIN=[
  {sel:'#clockBox',t:'Jam operasi',d:'Simulasi berjalan seperti hari penugasan nyata. Jeda atau percepat waktu (1× sampai 40×) untuk melihat ritme lapangan.'},
  {sel:'nav.tabs',t:'Tujuh modul',d:'Beranda pribadi, pusat operasi semua Serdik, jaringan interaksi, tindak lanjut aspirasi, penempatan, lab analitik, dan direktori.'},
  {tab:'saya',sel:'#meCard',t:'Status Anda',d:'Status dan aktivitas Anda saat ini. Semua aksi Anda langsung terlihat oleh rekan dan koordinator di peta.'},
  {sel:'#actionsCard',t:'Aksi lapangan',d:'Mulai dengan check-in. Setelah itu Anda bisa berangkat kunjungan, mencatat aspirasi, meminta bantuan, atau mengajak rapat tim.'},
  {sel:'#minimap',t:'Peta tim',d:'Desa-desa di kabupaten Anda dan posisi rekan setim secara langsung. Klik desa untuk berangkat kunjungan.'},
  {sel:'#myTasks',t:'Tugas masuk',d:'Permintaan bantuan dari Serdik lain, rujukan lintas wilayah, dan respons instansi yang perlu Anda kabarkan ke warga muncul di sini.'},
  {tab:'operasi',sel:'#stage',t:'Pusat operasi 3D',d:'Semua 384 Serdik bergerak sesuai statusnya. Denyut warna menandai kejadian; busur menandai bantuan, rujukan, atau eskalasi.'},
  {sel:'.side',t:'Peringatan & log',d:'Peringatan punya SLA. Tangani dengan menghubungi koordinator, mengeskalasi, atau menugaskan rekan dengan kompetensi paling cocok.'},
  {tab:'hub',sel:'#hubCh',t:'Hub Serdik',d:'Kanal tim, provinsi, angkatan, bantuan lintas wilayah, praktik baik, dan pengumuman posko. Ada polling, reaksi, dan pesan langsung.'},
  {tab:'analitik',sel:'#anSeg',t:'Data analytics',d:'Kartogram wilayah, treemap aspirasi, alur status, sentimen warga dan Serdik, serta grafik kendali proses.'},
  {tab:'arena',sel:'#arenaBody',t:'Arena latihan',d:'Mini games: dialog dengan warga, sortir kewenangan, dan optimasi rute kunjungan.'},
  {tab:'lab',sel:'#toolnav',t:'Lab analitik',d:'AHP, SMART, TOPSIS, decision tree, antrean, peramalan, dan word network yang memakai data operasi langsung.'},
  {tab:'saya',sel:'#actionsCard',t:'Mulai bertugas',d:'Tekan Check-in untuk memulai hari Anda. Tur ini bisa diulang dari tombol Tur di kanan atas.'}];
let tour=null;
function startTour(steps){tour={steps,i:0};$('#tourHole').hidden=false;$('#tourCard').hidden=false;showTourStep();}
function endTour(){tour=null;$('#tourHole').hidden=true;$('#tourCard').hidden=true;}
function showTourStep(){
  if(!tour)return;const st=tour.steps[tour.i];
  if(st.tab&&state.tab!==st.tab)location.hash=st.tab;
  setTimeout(()=>{const el=$(st.sel);if(!el){nextTour();return;}el.scrollIntoView({block:'center',behavior:'smooth'});
    setTimeout(()=>{if(!tour)return;const r=el.getBoundingClientRect(),pad=6,hole=$('#tourHole'),card=$('#tourCard');
      hole.style.left=(r.left-pad)+'px';hole.style.top=(r.top-pad)+'px';hole.style.width=(r.width+pad*2)+'px';hole.style.height=Math.min(r.height+pad*2,window.innerHeight-20)+'px';
      card.innerHTML=`<div class="prog">${tour.steps.map((_,i)=>`<i class="${i<=tour.i?'on':''}"></i>`).join('')}</div><span class="lbl">Langkah ${tour.i+1} dari ${tour.steps.length}</span><h3>${st.t}</h3><p class="small">${st.d}</p>
        <div class="row between"><button class="btn sm" id="tSkip">Lewati tur</button><div class="row">${tour.i?'<button class="btn sm" id="tPrev">Kembali</button>':''}<button class="btn sm primary" id="tNext">${tour.i===tour.steps.length-1?'Selesai':'Lanjut'}</button></div></div>`;
      const cw=Math.min(360,window.innerWidth-32),ch=card.offsetHeight||180;let top=r.bottom+14;if(top+ch>window.innerHeight-10)top=Math.max(10,r.top-ch-14);if(top<10)top=Math.min(window.innerHeight-ch-10,r.top+20);
      card.style.top=top+'px';card.style.left=Math.max(16,Math.min(r.left,window.innerWidth-cw-16))+'px';
      $('#tSkip').onclick=endTour;$('#tNext').onclick=nextTour;const p=$('#tPrev');if(p)p.onclick=()=>{tour.i--;showTourStep();};$('#tNext').focus();},420);},st.tab?160:0);
}
function nextTour(){if(!tour)return;tour.i++;if(tour.i>=tour.steps.length){endTour();toast('Tur selesai. Selamat bertugas!');}else showTourStep();}
$('#tourBtn').onclick=()=>startTour(tourFor());
window.addEventListener('resize',()=>{if(tour)showTourStep();});

/* ================================================================
   MY DASHBOARD
   ================================================================ */
function myActions(){
  const s=me.st;const A=[];
  const ICM={CI:'pin',KJ:'walk',AS:'mega',BR:'hand',RP:'meet',IS:'cup',KD:'alert',X:'x',OK:'check'};
  const b=(id,code,t,sub,primary)=>A.push(`<button class="btn${primary?' primary':''}" data-a="${id}"><span class="ico"><svg class="ic"><use href="#i-${ICM[code]||'check'}"/></svg></span><span>${t}<small>${sub}</small></span></button>`);
  if(s==='off')b('checkin','CI','Check-in kehadiran',`Mulai hari ke-${sim.day} di ${me.region.name}`,true);
  if(s==='duty'){b('visit','KJ','Mulai kunjungan','Pilih desa terdekat yang belum dikunjungi',true);b('asp','AS','Catat aspirasi','Isi formulir digital');b('help','BR','Minta bantuan rekan','Sistem mencarikan kompetensi yang cocok');b('meet','RP','Ajak rapat koordinasi','Tim berkumpul di titik koordinator');b('rest','IS','Istirahat','Status tim tetap terlihat');b('kendala','KD','Laporkan kendala','Masuk ke antrean peringatan');}
  if(s==='travel'){b('cancel','X','Batalkan perjalanan','Kembali ke posko desa');b('kendala','KD','Laporkan kendala','Kendaraan, akses, cuaca');}
  if(s==='visit'){b('asp','AS','Catat aspirasi warga','Dari kunjungan ini',true);b('endvisit','OK','Selesaikan kunjungan','Kembali ke posko desa');b('help','BR','Minta bantuan rekan','Butuh kompetensi lain');}
  if(s==='rest')b('back','OK','Kembali bertugas','Akhiri istirahat',true);
  if(s==='help'||s==='meet')b('endact','OK',s==='help'?'Selesaikan bantuan':'Selesaikan rapat','Kembali ke posko',true);
  if(s==='kendala')b('fixed','OK','Kendala teratasi','Lanjutkan kegiatan',true);
  return A.join('');
}
function doMyAction(a){
  const now=abs();
  if(a==='checkin'){me.st='duty';me.act='Siaga di posko desa';emit('checkin',{s:me,text:`Anda check-in di ${me.region.name}`});pushChat(me,'Check-in, siap bertugas.');toast('Check-in tercatat dengan lokasi posko desa');}
  if(a==='visit'){const v=nextVillage();startTravel(me,v.x,v.z,'visit',{v});toast(`Berangkat ke Desa ${v.name}`);}
  if(a==='asp')openNewIssue({fromMe:true});
  if(a==='help')openHelpRequest();
  if(a==='meet'){const c=me.region.coord||me;const end=now+75;me.region.team.forEach(t=>{if(t.st==='off'||t.st==='kendala')return;startTravel(t,c.px+(t===c?0:(hsh(t.idx)-.5)*.5),c.pz+(t===c?0:(hsh(t.idx+3)-.5)*.5),'meet',{end});addEdge(me,t,'rapat');});
    emit('rapat',{s:me,important:true,text:`Rapat koordinasi tim ${me.region.name} dipanggil oleh Anda`});pushChat(me,`Tim, kita rapat koordinasi di titik ${c===me?'saya':c.name.split(' ')[0]} ya. Bahas tindak lanjut aspirasi minggu ini.`);toast('Undangan rapat terkirim ke tim');}
  if(a==='rest'){me.st='rest';me.until=0;me.act='Istirahat';}
  if(a==='back'||a==='endact'){goHome(me);if(a==='back'){me.st='duty';me.act='Siaga di posko desa';}}
  if(a==='endvisit'){goHome(me);}
  if(a==='cancel'){goHome(me);toast('Perjalanan dibatalkan');}
  if(a==='kendala'){me.st='kendala';me.purpose=null;me.act='Kendala: '+pick(KENDALA);addAlert({type:'kendala',s:me,text:me.act.replace('Kendala: ','')});toast('Kendala dilaporkan ke koordinator dan posko');}
  if(a==='fixed'){me.st='duty';me.act='Kendala teratasi';sim.alerts.filter(x=>x.s===me&&x.type==='kendala'&&x.state!=='done').forEach(x=>resolveAlert(x,'Anda'));}
  sim.myVer++;renderHome(true);
}
function nextVillage(){const seen=new Set(sim.events.filter(e=>e.s===me&&e.type==='visit').map(e=>e.text));
  const vs=[...me.region.villages].sort((a,b)=>Math.hypot(a.x-me.cx,a.z-me.cz)-Math.hypot(b.x-me.cx,b.z-me.cz));
  return vs.find(v=>![...seen].some(t=>t.includes(v.name)))||vs[0];}
let mm={};
function buildMinimap(){
  if(!me)return;const r=me.region,svg=$('#minimap');const W=600,H=300,sc=88;
  const X=x=>W/2+(x-r.x)*sc,Y=z=>H/2+(z-r.z)*sc*.95;mm={X,Y,r};
  let h=`<defs><pattern id="mmg" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#E2D8C2" stroke-width="1"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#mmg)"/>`;
  h+=`<circle cx="${X(r.x)}" cy="${Y(r.z)}" r="215" fill="#FBF6EA" stroke="#D8CBAE" stroke-dasharray="4 5"/>`;
  r.villages.forEach((v,i)=>{h+=`<g class="village" data-v="${i}" tabindex="0" role="button" aria-label="Kunjungi Desa ${esc(v.name)}"><circle cx="${X(v.x)}" cy="${Y(v.z)}" r="9" fill="#FFFFFF" stroke="#CDBF9F" stroke-width="1.5"/><text x="${X(v.x)}" y="${Y(v.z)+22}" text-anchor="middle" font-size="10.5" fill="#5E6577" font-family="IBM Plex Sans,sans-serif">${esc(v.name)}</text></g>`;});
  h+=`<g id="mmLinks"></g><line id="mmRoute" stroke="#13274A" stroke-width="2" stroke-dasharray="5 5" opacity="0"/>`;
  r.team.forEach(t=>{h+=`<g class="mm-dot" id="mm${t.idx}"><circle r="${t===me?13:10}" fill="${STAT[t.st][1]}" stroke="#fff" stroke-width="2.5"/>${t===me?'<circle r="18" fill="none" stroke="#13274A" stroke-width="2"><animate attributeName="r" values="14;26" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite"/></circle>':''}<text y="-16" text-anchor="middle" font-size="11" font-weight="600" fill="#0F1D38" font-family="IBM Plex Sans,sans-serif">${t===me?'Anda':esc(t.name.split(' ')[0])}${t.coord?' ★':''}</text></g>`;});
  svg.innerHTML=h;
  svg.querySelectorAll('.village').forEach(g=>{const go=()=>{const v=r.villages[+g.dataset.v];
    if(me.st==='off'){toast('Check-in dulu sebelum berangkat');return;}
    if(!['duty','visit','rest'].includes(me.st)){toast('Selesaikan aktivitas saat ini terlebih dahulu');return;}
    startTravel(me,v.x,v.z,'visit',{v});toast(`Berangkat ke Desa ${v.name}`);renderHome(true);};g.onclick=go;g.onkeydown=e=>{if(e.key==='Enter')go();};});
  $('#mmLegend').innerHTML=['duty','travel','visit','help','meet','rest','off'].map(k=>`<span class="row" style="gap:4px"><span class="sdot" style="background:${STAT[k][1]}"></span>${STAT[k][0]}</span>`).join('');
  updateMinimap();
}
function updateMinimap(){
  if(!me||!mm.X||mm.r!==me.region){buildMinimap();return;}
  const {X,Y}=mm;const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  me.region.team.forEach(t=>{const g=$('#mm'+t.idx);if(!g)return;g.setAttribute('transform',`translate(${cl(X(t.cx),14,586)},${cl(Y(t.cz),20,286)})`);g.firstChild.setAttribute('fill',STAT[t.st][1]);});
  const c=me.region.coord;$('#mmLinks').innerHTML=c?me.region.team.filter(t=>t!==c).map(t=>`<line x1="${cl(X(c.cx),14,586)}" y1="${cl(Y(c.cz),20,286)}" x2="${cl(X(t.cx),14,586)}" y2="${cl(Y(t.cz),20,286)}" stroke="#B6A57E" stroke-width="1.2" stroke-dasharray="2 4"/>`).join(''):'';
  const rt=$('#mmRoute');if(me.st==='travel'){rt.setAttribute('x1',cl(X(me.cx),14,586));rt.setAttribute('y1',cl(Y(me.cz),20,286));rt.setAttribute('x2',cl(X(me.dx),14,586));rt.setAttribute('y2',cl(Y(me.dz),20,286));rt.setAttribute('opacity','1');}else rt.setAttribute('opacity','0');
}
let lastActKey='',lastMyVer=-1,lastChatVer=-1,lastTl=-1;
function renderHome(force){
  if(!me)return;
  const st=STAT[me.st],r=me.region;
  const nearest=[...r.villages].sort((a,b)=>Math.hypot(a.x-me.cx,a.z-me.cz)-Math.hypot(b.x-me.cx,b.z-me.cz))[0];
  const mine=I.filter(i=>i.owner===me);
  const todayAsp=mine.filter(i=>i.createdAbs>=sim.day*1440).length,actMine=mine.filter(active).length,fu=mine.length?Math.round(mine.filter(i=>i.si>=3).length/mine.length*100):0;
  const cardKey=[me.st,me.act,me.visitsToday,todayAsp,actMine,fu,nearest.name].join('|');
  if(force||cardKey!==renderHome._k){renderHome._k=cardKey;
  $('#meCard').innerHTML=`<div class="mecard"><div class="avatar" style="background:${CLHEX[me.dom]}">${esc(initials(me.name))}<span class="sdot${me.st!=='off'?' pulse':''}" style="background:${st[1]}"></span></div>
    <div style="min-width:0"><span class="lbl">${me.id} · ${esc(r.name)}, ${r.prov}${me.coord?' · Koordinator':''}</span><h2>${esc(me.name)}</h2>
    <div class="row" style="margin-top:4px"><span class="pill" style="color:${st[1]};border-color:${st[1]}">● ${st[0]}</span><span class="small">${esc(me.act||'')}</span></div></div></div>
    <div class="rings">${V.ring(Math.min(1,me.visitsToday/4),me.visitsToday+'/4','Kunjungan','#13274A')}${V.ring(Math.min(1,todayAsp/3),todayAsp+'/3','Aspirasi dicatat','#C59A4A')}${V.ring(fu/100,fu+'%','Ditindaklanjuti','#2E7A52')}</div>
    <p class="small muted row" style="gap:6px"><svg class="ic" style="width:14px;height:14px"><use href="#i-pin"/></svg>Desa ${esc(nearest.name)} · ${me.buddy?`Buddy: ${esc(me.buddy.name)}`:`Kluster ${me.dom} · ${CL[me.dom]}`}</p>`;}
  $('#meDot').style.background=st[1];
  const key=me.st+'|'+sim.day;
  if(force||key!==lastActKey){lastActKey=key;$('#actions').innerHTML=myActions();$('#meActNote').textContent=STAT[me.st][0];}
  updateMinimap();
  if(force||sim.myVer!==lastMyVer){lastMyVer=sim.myVer;renderTasks();}
  if(force||sim.chatVer!==lastChatVer){lastChatVer=sim.chatVer;renderChat();}
  const myEv=sim.events.filter(e=>e.s===me||(e.r===r&&['rapat','bantuan','referral','aspirasi','kendala'].includes(e.type))).slice(0,14);
  if(force||myEv.length&&myEv[0].id!==lastTl){lastTl=myEv[0]?myEv[0].id:-1;
    $('#tlCount').textContent=`${myEv.length} kejadian terakhir`;
    $('#dayline').innerHTML=V.dayline(sim.events.filter(e=>e.s===me&&e.abs>=sim.day*1440));
    $('#myTimeline').innerHTML=myEv.length?myEv.slice(0,6).map(e=>`<div class="tl"><span class="num muted">${e.time}</span><span class="ln"><i style="background:${EVT[e.type][2]}"></i></span><span${e.s===me?' style="font-weight:600"':''}>${esc(e.text)}</span></div>`).join(''):'<div class="empty">Belum ada aktivitas. Mulai dengan check-in.</div>';}
  const pend=sim.pendingReplies.length;$('#typing').textContent=pend?`${sim.pendingReplies[0].from.name.split(' ')[0]} sedang mengetik…`:'';
}
function renderTasks(){
  const toMe=sim.alerts.filter(a=>a.toMe&&a.state==='open');
  const myOpen=I.filter(i=>i.owner===me&&i.si<=1);
  const items=[];
  toMe.forEach(a=>items.push(`<div class="task urgent"><span class="code" style="background:${EVT.bantuan[2]}">BR</span><div class="grid" style="gap:6px"><b class="small">${esc(a.text)}</b><div class="row small muted">Jarak ${Math.round(Math.hypot(a.s.cx-me.cx,a.s.cz-me.cz)*11)} km · SLA ${hhmm(a.due)}</div><div class="row"><button class="btn sm primary" data-ta="accept" data-id="${a.id}">Terima</button><button class="btn sm" data-ta="decline" data-id="${a.id}">Alihkan ke rekan lain</button></div></div></div>`));
  sim.myTasks.forEach(t=>{
    if(t.type==='asp')items.push(`<div class="task"><span class="code" style="background:${EVT.aspirasi[2]}">AS</span><div class="grid" style="gap:6px"><b class="small">Warga Desa ${esc(t.v?t.v.name:'')} menyampaikan keluhan saat kunjungan</b><span class="small muted">Catat sekarang agar tidak hilang tanpa tindak lanjut.</span><div class="row"><button class="btn sm primary" data-tt="asp" data-id="${t.id}">Catat aspirasi</button><button class="btn sm" data-tt="dismiss" data-id="${t.id}">Abaikan</button></div></div></div>`);
    if(t.type==='ref')items.push(`<div class="task"><span class="code" style="background:${EVT.referral[2]}">RS</span><div class="grid" style="gap:6px"><b class="small">${esc(t.from.name)} merujuk ${t.it.id} kepada Anda</b><span class="small muted">${esc(t.it.title)} · ${esc(t.it.region.name)}</span><div class="row"><button class="btn sm primary" data-tt="refok" data-id="${t.id}">Beri masukan awal</button><button class="btn sm" data-tt="open" data-id="${t.id}">Lihat isu</button></div></div></div>`);
    if(t.type==='resp')items.push(`<div class="task"><span class="code" style="background:${EVT.respons[2]}">RI</span><div class="grid" style="gap:6px"><b class="small">${INST[t.it.cat]} ${t.ok?'menindaklanjuti':'meminta data tambahan untuk'} ${t.it.id}</b><span class="small muted">${t.ok?'Kabarkan hasilnya ke warga Desa '+esc(t.it.desa)+'.':'Lengkapi data lalu kirim ulang.'}</span><div class="row"><button class="btn sm primary" data-tt="${t.ok?'fb':'resend'}" data-id="${t.id}">${t.ok?'Kabari warga':'Kirim data tambahan'}</button></div></div></div>`);});
  myOpen.slice(0,3).forEach(i=>items.push(`<div class="task"><span class="code" style="background:${EVT.monitor[2]}">PM</span><div class="grid" style="gap:6px"><b class="small">${i.id} menunggu ${i.si===0?'verifikasi':'validasi'}</b><span class="small muted">${esc(i.title)}</span><div class="row"><button class="btn sm" data-tt="valid" data-iid="${i.id}">${i.si===0?'Verifikasi':'Validasi'}</button></div></div></div>`));
  $('#myTasks').innerHTML=items.join('')||'<div class="empty">Tidak ada tugas tertunda. Permintaan dari rekan akan muncul di sini.</div>';
  const n=toMe.length+sim.myTasks.length;$('#taskCount').hidden=!n;$('#taskCount').textContent=n+' perlu tindakan';
  const bd=$('#bdgSaya');bd.hidden=!n;bd.textContent=n;
}
$('#myTasks').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.ta){alertAct(sim.alerts.find(a=>a.id===b.dataset.id),b.dataset.ta);renderHome(true);return;}
  const t=sim.myTasks.find(x=>x.id===+b.dataset.id),k=b.dataset.tt;
  if(k==='asp'){openNewIssue({fromMe:true,village:t.v});doneTask(t.id);}
  if(k==='dismiss'){doneTask(t.id);toast('Tugas diabaikan');}
  if(k==='refok'){addEdge(me,t.from,'referral');emit('referral',{s:me,text:`Anda memberi masukan awal untuk ${t.it.id} kepada ${t.from.name}`});fx.arc(me,t.from,EVT.referral[2]);t.it.si=Math.max(t.it.si,2);doneTask(t.id);toast('Masukan terkirim, isu tervalidasi');}
  if(k==='open'){openIssue(t.it);}
  if(k==='fb'){t.it.feedback=true;emit('respons',{s:me,text:`Anda mengabarkan hasil ${t.it.id} ke warga Desa ${t.it.desa}`});doneTask(t.id);toast('Umpan balik ke warga tercatat');}
  if(k==='resend'){t.it.si=4;emit('rujukan',{s:me,text:`Anda mengirim data tambahan ${t.it.id} ke ${INST[t.it.cat]}`});doneTask(t.id);toast('Data tambahan terkirim');}
  if(k==='valid'){const i=I.find(x=>x.id===b.dataset.iid);i.si++;emit('monitor',{s:me,text:`Anda ${i.si===1?'memverifikasi':'memvalidasi'} ${i.id}`});sim.myVer++;}
  renderHome(true);
});
$('#actions').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)doMyAction(b.dataset.a);});
function renderChat(){
  const log=$('#chatlog');$('#chatTitle').textContent=`Koordinasi tim ${me.region.name}`;$('#chatSub').textContent=`${me.region.team.length} anggota`;
  log.innerHTML=sim.chat.map(m=>m.sys?`<div class="msg sys"><span class="bub">${esc(m.text)}</span></div>`:`<div class="msg${m.mine?' mine':''}"><small>${m.mine?'Anda':esc(m.from.name)}${m.from&&m.from.coord&&!m.mine?' · koordinator':''} · ${m.time}</small><span class="bub">${esc(m.text)}</span></div>`).join('');
  log.scrollTop=log.scrollHeight;
  $('#quickReplies').innerHTML=['Siap, saya bantu.','Bisa minta tolong cek status aspirasi saya?','Usul rapat koordinasi sore ini.','Saya sedang kunjungan, kabari nanti.'].map(q=>`<button class="btn sm" type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('');
}
$('#chatForm').onsubmit=e=>{e.preventDefault();const v=$('#chatIn').value.trim();if(!v)return;myChat(v);$('#chatIn').value='';renderHome();};
$('#quickReplies').onclick=e=>{const b=e.target.closest('[data-q]');if(b){myChat(b.dataset.q);renderHome();}};
function pctile(arr,v){return Math.round(arr.filter(x=>x<=v).length/arr.length*100);}
function renderPerf(){
  if(!me)return;const pl=S.filter(s=>s.region);
  const g=[['Volume',me.vol,pl.map(s=>s.vol)],['Kualitas',me.quality,pl.map(s=>s.quality)],['Outcome',me.outcome,pl.map(s=>s.outcome)]];
  $('#myGauge').innerHTML=g.map(([l,v,arr])=>{const p=pctile(arr,v);return `<div><div class="row between small"><span>${l}</span><b class="num">P${p}</b></div><div class="track"><i data-w="${p}" style="background:${p>=60?'var(--ok)':p>=35?'var(--gold)':'var(--maroon)'}"></i></div></div>`;}).join('');
  const comp=[['Dokumentasi','qDoc'],['Validasi','qValid'],['Tindak lanjut','qFollow'],['Umpan balik','qFb'],['Kedalaman','qDepth']];
  $('#myBars').innerHTML=V.radar(comp.map(c=>c[0]),[{vals:comp.map(([,k])=>pl.reduce((a,s)=>a+s[k],0)/pl.length),col:'#C59A4A',fill:.18},{vals:comp.map(([,k])=>me[k]),col:'#13274A',fill:.28}],260);
  const tm=me.region.team;
  $('#workload').innerHTML=tm.map(t=>{const h=Math.round(t.weekVisits*1.3+I.filter(i=>i.owner===t).length*.45+6+(t.coord?5:0));const u=Math.round(h/40*100);
    return `<div class="barrow"><span>${t===me?'<b>Anda</b>':esc(t.name)}${t.coord?' ★':''}</span><div class="track"><i data-w="${Math.min(100,u)}" style="background:${u>100?'var(--signal)':u>85?'var(--warn)':'var(--accent)'}"></i></div><span class="num">${h} j</span></div>`;}).join('')+`<p class="small muted">Beban tertinggi dapat dialihkan lewat rujukan antar-Serdik atau bantuan rekan.</p>`;
  animateBars($('#myGauge'));animateBars($('#workload'));
}
function animateBars(root){requestAnimationFrame(()=>root.querySelectorAll('i[data-w]').forEach(i=>i.style.width=i.dataset.w+'%'));}

/* ================================================================
   OPS: side panels, KPIs, status, hourly
   ================================================================ */
function selectRegion(r,fly){state.sel=r;state.side='region';$$('#sideSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s==='region'));renderSide(true);if(fly)flyTo(r);}
let lastAlertVer=-1,feedFilter=new Set();
function renderSide(force){
  const p=$('#sidePanel');
  if(state.side==='alert'){if(force||sim.alertVer!==lastAlertVer){lastAlertVer=sim.alertVer;renderAlerts();}else updateSLA();}
  else if(state.side==='feed'){if(force)renderFeedShell();}
  else if(state.side==='region'){if(force)renderRegion();else updateRegionLive();}
}
function slaInfo(a){const now=abs(),left=a.due-now,tot=a.due-a.created;return{left,w:Math.max(0,Math.min(100,left/tot*100)),col:left<0?'var(--signal)':left<tot*.3?'var(--warn)':'var(--ok)'};}
function renderAlerts(){
  const p=$('#sidePanel');const open=sim.alerts.filter(a=>a.state!=='done'),done=sim.alerts.filter(a=>a.state==='done').slice(0,5);
  open.sort((a,b)=>(b.toMe?1:0)-(a.toMe?1:0)||(a.state==='open'?0:1)-(b.state==='open'?0:1)||a.due-b.due);
  const actBtns=a=>{if(a.state==='open'&&!a.toMe&&!canAlert(a))return '<span class="small muted">Hanya lihat · di luar kewenangan peran Anda</span>';if(a.state!=='open')return `<span class="small muted">Ditangani: ${esc(a.handler)}${a.helper&&a.helper.st==='travel'?' · dalam perjalanan':''}</span>`;
    if(a.toMe)return `<div class="row"><button class="btn sm primary" data-act="accept" data-id="${a.id}">Terima permintaan</button><button class="btn sm" data-act="decline" data-id="${a.id}">Alihkan</button></div>`;
    if(a.type==='kendala')return `<div class="row"><button class="btn sm" data-act="koord" data-id="${a.id}">Hubungi koordinator</button><button class="btn sm danger" data-act="eskalasi" data-id="${a.id}">Eskalasi ke posko</button></div>`;
    if(a.type==='kritis')return `<div class="row"><button class="btn sm" data-act="validasi" data-id="${a.id}">Validasi &amp; prioritaskan</button><button class="btn sm primary" data-act="rujuk" data-id="${a.id}">Rujuk ke ${esc(INST[a.it.cat].split(' /')[0])}</button></div>`;
    const hs=helpersFor(a);return `<div class="small muted">Rekomendasi rekan (kompetensi + jarak):</div><div class="row">${hs.map(h=>`<button class="btn sm" data-act="help:${h.s.idx}" data-id="${a.id}">${h.s===me?'Saya':esc(dispName(h.s).split(' ').slice(-1)[0])} · ${h.s.dom} · ${Math.round(h.d*11)} km</button>`).join('')}</div>`;};
  p.innerHTML=`<div class="row between" style="margin-bottom:8px"><span class="lbl">${open.length} terbuka · ${sim.stats.handled} ditangani hari ini</span><span class="small muted">SLA tepat waktu ${pct(sim.stats.onTime,sim.stats.handled)}%</span></div>
  <div class="grid" style="gap:8px">${open.map(a=>{const s=slaInfo(a);return `<div class="alert ${a.type} ${a.state}${a.toMe?' tome':''}" data-aid="${a.id}">
    <div class="row between" style="flex-wrap:nowrap"><span class="row" style="gap:6px"><span class="code" style="background:${a.type==='kendala'?EVT.kendala[2]:a.type==='kritis'?'#6B0F18':EVT.bantuan[2]}">${a.type==='kendala'?'KD':a.type==='kritis'?'P!':'BR'}</span><b class="small">${a.type==='kendala'?'Kendala lapangan':a.type==='kritis'?'Aspirasi prioritas tinggi':a.toMe?'Permintaan untuk Anda':'Permintaan bantuan'}</b></span><span class="num small sla-t" style="color:${s.col}">${s.left>=0?s.left+' mnt':'+'+(-s.left)+' mnt'}</span></div>
    <div class="small">${esc(anonText(a.text))}</div><div class="small muted"><a href="#" data-fly="${a.s.region.id}">${esc(a.s.region.name)}</a> · ${esc(dispName(a.s))} · ${a.id}</div>
    <div class="sla"><i style="width:${s.w}%;background:${s.col}"></i></div>${actBtns(a)}</div>`;}).join('')||'<div class="empty">Tidak ada peringatan terbuka.</div>'}</div>
  ${done.length?`<div style="margin-top:12px" class="grid"><span class="lbl">Baru ditangani</span>${done.map(a=>`<div class="small muted">✓ ${a.id} · ${esc(a.handler)} · ${a.doneAt-a.created} mnt${a.doneAt>a.due?' <span class="pill crit">lewat SLA</span>':''}</div>`).join('')}</div>`:''}`;
  $('#alertN').textContent=`(${open.filter(a=>a.state==='open').length})`;
}
function updateSLA(){$$('#sidePanel .alert').forEach(el=>{const a=sim.alerts.find(x=>x.id===el.dataset.aid);if(!a)return;const s=slaInfo(a);const i=el.querySelector('.sla i');i.style.width=s.w+'%';i.style.background=s.col;const t=el.querySelector('.sla-t');t.textContent=s.left>=0?s.left+' mnt':'+'+(-s.left)+' mnt';t.style.color=s.col;});}
const FEEDG={lapangan:['checkin','visit','rapat'],aspirasi:['aspirasi','monitor','rujukan','respons'],kolaborasi:['bantuan','referral'],kritis:['kendala','eskalasi','selesai']};
function renderFeedShell(){
  const p=$('#sidePanel');
  p.innerHTML=`<div class="row" style="margin-bottom:8px" id="feedChips">${Object.keys(FEEDG).map(g=>`<button class="btn sm" data-g="${g}" aria-pressed="${!feedFilter.has(g)}" style="${feedFilter.has(g)?'opacity:.45':''}">${g[0].toUpperCase()+g.slice(1)}</button>`).join('')}<label class="tog"><input type="checkbox" id="feedMine"${state.feedMine?' checked':''}> Tim saya</label></div><div class="feed" id="feed"></div>`;
  $('#feed').innerHTML=sim.events.filter(feedOk).slice(0,60).map(e=>feedItem(e,false)).join('');
  $('#feedChips').onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;feedFilter.has(b.dataset.g)?feedFilter.delete(b.dataset.g):feedFilter.add(b.dataset.g);renderFeedShell();};
  $('#feedMine').onchange=e=>{state.feedMine=e.target.checked;renderFeedShell();};
}
function feedOk(e){if(state.feedMine&&!e.mine)return false;for(const g of feedFilter)if(FEEDG[g].includes(e.type))return false;return true;}
function feedItem(e,anim){return `<div class="fi${anim?' in':''}${e.mine?' mine':''}" data-ev="${e.id}"><span class="code" style="background:${EVT[e.type][2]}">${EVT[e.type][1]}</span><span>${esc(anonText(e.text))}</span><span class="num muted" style="font-size:.68rem">${e.time}</span></div>`;}
function flushFeed(){
  const evs=sim.newEv;sim.newEv=[];if(!evs.length)return;
  if(state.tab==='operasi'&&state.side==='feed'){const f=$('#feed');if(f){const html=evs.filter(feedOk).slice(-12).reverse().map(e=>feedItem(e,true)).join('');f.insertAdjacentHTML('afterbegin',html);while(f.children.length>60)f.lastChild.remove();}}
}
$('#sidePanel').addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');if(a){alertAct(sim.alerts.find(x=>x.id===a.dataset.id),a.dataset.act);renderSide(true);return;}
  const f=e.target.closest('[data-fly]');if(f){e.preventDefault();selectRegion(R[+f.dataset.fly],true);return;}
  const ev=e.target.closest('[data-ev]');if(ev){const x=sim.events.find(z=>z.id===+ev.dataset.ev);if(x&&x.r){state.sel=x.r;flyTo({x:x.x,z:x.z,close:true},1.2);}return;}
  const m=e.target.closest('[data-sid]');if(m){openProfile(S[+m.dataset.sid]);return;}
  const it=e.target.closest('[data-iid]');if(it){openIssue(I.find(i=>i.id===it.dataset.iid));return;}
  const b=e.target.closest('[data-rb]');if(b){const r=state.sel;if(b.dataset.rb==='issues'){state.isRegion=r;state.isScope='all';location.hash='isu';}if(b.dataset.rb==='fly')flyTo(r);if(b.dataset.rb==='me'){selectRegion(me.region,true);}}
});
function renderRegion(){
  const r=state.sel||me.region,p=$('#sidePanel');state.sel=r;
  const iss=I.filter(it=>it.region===r).sort((a,b)=>b.pr-a.pr),act=iss.filter(active);
  const km=(a,b)=>Math.hypot(a.cx-b.cx,a.cz-b.cz)*11;
  p.innerHTML=`<div class="grid" style="gap:12px">
   <div><span class="lbl">${esc(r.prov)}</span><h3 style="font-size:1.15rem">${esc(r.name)}${isField()&&r===me.region?' <span class="pill acc">wilayah Anda</span>':''}</h3>
   <div class="row" style="margin-top:4px"><span class="pill acc">Kuota ${r.quota}</span><span class="pill">Bahasa ${LANGS[r.lang]}</span>${r.remote?'<span class="pill warn">Akses sulit</span>':''}${r.mandHealth?'<span class="pill crit">Mandat kesehatan</span>':''}</div>
   <div class="row" style="margin-top:8px"><button class="btn sm" data-rb="fly">Fokus kamera</button><button class="btn sm" data-rb="issues">Papan isu wilayah</button>${isField()&&r!==me.region?'<button class="btn sm" data-rb="me">Wilayah saya</button>':''}</div></div>
   <div class="cov">${['A','B','C','D'].map(k=>`<div style="${r.cov[k]>=60?`border-color:${CLHEX[k]}`:''}"><span class="ch ${k}">${k}</span><b>${r.cov[k]}</b></div>`).join('')}</div>
   <div><span class="lbl">Tim · status langsung</span>${r.team.map(s=>`<div class="rp-member" data-sid="${s.idx}"><div class="avatar" style="background:${CLHEX[s.dom]}">${esc(initials(s.name))}<span class="sdot" id="rs${s.idx}" style="background:${STAT[s.st][1]}"></span></div>
     <div style="min-width:0"><div style="font-weight:600;font-size:.84rem">${s===me?'Anda':esc(dispName(s))}${s.coord?' <span class="pill acc">Koordinator</span>':''}</div><div class="small muted" id="ra${s.idx}">${esc(s.act||STAT[s.st][0])}</div></div>
     <span class="num small" id="rk${s.idx}">${s.coord?'—':km(s,r.coord).toFixed(0)+' km'}</span></div>`).join('')}</div>
   <div><div class="row between"><span class="lbl">Aspirasi</span><span class="small muted">${act.length} aktif · ${r.actToday||0} aktivitas hari ini</span></div>
   ${iss.slice(0,5).map(it=>`<div class="fi" data-iid="${it.id}"><span class="pill ${it.pr>=70?'crit':it.pr>=50?'warn':'ok'}">P${it.pr}</span><span>${esc(anonText(it.title))}<br><span class="muted" style="font-size:.7rem">${ST[it.si][2]} · ${AUTH[it.auth]}</span></span><span></span></div>`).join('')}</div>
   <div><span class="lbl">Kejadian terakhir</span>${sim.events.filter(e=>e.r===r).slice(0,6).map(e=>feedItem(e,false)).join('')||'<div class="small muted">Belum ada kejadian hari ini.</div>'}</div></div>`;
}
function updateRegionLive(){const r=state.sel;if(!r)return;r.team.forEach(s=>{const d=$('#rs'+s.idx),a=$('#ra'+s.idx),k=$('#rk'+s.idx);if(d)d.style.background=STAT[s.st][1];if(a)a.textContent=s.act||STAT[s.st][0];if(k&&r.coord&&!s.coord)k.textContent=(Math.hypot(s.cx-r.coord.cx,s.cz-r.coord.cz)*11).toFixed(0)+' km';});}
$('#sideSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;state.side=b.dataset.s;$$('#sideSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderSide(true);};
$('#metricSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;state.metric=b.dataset.m;$$('#metricSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));updateColumns();};
$('#colorSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;state.colorMode=b.dataset.c;$$('#colorSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderLegend();};
$('#camMe').onclick=()=>{if(!isField()&&!(USER&&USER.provs)){flyTo(null);return;}selectRegion(me.region,true);};
$('#camHome').onclick=()=>{flyTo(null);};

const tweens=new Map();
function setNum(el,v,suffix=''){if(!el)return;const from=el._v??0;if(from===v&&el._s===suffix)return;el._s=suffix;tweens.set(el,{from,to:v,t:0,suffix});el._v=v;}
function stepTweens(dt){tweens.forEach((tw,el)=>{tw.t=Math.min(1,tw.t+dt/.7);const e=1-Math.pow(1-tw.t,3);const val=tw.from+(tw.to-tw.from)*e;el.textContent=(Number.isInteger(tw.to)?fmt(val):val.toFixed(1))+tw.suffix;if(tw.t>=1)tweens.delete(el);});}
function renderOpsKpis(){
  const box=$('#opsKpis');
  if(!box.children.length)box.innerHTML=['field','visits','asp','fwd','alerts','sla'].map(k=>`<div class="kpi" id="k_${k}"><b>0</b><span></span></div>`).join('');
  const pl=S.filter(s=>s.region),field=pl.filter(s=>!['off','rest'].includes(s.st)).length,openA=sim.alerts.filter(a=>a.state!=='done').length;
  const HS={visits:['visit'],asp:['aspirasi'],fwd:['rujukan','referral'],alerts:['kendala','bantuan']};
  const set=(k,v,lab,suf='')=>{const el=$('#k_'+k);if(HS[k]){const ser=[];for(let h=7;h<=Math.min(17,Math.floor(sim.min/60));h++)ser.push(HS[k].reduce((a,t)=>a+((sim.hourly[t]||{})[h]||0),0));const sp=V.spark(ser.length>1?ser:[0,...ser],92,30,k==='alerts'?'#A3202C':'#C59A4A');const old=el.querySelector('.spark');if(old)old.outerHTML=sp;else el.insertAdjacentHTML('beforeend',sp);el.classList.add('has-spark');}const b=el.querySelector('b');if(b._v!==undefined&&b._v!==v&&['asp','alerts','fwd'].includes(k)){el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');}setNum(b,v,suf);el.querySelector('span').textContent=lab;};
  set('field',field,`Serdik aktif di lapangan dari ${pl.length}`);
  set('visits',sim.today.visit||0,'kunjungan warga hari ini');
  set('asp',sim.today.aspirasi||0,'aspirasi baru hari ini');
  set('fwd',(sim.today.rujukan||0)+(sim.today.referral||0),'diteruskan & dirujuk hari ini');
  set('alerts',openA,'peringatan terbuka');
  set('sla',pct(sim.stats.onTime,sim.stats.handled),`ditangani tepat waktu (${sim.stats.handled} peringatan)`,'%');
  const bd=$('#bdgOps');const n=sim.alerts.filter(a=>a.state==='open').length;bd.hidden=!n;bd.textContent=n;
}
function renderStatus(){
  const pl=S.filter(s=>s.region),cnt={};Object.keys(STAT).forEach(k=>cnt[k]=0);pl.forEach(s=>cnt[s.st]++);
  const sk=Object.keys(STAT).map(k=>cnt[k]).join(',');if(sk!==renderStatus._k){renderStatus._k=sk;$('#statusStack').innerHTML=V.donut(Object.keys(STAT).map(k=>({v:cnt[k],c:STAT[k][1],l:STAT[k][0]})),150,`<tspan x="75" dy="-2" class="t-strong" style="font-size:24px;font-family:Playfair Display,serif">${pl.length-cnt.off}</tspan><tspan x="75" dy="18">aktif</tspan>`,!renderStatus._d);renderStatus._d=1;}
  const lg=$('#statusLegend');if(!lg.children.length)lg.innerHTML=Object.keys(STAT).map(k=>`<div><span class="sdot" style="background:${STAT[k][1]}"></span>${STAT[k][0]}<b id="sl_${k}">0</b></div>`).join('');
  Object.keys(STAT).forEach(k=>setNum($('#sl_'+k),cnt[k]));
  $('#statusNote').textContent=`${pct(pl.length-cnt.off,pl.length)}% sudah check-in`;
}
function renderHourly(){
  const G=[['Kunjungan',['visit'],'#4A86C8'],['Aspirasi',['aspirasi'],'#C59A4A'],['Tindak lanjut',['rujukan','respons','monitor'],'#2A7F86'],['Kolaborasi',['bantuan','referral','rapat'],'#B0476A'],['Kendala',['kendala','eskalasi'],'#A3202C']];
  const hours=[7,8,9,10,11,12,13,14,15,16,17],W=640,H=210,L=34,B=34,Tp=10,bw=(W-L-8)/hours.length;
  const data=hours.map(h=>G.map(g=>g[1].reduce((a,t)=>a+((sim.hourly[t]||{})[h]||0),0)));
  const mx=Math.max(10,...data.map(d=>d.reduce((a,b)=>a+b,0)));const cur=Math.floor(sim.min/60);
  let s='';for(let i=0;i<=4;i++){const v=Math.round(mx*i/4),y=H-B-(H-B-Tp)*i/4;s+=`<line x1="${L}" x2="${W-8}" y1="${y}" y2="${y}" stroke="#E8E0CE"/><text x="${L-6}" y="${y+4}" text-anchor="end">${v}</text>`;}
  hours.forEach((h,i)=>{let y=H-B;const x=L+i*bw+4;data[i].forEach((v,j)=>{const hh=(H-B-Tp)*v/mx;if(hh>0)s+=`<rect x="${x}" y="${y-hh}" width="${bw-8}" height="${hh}" fill="${G[j][2]}" opacity="${h===cur?1:.78}" style="transition:all .5s"><title>${String(h).padStart(2,'0')}:00 · ${G[j][0]}: ${v}</title></rect>`;y-=hh;});
    s+=`<text x="${x+(bw-8)/2}" y="${H-B+14}" text-anchor="middle"${h===cur?' style="fill:#0F1D38;font-weight:600"':''}>${String(h).padStart(2,'0')}</text>`;});
  s+=`<g transform="translate(${L},${H-6})">${G.map((g,i)=>`<rect x="${i*118}" y="-8" width="9" height="9" rx="2" fill="${g[2]}"/><text x="${i*118+13}" y="0">${g[0]}</text>`).join('')}</g>`;
  $('#hourly').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Aktivitas per jam">${s}</svg>`;
}
