# 网站全面手术式诊断与修复 Spec

## Why
通过对 5 个核心源文件（`index.html`、`contact.html`、`video-collection.html`、`style.css`、`script.js`）及 18 个视频文件的全面审计，发现网站存在 **CSS 完全分裂**、**字体彻底混乱**、**视频文件灾难性过大**、**视频双重标准**、**无加载队列** 五大致命问题，以及 **AI味设计过重**、**表单不可用**、**脚本重复** 等中等问题。必须手术式修复。

---

## 🩺 诊断报告：Visual Audit 10维度评分

| 维度 | 评分 | 诊断 |
|------|------|------|
| **1. 色彩一致性** | 2/10 | 4套独立`:root`变量，颜色值互相矛盾（如`--accent-glow: 0.15 vs 0.3`），`--radius: 12px vs 16px` |
| **2. 字体层级** | 1/10 | 4种不同字体系统，`ZCOOL`未加载却引用，`style.css`标题为sans-serif，`index.html`内联覆盖楷体 |
| **3. 间距节奏** | 4/10 | 各页面section padding不统一，card padding 32-40px浮动 |
| **4. 组件一致性** | 2/10 | navbar在4个源文件中有3种不同实现，footer有2种，video-card有3种 |
| **5. 响应式行为** | 5/10 | 基础断点存在但未对视频做移动端优化 |
| **6. 暗色模式** | 6/10 | `prefers-color-scheme` + `[data-theme]`两套暗色方案，部分覆盖不完全 |
| **7. 动画** | 4/10 | 装饰性动画占比>60%，`will-change`滥用多处 |
| **8. 可访问性** | 3/10 | 视频无字幕/无键盘控制，`--text-muted`对比度低于WCAG AA标准 |
| **9. 信息密度** | 6/10 | Bento网格布局合理，但卡片内文字过多 |
| **10. 精致度** | 3/10 | 缺少loading状态、空状态、错误恢复机制，视频无poster缩略图 |

### 综合评分：**3.6 / 10** — 需要大刀阔斧的重构

---

## 🔍 AI Slop Detection 检测结果

| 模式 | 命中 | 位置 |
|------|------|------|
| 🔴 紫色-蓝色默认渐变 | ✅ | 全站大量使用 `#6366f1 → #a855f7` |
| 🔴 Glass morphism 滥用 | ✅ | 几乎每个卡片都有 `backdrop-filter: blur()` |
| 🔴 多层glow阴影 | ✅ | `box-shadow: 0 10px 30px... 0 20px 50px...` |
| 🔴 滚动动画过剩 | ✅ | 每个元素都有 `.animate-on-scroll` |
| 🔴 渐变文字滥用 | ✅ | logo、h3、title多处 `-webkit-background-clip: text` |
| 🟡 通用hero+居中文字 | ✅ | 3个页面hero结构几乎相同 |
| 🟡 无个性sans-serif | ✅ | 全站无真正品牌字体，全用系统栈 |
| 🟢 过度圆角 | ❌ | 圆角使用尚可 |
| 🟢 无意义装饰 | ✅ | `body::before`点阵、`body::after`噪声svg、floating-shapes |

**AI味评分：7.5/10（越高越AI）**

---

## 📋 问题清单

### 问题一 🔴：CSS 完全分裂（致命）

**现状**：4个源文件各自定义了完全独立的 `:root` CSS自定义属性系统和通用组件样式。

| 文件 | :root变量数 | body字体 | transition | navbar实现 | footer实现 |
|------|------------|----------|------------|------------|------------|
| `style.css` | 70+（含别名） | Sans-serif栈 | `0.3s cubic-bezier` | 72px高度 + gradient border | 统一定义 |
| `index.html` 内联 | 25+ | 微软雅黑 | `0.3s cubic-bezier` | padding-based 无高度 | 统一定义 |
| `video-collection.html` 内联 | 25+ | 微软雅黑 | `0.3s cubic-bezier` | padding-based + glass-border | 统一定义 |
| `contact.html` 内联 | 25+ | Noto Sans SC | `0.3s cubic-bezier` | padding-based | 统一定义 |

