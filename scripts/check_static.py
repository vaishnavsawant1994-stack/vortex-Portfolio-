#!/usr/bin/env python3
"""Dependency-free integrity checks for tracked public portfolio assets."""
from pathlib import Path
from html.parser import HTMLParser
import re

ROOT=Path(__file__).resolve().parents[1]
class Refs(HTMLParser):
    refs=[]
    def handle_starttag(self, tag, attrs):
        props=dict(attrs)
        for field in (('href',) if tag=='link' else ('src','srcset') if tag in ('img','script','source') else ()):
            val=props.get(field,'')
            for entry in val.split(',') if field=='srcset' else (val,):
                target=entry.strip().split(' ')[0]
                if target and not target.startswith(('https://','http://','data:','#','//')):
                    self.refs.append((tag,target))

checker=Refs()
checker.feed((ROOT/'index.html').read_text(encoding='utf-8'))
missing=[f'{tag} => {ref}' for tag,ref in checker.refs if not (ROOT/ref).is_file()]
for path in ['site.css','site.js','site-config.js','netlify.toml','netlify/functions/contact.mjs']:
    if not (ROOT/path).is_file(): missing.append(path)
config=(ROOT/'site-config.js').read_text(encoding='utf-8')
if not re.search(r"contactEndpoint:\s*''",config):
    missing.append('site-config.js: contactEndpoint must be disabled until configured')
for folder in ['assets','docs']:
    if not (ROOT/folder).is_dir():missing.append(folder)
if missing:
    raise SystemExit('FAIL:\n'+'\n'.join(missing))
print(f'PASS: {len(checker.refs)} HTML asset refs, configuration, documentation and contact disabled by default')
