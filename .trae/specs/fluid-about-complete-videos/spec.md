# 关于我流动化设计与视频补全 Spec

## Why
当前"关于我"区域采用Bento网格布局，过于AI化、机械化，缺乏灵性与流动感。同时，视频作品展示不完整（仅展示了3/7广告片和2/7游戏视频）。东兴电商纪录片缺少封面图片。整体界面在首页之外的部分仍需优化。

## What Changes
- **关于我区域重设计**：将Bento静态网格替换为"时间线滚动"布局，让内容自然流动呈现
- **补全视频**：广告片从3部扩展至7部，长游戏AI视频从2部扩展至7部
- **东兴电商封面**：使用 image.png 作为视频封面海报
- **整体界面优化**：优化首页之外的其他页面（contact.html、video-collection.html）

## Impact
- Affected specs: 关于我模块、视频展示模块、联系页面、视频合集页面
- Affected code: index.html, style.css, contact.html, video-collection.html

## ADDED Requirements

### Requirement: 关于我 - 时间线滚动布局
关于我区域SHALL采用时间线滚动布局替代Bento网格：
- 一个垂直时间线贯穿区域中央
- 时间线上分布4个节点：2023-2026各年份
- 每个节点对应一个内容卡片（教育背景、项目经历、专业技能、数据概览）
- 节点交替分布在时间线左右两侧（左-右-左-右）
- 滚动到对应位置时，卡片从两侧滑入视口
- 时间线竖线为渐变紫色
- 节点圆圈为发光渐变圆点

#### Scenario: 用户滚动到关于我区域
- **WHEN** 用户滚动到关于我区域
- **THEN** 时间线节点依次出现，卡片从左右两侧滑入，产生流动叙事感

### Requirement: 补全所有视频
视频展示SHALL包含完整作品：
- AI广告片：广告片1-7（7部），带各自描述
- 长AI游戏视频：长游戏AI视频1-7（7部），带各自描述和poster图片

#### Scenario: 广告片区域
- **WHEN** 用户浏览广告片区域
- **THEN** 展示7部广告片卡片，每部配有内容概述/光影设计/景别设计/镜头设计/AI工具

### Requirement: 东兴电商封面
东兴电商纪录片SHALL使用 image.png 作为视频封面：
- video元素添加 poster="视频合集/image.png" 属性

## MODIFIED Requirements

### Requirement: 关于我布局
关于我区域从Bento网格改为时间线滚动布局。

### Requirement: 整体界面优化
contact.html 和 video-collection.html 也需优化UI，与首页设计风格保持一致。