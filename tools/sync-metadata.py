"""Generate static organization and breadcrumb metadata without invented locations."""
from pathlib import Path
import json,re,argparse
from html import unescape
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
pages=sorted(root.rglob('index.html'))
areas=json.loads((root/'service-areas.json').read_text())
for file in pages:
    old=file.read_text()
    name=unescape(re.search(r'<title>(.*?)</title>',old)[1]).split(' | ')[0]
    path=file.relative_to(root).as_posix().removesuffix('index.html')
    url='https://restoretheory.net/'+path
    if not path:
        nodes=[
            {'@type':'Organization','@id':'https://restoretheory.net/#business','name':'Restore Theory',
             'url':url,'telephone':'+18588882707','areaServed':[area['name'] for area in areas],
             'sameAs':['https://maps.app.goo.gl/646HvqYnGiE1Yz1LA','https://instagram.com/restoretheorysd']},
            {'@type':'WebSite','@id':'https://restoretheory.net/#website','url':url,'name':'Restore Theory',
             'publisher':{'@id':'https://restoretheory.net/#business'}}
        ]
    else:
        crumbs=[{'@type':'ListItem','position':1,'name':'Home','item':'https://restoretheory.net/'}]
        if path.startswith('results/') and path!='results/':
            crumbs.append({'@type':'ListItem','position':2,'name':'Real results','item':'https://restoretheory.net/results/'})
        crumbs.append({'@type':'ListItem','position':len(crumbs)+1,'name':name,'item':url})
        nodes=[{'@type':'BreadcrumbList','itemListElement':crumbs}]
    markup='    <script type="application/ld+json" data-site-metadata>\n    '+json.dumps({'@context':'https://schema.org','@graph':nodes},ensure_ascii=False)+'\n    </script>'
    if 'data-site-metadata' in old:
        new=re.sub(r'    <script type="application/ld\+json" data-site-metadata>.*?</script>',lambda m:markup,old,count=1,flags=re.S)
    else:
        new=old.replace('</head>',markup+'\n</head>',1)
    if old!=new:
        if args.check:raise SystemExit('Stale metadata in '+str(file.relative_to(root)))
        file.write_text(new)
print('Organization and breadcrumb metadata match the page routes.')
