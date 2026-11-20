"""Synchronize static review labels from the public integrations.js snapshot."""
import argparse,re
from pathlib import Path
from html import escape
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args()
source=(root/'integrations.js').read_text()
block=re.search(r'reviews: Object.freeze\(\{(.*?)\}\)',source,re.S)[1]
count=re.search(r"count:\s*(?:'([^']+)'|(\d+))",block)
count=count[1] or count[2]
rating=re.search(r"rating:\s*'([^']+)'",block)[1]
date=re.search(r"verifiedOn:\s*'([^']+)'",block)[1]
values={'data-review-count':count,'data-review-rating':rating,'data-review-snapshot':count+' reviews as of '+date}
for p in sorted(root.rglob('index.html')):
 old=p.read_text();new=old
 for attr,value in values.items():
  new=re.sub(r'(<(?:span|small) '+attr+r'>)[^<]*(</(?:span|small)>)',lambda m:m[1]+escape(value)+m[2],new)
 if new!=old:
  if args.check:raise SystemExit('Stale review snapshot: '+str(p.relative_to(root)))
  p.write_text(new)
print('Static review labels match integrations.js; owner-confirmed snapshot preserved.')
