# 数据来源与建模边界 V6

项目以 `database/spatial_demo.db -> sources` 为唯一规范来源表。下面列出本轮关键公开事实来源。

## 中国天眼 / 平塘天文小镇

- 贵州省工信部门：FAST 站址及 5/10/30km 电磁宁静区。
  - https://gxt.guizhou.gov.cn/zwgk/xxgkml/zcwj/flfg/201901/t20190124_11004000.html
- 中国天眼景区总体规划与承载量。
  - https://www.zgtianyan.com/gonggao/197.html
- 中国天眼景区设施目录。
  - https://www.zgtianyan.com/jqjieshao/
- 天幕商业街：450m 长、平均18m宽、13.5m高、8000㎡天幕。
  - https://www.zgtianyan.com/jingdianchangguan/133.html
- 星辰天缘大酒店等景区住宿信息。
  - https://www.zgtianyan.com/zhoubianjiudian/142.html
- 人民日报/新华社 2026-08-18：中国天眼景区 2026 年 7 月接待游客超22万人次，同比增长超10%。
  - https://paper.people.com.cn/rmrb/pad/content/202608/18/content_30175506.html

## 花江峡谷大桥 / 云渡 / 科力寨

- 贵州省交通运输厅：大桥工程、桥旅体系与官方项目介绍。
  - https://jt.guizhou.gov.cn/wqfj/qlrh/202509/t20250929_88663076.html
- 六安高速道路关系与工程资料。
  - https://jt.guizhou.gov.cn/zwgk/zdlyxxgk_5948535/zbtb_5948548/zbgg_5948549/202003/t20200309_82549651.html
- 云渡服务区施工图批复：K63+766.615、用地约218.28亩、建筑面积14747.61㎡、综合楼/宿舍/充电/收费站/连接道路等。
  - https://jt.guizhou.gov.cn/zwgk/zfxxgk_5948492/fdzdgknr_5948495/qtfdgkxx/xzxk_5948518/202507/t20250717_88301468.html
- 桥旅融合项目公开介绍：云渡中心景区、观光电梯、酒店、展示厅、20余项目等。
  - https://jt.guizhou.gov.cn/xwzx1/jtyw1/202501/t20250121_86661670.html
- 央视 2025-12-20：大桥日均通行8000余辆；国庆游客22万人次；科力寨25户128人；国庆期间每天超1万辆车进入科力寨。
  - https://news.cctv.com/2025/12/20/ARTIIJsFYx4GL2U2tOz4LUTb251220.shtml
- 贵州交通 2026-02-24：春节单日4.23万/4.27万人次，日均驶入服务区车辆超万辆。
  - https://jt.guizhou.gov.cn/xwzx1/jtyw1/202602/t20260224_89565368.html
- 中新网贵州 2026-08-06：桥旅项目累计游客超过300万人次。
  - https://www.gz.chinanews.com.cn/jjgz/2026-08-06/doc-ihfhytzk9166367.shtml

- 中国天眼景区官网：平塘天文科学文化园距FAST直线约6km，景区总面积3.47平方公里。
  - https://www.zgtianyan.com/jqjieshao/112.html
- 中国天眼景区官方航拍：用于约束天文小镇公共建筑、商业轴线与红顶居住组团的相对空间关系。
  - https://www.zgtianyan.com/dongtai/216.html

- 人民日报 2026-02-14：小花江村102户，16家民宿开业、14家在建、5家农家乐，国庆中秋假期平均每天游客超2000人次。
  - https://gz.people.com.cn/n2/2026/0214/c194831-41502968.html
- 人民网 2026-06-22：小花江村民宿与餐饮继续发展，用于V6村落业态分类。
  - https://ent.people.com.cn/n1/2026/0622/c1012-40744717.html

## Google 3D 数据说明

Google Photorealistic 3D Tiles 可以在线用于高分辨率三维地图可视化，但官方 Map Tiles API 政策禁止未经授权的预取、缓存、存储、地理数据提取与离线用途；叠加的自有 3D 几何也不得从 Google Photorealistic 3D Tiles 抽取、追踪或派生。因此本项目没有把 Google 3D 模型打包进 ZIP。Google 仅可作为人工位置/形态参考；可分发三维几何来自公开事实参数和 SIMULATED 参数化建模。

- https://developers.google.com/maps/documentation/tile/policies
- https://developers.google.com/maps/documentation/tile/3d-tiles

## 真实性标签

- `VERIFIED`：可由以上来源核验的事实。
- `SIMULATED`：项目为了空间表达生成的建筑落位、局部路网几何、地形细部、粒子动线等。
