# Tasks

- [ ] Task 1: 将本地代码推送到 GitHub 仓库
  - [ ] SubTask 1.1: 使用 GitHub MCP 工具将所有 modified 和 untracked 文件推送到 `daniu-star/video-portfolio` 的 main 分支
  - [ ] SubTask 1.2: 确认推送成功，验证远程仓库文件已更新

- [ ] Task 2: 使用浏览器自动化工具浏览 www.chenjunliang.top
  - [ ] SubTask 2.1: 访问首页（落地页），观察加载速度、动画效果、布局
  - [ ] SubTask 2.2: 点击"进入作品集"，进入分类中心页面
  - [ ] SubTask 2.3: 依次点击各个分类（AI纪录片、AI广告片、游戏视频、实拍纪录片），进入播放器页面
  - [ ] SubTask 2.4: 测试播放器交互（拉开序幕、播放/暂停、上下切换、返回）
  - [ ] SubTask 2.5: 访问视频合集页（video-collection.html），浏览各分类区域
  - [ ] SubTask 2.6: 测试移动端视口下的响应式表现

- [ ] Task 3: 整理诊断清单
  - [ ] SubTask 3.1: 汇总浏览过程中发现的所有问题
  - [ ] SubTask 3.2: 按分类（UI/UX、性能、功能、可访问性）整理问题
  - [ ] SubTask 3.3: 为每个问题标注严重程度和优化建议
  - [ ] SubTask 3.4: 输出 Markdown 格式的诊断清单文件

# Task Dependencies
- [Task 2] depends on [Task 1]（先推送代码，确保线上是最新版本）
- [Task 3] depends on [Task 2]（先浏览发现问题，再整理清单）
