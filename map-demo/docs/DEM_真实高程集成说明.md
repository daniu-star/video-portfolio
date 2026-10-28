# V24 真实高程与场景建模说明

## 当前可交付内容与限制

V24 **尚未包含新下载的真实DEM文件**。现有 `assets/data/real_elevation.js` 保持为 `null`，程序明确显示“模拟网格 · 真实DEM未导入”。当前环境无法连接外部高程瓦片服务器，因此没有伪造任何高程采样，也没有把渲染细分说成真实分辨率。

已对两个地点现有网格进行自适应高程色阶、坡度法向量受光、地形等高线与性能限制处理；这提升了模拟山体的立体层次，**不能替代真实地形重建**。现有 Canvas 2D 引擎没有真实的三维深度缓冲，专业近景摄影测量精度仍需 WebGL/Three.js 或 Blender/Cesium 类方案、实测控制点和合法三维资产。

## 高程数据查询结果

- Mapzen/Tilezen Terrain Tiles，公开托管于 AWS Open Data，采用 Terrarium 编码。主要来源包括 SRTM 等；全球覆盖和源精度会因区域而异。来源 https://registry.opendata.aws/terrain-tiles/ 和 https://github.com/tilezen/joerd/blob/master/docs/formats.md。
- Copernicus DEM GLO-30，全球约30m数字表面模型（DSM），包含地物表面而非严格裸地DTM。来源 https://opentopography.org/developers 和 https://earthdatahub.destine.eu/collections/copernicus-dem/datasets/GLO-30。
- 本项目两个地点的空间锚点来自已有 `assets/data/geographic_anchors.js`，暂作为采样中心。需要权威工程BIM或实测坐标才能对桥面、支座、主塔、反射面和建筑位置进行精密配准。

## 在可联网电脑下载后构建

使用 Python 3 并安装 `requests pillow`，在 `Map demo` 根目录执行：

```bash
python -m pip install requests pillow
python tools/下载并构建真实地形.py --zoom 13 --grid 145
```

默认使用 Web Mercator 原始瓦片定位与双线性采样。原始瓦片保存在 `assets/data/terrain_cache/`，下载记录和 SHA256 保存在 `assets/data/real_elevation.js`，同时包含实际地理中心、源高程范围、垂直平移量、网格间距及注明的配准局限。程序在全部数据成功下载后才原子替换 `real_elevation.js`。下载失败不覆盖原地形。

用 `python tools/下载并构建真实地形.py --test-offline` 可在完全离线情况下测试瓦片寻址、RGB解码与双线性插值，此测试不会生成DEM，也不能证明来源可访问。

**版权与精度**：使用时注明 Mapzen/Tilezen 及高程原始来源，核对相关许可。Terrarium 瓦片的插值网格大小不代表DEM原生分辨率。场景中桥梁、道路、游客服务设施和村落均为概念几何，未与真实DEM进行逐一工程测绘配准。
