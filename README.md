# Loden（落定）

静态网页：用视觉节奏引导呼吸，帮助从应激回到平衡。

## 打开方式

**直接双击 `index.html` 即可**（已打包为普通脚本，不依赖本地服务器）。

修改 `js/` 源码或 `locales/` 文案后，需重新构建：

```bash
npm run build
```

## 本地预览（可选）

```bash
npm start
```

会在构建后启动静态服务器，适合开发调试。

## 部署

将项目根目录（含 `assets/`、`index.html` 等）上传到静态托管即可。

若改了源码，部署前先执行 `npm run build`。

## 项目结构

```
index.html           首页
session.html         圆模式练习页
assets/              打包后的页面脚本（npm run build 生成）
css/app.css          样式与主题
locales/             中英文文案（源文件）
js/
  lib/               核心逻辑
  modes/             视觉模式
  pages/             页面源码入口
  ui/                UI 组件
scripts/build.mjs    构建脚本
```

## 模式说明

- **圆**：已实现
- **浪**：首页显示「待开发」，暂不可进入
