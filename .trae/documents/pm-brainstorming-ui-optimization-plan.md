# PM Brainstorm Workbench — UI 设计优化任务文档

> 基于 Vercel Web Design Guidelines 逐页审查，覆盖字体、色彩、排版、动画、性能、无障碍等维度

---

## 一、全局性问题

### 1.1 字体系统

| 编号 | 问题 | 现状 | 优化方案 | 涉及文件 |
|------|------|------|----------|----------|
| G-F-01 | **中文字体回退链不完整** | `font-family: "PingFang SC", "Microsoft YaHei", "Inter", -apple-system...` | 添加 `"Noto Sans SC"` 作为跨平台中文字体回退，添加 `"Hiragino Sans GB"` 覆盖旧版 macOS；考虑引入 Google Fonts Noto Sans SC 作为 Web Font 确保非 macOS/Windows 设备中文渲染质量 | `globals.css` L53 |
| G-F-02 | **Inter 字体未实际加载** | `@font-face` 使用 `local("Inter")` 本地查找，用户未安装 Inter 时回退到系统字体 | 引入 Inter Web Font（Google Fonts CDN 或 self-host），设置 `font-display: swap`；仅加载 Latin 子集减少体积 | `globals.css` L42-48 |
| G-F-03 | **英文与中文混排间距不足** | 中英文混排时无额外间距，视觉上英文和中文紧贴 | 添加 CSS 规则：`text-autospace: ideograph-alpha;`（CSS Text 4）或通过 `letter-spacing` 微调 | `globals.css` |
| G-F-04 | **标题层级字体权重跳跃** | Landing 页 `font-extrabold`(800) 与正文 `font-medium`(500) 之间缺少 `font-bold`(700) 过渡 | 统一标题权重体系：H1=800, H2=700, H3=600, Body=400/500 | `page.tsx` L218 |
| G-F-05 | **代码/等宽字体未定义** | Markdown 渲染的代码块使用浏览器默认等宽字体 | 在 `tailwind.config.ts` 的 `fontFamily.mono` 中明确定义 `"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace` | `tailwind.config.ts` |
| G-F-06 | **数字排版不一致** | Token 数量、消息计数等数字未使用等宽数字 | 添加 `font-variant-numeric: tabular-nums` 到所有数字展示元素 | `Header.tsx` L92, `ChatPanel.tsx` L44 |

### 1.2 色彩系统

