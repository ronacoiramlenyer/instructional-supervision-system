"""Builds self-contained offline copies of the presentation pages.

Each output is ONE .html file with the slide images and the web fonts embedded,
so it opens in any browser with no internet connection.

Usage: python3 scripts/build-offline.py site/v1/index.html offline/ISS-Version-1.html
Needs curl (to download the Google Fonts once; cached in .font-cache/).
"""
import base64, hashlib, os, re, subprocess, sys

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".font-cache")


def fetch(url, binary=False):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, hashlib.sha256(url.encode()).hexdigest()[:24])
    if not os.path.exists(path):
        subprocess.run(["curl", "-sSfL", "-A", UA, "-o", path, url], check=True)
    with open(path, "rb") as f:
        data = f.read()
    return data if binary else data.decode("utf-8")


def embed_fonts(css):
    """Keep the latin subsets and inline each font file as a data URI."""
    blocks = re.findall(r"/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})", css, flags=re.S)
    out = []
    for subset, block in blocks:
        if subset not in ("latin", "latin-ext"):
            continue
        url = re.search(r"url\((https://[^)]+)\)", block).group(1)
        b64 = base64.b64encode(fetch(url, binary=True)).decode()
        out.append(block.replace(url, "data:font/woff2;base64," + b64))
    return "\n".join(out)


def main(src, dst):
    with open(src, encoding="utf-8") as f:
        html = f.read()
    site_dir = os.path.dirname(os.path.dirname(os.path.abspath(src)))

    # Fonts: replace every Google Fonts <link> with one inline <style>.
    hrefs = re.findall(r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com/[^"]+)">', html)
    css = "\n".join(embed_fonts(fetch(h.replace("&amp;", "&"))) for h in hrefs)
    html = re.sub(r'<link rel="(?:stylesheet|preconnect)"[^>]*>\n?', "", html)
    html = html.replace("<style>", "<style>\n" + css + "\n", 1)

    # Images: inline as data URIs.
    def img(m):
        path = os.path.join(site_dir, m.group(1).lstrip("/"))
        with open(path, "rb") as f:
            return 'src="data:image/png;base64,' + base64.b64encode(f.read()).decode() + '"'
    html = re.sub(r'src="(/images/[^"]+\.png)"', img, html)

    # The "Versions" link points to the website's home page; drop it offline.
    html = re.sub(r'\s*<a href="/" id="home"[^>]*>.*?</a>', "", html)

    assert "fonts.googleapis.com" not in html and 'src="/images/' not in html
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    with open(dst, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {dst} ({len(html) / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
