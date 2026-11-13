
/* ================================================================
   ROLE-BASED ACCESS
   Ten roles derived from the Satgas Soedirman org chart. A role decides
   which tabs are visible, which actions are allowed and how wide the data
   scope is (own regency, a Korwil area, or all of Java).
   ================================================================ */
var USER = null;

var KORWIL = {
  I:   {name: 'Korwil I',   area: 'Jawa Timur',        provs: ['Jawa Timur'],                 hq: 'Kota Surabaya'},
  II:  {name: 'Korwil II',  area: 'Jawa Tengah – DIY', provs: ['Jawa Tengah', 'DI Yogyakarta'], hq: 'Kota Semarang'},
  III: {name: 'Korwil III', area: 'Jawa Barat',        provs: ['Jawa Barat'],                 hq: 'Kota Bandung'},
  IV:  {name: 'Korwil IV',  area: 'Jakarta – Banten',  provs: ['DKI Jakarta', 'Banten'],      hq: 'Kota Jakarta Pusat'},
};
function korwilOf(prov) { return Object.keys(KORWIL).find(k => KORWIL[k].provs.includes(prov)); }

var STAF_FN = {
  asops:    {label: 'Asops',            full: 'Asisten Operasi',              icon: 'target', tabs: ['operasi', 'isu', 'hub', 'analitik', 'laporan', 'direktori', 'bantuan'], perms: ['alertAll', 'issueAll', 'contact']},
  asrena:   {label: 'Asrena',           full: 'Asisten Perencanaan',          icon: 'grid',   tabs: ['penempatan', 'lab', 'analitik', 'laporan', 'hub', 'direktori', 'bantuan'], perms: ['placement', 'contact']},
  asminlog: {label: 'Asminlog',         full: 'Asisten Administrasi & Logistik', icon: 'box', tabs: ['operasi', 'lab', 'laporan', 'hub', 'bantuan'], perms: ['logistics']},
  asintel:  {label: 'Asintel',          full: 'Asisten Intelijen',            icon: 'eye',    tabs: ['operasi', 'analitik', 'jaringan', 'laporan', 'hub', 'bantuan'], perms: ['intel']},
  hukum:    {label: 'Asisten Hukum & Etik', full: 'Asisten Hukum & Etik',     icon: 'scale',  tabs: ['isu', 'laporan', 'hub', 'direktori', 'bantuan'], perms: ['ethics']},
  anev:     {label: 'Katim Anev',       full: 'Ketua Tim Analisis & Evaluasi', icon: 'chart', tabs: ['analitik', 'laporan', 'lab', 'jaringan', 'direktori', 'hub', 'bantuan'], perms: ['eval']},
};

var MITRA = [
  ['kemenkes', 'Kementerian Kesehatan', ['Kesehatan']],
  ['kemendik', 'Kemendikdasmen & Kemdiktisaintek', ['Pendidikan']],
  ['kemensos', 'Kementerian Sosial', ['Sosial & kesejahteraan']],
  ['kemendagri', 'Kementerian Dalam Negeri', ['Pelayanan publik']],
  ['kempu', 'Kementerian Pekerjaan Umum', ['Infrastruktur']],
  ['kemenumkm', 'Kementerian UMKM', ['Ekonomi & UMKM']],
  ['kementan', 'Kementerian Pertanian', ['Pertanian & pangan']],
  ['kemnaker', 'Kementerian Ketenagakerjaan', ['Ketenagakerjaan']],
  ['komdigi', 'Kementerian Komunikasi dan Digital', ['Teknologi & digitalisasi']],
  ['klh', 'Kementerian Lingkungan Hidup', ['Lingkungan hidup']],
];

var POKJA = [
  ['1', 'Pokja Kajian Strategis & Desain Dialog', ['Pelayanan publik', 'Sosial & kesejahteraan', 'Lainnya'], 'trend'],
  ['2', 'Pokja Data, Survei & Pemetaan Sosial', CATS, 'data'],
  ['3', 'Pokja Komunikasi Publik & Narasi Kebangsaan', CATS, 'sentiment'],
  ['4', 'Pokja Kampus, Pemuda & Cendekiawan', ['Pendidikan', 'Ketenagakerjaan', 'Teknologi & digitalisasi'], 'trend'],
  ['5', 'Pokja Pemda, Tokoh Agama & Masyarakat', ['Pelayanan publik', 'Infrastruktur', 'Lingkungan hidup'], 'authority'],
  ['6', 'Pokja Kesejahteraan & Pemberdayaan Sosial', ['Sosial & kesejahteraan', 'Ekonomi & UMKM', 'Kesehatan', 'Pertanian & pangan'], 'trend'],
  ['7', 'Pokja Deteksi Dini & Pengamanan Dialog', CATS, 'early'],
  ['8', 'Pokja Rumusan Kebijakan & Tindak Lanjut', CATS, 'policy'],
];

var ROLEDEF = {
  serdik:      {label: 'Serdik', tier: 'Lapangan', icon: 'walk', desc: 'Kehadiran harian, kunjungan warga, pencatatan aspirasi, Hub, laporan harian, dan latihan.',
                tabs: ['saya', 'operasi', 'hub', 'analitik', 'isu', 'jaringan', 'laporan', 'lab', 'arena', 'bantuan', 'direktori'], perms: ['field', 'contact', 'issueOwn'], scope: 'Kabupaten/kota sendiri'},
  koordinator: {label: 'Koordinator Kab/Kota', tier: 'Lapangan', icon: 'users', desc: 'Semua akses Serdik, ditambah validasi aspirasi tim, penanganan peringatan tim, dan rekap tim.',
                tabs: ['saya', 'operasi', 'hub', 'analitik', 'isu', 'jaringan', 'laporan', 'lab', 'arena', 'bantuan', 'direktori'], perms: ['field', 'contact', 'issueTeam', 'alertTeam'], scope: 'Tim kabupaten/kota'},
  korwil:      {label: 'Korwil', tier: 'Komando', icon: 'globe', desc: 'Kendali wilayah: eskalasi, persetujuan penguatan tim, dan pemantauan seluruh kabupaten/kota di wilayahnya.',
                tabs: ['saya', 'operasi', 'hub', 'analitik', 'isu', 'jaringan', 'laporan', 'penempatan', 'lab', 'bantuan', 'direktori'], perms: ['contact', 'issueScope', 'alertScope', 'approveScope'], scope: 'Provinsi di wilayah Korwil'},
  komando:     {label: 'Komando', tier: 'Komando', icon: 'star', desc: 'Komandan dan Wakil Komandan: seluruh Jawa, keputusan final eskalasi dan penempatan, instruksi ke seluruh Serdik.',
                tabs: ['saya', 'operasi', 'hub', 'analitik', 'isu', 'jaringan', 'laporan', 'penempatan', 'lab', 'bantuan', 'direktori'], perms: ['contact', 'issueAll', 'alertAll', 'approveAll', 'placement', 'announce'], scope: 'Seluruh Pulau Jawa'},
  staf:        {label: 'Staf Komando', tier: 'Komando', icon: 'shield', desc: 'Asops, Asrena, Asminlog, Asintel, Hukum & Etik, atau Anev. Modul mengikuti fungsi masing-masing.',
                tabs: null, perms: [], scope: 'Seluruh Pulau Jawa (sesuai fungsi)'},
  admin:       {label: 'Admin Data & IT', tier: 'Pemilik sistem', icon: 'db', desc: 'Katim Data & IT: akun dan peran, kualitas data, integrasi, dan log audit.',
                tabs: ['saya', 'operasi', 'analitik', 'laporan', 'direktori', 'bantuan'], perms: ['admin'], scope: 'Sistem'},
  konten:      {label: 'Konten & Layanan', tier: 'Pemilik sistem', icon: 'pen', desc: 'Katim Konten & Layanan: pengumuman, FAQ, toolkit komunikasi, dan helpdesk.',
                tabs: ['saya', 'hub', 'bantuan', 'analitik', 'laporan'], perms: ['announce', 'content'], scope: 'Konten & layanan'},
  pimpinan:    {label: 'Pimpinan', tier: 'Pengarah', icon: 'brief', desc: 'Ketua & Anggota Pengarah, Ketua Pelaksana: ringkasan eksekutif dan data agregat, tanpa data individu.',
                tabs: ['saya', 'operasi', 'analitik', 'laporan'], perms: [], anon: true, scope: 'Agregat nasional'},
  mitra:       {label: 'Mitra K/L', tier: 'Mitra', icon: 'building', desc: 'Anggota Pelaksana Eselon I: menerima dan merespons aspirasi yang dirujuk ke sektornya.',
                tabs: ['saya', 'bantuan'], perms: ['mitra'], scope: 'Aspirasi sektor instansi'},
  pokja:       {label: 'Pokja & Ahli', tier: 'Mitra', icon: 'book', desc: 'Delapan kelompok kerja dan dewan pakar: analitik tematik dengan data yang dianonimkan.',
                tabs: ['saya', 'analitik', 'laporan', 'lab', 'jaringan'], perms: [], anon: true, scope: 'Tematik, teranonimkan'},
};
var ROLE_ORDER = ['serdik', 'koordinator', 'korwil', 'komando', 'staf', 'admin', 'konten', 'pimpinan', 'mitra', 'pokja'];

function roleTabs() {
  if (!USER) return [];
  if (USER.role === 'staf') return ['saya'].concat(STAF_FN[USER.fn].tabs);
  return ROLEDEF[USER.role].tabs;
}
function rolePerms() {
  if (!USER) return [];
  if (USER.role === 'staf') return STAF_FN[USER.fn].perms;
  return ROLEDEF[USER.role].perms;
}
function isField() { return !USER || USER.role === 'serdik' || USER.role === 'koordinator'; }
function can(p) { return rolePerms().includes(p); }
function tabAllowed(t) { return roleTabs().includes(t); }
function anonMode() { return !!(USER && ROLEDEF[USER.role].anon); }
function inScope(r) { return !USER || !USER.provs || USER.provs.includes(r.prov); }
function canAlert(a) {
  if (can('alertAll')) return true;
  if (isField() && a.type === 'bantuan') return true; // anyone in the field may volunteer help
  if (USER && USER.role === 'serdik') return me && a.s.region === me.region;
  if (can('alertScope')) return inScope(a.s.region);
  if (can('alertTeam')) return me && a.s.region === me.region;
  return false;
}
function canIssue(it) {
  if (can('issueAll')) return true;
  if (can('issueScope')) return inScope(it.region);
  if (can('issueTeam')) return me && it.region === me.region;
  if (can('issueOwn')) return it.owner === me;
  return false;
}
var _nameRe = null, _byName = {};
function anonText(t) {
  if (!anonMode() || !t) return t;
  if (!_nameRe) {
    S.forEach(s => { _byName[s.name] = s.id; });
    const names = Object.keys(_byName).sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    _nameRe = new RegExp(names.join('|'), 'g');
  }
  return t.replace(_nameRe, m => 'Serdik ' + _byName[m]);
}
function dispName(s) { return s ? (anonMode() && !s.isStaff ? 'Serdik ' + s.id : s.name) : ''; }

/* ---------- audit log (shared by Admin and Hukum & Etik) ---------- */
var AUDIT = [];
function audit(what, who) {
  AUDIT.unshift({time: hhmm(sim.min), day: sim.day, who: who || (USER ? USER.title : 'Sistem'), role: USER ? roleLabel() : '—', what});
  if (AUDIT.length > 200) AUDIT.length = 200;
}
function roleLabel() { if (!USER) return ''; return USER.role === 'staf' ? STAF_FN[USER.fn].label : ROLEDEF[USER.role].label; }

