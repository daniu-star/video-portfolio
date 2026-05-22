# 自然呼吸式页面过渡动画 Spec

## Why
当前Landing→Hub页面过渡使用clip-path polygon逐帧计算，存在两个核心问题：①clip-path在最后几帧因polygon自交叉导致画面突然消失（有头无尾）；②clip-path动画本身缺乏呼吸感，视觉上像硬切割而非自然过渡。需要彻底替换为更自然、更具电影呼吸感的过渡方案。

## What Changes
- **BREAKING** 移除clip-path polygon逐帧动画方案
- 采用CSS transform + opacity组合过渡方案，利用GPU加速实现流畅动画
- Landing页以"溶解+缩小+淡出"方式自然消散
- Hub页以"放大+淡入"方式自然显现
- 两层动画有0.3-0.5秒重叠期，形成呼吸感
- 过渡总时长2.0-2.5秒

## Impact
- Affected code: script.js（enter-portfolio事件处理）、style.css（.page-layer过渡样式）

## ADDED Requirements
### Requirement: 自然呼吸式页面过渡
系统 SHALL 提供从Landing页到Hub页的自然呼吸式过渡动画。

#### Scenario: 用户点击"进入作品集"
- **WHEN** 用户点击"进入作品集"按钮
- **THEN** Landing页以opacity淡出 + scale缩小 + 轻微blur模糊的方式自然消散（1.2秒）
- **AND** Hub页在0.5秒后以opacity淡入 + scale从1.05放大到1的方式自然显现（1.0秒）
- **AND** 两层动画有0.3-0.5秒重叠期，形成呼吸感
- **AND** 整个过渡过程无黑屏、无突然消失、无硬切割
- **AND** 过渡完成后清理临时样式

### Requirement: 过渡期间音效配合
- **WHEN** 过渡动画开始
- **THEN** 播放编钟音效（sounds/click-documentary.wav），音量0.35
- **AND** 音效与过渡动画同步开始

## MODIFIED Requirements
### Requirement: 页面过渡动画
旧方案：clip-path polygon逐帧计算，从右下角向左上角波浪式裁剪
新方案：CSS transform + opacity组合过渡，GPU加速，自然呼吸感

## REMOVED Requirements
### Requirement: clip-path波浪式过渡
**Reason**: clip-path逐帧计算在最后几帧因polygon自交叉导致画面突然消失，且缺乏呼吸感
**Migration**: 替换为CSS transform + opacity组合过渡
