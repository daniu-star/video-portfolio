# Checklist

## CSS 统一（Task 1-4）
- [ ] `style.css` 是唯一 `:root` CSS 变量定义源
- [ ] `style.css` 定义了统一的 navbar（移除所有HTML内联navbar）
- [ ] `style.css` 定义了统一的 footer
- [ ] `style.css` 定义了统一的 `.animate-on-scroll` / `.container` / `.section-title`
- [ ] `style.css` 定义了统一的 h1-h6 字体规则
- [ ] `index.html` 内联 `<style>` 无 `:root`、navbar、footer、基础组件样式
- [ ] `video-collection.html` 正确引用 `style.css` 且无重复通用样式
- [ ] `contact.html` 正确引用 `style.css` 且无重复通用样式

## 字体统一（Task 5）
- [ ] 所有 HTML 文件无 Google Fonts `<link>` 标签
- [ ] 无 `ZCOOL QingKe HuangYou` / `ZCOOL KuaiLe` 引用
- [ ] 所有页面 body 使用统一字体栈（系统sans-serif）
- [ ] 所有页面标题使用统一字体栈（楷体serif fallback到sans-serif）

## 视频加载（Task 6-7）
- [ ] `script.js` 包含 `VideoLoadQueue`（maxConcurrent: 2）
- [ ] IntersectionObserver 触发条件下拉加载
- [ ] video-collection.html 不再有重复的视频hover/play脚本
- [ ] 核心视频有 poster 属性

## 设计去AI化（Task 8）
- [ ] `body::after` SVG噪声纹理已移除
- [ ] `body::before` 点阵从15个减少到≤5个
- [ ] cta-primary 阴影强度已削减
- [ ] hover transform 偏移统一 ≤ -3px
- [ ] 技能标签 hover 无 scale 动效
- [ ] 渐变文字仅用于 logo 和 hero 标题

## 功能修复（Task 9）
- [ ] 联系表单可降级为 mailto 方式
- [ ] 表单提交失败时有清晰的用户提示
- [ ] video-collection.html 复用 script.js 的交互逻辑
- [ ] contact.html 复用 script.js 的滚动动画逻辑

## 性能（Task 10）
- [ ] 无 Google Fonts 外部请求
- [ ] 无 `will-change` 滥用
- [ ] 各HTML内联CSS精简至最小