/* ---------- staff identities (virtual, not Serdik) ---------- */
function anchorRegion(name) { return R.find(r => r.name === name) || R[0]; }
var _sid = 900;
function makeOfficer(title, unit, regionName, dom) {
  const r = anchorRegion(regionName);
  return {idx: _sid++, id: 'STF-' + (_sid - 900), name: title, isStaff: true, unit, region: r, dom: dom || 'A', st: 'duty', act: unit,
    cx: r.x, cz: r.z, px: r.x, pz: r.z, coord: false, buddy: null, visitsToday: 0, weekVisits: 0, vol: 0, quality: 0, outcome: 0,
    qDoc: 0, qValid: 0, qFollow: 0, qFb: 0, qDepth: 0, langs: {}, sk: {}, certs: [], conf: 5, listen: 5, publicExp: 5, lastVillage: null};
}
var STAFF_PEOPLE = [
  makeOfficer('Komandan Satgas', 'Komando', 'Kota Jakarta Pusat', 'A'),
  makeOfficer('Wakil Komandan', 'Komando', 'Kota Jakarta Pusat', 'A'),
  makeOfficer('Asops', 'Asisten Operasi', 'Kota Jakarta Pusat', 'D'),
  makeOfficer('Asrena', 'Asisten Perencanaan', 'Kota Jakarta Pusat', 'D'),
  makeOfficer('Asminlog', 'Admin & Logistik', 'Kota Jakarta Pusat', 'C'),
  makeOfficer('Katim Data & IT', 'Data & IT', 'Kota Jakarta Pusat', 'D'),
  makeOfficer('Katim Konten & Layanan', 'Konten & Layanan', 'Kota Jakarta Pusat', 'B'),
  makeOfficer('Korwil I', 'Korwil I · Jawa Timur', 'Kota Surabaya', 'A'),
  makeOfficer('Korwil II', 'Korwil II · Jawa Tengah – DIY', 'Kota Semarang', 'A'),
  makeOfficer('Korwil III', 'Korwil III · Jawa Barat', 'Kota Bandung', 'A'),
  makeOfficer('Korwil IV', 'Korwil IV · Jakarta – Banten', 'Kota Jakarta Pusat', 'A'),
];
var POSKO_USER = STAFF_PEOPLE[0];

/* account options per staff role at login */
function staffOptions(role) {
  if (role === 'korwil') return Object.keys(KORWIL).map(k => [k, `${KORWIL[k].name} · ${KORWIL[k].area}`]);
  if (role === 'komando') return [['dan', 'Komandan Satgas Soedirman'], ['wadan', 'Wakil Komandan Satgas']];
  if (role === 'staf') return Object.keys(STAF_FN).map(k => [k, `${STAF_FN[k].label} · ${STAF_FN[k].full}`]);
  if (role === 'admin') return [['dataIT', 'Katim Data & IT']];
  if (role === 'konten') return [['konten', 'Katim Konten & Layanan']];
  if (role === 'pimpinan') return [['ketua', 'Ketua Pengarah'], ['pelaksana', 'Ketua Pelaksana'], ['anggota', 'Anggota Pengarah']];
  if (role === 'mitra') return MITRA.map(m => [m[0], m[1]]);
  if (role === 'pokja') return POKJA.map(p => [p[0], p[1]]).concat([['ahli', 'Kelompok Ahli / Dewan Pakar']]);
  return [];
}
function buildUser(role, key) {
  const u = {role, key, provs: null};
  if (role === 'korwil') { const k = KORWIL[key]; Object.assign(u, {title: k.name, unit: k.area, provs: k.provs, kw: key, me: STAFF_PEOPLE[7 + ['I', 'II', 'III', 'IV'].indexOf(key)]}); }
  else if (role === 'komando') Object.assign(u, {title: key === 'dan' ? 'Komandan Satgas' : 'Wakil Komandan', unit: 'Komando Satgas Soedirman', me: STAFF_PEOPLE[key === 'dan' ? 0 : 1]});
  else if (role === 'staf') { const f = STAF_FN[key]; Object.assign(u, {fn: key, title: f.label, unit: f.full, me: makeOfficer(f.label, f.full, 'Kota Jakarta Pusat', 'D')}); }
  else if (role === 'admin') Object.assign(u, {title: 'Katim Data & IT', unit: 'Pemilik sistem', me: STAFF_PEOPLE[5]});
  else if (role === 'konten') Object.assign(u, {title: 'Katim Konten & Layanan', unit: 'Pemilik sistem', me: STAFF_PEOPLE[6]});
  else if (role === 'pimpinan') { const t = {ketua: 'Ketua Pengarah', pelaksana: 'Ketua Pelaksana', anggota: 'Anggota Pengarah'}[key]; Object.assign(u, {title: t, unit: 'Dewan Pengarah', me: makeOfficer(t, 'Dewan Pengarah', 'Kota Jakarta Pusat', 'A')}); }
  else if (role === 'mitra') { const m = MITRA.find(x => x[0] === key); Object.assign(u, {title: m[1], unit: 'Mitra K/L · Eselon I', cats: m[2], me: makeOfficer(m[1], 'Mitra K/L', 'Kota Jakarta Pusat', 'B')}); }
  else if (role === 'pokja') {
    const p = POKJA.find(x => x[0] === key);
    if (p) Object.assign(u, {title: p[1], unit: 'Kelompok Kerja', pokja: p, me: makeOfficer(p[1], 'Kelompok Kerja', 'Kota Jakarta Pusat', 'D')});
    else Object.assign(u, {title: 'Kelompok Ahli / Dewan Pakar', unit: 'Dewan Pakar', pokja: ['ahli', 'Kelompok Ahli / Dewan Pakar', CATS, 'trend'], me: makeOfficer('Dewan Pakar', 'Dewan Pakar', 'Kota Jakarta Pusat', 'D')});
  }
  return u;
}

/* ================================================================
   LOGIN
   ================================================================ */
var loginRole = 'serdik';
function renderRoleGrid() {
  $('#roleGrid').innerHTML = ROLE_ORDER.map(k => { const d = ROLEDEF[k];
    return `<button type="button" class="rolecard" role="radio" data-role="${k}" aria-checked="${k === loginRole}"><span class="ri"><svg class="ic"><use href="#i-${d.icon}"/></svg></span><span><b>${d.label}</b><span class="t">${d.tier}</span></span></button>`; }).join('');
}
function setLoginRole(k) {
  loginRole = k; renderRoleGrid();
  const field = k === 'serdik' || k === 'koordinator';
  $('#idField').hidden = !field; $('#idStaff').hidden = field; $('#randomPersona').hidden = !field;
  $('#loginErr').hidden = true;
  if (field) {
    const list = k === 'koordinator'
      ? R.filter(r => r.coord).sort((a, b) => b.needTot - a.needTot).slice(0, 4).map(r => ({s: r.coord, why: 'Koordinator'}))
      : personaList().filter(p => !p.s.coord).concat(personaList().filter(p => p.s.coord)).slice(0, 4);
    $('#personas').innerHTML = list.map((p, i) => `<button type="button" class="persona" data-sid="${p.s.idx}" aria-pressed="${i === 0}"><div class="avatar" style="background:${CLHEX[p.s.dom]}">${esc(initials(p.s.name))}</div><div><b>${esc(p.s.name)} · ${p.s.id}</b><span>${esc(p.why)} · ${esc(p.s.region.name)}</span></div></button>`).join('');
    $('#loginId').value = list[0] ? list[0].s.id : '';
    $('#loginIdLbl').textContent = k === 'koordinator' ? 'ID Serdik (koordinator)' : 'ID Serdik';
  } else {
    const opts = staffOptions(k);
    $('#staffSel').innerHTML = opts.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join('');
    $('#staffLbl').textContent = {korwil: 'Wilayah', komando: 'Jabatan', staf: 'Fungsi', mitra: 'Instansi', pokja: 'Kelompok', pimpinan: 'Jabatan'}[k] || 'Akun';
  }
  const d = ROLEDEF[k];
  $('#roleDesc').innerHTML = `<b style="color:var(--fg)">${d.label}</b><span>${d.desc}</span><span class="row"><svg class="ic" style="width:14px;height:14px"><use href="#i-lock"/></svg>Cakupan data: ${d.scope}</span>`;
  if (field) { const el = $('#roleDescField'); if (el) el.remove(); $('#idField').insertAdjacentHTML('beforeend', `<div class="roledesc" id="roleDescField">${$('#roleDesc').innerHTML}</div>`); }
}
function initRoles() {
  initLogin();
  setLoginRole(loginRole);
  $('#roleGrid').onclick = e => { const b = e.target.closest('[data-role]'); if (b) setLoginRole(b.dataset.role); };
  $('#roleGrid').onkeydown = e => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault(); const i = ROLE_ORDER.indexOf(loginRole), d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    setLoginRole(ROLE_ORDER[(i + d + ROLE_ORDER.length) % ROLE_ORDER.length]); $(`[data-role="${loginRole}"]`).focus();
  };
  $('#randomPersona').onclick = () => { const pool = S.filter(x => x.region && (loginRole === 'koordinator' ? x.coord : true)); const s = pick(pool); $('#loginId').value = s.id; $$('.persona').forEach(x => x.setAttribute('aria-pressed', 'false')); };
  $('#loginForm').onsubmit = e => {
    e.preventDefault(); const err = $('#loginErr');
    if (!/^\d{4}$/.test($('#loginPin').value)) { err.textContent = 'PIN demo terdiri dari 4 angka.'; err.hidden = false; return; }
    if (loginRole === 'serdik' || loginRole === 'koordinator') {
      const id = $('#loginId').value.trim().toUpperCase();
      const s = S.find(x => x.id === id || x.id === 'SRD-' + id.replace(/\D/g, '').padStart(3, '0'));
      if (!s) { err.textContent = 'ID tidak ditemukan. Gunakan format SRD-001 sampai SRD-384.'; err.hidden = false; return; }
      if (!s.region) { err.textContent = 'Serdik ini sedang disimulasikan berhalangan. Pilih ID lain.'; err.hidden = false; return; }
      if (loginRole === 'koordinator' && !s.coord) { err.textContent = `${s.name} bukan koordinator. Pilih salah satu persona koordinator.`; err.hidden = false; return; }
      err.hidden = true;
      USER = {role: loginRole, title: s.name, unit: s.region.name, provs: null};
      applyRole(); login(s);
      audit('Masuk sebagai ' + ROLEDEF[loginRole].label, s.name);
    } else {
      err.hidden = true; loginStaff(buildUser(loginRole, $('#staffSel').value));
    }
  };
}
function loginStaff(u) {
  USER = u; me = u.me;
  me.st = 'duty'; me.act = u.unit;
  sim.chat = []; sim.myTasks = []; sim.myVer++; sim.alertVer++;
  $('#login').hidden = true; $('#app').hidden = false;
  $('#meAvatar').style.background = '#13274A';
  $('#meAvatar').innerHTML = `<svg class="ic" style="color:#E3C68A"><use href="#i-${u.role === 'staf' ? STAF_FN[u.fn].icon : ROLEDEF[u.role].icon}"/></svg>`;
  $('#meName').textContent = u.title; $('#meSub').textContent = u.unit;
  state.sel = u.provs ? anchorRegion(KORWIL[u.kw].hq) : null;
  hub.ch = 'staf';
  if (!REQ.length) { for (let i = 0; i < 60; i++) reqTick(6); seedPolicy(); }
  applyRole();
  audit('Masuk ke konsol');
  if (location.hash !== '#saya') location.hash = 'saya'; else route();
  if (!T && (tabAllowed('operasi') || tabAllowed('penempatan'))) initScene(); else if (T) flyTo(state.sel, 2);
  setTimeout(() => startTour(tourFor()), 500);
}
function applyRole() {
  $$('nav.tabs a').forEach(a => { a.hidden = !tabAllowed(a.dataset.tab); });
  $('#roleChip').textContent = roleLabel();
  $('#sosBtn').hidden = !isField();
  const harian = $('#rpSeg button[data-v="harian"]'); if (harian) harian.hidden = !isField();
  RP.view = 'auto'; RP.scope = reportScopes()[0][0];
  // issue board scope buttons
  const sc = isField()
    ? [['mine', 'Milik saya'], ['team', 'Tim saya'], ['all', 'Semua']]
    : USER.provs ? [['scope', 'Wilayah ' + USER.kw], ['all', 'Semua']] : [['all', 'Semua']];
  $('#isScope').innerHTML = sc.map((x, i) => `<button data-v="${x[0]}" aria-pressed="${i === 0}">${x[1]}</button>`).join('');
  state.isScope = sc[0][0]; state.isRegion = null;
  // placement controls
  const pl = can('placement');
  ['#runPl', '#polOn', '#scAbsent', '#scSurge', '#scLang'].forEach(s => { const el = $(s); if (el) el.disabled = !pl; });
  $$('#weights input').forEach(i => { i.disabled = !pl; });
  const note = $('#plRO'); if (note) note.remove();
  if (!pl) $('#runPl').insertAdjacentHTML('beforebegin', `<span class="ro-note" id="plRO"><svg class="ic" style="width:14px;height:14px"><use href="#i-lock"/></svg>Hanya Komando dan Asrena yang dapat menjalankan penempatan</span>`);
  $('#camMe').textContent = isField() ? 'Wilayah saya' : USER.provs ? 'Wilayah Korwil' : 'Seluruh Jawa';
  const ego = $('#netEgo'); if (ego) ego.closest('label').hidden = !isField();
  if (!isField()) hub.ch = 'staf'; else hub.ch = 'tim';
  if (!isField() && !hub.msgs.staf.length) seedStaf();
}
function reportScopes() {
  if (!USER) return [['tim', 'Tim']];
  if (USER.role === 'serdik') return [['saya', 'Saya'], ['tim', 'Tim']];
  if (USER.role === 'koordinator') return [['tim', 'Tim'], ['saya', 'Saya'], ['prov', 'Provinsi']];
  if (USER.role === 'korwil') return [['kw:' + USER.kw, USER.title], ['satgas', 'Satgas']];
  if (USER.role === 'mitra') return [['satgas', 'Satgas']];
  return [['satgas', 'Satgas'], ['kw:I', 'Korwil I'], ['kw:II', 'II'], ['kw:III', 'III'], ['kw:IV', 'IV']];
}
function tourFor() {
  if (isField()) return TOUR_MAIN;
  const t = [
    {sel: '#clockBox', t: 'Jam operasi', d: 'Simulasi hari penugasan berjalan langsung. Jeda atau percepat untuk melihat ritme lapangan.'},
    {sel: 'nav.tabs', t: 'Modul sesuai peran', d: `Sebagai ${roleLabel()}, Anda hanya melihat modul yang relevan. Peran lain melihat susunan yang berbeda.`},
    {tab: 'saya', sel: '#roleHome .rh-hero', t: 'Beranda ' + roleLabel(), d: 'Ringkasan dan antrean kerja khusus peran Anda, diperbarui dari aktivitas lapangan.'},
  ];
  const first = $('#roleHome .card');
  t.push({tab: 'saya', sel: '#roleHome .an-grid', t: 'Ruang kerja', d: anonMode() ? 'Data individu dianonimkan untuk peran ini. Yang tampil adalah agregat dan pola.' : 'Setujui, tindak lanjuti, atau kirim instruksi langsung dari sini. Semua tindakan tercatat di log audit.'});
  return t;
}
$('#logoutBtn').onclick = () => {
  if (USER) audit('Keluar');
  USER = null; me = null; $('#app').hidden = true; $('#login').hidden = false; endTour(); closeDrawer();
  $$('nav.tabs a').forEach(a => { a.hidden = false; });
  initRoles();
};

