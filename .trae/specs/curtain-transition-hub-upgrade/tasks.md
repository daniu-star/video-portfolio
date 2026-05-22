# Tasks

- [x] Task 1: 实现帷幕式页面过渡动画
  - [x] SubTask 1.1: 在index.html中添加帷幕过渡层HTML结构（.curtain-transition > .curtain-panel）
  - [x] SubTask 1.2: 在style.css中添加帷幕样式（深色+织物纹理+波浪下边缘+缓动动画）
  - [x] SubTask 1.3: 在script.js中替换enter-portfolio的淡出逻辑为帷幕拉动动画（从上往下覆盖→Hub页显现→帷幕继续向下消失）
  - [x] SubTask 1.4: 移除旧的opacity淡出过渡代码

- [x] Task 2: 重新设计Hub页背景
  - [x] SubTask 2.1: 下载电影质感Hub背景图（深靛蓝+琥珀金光晕+东方美学氛围，1920×1080）
  - [x] SubTask 2.2: 修改.hub-bg CSS，使用下载的背景图+多层叠加效果（暖色光晕+纹理+暗角）
  - [x] SubTask 2.3: 调整Hub页文字颜色和对比度，确保在新背景上可读
  - [x] SubTask 2.4: 优化hubBgShift动画，让光晕缓慢呼吸移动

- [x] Task 3: 替换分类按钮音效为深沉东方乐器音效
  - [x] SubTask 3.1: 用Python生成4个高质量多泛音钟声/鼓声音效WAV文件（44100Hz 16bit，6层泛音+自然衰减+beating效果）
  - [x] SubTask 3.2: 验证音效文件质量（文件大小>50KB，时长0.5-1.5s）
  - [x] SubTask 3.3: 确认script.js中音效路径和音量设置正确

- [x] Task 4: Playwright自动化UI审计与诊断
  - [x] SubTask 4.1: 启动本地HTTP服务器
  - [x] SubTask 4.2: 使用Playwright逐页截图（Landing/Hub/Player三层）
  - [x] SubTask 4.3: 检查文字可读性、按钮触控区域、海报加载状态
  - [x] SubTask 4.4: 检查移动端视口（375×812）布局
  - [x] SubTask 4.5: 生成诊断报告，列出所有问题

- [x] Task 5: 根据诊断结果优化布局
  - [x] SubTask 5.1: 修复诊断报告中发现的布局问题（移动端enter按钮min-height: 44px）
  - [x] SubTask 5.2: 修复海报显示问题（Playwright确认海报正常加载）
  - [x] SubTask 5.3: 修复移动端适配问题（enter按钮高度不足已修复）
  - [x] SubTask 5.4: 优化间距和文字层级（审计确认无其他问题）

# Task Dependencies
- [Task 1] 独立（帷幕过渡可先行）
- [Task 2] 独立（Hub背景可并行）
- [Task 3] 独立（音效可并行）
- [Task 4] depends on [Task 1, 2, 3]（审计需在所有改动完成后执行）
- [Task 5] depends on [Task 4]（优化基于诊断结果）
