<p align="center"><img src="assets/logo-p3mdi.png" alt="P3MDI Soedirman" width="150"></p>

# Satgas Soedirman

**Integrated Field Operations, Community Intelligence & Decision Support Platform**: an interactive prototype for coordinating 384 Serdik deployed across 119 regencies/cities in Java.

> Prototype with dummy data. All names, numbers and aspirations are randomly generated.
>
> *Berani · Cepat · Terhormat.*

![Trailer](media/Satgas-Soedirman-Cinematic.mp4)

## What it is

The user logs in under one of ten roles taken from the Satgas Soedirman org chart. A Serdik runs their daily field work while seeing how every other Serdik moves, helps each other and follows up on community aspirations; command, staff, owners, leadership and partners each get their own console over the same live data. A built-in simulation drives the whole cohort in real time (1× to 40× speed).

The original proposal (in Indonesian) is in [`docs/GAGASAN.md`](docs/GAGASAN.md).

## Roles

Role and data scope are separate: the role decides modules and actions, the scope decides which regions are visible. Every decision made from a console is written to an audit log.

| Role | Who (org chart) | Scope | Home console |
|---|---|---|---|
| **Serdik** | 384 Serdik | Own regency/city | Personal field home: check-in, visits, aspirations, help, team chat |
| **Koordinator Kab/Kota** | One per team | Own team | Field home plus team alert handling and issue validation |
| **Korwil** | Korwil I Jatim · II Jateng–DIY · III Jabar · IV Jakarta–Banten | Provinces of the Korwil | Regency tiles, scoped alert queue, team-reinforcement approvals, cross-Korwil comparison |
| **Komando** | Komandan, Wakil Komandan | All of Java | Four Korwil cards, escalations, instructions to all Serdik, decision queue (team swaps, policy notes) |
| **Staf Komando** | Asops, Asrena, Asminlog, Asintel, Hukum & Etik, Katim Anev | All of Java, per function | Function workspace: operations queue, planning tools, logistics budget, early-warning signals, ethics cases + audit, results chain |
| **Admin Data & IT** | Katim Data & IT | System | Accounts and role changes, data quality, integrations, audit log |
| **Konten & Layanan** | Katim Konten & Layanan | Content & service | Announcements, FAQ manager, helpdesk queue, Hub activity |
| **Pimpinan** | Ketua/Anggota Pengarah, Ketua Pelaksana | National aggregate, anonymised | Executive summary, results chain, attention points |
| **Mitra K/L** | Anggota Pelaksana Eselon I (ministries) | Referred aspirations of its sector | Referral inbox: forward to agency, request data, close |
| **Pokja & Ahli** | Pokja 1–8, Kelompok Ahli | Thematic, anonymised | Thematic analytics; Pokja 8 drafts policy notes sent to Komando |

The President is the patron of the programme, not a system user. Officials are shown by title only.

## Modules

