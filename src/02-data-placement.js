/* ============ regions (approximate centroids) ============ */
const PROV=['Banten','DKI Jakarta','Jawa Barat','Jawa Tengah','DI Yogyakarta','Jawa Timur'];
const RAW={
'Banten':[['Kab. Pandeglang',105.95,-6.6],['Kab. Lebak',106.25,-6.7],['Kab. Tangerang',106.42,-6.12],['Kab. Serang',106.12,-6.2],['Kota Tangerang',106.63,-6.17],['Kota Cilegon',106.0,-6.0],['Kota Serang',106.2,-6.08],['Kota Tangerang Selatan',106.68,-6.3]],
'DKI Jakarta':[['Kota Jakarta Pusat',106.83,-6.18],['Kota Jakarta Utara',106.9,-6.11],['Kota Jakarta Barat',106.75,-6.17],['Kota Jakarta Selatan',106.81,-6.27],['Kota Jakarta Timur',106.92,-6.23],['Kab. Kepulauan Seribu',106.55,-5.82]],
'Jawa Barat':[['Kab. Bogor',106.75,-6.55],['Kab. Sukabumi',106.6,-7.05],['Kab. Cianjur',107.15,-7.1],['Kab. Bandung',107.6,-7.08],['Kab. Garut',107.85,-7.3],['Kab. Tasikmalaya',108.12,-7.5],['Kab. Ciamis',108.38,-7.25],['Kab. Kuningan',108.5,-7.0],['Kab. Cirebon',108.42,-6.78],['Kab. Majalengka',108.25,-6.88],['Kab. Sumedang',107.95,-6.85],['Kab. Indramayu',108.2,-6.42],['Kab. Subang',107.75,-6.5],['Kab. Purwakarta',107.45,-6.6],['Kab. Karawang',107.35,-6.3],['Kab. Bekasi',107.15,-6.22],['Kab. Bandung Barat',107.42,-6.85],['Kab. Pangandaran',108.6,-7.62],['Kota Bogor',106.79,-6.6],['Kota Sukabumi',106.93,-6.92],['Kota Bandung',107.61,-6.91],['Kota Cirebon',108.56,-6.71],['Kota Bekasi',106.99,-6.26],['Kota Depok',106.82,-6.4],['Kota Cimahi',107.53,-6.88],['Kota Tasikmalaya',108.22,-7.33],['Kota Banjar',108.53,-7.37]],
'Jawa Tengah':[['Kab. Cilacap',108.9,-7.6],['Kab. Banyumas',109.2,-7.45],['Kab. Purbalingga',109.4,-7.3],['Kab. Banjarnegara',109.65,-7.35],['Kab. Kebumen',109.6,-7.65],['Kab. Purworejo',110.0,-7.7],['Kab. Wonosobo',109.9,-7.35],['Kab. Magelang',110.25,-7.55],['Kab. Boyolali',110.6,-7.48],['Kab. Klaten',110.6,-7.7],['Kab. Sukoharjo',110.85,-7.68],['Kab. Wonogiri',110.95,-7.88],['Kab. Karanganyar',111.05,-7.6],['Kab. Sragen',111.0,-7.42],['Kab. Grobogan',110.9,-7.1],['Kab. Blora',111.4,-7.05],['Kab. Rembang',111.4,-6.75],['Kab. Pati',111.05,-6.75],['Kab. Kudus',110.85,-6.8],['Kab. Jepara',110.7,-6.6],['Kab. Demak',110.62,-6.9],['Kab. Semarang',110.4,-7.2],['Kab. Temanggung',110.15,-7.3],['Kab. Kendal',110.2,-7.02],['Kab. Batang',109.85,-7.0],['Kab. Pekalongan',109.6,-7.05],['Kab. Pemalang',109.4,-7.0],['Kab. Tegal',109.15,-7.02],['Kab. Brebes',108.9,-7.0],['Kota Magelang',110.22,-7.45],['Kota Surakarta',110.82,-7.57],['Kota Salatiga',110.5,-7.33],['Kota Semarang',110.42,-6.97],['Kota Pekalongan',109.68,-6.89],['Kota Tegal',109.13,-6.87]],
'DI Yogyakarta':[['Kab. Kulon Progo',110.15,-7.85],['Kab. Bantul',110.35,-7.95],['Kab. Gunungkidul',110.6,-8.0],['Kab. Sleman',110.38,-7.7],['Kota Yogyakarta',110.37,-7.8]],
'Jawa Timur':[['Kab. Pacitan',111.1,-8.15],['Kab. Ponorogo',111.45,-7.9],['Kab. Trenggalek',111.65,-8.15],['Kab. Tulungagung',111.9,-8.1],['Kab. Blitar',112.25,-8.12],['Kab. Kediri',112.1,-7.78],['Kab. Malang',112.6,-8.12],['Kab. Lumajang',113.15,-8.1],['Kab. Jember',113.65,-8.2],['Kab. Banyuwangi',114.2,-8.3],['Kab. Bondowoso',113.85,-7.95],['Kab. Situbondo',114.0,-7.72],['Kab. Probolinggo',113.3,-7.88],['Kab. Pasuruan',112.8,-7.72],['Kab. Sidoarjo',112.7,-7.45],['Kab. Mojokerto',112.45,-7.58],['Kab. Jombang',112.25,-7.55],['Kab. Nganjuk',111.9,-7.6],['Kab. Madiun',111.6,-7.58],['Kab. Magetan',111.35,-7.65],['Kab. Ngawi',111.35,-7.4],['Kab. Bojonegoro',111.85,-7.25],['Kab. Tuban',111.9,-6.95],['Kab. Lamongan',112.35,-7.1],['Kab. Gresik',112.55,-7.15],['Kab. Bangkalan',112.9,-7.05],['Kab. Sampang',113.25,-7.1],['Kab. Pamekasan',113.5,-7.1],['Kab. Sumenep',113.9,-7.05],['Kota Kediri',112.01,-7.84],['Kota Blitar',112.17,-8.08],['Kota Malang',112.63,-7.97],['Kota Probolinggo',113.21,-7.76],['Kota Pasuruan',112.9,-7.64],['Kota Mojokerto',112.43,-7.47],['Kota Madiun',111.52,-7.63],['Kota Surabaya',112.75,-7.27],['Kota Batu',112.52,-7.87]]
};
const REMOTE=new Set(['Kab. Pandeglang','Kab. Lebak','Kab. Kepulauan Seribu','Kab. Sukabumi','Kab. Cianjur','Kab. Garut','Kab. Pangandaran','Kab. Wonogiri','Kab. Gunungkidul','Kab. Pacitan','Kab. Trenggalek','Kab. Sampang','Kab. Sumenep','Kab. Bondowoso','Kab. Blora','Kab. Banjarnegara']);
const BANYUMASAN=new Set(['Kab. Cilacap','Kab. Banyumas','Kab. Purbalingga','Kab. Banjarnegara','Kab. Kebumen','Kab. Brebes','Kab. Tegal','Kota Tegal']);
const MADURA=new Set(['Kab. Bangkalan','Kab. Sampang','Kab. Pamekasan','Kab. Sumenep','Kab. Situbondo','Kab. Bondowoso','Kab. Probolinggo','Kota Probolinggo','Kab. Jember']);
const K=10; const proj=(lon,lat)=>({x:(lon-110.1)*K,z:-(lat+7.2)*K});
const LANGS={jawa:'Jawa',sunda:'Sunda',madura:'Madura',betawi:'Betawi',banyumasan:'Banyumasan'};
const LVL=['Tidak bisa','Dasar','Pasif','Percakapan','Fasih'];
const CL={A:'Komunikasi & kepemimpinan',B:'Kesehatan, pendidikan & sosial',C:'Ekonomi & kewirausahaan',D:'Data, teknologi & riset'};

