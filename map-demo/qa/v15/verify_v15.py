"""V15 source and ingestion checks. No synthetic road asset is left in the bundle."""
from pathlib import Path
import subprocess,sys,json,re,tempfile
root=Path(__file__).resolve().parents[2]
index=(root/'index.html').read_text('utf-8')
app=(root/'assets/js/app.js').read_text('utf-8')
eng=(root/'assets/js/scene/engine.js').read_text('utf-8')
pixel=(root/'assets/js/ux/pixel-truck.js').read_text('utf-8')
roads=(root/'assets/data/offline_roads.js').read_text('utf-8')
checks={
 'default landing bridge': "this.setSite('huajiang',false)" in app,
 'no auto welcome guide': 'NS.Journey?.firstVisit()' not in app.split('init(){',1)[1].split('},',1)[0],
 'post opening date': 'timeline:.99' in app,
 'intro hidden': 'id="prologue" class="prologue" aria-label="项目序章" hidden' in index,
 'pixel transfer actionable': 'id="pixelTransfer"' in index and 'Pixel.transfer()' in pixel,
 'transfer explicitly not road': '不是实际交通路线' in pixel or '不是真实道路' in pixel,
 'overview fallback': 'renderIllustrativeLocalRoads' in eng,
 'rail only when source available': 'data.railways||[]' in eng,
 'import labels railways': 'RAIL={' in (root/'tools/导入贵州开放路网.py').read_text('utf-8'),
 'not shipped invented OSM': 'status:"missing"' in roads and 'lines:[]' in roads,
 'no remote runtime roads': 'fetch(' not in eng,
}
for js in [root/'assets/js/app.js',root/'assets/js/scene/engine.js',root/'assets/js/ux/pixel-truck.js']:
 cp=subprocess.run(['node','--check',str(js)],text=True,capture_output=True)
 checks['js syntax '+js.name]=cp.returncode==0
importer=root/'tools/导入贵州开放路网.py'
cp=subprocess.run([sys.executable,'-m','py_compile',str(importer)],capture_output=True,text=True)
checks['python importer syntax']=cp.returncode==0
# Validate the importer supports BOTH kinds without shipping test content.
with tempfile.TemporaryDirectory() as t:
 code='import importlib.util,sys,json;from pathlib import Path;spec=importlib.util.spec_from_file_location("imp",sys.argv[1]);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod); lines=mod.ingest_geojson(Path(sys.argv[2]));print(json.dumps({"roads":sum(bool(x["highway"]) for x in lines),"rails":sum(bool(x["railway"]) for x in lines)}))'
 proc=subprocess.run([sys.executable,'-c',code,str(importer),str(Path(__file__).parent/'synthetic_transport_fixture.geojson')],capture_output=True,text=True)
 checks['fixture parser road and rail']=proc.returncode==0 and json.loads(proc.stdout)=={'roads':1,'rails':1}
print(json.dumps(checks,ensure_ascii=False,indent=2))
if not all(checks.values()): sys.exit('V15 checks failed')