| Tab | What it does |
|---|---|
| **Beranda** | Personal status, progress rings, field actions (check-in, visit, record aspiration, ask for help, team meeting, report an issue), live team mini map, day timeline, tasks, team chat, performance radar vs cohort, workload |
| **Operasi** | Live 3D map of Java (Three.js): 119 regencies as columns (metrics include resistance index), 384 Serdik as moving dots, event pulses, collaboration arcs, alert queue with SLA, live log, regional panel |
| **Hub Serdik** | Channels (team, province, cohort, cross-region help, good practice, command post), direct messages, polls, reactions, "I can help" cards, sentiment highlighting, morale gauge |
| **Analitik** | Penetration map (Serdik per regency over a resistance heatmap: 3 categories, with gradient shade by resistance index %, plus share per category and competency tier mix), Dorling cartogram, need-vs-coverage bubbles, correlation matrix, treemap, status flow (alluvial), aging histogram, sentiment gauges/trend/heatmap/trigger words, live sentiment tester, c-chart and p-chart (SPC) |
| **Aspirasi** | Drag-and-drop board across 8 statuses, follow-up funnel, Pareto chart |
| **Jaringan** | Interaction network (d3-force on canvas): geographic or force layout, ego network, top connectors |
| **Laporan** | Auto-generated report per scope with insights and recommendations; personal daily report with mood and support needs |
| **Penempatan** | Two-layer placement: policy constraints first, then competency matching with weights; what-if scenarios; animated reassignment on the 3D map; complementarity matrix |
| **Lab SPK** | MBA Lab-style calculators on live data: AHP, SMART (guided), TOPSIS, Decision Tree, Queue Line (M/M/c), Forecast (SMA/SES), Word Network, Monte Carlo risk, Budget |
| **Arena** | Mini games: citizen dialogue role-play, authority sorting (45 s), visit route optimisation vs exact TSP optimum; leaderboard and badges |
| **Bantuan** | Escalation ladder, communication assistant (do/don't), Tech Helpdesk tickets, FAQ, emergency button |
| **Direktori** | Volume vs quality scatter and searchable Serdik table with full profiles and placement reasons |

Design principles kept throughout: two-layer placement (policy before scoring), complementary 3–4 person teams, quality of interaction over volume, recording ≠ resolving (out-of-authority issues are referred and monitored), and confidence is used for training and buddy pairing, never as an eligibility score.

## Run

It is a single static page. Open `index.html` in a browser. Libraries load from CDNs (Three.js r128, d3 7.8.5, Google Fonts); the logo and icons are embedded.

Demo login: pick a role, pick an identity (Serdik ID such as `SRD-001`, or a position for other roles) and any 4-digit PIN.

## Deploy to Vercel

1. In Vercel, **Add New → Project** and import `krisnamughni24/SatgasSoedirman`.
2. Framework preset **Other**. Leave Build Command and Output Directory empty (the built `index.html` is committed).
3. Deploy. Every push to `main` redeploys.

`vercel.json` adds clean URLs, security headers and long caching for `assets/`; `.vercelignore` keeps sources, tooling and the trailer out of the deployment. Rebuild with `python3 build.py` and commit `index.html` before pushing changes to `src/`.

## Develop

The source is split in `src/` and concatenated into `index.html`:

```
src/00-layout.html                    markup, CSS tokens, icon sprite
src/01-utils.js                       helpers and seeded RNG
src/02-data-placement.js              regions, Serdik, issues, two-layer placement engine
src/03-engine-map-home-ops.js         simulation engine, 3D map, login, tour, Beranda, Operasi
src/04-network-issues-lab.js          network, issue board, placement view, Lab SPK, directory, drawers, main loop
src/05-visuals-hub-analytics-games.js chart toolkit, sentiment, Hub, Analitik, Laporan, Arena, Bantuan, extra Lab tools
src/06-roles.js                       role definitions, permissions, scopes, role login, role consoles, audit log
assets/                               P3MDI logo, favicon, touch icon (embedded at build time)
```

```bash
python3 build.py   # writes index.html (inlines assets/ as data URIs)
```

Order matters: later files use globals declared earlier.

## Video tooling

`tools/video/` renders the cinematic trailer frame by frame with a virtual clock (Playwright + headless Chrome), synthesises the soundtrack with NumPy/SciPy and encodes with ffmpeg:

```bash
npm i three@0.128.0 d3@7.8.5 @fontsource/playfair-display@5 @fontsource/archivo@5 @fontsource/ibm-plex-sans@5 @fontsource/ibm-plex-mono@5
NODE_MODULES=./node_modules python3 tools/video/build_local.py   # offline copy of index.html -> tools/video/local.html
cd tools/video && python3 cine.py && python3 gen_music.py
ffmpeg -framerate 30 -i cframes/%05d.jpg -i cine_music.wav -c:v libx264 -crf 21 -pix_fmt yuv420p -c:a aac -shortest trailer.mp4
```

## Credits

Concept and development: Krisna (Serdik P3MD). Prototype built with Claude.