const R=[];
PROV.forEach(p=>RAW[p].forEach(([name,lon,lat])=>{
  const pos=proj(lon,lat);
  let lang='jawa';
  if(p==='DKI Jakarta')lang='betawi';
  else if(p==='Banten'||(p==='Jawa Barat'&&!/Cirebon|Indramayu/.test(name)))lang='sunda';
  else if(BANYUMASAN.has(name))lang='banyumasan';
  else if(MADURA.has(name))lang='madura';
  R.push({id:R.length,name,prov:p,lon,lat,...pos,lang,kota:name.startsWith('Kota'),remote:REMOTE.has(name),team:[]});
}));
R.forEach(r=>{
  r.base={A:.25+rnd()*.5,B:.25+rnd()*.55,C:.25+rnd()*.55,D:.15+rnd()*.5};
  if(r.kota){r.base.D+=.25;r.base.C+=.1;}else{r.base.C+=.12;}
  if(r.remote){r.base.B+=.25;r.base.A+=.1;}
  if(MADURA.has(r.name))r.base.B+=.12;
  r.access=r.remote?rint(1,2):(r.kota?rint(4,5):rint(2,4));
  r.pop=r.kota?rint(150,2600):rint(450,5200); // thousand people (dummy)
  r.desa=r.kota?rint(30,160):rint(180,420);
});

