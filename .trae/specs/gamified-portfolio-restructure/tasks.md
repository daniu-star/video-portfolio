# Tasks

- [x] Task 1: 重构index.html为三层嵌套结构
  - [x] SubTask 1.1: 创建三层HTML骨架（landing / hub / player），每层用div.page-layer包裹，默认隐藏除landing外
  - [x] SubTask 1.2: Landing层：全屏背景image.png + 暗色遮罩 + Hero内容（姓名/标签/简介）+ "进入作品集"CTA
  - [x] SubTask 1.3: Hub层：全屏背景image copy 3.png + 左侧四行分类链接（书法字体）+ 右侧竖排"作品集"三字
  - [x] SubTask 1.4: Player层：单视频居中展示区 + 右侧三个导航按钮 + 视频标题/分类/简介区域
  - [x] SubTask 1.5: 提取所有19个视频的元数据（src/poster/title/category/description）为JS数据数组

- [x] Task 2: 实现页面切换动画与交互逻辑
  - [x] SubTask 2.1: 实现Landing→Hub过渡动画（淡出+缩放进入）
  - [x] SubTask 2.2: 实现Hub→Player过渡动画（分类项飞出+视频区域展开）
  - [x] SubTask 2.3: 实现Player→Hub返回动画
  - [x] SubTask 2.4: 页面切换时管理VideoLoader队列（暂停/恢复加载）

- [x] Task 3: 实现视频沉浸播放器
  - [x] SubTask 3.1: 单视频渲染逻辑：根据分类和索引加载对应视频
  - [x] SubTask 3.2: 闪烁播放按钮（电影感设计：方形线框 + pulse动画）
  - [x] SubTask 3.3: "下一条视频"/"上一条视频"切换逻辑（同分类内循环）
  - [x] SubTask 3.4: "返回作品集界面"返回Hub层
  - [x] SubTask 3.5: 视频播放控制：倍速选择、画中画、键盘←→拖动进度
  - [x] SubTask 3.6: 视频上方显示分类名称和视频标题，下方显示简介

- [x] Task 4: 艺术化视觉设计
  - [x] SubTask 4.1: 书法字体系统：KaiTi/STkaiti用于所有标题和导航，竖排"作品集"用writing-mode:vertical-rl
  - [x] SubTask 4.2: Hub层分类项hover墨迹扩散/笔触动画效果
  - [x] SubTask 4.3: 导航按钮去AI味设计（线框/墨迹边框/毛玻璃+细线风格）
  - [x] SubTask 4.4: 按钮hover效果（墨迹晕染/笔划延伸/光晕扩散）
  - [x] SubTask 4.5: Landing层背景图image.png全屏覆盖+暗色遮罩
  - [x] SubTask 4.6: Hub层背景图image copy 3.png全屏覆盖+微妙动画

- [x] Task 5: 响应式适配与验证
  - [x] SubTask 5.1: 移动端适配（三层布局在小屏幕上的展示）
  - [x] SubTask 5.2: 验证所有三层页面渲染
  - [x] SubTask 5.3: 测试页面切换、视频播放、键盘控制等功能
  - [x] SubTask 5.4: 清理旧代码（CSS从4258行精简到694行，移除旧主题切换代码）

# Task Dependencies
- [Task 2] depends on [Task 1]（页面切换需要HTML结构就绪）
- [Task 3] depends on [Task 1]（播放器需要视频数据数组和HTML结构）
- [Task 4] depends on [Task 1]（视觉设计需要HTML结构就绪）
- [Task 5] depends on [Task 1-4]（验证需要所有功能就绪）
