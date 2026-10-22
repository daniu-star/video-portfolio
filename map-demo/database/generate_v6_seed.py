from pathlib import Path
import json, math, random
ROOT=Path(__file__).resolve().parents[1]
SEED=ROOT/'database/seed_data.json'
base=json.loads(SEED.read_text(encoding='utf-8'))
rng=random.Random(26082260)

# ---------- helpers ----------
def upsert_source(id,authority,date,url,confidence,supports):
    return dict(id=id,authority=authority,published_at=date,url=url,confidence=confidence,supports=supports)

def terrain_fast(x,z):
    r=math.hypot(x,z)
    bowl=140+0.000018*r*r
    karst=155*(math.sin(x*.00155)**2+math.cos(z*.00175)**2)+70*math.sin((x-z)*.0021)**2
    depression=-360*math.exp(-(r/650)**2)
    noise=30*math.sin(x*.0043+.7)*math.cos(z*.0039-.49)+16*math.sin((x+z)*.0077+1.19)+8*math.cos((x-z)*.012)
    return bowl+karst+depression+noise

def terrain_hj(x,z):
    noise=32*math.sin(x*.0063+1.4)*math.cos(z*.0054-.98)+17*math.sin((x+z)*.011+2.38)+8*math.cos((x-z)*.018)
    canyon=-650*math.exp(-(x/430)**2)+0.000052*z*z
    walls=520+210*math.sin((z+500)*.0015)**2+110*math.sin(x*.0038+z*.0012)**2
    shelf=85*math.tanh((abs(x)-720)/230)
    return walls+canyon+shelf+noise

def sample_polyline(pts,q):
    if len(pts)<2:return pts[0][0],pts[0][1],pts[0][2],0.0
    seg=[]; total=0
    for a,b in zip(pts,pts[1:]):
        d=math.hypot(b[0]-a[0],b[2]-a[2]); seg.append(d); total+=d
    target=max(0,min(1,q))*total; acc=0
    for i,d in enumerate(seg):
        if acc+d>=target or i==len(seg)-1:
            t=0 if d==0 else (target-acc)/d; a,b=pts[i],pts[i+1]
            x=a[0]+(b[0]-a[0])*t; y=a[1]+(b[1]-a[1])*t; z=a[2]+(b[2]-a[2])*t
            ang=math.atan2(b[2]-a[2],b[0]-a[0])
            return x,y,z,ang
        acc+=d
    return (*pts[-1],0.0)

def offset_from_line(x,z,ang,off):
    return x-math.sin(ang)*off,z+math.cos(ang)*off

# ---------- metadata / sources ----------
base['metadata']=[
    {'key':'version','value':'6.0.0'},
    {'key':'generated_at','value':'2026-08-22'},
    {'key':'data_model','value':'verified public facts + aerial/reference-constrained simulated geography + road-aligned mass 3D modeling'},
    {'key':'coordinate_note','value':'FAST core and bridge use public anchors. Detailed buildings remain SIMULATED but are constrained by official aerial imagery, planning relationships, road alignment and terrain; they never claim cadastral/survey accuracy.'},
    {'key':'timeline_contract','value':'Every slider input changes infrastructure completeness, roads, buildings, traffic/visitor flow, construction state and atmosphere, with a temporal wave cue.'},
    {'key':'selection_contract','value':'selected node is the single source of truth for inspector + dossier; every selection change rerenders a unique node dossier.'},
]
S={x['id']:x for x in base.get('sources',[])}
extra=[
 upsert_source('SRC_FAST_AERIAL_20250710','中国天眼景区官网/新华社','2025-07-10','https://www.zgtianyan.com/dongtai/216.html','A','天文小镇无人机航拍：中央公共建筑、时空塔、天幕街、东侧红顶居住片区与道路关系；用于非测绘级形态约束'),
 upsert_source('SRC_FAST_MASTERPLAN_2025','平塘县人民政府','2025-06-11','https://www.gzpt.gov.cn/IGI/upload/file/2025/06/11/U020250611624825678299.pdf','A','中国天眼景区总体规划（2024-2035）：景区内部道路、停车换乘、天文小镇—观景台连接关系'),
 upsert_source('SRC_XH_CCTV_20251130','央视网','2025-11-30','https://news.cctv.com/2025/11/30/ARTIMpief8cKAIZGtoEj3Tlu251130.shtml','B','小花江村102户、400多人，峡谷深处布依族村寨、窄村道与坡地聚落形态'),
 upsert_source('SRC_XH_PEOPLE_20260214','人民日报','2026-02-14','https://gz.people.com.cn/n2/2026/0214/c194831-41502968.html','B','小花江村102户；16家民宿、5家农家乐、14家民宿在建；国庆中秋平均每天接待游客超2000人次'),
 upsert_source('SRC_XH_PEOPLE_20260622','人民日报海外版/中新网','2026-06-22','https://www.chinanews.com.cn/cj/2026/06-22/10644718.shtml','B','小花江村16家民宿开业、14家在建、5家特色餐饮，40多名村民返乡创业'),
 upsert_source('SRC_KELI_HOLIDAY_20251010','中国日报网','2025-10-10','https://cn.chinadaily.com.cn/a/202510/10/WS68e8d84aa310c4deea5ebb5a.html','B','科力寨2025国庆10月1日单日进入车辆突破1万辆；假期累计车辆近7万辆、游客近20万人次'),
 upsert_source('SRC_HJ_AERIAL_XINHUA_20250608','新华网','2025-06-08','https://gz.news.cn/20250608/dbb5d0619f024487b40576774c01bae0/c.html','B','桥址周边聚落与山地道路航拍形态参考，用于非测绘级村寨布局约束'),
]
for x in extra:S[x['id']]=x
base['sources']=list(S.values())

# ---------- nodes ----------
nodes={x['id']:x for x in base.get('nodes',[])}
def node(id,site,name,category,x,y,z,src,detail,status='SIMULATED',lon=None,lat=None,gq='none'):
    nodes[id]=dict(id=id,site_id=site,name=name,category=category,scene_x=round(x,2),scene_y=round(y,2),scene_z=round(z,2),lon=lon,lat=lat,geometry_quality=gq,data_status=status,source_id=src,detail=detail)

# FAST: town is placed ~6 km from FAST core, matching official straight-line relationship.
TX,TZ=4700,3400
node('fast_core','fast','FAST 500m反射面','science',0,-35,0,'SRC_FAST_QUIET_RULE','500米口径球面射电望远镜核心科学设施','VERIFIED',106.855556,25.652778,'official_coordinate')
node('fast_view','fast','中国天眼观景台','viewing',380,240,320,'SRC_FAST_SCENIC','面向FAST核心洼地的观景节点')
node('fast_entry','fast','核心区访客检查节点','control',720,190,630,'SRC_FAST_QUIET_RULE','进入FAST核心参观区域前的设备寄存/检查逻辑节点')
# local aerial-constrained town layout
fast_local={
 'fast_town':('平塘天文小镇','tourism_cluster',80,0,'SRC_FAST_AERIAL_20250710','官方航拍所示天文主题城镇核心'),
 'fast_central_plaza':('中轴迎宾广场','plaza',-40,-620,'SRC_FAST_AERIAL_20250710','航拍可见中央迎宾与圆形公共空间'),
 'fast_museum':('平塘国际天文体验馆','museum',120,-300,'SRC_FAST_FACILITIES_2025','天文体验馆核心公共建筑'),
 'fast_visitor_center':('游客服务中心','visitor_center',-420,-400,'SRC_FAST_MASTERPLAN_2025','景区接待与换乘核心'),
 'fast_time_tower':('天文时空塔','landmark',-520,720,'SRC_FAST_FACILITIES_2025','官方地标建筑，高99.999米'),
 'fast_sky_street':('天幕商业街','commercial',-260,300,'SRC_FAST_SKY_STREET','位于天文小镇景观中轴线上，长450米'),
 'fast_star_hotel':('星辰天缘大酒店','hotel',-620,-80,'SRC_FAST_HOTEL','2016年开业，202间客房'),
 'fast_welcome_hotel':('中国天眼迎宾馆','hotel',-820,120,'SRC_FAST_SCENIC','天文小镇酒店配套'),
 'fast_dome_cinema':('球幕飞行影院','cinema',260,300,'SRC_FAST_SCENIC','球幕飞行体验'),
 'fast_space_hall':('航天馆','museum',360,-80,'SRC_FAST_SCENIC','航天文化科技体验'),
 'fast_vr_hall':('星游记VR馆','experience',520,160,'SRC_FAST_SCENIC','VR科普体验'),
 'fast_light_hall':('FAST天眼光影馆','experience',720,40,'SRC_FAST_FACILITIES_2025','光影科普体验'),
 'fast_xr_center':('元宇宙XR体验中心','experience',820,-220,'SRC_FAST_SCENIC','XR大空间体验'),
 'fast_physics_lab':('天体物理实验室','education',620,-520,'SRC_FAST_SCENIC','研学实验节点'),
 'fast_galaxy_center':('FAST银河演艺中心','theatre',390,560,'SRC_FAST_SCENIC','演艺体验节点'),
 'fast_karst_park':('喀斯特公园','park',-900,-520,'SRC_FAST_SCENIC','天文小镇生态公园'),
 'fast_time_gate':('时光之门','landmark',-420,-650,'SRC_FAST_SCENIC','景观构筑物'),
 'fast_xingji_home':('星际家园','residential',900,550,'SRC_FAST_AERIAL_20250710','航拍可见东侧高密红顶居住组团'),
 'fast_hanglong_bay':('航龙湾安置区','residential',1250,780,'SRC_FAST_AERIAL_20250710','东侧安置居住片区'),
 'fast_astro_village':('天文时光村安置区','residential',1050,1080,'SRC_FAST_AERIAL_20250710','东/东北侧红顶居住片区'),
 'fast_bus':('景区公交接驳节点','transit',-620,-720,'SRC_FAST_MASTERPLAN_2025','游客中心附近换乘集散关系')
}
for id,(name,cat,lx,lz,src,detail) in fast_local.items():
    y=terrain_fast(TX+lx,TZ+lz)+12
    node(id,'fast',name,cat,TX+lx,y,TZ+lz,src,detail)