/* scenario state + derived region fields */
const state={tab:'peta',metric:'isu',policyOn:true,absent:false,surge:false,langReq:false,
  weights:{komp:35,bahasa:20,pengabdian:10,pengalaman:10,preferensi:15,komplementer:25},
  sel:null,pfLimit:40,isRegion:null,prevStats:null};
function deriveRegions(){
  R.forEach(r=>{
    r.need={...r.base};
    if(state.surge&&r.prov==='Jawa Timur')r.need.B+=.35;
    Object.keys(r.need).forEach(k=>r.need[k]=Math.min(1,r.need[k]));
    r.needTot=r.need.A+r.need.B+r.need.C+r.need.D+(r.remote?.4:0)+Math.log10(r.pop)/8;
  });
  const byNeed=[...R].sort((a,b)=>b.needTot-a.needTot);
  R.forEach(r=>r.quota=3); byNeed.slice(0,27).forEach(r=>r.quota=4);
  const byB=[...R].sort((a,b)=>b.need.B-a.need.B);
  R.forEach(r=>r.mandHealth=false); byB.slice(0,20).forEach(r=>r.mandHealth=true);
}
deriveRegions();

/* ============ serdik ============ */
const FN=['Adi','Bayu','Citra','Dewi','Eka','Fajar','Gita','Hendra','Indah','Joko','Kartika','Lukman','Maya','Nanda','Oki','Putri','Raka','Sari','Teguh','Utami','Vina','Wahyu','Yusuf','Zahra','Arif','Bunga','Dimas','Farhan','Galih','Hana','Ilham','Laras','Nurul','Rizky','Salsa','Tirta','Yoga','Ayu','Ratna','Hafiz','Melati','Bagus','Intan','Rendra'];
const LN=['Pratama','Saputra','Wibowo','Lestari','Hidayat','Nugroho','Siregar','Rahman','Kusuma','Santoso','Wijaya','Hutapea','Manurung','Tanjung','Halim','Setiawan','Ramadhan','Purnomo','Simanjuntak','Mahendra','Fauzi','Anggraini','Permana','Susanto','Rangkuti','Pattiasina','Latuconsina','Tambunan','Wenda','Mandala','Sembiring','Paliama'];
const OUT=['Aceh','Sumatera Utara','Sumatera Barat','Riau','Lampung','Kalimantan Barat','Kalimantan Timur','Sulawesi Selatan','Sulawesi Utara','Bali','NTB','NTT','Maluku','Papua'];
const SK=[['tech','Technical skills'],['social','Social skills'],['comm','Komunikasi'],['problem','Problem-solving'],['data','Data & teknologi'],['health','Kesehatan & layanan'],['edu','Pendidikan & pemberdayaan'],['entre','Entrepreneurship & bisnis'],['public','Public speaking & engagement'],['research','Riset & pemetaan masalah']];
const CERTS=['BNSP Fasilitator Pemberdayaan','Pertolongan Pertama (PMI)','Google Data Analytics','PMP','Sertifikasi Pendidik','K3 Umum','Pendamping UMKM','Mediator Bersertifikat','ArcGIS Fundamentals','Penyuluh Pertanian','Tenaga Kesehatan (STR)'];
const IND=['Pemerintahan','Kesehatan','Pendidikan','Perbankan','Teknologi','Manufaktur','Energi','Konsultan','Pertanian','Logistik','Organisasi nirlaba'];
const S=[];
for(let i=0;i<384;i++){
  const java=rnd()<.7;
  const originProv=java?pick(PROV):pick(OUT);
  const originR=java?pick(R.filter(r=>r.prov===originProv)):null;
  const arch=pick(['A','A','B','B','C','C','D','M']);
  const sk={};SK.forEach(([k])=>sk[k]=30+rnd()*35);
  const boost=(ks,v)=>ks.forEach(k=>sk[k]+=v*(.7+rnd()*.5));
  if(arch==='A')boost(['comm','public','social'],30);
  if(arch==='B')boost([rnd()<.5?'health':'edu'],38),boost(['social'],10);
  if(arch==='C')boost(['entre'],38),boost(['problem'],10);
  if(arch==='D')boost(['data','research','tech'],30);
  if(arch==='M')boost(['comm','entre','data','edu'],14);
  SK.forEach(([k])=>sk[k]=Math.round(clamp(sk[k])));
  const langs={jawa:rint(0,1),sunda:0,madura:0,betawi:0,banyumasan:0};
  if(java){
    if(originProv==='Banten'||originProv==='Jawa Barat'){langs.sunda=rint(3,4);langs.jawa=rint(0,2);}
    else if(originProv==='DKI Jakarta'){langs.betawi=rint(3,4);langs.sunda=rint(0,2);langs.jawa=rint(1,2);}
    else if(originProv==='Jawa Timur'){langs.jawa=rint(3,4);if(rnd()<.45)langs.madura=rint(2,4);}
    else{langs.jawa=rint(3,4);if(BANYUMASAN.has(originR.name)||rnd()<.25)langs.banyumasan=rint(2,4);}
  }else if(rnd()<.35){langs.jawa=rint(1,3);}
  const lead=rint(0,3), usaha=rnd()<(arch==='C'?.75:.22), kkn=rnd()<.68;
  const work=rint(1,14), conf=arch==='A'?rint(3,5):rint(1,5);
  const certs=[];const nc=rint(0,3);for(let c=0;c<nc;c++){const x=pick(CERTS);if(!certs.includes(x))certs.push(x);}
  if(sk.health>78&&!certs.includes('Tenaga Kesehatan (STR)')&&rnd()<.6)certs.push('Tenaga Kesehatan (STR)');
  const s={idx:i,id:'SRD-'+String(i+1).padStart(3,'0'),name:pick(FN)+' '+pick(LN),java,originProv,originR,
    sk,langs,lead,usaha,usahaField:usaha?pick(['Kuliner','Fesyen','Agribisnis','Jasa digital','Kerajinan','Retail']):null,
    kkn,kknLoc:kkn?pick(['Kab. Gunungkidul','Kab. Lombok Timur','Kab. Malang','Kab. Bone','Kab. Garut','Kab. Kupang','Kab. Pati','Kab. Agam']):null,kknMonths:kkn?rint(1,2):0,
    pengabdian:rint(0,6),org:pick(['Karang taruna','Relawan bencana','Komunitas literasi','Koperasi','Remaja masjid','Pramuka','Komunitas kesehatan']),
    work,industry:pick(IND),role:pick(['Staf','Analis','Supervisor','Manajer','Koordinator lapangan','Spesialis']),
    lived:rnd()<.45,conf,listen:rint(2,5),publicExp:rint(1,5),
    certs,prefs:java?[]:[pick(PROV.filter(p=>p!=='DKI Jakarta')),pick(PROV)].filter((v,i,a)=>a.indexOf(v)===i),
    willing:rnd()<.97,priority:null,region:null,manual:false,unavailable:false,arch};
  s.cA=Math.round(clamp(.38*sk.comm+.32*sk.public+.18*sk.social+lead*5));
  s.cB=Math.round(clamp(.85*Math.max(sk.health,sk.edu)+.15*sk.social));
  s.cC=Math.round(clamp(.75*sk.entre+.12*sk.problem+(usaha?14:0)));
  s.cD=Math.round(clamp((sk.data+sk.research+sk.tech)/3+(certs.some(c=>/Data|ArcGIS/.test(c))?8:0)));
  s.dom=['A','B','C','D'].reduce((m,k)=>s['c'+k]>s['c'+m]?k:m,'A');
  S.push(s);
}
// policy categories (layer 1)
S.filter(s=>s.sk.health>=74).sort((a,b)=>b.sk.health-a.sk.health).slice(0,18).forEach(s=>s.priority='kes');
S.filter(s=>!s.priority&&s.conf>=4&&s.work>=5&&s.willing).slice(0,12).forEach(s=>s.priority='khusus');
const PRIO={kes:'Mandat kesehatan',khusus:'Penugasan khusus (wilayah akses sulit)'};
const ABSENT_IDS=[17,58,133,201,276,349]; // used by what-if; 17 is avoided below for exemplar stability
ABSENT_IDS[0]=19;

