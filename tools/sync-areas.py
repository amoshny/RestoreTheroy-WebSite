"""Render crawlable coverage content from service-areas.json."""
import json,re,argparse
from pathlib import Path
from html import escape
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
areas=json.loads((root/'service-areas.json').read_text())
primary={'poway','mira-mesa','scripps-ranch','rancho-bernardo','rancho-penasquitos'}
dedicated={'poway':'/mobile-detailing-poway/','mira-mesa':'/mobile-detailing-mira-mesa/'}
items=[]
cards=[]
for area in areas:
    name=escape(area['name'])
    slug=area['slug']
    coordinate=','.join(str(value) for value in area['location'])
    items.append(f'                    <li data-area="{slug}" data-location="{coordinate}"><a href="{dedicated.get(slug, "/service-areas/#"+slug)}">{name}</a></li>')
    # Only the five substantive planning guides have their own anchors.
    target=dedicated.get(slug) or (f'#{slug}' if slug in primary else '/request-a-quote/?area='+slug)
    card_id='' if slug in primary else f' id="{slug}"'
    cards.append(f'<a class="rt-area-directory-card"{card_id} href="{target}">{name}<span aria-hidden="true">→</span></a>')
for path,pattern,replacement in [
    ('index.html',r'(<ul class="rt-neighborhoods"[^>]*>).*?(</ul>)',lambda m:m[1]+'\n'+'\n'.join(items)+'\n                '+m[2]),
    ('service-areas/index.html',r'(<div class="rt-area-directory" data-area-directory>).*?(</div>)',lambda m:m[1]+'\n'+'\n'.join('                    '+x for x in cards)+'\n                '+m[2])
]:
    file=root/path
    old=file.read_text()
    new,n=re.subn(pattern,replacement,old,count=1,flags=re.S)
    if n!=1:raise SystemExit('Missing area render slot in '+path)
    if old!=new:
        if args.check:raise SystemExit('Coverage content out of date: '+path)
        file.write_text(new)
print('Coverage content matches service-areas.json.')