# Huajiang: Keli and Xiao Huajiang are separated on opposite canyon banks.
node('bridge_core','huajiang','花江峡谷大桥','bridge',0,640,0,'SRC_HUAJIANG_OFFICIAL_2025','大桥全长2890m、主跨1420m、桥面距水面625m','VERIFIED',105.588056,25.704722,'public_map_anchor')
# east bank: yundu
for id,name,cat,x,z,src,detail in [
 ('yundu','云渡服务区','service_area',1120,650,'SRC_YUNDU_APPROVAL','桥旅核心服务区'),
 ('toll_hj','花江峡谷大桥收费站','toll',1510,760,'SRC_YUNDU_APPROVAL','高速收费与游客分流节点'),
 ('parking_a','停车区 A','parking',1240,900,'SRC_YUNDU_APPROVAL','服务区停车节点'),
 ('parking_b','停车区 B','parking',1420,1040,'SRC_YUNDU_APPROVAL','服务区停车节点'),
 ('shuttle','摆渡/接驳节点','transit',800,470,'SRC_YUNDU_APPROVAL','观景核心区摆渡关系'),
 ('research_base','桥旅研学基地','education',920,760,'SRC_HUAJIANG_TOUR_APPROVAL','工程研学体验节点'),
 ('hj_viewhall','观光服务楼','visitor_center',900,350,'SRC_HUAJIANG_TOURISM','桥旅观光服务'),
 ('hj_hotel','云渡桥旅酒店','hotel',1110,330,'SRC_HUAJIANG_TOURISM','桥旅酒店'),
 ('hj_backup_parking','备用停车场','parking',1430,1210,'SRC_HUAJIANG_TOUR_APPROVAL','备用停车节点'),
 ('hj_charging','新能源充电区','charging',1290,810,'SRC_YUNDU_APPROVAL','新能源充电设施'),
]:
    y=terrain_hj(x,z)+25; node(id,'huajiang',name,cat,x,y,z,src,detail)
# bridge special structures
node('glass_hall','huajiang','主桥检修通道·玻璃大厅','experience',250,655,45,'SRC_HUAJIANG_TOURISM','桥体高空体验空间')
node('hj_elevator','huajiang','207m观光电梯','elevator',655,terrain_hj(655,85)+20,85,'SRC_HUAJIANG_TOUR_APPROVAL','桥旅观光电梯')
node('hj_tower_west','huajiang','西岸主塔','bridge_tower',-710,640,0,'SRC_HUAJIANG_OFFICIAL_2025','西岸主塔')
node('hj_tower_east','huajiang','东岸主塔','bridge_tower',710,640,0,'SRC_HUAJIANG_OFFICIAL_2025','东岸主塔')
node('hj_water_curtain','huajiang','300m水幕秀','experience',0,620,35,'SRC_HJ_WATER_SHOW','桥面中部约300m宽水幕表演')
node('hj_water_reservoir','huajiang','4000m³蓄水池','utility',540,terrain_hj(540,-410)+15,-410,'SRC_HJ_WATER_SHOW','服务区供水及水幕相关设施')
node('hj_river_dock','huajiang','北盘江游船码头示意','dock',-240,-70,980,'SRC_KELI_PEOPLE','水上观桥业态空间示意')
# west bank Keli
for id,name,cat,x,z,src,detail in [
 ('keli_village','科力寨','village',-1700,720,'SRC_KELI_CCTV','花江镇五里村科力寨，25户128人'),
 ('keli_viewpoint','科力寨观景台','viewing',-1190,280,'SRC_KELI_PEOPLE','面向大桥的核心观景节点'),
 ('keli_service_center','科力寨游客服务中心','visitor_center',-1540,630,'SRC_KELI_CCTV','2025年12月报道建设推进中'),
 ('keli_parking','科力寨停车区','parking',-1890,920,'SRC_KELI_HOLIDAY_20251010','国庆高峰承接大量自驾车辆'),
 ('keli_shops','科力寨集装箱商铺','commercial',-1260,360,'SRC_KELI_PEOPLE','观景台附近商业休憩节点'),
]:
    y=terrain_hj(x,z)+22; node(id,'huajiang',name,cat,x,y,z,src,detail)
# east/south bank Xiao Huajiang
for id,name,cat,x,z,src,detail in [
 ('xiaohuajiang_village','小花江村','village',1280,-980,'SRC_XH_CCTV_20251130','布依族村寨，共102户、400多人'),
 ('xh_old_banyan','小花江村古榕树公共空间','landmark',1170,-880,'SRC_XH_CCTV_20251130','村寨中心传统公共活动空间'),
 ('xh_homestay_cluster','小花江民宿集群','hotel',1420,-760,'SRC_XH_PEOPLE_20260622','16家民宿开业、14家民宿在建'),
 ('xh_food_cluster','小花江特色餐饮节点','commercial',1350,-1060,'SRC_XH_PEOPLE_20260622','5家特色餐饮/农家乐公开口径'),
 ('xh_riverfront','小花江沿河观桥节点','viewing',860,-1220,'SRC_XH_PEOPLE_20260622','桥下峡谷与河流观景关系'),
]:
    y=terrain_hj(x,z)+18; node(id,'huajiang',name,cat,x,y,z,src,detail)
base['nodes']=list(nodes.values())

# ---------- districts ----------
base['districts']=[
 {'id':'fast_science_core','site_id':'fast','name':'FAST科研核心区','district_type':'science_core','center_x':0,'center_y':30,'center_z':0,'radius':720,'data_status':'SIMULATED','source_id':'SRC_FAST_QUIET_RULE','detail':'FAST洼地、观景台和受限访问道路'},
 {'id':'fast_town_core','site_id':'fast','name':'平塘天文小镇核心','district_type':'town_center','center_x':TX,'center_y':terrain_fast(TX,TZ),'center_z':TZ,'radius':1500,'data_status':'SIMULATED','source_id':'SRC_FAST_AERIAL_20250710','detail':'依据官方无人机航拍与总体规划关系约束的城镇模型'},
 {'id':'fast_residential_east','site_id':'fast','name':'东侧红顶安置居住片区','district_type':'residential','center_x':TX+1050,'center_y':terrain_fast(TX+1050,TZ+700),'center_z':TZ+700,'radius':1000,'data_status':'SIMULATED','source_id':'SRC_FAST_AERIAL_20250710','detail':'建筑沿弧形道路吸附，不再使用规则网格'},
 {'id':'hj_bridge_core','site_id':'huajiang','name':'花江峡谷大桥桥体核心','district_type':'bridge_core','center_x':0,'center_y':520,'center_z':0,'radius':1800,'data_status':'SIMULATED','source_id':'SRC_HUAJIANG_OFFICIAL_2025','detail':'桥梁、峡谷、主塔及高空体验设施'},
 {'id':'hj_yundu','site_id':'huajiang','name':'云渡服务区','district_type':'service_complex','center_x':1120,'center_y':terrain_hj(1120,650),'center_z':650,'radius':950,'data_status':'SIMULATED','source_id':'SRC_YUNDU_APPROVAL','detail':'依据公开规模、航拍关系及路网约束建模'},
 {'id':'hj_keli','site_id':'huajiang','name':'科力寨片区','district_type':'village','center_x':-1700,'center_y':terrain_hj(-1700,720),'center_z':720,'radius':850,'data_status':'SIMULATED','source_id':'SRC_KELI_CCTV','detail':'25户核心村寨，住宅沿坡地村道吸附'},
 {'id':'hj_xiaohuajiang','site_id':'huajiang','name':'小花江村片区','district_type':'village','center_x':1280,'center_y':terrain_hj(1280,-980),'center_z':-980,'radius':950,'data_status':'SIMULATED','source_id':'SRC_XH_CCTV_20251130','detail':'102户坡地村寨，沿窄村道/河岸道路组织'},
]

