"""Nefona uygulama simgesi ve açılış işareti üreticisi (tek kaynak).

Tasarım: Artifact "Nefona Simgesi" (onaylı, 2026-09-28). "n" kemeri = üst göz kapağı; iris kemer yayıyla aynı
merkezde, her yönden eşit boşluk; göz bebeği hafif yukarı bakar; ışık sol üstten.
Çıktılar (python3 simge.py; SVG'leri PNG'ye çevirmek için node render.mjs):
  svg/light.svg, dark.svg, tinted.svg   -> AppIcon.appiconset (iOS 18 ve öncesi; açık/koyu/renklendirilmiş)
  svg/mark_light.svg, mark_dark.svg     -> açılış ekranı işareti
  icon/  (AppIcon.icon katmanları)      -> iOS 26 katmanlı simge (Icon Composer biçimi)
"""
import json, os

S = 1024
AX, AY = 512, 520          # kemer yayının ve irisin merkezi (optik merkezin biraz üstü)
SW = 96                    # kemer kalınlığı
IR = 124                   # iris yarıçapı
GAP = 50                   # iris ile kemer iç kenarı arası (her yön)
R = IR + GAP + SW / 2      # kemer orta çizgisi yarıçapı
LEG = AY + 190             # bacak ucu (yuvarlak uç merkezi)
PR = 0.44 * IR             # göz bebeği yarıçapı
LOOK = 0.12 * IR           # göz bebeği yukarı kayması (yukarı bakış)
PX, PY = AX, AY - LOOK     # göz bebeği merkezi
GX, GY, GR = PX - PR * 0.36, PY - PR * 0.36, PR * 0.22   # parıltı (sol üst: ışıkla aynı yön)

BG_LIGHT = ("#22c7d8", "#2f86ef", "#2459d0")
BG_DARK = ("#0e1b2c", "#0b1628", "#060a10")
IRIS = ("#9ff1f6", "#7fe6f0", "#62d8ea")   # içten dışa
ARCH_DARK = ("#2fd6e2", "#4d88ff")
PUPIL = "#070c12"

ARCH_D = f"M {AX-R} {LEG} L {AX-R} {AY} A {R} {R} 0 0 1 {AX+R} {AY} L {AX+R} {LEG}"

