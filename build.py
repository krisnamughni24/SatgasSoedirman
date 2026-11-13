"""Build index.html from the files in src/.

The app ships as one self-contained HTML page (no bundler). Edit the files in
src/, then run:  python3 build.py
"""
import base64
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')

# CDN libraries, pinned to exact versions
LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
    'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js',
]

# Order matters: later files use globals declared in earlier ones
JS_FILES = [
    '01-utils.js',
    '02-data-placement.js',
    '03-engine-map-home-ops.js',
    '04-network-issues-lab.js',
    '05-visuals-hub-analytics-games.js',
    '06-roles.js',
]
BOOT = '\ninitRoles();renderWeights();\nrequestAnimationFrame(frame);\n'

# Logo placeholders in 00-layout.html, filled with data URIs from assets/
ASSETS = {
    '%%LOGO%%': 'logo-p3mdi.png',
    '%%FAVICON%%': 'favicon.png',
    '%%TOUCH%%': 'apple-touch-icon.png',
}


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def data_uri(name):
    with open(os.path.join(ROOT, 'assets', name), 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode()


def main():
    layout = read('00-layout.html')
    for key, name in ASSETS.items():
        layout = layout.replace(key, data_uri(name))
    # Leading <title>/<meta>/<link> lines belong in <head>
    m = re.match(r'((?:\s*<(?:title|meta|link)\b[^\n]*\n)+)', layout)
    head = m.group(1) if m else ''
    layout = layout[len(head):]
    js = ''.join(read(n) for n in JS_FILES) + BOOT
    scripts = ''.join(f'<script src="{u}"></script>\n' for u in LIBS)
    # Minimal document shell (the page is otherwise written as body content)
    shell = ('<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n'
             '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
             '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n' + head + '</head>\n<body>\n')
    html = shell + layout + scripts + '<script>\n' + js + '\n</script>\n</body>\n</html>\n'
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'index.html written ({len(html) // 1024} KB)')


if __name__ == '__main__':
    main()
