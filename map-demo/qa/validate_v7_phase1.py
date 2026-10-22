"""V7 stage 1 structural + publication guard test, no external dependencies."""
from pathlib import Path
import sqlite3,json,hashlib,base64,tempfile,sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'database'))
from media_pipeline import populate
DB=ROOT/'database/spatial_demo.db'
con=sqlite3.connect(DB)
counts={table:con.execute('SELECT count(*) FROM '+table).fetchone()[0] for table in ['building_instances','roads','nodes','districts','spatial_features','media_assets','media_bindings']}
assert counts['spatial_features']==counts['building_instances']+counts['roads']+counts['nodes']+counts['districts'],counts
assert con.execute('SELECT count(*) FROM spatial_features f LEFT JOIN building_instances b ON b.id=f.object_id WHERE f.object_type="building" AND b.id IS NULL').fetchone()[0]==0
assert con.execute('SELECT count(*) FROM spatial_features WHERE object_type="building" AND precision_status!="simulated_geometry"').fetchone()[0]==0
assert counts['media_assets']==counts['media_bindings']==0,'Bundled photos require approval; V6 source had none'
assert con.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
manifest=json.loads((ROOT/'database/media_manifest.json').read_text())
assert manifest['approved_media']==[]
# Media pipeline permission and scope tests in a disposable copy of database.
with tempfile.TemporaryDirectory() as td:
    temp=Path(td); (temp/'database').mkdir(); (temp/'assets/media/approved').mkdir(parents=True)
    png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==')
    (temp/'assets/media/approved/fixture.png').write_bytes(png)
    approved={
      'id':'fixture-1','relative_path':'assets/media/approved/fixture.png','title':'QA synthetic fixture',
      'rights_holder':'QA fixture','license_status':'authorized','permitted_uses':'public_web',
      'credit_text':'QA synthetic fixture','capture_date':'unknown','subject_lon':None,'subject_lat':None,
      'camera_lon':None,'camera_lat':None,'camera_heading_deg':None,'evidence_scope':'district',
      'release_status':'approved','privacy_review':'passed','sha256':hashlib.sha256(png).hexdigest(),
      'evidence_note':'synthetic QA only, not an actual site photograph',
      'bindings':[{'feature_id':'district:hj_yundu','binding_scope':'area_context','review_status':'approved','reviewer_note':'fixture verifies district context only'}]
    }
    def check_fixture(data,expected):
        (temp/'database/media_manifest.json').write_text(json.dumps({'version':'V7-P1','approved_media':[data]}))
        target=sqlite3.connect(':memory:');con.backup(target)
        try:
            n=populate(target,temp)
            if not expected:raise AssertionError('Rejected fixture was accepted')
            assert n==1
        except ValueError:
            if expected:raise
        finally:target.close()
    # Ensure the expected district actually exists.
    district=con.execute('SELECT id FROM districts WHERE id="hj_yundu"').fetchone()
    if district:
        check_fixture(approved,True)
        bad={**approved,'bindings':[{'feature_id':'building:b_yundu_main','binding_scope':'exact_subject','review_status':'approved','reviewer_note':'bad exact binding to simulated building'}]}
        try:
            check_fixture(bad,False)
        except Exception as exc:
            raise AssertionError('Expected refused building binding') from exc
        bad_rights={**approved,'license_status':'pending'}
        check_fixture(bad_rights,False)
        bad_hash={**approved,'sha256':'0'*64}
        check_fixture(bad_hash,False)
    else:raise AssertionError('QA district fixture missing')
con.close()
files=['assets/js/app.js','assets/js/ui/feature-panel.js','assets/js/scene/engine.js','assets/css/interactive-v7.css']
assert all((ROOT/f).exists() for f in files)
print(json.dumps({'status':'V7 STAGE 1 VALID','counts':counts,'unapproved_media_exposed':0,'media_validation':'positive + 3 negative fixtures passed'},ensure_ascii=False,indent=2))
