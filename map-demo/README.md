# 当前版本入口：请先阅读 `README_V13_请先阅读.md`。

> V13 正式停用无实际图片文件支撑的实景摄影模块。下文为历史版本文档。

---

# V7 首次访问者交互审计修复版｜2026-10-22

**本版已修复主页操作引导、浮动入口遮挡、移动端更多工具和数据库表切换、照片加载失败提示、驾驶左右观察和 FAST 手机端分区图等问题。** 本项目仍属于示意三维地图，非真实测绘地形或精确道路模型。详细审计见 `docs/V7_UX_REAL_BROWSER_AUDIT.md`。

## 从第一次打开开始体验

1. 运行 `run_windows.bat`（Windows）或 `./run_mac_linux.sh`（macOS/Linux），或在本目录运行 `python -m http.server 8080` 后访问 `http://127.0.0.1:8080/index.html`；无需额外 npm 构建。
2. 点击「进入 3D 地图」，在首次打开的引导页选择 FAST 信号守护、花江概念驾驶、现场照片或自由探索。
3. 进入后使用顶部体验入口栏。手机端的数据库、自动故事和主题功能位于「更多」；手机底部资料面板可以收起。
4. 点击 FAST 游戏可以完整完成三关；点击花江概念驾驶可切换四种镜头、左右观察、暂停和退出，**不可作为真实路线导航**。
5. 「现场实景」通过公开来源在线加载，断网会显示明确的加载失败提示和来源链接；ZIP 内**没有打包实际照片**，不能保证离线显示。
6. 高德 / Google 3D 地形必须配置拥有合法权限的开发者 Key、安全代理或授权域名，并保持联网；**本 ZIP 未内置真实高程与地图瓦片**。

## 浏览器测试到底覆盖了什么

- `qa/real_browser_journey.py`：**真实 Chromium 渲染和点击**，桌面端 1440×900 与手机端 390×844，102 项操作检查通过，生成 34 张真实浏览器截图，全部保存在 `qa/journey/`。
- 受当前自动化环境管理员策略限制，脚本默认使用与原文件相同的 HTML、CSS、JS 的内联渲染方式；**这并不验证 file:// 和 HTTP 本地直接导航、线上实景照片或真实 SDK 鉴权**。
- `qa/static_regression.py`：49 项脚本、资源、数据库静态检查。
- 对实际网址测试：启动本地服务器后，`JOURNEY_URL=http://127.0.0.1:8080/index.html python qa/real_browser_journey.py`（PowerShell 需先 `$env:JOURNEY_URL='http://127.0.0.1:8080/index.html'`）。
- 本轮有明确的原版缺陷及修复结果，不能用 102 项检查通过断言没有任何设备兼容问题。请阅读 `docs/V7_UX_REAL_BROWSER_AUDIT.md`。

---

# V7 第四阶段：FAST 科普游戏与双工程交互升级

本版在上一阶段完整可运行工程上**新增 FAST「深空信号守护计划」三关游戏**。进入地图后顶部切换 **FAST**，点击金色闪烁的「◎ 天眼科普游戏」即可开始。包含虚拟干扰源消除、5/10/30 公里法规判断、合成信号候选辨认，并提供解析、重试、成绩、返回与手机端支持。**信号和地形均为教学模拟，不是实测科研数据。**

具体开发、测试与已知限制见 `docs/V7_P4_FAST_SCIENCE_GAME.md`。

---

> **当前版本 V7 第三阶段 P3 · 可运行工程（2026-10-22）**
>
> 本轮增加正式高德/Google 3D SDK 接入口、操作指引、花江桥梁闪烁游戏标记、FAST/花江大桥地点级授权影像参考。**无需 Key 时仍显示旧离线概念图，而不是真实地形。**
>
> 操作：进入地图 → 顶部「真实地形地图」→ 选择高德或 Google → 配置你自己的 Web JS API Key（高德还需安全代理 / 本机调试 JSCode）→ 在线加载。或点「现场实景」查看开放授权摄影的来源说明，点花江场景中的「▶」进入原七幕概念驾驶。
>
> SDK 真实地图的载入依赖合法密钥、网络、计费/配额及当地数据覆盖；截图或旧模拟地形不会自动变成真实测绘地形。详见 `docs/V7_P3_SDK_REAL_WORLD.md`。

> **当前版本：V7 第二阶段（G2 花江峡谷大桥路线锁定式概念通行），2026-10-22。**
>
> 在第一阶段「建筑/道路点击、资料卡、影像审核」基础上，实现四视角模拟驾乘、路线进度、七幕式引导、暂停与重播、Esc 退出、时间轴与相机恢复。**所有行驶路线仍是模拟线，不能作为现实导航。** 开发详见 `docs/V7_P2_DRIVING_IMPLEMENTATION.md`。
>
> **体验入口**：进入地图 →「🚘 驶过花江峡谷大桥」；或切换花江 → 选中「六枝至安龙高速·花江段」→「从概念桥头出发」。
>
> **运行与测试**：`python qa/test_v7_phase2_browser.py`；同时可回归 `qa/test_v7_phase1_browser.py` 和 `qa/validate_v7_phase1.py`。