# ---------- roads ----------
roads=[]; roadpts=[]
def add_road(id,site,name,klass,width,lanes,speed,phase,srcid,desc,pts,elev='terrain'):
    roads.append(dict(id=id,site_id=site,name=name,road_class=klass,width=width,lane_count=lanes,speed_kmh=speed,elevation_mode=elev,phase_start=phase,data_status='SIMULATED',source_id=srcid,description=desc))
    for i,(x,y,z) in enumerate(pts): roadpts.append(dict(road_id=id,seq=i,scene_x=round(x,2),scene_y=round(y,2),scene_z=round(z,2),lon=None,lat=None))

def road_y_fast(x,z):return terrain_fast(x,z)+9
def road_y_hj(x,z):return terrain_hj(x,z)+12

def lift(pts,fy):return [(x,fy(x,z),z) for x,z in pts]
# FAST road network: aerial/plan constrained topology
fast_spine_xz=[(TX-90,TZ-720),(TX-120,TZ-470),(TX-155,TZ-190),(TX-205,TZ+120),(TX-280,TZ+430),(TX-430,TZ+820)]
fast_ring_xz=[(TX-920,TZ-420),(TX-520,TZ-720),(TX-40,TZ-820),(TX+470,TZ-650),(TX+930,TZ-320),(TX+1120,TZ+150),(TX+1040,TZ+700),(TX+690,TZ+1070),(TX+160,TZ+1240),(TX-390,TZ+1130),(TX-780,TZ+720),(TX-1030,TZ+120),(TX-920,TZ-420)]
res_a=[(TX+430,TZ+160),(TX+700,TZ+330),(TX+980,TZ+520),(TX+1260,TZ+690),(TX+1510,TZ+860)]
res_b=[(TX+410,TZ+360),(TX+680,TZ+540),(TX+940,TZ+730),(TX+1210,TZ+900),(TX+1460,TZ+1060)]
res_c=[(TX+350,TZ+580),(TX+610,TZ+760),(TX+870,TZ+940),(TX+1120,TZ+1110),(TX+1360,TZ+1260)]
add_road('fast_town_spine','fast','天文小镇景观中轴','town_avenue',22,4,30,.56,'SRC_FAST_SKY_STREET','依据天幕街位于景观中轴与官方航拍关系构建',lift(fast_spine_xz,road_y_fast))
add_road('fast_town_ring','fast','天文小镇核心环路','town_ring',16,2,30,.58,'SRC_FAST_AERIAL_20250710','官方航拍所示弧形道路关系的非测绘级近似',lift(fast_ring_xz,road_y_fast))
for rid,label,pts in [('fast_res_arc_a','航龙湾弧形街A',res_a),('fast_res_arc_b','航龙湾弧形街B',res_b),('fast_res_arc_c','天文时光村弧形街',res_c)]:
    add_road(rid,'fast',label,'local_road',9,2,20,.63,'SRC_FAST_AERIAL_20250710','红顶住宅群沿道路顺坡布置',lift(pts,road_y_fast))
# 6km scenic connection between FAST and town
access_xz=[(0,0),(420,350),(900,720),(1450,980),(2050,1320),(2600,1750),(3180,2100),(3700,2520),(4200,2920),(TX-350,TZ-420)]
add_road('fast_access','fast','天文小镇—FAST景区接驳走廊','scenic_access',13,2,30,.32,'SRC_FAST_MASTERPLAN_2025','总体规划明确天文小镇—观景台连接道路；具体曲线为MVP仿真',lift(access_xz,road_y_fast))
core_loop=[(-500,-100),(-390,300),(-80,480),(330,350),(510,0),(330,-370),(-80,-500),(-430,-320),(-500,-100)]
add_road('fast_core_loop','fast','FAST核心维护环线','restricted_access',8,1,15,.28,'SRC_FAST_QUIET_RULE','科研核心区内部维护道路空间示意',lift(core_loop,road_y_fast))
# Huajiang roads
add_road('la_s57','huajiang','六枝至安龙高速·花江段','expressway',25,4,80,.70,'SRC_LA_ROUTE','桥面与两岸高速三维走廊',[(-2900,terrain_hj(-2900,-120)+20,-120),(-2200,terrain_hj(-2200,-70)+25,-70),(-1450,650,-15),(-710,640,0),(0,640,0),(710,640,0),(1450,650,10),(2050,terrain_hj(2050,260)+30,260),(2750,terrain_hj(2750,620)+30,620)],'bridge_terrain')
add_road('yundu_link','huajiang','云渡服务区—主塔连接道路','service_link',9,2,20,.78,'SRC_YUNDU_APPROVAL','服务区至锚碇/主塔连接道路',lift([(2050,500),(1750,590),(1470,650),(1240,610),(980,500),(760,260)],road_y_hj))
add_road('yundu_loop','huajiang','云渡服务区内部环路','service_road',12,2,20,.78,'SRC_YUNDU_APPROVAL','服务区内部交通组织仿真',lift([(760,480),(980,290),(1280,320),(1540,590),(1500,960),(1200,1110),(850,970),(680,700),(760,480)],road_y_hj))
keli_access=[(-2850,1050),(-2500,980),(-2200,900),(-1970,830),(-1810,760),(-1680,690),(-1520,610),(-1360,500),(-1220,360)]
keli_main=[(-1920,860),(-1790,780),(-1660,720),(-1510,665),(-1370,600),(-1240,510),(-1130,390)]
keli_upper=[(-1870,1010),(-1710,930),(-1540,865),(-1400,790),(-1260,710)]
keli_lower=[(-1810,690),(-1660,620),(-1510,560),(-1370,500),(-1240,420)]
add_road('keli_access','huajiang','科力寨进寨道路','local_road',8,2,15,.40,'SRC_KELI_HOLIDAY_20251010','依据观桥高峰交通与航拍村路形态构造',lift(keli_access,road_y_hj))
for rid,label,pts in [('keli_lane_main','科力寨主村道',keli_main),('keli_lane_upper','科力寨上坡村道',keli_upper),('keli_lane_lower','科力寨下坡村道',keli_lower)]:
    add_road(rid,'huajiang',label,'village_lane',5,1,10,.38,'SRC_KELI_CCTV','住宅沿坡地窄村道组织',lift(pts,road_y_hj))
xh_access=[(2180,-520),(1940,-650),(1700,-760),(1500,-880),(1320,-980),(1120,-1080),(900,-1210)]
xh_main=[(1660,-640),(1540,-760),(1400,-880),(1260,-980),(1120,-1050),(980,-1120)]
xh_upper=[(1770,-760),(1630,-880),(1490,-980),(1350,-1080),(1190,-1160)]
xh_river=[(1540,-1120),(1370,-1190),(1180,-1250),(1010,-1290),(830,-1260)]
add_road('xiaohuajiang_access','huajiang','小花江村进村道路','local_road',7,2,15,.28,'SRC_XH_CCTV_20251130','村寨交通改善后形成的山地进村道路空间示意',lift(xh_access,road_y_hj))
for rid,label,pts in [('xh_lane_main','小花江村主村道',xh_main),('xh_lane_upper','小花江上坡村道',xh_upper),('xh_lane_river','小花江沿河村道',xh_river)]:
    add_road(rid,'huajiang',label,'village_lane',4.5,1,10,.18,'SRC_XH_CCTV_20251130','窄村道顺坡/沿河组织',lift(pts,road_y_hj))
# regional 3D corridor
for args in [
 ('regional_g7611','G7611 都香高速区域段',[(-2900,-1250),(-2450,-1040),(-2050,-860),(-1660,-630),(-1250,-430)]),
 ('regional_g60','G60 沪昆高速区域段',[(-2050,-80),(-1660,-250),(-1250,-430),(-900,-300),(-560,-40)]),
 ('regional_la','六安高速三维走廊',[(-1250,-430),(-980,-250),(-700,-90),(-430,100),(-100,260),(270,390),(560,490),(860,590)]),
 ('regional_g78','G78 汕昆高速区域段',[(360,820),(620,700),(860,590),(1130,500),(1600,390)]),
 ('regional_fast_link','FAST科普旅游连接走廊',[(560,490),(760,300),(960,60),(1140,-260),(1290,-600)])
]:
    rid,name,pts=args; add_road(rid,'overview',name,'expressway' if 'FAST' not in name else 'scenic_corridor',26 if 'FAST' not in name else 18,4 if 'FAST' not in name else 2,100 if 'FAST' not in name else 60,.35,'SRC_LA_ROUTE' if 'FAST' not in name else 'SRC_FAST_MASTERPLAN_2025','区域空间关系的立体交通走廊',[(x,260+120*math.sin((x+z)*.0015),z) for x,z in pts])
base['roads']=roads;base['road_points']=roadpts
road_lookup={r['id']:[(p['scene_x'],p['scene_y'],p['scene_z']) for p in roadpts if p['road_id']==r['id']] for r in roads}

