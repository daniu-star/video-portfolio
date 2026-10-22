"""Publish media only with verifiable rights and scoped feature bindings.
The JSON manifest is durable across SQLite rebuilds; unreviewed source files
must never live within the public /assets tree.
"""
from pathlib import Path
import json,hashlib,re
ALLOWED_USE='public_web'
PATH=re.compile(r'^assets/media/approved/[a-zA-Z0-9_/-]+\.(?:webp|avif|png|jpe?g)$',re.I)
FIELDS=('id','relative_path','title','rights_holder','license_status','permitted_uses','credit_text',
        'capture_date','subject_lon','subject_lat','camera_lon','camera_lat','camera_heading_deg',
        'evidence_scope','release_status','privacy_review','sha256','evidence_note')

def populate(conn,root:Path):
    manifest=json.loads((root/'database/media_manifest.json').read_text(encoding='utf-8'))
    assert manifest.get('version')=='V7-P1'
    for m in manifest['approved_media']:
        for field in FIELDS:
            if field not in m: raise ValueError('Media '+m.get('id','?')+' missing: '+field)
        if (m['license_status'],m['release_status'],m['privacy_review'])!=('authorized','approved','passed'):
            raise ValueError('Cannot publish unreviewed media '+m['id'])
        if ALLOWED_USE not in m['permitted_uses'].split(','):raise ValueError('No public-web permission '+m['id'])
        if not all(m[x] for x in ['rights_holder','credit_text','capture_date','title']):
            raise ValueError('Incomplete rights/credit '+m['id'])
        if not PATH.fullmatch(m['relative_path']):raise ValueError('Invalid approved media path '+m['id'])
        asset=(root/m['relative_path']).resolve()
        if not asset.is_relative_to((root/'assets/media/approved').resolve()) or not asset.is_file():
            raise ValueError('Approved asset missing or invalid '+m['id'])
        if hashlib.sha256(asset.read_bytes()).hexdigest().lower()!=m['sha256'].lower():
            raise ValueError('Media hash mismatch '+m['id'])
        conn.execute('INSERT INTO media_assets ('+','.join(FIELDS)+') VALUES ('+','.join('?' for _ in FIELDS)+')',
                     [m[k] for k in FIELDS])
        for bind in m.get('bindings',[]):
            f=conn.execute('SELECT object_type,precision_status FROM spatial_features WHERE id=?',(bind['feature_id'],)).fetchone()
            if not f:raise ValueError('Binding feature not found '+bind['feature_id'])
            if bind['review_status']!='approved' or not bind['reviewer_note'].strip():
                raise ValueError('Binding not reviewed '+m['id'])
            if bind['binding_scope']=='exact_subject' and f[0]=='building' and f[1]!='verified_building':
                raise ValueError('Cannot bind exact building photo to simulated feature '+bind['feature_id'])
            if bind['binding_scope']=='exact_subject' and m['evidence_scope']=='district':
                raise ValueError('District-context photo cannot be exact subject')
            conn.execute('INSERT INTO media_bindings (asset_id,feature_id,binding_scope,review_status,reviewer_note) VALUES (?,?,?,?,?)',
                         (m['id'],bind['feature_id'],bind['binding_scope'],bind['review_status'],bind['reviewer_note']))
    return len(manifest['approved_media'])
