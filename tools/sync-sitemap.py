"""Build the sitemap from actual public HTML routes; never invent modification dates."""
import argparse,re
from pathlib import Path
from html import escape
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args()
files=[root/'index.html',*sorted(p for p in root.rglob('index.html') if p!=root/'index.html')]
urls=[]
for p in files:
 s=p.read_text()
 if re.search(r'<meta[^>]+name="robots"[^>]+content="[^"]*noindex',s):continue
 url=re.search(r'<link rel="canonical" href="([^"]+)"',s)[1]
 if url not in urls:urls.append(url)
new='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('    <url><loc>'+escape(url)+'</loc></url>\n' for url in urls)+'</urlset>\n'
p=root/'sitemap.xml'
if p.read_text()!=new:
 if args.check:raise SystemExit('Sitemap needs synchronization')
 p.write_text(new)
print(f'Sitemap matches {len(urls)} public routes.')