# ---------- buildings ----------
buildings=[]
def B(id,site,dist,node_id,name,typ,x,y,z,w,d,h,rot=0,floors=1,roof='flat',facade='neutral',year=2016,phase=.5,status='SIMULATED',src='SRC_FAST_AERIAL_20250710',detail='',placement='reference_constrained',realism='B'):
    buildings.append(dict(id=id,site_id=site,district_id=dist,node_id=node_id,name=name,building_type=typ,scene_x=round(x,2),scene_y=round(y,2),scene_z=round(z,2),width=round(w,2),depth=round(d,2),height=round(h,2),rotation=round(rot,4),floors=floors,roof_type=roof,facade_style=facade,build_year=year,phase_start=round(phase,3),data_status=status,source_id=src,detail=detail,placement_basis=placement,realism_grade=realism))

def townpt(lx,lz,up=3):
    x,z=TX+lx,TZ+lz;return x,terrain_fast(x,z)+up,z
# landmarks from public imagery / published dimensions
for args in [
 ('b_fast_experience','fast_museum','平塘国际天文体验馆','museum',120,-300,230,175,46,-.12,3,'curved','gold-tech','SRC_FAST_AERIAL_20250710','航拍可见的大型曲线公共建筑，形态为参考约束近似'),
 ('b_fast_visitor','fast_visitor_center','游客服务中心','visitor_center',-420,-400,215,105,38,.12,2,'winged','glass-tech','SRC_FAST_MASTERPLAN_2025','游客接待与换乘核心'),
 ('b_fast_time_tower','fast_time_tower','天文时空塔','tower',-520,720,46,46,99.999,0,27,'disc','metallic','SRC_FAST_FACILITIES_2025','官方高度99.999m'),
 ('b_fast_sky_street','fast_sky_street','天幕商业街','canopy_street',-260,300,450,36,13.5,math.pi/2,3,'canopy','led-tech','SRC_FAST_SKY_STREET','官方450m长、平均18m宽、13.5m高；视觉道路尺度适配'),
 ('b_fast_star_hotel','fast_star_hotel','星辰天缘大酒店','hotel',-620,-80,185,115,56,-.12,8,'flat','hotel-glass','SRC_FAST_HOTEL','2016年开业，202间客房'),
 ('b_fast_dome','fast_dome_cinema','球幕飞行影院','dome',260,300,96,96,44,0,3,'dome','science-tech','SRC_FAST_SCENIC','球幕建筑'),
 ('b_fast_space','fast_space_hall','航天馆','museum',360,-80,122,78,34,.1,3,'curved','science-tech','SRC_FAST_SCENIC','科普场馆'),
 ('b_fast_vr','fast_vr_hall','星游记VR馆','experience',520,160,92,68,28,-.05,2,'flat','science-tech','SRC_FAST_SCENIC','科普体验'),
 ('b_fast_light','fast_light_hall','FAST天眼光影馆','experience',720,40,112,74,30,.08,2,'flat','science-tech','SRC_FAST_FACILITIES_2025','光影体验'),
 ('b_fast_xr','fast_xr_center','元宇宙XR体验中心','experience',820,-220,125,84,33,.12,2,'flat','science-tech','SRC_FAST_SCENIC','XR体验'),
 ('b_fast_lab','fast_physics_lab','天体物理实验室','education',620,-520,116,70,31,-.12,2,'flat','education','SRC_FAST_SCENIC','研学实验'),
 ('b_fast_galaxy','fast_galaxy_center','FAST银河演艺中心','theatre',390,560,126,84,36,.08,3,'curved','science-tech','SRC_FAST_SCENIC','演艺中心'),
]:
    bid,nid,name,typ,lx,lz,w,d,h,rot,floors,roof,fac,srcid,detail=args;x,y,z=townpt(lx,lz,4);B(bid,'fast','fast_town_core',nid,name,typ,x,y,z,w,d,h,rot,floors,roof,fac,2016,.58,'SIMULATED',srcid,detail,'aerial_reference_constrained','A')
# circular plaza buildings / commercial edges aligned to spine + ring
for road_id,count,prefix,typ in [('fast_town_spine',48,'fast_commercial','commercial'),('fast_town_ring',44,'fast_ring_building','commercial')]:
    pts=road_lookup[road_id]
    for i in range(count):
        q=(i+.65)/(count+1);x,y,z,ang=sample_polyline(pts,q);side=-1 if i%2==0 else 1;off=38+rng.uniform(5,30);x,z=offset_from_line(x,z,ang,side*off)
        if math.hypot(x-(TX-40),z-(TZ-620))<170:continue
        h=rng.uniform(18,36);B(f'{prefix}_{i:03}','fast','fast_town_core',None,f'天文小镇沿街建筑 {i+1}',typ,x,terrain_fast(x,z)+4,z,rng.uniform(36,68),rng.uniform(24,46),h,ang,2,'flat','warm-tech',2016+rng.randint(0,4),.61+rng.random()*.13,'SIMULATED','SRC_FAST_AERIAL_20250710','依据航拍街坊界面与道路走向生成','road_aligned_aerial_constrained','B')
# Red roof residential: along three curved streets, no regular grid
res_roads=['fast_res_arc_a','fast_res_arc_b','fast_res_arc_c']
idx=0
for rid in res_roads:
    pts=road_lookup[rid]; per=58 if rid!='fast_res_arc_c' else 52
    for i in range(per):
        q=(i+.45)/(per+1);x,y,z,ang=sample_polyline(pts,q);side=-1 if i%2==0 else 1;off=28+rng.uniform(4,28);x,z=offset_from_line(x,z,ang,side*off)
        w=rng.uniform(28,40);d=rng.uniform(22,34);h=rng.uniform(18,25)
        B(f'fast_home_{idx:03}','fast','fast_residential_east',None,f'航龙湾/天文时光村住宅 {idx+1}','residential',x,terrain_fast(x,z)+3,z,w,d,h,ang+rng.uniform(-.06,.06),3,'gable','red-roof',2016+rng.randint(0,4),.64+rng.random()*.17,'SIMULATED','SRC_FAST_AERIAL_20250710','按航拍红顶住宅群密度、弧形道路和顺坡关系生成','road_aligned_aerial_constrained','A');idx+=1
# hotel/apartment blocks west/north around town
for i in range(26):
    a=-2.5+(i/25)*2.1;rad=760+rng.uniform(-80,120);x=TX+math.cos(a)*rad;z=TZ+math.sin(a)*rad;h=rng.uniform(40,70)
    B(f'fast_hotelblock_{i:02}','fast','fast_town_core',None,f'酒店/公寓组团 {i+1}','hotel',x,terrain_fast(x,z)+5,z,rng.uniform(70,100),rng.uniform(44,72),h,a+math.pi/2,6,'flat','hotel-glass',2017+rng.randint(0,4),.67+rng.random()*.16,'SIMULATED','SRC_FAST_AERIAL_20250710','依据航拍核心区周边酒店公寓组团关系建模','aerial_reference_constrained','B')

# Yundu: main masses + road-aligned service buildings
for args in [
 ('b_yundu_main','yundu','云渡服务区综合楼','service_hall',1120,650,340,165,62,-.2,4,'terraced','stone-glass','SRC_YUNDU_APPROVAL','综合楼公开建筑规模，形态为航拍/效果图约束近似'),
 ('b_yundu_dorm',None,'云渡服务区宿舍楼','dormitory',1310,560,150,75,40,-.18,5,'flat','neutral','SRC_YUNDU_APPROVAL','宿舍楼公开规模'),
 ('b_hj_elevator','hj_elevator','207m观光电梯塔','elevator',655,85,34,34,207,0,30,'flat','glass-tech','SRC_HUAJIANG_TOUR_APPROVAL','观光电梯参数化体块'),
 ('b_hj_viewhall','hj_viewhall','观光服务楼','visitor_center',900,350,170,105,45,.22,3,'curved','stone-glass','SRC_HUAJIANG_TOURISM','桥旅观光服务楼'),
 ('b_hj_hotel','hj_hotel','云渡桥旅酒店','hotel',1110,330,190,100,62,.12,7,'flat','hotel-glass','SRC_HUAJIANG_TOURISM','桥旅酒店'),
 ('b_hj_research','research_base','桥旅研学基地','education',920,760,185,115,44,-.12,3,'flat','education','SRC_HUAJIANG_TOUR_APPROVAL','桥旅研学基地')]:
    bid,nid,name,typ,x,z,w,d,h,rot,floors,roof,fac,srcid,detail=args;B(bid,'huajiang','hj_yundu',nid,name,typ,x,terrain_hj(x,z)+18,z,w,d,h,rot,floors,roof,fac,2025,.80,'SIMULATED',srcid,detail,'reference_constrained','A')
