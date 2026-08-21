#!/usr/bin/env python3
"""Search images for brands and health concerns, output as JSON."""
import subprocess
import json
import sys
import time

BRANDS = [
    ("Himalaya", "Himalaya wellness pharmacy brand logo"),
    ("Horlicks", "Horlicks malted milk drink brand logo"),
    ("Dabur", "Dabur ayurvedic brand logo"),
    ("Dr. Morepen", "Dr Morepen medical brand logo"),
    ("MB", "MB nutrition supplements brand logo"),
    ("Bourn Vita", "Bournvita chocolate malt drink brand logo"),
    ("mamaearth", "Mamaearth natural skincare brand logo"),
    ("JIVA", "Jiva Ayurveda brand logo"),
    ("HealthKart", "HealthKart nutrition supplements brand logo"),
]

HEALTH_CONCERNS = [
    ("Diabetes care", "diabetes blood sugar care health medical"),
    ("Cardiac care", "heart cardiac care health medical"),
    ("Pain relief", "pain relief muscle joint health"),
    ("Kidney care", "kidney care health medical organ"),
    ("Muscle care", "muscle fitness care health strength"),
    ("Liver care", "liver care health medical organ"),
    ("Respiratory care", "respiratory lungs breathing care health"),
    ("Eye care", "eye care vision health medical"),
    ("Mental Wellness", "mental wellness brain health meditation"),
]

def search(query):
    try:
        result = subprocess.run(
            ["z-ai", "image-search", "-q", query, "--count", "1", "--no-rank"],
            capture_output=True, text=True, timeout=120
        )
        output = result.stdout
        # Find JSON in output
        start = output.find('{')
        if start == -1:
            return None
        end = output.rfind('}') + 1
        json_str = output[start:end]
        data = json.loads(json_str)
        if data.get('results') and len(data['results']) > 0:
            return data['results'][0]['original_url']
    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)
    return None

print("=== BRANDS ===")
brand_results = {}
for name, query in BRANDS:
    print(f"Searching: {name}...", file=sys.stderr)
    url = search(query)
    brand_results[name] = url
    print(f'    "{name}": "{url}",')
    time.sleep(1)

print("\n=== HEALTH CONCERNS ===")
hc_results = {}
for name, query in HEALTH_CONCERNS:
    print(f"Searching: {name}...", file=sys.stderr)
    url = search(query)
    hc_results[name] = url
    print(f'    "{name}": "{url}",')
    time.sleep(1)

print("\n=== SUMMARY ===", file=sys.stderr)
print("BRANDS:", file=sys.stderr)
for k, v in brand_results.items():
    print(f"  {k}: {v}", file=sys.stderr)
print("HEALTH CONCERNS:", file=sys.stderr)
for k, v in hc_results.items():
    print(f"  {k}: {v}", file=sys.stderr)
