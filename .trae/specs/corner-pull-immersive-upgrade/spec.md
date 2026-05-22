# 帷幕角拉过渡与沉浸式体验升级 Spec

## Why
当前网站存在五个核心体验问题：①Landing→Hub的帷幕过渡是从上往下的机械拉动，用户要求改为从右下角拉走帷幕的自然效果；②Hub页分类按钮音效仍不够高级，需要从专业音效库获取；③Hub→Player的页面切换是硬跳转，缺乏渐进式过渡；④视频封面图偏灰色调，需要替换为符合视频风格的彩色封面；⑤Landing页UI元素过于简单，缺少丰富的视觉层次。

## What Changes
- **BREAKING** 替换Landing→Hub过渡动画：从上往下拉动改为从右下角拉走帷幕
- 替换Hub页分类按钮音效：从Python合成音改为专业音效库下载的高品质音效
- 新增Hub→Player渐进式过渡：分类按钮点击后，帷幕式渐进展开进入视频界面
- 替换19个视频封面图：从灰色/黑色调改为符合视频风格的彩色封面
- 丰富Landing页UI元素：增加装饰性元素和视觉层次

## Impact
- Affected specs: 页面过渡系统、音效系统、封面图系统、Landing页视觉设计
- Affected code: `style.css`、`script.js`、`index.html`、`sounds/`目录、`posters/`目录

## ADDED Requirements

### Requirement: 右下角拉走帷幕过渡
当用户点击"进入作品集"时，系统 SHALL 以帷幕从右下角被拉走的方式完成从Landing页到Hub页的过渡。

#### Scenario: 用户点击进入作品集
- **WHEN** 用户点击"进入作品集"按钮
- **THEN** 帷幕从右下角开始被"拉走"，像掀开一块布一样，从右下角向左上角逐渐揭开，露出下方的Hub页内容

#### 动画细节
- 帷幕初始状态：完全覆盖Landing页
- 动画方向：从右下角向左上角逐渐拉开
- 使用CSS clip-path或transform实现对角线揭示效果
- 过渡时间1.2-1.5秒
- 缓动函数：`cubic-bezier(0.65, 0, 0.35, 1)` 模拟自然拉扯

### Requirement: Hub→Player渐进式过渡
当用户点击Hub页分类按钮时，系统 SHALL 以渐进式方式过渡到Player页，而非硬跳转。

#### Scenario: 用户点击分类按钮
- **WHEN** 用户点击"AI纪录片"等分类按钮
- **THEN** 播放音效后，当前Hub页内容逐渐淡出缩小，Player页内容从中心逐渐放大显现，过渡时间0.8-1秒

#### 动画细节
- Hub页：opacity 1→0 + scale 1→0.95，持续0.6秒
- Player页：opacity 0→1 + scale 1.05→1，延迟0.3秒开始，持续0.6秒
- 两层动画有0.3秒重叠，形成交叉淡入淡出

### Requirement: 专业音效库音效
Hub页分类按钮 SHALL 使用从专业音效库下载的高品质音效。

#### Scenario: 用户点击分类按钮
- **WHEN** 用户点击分类按钮
- **THEN** 播放专业录制的钟声/鼓声音效，音色自然真实，无合成感

#### 音效来源
- 从Freesound.org或Pixabay等免费音效库搜索下载
- 搜索关键词：Chinese bell, temple bell, gong, taiko drum, meditation bell
- 每个音效时长0.5-2秒
- 音量0.3

### Requirement: 彩色视频封面
所有19个视频封面 SHALL 使用符合视频风格的彩色图片，禁止灰色/黑色调。

#### Scenario: 用户进入Player页
- **WHEN** 用户查看视频封面
- **THEN** 封面呈现与视频内容相关的彩色画面，色彩饱满，视觉吸引力强

#### 封面要求
- 每个封面需与视频标题/内容直接相关
- 色彩饱和度不低于70%
- 亮度不低于40%
- 禁止纯灰色/纯黑色/极低饱和度图片
- 分辨率1280×720以上

### Requirement: Landing页UI丰富化
Landing页 SHALL 包含更丰富的视觉元素和装饰层次。

#### Scenario: 用户进入网站
- **WHEN** 用户首次打开网站
- **THEN** Landing页除核心内容外，还包含装饰性元素：角落装饰线条、微妙的动态粒子/光点、底部装饰性文字或图案

#### UI增强方向（基于ui-ux-pro-max skill）
- 四角装饰：细线框或L型角标，增加画框感
- 动态光点：2-3个缓慢移动的暖色光点，增加氛围感
- 底部装饰：导演/创作者标签，如"DIRECTED BY CHEN JUNLIANG"或"作品集 2024"
- 右侧边栏：极细的竖排装饰文字或线条

## MODIFIED Requirements

### Requirement: 页面过渡效果
Landing→Hub过渡 SHALL 使用从右下角拉走帷幕的方式，而非从上往下拉动。Hub→Player过渡 SHALL 使用渐进式交叉淡入淡出，而非硬跳转。

## REMOVED Requirements

### Requirement: 从上往下拉动帷幕过渡
**Reason**: 用户要求改为从右下角拉走的效果
**Migration**: 替换curtain-panel的top动画为clip-path对角线揭示

### Requirement: Hub→Player硬跳转
**Reason**: 过于生硬，缺乏过渡感
**Migration**: 替换为渐进式交叉淡入淡出
