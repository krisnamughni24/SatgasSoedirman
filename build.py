"""Build index.html from the files in src/.

The app ships as one self-contained HTML page (no bundler). Edit the files in
src/, then run:  python3 build.py
"""
import os

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
]
BOOT = '\ninitLogin();renderWeights();\nrequestAnimationFrame(frame);\n'


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def main():
    layout = read('00-layout.html')
    js = ''.join(read(n) for n in JS_FILES) + BOOT
    scripts = ''.join(f'<script src="{u}"></script>\n' for u in LIBS)
    # Minimal document shell (the page is otherwise written as body content)
    shell = ('<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n'
             '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
             '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n')
    html = shell + layout + scripts + '<script>\n' + js + '\n</script>\n</body>\n</html>\n'
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'index.html written ({len(html) // 1024} KB)')


if __name__ == '__main__':
    main()
