#!/usr/bin/env python3
import json, pathlib, subprocess, sys, ast
ROOT=pathlib.Path(__file__).resolve().parents[2];assert ROOT.name=='Map demo'
checks=[]
def check(name,ok):checks.append((name,bool(ok)))
js=['assets/js/scene/engine.js','assets/js/ux/pixel-truck.js','assets/js/ux/regional-expedition.js']
for f in js:
 proc=subprocess.run(['node','--check',str(ROOT/f)],capture_output=True,text=True)
 check('JS syntax: '+f,proc.returncode==0)
idx=(ROOT/'index.html').read_text()
truck=(ROOT/js[1]).read_text();engine=(ROOT/js[0]).read_text();region=(ROOT/js[2]).read_text()
for name in ['g552','s315','liuan']:
 check('HTML chapter: '+name, 'data-pixel-route="'+name+'"' in idx)
 check('JS route: '+name, name+':' in truck)
check('no fake cross-region node', '待核实的跨区接续' not in truck and 'UNKNOWN=' not in truck)
check('fake connection removed', 'const links=[{pts:' not in engine)
check('OpenStreetMap genuine road rendering conditional',"status!=='osm-odbl'" in engine)
check('OSM road tags rendered','road.ref||road.name' in engine)
check('three distinct road categories',all(k in engine for k in ['motorway','primary','secondary']))
check('source truth update', 'roadLayerStatus' in region)
check('no fake highways when empty','if(!roads||roads.status!==' in engine)
check('region legend exists','id="roadLegend"' in idx)
check('terrain declared illustrative','Deliberately illustrative relief (not DEM)' in engine)
check('styles connected','assets/css/v14-transport.css' in idx)
check('pixel marker click handler','openPlace(p)' in truck)
check('no dead SDK dependency for road rendering', 'NS.OpenRoads' in engine)
check('pixel road is standalone stage','跨区接续待核实' not in idx)
check('road import entrypoints',all((ROOT/f).exists() for f in ['tools/导入贵州开放路网.py','获取真实道路并打包_Windows.bat','获取真实道路并打包_macOS_Linux.sh']))
# Importer parses a miniature synthetic fixture in memory; never ships mock roads.
sys.path.insert(0,str(ROOT/'tools'))
import importlib.util
spec=importlib.util.spec_from_file_location('local_roads',ROOT/'tools/导入贵州开放路网.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
lines=[]
mod.add(lines,{'highway':'primary','name':'测试用线段'},{'type':'LineString','coordinates':[[106.2,25.65],[106.3,25.66]]},'test')
check('GeoJSON road parser accepts real coordinate shape',len(lines)==1 and lines[0]['highway']=='primary')
mod.add(lines,{'highway':'footway'},{'type':'LineString','coordinates':[[106.2,25.65],[106.3,25.66]]},'walk')
check('vehicle road importer excludes footpaths',len(lines)==1)
check('empty real-road placeholder remains honest', 'status:"missing"' in (ROOT/'assets/data/offline_roads.js').read_text())
check('source metadata cites ODbL','ODbL' in (ROOT/'assets/data/regional_transport_sources.json').read_text())
check('pixel map has no made-up cross-region route', 'The intervening area intentionally has NO road line' in truck)
report={'version':'V14','method':'static source tests and synthetic in-memory import geometry; NOT live GIS acquisition/browser UI test','checks':len(checks),'passed':sum(v for _,v in checks),'results':[{'test':n,'pass':v} for n,v in checks]}
p=ROOT/'qa/v14/validation.json';p.write_text(json.dumps(report,ensure_ascii=False,indent=2))
for n,v in checks:print(('PASS' if v else 'FAIL'),n)
if report['passed']!=report['checks']:sys.exit(1)
