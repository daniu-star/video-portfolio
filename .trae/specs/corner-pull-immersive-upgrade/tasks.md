# Tasks

- [x] Task 1: 实现右下角拉走帷幕过渡动画
  - [x] SubTask 1.1: 修改script.js中enter-portfolio的动画逻辑，将top-down拉动改为clip-path对角线揭示（从右下角向左上角拉开）
  - [x] SubTask 1.2: 修改style.css中curtain-panel样式，适配对角线揭示动画
  - [x] SubTask 1.3: 移除curtain-edge SVG波浪元素（对角线揭示不需要底部波浪）
  - [x] SubTask 1.4: 验证过渡动画流畅自然

- [x] Task 2: 下载专业音效库音效
  - [x] SubTask 2.1: 从Freesound.org/Pixabay搜索并下载4个高品质钟声/鼓声音效（Chinese bell, temple bell, gong, taiko drum）
  - [x] SubTask 2.2: 转换音效为WAV 44100Hz 16bit格式，裁剪至0.5-2秒
  - [x] SubTask 2.3: 替换sounds/目录下的4个音效文件
  - [x] SubTask 2.4: 验证音效播放正常

- [x] Task 3: 实现Hub→Player渐进式过渡
  - [x] SubTask 3.1: 修改script.js中分类按钮点击逻辑，添加交叉淡入淡出过渡动画
  - [x] SubTask 3.2: Hub页淡出缩小（opacity 1→0 + scale 1→0.95，0.6s）
  - [x] SubTask 3.3: Player页淡入放大（opacity 0→1 + scale 1.05→1，延迟0.3s，0.6s）
  - [x] SubTask 3.4: 验证过渡流畅

- [x] Task 4: 更新19个视频封面为彩色图片
  - [x] SubTask 4.1: 使用Pollinations.ai API生成19张彩色封面图（饱和度>=70%，亮度>=40%，与视频内容相关）
  - [x] SubTask 4.2: 下载到posters/目录替换旧封面
  - [x] SubTask 4.3: 验证所有封面图色彩饱满

- [x] Task 5: 丰富Landing页UI元素
  - [x] SubTask 5.1: 在index.html中添加四角装饰（L型角标线条）
  - [x] SubTask 5.2: 添加2-3个缓慢移动的暖色光点动画
  - [x] SubTask 5.3: 添加底部装饰性文字（"DIRECTED BY CHEN JUNLIANG"）
  - [x] SubTask 5.4: 添加右侧竖排装饰线条
  - [x] SubTask 5.5: 添加对应CSS样式和动画

# Task Dependencies
- [Task 1] 独立（帷幕过渡可先行）
- [Task 2] 独立（音效下载可并行）
- [Task 3] 独立（渐进过渡可并行）
- [Task 4] 独立（封面下载可并行）
- [Task 5] 独立（Landing UI可并行）
