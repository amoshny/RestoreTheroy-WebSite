"""Render five factual photo cases and their index from results/cases.json."""
import argparse,json,re
from html import escape as esc
from pathlib import Path
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args()
cases=json.loads((root/'results/cases.json').read_text())
template=(root/'tools/results-template.html').read_text()
def link(url,label):return f'<a href="{esc(url)}">{esc(label)}</a>'
def actions(c):return f'<div class="rt-hero-actions"><a class="rt-primary" href="/request-a-quote/?service={c["service"]}">Request a Detail</a><a class="rt-quote-secondary" href="sms:+18588882707">Text Ace</a><a class="rt-quote-secondary" href="tel:8588882707">Call Ace</a></div>'
def render(title,description,path,image,main):
 s=template
 for key,value in {'TITLE':title,'DESCRIPTION':description,'URL':'https://restoretheory.net/'+path,'IMAGE':'https://restoretheory.net'+image}.items():s=s.replace('{{'+key+'}}',esc(value,quote=True))
 return s.replace('{{MAIN}}',main)
def write(path,s):
 p=root/path
 # Metadata is owned by sync-metadata.py, so don't erase its generated block on repeat rendering.
 if p.exists():
  m=re.search(r'    <script type="application/ld\+json" data-site-metadata>.*?</script>\n',p.read_text(),re.S)
  if m:s=s.replace('</head>',m[0]+'</head>')
 if not p.exists() or p.read_text()!=s:
  if args.check:raise SystemExit('Stale results page: '+path)
  p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
for c in cases:
 title=esc(c['title']);photos=[]
 for state in ['before','after']:
  url=f'/images/portfolio/normalized/{c["photo"]}-{state}.jpg'
  priority=' fetchpriority="high"' if state=='before' else ''
  photos.append(f'<figure class="rt-detail-photo"><a href="{url}" aria-label="Open full {state} photo: {title}"><img src="{url}" width="600" height="750" alt="{esc(c[state])}" decoding="async"{priority}></a><figcaption>{state.title()}</figcaption></figure>')
 others=''.join(link('/results/'+x['slug']+'/',x['title']) for x in cases if x!=c)
 service_link=link('/'+c['servicePath']+'/', 'Learn about separately quoted deep cleaning' if c['service']=='deep-clean' else 'See '+c['serviceName']+' inclusions and starting price')
 main=f'''<main id="main-content">
 <nav class="container rt-detail-path" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/results/">Results</a><span>/</span><span aria-current="page">{title}</span></nav>
 <header class="rt-detail-hero" id="top"><div class="container rt-detail-intro rt-detail-intro-case"><div><p class="rt-section-kicker">REAL BEFORE &amp; AFTER · RESTORE THEORY</p><h1>{title}</h1><p class="rt-detail-lead">{esc(c['summary'])}</p>{actions(c)}<p class="rt-detail-trust">Owner-operated · I bring my own water and power</p></div><div class="rt-detail-compare" role="group" aria-label="{title}: before and after">{''.join(photos)}</div></div></header>
 <section class="rt-detail-section"><div class="container rt-detail-reading"><h2>What the photos show</h2><h3>Before</h3><p class="rt-detail-lead">{esc(c['before'])}</p><h3>After</h3><p class="rt-detail-lead">{esc(c['after'])}</p><h2>Where to look</h2><p class="rt-detail-lead">{esc(c['focus'])}</p><p class="rt-detail-lead">Photographs show one vehicle at the time of its detail. Results for another car depend on its materials, condition and previous treatment.</p></div></section>
 <section class="rt-detail-section"><div class="container rt-detail-reading"><h2>Choosing care for your own car</h2><p class="rt-detail-lead">{esc(c['decision'])}</p><p>{service_link}</p><p class="rt-detail-lead">I’ll review what needs attention and agree on the work and any additional charges before starting.</p></div></section>
 <section class="rt-detail-section rt-detail-contact"><div class="container"><h2>Show me what needs attention</h2><p>Request a detail online, or text photos of the areas you want cleaned. I’ll confirm the appropriate service, quote and appointment with you.</p>{actions(c)}<p>{link('/service-areas/','Check your service area')}</p></div></section>
 <nav class="rt-detail-section" aria-label="More real detailing cases"><div class="container"><h2>More real results</h2><div class="rt-detail-link-list">{others}</div></div></nav>
 </main>'''
 write('results/'+c['slug']+'/index.html',render(c['title']+' — Before & After',c['summary']+' Compare real Restore Theory photos and find a suitable detailing service.','results/'+c['slug']+'/',f'/images/portfolio/normalized/{c["photo"]}-after.jpg',main))
cards=''.join(f'<article class="rt-package rt-case-card"><a href="/results/{c["slug"]}/"><img src="/images/portfolio/normalized/{c["photo"]}-after.jpg" width="600" height="750" loading="lazy" decoding="async" alt="{esc(c["after"])}"><h2>{esc(c["title"])}</h2></a><p>{esc(c["summary"])}</p><a href="/{c["servicePath"]}/">{("Learn about extra cleaning" if c["service"]=="deep-clean" else "Explore "+esc(c["serviceName"]))}</a></article>' for c in cases)
main=f'''<main id="main-content"><nav class="container rt-detail-path" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Real results</span></nav><header class="rt-detail-hero" id="top"><div class="container"><p class="rt-section-kicker">REAL WORK · RESTORE THEORY</p><h1>Real detailing results, before and after.</h1><p class="rt-detail-lead">Explore five photographed examples: rear floors, front cabins, light-colored seating and exterior road dirt. Each comparison links to services that may suit similar cleaning needs.</p><p class="rt-detail-lead">Open each example to compare the photos and find the service options for your own vehicle. Lighting and camera angles can differ.</p></div></header><section class="rt-detail-section"><div class="container rt-case-grid">{cards}</div></section><nav class="rt-detail-section"><div class="container rt-detail-link-list">{link('/#gallery','Browse the full photo gallery')}{link('/service-areas/','Explore service areas')}{link('/request-a-quote/','Request a detail online')}</div></nav></main>'''
write('results/index.html',render('Real Car Detailing Before & After','Five real Restore Theory detailing examples. Compare interior and exterior before-and-after photos, read what changed and explore suitable services.','results/','/images/portfolio/normalized/lincoln-rear-after.jpg',main))
print('Five photo cases and results hub match results/cases.json.')