| 编号 | 问题 | 现状 | 优化方案 | 涉及文件 |
|------|------|------|----------|----------|
| G-C-01 | **角色色定义不一致** | 后端 `role_prompts.py` 定义 CTO=#3b82f6(blue)，前端 `ROLES_DATA` 定义 CTO=#d97706(amber)；前端 `accent.cto`=#e07a2f 又不同 | 统一角色色：CTO=蓝(#3b82f6)、设计师=紫(#a855f7)、运营=绿(#22c55e)、用户=橙(#f97316)，删除 `accent.cto` 与 `accent.user` 的琥珀色复用 | `tailwind.config.ts` L36-37, `page.tsx` ROLES_DATA, `role_prompts.py` |
| G-C-02 | **warm 色板对比度不足** | warm-400(#b8a898) 在 warm-50(#faf8f5) 背景上对比度约 2.8:1，不满足 WCAG AA 4.5:1 | 将 warm-400 用于装饰性元素，文字最低使用 warm-500(#8b6f47)；添加 `--text-muted` 对比度校验 | `globals.css` L10 |
| G-C-03 | **缺少暗色模式支持** | 全局仅有亮色方案，面试页暗色主题硬编码 | 建立 CSS 变量暗色方案（至少覆盖面试页），使用 `prefers-color-scheme` 媒体查询 | `globals.css` |
| G-C-04 | **语义色与角色色冲突** | `--color-amber`(#e07a2f) 与 `accent.cto`(#e07a2f) 相同，CTO 不应是琥珀色 | 将 `accent.cto` 改为蓝色(#3b82f6)，与后端角色色一致 | `tailwind.config.ts` L36 |
| G-C-05 | **渐变过度使用** | Landing 页、Login 页、按钮、输入框焦点、CTA 等大量使用 `from-amber-500 to-orange-500` 渐变 | 减少渐变使用场景：仅 CTA 按钮和 Logo 使用渐变；其他场景改用纯色 + 微妙阴影 | `page.tsx`, `login/page.tsx` |
| G-C-06 | **面试页色彩系统割裂** | 面试页使用 `slate`/`zinc`/`dark-900` 色系，与主站 `warm` 色系完全不同 | 面试页也使用 warm 色系为基础，红色作为强调色；或建立统一的暗色 warm 方案 | `InterviewClientPage.tsx`, `InterviewView.tsx` |

### 1.3 排版与布局

| 编号 | 问题 | 现状 | 优化方案 | 涉及文件 |
|------|------|------|----------|----------|
| G-L-01 | **全局间距系统不统一** | 混用 `mb-4`(16px)、`mb-6`(24px)、`gap-3`(12px)、`gap-4`(16px) 无规律 | 建立基于 4px 网格的间距 token：`space-1=4px, space-2=8px, space-3=12px, space-4=16px, space-6=24px, space-8=32px`，在 `tailwind.config.ts` 中定义 | `tailwind.config.ts` |
| G-L-02 | **z-index 层级混乱** | 散用 z-10, z-20, z-30, z-40, z-50, z-60，无统一规范 | 定义 z-index token：`z-base=0, z-dropdown=10, z-sticky=20, z-overlay=30, z-modal=40, z-toast=50, z-tooltip=60` | 全局 |
| G-L-03 | **圆角系统不一致** | 同时使用 `rounded-xl`(12px)、`rounded-2xl`(16px)、`rounded-lg`(8px)、`rounded-[4px]` 无规律 | 统一圆角规范：按钮=8px, 卡片=12px, 弹窗=16px, 输入框=8px, 头像=50% | 全局 |
| G-L-04 | **缺少响应式断点设计** | 仅 `md:` (768px) 一个断点，无 `lg:` / `xl:` 适配 | 添加 `lg:`(1024px) 和 `xl:`(1280px) 断点，工作台 Chat 面板在 lg 以上宽度从 440px 扩展到 520px | `WorkbenchClientPage.tsx` L185 |
| G-L-05 | **内容最大宽度未约束** | 部分区域内容无限延伸，超宽屏下阅读体验差 | 为文本内容区设置 `max-w-prose` 或 `max-w-2xl`，居中显示 | `TimelineView.tsx`, `InterviewView.tsx` |

### 1.4 动画与性能

| 编号 | 问题 | 现状 | 优化方案 | 涉及文件 |
|------|------|------|----------|----------|
| G-A-01 | **未尊重 `prefers-reduced-motion`** | 15+ 个 CSS 动画均无 reduced-motion 回退 | 添加 `@media (prefers-reduced-motion: reduce)` 全局规则，将所有动画设为 `animation: none` 或仅保留 opacity 变化 | `globals.css` |
| G-A-02 | **`transition: all` 滥用** | 多处使用 `transition-all duration-200`，触发不必要的属性过渡 | 改为精确属性：`transition-colors duration-200` 或 `transition-[transform,box-shadow] duration-200` | 全局 |
| G-A-03 | **Landing 页入场动画阻塞** | 5 批 `duration-700` + `delay-100~500ms` 动画总时长 1.2s，首屏内容延迟可见 | 减少延迟批数到 3 批，缩短 duration 到 500ms；首屏内容（标题+输入框）无延迟直接显示 | `page.tsx` L209-333 |
| G-A-04 | **消息列表无虚拟滚动** | 消息量增多时 DOM 节点持续增长，影响渲染性能 | 引入 `react-virtuoso` 或 `@tanstack/react-virtual` 实现虚拟列表 | `MessageList.tsx` |
| G-A-05 | **React Markdown 每次全量渲染** | 每条消息的 ReactMarkdown 组件在流式更新时重复解析 | 流式态使用纯文本 `<p>` 渲染（已做），但非流式态的 ReactMarkdown 可用 `useMemo` 缓存解析结果 | `MessageBubble.tsx` L108-113 |
| G-A-06 | **Canvas 粒子动画使用 CSS** | `.canvas-particle` 5 个元素无实际动画定义（缺少 `@keyframes`） | 要么删除无用的粒子元素，要么添加 `float` 动画关键帧 | `globals.css`, `CanvasPanel.tsx` L130-135 |

### 1.5 无障碍

| 编号 | 问题 | 现状 | 优化方案 | 涉及文件 |
|------|------|------|----------|----------|
| G-A11Y-01 | **缺少 Skip to Content 链接** | 无跳过导航直接到内容的快捷方式 | 在 `<body>` 顶部添加 visually-hidden 的 "Skip to content" 链接 | `layout.tsx` |
| G-A11Y-02 | **颜色作为唯一状态指示** | 角色选择仅靠颜色区分，色盲用户无法辨别 | 为每个角色添加文字标签或图标差异 | `RoleSelector.tsx` |
| G-A11Y-03 | **`<meta name="theme-color">` 缺失** | 浏览器地址栏颜色未设置 | 在 `layout.tsx` 的 `<head>` 中添加 `<meta name="theme-color" content="#faf8f5">` | `layout.tsx` |
| G-A11Y-04 | **`color-scheme` 未设置** | 暗色主题页面未设置 `color-scheme: dark` | 面试页暗色区域添加 `style={{ colorScheme: 'dark' }}` | `InterviewClientPage.tsx` |
| G-A11Y-05 | **图标按钮缺少可见标签** | 导出、设置、充值等按钮仅有 `aria-label`，无可见文字 | 考虑为关键操作按钮添加 tooltip 或文字标签 | `Header.tsx` L96-126 |

---

## 二、Landing 首页 (`app/page.tsx`)

| 编号 | 问题类别 | 现状描述 | 优化方案 | 具体位置 |
|------|----------|----------|----------|----------|
| L-01 | **背景** | `bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50` 渐变 + `.landing-blobs` 4 个光斑 + `.landing-dots` 点阵，层次过多 | 简化为一层微妙的径向渐变 + 点阵，删除 `.landing-blobs`；减少 GPU 合成层 | L133-135 |
| L-02 | **导航栏** | `h-14 bg-white border-b border-amber-200` 纯白导航与暖色页面割裂 | 改为 `bg-warm-50/80 backdrop-blur` 半透明暖色导航，与页面背景融合 | L138 |
| L-03 | **Logo** | 渐变方块 `from-amber-400 via-orange-500 to-rose-500`，视觉过重 | 简化为单色琥珀 `bg-amber-500` 或双色微妙渐变 `from-amber-500 to-orange-500` | L141 |
| L-04 | **标题排版** | `text-4xl md:text-5xl font-extrabold leading-[1.1]` 行高过紧，中文标题 1.1 行高导致笔画重叠 | 改为 `leading-[1.2]` 或 `leading-tight`；中文标题建议最小行高 1.3 | L218 |
| L-05 | **副标题** | `text-2xl md:text-3xl font-semibold tracking-wide` 与主标题字号差距不够 | 主标题 `text-5xl`，副标题 `text-xl`，拉开层级对比 | L223 |
| L-06 | **角色卡片** | 4 个角色图标 `w-11 h-11 rounded-xl` 过小，hover 效果 `scale-110` 不够明显 | 增大到 `w-14 h-14`，添加角色名下方描述文字（已有 desc 但未渲染），hover 改为 `scale-115 + shadow-lg` | L238-249 |
| L-07 | **输入区卡片** | `bg-white border border-amber-200 rounded-2xl p-5 shadow-lg shadow-amber-100` 阴影过重 | 改为 `shadow-md`，减少阴影扩散；边框改为 `border-warm-200` 统一色系 | L254 |
| L-08 | **Prompt 模板** | `text-[10px]` 字号过小（10px），不满足最小可读字号 12px | 改为 `text-xs`(12px)，减少模板数量到 2-3 个避免拥挤 | L280 |
| L-09 | **CTA 按钮** | 渐变按钮 + `shadow-md shadow-amber-200` 双重阴影过重 | 改为纯色 `bg-amber-600 hover:bg-amber-700` + 单层阴影 | L296 |
| L-10 | **特性卡片** | 3 列 `grid-cols-3` 在移动端过窄，卡片内容拥挤 | 移动端改为 `grid-cols-1`，`md:grid-cols-3` | L314 |
| L-11 | **底部文字** | `text-[10px] text-amber-500` 字号过小且颜色过浅 | 改为 `text-xs text-warm-400` | L332 |
| L-12 | **整体垂直居中** | `min-h-screen flex items-center justify-center` 在有导航栏时内容被遮挡 | 添加 `pt-14` 补偿导航高度（已有），但内容在短屏幕下溢出 | L206 |

---

## 三、Login 登录页 (`app/login/page.tsx`)

| 编号 | 问题类别 | 现状描述 | 优化方案 | 具体位置 |
|------|----------|----------|----------|----------|
| LG-01 | **背景** | 与 Landing 相同的渐变 + blobs + dots，登录页无需如此丰富的背景 | 简化为纯色 `bg-warm-50` + 微妙径向渐变，删除 blobs 和 dots | L75-77 |
| LG-02 | **卡片宽度** | `max-w-sm`(384px) 偏窄，输入框和按钮拥挤 | 改为 `max-w-md`(448px) | L79 |
| LG-03 | **Logo 图标** | SVG 麦克风图标与产品"脑暴"主题不符 | 使用与 Landing 一致的脑图标（灯泡/大脑），保持品牌一致性 | L83-88 |
| LG-04 | **标签文字** | `text-[11px] font-bold tracking-wide uppercase` 中文标签使用 uppercase 无意义 | 删除 `uppercase` 和 `tracking-wide`，中文标签使用 `text-xs font-semibold` | L101, L112 |
| LG-05 | **输入框** | `border-amber-200` 焦点 `ring-amber-100` 焦点环过浅不可见 | 焦点环改为 `ring-amber-500/30`，提高可见性 | L108, L120 |
| LG-06 | **验证码按钮** | `min-w-[100px]` 在小屏幕上挤压输入框 | 改为输入框下方全宽按钮，或 `min-w-[88px]` | L125 |
| LG-07 | **验证码展示** | `text-base font-bold tracking-widest` 字号偏小 | 改为 `text-2xl font-bold font-mono tracking-[0.3em]`，等宽字体更适合验证码 | L138 |
| LG-08 | **错误提示** | `bg-red-50 border-red-200 text-red-600` 与暖色系统不协调 | 改为 `bg-red-50/80 border-red-300 text-red-700` | L165 |
| LG-09 | **缺少返回首页** | 登录页无返回首页入口 | 在卡片顶部添加返回箭头 | - |

---

## 四、Workbench 工作台 (`app/session/[id]/WorkbenchClientPage.tsx`)

| 编号 | 问题类别 | 现状描述 | 优化方案 | 具体位置 |
|------|----------|----------|----------|----------|
| W-01 | **加载页** | `bg-warm-50 bg-warm-workbench bg-grid-warm` 三层背景 + 4 个弹跳头像，视觉杂乱 | 简化为 `bg-warm-50` 纯色 + 居中 Logo + 简洁进度条；删除网格背景 | L98-125 |
| W-02 | **加载动画** | 4 个头像 `animate-bounce` + 进度条 `animate-pulse` 双重动画干扰 | 改为 Logo 呼吸动画 + 文字淡入，删除弹跳头像 | L106-117 |
| W-03 | **双栏比例** | Canvas `flex-1` + Chat `md:w-[440px]`，Canvas 占比过大 | Chat 面板改为 `md:w-[480px]`，Canvas 最小宽度 `min-w-[320px]` | L185 |
| W-04 | **移动端 Tab** | `画布/聊天` 文字 Tab 无图标，辨识度低 | 添加图标：画布📊 + 聊天💬 | L157-175 |
| W-05 | **分隔线** | `border-l border-warm-200` 双栏分隔线过细 | 改为 `border-l-2 border-warm-300` 或添加 1px 阴影分隔 | L183 |
| W-06 | **错误页** | 错误卡片样式与 Landing 重复，无差异化 | 添加错误类型图标区分（网络错误/会话过期/权限不足） | L127-149 |

---

## 五、Header 导航栏 (`components/Header.tsx`)

| 编号 | 问题类别 | 现状描述 | 优化方案 | 具体位置 |
|------|----------|----------|----------|----------|
| H-01 | **高度** | `h-12`(48px) 偏矮，按钮拥挤 | 改为 `h-14`(56px)，与 Landing 导航一致 | L46 |
| H-02 | **Logo 文字** | "产品脑暴工作台" 过长，挤压右侧空间 | 改为 "PM Brainstorm" 或缩写 "脑暴台" | L53 |
| H-03 | **分隔符** | `text-warm-300` 竖线分隔符视觉过弱 | 改为 `border-l border-warm-200 h-4` 或删除，用间距代替 | L56 |
| H-04 | **阶段标签** | `text-xs font-medium` 过小，不够突出 | 改为 `text-sm font-semibold` + 对应阶段色背景 pill | L57 |
| H-05 | **按钮图标** | 导出/设置/充值按钮仅图标无文字，新用户不理解 | 添加 tooltip（hover 显示文字说明） | L96-126 |
| H-06 | **额度指示** | `text-xs` + 圆点 + 数字，信息密度过高 | 改为进度条形式：`w-20 h-1.5 rounded-full bg-warm-200` + 填充色 | L80-93 |
| H-07 | **背景模糊** | `bg-white/90 backdrop-blur` 在低端设备性能差 | 添加 `@supports (backdrop-filter: blur(1px))` 条件，不支持时回退到 `bg-white` | L46 |

---

## 六、Chat 聊天面板 (`components/chat/`)

### 6.1 ChatPanel

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| CP-01 | 顶栏 `h-11` 偏矮，按钮排列过密 | 改为 `h-12`，按钮间距从 `ml-2` 改为 `gap-2` | L39 |
| CP-02 | 消息计数 `text-[10px]` 过小 | 改为 `text-xs` | L44 |
| CP-03 | 画像按钮样式与工具栏不协调 | 改为 icon-only + tooltip，与其他按钮统一 | L47-69 |
| CP-04 | 聊天区背景 `chat-area-bg` 径向渐变不明显 | 改为纯色 `bg-warm-50` 或更明显的纹理 | L136 |
| CP-05 | 错误提示关闭按钮 `min-h-[44px] min-w-[44px]` 过大 | 改为 `min-h-[32px] min-w-[32px]`，错误条本身不需要大触控区 | L116 |

### 6.2 MessageBubble

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| MB-01 | 用户气泡渐变背景 `linear-gradient(135deg, #fffbeb, rgba(254,243,199,0.8))` 过浅 | 改为 `bg-amber-50 border border-amber-200`，删除渐变 | L48-49 |
| MB-02 | 用户气泡右侧 3px 琥珀色条 `bg-amber-400` 与边框色冲突 | 改为 `bg-amber-500` 增强对比，或删除色条改用左边框 | L52 |
| MB-03 | AI 气泡 `max-w-[85%]` 在窄屏下过宽 | 改为 `max-w-[80%]` | L84, L147 |
| MB-04 | 面试官气泡双层标签（红色+浅红）占据过多空间 | 合并为单标签 `bg-red-500 text-white` | L98-105 |
| MB-05 | 角色标签 `text-[10px]` 过小 | 改为 `text-[11px]` | L99, L165 |
| MB-06 | 流式光标 `▊` 方块字符在某些字体下过宽 | 改为 `▎` 或 `│` 更细的光标字符 | `globals.css` L148 |
| MB-07 | 气泡 hover 上浮 `-translate-y-px` 过于微妙 | 改为 `-translate-y-0.5` 或删除 hover 效果（聊天消息不需要 hover 反馈） | L86, L149 |
| MB-08 | Markdown 渲染 `prose prose-sm` 未自定义样式 | 添加 `prose-amber` 主题色，自定义链接色、代码块背景 | L108, L172 |

### 6.3 InputBox

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| IB-01 | 输入框 `bg-warm-50` 背景色与聊天区背景相同，无层次感 | 改为 `bg-white border border-warm-200` | - |
| IB-02 | 发送按钮渐变 `from-amber-500 to-orange-500` 圆形，与输入框风格不搭 | 改为方形圆角 `rounded-xl`，纯色 `bg-amber-600` | - |
| IB-03 | 麦克风按钮 4 种状态切换无过渡 | 添加 `transition-all duration-300` | - |
| IB-04 | 阶段提示条与输入框视觉分离 | 将阶段提示整合到输入框内部上方 | - |

### 6.4 RoleSelector

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| RS-01 | 选中态 `scale-110` + `box-shadow` 过于夸张 | 改为 `scale-105` + 底部 2px 色条指示 | - |
| RS-02 | "全部@" 按钮四色渐变边框视觉噪音 | 改为 `border-2 border-warm-300` + 选中态 `border-amber-500` | - |
| RS-03 | 水平滚动无滚动指示 | 添加渐变遮罩提示可滚动 | - |

---

## 七、Canvas 画布面板 (`components/canvas/`)

### 7.1 CanvasPanel

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| CV-01 | 空状态粒子 `.canvas-particle` 无动画定义 | 添加 `@keyframes canvasFloat` 或删除粒子 | L130-135 |
| CV-02 | 空状态 BrainIcon `text-amber-500/60` 过浅 | 改为 `text-amber-400` | L98 |
| CV-03 | Tab 栏 `bg-warm-50/80` 半透明无必要 | 改为 `bg-white` 纯色 | L27 |
| CV-04 | 流式态 `scale-125 animate-pulse` 图标放大 125% 过于夸张 | 改为 `scale-110` | L93 |

### 7.2 TimelineView

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| TV-01 | 中轴线 `border-left: 2px dashed` 虚线视觉过弱 | 改为 `border-left: 2px solid rgba(224,122,47,0.2)` 实线 | `globals.css` L272 |
| TV-02 | 左右交替布局在移动端不适用 | 移动端改为单列左对齐，中轴线在左侧 | L31-78 |
| TV-03 | 主题标题 `text-xl font-semibold` 层级不够 | 改为 `text-2xl font-bold` | L25 |
| TV-04 | `minHeight: timeline.length * 100` 硬编码最小高度 | 删除，让内容自然撑开 | L28 |

### 7.3 TimelineNodeCard

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| TNC-01 | 固定宽度 `w-[260px]` 在窄屏下溢出 | 改为 `max-w-[280px] w-full` | - |
| TNC-02 | 左侧色条 4px 过粗 | 改为 3px | - |
| TNC-03 | 背景渐变 `from-{color}-100 to-transparent` 过于明显 | 改为 `from-{color}-50 to-transparent` 更微妙 | - |
| TNC-04 | 右下角大号半透明图标 `opacity-15` 装饰无意义 | 删除，减少视觉噪音 | - |

### 7.4 ProductPortrait

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| PP-01 | 卡片间距不统一 | 统一使用 `space-y-4` | - |
| PP-02 | 配色方案色块圆 + hex 值排列不美观 | 改为水平色条展示，hex 值在色条下方 | - |
| PP-03 | 功能标签（必备/加分）颜色区分不够 | 必备=实色 pill，加分=描边 pill | - |

### 7.5 ProductWireframe

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| PW-01 | 虚线边框 `border-dashed border-warm-300` 过于简陋 | 添加浅色填充 `bg-warm-50/50` + 区域标签文字 | - |
| PW-02 | 占位块无文字说明 | 每个区域添加标签（Header/Nav/Content 等） | - |

---

## 八、Interview 面试页 (`components/interview/`)

### 8.1 InterviewClientPage

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| IC-01 | 加载页 `bg-dark-900 bg-interview bg-grid` 暗色主题与主站割裂 | 改为暖色加载页 `bg-warm-50`，红色强调 | L40 |
| IC-02 | 加载页 `text-zinc-300` 在暗色背景上可读性差 | 统一为 warm 色系 | L45 |

### 8.2 InterviewView

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| IV-01 | 用户消息 `bg-gradient(135deg, #f59e0b, #d97706)` 琥珀渐变 + 白色文字对比度仅 2.1:1 | 改为 `bg-amber-600 text-white`（对比度 4.6:1）或 `bg-amber-100 text-amber-900` | L165 |
| IV-02 | AI 消息 `bg-white border-slate-200/80` 与 ChatPanel 的红色主题不一致 | 改为 `bg-red-50/50 border-red-200/60` 保持面试红色调 | L197 |
| IV-03 | AI 头像 `border-slate-600` 暗色边框与暖色背景不搭 | 改为 `border-red-300` | L180 |
| IV-04 | "压力测试中" 标签 `animate-pulse` 红色圆点持续闪烁干扰阅读 | 改为静态红色圆点 | L192 |
| IV-05 | 消息间距 `mb-4` 统一，无分组逻辑 | 参考 ChatPanel 的分组逻辑，同角色消息紧凑排列 | - |
| IV-06 | 空状态头像 `border-2 border-slate-700` 暗色边框与暖色背景冲突 | 改为 `border-2 border-red-300` | L84 |

### 8.3 InterviewHeader

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| IH-01 | `bg-gradient-to-r from-slate-900 to-slate-800` 暗色导航与主站白色导航割裂 | 改为 `bg-white/90 backdrop-blur border-b border-red-200`，红色强调 | - |
| IH-02 | VoiceToggle `bg-dark-800 border-zinc-700/50` 暗色控件 | 改为 `bg-warm-100 border-warm-200` 亮色控件 | - |

### 8.4 InterviewInput

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| II-01 | 电话模式 `bg-gradient-to-b from-slate-800 to-slate-900` 全暗色 | 改为 `bg-warm-50` 暖色背景 + 红色强调元素 | - |
| II-02 | 波形条 12 个 `.phone-waveform-bar` 动画性能差 | 减少到 6-8 个，使用 CSS `will-change: height` | - |
| II-03 | 录音按钮 `w-20 h-20` 过大 | 改为 `w-16 h-16` | - |

---

## 九、Modal 弹窗系统

### 9.1 OnboardingModal

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| OM-01 | 4 步引导进度条 `h-1` 过细 | 改为 `h-1.5` 或 `h-2` | - |
| OM-02 | 步骤间无过渡动画 | 添加 `animate-[fadeInUp_0.3s_ease-out]` | - |

### 9.2 SettingsModal

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| SM-01 | API Key 输入框无密码遮罩切换 | 添加显示/隐藏密码按钮 | - |
| SM-02 | 表单无即时验证 | 添加 Base URL 格式校验 | - |

### 9.3 RechargeModal

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| RM-01 | 步骤指示器圆形数字+连接线视觉过简 | 添加完成态 ✓ 图标和当前态高亮 | - |
| RM-02 | 充值档位卡片无选中态 | 添加 `ring-2 ring-amber-500` 选中指示 | - |

---

## 十、HistoryDrawer 历史抽屉

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| HD-01 | 宽度 `w-[360px]` 在小屏幕上过宽 | 改为 `w-[320px] max-w-[85vw]` | - |
| HD-02 | 遮罩 `bg-warm-600/30 backdrop-blur-sm` 模糊影响性能 | 改为 `bg-warm-600/20` 无模糊 | - |
| HD-03 | 会话卡片 `hover:bg-warm-100 active:scale-[0.98]` 缩放效果不必要 | 删除 `active:scale`，仅保留 hover 背景色变化 | - |
| HD-04 | 骨架屏 4 个 `animate-pulse` 块无形状差异 | 根据实际内容设计不同宽度的骨架条 | - |
| HD-05 | 无搜索/筛选功能 | 添加搜索框和阶段筛选 | - |

---

## 十一、Toast 通知

| 编号 | 问题 | 优化方案 | 位置 |
|------|------|----------|------|
| T-01 | 位置 `fixed top-16 right-4` 可能被 Header 遮挡 | 改为 `top-4 right-4 z-[60]` | - |
| T-02 | 4 种类型颜色不统一（emerald/red/amber/amber） | 统一：success=emerald, error=red, warning=amber, info=blue | - |
| T-03 | 最多 5 条可能遮挡内容 | 改为最多 3 条 | - |

---

## 十二、执行优先级排序

### P0 — 必须修复（影响可用性/可读性）

1. **G-C-01** 角色色统一（CTO=蓝，当前前后端不一致）
2. **IV-01** 面试页用户消息对比度不足（WCAG 不合规）
3. **G-F-02** Inter 字体未加载（英文渲染质量差）
4. **G-A-01** 缺少 `prefers-reduced-motion` 支持
5. **G-C-02** warm-400 对比度不足用于文字
6. **L-08** Prompt 模板 10px 字号过小

### P1 — 重要优化（影响视觉品质）

7. **G-C-06** 面试页色彩系统割裂
8. **G-F-01** 中文字体回退链
9. **L-04** 标题行高过紧
10. **G-L-01** 间距系统统一
11. **G-L-03** 圆角系统统一
12. **W-03** 双栏比例调整
13. **MB-01/02** 用户气泡样式优化
14. **TV-02** 时间线移动端适配

### P2 — 体验提升（锦上添花）

15. **G-A-04** 消息列表虚拟滚动
16. **G-A-03** Landing 入场动画优化
17. **H-05** 按钮添加 tooltip
18. **HD-05** 历史抽屉搜索
19. **G-C-05** 减少渐变使用
20. **PP-02/03** 产品画像视觉优化

---

## 十三、设计 Token 建议规范

### 字体

```
font-sans: "Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", -apple-system, sans-serif
font-mono: "JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace
```

### 间距（4px 网格）

```
space-0.5: 2px, space-1: 4px, space-1.5: 6px, space-2: 8px,
space-3: 12px, space-4: 16px, space-5: 20px, space-6: 24px,
space-8: 32px, space-10: 40px, space-12: 48px
```

### 圆角

```
radius-sm: 6px (小按钮/标签)
radius-md: 8px (输入框/按钮)
radius-lg: 12px (卡片)
radius-xl: 16px (弹窗)
radius-full: 9999px (头像/pill)
```

### 阴影

```
shadow-xs: 0 1px 2px rgba(139,111,71,0.04)
shadow-sm: 0 1px 3px rgba(139,111,71,0.06), 0 1px 2px rgba(139,111,71,0.04)
shadow-md: 0 4px 12px rgba(139,111,71,0.08), 0 2px 4px rgba(139,111,71,0.04)
shadow-lg: 0 12px 32px rgba(139,111,71,0.1), 0 4px 8px rgba(139,111,71,0.06)
```

### z-index

```
z-base: 0, z-dropdown: 10, z-sticky: 20, z-overlay: 30,
z-modal: 40, z-toast: 50, z-tooltip: 60
```
