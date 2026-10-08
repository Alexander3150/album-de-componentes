#!/usr/bin/env python3
"""
Completa FOTO y PRECIO de los productos que aún no los tienen, leyendo la ficha
real de cada producto en la tienda (el enlace que ya está en js/data.js).

Uso (desde la carpeta del sitio, donde está index.html):
    python tools/fetch_pacifiko.py              # descarga fotos (webp) y precios
    python tools/fetch_pacifiko.py --hotlink    # usa la URL de la foto de la tienda, sin descargar
    python tools/fetch_pacifiko.py --only 77,78 # solo algunas categorías
    python tools/fetch_pacifiko.py --dry        # solo muestra qué encontraría, no escribe nada

Requisitos: Python 3.8+. Opcional: pip install pillow (para convertir a .webp).
Hace una copia js/data.js.bak antes de escribir.
"""
import argparse, json, os, re, sys, time, unicodedata, urllib.request, urllib.error, html
from urllib.parse import urljoin, urlparse

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, 'js', 'data.js')
IMGD = os.path.join(BASE, 'images')
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/124.0 Safari/537.36')
HDR = {'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
       'Accept-Language': 'es-GT,es;q=0.9,en;q=0.5'}

def get(url, binary=False, tries=3):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HDR)
            with urllib.request.urlopen(req, timeout=25) as r:
                data = r.read()
                return data if binary else data.decode(r.headers.get_content_charset() or 'utf-8', 'replace')
        except Exception as e:
            last = e; time.sleep(1.5 * (i + 1))
    raise last

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:40]

def meta(h, *names):
    for n in names:
        for pat in (r'<meta[^>]+(?:property|name|itemprop)=["\']%s["\'][^>]*content=["\']([^"\']+)["\']' % re.escape(n),
                    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:property|name|itemprop)=["\']%s["\']' % re.escape(n)):
            m = re.search(pat, h, re.I)
            if m: return html.unescape(m.group(1)).strip()
    return None

def jsonld(h):
    out = []
    for m in re.finditer(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', h, re.S | re.I):
        try: out.append(json.loads(m.group(1).strip()))
        except Exception: pass
    return out

def walk(o):
    if isinstance(o, dict):
        yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o, list):
        for v in o: yield from walk(v)

def to_num(x):
    try:
        return float(str(x).replace('Q', '').replace(',', '').strip())
    except Exception:
        return None

def extract(h, url):
    img = price = None
    for blob in jsonld(h):
        for d in walk(blob):
            if not img and d.get('image'):
                v = d['image']; v = v[0] if isinstance(v, list) else v
                img = v.get('url') if isinstance(v, dict) else v
            off = d.get('offers')
            if price is None and off:
                for o in (off if isinstance(off, list) else [off]):
                    if isinstance(o, dict):
                        price = to_num(o.get('price') or o.get('lowPrice'))
                        if price: break
    img = img or meta(h, 'og:image', 'twitter:image')
    if price is None:
        price = to_num(meta(h, 'product:price:amount', 'price', 'og:price:amount'))
    if price is None:
        m = re.search(r'itemprop=["\']price["\'][^>]*content=["\']([\d.,]+)', h, re.I) or \
            re.search(r'content=["\']([\d.,]+)["\'][^>]*itemprop=["\']price["\']', h, re.I)
        if m: price = to_num(m.group(1))
    if img: img = urljoin(url, html.unescape(img))
    return img, price

def save_image(url, dest_noext):
    raw = get(url, binary=True)
    try:
        from PIL import Image
        import io
        im = Image.open(io.BytesIO(raw))
        im = im.convert('RGBA') if im.mode in ('P', 'RGBA', 'LA') else im.convert('RGB')
        im.thumbnail((900, 900))
        path = dest_noext + '.webp'; im.save(path, 'WEBP', quality=86)
    except ImportError:
        ext = os.path.splitext(urlparse(url).path)[1].lower() or '.jpg'
        path = dest_noext + ext
        open(path, 'wb').write(raw)
    return path

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--hotlink', action='store_true'); ap.add_argument('--dry', action='store_true')
    ap.add_argument('--only', default=''); ap.add_argument('--all', action='store_true',
                    help='también reintenta productos que ya tienen foto/precio')
    a = ap.parse_args()
    only = {x.strip().zfill(2) for x in a.only.split(',') if x.strip()}
    src = open(DATA, encoding='utf-8').read()
    D = json.loads(src[len('window.CATALOG='):].rstrip().rstrip(';'))
    os.makedirs(IMGD, exist_ok=True)
    ok = fail = 0; changed = False
    for c in D:
        if only and c['id'] not in only: continue
        for k, p in enumerate(c['p']):
            need_img = not p.get('img'); need_pr = p.get('pr') is None
            if not (a.all or need_img or need_pr): continue
            if 'pacifiko.com' not in p['u']: continue
            url = p['u'].split('?srsltid')[0]
            try:
                h = get(url)
                img, price = extract(h, url)
                msg = []
                if (need_img or a.all) and img:
                    if a.hotlink: p['img'] = img
                    elif not a.dry:
                        base = os.path.join(IMGD, '%s-%s-%s' % (c['id'], 'abcdefgh'[k], slug(p['n'])))
                        p['img'] = 'images/' + os.path.basename(save_image(img, base))
                    msg.append('foto')
                if (need_pr or a.all) and price:
                    p['pr'] = price; msg.append('Q%s' % price)
                if msg: ok += 1; changed = True; print('OK  ', c['id'], p['n'], '->', ', '.join(msg))
                else: fail += 1; print('SIN DATOS', c['id'], p['n'], '(img=%s, precio=%s)' % (bool(img), price))
            except Exception as e:
                fail += 1; print('ERROR', c['id'], p['n'], '->', e)
            time.sleep(1.0)
    if changed and not a.dry:
        open(DATA + '.bak', 'w', encoding='utf-8').write(src)
        open(DATA, 'w', encoding='utf-8').write('window.CATALOG=' + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + ';')
    print('\nListo: %d actualizados, %d sin datos/errores.%s' % (ok, fail, ' (modo --dry: no se escribió nada)' if a.dry else ''))
    if fail: print('Los productos sin datos siguen mostrando el recuadro y "Precio en tienda".')

if __name__ == '__main__':
    main()