**后果**：修改一处样式需改4个文件，样式互相覆盖冲突，浏览器需解析4套不同CSS变量。

### 问题二 🔴：字体彻底混乱（致命）

| 位置 | 标题字体 | 正文字体 | 权重 |
|------|----------|----------|------|
| `style.css` h1-h6 | `'PingFang SC', ...` (sans-serif!) | `var(--font-body)` | h1:900 h2:800 h3:700 |
| `index.html` section-title | `'KaiTi', 'STKaiti', '楷体', serif` | `'Microsoft YaHei'` | 400 |
| `index.html` hero-title | `'ZCOOL QingKe HuangYou'` ❌(未加载) | — | 900 |
| `video-collection.html` | 继承inline定义 | `'Microsoft YaHei'` | — |
| `contact.html` | 继承inline定义 | `'Noto Sans SC'` | — |

Google Fonts 加载了 `Noto Sans SC` 全家桶但 `index.html` 主体未使用，`ZCOOL QingKe HuangYou` 被引用但**从未加载**。

### 问题三 🔴：视频文件灾难性过大（致命）

```
实拍纪录片——五四青年节.mp4    736.2 MB  ← 💣 对网页来说完全不可接受
实拍纪录片——广西三月三.mp4    204.9 MB  ← 💣 不可接受
长游戏AI视频5.mp4             98.2 MB   ← ⚠️ 过大
长游戏AI视频7.mp4             93.3 MB   ← ⚠️ 过大
长游戏AI视频2.mp4             86.7 MB   ← ⚠️ 过大
长游戏AI视频4.mp4             78.5 MB   ← ⚠️ 过大
纪录片——东兴电商宣传.mp4      76.6 MB   ← ⚠️ 过大
AI纪录片《何以为家》.mp4      75.4 MB   ← ⚠️ 过大
```

- **总大小：~1.7 GB** 用于18个视频
- 平均每个视频：~88 MB
- 用户首次访问若同时加载2个视频：可能需要下载150MB+
- **736MB的单文件意味着即使是光纤用户也要等待**

### 问题四 🔴：视频双重标准（致命）

`index.html` 的视频区域使用 **B站iframe占位符**（点击打开B站模态框），而 `video-collection.html` **同一批视频**使用本地 `.mp4` 文件。

| 页面 | AI纪录片 | AI广告片 | 游戏视频 | 实拍纪录片 |
|------|----------|----------|----------|------------|
| `index.html` | B站BV号播放 | B站BV号播放 | B站BV号播放 | B站BV号播放 |
| `video-collection.html` | 本地mp4 | 本地mp4 | 本地mp4 | 本地mp4 |

这意味着：用户在首页看到流畅的B站播放体验，点进"视频合集"反而要下载1.7GB本地大文件。

### 问题五 🔴：无视频加载队列（致命）

