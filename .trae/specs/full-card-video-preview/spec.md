# 全卡片视频预览式作品集网格重构 Spec

## Why
当前视频网格页（#layer-grid）只有"精选作品"区域采用了封面+视频预览的机制，其余视频卡片仅为静态缩略图+文字信息。用户要求参考 www.zhangzelong.top 的设计，让**每一个视频卡片**都采用"封面图+hover静音播放视频+渐变遮罩+信息叠加"的电影化展示风格，而非只有单个精选作品享受此待遇。

## 参考机制（zhangzelong.top 核心原理）
```
1. 每张卡片结构：poster图（静态封面）+ video元素（hover时静音自动播放）+ 渐变遮罩 + 标题/描述叠加层
2. 默认状态：显示poster封面图，video元素隐藏(opacity:0)
3. Hover状态：video元素淡入(opacity:0.6)并自动播放，poster图作为底层保底
4. 离开Hover：video暂停并淡出，回到poster封面
5. 点击卡片：进入全屏播放器
```

## What Changes
- 移除"精选作品"独立区域（.grid-featured），将精选概念融入卡片网格
- 重构 .grid-video-card 为"封面+视频+遮罩+信息"四层叠加结构
- 每张卡片内嵌 `<video>` 元素，hover 时自动静音播放
- 卡片信息层（标题、描述、标签）从底部独立区域移到缩略图上方叠加显示
- 网格布局从3列改为2列宽卡片（类似 zhangzelong.top 的宽屏卡片风格）
- 优化视频预加载策略：仅 hover 时加载视频，避免同时加载19个视频

## Impact
- Affected code: `index.html`（移除 .grid-featured 区域）、`style.css`（重写卡片样式）、`script.js`（重写 populateGrid 函数，添加 hover 播放逻辑）
- Affected specs: 页面层级结构不变（Hub→Grid→Player），但 Grid 层内部布局完全重构

## ADDED Requirements

### Requirement: 全卡片视频预览
每张视频卡片 SHALL 内嵌一个 `<video>` 元素，默认隐藏（opacity:0），hover 时淡入至 opacity:0.6 并自动静音循环播放，离开 hover 时暂停并淡出。

#### Scenario: 用户 hover 视频卡片
- **WHEN** 用户将鼠标悬停在任意视频卡片上
- **THEN** 卡片内的 video 元素淡入至 opacity:0.6 并开始静音循环播放，封面图作为底层保底

#### Scenario: 用户离开视频卡片
- **WHEN** 用户将鼠标移出视频卡片
- **THEN** video 元素暂停并淡出至 opacity:0，恢复显示封面图

#### Scenario: 移动端无 hover
- **WHEN** 用户在移动端（无 hover 能力）浏览视频卡片
- **THEN** 卡片始终显示封面图，不自动播放视频，点击直接进入播放器

### Requirement: 宽屏卡片布局
视频卡片 SHALL 采用宽屏比例（16:9 或更宽），2列网格布局，每张卡片足够大以展示视频预览效果。

#### Scenario: 桌面端布局
- **WHEN** 视频网格页在桌面端渲染
- **THEN** 卡片以2列网格排列，每张卡片为16:9宽屏比例

#### Scenario: 移动端布局
- **WHEN** 视频网格页在移动端渲染
- **THEN** 卡片以1列排列，保持16:9比例

### Requirement: 四层叠加卡片结构
每张视频卡片 SHALL 由四层叠加构成：①poster封面图（底层）②video元素（hover时播放）③渐变遮罩（底部渐变）④信息叠加层（标题+标签+播放按钮）。

#### Scenario: 卡片渲染
- **WHEN** 视频网格页加载完成
- **THEN** 每张卡片从底到顶依次为：poster图 → video元素(隐藏) → 渐变遮罩 → 标题/标签/播放按钮

### Requirement: 视频懒加载策略
视频元素 SHALL 仅在 hover 时开始加载和播放，未 hover 的卡片不加载视频资源，避免同时加载多个视频导致性能问题。

#### Scenario: 页面初始加载
- **WHEN** 视频网格页首次加载
- **THEN** 所有卡片仅加载 poster 封面图，video 元素设置 preload="none"

#### Scenario: 首次 hover 触发加载
- **WHEN** 用户首次 hover 某张卡片
- **THEN** 该卡片的 video 元素开始加载并播放

### Requirement: 移除精选区域
移除 .grid-featured 独立区域，精选作品通过在卡片上添加"精选"徽章标识，融入统一的卡片网格中。

#### Scenario: 精选作品标识
- **WHEN** 某分类的第一个视频（精选作品）在网格中渲染
- **THEN** 该卡片左上角显示"精选"徽章标签

## MODIFIED Requirements

### Requirement: 视频卡片信息展示
卡片信息 SHALL 叠加在缩略图/视频上方（而非底部独立区域），包括：标题（底部左对齐）、分类标签（底部左对齐，标题下方）、播放按钮（居中，hover时显示）。

### Requirement: Grid层页面结构
Grid层 SHALL 包含：返回按钮、分类标题区、视频卡片网格（2列宽屏卡片）。移除精选区域。

## REMOVED Requirements

### Requirement: 精选作品独立区域
**Reason**: 用户要求所有视频采用统一的电影化卡片风格，精选区域造成视觉割裂
**Migration**: 精选作品通过徽章标识融入卡片网格
