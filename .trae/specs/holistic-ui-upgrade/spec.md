# 全方位立体化UI诊断与优化升级 Spec

## Why
通过 agent-browser 对线上网站 www.chenjunliang.top 进行实际审查，结合 ui-ux-pro-max / design-system / web-access 三大skill文件的审计标准，发现网站在视频加载体验、交互反馈、视觉艺术化、功能完整性等方面存在显著不足。需要以2025-2026最先进作品集网站标准为基准，进行手术式诊断与优化。

## 线上审查数据（2026-05-21 agent-browser 实测）

### 页面结构
- 首页5个section：hero(647px) → about(1954px) → videos(13922px) → categories(511px) → contact(725px)
- 19个video卡片，19个video元素，6个bento卡片
- 导航链接：个人概况 / AI纪录片 / AI广告片 / 长AI游戏视频 / 实拍纪录片
- CSS变量：`--bg-base: #f5f6fa` / `--bg-glass: rgba(255,255,255,0.75)` / `--text-1: #1a1a2e`

### 视频加载实测
- 首个视频：preload=auto, readyState=4(HAVE_ENOUGH_DATA), buffered=80s, TTFB=2157ms, 总加载17.4s
- 其余视频：preload=none, readyState=0, buffered=0 — 未加载
- style.css: 14.8KB, TTFB=807ms
- script.js: 5.7KB, TTFB=817ms

### 联系表单实测
- 下拉框选项：白色背景+深色文字 ✅（已修复）
- 提交按钮存在且可用
- FormSubmit.co 替代了 EmailJS ✅

## 🩺 10维度UI诊断（基于 ui-ux-pro-max skill 标准）

| 维度 | 评分 | 诊断 |
|------|------|------|
| **1. 色彩一致性** | 7/10 | style.css统一了变量，但index.html内联仍覆盖bento-card样式 |
| **2. 字体层级** | 6/10 | 楷体标题+系统正文已统一，但hero区仍引用未加载的字体 |
| **3. 间距节奏** | 7/10 | 设计Token已统一，但视频区section高达13922px，信息密度过大 |
| **4. 组件一致性** | 5/10 | bento-card在style.css和index.html内联中双重定义，属性冲突 |
| **5. 响应式行为** | 6/10 | 基础断点存在，但视频卡片min-width(380px)在移动端溢出 |
| **6. 暗色模式** | 7/10 | prefers-color-scheme + data-theme双方案，但切换按钮未与系统联动 |
| **7. 动画** | 6/10 | 有shimmer/pulse/fadeInUp，但部分transition仍用ease而非cubic-bezier |
| **8. 可访问性** | 4/10 | 视频无字幕、无键盘播放控制、部分按钮缺aria-label |
| **9. 信息密度** | 5/10 | 视频区13922px过长，缺乏分页/懒折叠机制 |
| **10. 精致度** | 6/10 | 有loading/error状态，但缺空状态、骨架屏、进度百分比 |

### 综合评分：**5.9 / 10** — 需要针对性优化升级

## 🔍 关键问题清单

### 问题一：视频加载体验不足（高优先级）
- 首个视频TTFB=2157ms，总加载17.4s，用户等待时间过长
- 无视频预览缩略图帧（poster存在但未展示视频关键帧）
- hover预览播放无缓冲检测，可能卡顿
- 视频模态框无音量控制、无倍速选择、无画中画

### 问题二：交互反馈不充分（高优先级）
- 视频卡片hover仅translateY(-6px)，缺乏内容层级的微交互
- 播放按钮pulse动画与视频加载状态无联动
- 导航栏活动状态指示器（下划线）无滚动高亮联动
- 无页面滚动进度指示器
- 表单输入无实时验证反馈

### 问题三：视觉艺术化不足（中优先级）
- Hero区Orb动画与粒子效果重叠，层次混乱
- 视频卡片描述区域展开动画过于机械
- 分类标题区域缺乏视觉节奏变化
- Footer过于简单，缺乏品牌感
- 缺少页面过渡动画

### 问题四：功能缺失（中优先级）
- 无视频搜索/筛选功能
- 无视频收藏/分享功能
- 无键盘快捷键（空格暂停、左右快进）
- 无视频播放记忆（刷新后从头开始）
- 联系表单无实时验证
- 无回到顶部按钮的滚动进度环

### 问题五：CSS冲突（高优先级）
- index.html内联.bento-card与style.css .bento-card双重定义
- 内联.bento-card::before与style.css .bento-card::before功能冲突
- 内联使用`var(--glass)`/`var(--glass-border)`但style.css使用`var(--bg-glass)`/`var(--border-glass)`