/* ================================================================
   STAFF CHANNEL, REQUESTS & DECISIONS
   ================================================================ */
hub.msgs.staf = [];
var STAF_T = ['Rekap pagi: {n} peringatan terbuka, fokus di {kw}.', 'Usulan: percepat validasi aspirasi P≥80 di wilayah dengan sinyal lemah.', 'Logistik transport untuk {kw} sudah disetujui sebagian.', 'Mohon data kelengkapan tim terbaru untuk rapat pukul 15.00.', 'Pokja 8 mengirim catatan kebijakan, mohon ditinjau.', 'Helpdesk: keluhan sinkronisasi foto menurun setelah pembaruan.', 'Sentimen warga di {kw} membaik minggu ini.'];
function seedStaf() {
  for (let i = 0; i < 5; i++) { const p = pick(STAFF_PEOPLE); hubMsg('staf', p, fillStaf(pick(STAF_T))); }
  hub.unread.staf = 0;
}
function fillStaf(t) { const k = pick(Object.keys(KORWIL)); return t.replace('{n}', sim.alerts.filter(a => a.state !== 'done').length).replace('{kw}', KORWIL[k].name + ' (' + KORWIL[k].area + ')'); }

var REQ = [], _rid = 0;
function addReq(o) { const r = Object.assign({id: 'REQ-' + String(++_rid).padStart(3, '0'), created: abs(), time: hhmm(sim.min), state: 'open'}, o); REQ.unshift(r); if (REQ.length > 120) REQ.length = 120; return r; }
const LOGI = [['Transport kunjungan desa', 350000, 900000], ['Materi sosialisasi cetak', 150000, 450000], ['Pulsa data lapangan', 100000, 250000], ['Konsumsi pertemuan warga', 200000, 600000], ['Alat dokumentasi', 400000, 1200000]];
const ETIK = ['Warga mengadukan sikap Serdik saat kunjungan', 'Foto warga diunggah tanpa persetujuan', 'Dugaan konflik kepentingan dalam rujukan UMKM', 'Pertanyaan warga tentang penggunaan data pribadi', 'Laporan anonim: janji bantuan di luar kewenangan'];
function swapCandidate(r) {
  const k = r.missing[0]; if (!k) return null;
  const kw = korwilOf(r.prov);
  const cands = S.filter(s => s.region && s.region !== r && korwilOf(s.region.prov) === kw && !s.coord && s['c' + k] >= 65 && s.region.team.length > 2 &&
    s.region.team.filter(m => m !== s).some(m => m['c' + k] >= 60 || k === 'D'));
  if (!cands.length) return null;
  const s = cands.sort((a, b) => b['c' + k] - a['c' + k])[0];
  const out = r.team.filter(m => !m.coord).sort((a, b) => a['c' + k] - b['c' + k])[0];
  return out ? {k, inS: s, outS: out} : null;
}
function reqTick(f) {
  if (!USER) return;
  if (rnd() < .006 * f && REQ.filter(x => x.kind === 'swap' && x.state === 'open').length < 6) {
    const r = pick(R.filter(x => !x.complete && x.team.length)); const c = r && swapCandidate(r);
    if (c) addReq({kind: 'swap', r, c, kw: korwilOf(r.prov), title: `Penguatan tim ${r.name}`, detail: `Butuh kluster ${c.k}. Usul tukar ${c.outS.name} dengan ${c.inS.name} (${c.inS.region.name}, skor ${c.k} ${c.inS['c' + c.k]}).`});
  }
  if (rnd() < .01 * f) { const s = pick(S.filter(x => x.region)); const L = pick(LOGI); addReq({kind: 'logistik', s, kw: korwilOf(s.region.prov), item: L[0], amt: Math.round((L[1] + rnd() * (L[2] - L[1])) / 5000) * 5000, title: L[0], detail: `${s.name} · ${s.region.name}`}); }
  if (rnd() < .0025 * f) { const s = pick(S.filter(x => x.region)); addReq({kind: 'etik', s, title: pick(ETIK), detail: `${s.region.name} · laporan ${rnd() < .4 ? 'anonim' : 'beridentitas'}`}); }
  if (rnd() < .004 * f) { const s = pick(S.filter(x => x.region)); HELP.tickets.unshift({id: 'TKT-' + String(60 + HELP.tickets.length).padStart(3, '0'), t: pick(['Gagal unggah foto aspirasi', 'Lupa PIN akun', 'Peta tidak memuat di HP lama', 'Notifikasi tidak muncul', 'Laporan harian tidak terkirim']), st: 0, c: pick(['Teknis aplikasi', 'Akun', 'Data & sinkronisasi', 'Perangkat']), from: s}); }
  if (!isField() && rnd() < .02 * f) hubMsg('staf', pick(STAFF_PEOPLE), fillStaf(pick(STAF_T)));
}
(() => { const _ht = window.__hubTick; window.__hubTick = f => { _ht(f); reqTick(f); }; })();

function doSwap(q) {
  const {k, inS, outS} = q.c; const rA = q.r, rB = inS.region;
  if (!rA.team.includes(outS) || !rB.team.includes(inS)) { toast('Usulan sudah tidak berlaku, susunan tim berubah'); q.state = 'void'; return; }
  rA.team = rA.team.filter(m => m !== outS); rB.team = rB.team.filter(m => m !== inS);
  rA.team.push(inS); rB.team.push(outS); inS.region = rA; outS.region = rB; inS.manual = outS.manual = true;
  [inS, outS].forEach(s => { s.tw = {fx: s.cx, fz: s.cz, t: 0}; s.purpose = null; if (s.st === 'travel') s.st = 'duty'; });
  finalizeTeams(); updateColumns();
  emit('rapat', {s: inS, important: true, text: `Penguatan tim disetujui: ${inS.name} ke ${rA.name} (kluster ${k}), ${outS.name} ke ${rB.name}`});
  q.state = 'done'; q.by = USER.title;
  audit(`Menyetujui ${q.id}: ${q.title}`);
  toast(`${rA.name} kini ${rA.covN}/4 kluster`);
}
function reqAct(id, act) {
  const q = REQ.find(x => x.id === id); if (!q || q.state !== 'open') return;
  if (q.kind === 'swap') { if (act === 'ok') doSwap(q); else { q.state = 'rejected'; audit(`Menolak ${q.id}: ${q.title}`); toast('Usulan ditolak'); } }
  else if (q.kind === 'logistik') { q.state = act === 'ok' ? 'done' : 'rejected'; if (act === 'ok') LOG.used += q.amt; audit(`${act === 'ok' ? 'Menyetujui' : 'Menolak'} logistik ${q.id} (Rp${fmt(q.amt)})`); toast(act === 'ok' ? 'Logistik disetujui' : 'Logistik ditolak');
    if (act === 'ok') emit('monitor', {s: q.s, text: `Logistik "${q.item}" untuk ${q.s.name} disetujui`}); }
  else if (q.kind === 'etik') { q.state = act === 'ok' ? 'clarify' : 'done'; if (act !== 'ok') q.state = 'done'; audit(`${act === 'ok' ? 'Membuka klarifikasi' : 'Menutup kasus'} ${q.id}`); toast(act === 'ok' ? 'Klarifikasi dijadwalkan dengan koordinator' : 'Kasus ditutup'); if (act === 'ok') { q.state = 'open'; q.step = (q.step || 0) + 1; if (q.step >= 2) q.state = 'done'; } }
  else if (q.kind === 'kebijakan') { q.state = act === 'ok' ? 'done' : 'rejected'; audit(`${act === 'ok' ? 'Menerima' : 'Mengembalikan'} catatan kebijakan ${q.id}`); toast(act === 'ok' ? 'Catatan kebijakan diterima' : 'Catatan dikembalikan ke Pokja');
    if (act === 'ok') hubMsg('posko', POSKO_USER, `Arahan Komando berdasarkan catatan ${q.from}: ${q.title}.`, {kind: 'ann'}); }
  renderRoleHome(true);
}
var LOG = {ceiling: 1500000000, used: 418500000};

