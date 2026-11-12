import re
import os
# Folder containing node_modules with three@0.128.0, d3@7.8.5 and @fontsource fonts (see README)
J=os.path.abspath(os.environ.get('NODE_MODULES','node_modules'))+'/'
s=open(os.path.join(os.path.dirname(__file__),'..','..','index.html')).read()
faces=[]
for fam,pkg,ws in [('Playfair Display','playfair-display',[600,700,800]),('Archivo','archivo',[500,600,700,800,900]),('IBM Plex Sans','ibm-plex-sans',[400,500,600]),('IBM Plex Mono','ibm-plex-mono',[400,500,600])]:
  for w in ws: faces.append(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url('file://{J}@fontsource/{pkg}/files/{pkg}-latin-{w}-normal.woff2') format('woff2')}}")
s=re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]+>','<style>'+''.join(faces)+'</style>',s)
s=s.replace('<link rel="preconnect" href="https://fonts.googleapis.com">','')
s=s.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','file://'+J+'three/build/three.min.js')
s=s.replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js','file://'+J+'three/examples/js/controls/OrbitControls.js')
s=s.replace('https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js','file://'+J+'d3/dist/d3.min.js')
# skeleton like the artifact host
s='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>'+s+'</body></html>'
open(os.path.join(os.path.dirname(__file__),'local.html'),'w').write(s)