pts=road_lookup['yundu_loop']
for i in range(54):
    q=(i+.3)/(54.5);x,y,z,ang=sample_polyline(pts,q);side=-1 if i%2==0 else 1;off=48+rng.uniform(10,52);x,z=offset_from_line(x,z,ang,side*off)
    typ='commercial' if i%3 else 'service';B(f'hj_service_{i:03}','huajiang','hj_yundu',None,f'云渡服务建筑 {i+1}',typ,x,terrain_hj(x,z)+15,z,rng.uniform(44,78),rng.uniform(32,58),rng.uniform(18,36),ang,2,'curved' if i%9==0 else 'flat','stone-glass',2025,.80+rng.random()*.11,'SIMULATED','SRC_YUNDU_APPROVAL','沿服务区内部环路组织的桥旅服务体块','road_aligned_reference_constrained','B')

# Keli 25 households: distributed along three slope roads
keli_roads=['keli_lane_main','keli_lane_upper','keli_lane_lower'];idx=0
for rid,count in zip(keli_roads,[10,8,7]):
    pts=road_lookup[rid]
    for i in range(count):
        q=(i+.5)/(count+1);x,y,z,ang=sample_polyline(pts,q);side=-1 if (i+idx)%2==0 else 1;off=22+rng.uniform(3,24);x,z=offset_from_line(x,z,ang,side*off)
        B(f'keli_house_{idx+1:02}','huajiang','hj_keli','keli_village' if idx==0 else None,f'科力寨民居 {idx+1}','village_house',x,terrain_hj(x,z)+5,z,rng.uniform(44,65),rng.uniform(34,50),rng.uniform(20,31),ang+rng.uniform(-.14,.14),2,'gable','village-white',1995+rng.randint(0,30),.28+rng.random()*.28,'SIMULATED','SRC_KELI_CCTV','25户规模采用公开事实；单体沿坡地村道与航拍聚落密度约束','road_aligned_aerial_constrained','A');idx+=1
# Keli shops near viewpoint, not regimented
for i in range(18):
    q=(i+.5)/19;x,y,z,ang=sample_polyline(road_lookup['keli_lane_lower'],q);x,z=offset_from_line(x,z,ang,(-1 if i%2 else 1)*(18+rng.uniform(2,12)))
    B(f'keli_shop_{i:02}','huajiang','hj_keli','keli_shops' if i==0 else None,f'科力寨观景商铺 {i+1}','container_shop',x,terrain_hj(x,z)+5,z,rng.uniform(32,46),rng.uniform(18,26),rng.uniform(13,18),ang,1,'flat','container-bright',2025,.91,'SIMULATED','SRC_KELI_PEOPLE','观景休憩商业沿村路/观景方向组织','road_aligned_reference_constrained','B')
B('b_keli_service','huajiang','hj_keli','keli_service_center','科力寨游客服务中心','visitor_center',-1540,terrain_hj(-1540,630)+15,630,165,92,36,.22,2,'curved','stone-glass',2026,.97,'SIMULATED','SRC_KELI_CCTV','2025年12月报道建设推进中','reference_constrained','B')

# Xiao Huajiang: 102 household structures; statuses reflect 16 open homestays, 14 under construction, 5 eateries
xh_roads=['xh_lane_main','xh_lane_upper','xh_lane_river'];counts=[38,34,30];idx=0
for rid,count in zip(xh_roads,counts):
    pts=road_lookup[rid]
    for i in range(count):
        q=(i+.35)/(count+.7);x,y,z,ang=sample_polyline(pts,q);side=-1 if (i+idx)%2 else 1;off=18+rng.uniform(2,22);x,z=offset_from_line(x,z,ang,side*off)
        if idx<16: typ,fac,phase='homestay','village-renovated',.91
        elif idx<30: typ,fac,phase='homestay_construction','scaffold',.965
        elif idx<35: typ,fac,phase='restaurant','village-warm',.92
        else: typ,fac,phase='village_house','village-white',.18+rng.random()*.18
        B(f'xh_house_{idx+1:03}','huajiang','hj_xiaohuajiang','xiaohuajiang_village' if idx==0 else None,f'小花江村建筑 {idx+1}',typ,x,terrain_hj(x,z)+4,z,rng.uniform(42,64),rng.uniform(32,52),rng.uniform(20,34),ang+rng.uniform(-.12,.12),2,'gable' if typ!='restaurant' else 'flat',fac,1990+rng.randint(0,35),phase,'SIMULATED','SRC_XH_PEOPLE_20260622' if idx<35 else 'SRC_XH_CCTV_20251130','102户规模采用公开事实；单体沿窄村道与坡地组织，文旅改造状态依据2026公开口径','road_aligned_aerial_constrained','A');idx+=1
base['building_instances']=buildings

# ---------- transport assets ----------
assets=[]
def A(id,site,road,typ,x,y,z,rot=0,scale=1,phase=.5,src='SRC_LA_ROUTE',detail=''):
    assets.append(dict(id=id,site_id=site,road_id=road,asset_type=typ,scene_x=round(x,2),scene_y=round(y,2),scene_z=round(z,2),rotation=rot,scale=scale,phase_start=phase,data_status='SIMULATED',source_id=src,detail=detail))
for rid,site,count in [('la_s57','huajiang',64),('yundu_link','huajiang',26),('yundu_loop','huajiang',28),('keli_access','huajiang',22),('xiaohuajiang_access','huajiang',20),('fast_town_spine','fast',36),('fast_town_ring','fast',32),('fast_access','fast',30),('regional_la','overview',40)]:
    pts=road_lookup[rid]
    for i in range(count):
        q=i/max(1,count-1);x,y,z,ang=sample_polyline(pts,q)
        if site=='overview': typ='viaduct_pier' if i%5==0 else 'guardrail_marker'
        elif rid=='la_s57': typ='street_light' if i%4==0 else ('viaduct_pier' if i%7==0 else 'guardrail_marker')
        else: typ='street_light' if i%3==0 else 'guardrail_marker'
        A(f'{rid}_asset_{i:03}',site,rid,typ,x,y,z,ang,1,.50,'SRC_FAST_MASTERPLAN_2025' if site=='fast' else 'SRC_LA_ROUTE','道路附属设施，随时间轴成熟度出现')
for row in [
 ('asset_toll','huajiang','la_s57','toll_gantry',1510,terrain_hj(1510,30)+25,30,0,1.5,.84,'SRC_YUNDU_APPROVAL','收费门架'),
 ('asset_tunnel_w','huajiang','la_s57','tunnel_portal',-2650,terrain_hj(-2650,-100)+15,-100,0,1.9,.72,'SRC_LA_ROUTE','高速隧道洞门'),
 ('asset_tunnel_e','huajiang','la_s57','tunnel_portal',2550,terrain_hj(2550,500)+15,500,0,1.9,.72,'SRC_LA_ROUTE','高速隧道洞门'),
 ('asset_interchange','overview','regional_la','interchange',-980,430,-250,0,2.6,.52,'SRC_LA_ROUTE','区域互通立体化'),
 ('asset_fast_gate','fast','fast_access','gateway',TX-350,road_y_fast(TX-350,TZ-420),TZ-420,0,1.4,.58,'SRC_FAST_MASTERPLAN_2025','天文小镇交通门户'),
 ('asset_fast_bridge','fast','fast_access','mountain_bridge',2500,road_y_fast(2500,1680),1680,0,1.8,.52,'SRC_FAST_MASTERPLAN_2025','山地接驳道路桥梁化示意'),
]: A(*row)
base['transport_assets']=assets

# ---------- relations ----------
base['relations']=[
 {'id':'r_fast1','site_id':'fast','from_node':'fast_bus','to_node':'fast_town','relation_type':'transit','data_status':'SIMULATED','weight':1,'label':'公交/自驾抵达'},
 {'id':'r_fast2','site_id':'fast','from_node':'fast_town','to_node':'fast_visitor_center','relation_type':'visitor_flow','data_status':'SIMULATED','weight':1,'label':'小镇集散'},
 {'id':'r_fast3','site_id':'fast','from_node':'fast_visitor_center','to_node':'fast_entry','relation_type':'visitor_flow','data_status':'SIMULATED','weight':1,'label':'寄存/安检'},
 {'id':'r_fast4','site_id':'fast','from_node':'fast_entry','to_node':'fast_view','relation_type':'shuttle_flow','data_status':'SIMULATED','weight':1,'label':'摆渡上山'},
 {'id':'r_fast5','site_id':'fast','from_node':'fast_view','to_node':'fast_core','relation_type':'observation','data_status':'SIMULATED','weight':1,'label':'观景关系'},
 {'id':'r_hj1','site_id':'huajiang','from_node':'toll_hj','to_node':'parking_a','relation_type':'vehicle_flow','data_status':'SIMULATED','weight':1,'label':'高速驶入'},
 {'id':'r_hj2','site_id':'huajiang','from_node':'parking_a','to_node':'yundu','relation_type':'pedestrian_flow','data_status':'SIMULATED','weight':1,'label':'服务区集散'},
 {'id':'r_hj3','site_id':'huajiang','from_node':'yundu','to_node':'shuttle','relation_type':'shuttle_flow','data_status':'SIMULATED','weight':1,'label':'摆渡接驳'},
 {'id':'r_hj4','site_id':'huajiang','from_node':'shuttle','to_node':'glass_hall','relation_type':'visitor_flow','data_status':'SIMULATED','weight':1,'label':'进入桥体体验'},
 {'id':'r_hj5','site_id':'huajiang','from_node':'keli_parking','to_node':'keli_village','relation_type':'pedestrian_flow','data_status':'SIMULATED','weight':1,'label':'步行穿寨'},
 {'id':'r_hj6','site_id':'huajiang','from_node':'keli_village','to_node':'keli_viewpoint','relation_type':'visitor_flow','data_status':'SIMULATED','weight':1,'label':'观桥路径'},
 {'id':'r_hj7','site_id':'huajiang','from_node':'keli_viewpoint','to_node':'bridge_core','relation_type':'view_relation','data_status':'SIMULATED','weight':.9,'label':'桥村视觉关系'},
 {'id':'r_hj8','site_id':'huajiang','from_node':'xiaohuajiang_village','to_node':'xh_riverfront','relation_type':'visitor_flow','data_status':'SIMULATED','weight':.9,'label':'村寨—河岸观桥'},
 {'id':'r_hj9','site_id':'huajiang','from_node':'xh_homestay_cluster','to_node':'bridge_core','relation_type':'view_relation','data_status':'SIMULATED','weight':.85,'label':'民宿屋顶观桥'},
 {'id':'r_hj10','site_id':'huajiang','from_node':'hj_river_dock','to_node':'bridge_core','relation_type':'boat_flow','data_status':'SIMULATED','weight':.65,'label':'水上观桥'},
]