/* ================================================================
   ROLE HOME DASHBOARDS
   ================================================================ */
function scopeRegions() { return R.filter(inScope); }
function stats(regs) {
  const set = new Set(regs); const serd = S.filter(s => s.region && set.has(s.region));
  const iss = I.filter(i => set.has(i.region)), act = iss.filter(active), fb = iss.filter(i => i.fb);
  const al = sim.alerts.filter(a => a.state !== 'done' && set.has(a.s.region));
  return {
    regs, serd, iss, act, al,
    field: serd.filter(s => !['off', 'rest'].includes(s.st)).length,
    complete: regs.filter(r => r.complete).length,
    fu: pct(iss.filter(i => i.si >= 3).length, iss.length),
    sw: fb.length ? fb.reduce((a, i) => a + i.fb.s, 0) / fb.length : 0,
    kend: al.filter(a => a.type === 'kendala').length,
    out: serd.length ? Math.round(serd.reduce((a, s) => a + s.outcome, 0) / serd.length) : 0,
  };
}
function hero(title, sub, actions) {
  return `<div class="rh-hero"><img src="${LOGO_SRC()}" alt=""><div style="position:relative;z-index:1;min-width:0"><span class="lbl">${esc(roleLabel())} · Hari ke-${sim.day} · <span data-live="clock">${hhmm(sim.min)}</span> WIB</span><h2>${esc(title)}</h2><p style="opacity:.85;margin-top:2px">${esc(sub)}</p></div><div class="act">${actions || ''}</div></div>`;
}
function LOGO_SRC() { const i = document.querySelector('.brandlogo'); return i ? i.src : ''; }
function kpiRow(items) {
  return `<div class="kpis" style="margin:0">${items.map(k => `<div class="kpi${k[3] ? ' has-spark' : ''}"${k[4] ? ` style="border-top-color:${k[4]}"` : ''}><b data-live="${k[2]}">${k[0]}</b><span>${k[1]}</span>${k[3] ? V.spark(k[3], 92, 30, k[4] || '#C59A4A') : ''}</div>`).join('')}</div>`;
}
function qItem(icon, title, sub, acts, cls) {
  return `<div class="q ${cls || ''}"><span class="ico"><svg class="ic"><use href="#i-${icon}"/></svg></span><div style="min-width:0"><b class="small">${title}</b><div class="small muted">${sub}</div></div><div class="acts">${acts || ''}</div></div>`;
}
function alertQueue(list, max) {
  if (!list.length) return '<div class="empty">Tidak ada peringatan terbuka di cakupan ini.</div>';
  return list.slice(0, max || 6).map(a => {
    const s = slaInfo(a); const ty = a.type === 'kendala' ? ['alert', 'Kendala lapangan'] : a.type === 'kritis' ? ['bolt', 'Aspirasi prioritas tinggi'] : ['hand', 'Permintaan bantuan'];
    let acts = '';
    if (a.state === 'open' && canAlert(a)) {
      if (a.type === 'kendala') acts = `<button class="btn sm" data-act="koord" data-id="${a.id}">Koordinator</button><button class="btn sm danger" data-act="eskalasi" data-id="${a.id}">Eskalasi</button>`;
      else if (a.type === 'kritis') acts = `<button class="btn sm primary" data-act="rujuk" data-id="${a.id}">Rujuk</button>`;
      else { const h = helpersFor(a)[0]; if (h) acts = `<button class="btn sm primary" data-act="help:${h.s.idx}" data-id="${a.id}">Tugaskan ${esc(dispName(h.s).split(' ')[0])}</button>`; }
    } else if (a.state === 'handling' && a.handler === 'Posko Satgas' && can('alertAll')) acts = `<button class="btn sm primary" data-decide="${a.id}">Putuskan</button>`;
    else acts = `<span class="small muted">${a.state === 'handling' ? 'Ditangani ' + esc(a.handler) : 'Hanya lihat'}</span>`;
    return qItem(ty[0], `${ty[1]} · <span style="color:${s.col}">${s.left >= 0 ? s.left + ' mnt' : 'lewat ' + (-s.left) + ' mnt'}</span>`, `${esc(anonText(a.text))} · ${esc(a.s.region.name)}`, acts);
  }).join('');
}
function reqQueue(list, max, labels) {
  if (!list.length) return '<div class="empty">Antrean kosong.</div>';
  return list.slice(0, max || 6).map(q => qItem({swap: 'users', logistik: 'box', etik: 'scale', kebijakan: 'book'}[q.kind], esc(q.title) + (q.amt ? ` · Rp${fmt(q.amt)}` : ''), `${esc(anonText(q.detail))} · ${q.time}${q.step ? ' · klarifikasi tahap ' + q.step : ''}`,
    q.state === 'open' ? `<button class="btn sm primary" data-req="${q.id}|ok">${(labels || {})[q.kind] ? labels[q.kind][0] : 'Setujui'}</button><button class="btn sm" data-req="${q.id}|no">${(labels || {})[q.kind] ? labels[q.kind][1] : 'Tolak'}</button>` : `<span class="pill ${q.state === 'done' ? 'ok' : 'warn'}">${{done: 'selesai', rejected: 'ditolak', void: 'kedaluwarsa'}[q.state] || q.state}</span>`, q.state !== 'open' ? 'done' : '')).join('');
}
function kwCard(k) {
  const st = stats(R.filter(r => KORWIL[k].provs.includes(r.prov)));
  return `<div class="card kwc" data-kw="${k}"><div class="head"><b>${KORWIL[k].name}</b><span class="small muted">${KORWIL[k].area}</span></div>
    <div class="rings">${V.ring(st.complete / st.regs.length, st.complete + '/' + st.regs.length, 'Tim lengkap', '#13274A', 74)}${V.ring(st.fu / 100, st.fu + '%', 'Tindak lanjut', '#C59A4A', 74)}${V.ring((st.sw + 1) / 2, (st.sw >= 0 ? '+' : '') + st.sw.toFixed(2), 'Sentimen', sentCol(st.sw), 74)}</div>
    <div class="row between small"><span>${st.field} Serdik aktif</span><span>${st.act.length} aspirasi aktif</span><span class="pill ${st.al.length ? 'crit' : 'ok'}">${st.al.length} peringatan</span></div></div>`;
}
function tilesFor(regs) {
  return `<div class="tiles">${regs.map(r => { const n = sim.alerts.filter(a => a.state !== 'done' && a.s.region === r).length; const c = n >= 2 ? '#A3202C' : n === 1 ? '#C9932F' : r.complete ? '#2E7A52' : '#6E7487';
    return `<button data-rid="${r.id}" style="background:${c}" data-tt="${esc(r.name)} · ${n} peringatan · ${r.covN}/4 kluster">${r.name.replace(/^(Kab\.|Kota) /, '').slice(0, 3).toUpperCase()}</button>`; }).join('')}</div>
    <div class="legend-row"><span><i style="background:#2E7A52"></i>tim lengkap</span><span><i style="background:#6E7487"></i>tim kurang kluster</span><span><i style="background:#C9932F"></i>1 peringatan</span><span><i style="background:#A3202C"></i>≥2 peringatan</span></div>`;
}
function hourSeries(types) { const out = []; for (let h = 7; h <= Math.min(17, Math.floor(sim.min / 60)); h++) out.push(types.reduce((a, t) => a + ((sim.hourly[t] || {})[h] || 0), 0)); return out.length > 1 ? out : [0].concat(out); }

