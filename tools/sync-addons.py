"""Render unchanged optional extras inside all four package pages from addons.json."""
from pathlib import Path
from html import escape
import argparse,json,re
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args()
items=json.loads((root/'addons.json').read_text())
rows=''.join('<div><dt>'+escape(x['name'])+'</dt><dd>'+escape(x['price'])+'</dd></div>' for x in items)
markup='''<!-- rt:addons:start -->
        <section class="rt-detail-section" id="extras" aria-labelledby="extras-title">
            <div class="container rt-detail-reading">
                <h2 id="extras-title">Optional extras for your detail</h2>
                <p class="rt-detail-lead">Additional work beyond this package is optional and agreed before it begins. Standard treatment already included in your package is not charged again.</p>
                <details class="rt-faq-item rt-package-extras">
                    <summary>View Extras &amp; Add-ons prices</summary>
                    <div class="rt-service-addons"><dl>'''+rows+'''</dl></div>
                </details>
            </div>
        </section>
<!-- rt:addons:end -->'''
for name in ['interior-detailing','essential-detail','deep-clean-protect','full-detail-polish']:
 p=root/name/'index.html';old=p.read_text();new,n=re.subn(r'<!-- rt:addons:start -->.*?<!-- rt:addons:end -->',lambda _:markup,old,flags=re.S)
 assert n==1,name
 if new!=old:
  if args.check:raise SystemExit('Stale optional extras: '+name)
  p.write_text(new)
print('All four package pages match addons.json; optional extras and prices preserved.')
