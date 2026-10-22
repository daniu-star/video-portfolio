PRAGMA foreign_keys=OFF;
CREATE TABLE metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE sources(id TEXT PRIMARY KEY, authority TEXT, published_at TEXT, url TEXT, confidence TEXT, supports TEXT);
CREATE TABLE sites(id TEXT PRIMARY KEY, name TEXT, lon REAL, lat REAL, scene_type TEXT, geometry_quality TEXT, description TEXT, source_id TEXT);
CREATE TABLE metrics(id TEXT PRIMARY KEY, site_id TEXT, label TEXT, value REAL, operator TEXT, unit TEXT, period_label TEXT, source_id TEXT, note TEXT);
CREATE TABLE nodes(id TEXT PRIMARY KEY, site_id TEXT, name TEXT, category TEXT, scene_x REAL, scene_y REAL, scene_z REAL, lon REAL, lat REAL, geometry_quality TEXT, data_status TEXT, source_id TEXT, detail TEXT);
CREATE TABLE node_legends(node_id TEXT PRIMARY KEY, built_label TEXT, open_label TEXT, flow_label TEXT, flow_value TEXT, flow_period TEXT, source_id TEXT, note TEXT, identity_label TEXT, identity_value TEXT, scale_label TEXT, scale_value TEXT, context_label TEXT, context_value TEXT, relation_label TEXT, relation_value TEXT);
CREATE TABLE districts(id TEXT PRIMARY KEY, site_id TEXT, name TEXT, district_type TEXT, center_x REAL, center_y REAL, center_z REAL, radius REAL, data_status TEXT, source_id TEXT, detail TEXT);
CREATE TABLE building_instances(id TEXT PRIMARY KEY, site_id TEXT, district_id TEXT, node_id TEXT, name TEXT, building_type TEXT, scene_x REAL, scene_y REAL, scene_z REAL, width REAL, depth REAL, height REAL, rotation REAL, floors INTEGER, roof_type TEXT, facade_style TEXT, build_year INTEGER, phase_start REAL, data_status TEXT, source_id TEXT, detail TEXT, placement_basis TEXT, realism_grade TEXT);
CREATE TABLE roads(id TEXT PRIMARY KEY, site_id TEXT, name TEXT, road_class TEXT, width REAL, lane_count INTEGER, speed_kmh REAL, elevation_mode TEXT, phase_start REAL, data_status TEXT, source_id TEXT, description TEXT);
CREATE TABLE road_points(road_id TEXT, seq INTEGER, scene_x REAL, scene_y REAL, scene_z REAL, lon REAL, lat REAL, PRIMARY KEY(road_id,seq));
CREATE TABLE transport_assets(id TEXT PRIMARY KEY, site_id TEXT, road_id TEXT, asset_type TEXT, scene_x REAL, scene_y REAL, scene_z REAL, rotation REAL, scale REAL, phase_start REAL, data_status TEXT, source_id TEXT, detail TEXT);
CREATE TABLE relations(id TEXT PRIMARY KEY, site_id TEXT, from_node TEXT, to_node TEXT, relation_type TEXT, data_status TEXT, weight REAL, label TEXT);
CREATE TABLE story_chapters(id TEXT PRIMARY KEY, seq INTEGER, site_id TEXT, title TEXT, subtitle TEXT, camera_json TEXT, action_json TEXT);
CREATE TABLE structures(id TEXT PRIMARY KEY, site_id TEXT, name TEXT, structure_type TEXT, data_status TEXT, source_id TEXT, params_json TEXT, detail TEXT);
CREATE TABLE terrain_samples(site_id TEXT, gx INTEGER, gz INTEGER, scene_x REAL, scene_z REAL, elevation REAL, data_status TEXT, PRIMARY KEY(site_id,gx,gz));
CREATE TABLE timeline_states(id TEXT PRIMARY KEY, site_id TEXT, t REAL, year_label TEXT, title TEXT, subtitle TEXT, infrastructure REAL, roads REAL, buildings REAL, flow REAL, atmosphere REAL, source_id TEXT);
CREATE TABLE themes(id TEXT PRIMARY KEY, name TEXT, subtitle TEXT, gradient_json TEXT, palette_json TEXT);
CREATE INDEX idx_buildings_site ON building_instances(site_id);
CREATE INDEX idx_buildings_district ON building_instances(district_id);
CREATE INDEX idx_assets_site ON transport_assets(site_id);
CREATE INDEX idx_nodes_site ON nodes(site_id);
CREATE INDEX idx_roads_site ON roads(site_id);
-- V7 stage 1: object registry and approved publication assets.
CREATE TABLE IF NOT EXISTS spatial_features (
 id TEXT PRIMARY KEY, object_type TEXT NOT NULL CHECK(object_type IN ('building','road','district','node')),
 object_id TEXT NOT NULL, site_id TEXT NOT NULL, display_name TEXT NOT NULL,
 precision_status TEXT NOT NULL, interaction_type TEXT NOT NULL,
 source_id TEXT, note TEXT, UNIQUE(object_type,object_id));
CREATE INDEX IF NOT EXISTS idx_features_site ON spatial_features(site_id);
CREATE TABLE IF NOT EXISTS media_assets (
 id TEXT PRIMARY KEY, relative_path TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL, rights_holder TEXT NOT NULL,
 license_status TEXT NOT NULL CHECK(license_status IN ('authorized','rejected','pending')),
 permitted_uses TEXT NOT NULL, credit_text TEXT NOT NULL,
 capture_date TEXT NOT NULL, subject_lon REAL, subject_lat REAL,
 camera_lon REAL, camera_lat REAL, camera_heading_deg REAL,
 evidence_scope TEXT NOT NULL CHECK(evidence_scope IN ('exact_building','district','site','road','landmark')),
 release_status TEXT NOT NULL CHECK(release_status IN ('approved','draft','revoked')),
 privacy_review TEXT NOT NULL CHECK(privacy_review IN ('passed','pending','failed')),
 sha256 TEXT NOT NULL, evidence_note TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS media_bindings (
 asset_id TEXT NOT NULL REFERENCES media_assets(id), feature_id TEXT NOT NULL REFERENCES spatial_features(id),
 binding_scope TEXT NOT NULL CHECK(binding_scope IN ('exact_subject','area_context')),
 review_status TEXT NOT NULL CHECK(review_status IN ('approved','pending','rejected')),
 reviewer_note TEXT NOT NULL, PRIMARY KEY(asset_id,feature_id)
);
CREATE INDEX IF NOT EXISTS idx_media_feature ON media_bindings(feature_id);
