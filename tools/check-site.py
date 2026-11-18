"""Check static routes, metadata, assets and local fragment links."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent.parent
class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[];self.links=[];self.assets=[];self.h1=0;self.title='';self.in_title=False
        self.canonical=[];self.description=[];self.og={};self.jsons=[];self.script=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if tag=='a' and a.get('href'):self.links.append(a['href'])
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
        if tag=='link' and a.get('rel') in ('stylesheet','icon') and a.get('href'):self.assets.append(a['href'])
        if tag in ('script','img') and a.get('src'):self.assets.append(a['src'])
        if tag=='img' and 'alt' not in a:raise AssertionError('Image without alt')
        if tag=='img' and a.get('srcset'):
            self.assets.extend(item.strip().split(' ')[0] for item in a['srcset'].split(','))
        if tag=='meta' and a.get('name')=='description':self.description.append(a.get('content',''))
        if tag=='meta' and a.get('property','').startswith('og:'):self.og[a['property']]=a.get('content')
        if tag=='meta' and a.get('name')=='robots':assert 'noindex' not in a.get('content','')
        if tag=='h1':self.h1+=1
        if tag=='title':self.in_title=True
        if tag=='script' and a.get('type')=='application/ld+json':self.script=''
    def handle_data(self,data):
        if self.in_title:self.title+=data
        if self.script is not None:self.script+=data
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
        if tag=='script' and self.script is not None:self.jsons.append(json.loads(self.script));self.script=None
pages={}
for p in [root/'index.html',*root.glob('*/index.html'),*root.glob('results/*/index.html')]:
    doc=Document();doc.feed(p.read_text());pages[p]=doc
titles=set()
for file,doc in pages.items():
    label=str(file.relative_to(root))
    expected='https://restoretheory.net/'+label.removesuffix('index.html')
    assert doc.h1==1,(label,'H1',doc.h1)
    assert doc.title and doc.title not in titles,(label,'duplicate title')
    titles.add(doc.title)
    assert len(doc.ids)==len(set(doc.ids)),(label,'duplicate id')
    assert doc.canonical==[expected],(label,'canonical')
    assert len(doc.description)==1 and doc.description[0],(label,'description')
    assert doc.og.get('og:url')==expected and all(doc.og.get(x) for x in ('og:title','og:description','og:image')),(label,'Open Graph')
    for item in doc.links+doc.assets:
        parts=urlsplit(item)
        if parts.scheme or parts.netloc:continue
        target=root/unquote(parts.path).lstrip('/') if parts.path.startswith('/') else file.parent/unquote(parts.path)
        if not parts.path:target=file
        if parts.path.endswith('/') or target.is_dir():target=target/'index.html'
        target=target.resolve()
        assert target.exists(),(label,'missing',item)
        if parts.fragment and target in pages:assert unquote(parts.fragment) in pages[target].ids,(label,'broken fragment',item)
    print('OK',label)
sitemap=ET.parse(root/'sitemap.xml').getroot()
urls={item.text for item in sitemap.findall('{*}url/{*}loc')}
assert urls=={doc.canonical[0] for doc in pages.values()},'Sitemap routes differ from indexable pages'
print(f'{len(pages)} routes: static metadata, JSON-LD, image assets, local links and sitemap verified.')
