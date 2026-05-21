# 网站全面优化与问题修复 Spec

## Why
当前网站存在多个问题：视频点击跳转B站、图片丢失（证件照和背景图）、加载速度慢、视频加载慢、设计美感不足。需要全面排查并逐一解决。

## What Changes
- **视频播放修复**：实现站内模态框播放，不跳转B站
- **图片修复**：重新载入证件照和背景图片，找出丢失原因
- **性能优化**：加速网页加载速度
- **视频加速**：优化视频加载速度
- **UI审计与优化**：调用design-system skill进行UI审计并解决问题

## Impact
- Affected specs: 视频播放、图片资源、性能优化、UI设计
- Affected code: index.html, style.css, script.js

## ADDED Requirements

### Requirement: 站内视频播放
系统SHALL实现视频站内播放：
- 点击视频卡片时打开模态框
- 在模态框中嵌入B站播放器
- 不跳转到外部链接
- 支持高清画质和全屏

### Requirement: 图片资源持久化
系统SHALL确保图片正确显示：
- 证件照：`证件照.jpg`
- 背景图片：`image copy 2.png`
- 找出每次丢失的原因并彻底修复

### Requirement: 加载速度优化
系统SHALL优化加载速度：
- 分析首屏渲染时间
- 优化资源加载顺序
- 减少阻塞资源

### Requirement: 视频加载速度优化
系统SHALL优化视频加载：
- 使用懒加载策略
- 预加载关键视频
- 优化iframe加载

### Requirement: UI美感优化
系统SHALL基于UI审计结果优化设计：
- 色彩一致性
- 字体层级
- 间距节奏
- 组件一致性
- 动画效果
- 整体精致度

## MODIFIED Requirements

### Requirement: 视频卡片交互
点击视频卡片SHALL触发模态框而非跳转。

## REMOVED Requirements

### Requirement: B站直接嵌入
**Reason**: 点击后跳转B站体验不佳
**Migration**: 改为模态框播放