# 黔境 · 大国工程志｜Guizhou Spatial Cinema MVP V6.0

V6 是一个 **Offline-first、SQLite 驱动、无需外部地图 API 才能成立** 的三维空间电影 Demo/MVP。核心场景为中国天眼 FAST + 平塘天文小镇，以及花江峡谷大桥 + 云渡服务区 + 科力寨 + 小花江村。

## 作品署名

- 作者：**陈俊良**
- 数据提供：**中央民族大学新闻与传播学院赴贵州省“大国工程”调研团联合贵州民族大学“聚力黔山 共结籽情”实践团**

## 直接运行

1. 解压后直接双击 `index.html`。核心 3D 地形、建筑、道路、节点和数据由 `assets/data/database.bundle.js` 本地加载。
2. 推荐使用 `run_windows.bat` 或 `./run_mac_linux.sh` 启动本地静态服务器。
3. 无 Node/npm 构建要求，无业务 API，无 SDK 密钥。

## V6 核心升级

### 1. AAA 电影式序章

首页独立为“黔境 · 大国工程志”序章：东方山水史诗、山雾、金石文字、墨色地形与电影切镜。进入前所有地图工具隐藏，画面只有一个中央主操作 **“进入3D地图”**，以及作者/数据团队署名。

### 2. 建筑不再随机撒点

建筑生成改为三层真实性策略：

1. 官方/公开航拍可辨识的核心建筑和空间关系优先；
2. 房屋沿道路切线吸附，朝向、标高跟随道路与坡地；
3. 只有缺失区域才进行受聚落边界、坡度、道路密度约束的 SIMULATED 补全。

FAST 天文小镇与 FAST 核心保持约 6km 的空间分离。天文小镇采用“中心公共建筑/广场 + 中轴商业街 + 东/东北侧密集红顶住宅”的空间组织；花江侧分别建立云渡、科力寨、小花江三种不同聚落逻辑。

### 3. 更丰富的建筑类型

V6 浏览器场景包含 **496 个建筑实例**。Scene Engine 增加 winged、terraced、curved hall、坡地村寨复合院、民宿、施工脚手架、餐饮等差异化渲染，不再所有建筑都是长方体。

### 4. 节点图例修复

58 个可交互节点全部对应 `node_legends`。`selected node` 成为唯一状态源：Canvas 点击、节点列表、Story 章节都会走统一的 `selectNode → Dossier → Inspector → Camera` 链路。不同节点显示各自的：

- 空间身份；
- 建设/建构时间；
- 开放/启用时间；
- 核心尺度；
- 客流/交通公开口径；
- 关联设施；
- 来源与 VERIFIED/SIMULATED 状态。

### 5. 时间轴一定改变地图

任意主题下拖动底部时间轴都会同时触发：

- 建筑生长/消隐；
- 道路延伸与成熟度；
- 桥梁施工完成度；
- 流动粒子密度与速度；
- 环境光和色彩能量；
- 时间冲击波与道路光谱轨迹；
- HUD 四项进度实时更新。

## V6 数据规模

以 `config/build_manifest.json` 为准。当前构建包括：

- 496 个 3D 建筑实例；
- 10090 个地形采样点；
- 23 条道路网络、154 个道路控制点；
- 304 个交通设施；
- 58 个空间节点与 58 份图例；
- 29 个数据来源、28 组指标；
- 15 条空间关系；
- 13 个时间状态；
- 8 个 Story 章节；
- 3 套电影主题。

## 数据真实性

- `VERIFIED`：公开事实、尺度、时间、统计指标。
- `SIMULATED`：用于 Demo 的局部地形细节、建筑 footprint、道路细部与空间补全；由真实道路/航拍/规划关系约束，但不宣称测绘级精度。
- Google Maps / Earth / Photorealistic 3D Tiles 未被抓取、缓存或离线再分发。

## 数据库重建

```bash
python database/generate_v6_seed.py
python database/build_database.py
python database/export_frontend_bundle.py
python qa/validate_project.py
```

## 项目结构

```text
index.html
assets/
  css/ tokens.css layout.css components.css cinematic.css prologue.css drive-v7.css
  data/database.bundle.js
  js/ math.js state.js db.js scene/engine.js drive/route.js drive/controller.js drive/drive-ui.js ui/ui.js app.js
database/
  spatial_demo.db schema.sql seed_data.json generate_v6_seed.py
  build_database.py export_frontend_bundle.py
backend/
  static_host.py health_check.py
config/
docs/
qa/
```
