import os, sys, json, shutil, time, math, random
from playwright.sync_api import sync_playwright

D = os.path.dirname(os.path.abspath(__file__))
FR = os.path.join(D, 'cframes')
FPS = 30
DT = 1000 / FPS
shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR)
st = {'i': 0}
cues = []      # (time_sec, kind)
errors = []

def ease(t): return 4*t*t*t if t < .5 else 1 - (-2*t+2)**3/2
def lerp(a, b, t): return a + (b - a) * t

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome',
        args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files', '--hide-scrollbars'])
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.add_init_script(path=os.path.join(D, 'vt.js'))
    pg.goto('file://' + os.path.join(D, 'local.html'))
    pg.add_script_tag(path=os.path.join(D, 'cine_overlay.js'))
    js = pg.evaluate
    t0 = time.time()

    def shot():
        pg.screenshot(path=os.path.join(FR, f"{st['i']:05d}.jpg"), type='jpeg', quality=92)
        st['i'] += 1
        if st['i'] % 150 == 0: print('frames', st['i'], round(time.time() - t0), 's', flush=True)

    def step(n=1, per=None):
        for k in range(n):
            if per: per(k, n)
            js(f'window.__step({DT});__dust()')
            shot()

    def now(): return st['i'] / FPS
    def cue(kind): cues.append((round(now(), 3), kind))

    def flash():
        cue('hit')
        for v in [1, .8, .55, .3, .12, 0]:
            js(f'__flash({v})'); step()

    def center(sel):
        js(f"(()=>{{const e=document.querySelector({json.dumps(sel)});if(e)e.scrollIntoView({{block:'center'}});}})()")
        bb = pg.locator(sel).first.bounding_box()
        return bb['x'] + bb['width']/2, bb['y'] + bb['height']/2

    def ui_shot(sec, sel, s0=1.0, s1=1.25, k=.45, per=None, pre=None):
        js('__cam(1)')
        if pre: pre()
        try: cx, cy = center(sel)
        except Exception as e:
            errors.append('sel ' + sel); cx, cy = 960, 540
        n = int(sec * FPS)
        def f(i, n):
            e = ease(i / max(1, n - 1))
            s = lerp(s0, s1, e)
            js(f'__cam({s},{cx},{cy},{(960-cx)*k*e},{(560-cy)*k*e})')
            if per: per(i, n)
        step(n, f)

    def orbit_shot(sec, p0, p1, t0_, t1_, per=None):
        n = int(sec * FPS)
        def f(i, n):
            e = ease(i / max(1, n - 1))
            pp = [lerp(a, b2, e) for a, b2 in zip(p0, p1)]; tt = [lerp(a, b2, e) for a, b2 in zip(t0_, t1_)]
            js(f'__orbit({pp[0]},{pp[1]},{pp[2]},{tt[0]},{tt[1]},{tt[2]})')
            if per: per(i, n)
        step(n, f)

    def go(h):
        js(f"endTour();location.hash='{h}'"); step(2)

    def word(h, s=''): js('([a,b])=>__word(a,b)', [h, s]); cue('word')
    def kick(n, t): js('([a,b])=>__kick(a,b)', [n, t])

    # ---------------- INTRO ----------------
    js("__stage('');__bars(true);__fade(1)")
    for k in range(30): js(f'__fade({1-k/30})'); step()
    cue('start')
    def counter(num, lab, sec=2.6):
        js(f"__stage(`<div class='num rise' id='cnum'>0</div><div class='lab rise' style='animation-delay:.25s'>{lab}</div>`)")
        cue('beat')
        n = int(sec * FPS)
        def f(i, n):
            v = round(num * ease(min(1, i / (n * .55))))
            js(f"document.getElementById('cnum').textContent='{v}'")
        step(n, f)
    counter(384, 'Serdik di lapangan')
    counter(119, 'Kabupaten / kota')
    counter(1, 'Platform terpadu', 2.4)
    js("__stage(`<div class='rib a'></div><div class='rib b'></div><div class='c'><div class='eye rise'>P3MDI · SATGAS</div><div class='t slam'>Satgas<br>Soedirman</div><div class='motto rise' style='animation-delay:.5s'>Berani · Cepat · Terhormat</div></div>`)")
    flash(); step(int(3.3 * FPS))
    for k in range(15): js(f'__fade({k/15})'); step()
    js("__stage(null)")

    # login reveal
    kick('00', 'Masuk sebagai Serdik')
    for k in range(10): js(f'__fade({1-k/10})'); step()
    ui_shot(1.6, '.login-card', 1.0, 1.12, .2)
    js("document.querySelector('#loginForm button[type=submit]').click()"); step(20); js('endTour()')
    js("endTour();sim.speed=40;document.querySelector('#tFollow').checked=false;doMyAction('checkin');const v=me.region.villages[4];startTravel(me,v.x,v.z,'visit',{v})"); step(2)

    # ---------------- 3D MAP ----------------
    go('operasi'); js("document.body.classList.add('cine-map');resize();__night(true)"); step(3)
    kick('01', 'Operasi live · 3D')
    flash()
    word('SETIAP LANGKAH', '384 Serdik terpetakan langsung')
    orbit_shot(5.2, (-66, 30, 40), (-6, 17, 30), (-38, 0, 0), (2, 0, 0))
    flash()
    orbit_shot(4.4, (-44, 10, 12), (-20, 7, 7), (-32, 0, -7), (-25, 0, -2))
    js("document.body.classList.remove('cine-map');resize();__night(false)")

    # ---------------- BERANDA ----------------
    js("sim.speed=15;if(me.st==='off'){doMyAction('checkin');}if(me.st==='duty'){const v=me.region.villages[6];startTravel(me,v.x,v.z,'visit',{v});}"); go('saya')
    kick('02', 'Beranda Serdik'); flash()
    word('HADIR', 'Setiap Serdik, setiap hari')
    ui_shot(2.6, '#meCard', 1.0, 1.35, .5)
    ui_shot(2.4, '#minimap', 1.12, 1.45, .55)
    ui_shot(2.0, '#actionsCard', 1.05, 1.3, .5)

    # ---------------- HUB ----------------
    js("sim.speed=40;hub.ch='angkatan';hub.showSent=true"); go('hub'); js('renderHub(true)')
    kick('03', 'Hub Serdik'); flash()
    word('TERHUBUNG', 'Komunikasi antar-Serdik se-Jawa')
    ui_shot(3.0, '#hubStream', 1.0, 1.22, .35)
    js("hub.ch='prov';renderHub(true);document.querySelector('#hubPoll').click()"); step(2)
    ui_shot(2.4, '.pollcard', 1.15, 1.5, .6, pre=lambda: js("document.querySelector('#hubStream').scrollTop=1e6"))

    # ---------------- ASPIRASI ----------------
    js("sim.speed=15;state.isScope='all';state.isRegion=null"); go('isu'); js('renderIssues(true)')
    kick('04', 'Tindak lanjut aspirasi'); flash()
    word('MENDENGAR', 'Tak ada aspirasi yang hilang')
    def drag(i, n):
        if i == int(n * .45):
            try: pg.drag_and_drop('.col[data-si="0"] .icard >> nth=0', '.col[data-si="2"]')
            except Exception as e: errors.append('drag')
    ui_shot(3.0, '#board', 1.0, 1.18, .3, per=drag)
    js("AN.view='aspirasi'"); go('analitik'); js('renderAnalytics(true)')
    ui_shot(2.6, '#anBody .s12', 1.05, 1.3, .55)

    # ---------------- ANALYTICS ----------------
    kick('05', 'Data analytics & sentimen'); flash()
    js("AN.view='wilayah';AN.metric='isu';AN.color='sent';renderAnalytics(true)")
    word('MEMAHAMI', 'Data lapangan menjadi wawasan')
    ui_shot(2.8, '#dorling', 1.0, 1.28, .45)
    flash(); js("AN.view='aspirasi';renderAnalytics(true)")
    ui_shot(1.9, '#anBody .s7', 1.05, 1.32, .5)
    flash(); js("AN.view='sentimen';renderAnalytics(true)")
    ui_shot(2.3, '#anBody .s3', 1.1, 1.55, .6)
    flash(); js("AN.view='ringkas';renderAnalytics(true)")
    ui_shot(1.9, '#anBody .s5', 1.05, 1.35, .5)
    flash(); js("AN.view='spc';renderAnalytics(true)")
    ui_shot(1.9, '#anBody .s8', 1.05, 1.3, .5)

    # ---------------- LAB ----------------
    go('lab'); js("lab.tool='topsis';renderLab()")
    kick('06', 'Lab SPK · gaya MBA Lab'); flash()
    word('MEMUTUSKAN', 'Keputusan berbasis data')
    def tops(i, n):
        v = round(lerp(5, 60, ease(i / max(1, n - 1))))
        js(f"(()=>{{const e=document.querySelector('#tw_3');e.value={v};e.dispatchEvent(new Event('input',{{bubbles:true}}));}})()")
    ui_shot(3.0, '#tpRank', 1.05, 1.3, .45, per=tops)
    flash(); js("lab.tool='monte';renderLab()")
    ui_shot(2.4, '#mcChart', 1.1, 1.4, .55)
    flash(); js("lab.tool='ahp';renderLab()")
    def ahp(i, n):
        v = round(lerp(-2, 6, ease(i / max(1, n - 1))))
        js(f"(()=>{{const e=document.querySelector('[data-pair=\"0_5\"]');e.value={v};e.dispatchEvent(new Event('input',{{bubbles:true}}));}})()")
    ui_shot(2.2, '#ahpRes', 1.05, 1.35, .5, per=ahp)

    # ---------------- PLACEMENT 3D ----------------
    js('sim.speed=40'); go('penempatan'); js("document.body.classList.add('cine-map');resize();__night(true)"); step(2)
    kick('07', 'Penempatan dua lapis'); flash()
    word('MENEMPATKAN', 'Tim yang saling melengkapi')
    def runpl(i, n):
        if i == int(n * .22): js('runPlacementAnimated()'); cue('hit')
    orbit_shot(6.0, (24, 42, 52), (-14, 30, 40), (2, 0, 2), (-4, 0, 0), per=runpl)
    js("document.body.classList.remove('cine-map');resize();__night(false)")

    # ---------------- NETWORK ----------------
    go('jaringan'); step(2)
    kick('08', 'Jaringan interaksi'); flash()
    word('BERKOLABORASI', 'Siapa membantu siapa')
    def ego(i, n):
        if i == int(n * .5): js("document.querySelector('#netEgo').checked=true")
    ui_shot(4.2, '#netCanvas', 1.0, 1.3, .35, per=ego)

    # ---------------- ARENA ----------------
    js('sim.speed=15'); go('arena'); js("AR.game='sort';AR.state=null;renderArena();document.querySelector('#sgGo').click()"); step(2)
    kick('09', 'Arena latihan'); flash()
    word('BERLATIH', 'Mini games kesiapan lapangan')
    def sortp(i, n):
        if i % 12 == 6: js("(()=>{const s=AR.state;if(!s)return;const c=s.deck[s.i%s.deck.length];sortPick(c[1],document.querySelector('[data-bin=\"'+c[1]+'\"]'))})()")
    ui_shot(2.8, '.stage-game', 1.0, 1.15, .3, per=sortp)
    js("clearInterval(AR.timer);AR.game='rute';AR.state={order:[0,2,5,1,3,8,4,7,6],done:true,opt:null};renderArena()")
    flash()
    ui_shot(2.6, '#routeSvg', 1.05, 1.3, .5)

    # ---------------- REPORT ----------------
    go('laporan'); js("RP.view='auto';RP.scope='satgas';renderReport(true)")
    kick('10', 'Laporan otomatis'); flash()
    ui_shot(2.6, '.paper', 1.0, 1.12, .25)

    # ---------------- FINALE ----------------
    kick('', '')
    js('sim.speed=40'); go('operasi'); js("document.body.classList.add('cine-map');resize();__night(true)"); step(2)
    flash()
    def fin(i, n):
        if i == int(n * .06): word('HADIR', '')
        if i == int(n * .30): word('MENDENGAR', '')
        if i == int(n * .54): word('MENGHUBUNGKAN', '')
    orbit_shot(9.0, (30, 7, 14), (2, 105, 80), (28, 0, 2), (0, 0, 0), per=fin)
    cue('hit')
    js("__stage(`<div class='rib a'></div><div class='rib b'></div><div class='c'><div class='eye rise'>SATU PLATFORM TERINTEGRASI</div><div class='t slam'>Satgas<br>Soedirman</div><div class='motto rise' style='animation-delay:.6s'>Berani · Cepat · Terhormat</div><div class='lab rise' style='animation-delay:1s;font-size:18px;letter-spacing:.4em;color:#B9C3D6'>Prototipe · P3MDI</div></div>`)")
    flash(); step(int(4.6 * FPS))
    for k in range(30): js(f'__fade({k/30})'); step()
    cue('end')
    b.close()

json.dump({'cues': cues, 'frames': st['i'], 'fps': FPS}, open(os.path.join(D, 'cues.json'), 'w'))
print('done', st['i'], 'frames', round(st['i'] / FPS, 1), 's errors', errors[:8])
