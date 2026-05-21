# 网站全面审计与问题修复 Spec

## Why
对 `index.html`、`contact.html`、`video-collection.html`、`style.css`、`script.js` 五个核心文件进行全面审计后发现，网站存在严重的 **CSS 分散冗余**、**字体字号不统一**、**组件样式不一致**、**视频加载瓶颈**、**设计"AI味"过重**、**联系表单不可用** 六大类问题。这些问题导致页面呈现不一致、性能低下、用户体验受损。需要系统性地修复。

## 审计发现摘要

### 问题一：CSS 严重分散冗余（高优先级）
- `style.css` 定义了一套完整的设计系统（`--font-title`/`--font-body` 等 CSS 变量）
- `index.html` 内联 `<style>` 块定义了 **另一套** CSS 变量，且**不包含** `--font-title`/`--font-body`
- `video-collection.html` 内联 `<style>` 块定义了 **第三套** CSS 变量
- `contact.html` 内联 `<style>` 块又定义了 **第四套** CSS 变量
- 三个 HTML 文件各自重复了 navbar、footer、section-title 等相同组件的完整样式代码（~2000+ 行内联CSS）
- 导致：修改一处样式需改多个文件、样式互相覆盖冲突、加载重复代码浪费带宽

### 问题二：字体与字号严重不统一（高优先级）
- `style.css` 定义 `--font-title: 'KaiTi', 'STKaiti', '楷体', serif` 但 `index.html` 内联样式使用 `'ZCOOL QingKe HuangYou'` 字体却 **未从 Google Fonts 加载该字体**
- `contact.html` 使用 `'Noto Sans SC'` 全家桶
- `video-collection.html` 使用 `'Microsoft YaHei'` 
- 标题 font-weight 在 400/700/900 之间不一致（如 section-title 在 style.css 为 700 但 index.html 内联为 400）
- body 字号：style.css 1.1rem vs contact.html 未设置（默认16px）
- 段落 line-height：style.css 1.9 vs contact.html 1.7
- Google Fonts 加载了 `Noto Sans SC` 但 index.html 主体并未使用

### 问题三：视频加载瓶颈（高优先级）
- 所有视频 `preload="none"`，但懒加载策略过于激进
- `video-collection.html` 中所有视频卡片都在单列布局中，IntersectionObserver 可能一次性触发全部加载
- 浏览器对并发 `<video>` 预加载有数量限制（通常 6-8 个），导致除前几个外其余视频无法加载
- 视频文件为本地 `.mp4`，无压缩/无流式传输/无海报缩略图
- 无视频预加载队列管理、无加载优先级控制
- `script.js` 的 `loadeddata` 事件监听中的 `videos.forEach` 与 `video-collection.html` 内联脚本存在冲突

### 问题四：设计"AI味"问题（中优先级）
- **颜色单调**：全站仅使用紫-蓝-粉渐变（`#6366f1` → `#a855f7` → `#ec4899`），缺乏色彩层次
- **玻璃态泛滥**：每个卡片都是 `backdrop-filter: blur()` + 半透明背景，缺乏区分度
- **过度阴影**：几乎所有卡片和按钮都有多层 glow shadow
- **动画过剩**：每个元素都有 scroll animation、hover transform、glow effect
- **渐变文字滥用**：logo、标题、h3 大量使用 `-webkit-background-clip: text`
- **缺乏留白呼吸感**

### 问题五：组件样式不一致（中优先级）
- 同一个 `.navbar` 在三个 HTML 文件中有不同实现：
  - `style.css`：72px 固定高度 + gradient border
  - `index.html` 内联：padding-based + 无固定高度
  - `contact.html` 内联：与 index.html 相似但细节不同
  - `video-collection.html` 内联：使用 `glass-border` 而非 gradient
- 同一个 `.footer` 在三个 HTML 中有细微差异
- `index.html` 同时使用 `.hero` 和 `.hero-section`，`style.css` 将其合二为一
- Bento Grid 的 `.bento-card` 在 `style.css` 与 `index.html` 内联中存在重复定义

### 问题六：功能缺陷（高优先级）
- `contact.html` 中 EmailJS 使用占位符秘钥（`YOUR_PUBLIC_KEY`/`YOUR_SERVICE_ID`/`YOUR_TEMPLATE_ID`），联系表单功能不可用
- `index.html` 内联样式对 `.about-section` 使用 gradient 背景但 `style.css` 中为纯色 `--bg-elevated`
- `video-collection.html` 中的播放按钮仅触发 `requestFullscreen`，缺乏模态框播放
- `script.js` 中 B站模态框 `openVideoModal`/`closeVideoModal` 仅用于首页 B站视频卡片，video-collection 页未复用

### 问题七：性能问题（中优先级）
- 每个 HTML 页内联 ~8-15KB 重复 CSS，额外请求 `style.css` (~25KB)
- `style.css` 包含 `body::before` 噪声纹理（SVG data URI ~800+ 字符）和 `body::after` 点阵纹理
- 首页 `#orb-canvas` 动画持续消耗 GPU
- Google Fonts 无 `font-display: swap` 导致 FOIT
- 无资源预加载/preconnect 优化（仅 index.html 有部分）

## What Changes

### 一、统一 CSS 系统
- 将 `style.css` 中的设计系统作为唯一 CSS 变量来源
- 删除 `index.html`、`contact.html`、`video-collection.html` 中重复的 CSS 变量定义和内联 `<style>` 块中与 `style.css` 重复的规则
- 保留各页面独有的样式（如 contact 表单样式、video-collection 分类头部样式等），但统一使用 `style.css` 的 CSS 变量
- 确保所有页面引用同一个 `style.css`

