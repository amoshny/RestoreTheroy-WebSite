"""Sync crawlable starting prices in the HTML from pricing.js."""
import argparse
import json
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--check", action="store_true", help="Check for stale prices without writing")
args = parser.parse_args()
source = (root / "pricing.js").read_text()
data = json.loads(source.split("const rtPricing = ", 1)[1].split(";\n", 1)[0])
price = re.compile(r'(<(?:strong|span) data-starting-price="([^"]+)">)\$\d+(</(?:strong|span)>)')
time = re.compile(r'(<span data-service-time="([^"]+)">)[^<]+(</span>)')
schema = re.compile(r'(<script type="application/ld\+json" data-service-schema="([^"]+)">).*?(</script>)', re.S)
changed = []
pages = ("index.html", "interior-detailing/index.html", "essential-detail/index.html",
         "deep-clean-protect/index.html", "full-detail-polish/index.html")
for filename in pages:
    page = root / filename
    old = page.read_text()
    new = price.sub(lambda m: f"{m[1]}${data['services'][m[2]]['base']}{m[3]}", old)
    new = time.sub(lambda m: f"{m[1]}{data['services'][m[2]]['time']}{m[3]}", new)

    def render_schema(match):
        service = data["services"][match[2]]
        url = "https://restoretheory.net/" + filename.removesuffix("index.html")
        output = {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": service["name"],
            "serviceType": "Mobile auto detailing",
            "url": url,
            "provider": {"@type": "Organization", "name": "Restore Theory", "url": "https://restoretheory.net/"},
            "areaServed": "San Diego, California service area",
            "offers": {"@type": "Offer", "url": url, "priceSpecification": {
                "@type": "UnitPriceSpecification", "minPrice": service["base"], "priceCurrency": "USD",
                "description": "Starting price for a standard sedan. Final quote depends on vehicle size and condition."
            }},
        }
        return match[1] + "\n    " + json.dumps(output, ensure_ascii=False) + "\n    " + match[3]

    new = schema.sub(render_schema, new)
    if new != old:
        changed.append(filename)
        if not args.check:
            page.write_text(new)
if args.check and changed:
    parser.error("stale prices in " + ", ".join(changed))
print("Static package prices match pricing.js." if not changed else "Updated " + ", ".join(changed))
