"""Tells Bing (and other IndexNow engines) about new or changed pages.

    python3 scripts/indexnow.py                 # every URL in sitemap.xml
    python3 scripts/indexnow.py blog/my-post.html

Run it after the change is live on the site.
"""

import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = "astranexora.netlify.app"
KEY = open(os.path.join(ROOT, "scripts", "indexnow-key.txt")).read().strip()

if len(sys.argv) > 1:
    urls = [f"https://{HOST}/{p.lstrip('/')}" for p in sys.argv[1:]]
else:
    urls = re.findall(r"<loc>(.*?)</loc>", open(os.path.join(ROOT, "sitemap.xml")).read())

body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"https://{HOST}/{KEY}.txt", "urlList": urls}).encode()
for endpoint in ["https://api.indexnow.org/indexnow", "https://www.bing.com/indexnow"]:
    req = urllib.request.Request(endpoint, data=body, headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(endpoint, r.status, f"({len(urls)} URLs)")
    except Exception as e:
        print(endpoint, "failed:", e)