def svg(body, defs=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">' \
           f'<defs>{defs}</defs>{body}</svg>\n'

IRIS_DEF = (f'<radialGradient id="iris" cx=".5" cy=".5" r=".5"><stop offset=".5" stop-color="{IRIS[0]}"/>'
            f'<stop offset=".86" stop-color="{IRIS[1]}"/><stop offset="1" stop-color="{IRIS[2]}"/></radialGradient>')
ARCH_DEF = (f'<linearGradient id="archG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{ARCH_DARK[0]}"/>'
            f'<stop offset="1" stop-color="{ARCH_DARK[1]}"/></linearGradient>')

def bg_defs(c, glow):
    return (f'<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c[0]}"/>'
            f'<stop offset=".55" stop-color="{c[1]}"/><stop offset="1" stop-color="{c[2]}"/></linearGradient>'
            f'<radialGradient id="glow" cx=".2" cy=".1" r=".8"><stop offset="0" stop-color="#fff" stop-opacity="{glow}"/>'
            f'<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>')

def eye(iris_fill="url(#iris)", pupil=PUPIL, glint="#ffffff"):
    return (f'<circle cx="{AX}" cy="{AY}" r="{IR}" fill="{iris_fill}"/>'
            f'<circle cx="{PX}" cy="{PY:.1f}" r="{PR:.1f}" fill="{pupil}"/>'
            f'<circle cx="{GX:.1f}" cy="{GY:.1f}" r="{GR:.1f}" fill="{glint}"/>')

def arch(stroke):
    return f'<path d="{ARCH_D}" fill="none" stroke="{stroke}" stroke-width="{SW}" stroke-linecap="round"/>'

def full(kind):
    if kind == "light":
        return svg(f'<rect width="{S}" height="{S}" fill="url(#bg)"/><rect width="{S}" height="{S}" fill="url(#glow)"/>'
                   + arch("#ffffff") + eye(), bg_defs(BG_LIGHT, 0.2) + IRIS_DEF)
    if kind == "dark":
        return svg(f'<rect width="{S}" height="{S}" fill="url(#bg)"/><rect width="{S}" height="{S}" fill="url(#glow)"/>'
                   + arch("url(#archG)") + eye(), bg_defs(BG_DARK, 0.05) + IRIS_DEF + ARCH_DEF)
    if kind == "tinted":   # gri tonlu; iOS seçilen rengi uygular
        return svg(f'<rect width="{S}" height="{S}" fill="#000"/>' + arch("#ffffff") + eye("#b4b4b4", "#000", "#fff"))
    if kind in ("mark_light", "mark_dark"):   # açılış ekranı: yalnız işaret, uygulama zemininde
        ground = "#f3f6f8" if kind == "mark_light" else "#070c12"
        return svg(f'<rect width="{S}" height="{S}" fill="{ground}"/>' + arch("url(#archG)") + eye(), IRIS_DEF + ARCH_DEF)
    raise ValueError(kind)

# ---- iOS 26 katmanlı simge (Icon Composer .icon paketi) ----
# Biçim, Icon Composer'ın kaydettiği gerçek icon.json örnekleriyle aynı anahtarlar (fill-specializations, groups,
# layers, image-name, glass, position, shadow, translucency, specular, supported-platforms). Katmanlar tam tuval
# (1024) SVG, konum 0. Dizideki ilk grup en üstte.
def srgb_to_p3(hexc):
    r, g, b = (int(hexc[i:i+2], 16) / 255 for i in (1, 3, 5))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = lin(r), lin(g), lin(b)
    # sRGB doğrusal -> Display P3 doğrusal (ikisi de D65)
    R_ = 0.8224621 * r + 0.1775380 * g + 0.0000000 * b
    G_ = 0.0331941 * r + 0.9668058 * g + 0.0000000 * b
    B_ = 0.0170827 * r + 0.0723974 * g + 0.9105199 * b
    enc = lambda c: 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
    return "display-p3:" + ",".join(f"{min(1, max(0, enc(c))):.5f}" for c in (R_, G_, B_)) + ",1.00000"

def layer(name, img, glass, extra=None):
    d = {"glass": glass, "hidden": False, "image-name": img, "name": name, "opacity": 1,
         "position": {"scale": 1, "translation-in-points": [0, 0]}}
    if extra: d.update(extra)
    return d

def icon_json():
    return {
        "fill-specializations": [
            {"value": {"linear-gradient": [srgb_to_p3(BG_LIGHT[0]), srgb_to_p3(BG_LIGHT[2])]}},
            {"appearance": "dark", "value": {"linear-gradient": [srgb_to_p3(BG_DARK[0]), srgb_to_p3(BG_DARK[2])]}},
        ],
        "groups": [
            {   # göz: iris + göz bebeği + parıltı; opak, cam yok (göz net kalsın)
                "layers": [
                    layer("glint", "glint.svg", False),
                    layer("pupil", "pupil.svg", False),
                    layer("iris", "iris.svg", False, {"fill-specializations": [
                        {"appearance": "tinted", "value": {"solid": "extended-gray:0.70000,1.00000"}}]}),
                ],
                "shadow": {"kind": "layer-color", "opacity": 0.5},
                "specular": True,
                "translucency": {"enabled": False, "value": 0.5},
            },
            {   # kemer (göz kapağı): cam
                "layers": [
                    layer("arch", "arch.svg", True, {"fill-specializations": [
                        {"value": {"solid": "extended-gray:1.00000,1.00000"}},
                        {"appearance": "dark", "value": {"automatic-gradient": srgb_to_p3(ARCH_DARK[0])}},
                        {"appearance": "tinted", "value": {"solid": "extended-gray:1.00000,1.00000"}}]}),
                ],
                "shadow": {"kind": "layer-color", "opacity": 0.5},
                "specular": True,
                "translucency": {"enabled": True, "value": 0.4},
            },
        ],
        "supported-platforms": {"squares": "shared"},
    }

def icon_layers():
    return {
        "arch.svg": svg(arch("#ffffff")),
        "iris.svg": svg(f'<circle cx="{AX}" cy="{AY}" r="{IR}" fill="url(#iris)"/>', IRIS_DEF),
        "pupil.svg": svg(f'<circle cx="{PX}" cy="{PY:.1f}" r="{PR:.1f}" fill="{PUPIL}"/>'),
        "glint.svg": svg(f'<circle cx="{GX:.1f}" cy="{GY:.1f}" r="{GR:.1f}" fill="#ffffff"/>'),
    }

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(here, "svg"), exist_ok=True)
    for k in ("light", "dark", "tinted", "mark_light", "mark_dark"):
        open(os.path.join(here, "svg", f"{k}.svg"), "w").write(full(k))
    ic = os.path.join(here, "..", "..", "ios", "App", "App", "AppIcon.icon")
    os.makedirs(os.path.join(ic, "Assets"), exist_ok=True)
    for name, body in icon_layers().items():
        open(os.path.join(ic, "Assets", name), "w").write(body)
    open(os.path.join(ic, "icon.json"), "w").write(json.dumps(icon_json(), indent=2, ensure_ascii=False) + "\n")
    print("ok")