/* ============ placement engine ============ */
function score(s,r){
  const W=state.weights, team=r.team.filter(m=>m!==s);
  const n=r.need, ns=n.A+n.B+n.C+n.D;
  const f={};
  f.komp=(s.cA*n.A+s.cB*n.B+s.cC*n.C+s.cD*n.D)/ns/100;
  f.bahasa=s.langs[r.lang]/4;
  f.pengabdian=Math.min(1,(s.kkn?.45:0)+s.pengabdian/12+(s.lived?.1:0));
  f.pengalaman=Math.min(1,s.work/24+s.lead/6+s.certs.length/12);
  if(s.java){const d=Math.hypot(s.originR.x-r.x,s.originR.z-r.z);f.preferensi=Math.max(0,1-d/70);}
  else f.preferensi=s.prefs.includes(r.prov)?1:.3;
  if(!team.length)f.komplementer=.5;
  else{let g=0;['A','B','C','D'].forEach(k=>{const mx=Math.max(...team.map(m=>m['c'+k]));g+=Math.max(0,s['c'+k]-mx)*(k==='D'?.6:1);});f.komplementer=Math.min(1,g/70);}
  let tot=0,ws=0;Object.keys(W).forEach(k=>{tot+=W[k]*f[k];ws+=W[k];});
  let total=ws?tot/ws*100:0;
  if(state.langReq&&s.langs[r.lang]<3)total*=.55;
  if(!s.willing)total*=.8;
  return {f,total};
}
function placeCore(policyOn){
  R.forEach(r=>r.team=[]);
  S.forEach(s=>{s.region=null;s.layer=null;s.manual=false;s.unavailable=state.absent&&ABSENT_IDS.includes(s.idx);});
  const pool=S.filter(s=>!s.unavailable);
  const assign=(s,r,layer)=>{s.region=r;s.layer=layer;r.team.push(s);};
  if(policyOn){
    pool.filter(s=>s.priority).sort((a,b)=>(a.priority===b.priority?b.cB-a.cB:a.priority==='kes'?-1:1)).forEach(s=>{
      let best=null,bs=-1;
      R.forEach(r=>{
        const ok=(s.priority==='kes'?r.mandHealth:r.remote)&&r.team.length<r.quota&&!r.team.some(m=>m.priority===s.priority);
        if(!ok)return;const sc=score(s,r).total;if(sc>bs){bs=sc;best=r;}
      });
      if(best)assign(s,best,1);
    });
  }
  for(let round=0;round<4;round++){
    const regs=R.filter(r=>r.team.length<r.quota&&r.team.length<=round).sort((a,b)=>b.needTot-a.needTot);
    regs.forEach(r=>{
      if(r.team.length>round)return;
      let best=null,bs=-1;
      pool.forEach(s=>{if(s.region)return;const sc=score(s,r).total;if(sc>bs){bs=sc;best=s;}});
      if(best)assign(best,r,2);
    });
  }
}
function finalizeTeams(){
  R.forEach(r=>{
    r.team.forEach(s=>{const sc=score(s,r);s.fit=sc.total;s.breakdown=sc.f;s.coord=false;s.buddy=null;});
    if(r.team.length){
      const c=r.team.reduce((m,s)=>(s.cA*.6+s.lead*12+s.conf*4)>(m.cA*.6+m.lead*12+m.conf*4)?s:m);
      c.coord=true; r.coord=c;
      const strong=[...r.team].sort((a,b)=>b.conf-a.conf)[0];
      r.team.forEach(s=>{if(s.conf<=2&&s!==strong)s.buddy=strong;});
    }else r.coord=null;
    r.cov={};['A','B','C','D'].forEach(k=>r.cov[k]=r.team.length?Math.max(...r.team.map(m=>m['c'+k])):0);
    r.covN=['A','B','C','D'].filter(k=>r.cov[k]>=60).length;
    r.missing=['A','B','C'].filter(k=>r.cov[k]<60);
    r.complete=!r.missing.length;
    r.fitAvg=r.team.length?r.team.reduce((a,s)=>a+s.fit,0)/r.team.length:0;
  });
  S.forEach(s=>{
    const a=hsh(s.idx+1)*Math.PI*2, d=.75+hsh(s.idx+7)*1.05;
    s.ox=Math.cos(a)*d; s.oz=Math.sin(a)*d;
    if(s.region){s.px=s.region.x+s.ox;s.pz=s.region.z+s.oz;}
  });
}
function prioMatchCount(){const p=S.filter(s=>s.priority&&s.region);return{ok:p.filter(s=>s.priority==='kes'?s.region.mandHealth:s.region.remote).length,total:S.filter(s=>s.priority&&!s.unavailable).length};}
function runPlacement(){
  let offStat=null;
  if(state.policyOn){placeCore(false);offStat=prioMatchCount();}
  placeCore(state.policyOn);finalizeTeams();
  state.offStat=offStat;
}
runPlacement();

