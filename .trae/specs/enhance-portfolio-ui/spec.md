# 增强作品集UI与联系方式 Spec

## Why
用户需要优化个人作品集网站的UI设计，删除获奖荣誉栏目，扩充项目经历与专业技能，增加联系方式模块，使网站更加美观、专业、具有竞争力。

## What Changes
- 删除"关于我"中的"获奖荣誉"栏目
- 扩充项目经历内容，增强竞争力
- 扩充专业技能内容，展示更多技术能力
- 作品分类从3个增加到4个（添加"实拍纪录片"分类）
- 新增联系方式栏目（邮箱、手机号码、院校地址）
- 实现邮箱链接功能（mailto链接）
- 优化整体UI设计，使页面更美观大气

## Impact
- Affected specs: 关于我模块、作品分类模块、联系方式模块
- Affected code: index.html, style.css

## ADDED Requirements

### Requirement: 联系方式模块
网站SHALL提供联系方式模块，包含：
- 邮箱：1306737663@qq.com
- 手机号码：18229499131
- 院校地址：中央民族大学丰台校区
- 可点击的邮箱链接（mailto功能）

#### Scenario: 用户点击邮箱链接
- **WHEN** 用户点击邮箱链接
- **THEN** 系统打开默认邮件客户端，收件人为1306737663@qq.com

### Requirement: 作品分类四分类
作品分类模块SHALL展示四个分类：
- AI纪录片（1个作品）
- AI广告片（7个作品）
- 长AI游戏视频（7个作品）
- 实拍纪录片（3个作品）

### Requirement: UI优化
网站SHALL具有以下UI优化：
- 更现代的卡片设计
- 更好的视觉层次
- 联系方式区域突出展示
- 响应式设计优化

## MODIFIED Requirements

### Requirement: 关于我模块
关于我模块SHALL包含三个卡片：
- 教育背景（保留现有内容）
- 项目经历（扩充内容）
- 专业技能（扩充内容）

## REMOVED Requirements

### Requirement: 获奖荣誉栏目
**Reason**: 用户要求删除，将获奖信息整合到项目经历中
**Migration**: 获奖信息可在项目经历中提及