## What Changes

### 一、修复CSS冲突
- 删除index.html内联中与style.css重复的.bento-card定义
- 统一CSS变量引用（--glass → --bg-glass, --glass-border → --border-glass）

### 二、增强视频加载体验
- 添加视频预览帧（hover时显示视频中间帧截图）
- 模态框添加音量控制、倍速选择、画中画按钮
- 添加键盘快捷键支持（空格暂停、←→快进、Esc关闭）
- 视频播放记忆（localStorage存储播放进度）

### 三、增强交互反馈
- 导航栏滚动高亮联动（IntersectionObserver检测当前section）
- 添加页面滚动进度条（顶部细线）
- 视频卡片hover时显示时长标签和分类标签
- 表单输入实时验证（邮箱格式、必填项）
- 回到顶部按钮添加滚动进度环

### 四、提升视觉艺术化
- Hero区优化Orb/粒子层次，减少视觉噪音
- 视频描述展开改用弹性动画（spring easing）
- 分类标题添加装饰性渐变分隔线
- Footer添加品牌slogan和社交链接图标
- 添加页面section间过渡装饰元素

### 五、新增功能
- 视频搜索/筛选功能（按分类、关键词）
- 视频分享功能（复制链接）
- 视频播放键盘快捷键
- 暗色/亮色模式切换记忆（localStorage）

## Impact
- Affected specs: CSS系统、视频播放、交互反馈、视觉设计、功能完整性
- Affected code: `style.css`、`script.js`、`index.html`、`contact.html`、`video-collection.html`

## ADDED Requirements

### Requirement: CSS冲突修复
系统 SHALL 消除index.html内联样式与style.css之间的重复定义和变量冲突，确保style.css是唯一的组件样式来源。

#### Scenario: bento-card样式渲染
- **WHEN** 浏览器渲染bento-card组件
- **THEN** 仅使用style.css中定义的样式，无内联覆盖冲突

### Requirement: 视频模态框增强
视频模态框 SHALL 提供完整的播放控制：
- 音量滑块（0-100%）
- 倍速选择（0.5x/1x/1.5x/2x）
- 画中画按钮
- 键盘快捷键（空格暂停、←5s快退、→5s快进、Esc关闭）
- 播放进度记忆（localStorage）

#### Scenario: 用户在模态框中播放视频
- **WHEN** 用户点击播放按钮打开模态框
- **THEN** 显示完整控制面板，支持键盘操作，上次播放位置自动恢复

### Requirement: 导航栏滚动联动
导航栏 SHALL 根据当前滚动位置自动高亮对应section的导航链接。

#### Scenario: 用户滚动到视频区域
- **WHEN** 用户滚动页面使"AI纪录片"section进入视口
- **THEN** 导航栏中"AI纪录片"链接自动高亮

### Requirement: 页面滚动进度指示
页面 SHALL 在顶部显示滚动进度条，实时反映当前阅读位置。

#### Scenario: 用户滚动页面
- **WHEN** 用户从顶部向下滚动
- **THEN** 顶部进度条从0%增长到100%

### Requirement: 视频搜索筛选
视频区域 SHALL 提供搜索和分类筛选功能，允许用户快速定位视频。

#### Scenario: 用户搜索视频
- **WHEN** 用户在搜索框输入关键词
- **THEN** 仅显示标题或描述匹配的视频卡片

### Requirement: 表单实时验证
联系表单 SHALL 提供实时输入验证：
- 邮箱格式验证
- 必填项非空验证
- 提交前整体验证

#### Scenario: 用户输入无效邮箱
- **WHEN** 用户在邮箱字段输入不含@的文本
- **THEN** 字段下方显示红色错误提示

### Requirement: 主题切换记忆
暗色/亮色模式切换 SHALL 记住用户选择，下次访问自动应用。

#### Scenario: 用户切换到暗色模式后关闭页面
- **WHEN** 用户再次访问网站
- **THEN** 自动应用暗色模式

## MODIFIED Requirements

### Requirement: 视频卡片交互
视频卡片 SHALL：
- hover时显示时长标签
- 播放按钮与加载状态联动（加载中显示loading，就绪后显示play）
- 描述区域展开使用spring easing动画

### Requirement: Footer设计
Footer SHALL 包含：
- 品牌slogan
- 社交链接图标（GitHub/邮箱/微信）
- 版权信息
- 渐变光晕装饰

## REMOVED Requirements
无移除项
