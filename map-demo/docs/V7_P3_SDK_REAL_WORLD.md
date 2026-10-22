# V7 P3｜真实地图 SDK 接入与可发现性修复

## 本轮已做

- 接入高德 JS API `v=2.1Beta` 的在线 3D 地形 `terrain:true` 模式，以及 Google Maps JS 3D `Map3DElement`（HYBRID）。两者使用独立视图，不将模拟体块错误叠加至地理底图。
- 新增地图供应商与凭据表单；仅在点击时请求 SDK，提供明确失败状态；无密钥时仍可完整运行概念场景。密钥只存当前页面内存，不保存；高德生产必须经 `serviceHost` 安全代理，开发临时支持安全码明文并警示风险。
- 新增 FAST/花江真实地理定位、地点级开源授权照片对照和许可证归属（摄影与授权信息见 `assets/js/geo/geo-provider.js`）。这是工程整体照片，不是任一模拟房屋的实拍。照片从 Wikimedia Commons 实时联网请求，不抓取或复制高德 Google 地图界面图片。
- 新增持续可见的地图操作帮助、显眼地图切换和场景内桥梁游戏入口、地理底图内的桥梁游戏返回入口。旧驾驶功能不变。

## 实际使用

1. 推荐用 `run_windows.bat` / `run_mac_linux.sh` 在 localhost 启动。首次进入点击“进入3D地图”。
2. 点击顶部“真实地形地图”，选择高德或 Google，填本人合法申请的 Web SDK Key。高德需安全代理 `serviceHost` 或仅本机用的 `securityJsCode`。Google 需 Maps JavaScript API 3D 资格、启用计费、正确的引用来源限制。
3. 点击“载入所选真实 3D 地图”。在底图内可切换 FAST 与花江真实位置，打开地点级实景影像或进入现有桥梁游戏。
4. 点击“返回概念场景”可恢复原 2D 投影地图和交互。
5. 不具备以上资格时，不会显示真实 DEM 或摄影级 3D；保留旧图并提示原因。本地 ZIP 不包含任何第三方地图瓦片。

## 不包含

- 两家 SDK 的 API Key（不能伪造/窃取）；Google 3D Tiles 不能由地图页面提取。
- 拍摄者与目标精确验证的单栋建筑实拍；只增加了摄影来源可核验的地点级影像。
- 用真实路网替换概念驾驶。FAST 科普游戏和自由驾驶留待下一阶段。

## 官方 SDK 文档

- 高德 3D 地图/地形：https://developer.amap.com/api/javascript-api-v2/guide/map/3d-map
- 高德安全密钥：https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode
- Google Maps 3D：https://developers.google.com/maps/documentation/javascript/reference/3d-map
- FAST 实景：https://commons.wikimedia.org/wiki/File:202508_FAST_(Five-hundred-meter_Aperture_Spherical_radio_Telescope).jpg
- 花江实景：https://commons.wikimedia.org/wiki/File:Huajiang_Canyon_Bridge1.JPG

## 安全与许可

图片均 CC BY-SA（FAST 4.0、花江 3.0），页面展示作者及来源；任何剪裁或二次改作需遵守 ShareAlike。公开正式部署前应确认条款与域名限制。高德与 Google 图层不能互相拼贴重投影；只在各自官方 SDK 中单独显示。
