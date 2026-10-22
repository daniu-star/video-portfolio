# V7 第一阶段交互实现与交接记录

日期：2026-10-22。来源工程：`Map demo.zip` V6。阶段：**G0 对象与影像证据基础 + G1 建筑/道路点击体验的可运行雏形**。

## 1. 本轮已经实现的微观改动

### 1.1 建筑可点击
- 在 `assets/js/scene/engine.js` 中新增 Canvas 投影后的建筑凸包拾取，支持鼠标悬停、建筑轮廓亮边、屏幕上直接单击体块选择。该功能是 Canvas 2D 兼容拾取，不是三维 Raycaster，也不是遮挡精确的测绘级拾取。
- 保持原来的地标节点点击，叠加道路折线的屏幕命中检测。新交互在地图序章进入之后生效；不能从总览远景误点上一地点的模型。
- 进入 **花江地图** 后点击左侧“✦ 开始探索建筑”，会聚焦云渡服务区的**示意综合楼模型**。也可以直接点击地图上可见的建筑体块和道路。

### 1.2 建筑和道路的资料抽屉
- 新增 `assets/js/ui/feature-panel.js` 和 `assets/css/interactive-v7.css`。抽屉支持对象名称、建模真实性标签、建模依据、所属片区、镜头回定位、关闭、Esc 返回和关联节点档案。
- 一张合法照片也没有时，页面明确写“现场照片尚未入库”，不会出现失效图片或 AI 假实拍。
- 道路可点，但只显示示意线路属性与下一阶段计划，**没有开放未经核验的驾驶视角**。
- 手机端有可滚动面板，进入资料状态时隐藏被覆盖的常驻 Inspector。

### 1.3 稳定对象 ID 与照片发布门槛
- `database/schema.sql` 增加 `spatial_features / media_assets / media_bindings`。
- `database/seed_v7_phase1.py` 自动为现有 496 个建筑、23 段道路、58 个节点、7 个片区创建 **584 条**稳定空间对象记录。
- `database/media_manifest.json` 是日后素材清单；`database/media_pipeline.py` 在 SQLite 重建时验证许可、公开用途、文件路径、SHA256、隐私审核、照片-空间绑定范围。未获公开授权的照片不进入浏览器镜像。
- **所有 V6 建筑仍然标为 `simulated_geometry`**；未经地点逐楼核验，不允许绑定 `exact_subject` 的“此楼实拍”。片区图片未来可以绑定 `district:<id>`，即使在相关模型卡里出现，也只能标“片区影像”。

## 2. 如何运行

解压工程后：

```bash
# 进入 Map demo 文件夹
python -m http.server 8000
# 浏览器打开 http://localhost:8000/
```

也可以直接打开 `index.html`。点击“进入3D地图”，再点“✦ 开始探索建筑”。

**如何测试直接点楼**：切换到“花江峡谷大桥”或“FAST”，放大后鼠标移到实体建筑，出现边缘高亮和手形指针，再单击；在照片抽屉返回地图后，可继续点击道路，观察路段说明。

## 3. 后续导入合法照片的流程

当前前端 **0 张已获审批图片**，这是原 ZIP 没有照片且无授权凭证的真实状态，不能将数量写成 8 张/24 张。

1. 向摄影权利人收集已获公开展示许可的图片。确认照片对象、拍摄方位、拍摄时间、是否有私人住宅或受访者可识别信息。
2. 将经过隐私处理的展示副本放入 `assets/media/approved/`。**原片、签名授权书与内部名单不要放入要分发的工程 ZIP；请另行安全存档。**
3. 为每张展示副本计算 SHA256（如 `sha256sum <图片>`），按 `database/media_manifest.json` 所需字段填写具体资产、版权/用途、双重坐标（不明留 null）与绑定对象。
4. 执行 `python database/build_database.py && python database/export_frontend_bundle.py`；脚本会核对资产存在、SHA256、公开许可、隐私审批和关联精度，失败时阻止发布。
5. `media_assets.evidence_scope=exact_building` 不等于程序化建筑已完成地理核验。需要先由 GIS 人员证实某栋楼的真实几何关系并审核后，才能将对应 `spatial_features.precision_status` 升级为 `verified_building`。**目前自动生成的模拟楼无此资格。**

示例数据结构（说明，不是已审核素材，严禁直接发布）：

```json
{
  "version": "V7-P1",
  "approved_media": [
    {
      "id": "approved_photo_001", "relative_path": "assets/media/approved/approved_photo_001.webp",
      "title": "经核验的片区公开照片", "rights_holder": "请填写摄影者或机构",
      "license_status": "authorized", "permitted_uses": "public_web",
      "credit_text": "请填写署名", "capture_date": "2026-07-13",
      "subject_lon": null, "subject_lat": null, "camera_lon": null,
      "camera_lat": null, "camera_heading_deg": null,
      "evidence_scope": "district", "release_status": "approved",
      "privacy_review": "passed", "sha256": "请填写图片真实SHA256",
      "evidence_note": "说明主体位置与照片使用权限核验依据",
      "bindings": [
        {"feature_id": "district:hj_yundu", "binding_scope": "area_context",
         "review_status": "approved", "reviewer_note": "说明照片确实反映该片区的核验证据"}
      ]
    }
  ]
}
```

不要照搬示例 ID、日期或许可证状态。**这是一份字段模板**，不是项目已拥有照片、授权或上述拍摄日期的证明。

## 4. 已运行验证与证据

执行：

```bash
python qa/validate_project.py
python qa/validate_v7_phase1.py
python qa/test_v7_phase1_browser.py
```

- 旧 V6 结构检查通过；SQLite 完整性通过。
- V7 校验：584 条空间对象与原表一一对应；媒体权限/空间作用域管线执行了 1 个正例、3 个负例测试。
- 浏览器行为（Chromium，无页面脚本报错）：桌面与手机的可见对象交互、点击建筑与道路、返回地图、Esc、场景切换、节点档案均通过。截图见 `qa/screenshots/`。
- **测试限制**：环境禁止自动化浏览器导航 `http://localhost` 与 `file://`，因此浏览器测试将项目静态 CSS/JS 原样注入本地无网络 Chromium 页面执行；网页实际 URL 加载、真实设备性能、不同浏览器渲染和素材版权审查仍需要部署端人工验证。不要将这项测试描述为完整实机验收。

## 5. 已知限制及下一阶段

1. 本轮仍是 Canvas 2D 投影模型：拾取使用屏幕凸包近似，密集叠楼可能出现遮挡误选。需要下一阶段 WebGL/3D 深度缓冲拾取或稳定遮挡算法。
2. 所有房屋和道路的局部几何仍属模拟，未接入 DEM/道路真实拓扑；不应夸大坐标精度。
3. **未导入照片是因为缺少资产和发布权限，不是 UI 未开发。**已审批照片的展示和片区作用域已在代码中接入，但尚未用真实图开展照片定位与撤销审核。
4. 下一阶段优先：**核验并接入 4–8 个重点地点的真实影像（G1）**，完成“照片—对象—摄影机位—地图回定位”；之后推进 **G2 的路线锁定式驾驶相机**，不宜直接模拟可自由驾驶的真实高速公路。
5. `database/generate_v6_seed.py` 是原始 V6 种子生成器，不会生成新的 V7 影像记录；V7 媒体由持久 manifest 管理，避免重建丢失。
