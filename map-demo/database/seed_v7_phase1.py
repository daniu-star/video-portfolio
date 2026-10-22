"""Generate a stable, honest spatial interaction registry from V6 records."""
def populate(conn):
    rows = []
    for bid,site,name,source in conn.execute('SELECT id,site_id,name,source_id FROM building_instances'):
        rows.append((f'building:{bid}','building',bid,site,name or '示意建筑',
                     'simulated_geometry','building_preview',source,
                     '程序化体块；尚无经核验的单栋地理对应关系，不属于实拍建筑。'))
    for rid,site,name,source in conn.execute('SELECT id,site_id,name,source_id FROM roads'):
        rows.append((f'road:{rid}','road',rid,site,name,
                     'simulated_alignment','road_context',source,
                     '示意道路控制点；未核验导航拓扑、实际路面高程或驾车可达性。'))
    for did,site,name,source in conn.execute('SELECT id,site_id,name,source_id FROM districts'):
        rows.append((f'district:{did}','district',did,site,name,
                     'approximate_area','district_preview',source,
                     '片区范围参考模型；不能代表某栋建筑的真实位置。'))
    for nid,site,name,source,quality in conn.execute('SELECT id,site_id,name,source_id,geometry_quality FROM nodes'):
        rows.append((f'node:{nid}','node',nid,site,name,
                     'source_node:'+str(quality),'node_dossier',source,
                     '地标/专题节点；几何精度由原始节点字段界定。'))
    conn.executemany('''INSERT OR REPLACE INTO spatial_features
      (id,object_type,object_id,site_id,display_name,precision_status,interaction_type,source_id,note)
      VALUES (?,?,?,?,?,?,?,?,?)''', rows)
    return len(rows)