# ---------- node legends / dossiers ----------
legends=[]
def L(nid,built,opened,flow_label,flow_value,period,src,note,identity_label='空间身份',identity_value='',scale_label='核心尺度',scale_value='',context_label='当前上下文',context_value='',relation_label='空间关系',relation_value=''):
    legends.append(dict(node_id=nid,built_label=built,open_label=opened,flow_label=flow_label,flow_value=flow_value,flow_period=period,source_id=src,note=note,identity_label=identity_label,identity_value=identity_value,scale_label=scale_label,scale_value=scale_value,context_label=context_label,context_value=context_value,relation_label=relation_label,relation_value=relation_value))
# explicit high-value nodes
L('fast_core','2011-03开工','2016-09-25落成启用','最新公开景区客流','2026年7月 >22万人次','2026-07','SRC_FAST_LATEST_20260818','FAST核心科研设施','设施类型','国家重大科技基础设施','口径','500 m','科研状态','科研第一，旅游参观受电磁保护约束','空间关系','距天文科学文化园约6km')
L('fast_town','2015-09启动建设','2016起陆续开放','最新公开景区客流','2026年7月 >22万人次','2026-07','SRC_FAST_AERIAL_20250710','城镇客流与景区总体口径关联','城镇类型','天文科普旅游小镇','规划范围','景区3.47 km²','形态依据','官方无人机航拍 + 总体规划','空间关系','与FAST核心分离布置')
L('fast_time_tower','2015-2016建设期','2016前后开放','景区总体最新公开客流','2026年7月 >22万人次','2026-07','SRC_FAST_FACILITIES_2025','单塔客流未独立公开','地标类型','全钢结构观景塔','高度','99.999 m','功能','观光电梯 / 观景 / 天文体验','空间关系','天文小镇制高点')
L('fast_sky_street','2015-2016建设期','2016前后开放','景区总体最新公开客流','2026年7月 >22万人次','2026-07','SRC_FAST_SKY_STREET','单街客流未独立公开','街区类型','天文主题商业街','尺度','450m长 · 平均18m宽 · 13.5m高','核心构筑','8000㎡天幕 / 5000㎡显示屏','空间关系','位于小镇景观中轴')
L('fast_museum','2015起建设','2016前后开放','景区总体最新公开客流','2026年7月 >22万人次','2026-07','SRC_FAST_FACILITIES_2025','单馆客流未独立公开','设施类型','天文科普体验馆','建筑体量','约5990㎡建筑面积（公开资料）','功能','天文科普 / 互动体验','空间关系','小镇中央公共建筑群')
L('fast_visitor_center','2015起建设','2016前后投入使用','景区总体最新公开客流','2026年7月 >22万人次','2026-07','SRC_FAST_MASTERPLAN_2025','单节点客流未公开','设施类型','游客接待/换乘','交通逻辑','停车—购票—换乘—摆渡','规划要求','优化游客中心旁换乘站','空间关系','小镇与FAST参观链路起点')
# specific fast remaining nodes
fast_defaults={
 'fast_view':('FAST观景设施','面向500m反射面','观景台—FAST','SRC_FAST_SCENIC'),
 'fast_entry':('核心参观控制','设备寄存/电磁限制','游客中心—观景台','SRC_FAST_QUIET_RULE'),
 'fast_bus':('景区交通接驳','13/14/15路等公共交通/景区换乘','克度镇—天文小镇','SRC_FAST_TRAFFIC'),
 'fast_central_plaza':('公共空间','迎宾广场','体验馆—天幕街','SRC_FAST_AERIAL_20250710'),
 'fast_dome_cinema':('沉浸式影院','球幕飞行体验','科普场馆组团','SRC_FAST_SCENIC'),
 'fast_space_hall':('科普场馆','航天主题体验','科普场馆组团','SRC_FAST_SCENIC'),
 'fast_vr_hall':('数字体验','VR科普','科普场馆组团','SRC_FAST_SCENIC'),
 'fast_light_hall':('数字体验','光影科普','科普场馆组团','SRC_FAST_FACILITIES_2025'),
 'fast_xr_center':('数字体验','XR大空间','科普场馆组团','SRC_FAST_SCENIC'),
 'fast_physics_lab':('研学教育','天体物理实验','研学体系','SRC_FAST_SCENIC'),
 'fast_galaxy_center':('演艺空间','银河主题演艺','小镇夜游体系','SRC_FAST_SCENIC'),
 'fast_karst_park':('生态空间','喀斯特公园','城镇—山体过渡','SRC_FAST_SCENIC'),
 'fast_time_gate':('景观构筑','时光之门','中轴入口','SRC_FAST_SCENIC'),
 'fast_star_hotel':('住宿设施','202间客房','游客中心附近','SRC_FAST_HOTEL'),
 'fast_welcome_hotel':('住宿设施','景区酒店配套','小镇核心','SRC_FAST_SCENIC'),
 'fast_xingji_home':('居住安置','红顶住宅组团','东侧居住片区','SRC_FAST_AERIAL_20250710'),
 'fast_hanglong_bay':('居住安置','航龙湾安置区','东侧居住片区','SRC_FAST_AERIAL_20250710'),
 'fast_astro_village':('居住安置','天文时光村','东北居住片区','SRC_FAST_AERIAL_20250710'),
}
for nid,(ident,scale,relation,srcid) in fast_defaults.items():
    if any(x['node_id']==nid for x in legends):continue
    L(nid,'2015起陆续建设','2016起陆续开放','景区总体最新公开客流','2026年7月 >22万人次','2026-07',srcid,'单节点客流无独立公开口径','节点类型',ident,'特征',scale,'数据表达','显示景区总体客流，不虚构单点人数','空间关系',relation)