### 二、统一字体系统
- 移除未加载的 `ZCOOL QingKe HuangYou`/`ZCOOL KuaiLe` 字体引用
- 统一标题字体为楷体系：`'KaiTi', 'STKaiti', '楷体', serif`
- 统一正文字体为系统字体栈：`'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif`
- 添加 `font-display: swap` 到 Google Fonts 链接
- 精简 Google Fonts 只加载实际使用的字体
- 统一 body 字号为 1rem，标题使用 clamp() 响应式

### 三、修复视频加载
- 实现视频懒加载队列：每次最多加载 2 个视频
- 为视频设置 `poster` 属性（生成缩略图占位）
- 添加加载优先级：首屏视频优先，其余按需加载
- 压缩视频文件或使用渐进式加载
- video-collection 页面添加预加载指示器
- 统一 `script.js` 中视频事件处理逻辑

### 四、降低设计"AI味"
- 减少 glass morphism 使用：仅 hero 和关键卡片保留
- 精简阴影：移除多余的 glow 层，保留一层微妙阴影
- 降低动画密度：减少 scroll-triggered 动画至 60%
- 减少渐变文字使用：仅 logo 和 hero 标题保留
- 增加留白：section padding 统一，卡片间距增大

### 五、修复功能缺陷
- 修复 contact.html EmailJS 配置：使用真实密钥或提供降级方案（mailto）
- 统一 navbar 行为
- 统一 footer 样式
- video-collection 页面复用模态框播放逻辑

### 六、性能优化
- 消除重复 CSS，`style.css` 作为唯一外部样式表
- 添加资源预加载提示
- 减少不必要的 GPU 动画
- 视频懒加载队列

## Impact
- Affected specs: CSS 系统、字体系统、视频播放、联系表单、整体设计
- Affected code: `style.css`（主要修改）、`index.html`（大幅删减内联CSS）、`contact.html`（大幅删减内联CSS+修复表单）、`video-collection.html`（大幅删减内联CSS+修复视频）、`script.js`（增强视频管理）
- **BREAKING**: 字体变更可能影响视觉效果（从手写体→楷体），但这是必要的统一

## ADDED Requirements

### Requirement: 统一 CSS 设计系统
系统 SHALL 通过单一 `style.css` 文件提供统一的设计令牌和基础组件样式：
- 所有页面共享 `style.css` 中定义的 CSS 变量
- 各页面内联 `<style>` 仅包含 **该页面独有** 的样式规则
- 通用组件（navbar、footer、section-title、animate-on-scroll）统一定义在 `style.css`

#### Scenario: 页面引用统一样式
- **WHEN** 访问 index.html、contact.html 或 video-collection.html
- **THEN** 所有页面使用相同的颜色、字体、间距、圆角、阴影

### Requirement: 统一字体层级
系统 SHALL 使用统一的字体系统：
- 标题（h1-h6、section-title、category-title）：楷体系 `'KaiTi', 'STKaiti', '楷体', serif`
- 正文（body、p、span）：`'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif`
- 等宽（数字、代码）：`'JetBrains Mono', 'Consolas', monospace`
- 所有 h1-h6 的 font-size、font-weight、margin-bottom 由 `style.css` 统一定义

#### Scenario: 任何页面标题展示
- **WHEN** 渲染 h1/h2/h3 元素
- **THEN** 使用楷体字体、700 字重、标准间距

### Requirement: 视频懒加载队列
系统 SHALL 实现视频分批加载：
- 最多 2 个视频同时加载
- 首屏可见视频优先
- 上一个视频加载完成后才加载下一个
- 视频未进入视口时不开始加载

#### Scenario: video-collection 页面加载
- **WHEN** 用户打开视频合集页
- **THEN** 仅前 2 个可见视频开始加载，其余等待队列

### Requirement: 联系表单可用
系统 SHALL 提供可用的联系表单：
- 如果 EmailJS 密钥不可用，降级为 `mailto:` 链接
- 表单提交流程完整

#### Scenario: 用户提交联系表单
- **WHEN** 填写并提交表单
- **THEN** 收到成功反馈，或引导至邮件客户端

### Requirement: 设计去 AI 化
系统 SHALL 降低 AI 生成设计痕迹：
- 非玻璃态卡片使用纯色或微妙背景
- 阴影不超过 2 层
- 动画使用意图明确（进出场、hover 反馈），移除装饰性动画
- 渐变文字仅保留 logo 和 hero 标题

#### Scenario: 浏览卡片区域
- **WHEN** 鼠标悬停卡片
- **THEN** 仅出现微妙的 lighten/darken 效果，无大面积 glow

## MODIFIED Requirements

### Requirement: Navbar 组件
Navbar SHALL 在 `style.css` 中统一定义：
- 固定高度 64px
- 统一的滚动行为（背景透明度变化 + backdrop-filter）
- 统一的移动端汉堡菜单逻辑

### Requirement: Footer 组件
Footer SHALL 在 `style.css` 中统一定义，三个页面复用相同结构

### Requirement: 视频卡片交互
视频卡片 SHALL：
- 鼠标悬停时自动静音预览（仅当视频已加载）
- 点击播放按钮进入全屏或模态框播放
- 视频未加载完成时显示骨架屏

## REMOVED Requirements

### Requirement: 多套独立样式系统
**Reason**: 维护成本高、视觉不一致
**Migration**: 统一到 `style.css`

### Requirement: ZCOOL 字体引用
**Reason**: 未实际加载，仅作为 fallback 存在
**Migration**: 替换为系统楷体
