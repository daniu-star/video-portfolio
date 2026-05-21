# Tasks

- [ ] Task 1: 修复CSS冲突 — 删除index.html内联中与style.css重复的.bento-card定义
  - [ ] SubTask 1.1: 读取index.html内联style，识别所有与style.css重复的选择器
  - [ ] SubTask 1.2: 删除重复的.bento-card及其子选择器定义
  - [ ] SubTask 1.3: 统一CSS变量引用（--glass → --bg-glass, --glass-border → --border-glass）
  - [ ] SubTask 1.4: 验证页面渲染无回归

- [ ] Task 2: 增强视频模态框 — 添加音量/倍速/画中画/键盘快捷键
  - [ ] SubTask 2.1: 在模态框HTML中添加音量滑块、倍速选择器、画中画按钮
  - [ ] SubTask 2.2: 在script.js中实现音量控制逻辑
  - [ ] SubTask 2.3: 实现倍速切换逻辑（0.5x/1x/1.5x/2x）
  - [ ] SubTask 2.4: 实现画中画API调用
  - [ ] SubTask 2.5: 添加键盘快捷键（空格暂停、←→快进、Esc关闭）
  - [ ] SubTask 2.6: 添加播放进度记忆（localStorage存储/恢复）
  - [ ] SubTask 2.7: 添加模态框控制相关CSS样式

- [ ] Task 3: 导航栏滚动联动 + 页面滚动进度条
  - [ ] SubTask 3.1: 在script.js中实现IntersectionObserver检测当前section
  - [ ] SubTask 3.2: 实现导航链接自动高亮逻辑
  - [ ] SubTask 3.3: 在index.html中添加顶部滚动进度条HTML
  - [ ] SubTask 3.4: 在style.css中添加进度条样式
  - [ ] SubTask 3.5: 在script.js中实现进度条更新逻辑

- [ ] Task 4: 视频搜索筛选功能
  - [ ] SubTask 4.1: 在index.html视频区顶部添加搜索框和分类筛选按钮
  - [ ] SubTask 4.2: 在style.css中添加搜索框和筛选按钮样式
  - [ ] SubTask 4.3: 在script.js中实现搜索筛选逻辑（关键词匹配+分类过滤）

- [ ] Task 5: 表单实时验证 + 主题切换记忆
  - [ ] SubTask 5.1: 在contact.html中添加表单实时验证逻辑（邮箱格式、必填项）
  - [ ] SubTask 5.2: 添加验证错误提示样式
  - [ ] SubTask 5.3: 在script.js中实现主题切换localStorage记忆
  - [ ] SubTask 5.4: 页面加载时读取localStorage并应用主题

- [ ] Task 6: 视觉艺术化提升
  - [ ] SubTask 6.1: 优化Hero区Orb/粒子层次，减少视觉噪音
  - [ ] SubTask 6.2: 视频描述展开改用spring easing动画
  - [ ] SubTask 6.3: 视频卡片hover时显示时长标签
  - [ ] SubTask 6.4: Footer添加品牌slogan和社交链接图标
  - [ ] SubTask 6.5: 回到顶部按钮添加滚动进度环

- [ ] Task 7: 验证与上传
  - [ ] SubTask 7.1: 使用agent-browser截图验证所有页面
  - [ ] SubTask 7.2: 测试视频加载、模态框、搜索、表单等功能
  - [ ] SubTask 7.3: git commit & push到GitHub

# Task Dependencies
- [Task 1] 独立（CSS修复优先）
- [Task 2] depends on [Task 1]（模态框增强需基于干净的CSS）
- [Task 3] 独立（导航联动可并行）
- [Task 4] 独立（搜索筛选可并行）
- [Task 5] 独立（表单验证可并行）
- [Task 6] depends on [Task 1]（视觉提升需基于干净的CSS）
- [Task 7] depends on [Task 1-6]（最终验证需所有功能就绪）