/* ============ issues ============ */
const CATS=['Pendidikan','Kesehatan','Ekonomi & UMKM','Ketenagakerjaan','Infrastruktur','Lingkungan hidup','Pelayanan publik','Sosial & kesejahteraan','Pertanian & pangan','Teknologi & digitalisasi','Lainnya'];
const CAT_CL={'Pendidikan':'B','Kesehatan':'B','Ekonomi & UMKM':'C','Ketenagakerjaan':'C','Infrastruktur':'A','Lingkungan hidup':'D','Pelayanan publik':'A','Sosial & kesejahteraan':'B','Pertanian & pangan':'C','Teknologi & digitalisasi':'D','Lainnya':'A'};
const INST={'Pendidikan':'Dinas Pendidikan','Kesehatan':'Puskesmas / Dinas Kesehatan','Ekonomi & UMKM':'Dinas Koperasi & UMKM','Ketenagakerjaan':'Dinas Tenaga Kerja','Infrastruktur':'Dinas PUPR','Lingkungan hidup':'Dinas Lingkungan Hidup','Pelayanan publik':'Disdukcapil / Pemerintah Desa','Sosial & kesejahteraan':'Dinas Sosial','Pertanian & pangan':'Dinas Pertanian','Teknologi & digitalisasi':'Diskominfo','Lainnya':'Pemerintah Desa'};
const TPL={'Pendidikan':['Akses SMP terdekat lebih dari 7 km','Kekurangan guru kelas di SD','Anak putus sekolah karena biaya transportasi','Perpustakaan desa tidak aktif'],
'Kesehatan':['Posyandu kekurangan kader aktif','Antrean panjang di puskesmas pembantu','Akses air bersih memicu keluhan diare','Ambulans desa tidak tersedia'],
'Ekonomi & UMKM':['Pelaku UMKM belum memiliki NIB','Harga kerajinan ditekan tengkulak','Akses permodalan mikro sulit','Pemasaran produk olahan terbatas'],
'Ketenagakerjaan':['Lulusan SMK belum terserap kerja','Informasi lowongan tidak sampai ke desa','Pelatihan kerja tidak sesuai kebutuhan industri'],
'Infrastruktur':['Jalan penghubung dusun rusak berat','Jembatan gantung tidak layak','Lampu jalan padam di jalur sekolah','Drainase tersumbat saat hujan'],
'Lingkungan hidup':['Sampah menumpuk di bantaran sungai','Abrasi pantai mengancam permukiman','Limbah mencemari saluran irigasi'],
'Pelayanan publik':['Pengurusan KTP-el memakan waktu lama','Jam layanan kantor desa tidak menentu','Informasi bansos tidak tersosialisasi'],
'Sosial & kesejahteraan':['Lansia hidup sendiri tanpa pendampingan','Data penerima bantuan tidak mutakhir','Konflik pemanfaatan balai warga'],
'Pertanian & pangan':['Pupuk bersubsidi terlambat datang','Hama wereng menurunkan hasil panen','Irigasi tersier tidak berfungsi'],
'Teknologi & digitalisasi':['Sinyal internet lemah di dusun atas','Perangkat desa belum memahami aplikasi layanan','Pelaku usaha belum memakai pembayaran digital'],
'Lainnya':['Usulan kegiatan pemuda belum terfasilitasi','Warga meminta informasi program Satgas']};
const DESA_A=['Sumber','Karang','Tegal','Sido','Wates','Ngadi','Kali','Mekar','Suka','Cikal','Jati','Banyu','Tanjung','Mulya'];
const DESA_B=['rejo','mulyo','sari','jaya','asih','makmur','wangi','harjo','agung','tani','kerta','luhur'];
const ST=[['received','Received','Diterima'],['verif','Under Verification','Verifikasi'],['valid','Validated','Tervalidasi'],['progress','In Progress','Diproses'],['referred','Referred to Relevant Institution','Diteruskan'],['awaiting','Awaiting Response','Menunggu respons'],['resolved','Resolved','Selesai'],['closed','Closed','Ditutup']];
const AUTH=['Ditangani langsung','Butuh kolaborasi','Di luar kewenangan Satgas'];
const STEPS=['Receive','Record','Classify','Validate','Prioritize','Refer / Escalate','Follow Up','Feedback'];
const STEP_ID=['Serdik menerima aspirasi','Informasi dicatat dalam sistem','Masalah dikelompokkan menurut tema','Informasi diperiksa dan dikonfirmasi','Urgensi dan dampak diidentifikasi','Diteruskan ke pihak berwenang','Perkembangan dipantau','Warga menerima kabar hasil'];
const I=[];
function priorityOf(it){
  const a=it.auth===0?1:it.auth===1?.75:.55;
  return Math.round(100*(.30*it.urg/5+.25*it.imp/5+.20*Math.min(1,Math.log10(it.aff)/3.3)+.15*it.risk/5+.10*a));
}
function makeIssue(r,o={}){
  const cw=CATS.map(c=>c==='Lainnya'?.15:r.need[CAT_CL[c]]+rnd()*.3);
  let t=cw.reduce((a,b)=>a+b),x=rnd()*t,ci=0;while(x>cw[ci]){x-=cw[ci];ci++;}
  const cat=o.cat||CATS[Math.min(ci,CATS.length-1)];
  let auth=o.auth!=null?o.auth:(/Infrastruktur|Pelayanan|Lingkungan/.test(cat)?(rnd()<.55?2:1):(/Teknologi|Ekonomi|Lainnya|Pendidikan/.test(cat)?(rnd()<.45?0:1):(rnd()<.35?0:rnd()<.6?1:2)));
  const sr=rnd(); let si=o.si!=null?o.si:(sr<.1?0:sr<.21?1:sr<.31?2:sr<.43?3:sr<.6?4:sr<.72?5:sr<.86?6:7);
  if(auth===2&&si===3)si=4;
  const it={id:'ASP-'+String(I.length+1).padStart(4,'0'),region:r,cat,title:o.title||pick(TPL[cat]),
    desa:o.desa||(pick(DESA_A)+pick(DESA_B).toLowerCase()),auth,si,
    urg:o.urg||rint(1,5),imp:o.imp||rint(1,5),aff:o.aff||Math.round(Math.pow(10,1+rnd()*2.6)),risk:o.risk||rint(1,5),
    days:o.days!=null?o.days:rint(1,45),slot:rint(0,3),anon:o.anon!=null?o.anon:rnd()<.22,
    docOk:o.docOk!=null?o.docOk:rnd()<.9,monitored:false,feedback:false,fresh:!!o.fresh};
  it.monitored=it.si>=3&&rnd()<.82; it.feedback=it.si>=6?rnd()<.85:(it.si>=4&&rnd()<.3);
  it.pr=priorityOf(it); I.push(it); return it;
}
R.forEach(r=>{const n=Math.max(2,Math.round(r.needTot*1.6+rnd()*3+(r.remote?2:0)));for(let k=0;k<n;k++)makeIssue(r);});
const reporter=it=>it.region.team.length?it.region.team[it.slot%it.region.team.length]:null;
const active=it=>it.si<6;
const stepReached=it=>[2,3,5,7,6,7,it.feedback?8:7,8][it.si];
const pClass=p=>p>=70?'p-hi':p>=50?'p-md':'p-lo';

/* ============ interaction quality ============ */
S.forEach(s=>{
  s.vol=rint(10,112);
  const q=s.conf*.04+s.listen*.06+rnd()*.5;
  s.qDoc=clamp(.55+rnd()*.45,0,1); s.qValid=clamp(.35+rnd()*.6,0,1);
  s.qFollow=clamp(.2+q*.6+rnd()*.25,0,1); s.qFb=clamp(.15+rnd()*.7,0,1); s.qDepth=clamp(.25+s.listen*.12+rnd()*.25,0,1);
});
// exemplars matching the brief: 100 interactions vs 20 high-quality ones
Object.assign(S[17],{vol:102,qDoc:.55,qValid:.4,qFollow:.18,qFb:.12,qDepth:.3});
Object.assign(S[211],{vol:21,qDoc:.98,qValid:.9,qFollow:.92,qFb:.85,qDepth:.9});
S.forEach(s=>{
  s.quality=Math.round(100*(.25*s.qDoc+.20*s.qValid+.30*s.qFollow+.15*s.qFb+.10*s.qDepth));
  s.outcome=Math.round(100*(.6*s.qFollow+.4*s.qFb));
  s.followups=Math.round(s.vol*.18*s.qFollow*(1.3));
});

