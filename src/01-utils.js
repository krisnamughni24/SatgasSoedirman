"use strict";
/* ============ utilities ============ */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let seed=20261112;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const pick=a=>a[Math.floor(rnd()*a.length)];
const rint=(a,b)=>a+Math.floor(rnd()*(b-a+1));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const hsh=n=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Math.round(n).toLocaleString('id-ID');
const pct=(a,b)=>b?Math.round(a/b*100):0;
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;t.style.animation='none';void t.offsetWidth;t.style.animation='';clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,2600);}
