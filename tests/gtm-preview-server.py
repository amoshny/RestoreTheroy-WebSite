"""Local-only GTM Preview QA. No live forms or Ads conversion delivery.
Run from the repository root; connect Tag Assistant to http://127.0.0.1:8001/.
The draft GTM container is real; form acknowledgement is a clearly isolated stub.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json
from urllib.parse import urlsplit
ROOT = Path(__file__).resolve().parents[1]
CSP = "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://tagassistant.google.com https://tagmanager.google.com; connect-src 'self' https://www.googletagmanager.com https://tagassistant.google.com https://tagmanager.google.com; img-src 'self' data: https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://www.googletagmanager.com https://tagassistant.google.com; report-uri /__qa/csp"
SHIM = """// Local QA transport only; never included in published files.
const rtQAFetch=window.fetch.bind(window);
window.fetch=(url,options)=>rtQAFetch(String(url).startsWith('https://formsubmit.co/ajax/')?'/__qa/form':url,options);
"""
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs): super().__init__(*args, directory=str(ROOT), **kwargs)
    def end_headers(self):
        self.send_header('Content-Security-Policy', CSP)
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def do_GET(self):
        name = urlsplit(self.path).path
        if any(part.startswith('.') for part in Path(name).parts):
            self.send_error(404); return
        if name == '/tracking-config.js':
            body = (ROOT / 'tracking-config.js').read_text().replace('gtmEnabled: false', 'gtmEnabled: true').encode()
            self.send_response(200); self.send_header('Content-Type', 'application/javascript'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        if name == '/quote-request.js':
            body = (SHIM + (ROOT / 'quote-request.js').read_text()).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/javascript'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        super().do_GET()
    def do_POST(self):
        size = min(int(self.headers.get('Content-Length', '0')), 65000)
        try: data = json.loads(self.rfile.read(size))
        except Exception: self.send_error(400); return
        name = urlsplit(self.path).path
        if name == '/__qa/csp':
            host = urlsplit(data.get('csp-report', {}).get('blocked-uri', '')).netloc
            if host: print('QA blocked external host:', host, flush=True)
            self.send_response(204); self.end_headers(); return
        if name != '/__qa/form' or not str(data.get('customerName', '')).startswith('RT GTM QA') or data.get('phone') != '8585550101':
            self.send_error(400, 'Technical fixtures only'); return
        print('QA acknowledged local fixture; no email or Ads submission', flush=True)
        body = b'{"success":true,"message":"Local QA acknowledgement only"}'
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
    def log_message(self, format, *args): pass # Preview URLs may contain transient debug credentials.
print('Isolated GTM QA: http://127.0.0.1:8001 (real draft, local acknowledgement, Ads blocked)', flush=True)
ThreadingHTTPServer(('127.0.0.1', 8001), Handler).serve_forever()
