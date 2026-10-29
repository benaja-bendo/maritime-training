"""Détoure le logo fourni par le client (design/logo-source.jpg) et produit les fichiers de public/.

Le fond du fichier source est un bleu nuit uniforme : on le rend transparent par remplissage
depuis l'extérieur (les parties bleu nuit de l'écusson, enfermées dans la corde, restent
opaques), puis on reconstitue la transparence des bords lissés pour éviter tout liseré sombre.

Fichiers produits : design/logo-mark.png et design/logo-complet.png (maîtres transparents),
public/logo-mark-sm.webp, public/icon-*.png, public/favicon.ico, public/og-image.jpg.

Dépendances : pip install pillow numpy scipy
Usage : python3 design/build-logo.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'design' / 'logo-source.jpg'
OUT = ROOT / 'public'

SITE_BG = (11, 27, 48)  # #0b1b30, fond du site
EMBLEM_BOX = (26, 180, 578, 812)  # x0, y0, x1, y1 : l'écusson seul, avec marge
FULL_BOX = (26, 180, 1526, 812)  # écusson + nom

src = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
BG = np.median(src[:60, :60].reshape(-1, 3), axis=0)


def emblem_alpha_and_color(rgb):
    """Transparence et couleur nette de l'écusson sur fond bleu nuit uniforme."""
    d = np.linalg.norm(rgb - BG, axis=2)
    lab, _ = ndi.label(d < 24)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    outside = np.isin(lab, border[border > 0])

    band = ndi.binary_dilation(outside, iterations=3) & ~outside
    solid = (d > 110) & ~band
    _, (iy, ix) = ndi.distance_transform_edt(~solid, return_indices=True)
    fg = rgb[iy, ix]  # couleur franche la plus proche : l'or, au bord de l'écusson

    v = fg - BG
    num = np.einsum('ijk,ijk->ij', rgb - BG, v)
    den = np.einsum('ijk,ijk->ij', v, v) + 1e-6
    alpha = np.where(band, np.clip(num / den, 0, 1), 1.0)
    alpha[outside] = 0.0
    color = np.where(band[..., None], fg, rgb)
    return alpha, color


def wordmark_alpha(rgb):
    """Texte blanc sur fond uni : la transparence se déduit du rouge (0 sur le fond, 255 sur le blanc)."""
    return np.clip((rgb[..., 0] - BG[0]) / (255 - BG[0]), 0, 1)


def to_image(alpha, color):
    out = np.dstack([np.clip(color, 0, 255), alpha * 255]).round().astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def crop(img, box):
    return img.crop(box)


def trim(img, margin=0):
    box = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    x0, y0, x1, y1 = box
    return img.crop((max(x0 - margin, 0), max(y0 - margin, 0), min(x1 + margin, img.width), min(y1 + margin, img.height)))


def on_background(img, rgb, size=None):
    base = Image.new('RGBA', img.size, rgb + (255,))
    base.alpha_composite(img)
    return base.convert('RGB')


def main():
    h, w, _ = src.shape
    alpha_e, color_e = emblem_alpha_and_color(src)
    alpha_t = wordmark_alpha(src)

    # Écusson seul
    emblem_full = to_image(alpha_e, color_e)
    emblem = trim(crop(emblem_full, EMBLEM_BOX), margin=2)

    # Nom seul (blanc)
    white = np.full_like(src, 255)
    wordmark = trim(crop(to_image(alpha_t, white), (590, 180, 1526, 812)), margin=2)

    # Ensemble écusson + nom
    combined_alpha = alpha_e.copy()
    combined_color = color_e.copy()
    combined_alpha[:, 580:] = alpha_t[:, 580:]
    combined_color[:, 580:] = 255
    lockup = trim(crop(to_image(combined_alpha, combined_color), FULL_BOX), margin=2)

    OUT.mkdir(exist_ok=True)

    # Fichiers maîtres (transparents, pleine définition) : design/, non servis par le site
    emblem.save(ROOT / 'design' / 'logo-mark.png', optimize=True)
    lockup.save(ROOT / 'design' / 'logo-complet.png', optimize=True)

    # Écusson allégé pour l'en-tête, le pied de page et l'administration (affiché à 40-80 px de haut)
    small = emblem.resize((round(emblem.width * 192 / emblem.height), 192), Image.LANCZOS)
    small.save(OUT / 'logo-mark-sm.webp', quality=92, method=6)

    # Icône d'onglet : l'écusson centré dans un carré transparent
    side = max(emblem.size)
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.alpha_composite(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2))
    for px in (16, 32, 48, 180):
        sq.resize((px, px), Image.LANCZOS).save(OUT / f'icon-{px}.png', optimize=True)
    sq.resize((48, 48), Image.LANCZOS).save(OUT / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])

    # Image de partage (aperçu WhatsApp, réseaux sociaux) : 1200×630 sur le fond du site
    card = Image.new('RGB', (1200, 630), SITE_BG)
    target_w = 1000
    scaled = lockup.resize((target_w, round(lockup.height * target_w / lockup.width)), Image.LANCZOS)
    card.paste(scaled, ((1200 - scaled.width) // 2, (630 - scaled.height) // 2), scaled)
    card.save(OUT / 'og-image.jpg', quality=90, optimize=True)

    print('écusson', emblem.size, 'ensemble', lockup.size, 'nom', wordmark.size)


if __name__ == '__main__':
    main()