[script.js](file:///d:/作品集/script.js) 第1-30行仅做了：
```javascript
videos.forEach(function(video) {
    video.addEventListener('loadeddata', ...)
    video.addEventListener('play', ...)
    video.addEventListener('error', ...)
    video.addEventListener('canplay', ...)
});
```

没有：
- ❌ 加载优先级控制
- ❌ 并发数限制（浏览器默认最多6-8个）
- ❌ 懒加载（IntersectionObserver仅用于scroll动画，未用于视频）
- ❌ 视频缩略图 (poster)
- ❌ 加载失败重试

### 问题六 🟡：设计AI味过重

- 全站紫-蓝-粉三色渐变，无品牌特色
- 每个卡片都是 glass morphism（`backdrop-filter: blur()`）
- 多层 glow shadow（常态+悬停共4层）
- `body::before` 15个点阵伪元素 + `body::after` SVG噪声纹理
- Floating shapes 装饰性动画

### 问题七 🟡：功能缺陷

- [contact.html](file:///d:/作品集/contact.html) 第10-14行：`publicKey: "YOUR_PUBLIC_KEY"` — 硬编码占位符
- 第903行：`emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', ...)` — 无降级方案
- 视频卡片无键盘可访问性

### 问题八 🟡：脚本重复

- [video-collection.html](file:///d:/作品集/video-collection.html) 第1094-1233行（~140行）独立实现了视频hover/play逻辑
- [script.js](file:///d:/作品集/script.js) 第1-30行实现了类似的视频事件绑定
- [contact.html](file:///d:/作品集/contact.html) 第841-937行独立实现了scrollObserver / animate-on-scroll

### 问题九 🟡：性能浪费

- 每个HTML加载~40-70KB内联CSS，再加25KB `style.css`
- 3个HTML各自加载Google Fonts（3次外部请求）
- `body::before` 15个radial-gradient + `body::after` SVG噪声 → 持续GPU合成开销
- `will-change: transform` 滥用（至少8处）

---

## What Changes

### 一、统一CSS到style.css（手术级重构）
- `style.css` 成为**唯一**CSS变量和通用组件来源
- 删除 `index.html`、`contact.html`、`video-collection.html` 内联中所有 `:root`、navbar、footer、animate-on-scroll、container、基础组件样式
- 各页面 `<style>` 仅保留页面独有样式
- 消除4套CSS变量的冲突

### 二、统一字体系统
- 移除 Google Fonts 外部依赖（全部改用系统字体栈）
- 标题统一：`'KaiTi', 'STKaiti', '楷体', 'PingFang SC', 'Microsoft YaHei', serif`
- 正文统一：`'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif`
- 移除 ZCOOL 引用（从未加载）

### 三、视频压缩与优化
- 压缩大文件视频（目标：单文件 ≤ 25MB）
- 为所有视频添加 poster 缩略图

### 四、实现视频加载队列
- `script.js` 新增 `VideoLoadQueue`：最多同时加载2个
- IntersectionObserver 控制入队
- 加载进度指示

### 五、降低AI味
- 移除 `body::after` SVG噪声纹理
- 精简 `body::before` 点阵到3个
- 缩减阴影强度
- 减少装饰性动画

### 六、修复表单
- EmailJS 降级为 mailto 方案

### 七、消除脚本重复
- video-collection.html 复用 `script.js`

## Impact
- Affected specs: CSS系统、字体系统、视频播放、联系表单、整体设计
- Affected code: 全部5个源文件
- **BREAKING**: 字体视觉变化（ZCOOL→楷体），视频文件替换

## ADDED Requirements

### Requirement: 统一CSS设计系统
`style.css` SHALL 是唯一CSS变量和通用组件来源。各HTML内联 `<style>` SHALL 仅包含该页面独有样式。

### Requirement: 统一字体层级
所有页面 SHALL 使用相同字体系统：标题楷体、正文系统sans-serif、等宽JetBrains Mono。

### Requirement: 视频懒加载队列
系统 SHALL 实现 `VideoLoadQueue`，最多2个视频并行加载，IntersectionObserver触发出队。

### Requirement: 视频压缩
所有 `.mp4` 文件 SHALL 压缩到 ≤25MB（720p H.264）。

### Requirement: 联系表单降级
EmailJS 不可用时 SHALL 自动降级为 `mailto:` 链接。

### Requirement: 设计去AI化
移除 `body::after` 噪声纹理，简化 `body::before` 点阵，缩减阴影和动画。

## MODIFIED Requirements

### Requirement: Navbar组件
Navbar SHALL 在 `style.css` 中唯一定义，所有页面复用。

### Requirement: Footer组件
Footer SHALL 在 `style.css` 中唯一定义。

### Requirement: 视频卡片交互
视频卡片 SHALL：悬停静音预览、点击全屏/模态框播放、未加载时显示骨架屏。

## REMOVED Requirements

### Requirement: 4套独立CSS系统
**Reason**: 维护灾难、样式冲突
**Migration**: 统一到 `style.css`

### Requirement: ZCOOL字体引用
**Reason**: 未加载、不可见
**Migration**: 替换为系统楷体

### Requirement: 本地大文件视频分发
**Reason**: 736MB单文件不可用于Web
**Migration**: 压缩到≤25MB或改用B站嵌入