# huajiang high-value nodes
L('bridge_core','2022-01-18开工','2025-09-28建成通车','桥旅项目累计客流','>300万人次','2025-09-28—2026-08上旬','SRC_HUAJIANG_3M','交通流与游客量分别使用公开口径','设施类型','峡谷悬索桥','工程尺度','全长2890m · 主跨1420m · 高差625m','交通状态','2025-12日均通行8000余辆','空间关系','跨越北盘江深切峡谷')
L('yundu','2024-2025建设','2025-09-28前后运营','桥旅项目累计客流','>300万人次','至2026-08上旬','SRC_YUNDU_APPROVAL','服务区单点客流未单独公开','设施类型','桥旅融合服务区','建设规模','约218.28亩 · 建筑14747.61㎡','业态','停车 / 住宿 / 研学 / 商业 / 观景','空间关系','东岸主塔与高速出入口核心')
L('keli_village','传统村寨','2025-09大桥通车后成为热点','科力寨假期客流','近20万人次','2025国庆中秋假期','SRC_KELI_HOLIDAY_20251010','假期累计口径；单日10月1日进入车辆突破1万辆','村寨规模','25户 · 128人','旅游变化','观桥 / 餐饮 / 临时摊点','交通峰值','10月1日车辆 >1万辆','空间关系','西岸高处最佳观桥方向之一')
L('keli_viewpoint','2025前后文旅提升','2025大桥通车后','关联科力寨假期客流','近20万人次','2025国庆中秋假期','SRC_KELI_PEOPLE','观景台无独立客流口径','设施类型','村寨观景平台','核心视野','花江峡谷大桥全景','商业配套','集装箱商铺/餐饮休憩','空间关系','科力寨—大桥视觉轴')
L('xiaohuajiang_village','传统布依族村寨','2025大桥通车后文旅加速','村寨国庆中秋日均游客','>2000人次/日','2025国庆中秋假期','SRC_XH_PEOPLE_20260214','村寨总体口径','村寨规模','102户 · 400多人','文旅供给','16家民宿开业 · 14家在建 · 5家农家乐/餐饮','返乡变化','40多人返乡创业','空间关系','桥下峡谷村寨 / 屋顶观桥')
L('xh_homestay_cluster','2025-2026集中改造','2025-2026陆续营业','民宿供给','16家已开业','2026-06公开口径','SRC_XH_PEOPLE_20260622','另有14家民宿在建','设施类型','村寨民宿集群','经营状态','16开业 / 14在建','功能','住宿 + 屋顶观桥','空间关系','小花江村—大桥旅游承接')
L('xh_food_cluster','2025-2026集中发展','2025-2026陆续营业','餐饮供给','5家特色餐饮/农家乐','2026-06公开口径','SRC_XH_PEOPLE_20260622','以村寨总体文旅口径展示','设施类型','乡村餐饮节点','经营规模','5家公开口径','功能','农家餐饮 / 地方特色','空间关系','进村道路与民宿客流交汇')
L('xh_old_banyan','传统村寨历史空间','长期公共使用','村寨国庆中秋日均游客','>2000人次/日','2025假期','SRC_XH_CCTV_20251130','古榕树为村寨公共空间意象','公共空间','古榕树下传统活动','文化活动','布依织布/村寨日常','旅游角色','传统文化体验节点','空间关系','村寨中心')
# other HJ nodes individualized by category
hj_defaults={
 'toll_hj':('收费交通','高速收费/分流','高速—云渡','SRC_YUNDU_APPROVAL'), 'parking_a':('停车设施','主停车区','停车—服务区','SRC_YUNDU_APPROVAL'), 'parking_b':('停车设施','辅助停车区','停车—服务区','SRC_YUNDU_APPROVAL'), 'shuttle':('接驳设施','摆渡进入观景核心','云渡—桥体','SRC_YUNDU_APPROVAL'), 'glass_hall':('高空体验','玻璃观景/检修通道','桥体内部','SRC_HUAJIANG_TOURISM'), 'research_base':('研学设施','桥梁工程研学','云渡服务区','SRC_HUAJIANG_TOUR_APPROVAL'), 'keli_service_center':('游客服务','2025年末建设推进','科力寨入口','SRC_KELI_CCTV'), 'keli_parking':('停车设施','2025国庆高峰承压','科力寨入口','SRC_KELI_HOLIDAY_20251010'), 'keli_shops':('商业配套','集装箱商铺/休憩','观景台周边','SRC_KELI_PEOPLE'), 'hj_elevator':('垂直交通','207m观光电梯','东岸塔区','SRC_HUAJIANG_TOUR_APPROVAL'), 'hj_viewhall':('观光服务','桥旅服务空间','云渡—主塔','SRC_HUAJIANG_TOURISM'), 'hj_hotel':('住宿设施','桥旅酒店','云渡服务区','SRC_HUAJIANG_TOURISM'), 'hj_backup_parking':('停车设施','备用停车','云渡服务区','SRC_HUAJIANG_TOUR_APPROVAL'), 'hj_charging':('能源设施','新能源充电','停车体系','SRC_YUNDU_APPROVAL'), 'hj_water_reservoir':('水务设施','4000m³蓄水池','服务区/水幕','SRC_HJ_WATER_SHOW'), 'hj_river_dock':('水上交通','游船观桥','北盘江','SRC_KELI_PEOPLE'), 'hj_tower_west':('桥梁构件','西岸主塔','主跨西端','SRC_HUAJIANG_OFFICIAL_2025'), 'hj_tower_east':('桥梁构件','东岸主塔','主跨东端','SRC_HUAJIANG_OFFICIAL_2025'), 'hj_water_curtain':('文旅体验','约300m水幕','桥面中部','SRC_HJ_WATER_SHOW'), 'xh_riverfront':('观景空间','河岸/桥下观景','小花江—北盘江','SRC_XH_PEOPLE_20260622')
}
for nid,(ident,scale,relation,srcid) in hj_defaults.items():
    if any(x['node_id']==nid for x in legends):continue
    L(nid,'随大桥/桥旅项目分期建设','2025-09后陆续运营','桥旅项目累计客流','>300万人次','至2026-08上旬',srcid,'单节点人数未公开，展示关联项目口径','节点类型',ident,'特征',scale,'数据表达','不将项目累计人数伪装为单节点人数','空间关系',relation)
# overview nodes
for n in [x for x in base['nodes'] if x['site_id']=='overview']:
    L(n['id'],'区域路网分期建设','按各设施实际通车/启用时间','区域空间关系','非单点客流指标','MVP叙事','SRC_LA_ROUTE','区域节点用于交通走廊叙事','节点类型','区域交通/基础设施锚点','表达尺度','区域级','动态','时间轴控制路网成熟度','空间关系','G7611 / G60 / S57 / G78 / FAST连接')
# ensure every node has a legend
for n in base['nodes']:
    if any(x['node_id']==n['id'] for x in legends):continue
    L(n['id'],'公开资料未给出具体时间','公开资料未给出具体时间','相关景区/项目公开客流','无单点独立口径','最新公开资料',n['source_id'],'该节点无独立流量公开口径','节点类型',n['category'],'空间特征',n['detail'][:36],'数据表达','显示关联口径','空间关系','点击节点查看对应场景位置')
base['node_legends']=legends

# ---------- metrics updates ----------
metrics={x['id']:x for x in base.get('metrics',[])}
def metric(id,site,label,value,op,unit,period,src,note): metrics[id]=dict(id=id,site_id=site,label=label,value=value,operator=op,unit=unit,period_label=period,source_id=src,note=note)
metric('xh_households','huajiang','小花江村户数',102,'=','户','2026公开口径','SRC_XH_PEOPLE_20260214','村寨总体规模')
metric('xh_population','huajiang','小花江村人口',400,'>','人','2025央视公开','SRC_XH_CCTV_20251130','公开表述为400多人')
metric('xh_homestays_open','huajiang','小花江已营业民宿',16,'=','家','2026-06','SRC_XH_PEOPLE_20260622','')
metric('xh_homestays_building','huajiang','小花江在建民宿',14,'=','家','2026-06','SRC_XH_PEOPLE_20260622','')
metric('xh_food','huajiang','小花江特色餐饮/农家乐',5,'=','家','2026-06','SRC_XH_PEOPLE_20260622','')
metric('xh_holiday_daily','huajiang','小花江假日日均游客',2000,'>','人次/日','2025国庆中秋','SRC_XH_PEOPLE_20260214','')
metric('keli_holiday_tourists','huajiang','科力寨国庆中秋游客',200000,'~','人次','2025假期','SRC_KELI_HOLIDAY_20251010','公开口径“近20万人次”')
metric('keli_holiday_vehicles','huajiang','科力寨国庆中秋车辆',70000,'~','辆次','2025假期','SRC_KELI_HOLIDAY_20251010','公开口径“近7万辆次”')
base['metrics']=list(metrics.values())

# ---------- structures / terrain / timeline ----------
base['structures']=[x for x in base.get('structures',[]) if x['id'] not in ('fast_town_model','keli_model','xiaohuajiang_model','regional_transport_model')] + [
 {'id':'fast_town_model','site_id':'fast','name':'平塘天文小镇航拍约束模型','structure_type':'urban_cluster','data_status':'SIMULATED','source_id':'SRC_FAST_AERIAL_20250710','params_json':json.dumps({'fastTownStraightLineToFastM':6000,'skyStreetLengthM':450,'timeTowerM':99.999,'placement':'road-aligned + aerial-constrained'},ensure_ascii=False),'detail':'基于官方航拍与规划关系，建筑沿真实可识别道路逻辑吸附；非测绘级footprint'},
 {'id':'keli_model','site_id':'huajiang','name':'科力寨坡地村寨模型','structure_type':'village_cluster','data_status':'SIMULATED','source_id':'SRC_KELI_CCTV','params_json':json.dumps({'households':25,'population':128,'placement':'slope road-aligned'},ensure_ascii=False),'detail':'25户规模为公开事实，单体沿坡地村道与航拍聚落形态约束'},
 {'id':'xiaohuajiang_model','site_id':'huajiang','name':'小花江村坡地文旅村寨模型','structure_type':'village_cluster','data_status':'SIMULATED','source_id':'SRC_XH_PEOPLE_20260622','params_json':json.dumps({'households':102,'population':'400+','homestaysOpen':16,'homestaysBuilding':14,'food':5},ensure_ascii=False),'detail':'102户规模、文旅业态为公开事实；单体沿窄村道与河岸坡地布置'},
 {'id':'regional_transport_model','site_id':'overview','name':'贵州超级基础设施三维交通廊道','structure_type':'transport_corridor','data_status':'SIMULATED','source_id':'SRC_LA_ROUTE','params_json':json.dumps({'roads':['G7611','G60','S57/六安高速','G78','FAST科普旅游连接'], 'render':'3D road bands + viaduct/tunnel assets'},ensure_ascii=False),'detail':'区域交通关系三维化，不宣称精确工程线位'},
]
# terrain: FAST expanded to ±7600m to preserve ~6km town/core relation; Huajiang ±3400m
terrain=[]
N_FAST=73
for gz in range(N_FAST):
    z=-7600+15200*gz/(N_FAST-1)
    for gx in range(N_FAST):
        x=-7600+15200*gx/(N_FAST-1);terrain.append(dict(site_id='fast',gx=gx,gz=gz,scene_x=round(x,3),scene_z=round(z,3),elevation=round(terrain_fast(x,z),3),data_status='SIMULATED'))