var RH = {sig: '', last: 0};
function renderRoleHome(force) {
  if (!USER || isField()) return;
  const box = $('#roleHome');
  if (!force) { if (performance.now() - RH.last < 3000) return; if (box.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; }
  RH.last = performance.now();
  const sy = window.scrollY;
  const f = {korwil: homeKorwil, komando: homeKomando, staf: homeStaf, admin: homeAdmin, konten: homeKonten, pimpinan: homePimpinan, mitra: homeMitra, pokja: homePokja}[USER.role];
  box.innerHTML = f();
  animateBars(box);
  if (!force) window.scrollTo(0, sy);
}
function homeKorwil() {
  const regs = scopeRegions(), st = stats(regs);
  const swaps = REQ.filter(q => q.kind === 'swap' && q.kw === USER.kw);
  const al = st.al.slice().sort((a, b) => (b.state === 'open') - (a.state === 'open') || a.due - b.due);
  return hero(`${USER.title} · ${USER.unit}`, `${regs.length} kabupaten/kota · ${st.serd.length} Serdik`, `<a class="btn sm" href="#operasi">Peta operasi</a><a class="btn sm" href="#isu">Papan aspirasi</a>`)
    + kpiRow([[st.field, `Serdik aktif dari ${st.serd.length}`, 'f', hourSeries(['checkin', 'visit'])], [st.act.length, 'aspirasi aktif', 'a', hourSeries(['aspirasi']), '#C59A4A'], [st.al.length, 'peringatan terbuka', 'al', hourSeries(['kendala', 'bantuan']), '#A3202C'], [st.complete + '/' + regs.length, 'tim saling melengkapi'], [st.fu + '%', 'tingkat tindak lanjut']])
    + `<div class="an-grid">${card2('s7', 'Peringatan di wilayah', 'aksi sesuai kewenangan Korwil', `<div class="grid" style="gap:6px">${alertQueue(al, 7)}</div>`)}
      ${card2('s5', 'Papan kabupaten/kota', 'klik untuk membuka di peta', tilesFor(regs))}
      ${card2('s7', 'Usulan penguatan tim', 'dari koordinator · menunggu persetujuan Korwil', `<div class="grid" style="gap:6px">${reqQueue(swaps, 5)}</div>`)}
      ${card2('s5', 'Perbandingan antar-Korwil', 'tingkat tindak lanjut', compareKW())}</div>`;
}
function compareKW() {
  const rows = Object.keys(KORWIL).map(k => ({k, st: stats(R.filter(r => KORWIL[k].provs.includes(r.prov)))}));
  return `<div class="grid" style="gap:10px">${rows.map(x => `<div class="barrow" style="grid-template-columns:90px 1fr 46px"><span${USER.kw === x.k ? ' style="font-weight:700"' : ''}>${KORWIL[x.k].name}</span><div class="track"><i data-w="${x.st.fu}" style="background:${USER.kw === x.k ? 'var(--navy)' : 'var(--gold)'}"></i></div><span class="num">${x.st.fu}%</span></div>`).join('')}</div>`;
}
function homeKomando() {
  const st = stats(R);
  const esk = sim.alerts.filter(a => a.state !== 'done' && (a.handler === 'Posko Satgas' || a.type === 'kritis'));
  const dec = REQ.filter(q => (q.kind === 'swap' || q.kind === 'kebijakan'));
  return hero(USER.title, 'Satgas Soedirman · seluruh Pulau Jawa', `<a class="btn sm" href="#operasi">Peta operasi</a><a class="btn sm" href="#penempatan">Penempatan</a>`)
    + kpiRow([[st.field, 'Serdik aktif dari 384', 'f', hourSeries(['checkin', 'visit'])], [sim.today.aspirasi || 0, 'aspirasi baru hari ini', 'a', hourSeries(['aspirasi']), '#C59A4A'], [st.al.length, 'peringatan terbuka', 'al', hourSeries(['kendala', 'bantuan']), '#A3202C'], [st.complete + '/119', 'tim saling melengkapi'], [sim.stats.handled ? pct(sim.stats.onTime, sim.stats.handled) + '%' : '—', 'peringatan tepat SLA']])
    + `<div class="an-grid">${Object.keys(KORWIL).map(k => `<div class="s3">${kwCard(k)}</div>`).join('')}
      ${card2('s7', 'Eskalasi & aspirasi kritis', 'keputusan Komando', `<div class="grid" style="gap:6px">${alertQueue(esk, 6)}</div>`)}
      ${card2('s5', 'Instruksi ke seluruh Serdik', 'tampil di kanal Pengumuman Posko', `<form id="annForm" class="grid" style="gap:8px"><textarea id="annTxt" rows="3" placeholder="Contoh: Seluruh tim memprioritaskan validasi aspirasi kesehatan hari ini." aria-label="Isi instruksi"></textarea><div class="row"><button class="btn primary" type="submit"><svg class="ic"><use href="#i-mega"/></svg>Kirim instruksi</button></div></form>`)}
      ${card2('s12', 'Antrean keputusan', 'penguatan tim dan catatan kebijakan Pokja', `<div class="grid" style="gap:6px">${reqQueue(dec, 6, {kebijakan: ['Terima', 'Kembalikan']})}</div>`)}</div>`;
}
function homeStaf() {
  const f = STAF_FN[USER.fn], st = stats(R);
  const head = hero(`${f.label}`, f.full + ' · Komando Satgas Soedirman', f.tabs.slice(0, 2).map(t => `<a class="btn sm" href="#${t}">${$(`nav.tabs a[data-tab="${t}"]`).textContent.trim()}</a>`).join(''));
  if (USER.fn === 'asops') {
    const al = sim.alerts.filter(a => a.state !== 'done').sort((a, b) => (b.state === 'open') - (a.state === 'open') || a.due - b.due);
    const types = [['Kendala', al.filter(a => a.type === 'kendala').length, '#A3202C'], ['Bantuan', al.filter(a => a.type === 'bantuan').length, '#B0476A'], ['Kritis', al.filter(a => a.type === 'kritis').length, '#6B0F18']];
    return head + kpiRow([[st.field, 'Serdik aktif', 'f', hourSeries(['checkin', 'visit'])], [al.length, 'peringatan terbuka', 'al', hourSeries(['kendala']), '#A3202C'], [sim.stats.handled, 'ditangani hari ini'], [sim.stats.handled ? pct(sim.stats.onTime, sim.stats.handled) + '%' : '—', 'tepat SLA']])
      + `<div class="an-grid">${card2('s8', 'Antrean operasi seluruh Jawa', 'urut tenggat SLA', `<div class="grid" style="gap:6px">${alertQueue(al, 9)}</div>`)}
        ${card2('s4', 'Komposisi peringatan', '', `<div class="row" style="flex-wrap:nowrap;gap:12px;align-items:center">${V.donut(types.map(t => ({l: t[0], v: t[1], c: t[2]})), 150, `<tspan x="75" dy="6" class="t-strong" style="font-size:24px;font-family:Playfair Display,serif">${al.length}</tspan>`)}<div class="legend-row" style="display:grid;gap:4px">${types.map(t => `<span><i style="background:${t[2]}"></i>${t[0]} · <b>${t[1]}</b></span>`).join('')}</div></div>`)}</div>`;
  }
  if (USER.fn === 'asrena') {
    const dist = [0, 1, 2, 3, 4].map(n => R.filter(r => r.covN === n).length), mx = Math.max(...dist);
    return head + kpiRow([[st.complete + '/119', 'tim saling melengkapi'], [R.reduce((a, r) => a + (r.quota - r.team.length), 0), 'slot kosong'], [S.filter(s => s.region && s.buddy).length, 'Serdik dengan buddy'], [REQ.filter(q => q.kind === 'swap' && q.state === 'open').length, 'usulan penguatan terbuka']])
      + `<div class="an-grid">${card2('s5', 'Sebaran kelengkapan tim', 'jumlah kluster terpenuhi per tim', `<div class="grid" style="gap:8px">${dist.map((v, n) => `<div class="barrow" style="grid-template-columns:70px 1fr 40px"><span>${n}/4 kluster</span><div class="track" style="height:14px"><i data-w="${Math.round(v / mx * 100)}" style="background:${n >= 3 ? '#13274A' : n === 2 ? '#C9932F' : '#A3202C'}"></i></div><span class="num">${v}</span></div>`).join('')}</div>`)}
        ${card2('s7', 'Alat perencanaan', '', `<div class="actions"><a class="btn primary" href="#penempatan"><span class="ico"><svg class="ic"><use href="#i-grid"/></svg></span><span>Penempatan dua lapis<small>jalankan ulang & what-if</small></span></a><button class="btn" data-lab="ahp"><span class="ico"><svg class="ic"><use href="#i-scale"/></svg></span><span>AHP Calculator<small>bobot kriteria Lapis 2</small></span></button><button class="btn" data-lab="topsis"><span class="ico"><svg class="ic"><use href="#i-target"/></svg></span><span>TOPSIS<small>prioritas wilayah</small></span></button><button class="btn" data-lab="monte"><span class="ico"><svg class="ic"><use href="#i-chart"/></svg></span><span>Monte Carlo<small>risiko target</small></span></button></div>`)}
        ${card2('s12', 'Usulan penguatan tim seluruh Korwil', 'Asrena memberi pertimbangan; persetujuan di Korwil/Komando', `<div class="grid" style="gap:6px">${reqQueue(REQ.filter(q => q.kind === 'swap'), 6)}</div>`)}</div>`;
  }
  if (USER.fn === 'asminlog') {
    const lq = REQ.filter(q => q.kind === 'logistik'), open = lq.filter(q => q.state === 'open');
    const byItem = LOGI.map(L => ({l: L[0], v: lq.filter(q => q.item === L[0] && q.state === 'done').reduce((a, q) => a + q.amt, 0), c: ['#13274A', '#C59A4A', '#2A7F86', '#B0476A', '#7E1622'][LOGI.indexOf(L)]}));
    return head + kpiRow([[open.length, 'permintaan menunggu'], ['Rp' + fmt(open.reduce((a, q) => a + q.amt, 0)), 'nilai permintaan terbuka'], [pct(LOG.used, LOG.ceiling) + '%', 'pagu terpakai'], [lq.filter(q => q.state === 'done').length, 'disetujui hari ini']])
      + `<div class="an-grid">${card2('s7', 'Permintaan logistik', 'dari Serdik di lapangan', `<div class="grid" style="gap:6px">${reqQueue(lq, 8)}</div>`)}
        ${card2('s5', 'Serapan anggaran', `pagu Rp${fmt(LOG.ceiling)}`, `<div class="rings">${V.ring(LOG.used / LOG.ceiling, pct(LOG.used, LOG.ceiling) + '%', 'Pagu terpakai', '#13274A')}${V.ring(Math.min(1, sim.day / 60), sim.day + '/60', 'Hari penugasan', '#C59A4A')}</div><div class="row" style="flex-wrap:nowrap;gap:12px;align-items:center">${V.donut(byItem, 140, '<tspan x="70" dy="4" class="t-strong">disetujui</tspan>')}<div class="legend-row" style="display:grid;gap:3px">${byItem.map(b => `<span><i style="background:${b.c}"></i>${b.l}</span>`).join('')}</div></div><button class="btn" data-lab="budget">Buka Budget Calculator</button>`)}</div>`;
  }
  if (USER.fn === 'asintel') {
    const risk = R.map(r => { const a = sim.alerts.filter(x => x.state !== 'done' && x.s.region === r); const fb = I.filter(i => i.region === r && i.fb); const sw = fb.length ? fb.reduce((s, i) => s + i.fb.s, 0) / fb.length : 0;
      const kd = sim.events.filter(e => e.type === 'kendala' && e.r === r && e.abs >= sim.day * 1440).length;
      return {r, score: Math.round(a.length * 14 + kd * 10 + Math.max(0, -sw) * 60 + I.filter(i => i.region === r && active(i) && i.pr >= 80).length * 6), sw, a: a.length, kd}; }).sort((x, y) => y.score - x.score);
    const top = risk.slice(0, 8), mx = Math.max(1, top[0].score);
    return head + `<div class="lockline"><svg class="ic"><use href="#i-lock"/></svg>Modul terbatas. Setiap pembukaan data tercatat di log audit dan dapat ditinjau Asisten Hukum & Etik.</div>`
      + kpiRow([[risk.filter(x => x.score >= 40).length, 'wilayah sinyal tinggi', '', null, '#A3202C'], [sim.today.kendala || 0, 'kendala hari ini'], [I.filter(i => active(i) && i.pr >= 80).length, 'aspirasi P≥80 aktif'], [I.filter(i => i.fb && i.fb.s < -.15).length, 'umpan balik negatif']])
      + `<div class="an-grid">${card2('s7', 'Sinyal dini per wilayah', 'skor = peringatan + kendala + sentimen negatif + aspirasi kritis', `<div class="grid" style="gap:8px">${top.map(x => `<div class="barrow" style="grid-template-columns:150px 1fr 44px;cursor:pointer" data-rid="${x.r.id}"><span>${esc(x.r.name)}</span><div class="track" style="height:12px"><i data-w="${Math.round(x.score / mx * 100)}" style="background:${x.score >= 40 ? '#A3202C' : '#C9932F'}"></i></div><b class="num">${x.score}</b></div>`).join('')}</div>`)}
        ${card2('s5', 'Bacaan', '', `<div class="grid" style="gap:8px">${top.slice(0, 3).map(x => `<div class="insight"><span class="ico"><svg class="ic"><use href="#i-eye"/></svg></span><span><b>${esc(x.r.name)}</b>: ${x.a} peringatan terbuka, ${x.kd} kendala hari ini, sentimen warga ${x.sw.toFixed(2)}.</span></div>`).join('')}<p class="note">Sinyal dini adalah bahan kewaspadaan, bukan kesimpulan. Verifikasi melalui Korwil sebelum ditindaklanjuti.</p></div>`)}</div>`;
  }
  if (USER.fn === 'hukum') {
    const eq = REQ.filter(q => q.kind === 'etik');
    const consent = pct(I.filter(i => i.docOk).length, I.length), anonR = pct(I.filter(i => i.anon).length, I.length);
    return head + kpiRow([[eq.filter(q => q.state === 'open').length, 'kasus etik terbuka'], [consent + '%', 'aspirasi dengan persetujuan dokumentasi'], [anonR + '%', 'pelapor memilih anonim'], [AUDIT.length, 'entri log audit']])
      + `<div class="an-grid">${card2('s7', 'Kasus hukum & etik', 'klarifikasi dua tahap sebelum ditutup', `<div class="grid" style="gap:6px">${reqQueue(eq, 7, {etik: ['Klarifikasi', 'Tutup']})}</div>`)}
        ${card2('s5', 'Kepatuhan data', '', `<div class="rings">${V.ring(consent / 100, consent + '%', 'Persetujuan', '#2E7A52')}${V.ring(anonR / 100, anonR + '%', 'Anonim', '#C59A4A')}${V.ring(Math.min(1, AUDIT.length / 50), AUDIT.length, 'Log audit', '#13274A')}</div>`)}
        ${card2('s12', 'Log audit akses & keputusan', '', auditTable(10))}</div>`;
  }
  // anev
  const chain = [['Input', S.filter(s => s.region).length, 'Serdik'], ['Aktivitas', Object.values(sim.today).reduce((a, b) => a + b, 0), 'kejadian hari ini'], ['Output', I.length, 'aspirasi tercatat'], ['Outcome', pct(I.filter(i => i.si >= 3).length, I.length) + '%', 'ditindaklanjuti'], ['Impact', I.filter(i => i.si >= 6).length, 'terselesaikan']];
  return head + `<div class="card grid"><div class="row between"><h3>Rantai hasil Satgas</h3><span class="small muted">Input → Impact</span></div><div class="chain">${chain.map(c => `<div><span>${c[0]}</span><b>${c[1]}</b><span style="text-transform:none;letter-spacing:0">${c[2]}</span></div>`).join('')}</div></div>
    <div class="an-grid">${Object.keys(KORWIL).map(k => `<div class="s3">${kwCard(k)}</div>`).join('')}
    ${card2('s12', 'Evaluasi per Korwil', '', evalTable())}</div>`;
}
function evalTable() {
  return `<div class="tbl-wrap"><table><thead><tr><th>Korwil</th><th>Serdik</th><th>Tim lengkap</th><th>Aspirasi</th><th>Tindak lanjut</th><th>Selesai</th><th>Sentimen</th><th>Outcome rata-rata</th></tr></thead><tbody>${Object.keys(KORWIL).map(k => { const st = stats(R.filter(r => KORWIL[k].provs.includes(r.prov)));
    return `<tr><td><b>${KORWIL[k].name}</b> · ${KORWIL[k].area}</td><td class="num">${st.serd.length}</td><td class="num">${st.complete}/${st.regs.length}</td><td class="num">${st.iss.length}</td><td class="num">${st.fu}%</td><td class="num">${pct(st.iss.filter(i => i.si >= 6).length, st.iss.length)}%</td><td class="num" style="color:${sentCol(st.sw)}">${st.sw.toFixed(2)}</td><td class="num">${st.out}%</td></tr>`; }).join('')}</tbody></table></div>`;
}
function auditTable(n) {
  return AUDIT.length ? `<div class="tbl-wrap" style="max-height:320px;overflow:auto"><table><thead><tr><th>Waktu</th><th>Pengguna</th><th>Peran</th><th>Aktivitas</th></tr></thead><tbody>${AUDIT.slice(0, n).map(a => `<tr><td class="num">H${a.day} ${a.time}</td><td>${esc(a.who)}</td><td>${esc(a.role)}</td><td>${esc(a.what)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Belum ada entri.</div>';
}
var ADM = {q: '', role: '', roles: {}, inactive: new Set()};
function accounts() {
  const list = S.map(s => ({id: s.id, name: s.name, role: ADM.roles[s.id] || (s.coord ? 'Koordinator Kab/Kota' : 'Serdik'), unit: s.region ? s.region.name : 'Berhalangan', active: !ADM.inactive.has(s.id) && !!s.region}));
  STAFF_PEOPLE.forEach(p => list.push({id: p.id, name: p.name, role: ADM.roles[p.id] || (p.unit.startsWith('Korwil') ? 'Korwil' : /Data|Konten/.test(p.unit) ? (p.unit.startsWith('Data') ? 'Admin Data & IT' : 'Konten & Layanan') : p.name.startsWith('As') ? 'Staf Komando' : 'Komando'), unit: p.unit, active: !ADM.inactive.has(p.id)}));
  return list;
}
function homeAdmin() {
  const acc = accounts(), roles = [...new Set(acc.map(a => a.role))];
  const dist = roles.map((r, i) => ({l: r, v: acc.filter(a => a.role === r).length, c: ['#13274A', '#C59A4A', '#2A7F86', '#B0476A', '#7E1622', '#6A4C93', '#2E7A52'][i % 7]}));
  const q = ADM.q.toLowerCase(); const shown = acc.filter(a => (!q || (a.name + a.id + a.unit).toLowerCase().includes(q)) && (!ADM.role || a.role === ADM.role)).slice(0, 40);
  const prof = pct(S.filter(s => s.certs.length || s.kkn).length, S.length), geo = pct(I.filter(i => i.docOk).length, I.length);
  const INTEG = [['Gateway WhatsApp', 'ok', 182], ['Data BPS (wilayah)', 'ok', 96], ['API Dinas daerah', 'warn', 640], ['Peta dasar GIS', 'ok', 140], ['Penyimpanan foto', 'ok', 210]];
  return hero('Data & IT', 'Akun, peran, kualitas data, integrasi, dan audit', '<a class="btn sm" href="#direktori">Direktori</a>')
    + kpiRow([[acc.length, 'akun terdaftar'], [acc.filter(a => a.active).length, 'akun aktif'], [prof + '%', 'profil lengkap'], [geo + '%', 'aspirasi berbukti & berlokasi'], [AUDIT.length, 'entri audit']])
    + `<div class="an-grid">${card2('s8', 'Akun & peran', 'ubah peran atau nonaktifkan akun', `<div class="row"><input type="search" id="admQ" placeholder="Cari nama, ID, unit…" value="${esc(ADM.q)}" aria-label="Cari akun"><select id="admRole" aria-label="Filter peran"><option value="">Semua peran</option>${roles.map(r => `<option${r === ADM.role ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select></div>
      <div class="tbl-wrap" style="max-height:380px;overflow:auto"><table class="acctbl"><thead><tr><th>ID</th><th>Nama</th><th>Unit</th><th>Peran</th><th>Status</th><th></th></tr></thead><tbody>${shown.map(a => `<tr><td class="mono">${a.id}</td><td>${esc(a.name)}</td><td>${esc(a.unit)}</td><td><select data-acc="${a.id}" aria-label="Peran ${esc(a.name)}">${ROLE_ORDER.map(k => ROLEDEF[k].label).map(l => `<option${l === a.role ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></td><td>${a.active ? '<span class="pill ok">aktif</span>' : '<span class="pill crit">nonaktif</span>'}</td><td><button class="btn sm" data-toggle="${a.id}">${a.active ? 'Nonaktifkan' : 'Aktifkan'}</button> <button class="btn sm" data-pin="${a.id}">Reset PIN</button></td></tr>`).join('')}</tbody></table></div><span class="small muted">Menampilkan ${shown.length} dari ${acc.length} akun.</span>`)}
      ${card2('s4', 'Komposisi peran', '', `${V.donut(dist, 170, `<tspan x="85" dy="6" class="t-strong" style="font-size:22px;font-family:Playfair Display,serif">${acc.length}</tspan>`)}<div class="legend-row" style="display:grid;gap:3px">${dist.map(d => `<span><i style="background:${d.c}"></i>${esc(d.l)} · <b>${d.v}</b></span>`).join('')}</div>`)}
      ${card2('s5', 'Integrasi', 'latensi rata-rata', `<div class="grid" style="gap:8px">${INTEG.map((g, i) => `<div class="row between" style="flex-wrap:nowrap"><span class="row" style="gap:6px"><span class="sdot${g[1] === 'ok' ? '' : ' pulse'}" style="background:${g[1] === 'ok' ? '#2E7A52' : '#C9932F'}"></span>${g[0]}</span>${V.spark(Array.from({length: 12}, (_, k) => g[2] * (.7 + hsh(i * 13 + k + sim.min % 7) * .6)), 110, 26, g[1] === 'ok' ? '#2A7F86' : '#C9932F').replace('class="spark"', 'class="spark" style="position:static"')}<span class="num small">${g[2]} ms</span></div>`).join('')}</div>`)}
      ${card2('s7', 'Log audit', 'login, keputusan, perubahan peran', auditTable(8))}</div>`;
}
var KT = {ch: 'posko'};
function homeKonten() {
  const chs = ['angkatan', 'prov', 'praktik', 'posko', 'bantuan'];
  const vol = chs.map(c => ({c, n: (hub.msgs[c] || []).length}));
  const all = [...hub.msgs.angkatan, ...hub.msgs.praktik].slice(-40).map(m => m.sent); const moral = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;
  const tk = HELP.tickets;
  return hero('Konten & Layanan', 'Pengumuman, FAQ, toolkit komunikasi, dan helpdesk', '<a class="btn sm" href="#hub">Hub</a><a class="btn sm" href="#bantuan">Pusat bantuan</a>')
    + kpiRow([[tk.filter(t => t.st < 3).length, 'tiket helpdesk terbuka', '', null, '#A3202C'], [tk.filter(t => t.st === 3).length, 'tiket selesai'], [FAQ.length, 'entri FAQ'], [(moral >= 0 ? '+' : '') + moral.toFixed(2), 'sentimen Hub']])
    + `<div class="an-grid">${card2('s6', 'Tulis pengumuman', 'langsung tampil di Hub semua Serdik', `<form id="annForm" class="grid" style="gap:8px"><select id="annCh" aria-label="Kanal"><option value="posko">Pengumuman Posko</option><option value="angkatan">Angkatan P3MD</option><option value="praktik">Praktik baik</option></select><textarea id="annTxt" rows="4" placeholder="Contoh: Template formulir persetujuan dokumentasi terbaru sudah tersedia di Pusat bantuan." aria-label="Isi pengumuman"></textarea><div class="row"><button class="btn primary" type="submit"><svg class="ic"><use href="#i-mega"/></svg>Terbitkan</button></div></form>`)}
      ${card2('s6', 'Antrean helpdesk', 'Tech Helpdesk P3MDI', `<div class="grid" style="gap:6px">${tk.slice(0, 7).map(t => qItem('help', `${t.id} · ${esc(t.t)}`, `${esc(t.c)}${t.from ? ' · ' + esc(t.from.name) : ''} · ${['Diterima', 'Ditinjau', 'Dikerjakan', 'Selesai'][t.st]}`, t.st < 3 ? `<button class="btn sm primary" data-tk="${t.id}">${['Tinjau', 'Kerjakan', 'Selesaikan'][t.st]}</button>` : '<span class="pill ok">selesai</span>', t.st === 3 ? 'done' : '')).join('')}</div>`)}
      ${card2('s6', 'Kelola FAQ', 'tampil di Pusat bantuan', `<form id="faqForm" class="grid" style="gap:6px"><input type="text" id="faqQn" placeholder="Pertanyaan" aria-label="Pertanyaan FAQ"><textarea id="faqAn" rows="2" placeholder="Jawaban" aria-label="Jawaban FAQ"></textarea><button class="btn" type="submit" style="justify-self:start">Tambah ke FAQ</button></form><div class="grid" style="gap:4px">${FAQ.slice(-4).reverse().map(f => `<div class="small">• ${esc(f[0])}</div>`).join('')}</div>`)}
      ${card2('s6', 'Aktivitas kanal Hub', 'jumlah pesan', `<div class="grid" style="gap:8px">${vol.map(v => `<div class="barrow" style="grid-template-columns:110px 1fr 40px"><span>#${v.c}</span><div class="track"><i data-w="${Math.round(v.n / Math.max(1, ...vol.map(x => x.n)) * 100)}"></i></div><span class="num">${v.n}</span></div>`).join('')}</div>${V.gauge(moral, 'moral Serdik di Hub')}`)}</div>`;
}
function homePimpinan() {
  const st = stats(R), resolved = I.filter(i => i.si >= 6).length;
  const cat = CATS.map(c => [c, st.act.filter(i => i.cat === c).length]).sort((a, b) => b[1] - a[1]).slice(0, 6), cm = Math.max(1, cat[0][1]);
  const chain = [['Input', S.filter(s => s.region).length, 'Serdik ditempatkan'], ['Aktivitas', fmt(S.reduce((a, s) => a + s.vol, 0)), 'interaksi warga'], ['Output', fmt(I.length), 'aspirasi tercatat'], ['Outcome', st.fu + '%', 'ditindaklanjuti'], ['Impact', fmt(resolved), 'terselesaikan']];
  const attn = Object.keys(KORWIL).map(k => ({k, st: stats(R.filter(r => KORWIL[k].provs.includes(r.prov)))})).sort((a, b) => a.st.fu - b.st.fu);
  return hero('Ringkasan eksekutif', 'Satgas Soedirman · agregat seluruh Pulau Jawa', '<button class="btn sm" id="exeCopy"><svg class="ic"><use href="#i-copy"/></svg>Salin ringkasan</button>')
    + `<div class="lockline" style="color:var(--navy);background:var(--gold-soft)"><svg class="ic"><use href="#i-lock"/></svg>Tampilan pimpinan menyajikan data agregat. Identitas Serdik dan warga tidak ditampilkan.</div>`
    + `<div class="card grid"><div class="row between"><h3>Rantai hasil</h3><span class="small muted">sejak penugasan dimulai</span></div><div class="chain">${chain.map(c => `<div><span>${c[0]}</span><b>${c[1]}</b><span style="text-transform:none;letter-spacing:0">${c[2]}</span></div>`).join('')}</div></div>`
    + `<div class="an-grid">${Object.keys(KORWIL).map(k => `<div class="s3">${kwCard(k)}</div>`).join('')}
      ${card2('s5', 'Suara warga', '', V.gauge(st.sw, 'sentimen umpan balik warga', `${I.filter(i => i.fb).length} umpan balik`))}
      ${card2('s7', 'Persoalan dominan', 'aspirasi aktif per kategori', `<div class="grid" style="gap:8px">${cat.map(c => `<div class="barrow" style="grid-template-columns:170px 1fr 44px"><span>${c[0]}</span><div class="track" style="height:12px"><i data-w="${Math.round(c[1] / cm * 100)}" style="background:${CLHEX[CAT_CL[c[0]]]}"></i></div><b class="num">${c[1]}</b></div>`).join('')}</div>`)}
      ${card2('s12', 'Butuh perhatian pimpinan', '', `<div class="grid" style="gap:8px"><div class="insight"><span class="ico"><svg class="ic"><use href="#i-alert"/></svg></span><span>${KORWIL[attn[0].k].name} (${KORWIL[attn[0].k].area}) memiliki tingkat tindak lanjut terendah, ${attn[0].st.fu}%, dengan ${attn[0].st.al.length} peringatan terbuka.</span></div><div class="insight"><span class="ico"><svg class="ic"><use href="#i-building"/></svg></span><span>${I.filter(i => active(i) && i.si >= 4 && i.days >= 14).length} aspirasi sudah diteruskan ke instansi lebih dari 14 hari tanpa penyelesaian. Perlu dorongan koordinasi lintas K/L.</span></div><div class="insight"><span class="ico"><svg class="ic"><use href="#i-users"/></svg></span><span>${119 - st.complete} tim belum lengkap kompetensinya; ${REQ.filter(q => q.kind === 'swap' && q.state === 'open').length} usulan penguatan menunggu keputusan.</span></div></div>`)}</div>`;
}
var MT = {f: 'open'};
function homeMitra() {
  const cats = USER.cats, sec = I.filter(i => cats.includes(i.cat));
  const inbox = sec.filter(i => i.si >= 4 && i.si <= 5 && i.auth >= 1).sort((a, b) => b.days - a.days || b.pr - a.pr);
  const done = sec.filter(i => i.si >= 6).length, avgAge = inbox.length ? Math.round(inbox.reduce((a, i) => a + i.days, 0) / inbox.length) : 0;
  const onSla = pct(inbox.filter(i => i.days <= 14).length, inbox.length);
  const byProv = PROV.map(p => ({p, n: inbox.filter(i => i.region.prov === p).length})), pm = Math.max(1, ...byProv.map(x => x.n));
  return hero(USER.title, `Aspirasi warga sektor ${cats.join(', ')} yang dirujuk Satgas Soedirman`, '')
    + kpiRow([[inbox.length, 'rujukan menunggu tindak lanjut', '', null, '#A3202C'], [inbox.filter(i => i.mitraAck).length, 'sudah diteruskan ke dinas'], [done, 'terselesaikan'], [avgAge + ' hari', 'rata-rata umur rujukan'], [onSla + '%', 'dalam SLA 14 hari']])
    + `<div class="an-grid">${card2('s8', 'Kotak masuk rujukan', 'urut umur rujukan', `<div class="grid" style="gap:6px">${inbox.slice(0, 9).map(i => qItem('building', `${i.id} · ${esc(i.title)}`, `${esc(i.region.name)} · Desa ${esc(i.desa)} · ${fmt(i.aff)} warga · ${i.days} hari${i.mitraAck ? ' · <b>diteruskan ke ' + esc(INST[i.cat]) + '</b>' : ''}${i.needData ? ' · menunggu data' : ''}`,
        `<button class="btn sm" data-mi="${i.id}|open">Detail</button>${i.mitraAck ? '' : `<button class="btn sm" data-mi="${i.id}|ack">Teruskan ke dinas</button>`}<button class="btn sm" data-mi="${i.id}|data">Minta data</button><button class="btn sm primary" data-mi="${i.id}|done">Selesai</button>`)).join('') || '<div class="empty">Tidak ada rujukan menunggu.</div>'}</div>`)}
      ${card2('s4', 'Kinerja respons', '', `<div class="rings">${V.ring(onSla / 100, onSla + '%', 'Dalam SLA', '#2E7A52')}${V.ring(pct(done, done + inbox.length) / 100, pct(done, done + inbox.length) + '%', 'Terselesaikan', '#13274A')}</div><div class="grid" style="gap:6px">${byProv.map(x => `<div class="barrow" style="grid-template-columns:110px 1fr 30px"><span>${x.p}</span><div class="track"><i data-w="${Math.round(x.n / pm * 100)}"></i></div><span class="num">${x.n}</span></div>`).join('')}</div>`)}</div>`;
}
var PK = {sel: new Set(), sent: 0};
function homePokja() {
  const p = USER.pokja, cats = p[2], iss = I.filter(i => cats.includes(i.cat)), act = iss.filter(active), fb = iss.filter(i => i.fb);
  const sw = fb.length ? fb.reduce((a, i) => a + i.fb.s, 0) / fb.length : 0;
  const cc = cats.map(c => ({l: c, v: act.filter(i => i.cat === c).length, c: CLHEX[CAT_CL[c]]})).filter(x => x.v).sort((a, b) => b.v - a.v);
  const byProv = PROV.map(pv => ({pv, n: act.filter(i => i.region.prov === pv).length})), pm = Math.max(1, ...byProv.map(x => x.n));
  let special = '';
  if (p[3] === 'policy') {
    const top = CATS.map(c => ({c, n: I.filter(i => active(i) && i.cat === c).length, old: I.filter(i => active(i) && i.cat === c && i.days >= 14).length})).sort((a, b) => b.n - a.n).slice(0, 6);
    special = card2('s12', 'Penyusun catatan kebijakan', 'pilih isu, sistem menyusun draf rekomendasi, kirim ke Komando', `<div class="row">${top.map(t => `<label class="tog" style="border:1px solid var(--line);border-radius:999px;padding:4px 10px"><input type="checkbox" data-pk="${esc(t.c)}"${PK.sel.has(t.c) ? ' checked' : ''}> ${esc(t.c)} · ${t.n}</label>`).join('')}</div><div class="paper" style="box-shadow:none"><div class="paper-body" id="pkDraft">${policyDraft(top)}</div></div><div class="row"><button class="btn primary" id="pkSend"><svg class="ic"><use href="#i-send"/></svg>Kirim ke Komando</button><span class="small muted">${PK.sent} catatan terkirim</span></div>`);
  } else if (p[3] === 'early' || p[3] === 'sentiment') {
    const reg = R.map(r => { const f = I.filter(i => i.region === r && i.fb); return {r, s: f.length ? f.reduce((a, i) => a + i.fb.s, 0) / f.length : 0, n: f.length}; }).filter(x => x.n >= 2).sort((a, b) => a.s - b.s).slice(0, 8);
    special = card2('s12', p[3] === 'early' ? 'Wilayah dengan sentimen terendah' : 'Narasi warga: sentimen terendah per wilayah', 'agregat umpan balik warga', `<div class="grid" style="gap:6px">${reg.map(x => `<div class="barrow" style="grid-template-columns:170px 1fr 50px"><span>${esc(x.r.name)}</span><div class="track" style="height:12px"><i data-w="${Math.round(Math.min(1, Math.abs(x.s)) * 100)}" style="background:${sentCol(x.s)}"></i></div><b class="num" style="color:${sentCol(x.s)}">${x.s.toFixed(2)}</b></div>`).join('')}</div>`);
  } else if (p[3] === 'data') {
    const fields = [['Profil kompetensi', 100], ['Bahasa daerah', 100], ['Riwayat KKN', pct(S.filter(s => s.kkn).length, S.length)], ['Aspirasi berlokasi & berbukti', pct(I.filter(i => i.docOk).length, I.length)], ['Umpan balik warga', pct(I.filter(i => i.fb).length, I.filter(i => i.si >= 3).length)], ['Aspirasi tervalidasi', pct(I.filter(i => i.si >= 2).length, I.length)]];
    special = card2('s12', 'Kelengkapan data survei & pemetaan', 'proporsi catatan yang terisi', `<div class="grid" style="gap:8px">${fields.map(f => `<div class="barrow" style="grid-template-columns:220px 1fr 44px"><span>${f[0]}</span><div class="track" style="height:12px"><i data-w="${f[1]}" style="background:${f[1] >= 80 ? '#2E7A52' : f[1] >= 50 ? '#C59A4A' : '#A3202C'}"></i></div><b class="num">${f[1]}%</b></div>`).join('')}</div>`);
  } else if (p[3] === 'authority') {
    const au = AUTH.map((a, i) => ({l: a, v: act.filter(x => x.auth === i).length, c: ['#2E7A52', '#C59A4A', '#7E1622'][i]}));
    special = card2('s12', 'Siapa yang berwenang', 'aspirasi tematik menurut kewenangan penanganan', `<div class="row" style="flex-wrap:nowrap;gap:14px;align-items:center">${V.donut(au, 170, `<tspan x="85" dy="6" class="t-strong" style="font-size:22px;font-family:Playfair Display,serif">${act.length}</tspan>`)}<div class="legend-row" style="display:grid;gap:4px">${au.map(a => `<span><i style="background:${a.c}"></i>${a.l} · <b>${a.v}</b></span>`).join('')}</div></div>`);
  } else {
    const days = 14, series = Array.from({length: days}, (_, i) => i < days - 1 ? Math.round(act.length / 119 * (8 + hsh(i * 3.1 + cats.length) * 6)) : act.filter(i => i.createdAbs >= sim.day * 1440).length + Math.round(act.length / 119 * 9));
    special = card2('s12', 'Tren aspirasi tematik', '14 hari terakhir', `<div style="height:70px">${V.spark(series, 900, 70, '#13274A').replace('class="spark"', 'class="spark" style="position:static;width:100%;height:70px" preserveAspectRatio="none"')}</div>`);
  }
  return hero(p[1], `Analitik tematik · ${cats === CATS ? 'semua kategori' : cats.join(', ')}`, '<a class="btn sm" href="#analitik">Analitik lengkap</a>')
    + `<div class="lockline" style="color:var(--navy);background:var(--gold-soft)"><svg class="ic"><use href="#i-lock"/></svg>Data individu dianonimkan untuk Pokja dan Dewan Pakar.</div>`
    + kpiRow([[act.length, 'aspirasi tematik aktif'], [pct(iss.filter(i => i.si >= 3).length, iss.length) + '%', 'ditindaklanjuti'], [(sw >= 0 ? '+' : '') + sw.toFixed(2), 'sentimen warga'], [fmt(act.reduce((a, i) => a + i.aff, 0)), 'warga terdampak']])
    + `<div class="an-grid">${card2('s5', 'Komposisi kategori', '', `<div class="row" style="flex-wrap:nowrap;gap:12px;align-items:center">${V.donut(cc, 160, `<tspan x="80" dy="6" class="t-strong" style="font-size:22px;font-family:Playfair Display,serif">${act.length}</tspan>`)}<div class="legend-row" style="display:grid;gap:3px">${cc.slice(0, 6).map(c => `<span><i style="background:${c.c}"></i>${c.l} · <b>${c.v}</b></span>`).join('')}</div></div>`)}
      ${card2('s7', 'Sebaran per provinsi', '', `<div class="grid" style="gap:8px">${byProv.map(x => `<div class="barrow" style="grid-template-columns:120px 1fr 40px"><span>${x.pv}</span><div class="track" style="height:12px"><i data-w="${Math.round(x.n / pm * 100)}" style="background:${PROVHEX[x.pv]}"></i></div><b class="num">${x.n}</b></div>`).join('')}</div>`)}
      ${special}</div>`;
}
function policyDraft(top) {
  const sel = top.filter(t => PK.sel.has(t.c)); if (!sel.length) return '<p class="small muted">Pilih minimal satu isu untuk menyusun draf.</p>';
  return `<span class="lbl">Draf catatan kebijakan · Hari ke-${sim.day}</span><h3 style="font-family:var(--f-display);font-size:1.2rem">Prioritas tindak lanjut: ${sel.map(t => t.c).join(', ')}</h3>
    <ol style="margin:0;padding-left:20px;display:grid;gap:6px;font-size:.88rem">${sel.map(t => `<li><b>${esc(t.c)}</b>: ${t.n} aspirasi aktif, ${t.old} di antaranya lebih dari 14 hari. Rekomendasi: percepat koordinasi dengan ${esc(INST[t.c])} dan tetapkan tenggat respons 7 hari.</li>`).join('')}</ol>`;
}

/* ---------- role home interactions ---------- */
$('#roleHome').addEventListener('click', e => {
  const t = e.target;
  const a = t.closest('[data-act]'); if (a) { alertAct(sim.alerts.find(x => x.id === a.dataset.id), a.dataset.act); renderRoleHome(true); return; }
  const d = t.closest('[data-decide]'); if (d) { const al = sim.alerts.find(x => x.id === d.dataset.decide); if (al) { resolveAlert(al, USER.title); audit(`Memutuskan eskalasi ${al.id}`); toast('Eskalasi diputuskan'); } renderRoleHome(true); return; }
  const q = t.closest('[data-req]'); if (q) { const [id, act] = q.dataset.req.split('|'); reqAct(id, act); return; }
  const kw = t.closest('[data-kw]'); if (kw && tabAllowed('operasi')) { const k = kw.dataset.kw; location.hash = 'operasi'; setTimeout(() => selectRegion(anchorRegion(KORWIL[k].hq), true), 200); return; }
  const rid = t.closest('[data-rid]'); if (rid) { if (tabAllowed('operasi')) { location.hash = 'operasi'; setTimeout(() => selectRegion(R[+rid.dataset.rid], true), 200); } return; }
  const lb = t.closest('[data-lab]'); if (lb) { lab.tool = lb.dataset.lab; location.hash = 'lab'; return; }
  const tk = t.closest('[data-tk]'); if (tk) { const k = HELP.tickets.find(x => x.id === tk.dataset.tk); if (k) { k.st++; audit(`Tiket ${k.id} → ${['Diterima', 'Ditinjau', 'Dikerjakan', 'Selesai'][k.st]}`); toast(`${k.id} diperbarui`); } renderRoleHome(true); return; }
  const mi = t.closest('[data-mi]'); if (mi) { const [id, act] = mi.dataset.mi.split('|'); const it = I.find(i => i.id === id); if (!it) return;
    if (act === 'open') { openIssue(it); return; }
    if (act === 'ack') { it.mitraAck = true; it.si = 5; emit('rujukan', {s: it.owner, r: it.region, text: `${USER.title} meneruskan ${it.id} ke ${INST[it.cat]}`}); audit(`Meneruskan ${it.id} ke dinas`); toast('Diteruskan ke dinas terkait'); }
    if (act === 'data') { it.needData = true; it.si = 5; emit('respons', {s: it.owner, r: it.region, text: `${USER.title} meminta data tambahan untuk ${it.id}`}); if (it.owner === me) addTask({type: 'resp', it, ok: false}); audit(`Meminta data tambahan ${it.id}`); toast('Permintaan data dikirim ke Serdik pencatat'); }
    if (act === 'done') { it.si = 6; it.needData = false; window.__fb(it); emit('respons', {s: it.owner, r: it.region, important: true, text: `${USER.title} menyelesaikan tindak lanjut ${it.id} · ${it.region.name}`}); audit(`Menyelesaikan ${it.id}`); toast(`${it.id} selesai, Serdik akan mengabarkan warga`); }
    renderRoleHome(true); return; }
  const tg = t.closest('[data-toggle]'); if (tg) { const id = tg.dataset.toggle; ADM.inactive.has(id) ? ADM.inactive.delete(id) : ADM.inactive.add(id); audit(`${ADM.inactive.has(id) ? 'Menonaktifkan' : 'Mengaktifkan'} akun ${id}`); renderRoleHome(true); return; }
  const pn = t.closest('[data-pin]'); if (pn) { audit(`Reset PIN akun ${pn.dataset.pin}`); toast(`PIN ${pn.dataset.pin} direset, tautan dikirim lewat helpdesk`); renderRoleHome(true); return; }
  if (t.closest('#exeCopy')) { const st = stats(R); const txt = `Ringkasan eksekutif Satgas Soedirman, Hari ke-${sim.day}: ${st.field} Serdik aktif, ${I.length} aspirasi tercatat, tindak lanjut ${st.fu}%, ${I.filter(i => i.si >= 6).length} terselesaikan, sentimen warga ${st.sw.toFixed(2)}, ${st.complete}/119 tim lengkap.`;
    try { navigator.clipboard.writeText(txt).then(() => toast('Ringkasan disalin'), () => toast(txt)); } catch (err) { toast(txt); } return; }
  if (t.closest('#pkSend')) { if (!PK.sel.size) { toast('Pilih minimal satu isu'); return; } const r = addReq({kind: 'kebijakan', from: USER.title, title: 'Prioritas tindak lanjut ' + [...PK.sel].join(', '), detail: `Dari ${USER.title}`}); PK.sent++; audit(`Mengirim catatan kebijakan ${r.id}`); toast('Catatan kebijakan terkirim ke Komando'); renderRoleHome(true); return; }
});
$('#roleHome').addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.acc) { const old = accounts().find(a => a.id === t.dataset.acc).role; ADM.roles[t.dataset.acc] = t.value; audit(`Mengubah peran ${t.dataset.acc}: ${old} → ${t.value}`); toast('Peran diperbarui'); renderRoleHome(true); }
  if (t.id === 'admRole') { ADM.role = t.value; renderRoleHome(true); }
  if (t.dataset.pk) { t.checked ? PK.sel.add(t.dataset.pk) : PK.sel.delete(t.dataset.pk); renderRoleHome(true); }
});
$('#roleHome').addEventListener('input', e => { if (e.target.id === 'admQ') { ADM.q = e.target.value; clearTimeout(ADM.t); ADM.t = setTimeout(() => { renderRoleHome(true); const q = $('#admQ'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 250); } });
$('#roleHome').addEventListener('submit', e => {
  e.preventDefault(); const t = e.target;
  if (t.id === 'annForm') { const v = $('#annTxt').value.trim(); if (!v) { toast('Tulis isi pengumuman terlebih dahulu'); return; } const ch = $('#annCh') ? $('#annCh').value : 'posko';
    hubMsg(ch, me, v, {kind: 'ann'}); audit(`Menerbitkan pengumuman di #${ch}`); toast(`Terbit di #${ch}`); renderRoleHome(true); }
  if (t.id === 'faqForm') { const q = $('#faqQn').value.trim(), a = $('#faqAn').value.trim(); if (!q || !a) { toast('Isi pertanyaan dan jawaban'); return; } FAQ.push([q, a]); audit('Menambah entri FAQ'); toast('FAQ ditambahkan'); renderRoleHome(true); }
});

/* ---------- wrap shared functions for role awareness ---------- */
function seedPolicy() {
  const top = CATS.map(c => ({c, n: I.filter(i => active(i) && i.cat === c).length})).sort((a, b) => b.n - a.n);
  addReq({kind: 'kebijakan', from: 'Pokja 8', title: 'Prioritas tindak lanjut ' + top[0].c + ', ' + top[1].c, detail: 'Dari Pokja Rumusan Kebijakan & Tindak Lanjut'});
}
(() => {
  const _ck = clock;
  clock = function () { _ck(); const t = hhmm(sim.min); $$('[data-live="clock"]').forEach(e => { e.textContent = t; }); };
  const _aa = alertAct;
  alertAct = function (a, act) { if (a && USER && act !== 'accept' && act !== 'decline' && !canAlert(a)) { toast('Di luar kewenangan peran Anda'); return; } _aa(a, act); if (a && USER) audit(`Peringatan ${a.id}: ${act.startsWith('help:') ? 'menugaskan rekan' : act}`); };
  const _ub = updateBadges;
  updateBadges = function () { _ub(); if (USER && !isField()) { const n = roleQueueCount(); const b = $('#bdgSaya'); b.hidden = !n; b.textContent = n > 99 ? '99+' : n; } };
  const _rw = renderWeights;
  renderWeights = function () { _rw(); if (USER && !can('placement')) $$('#weights input').forEach(i => { i.disabled = true; }); };
})();
function roleQueueCount() {
  if (!USER) return 0;
  const r = USER.role;
  if (r === 'korwil') return sim.alerts.filter(a => a.state === 'open' && inScope(a.s.region)).length + REQ.filter(q => q.kind === 'swap' && q.state === 'open' && q.kw === USER.kw).length;
  if (r === 'komando') return REQ.filter(q => (q.kind === 'swap' || q.kind === 'kebijakan') && q.state === 'open').length + sim.alerts.filter(a => a.state === 'handling' && a.handler === 'Posko Satgas').length;
  if (r === 'staf') return {asops: sim.alerts.filter(a => a.state === 'open').length, asminlog: REQ.filter(q => q.kind === 'logistik' && q.state === 'open').length, hukum: REQ.filter(q => q.kind === 'etik' && q.state === 'open').length}[USER.fn] || 0;
  if (r === 'konten') return HELP.tickets.filter(t => t.st < 3).length;
  if (r === 'mitra') return I.filter(i => USER.cats.includes(i.cat) && i.si >= 4 && i.si <= 5 && i.auth >= 1 && !i.mitraAck).length;
  return 0;
}
