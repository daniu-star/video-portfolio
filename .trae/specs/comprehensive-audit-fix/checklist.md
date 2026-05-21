# Checklist

## CSS 统一
- [x] `style.css` 的 `:root` 变量包含所有页面所需的设计令牌
- [x] `style.css` 定义了统一的 navbar 样式
- [x] `style.css` 定义了统一的 footer 样式
- [x] `style.css` 定义了统一的 `.animate-on-scroll` / `.container` 基础组件
- [x] `style.css` 定义了统一的 h1-h6 字体规则
- [x] `index.html` 内联 `<style>` 中无重复的 `:root` 变量定义
- [x] `index.html` 内联 `<style>` 中无重复的 navbar / footer / 基础组件样式
- [x] `video-collection.html` 正确引用了 `<link rel="stylesheet" href="style.css">`
- [x] `video-collection.html` 内联 `<style>` 中无重复的 `:root` 变量定义和通用组件样式
- [x] `contact.html` 正确引用了 `<link rel="stylesheet" href="style.css">`
- [x] `contact.html` 内联 `<style>` 中无重复的 `:root` 变量定义和通用组件样式

## 字体统一
- [x] 所有页面标题使用 `var(--font-title)`（楷体）代替硬编码字体
- [x] 所有页面正文使用 `var(--font-body)`（微软雅黑/苹方）
- [x] 已移除未加载的 ZCOOL 字体引用
- [x] Google Fonts 链接已移除（使用系统字体无需外部加载）
- [x] 未加载 `Noto Sans SC`（已由系统字体替代）
- [x] h1-h6 的 font-size、font-weight、margin-bottom 在所有页面一致

## 视频加载
- [x] `script.js` 包含视频加载队列管理器
- [x] 同一时间最多 2 个视频同时加载
- [x] video-collection 页面所有视频可通过 IntersectionObserver 逐批加载
- [x] video-collection.html 不再包含重复的全局视频加载脚本（仅保留页面级的 hover/play 行为）

## 设计去 AI 化
- [x] `body::before` 点阵背景和 `body::after` 噪声纹理已移除
- [x] 卡片阴影强度降低（cta-primary glow 强度减半）
- [x] hover transform 偏移统一不超过 -3px
- [x] 渐变文字仅用于 logo 和 hero 标题
- [x] 技能标签 hover 移除 scale 过度动效

## 功能修复
- [x] 联系表单可降级为 mailto 方式
- [x] 表单提交失败时有清晰的用户提示
- [x] 所有页面 navbar 滚动行为一致（使用 `.scrolled` 类）
- [x] `script.js` 统一管理交互行为

## 性能优化
- [x] 无重复的内联 CSS 代码
- [x] `script.js` 使用 defer 加载
- [x] 资源预连接提示已添加（bilibili player）