N_HJ=69
for gz in range(N_HJ):
    z=-3400+6800*gz/(N_HJ-1)
    for gx in range(N_HJ):
        x=-3400+6800*gx/(N_HJ-1);terrain.append(dict(site_id='huajiang',gx=gx,gz=gz,scene_x=round(x,3),scene_z=round(z,3),elevation=round(terrain_hj(x,z),3),data_status='SIMULATED'))
base['terrain_samples']=terrain
# Timeline preserves constant response and emphasizes settlement changes
base['timeline_states']=[
 {'id':'fast_t0','site_id':'fast','t':0.00,'year_label':'2007','title':'电磁保护与台址准备','subtitle':'山地仍占主导，天文小镇尚未出现','infrastructure':.05,'roads':.08,'buildings':.00,'flow':.01,'atmosphere':.22,'source_id':'SRC_FAST_QUIET_RULE'},
 {'id':'fast_t1','site_id':'fast','t':0.26,'year_label':'2011','title':'FAST开工','subtitle':'洼地工程首先生长','infrastructure':.26,'roads':.14,'buildings':.02,'flow':.02,'atmosphere':.34,'source_id':'SRC_FAST_SCENIC'},
 {'id':'fast_t2','site_id':'fast','t':0.50,'year_label':'2015','title':'天文小镇启动','subtitle':'6km外的科普城镇与连接道路开始形成','infrastructure':.60,'roads':.50,'buildings':.35,'flow':.12,'atmosphere':.52,'source_id':'SRC_FAST_AERIAL_20250710'},
 {'id':'fast_t3','site_id':'fast','t':0.68,'year_label':'2016','title':'FAST落成 · 小镇成型','subtitle':'科研设施与科普旅游进入同一空间叙事','infrastructure':1.0,'roads':.78,'buildings':.70,'flow':.42,'atmosphere':.70,'source_id':'SRC_FAST_SCENIC'},
 {'id':'fast_t4','site_id':'fast','t':0.86,'year_label':'2022','title':'研学与居住片区成熟','subtitle':'道路、红顶安置区与场馆体系完整','infrastructure':1.0,'roads':.94,'buildings':.94,'flow':.70,'atmosphere':.88,'source_id':'SRC_FAST_AERIAL_20250710'},
 {'id':'fast_t5','site_id':'fast','t':1.00,'year_label':'2026','title':'科普文旅高热','subtitle':'2026年7月景区游客超过22万人次','infrastructure':1.0,'roads':1.0,'buildings':1.0,'flow':1.0,'atmosphere':1.0,'source_id':'SRC_FAST_LATEST_20260818'},
 {'id':'hj_t0','site_id':'huajiang','t':0.00,'year_label':'2021','title':'峡谷 · 科力寨 · 小花江','subtitle':'桥梁建设前，坡地村寨与窄道路先存在','infrastructure':.01,'roads':.22,'buildings':.58,'flow':.06,'atmosphere':.24,'source_id':'SRC_XH_CCTV_20251130'},
 {'id':'hj_t1','site_id':'huajiang','t':0.18,'year_label':'2022','title':'大桥开工','subtitle':'主塔基座与施工道路进入峡谷','infrastructure':.12,'roads':.36,'buildings':.58,'flow':.10,'atmosphere':.36,'source_id':'SRC_HUAJIANG_OFFICIAL_2025'},
 {'id':'hj_t2','site_id':'huajiang','t':0.40,'year_label':'2023','title':'主塔生长','subtitle':'工程体量抬升，村寨仍保持原有肌理','infrastructure':.42,'roads':.50,'buildings':.60,'flow':.14,'atmosphere':.50,'source_id':'SRC_HUAJIANG_OFFICIAL_2025'},
 {'id':'hj_t3','site_id':'huajiang','t':0.62,'year_label':'2024','title':'主缆与钢桁梁','subtitle':'跨谷轮廓形成，云渡场坪开始显现','infrastructure':.74,'roads':.67,'buildings':.66,'flow':.22,'atmosphere':.66,'source_id':'SRC_HUAJIANG_OFFICIAL_2025'},
 {'id':'hj_t4','site_id':'huajiang','t':0.80,'year_label':'2025.01','title':'大桥合龙 · 桥旅建设','subtitle':'云渡服务区、观景与停车设施快速增长','infrastructure':.91,'roads':.83,'buildings':.76,'flow':.34,'atmosphere':.79,'source_id':'SRC_YUNDU_APPROVAL'},
 {'id':'hj_t5','site_id':'huajiang','t':0.91,'year_label':'2025.09','title':'建成通车','subtitle':'高速车流启动，科力寨与小花江进入旅游转型','infrastructure':1.0,'roads':1.0,'buildings':.86,'flow':.72,'atmosphere':.91,'source_id':'SRC_HUAJIANG_OFFICIAL_2025'},
 {'id':'hj_t6','site_id':'huajiang','t':1.00,'year_label':'2026','title':'桥旅—村寨联动','subtitle':'小花江16家民宿开业，科力寨与云渡形成多节点旅游网络','infrastructure':1.0,'roads':1.0,'buildings':1.0,'flow':1.0,'atmosphere':1.0,'source_id':'SRC_XH_PEOPLE_20260622'},
]
# Stories updated with geographically distinct FAST town/core and village sequences
base['story_chapters']=[
 {'id':'s0','seq':0,'site_id':'overview','title':'黔山：超级工程穿过群山','subtitle':'从区域交通走廊进入两类超级基础设施','camera_json':json.dumps({'yaw':-.45,'pitch':.88,'distance':6200}), 'action_json':json.dumps({'scene':'overview','mode':'infrastructure'})},
 {'id':'s1','seq':1,'site_id':'fast','title':'大窝凼：五百米静默之眼','subtitle':'FAST嵌入喀斯特洼地','camera_json':json.dumps({'yaw':-.72,'pitch':.58,'distance':2600}), 'action_json':json.dumps({'scene':'fast','mode':'structure','selected':'fast_core','timeline':.68})},
 {'id':'s2','seq':2,'site_id':'fast','title':'六公里之外：天文小镇','subtitle':'城市综合体、天幕中轴与红顶安置区沿山地道路展开','camera_json':json.dumps({'yaw':-.88,'pitch':.57,'distance':3600}), 'action_json':json.dumps({'scene':'fast','mode':'infrastructure','selected':'fast_town','timeline':1.0})},
 {'id':'s3','seq':3,'site_id':'fast','title':'三十公里静默空间','subtitle':'电磁宁静区从科学设施向外辐射','camera_json':json.dumps({'yaw':-.9,'pitch':.82,'distance':5000}), 'action_json':json.dumps({'scene':'fast','mode':'radiation','quiet':True,'selected':'fast_core'})},
 {'id':'s4','seq':4,'site_id':'huajiang','title':'裂谷之上','subtitle':'六安高速跨越北盘江深切峡谷','camera_json':json.dumps({'yaw':.82,'pitch':.60,'distance':4700}), 'action_json':json.dumps({'scene':'huajiang','mode':'structure','selected':'bridge_core','timeline':.91})},
 {'id':'s5','seq':5,'site_id':'huajiang','title':'西岸：科力寨','subtitle':'25户坡地村寨与观景流量沿村路重新组织','camera_json':json.dumps({'yaw':-.72,'pitch':.49,'distance':2200}), 'action_json':json.dumps({'scene':'huajiang','mode':'infrastructure','selected':'keli_village','timeline':1.0})},
 {'id':'s6','seq':6,'site_id':'huajiang','title':'东南岸：小花江','subtitle':'102户村寨中，民宿与餐饮沿窄村道生长','camera_json':json.dumps({'yaw':2.35,'pitch':.50,'distance':2300}), 'action_json':json.dumps({'scene':'huajiang','mode':'infrastructure','selected':'xiaohuajiang_village','timeline':1.0})},
 {'id':'s7','seq':7,'site_id':'huajiang','title':'流动成为景观','subtitle':'高速—云渡—桥体—村寨—河岸形成多层流动网络','camera_json':json.dumps({'yaw':.62,'pitch':.78,'distance':4100}), 'action_json':json.dumps({'scene':'huajiang','mode':'flow','timeline':1.0})},
]

SEED.write_text(json.dumps(base,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('generated V6 seed')
for k in ['sources','nodes','node_legends','districts','building_instances','roads','road_points','transport_assets','terrain_samples','metrics','timeline_states']:
    print(k,len(base[k]))
