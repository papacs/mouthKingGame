# Mouth King Game

基于 `TypeScript + Vite + MediaPipe` 的体感小游戏工程。

## 开源协议与商用声明

本仓库采用分层授权：

- 代码（`src/`、`test/` 等）：`AGPL-3.0-only`（见 `LICENSE`）
- 非代码资源（美术/文案/宣传素材等）：`CC BY-NC-SA 4.0`（见 `LICENSE.assets`）

这意味着：

- 允许个人学习、游玩、二次开发。
- 禁止将非代码资源用于商业用途（含售卖、广告变现、付费分发等）除非获得额外授权。
- 使用并修改本项目代码对外提供网络服务时，需按 AGPL v3 履行开源义务，公开对应源码。

如需商业授权（闭源商用、品牌合作、活动落地等），请联系项目维护者单独授权。

## 说明

- 当前开发入口：`index.html` + `src/main.ts`。
- M2 已启动：目录分层 + 最小 lint/test/typecheck 流程。

## 运行

```bash
pnpm install
pnpm dev
```

浏览器打开终端提示地址（默认 `http://localhost:5173`）。

## 构建

```bash
pnpm build
pnpm preview
```

注意：`face_landmarker.task` 通过 `public/` 发布，部署后必须保证 `dist/face_landmarker.task` 可直接访问。

## 主题开关（运营活动）

默认支持在“开始页”直接选择主题（推荐，无需命令行）。

命令行方式仅作可选：启用马年春节主题

```bash
VITE_EVENT_THEME=spring_festival_horse pnpm dev
```

PowerShell 请使用：

```powershell
$env:VITE_EVENT_THEME="spring_festival_horse"; pnpm dev
```

生产构建：

```bash
VITE_EVENT_THEME=spring_festival_horse pnpm build
```

PowerShell 请使用：

```powershell
$env:VITE_EVENT_THEME="spring_festival_horse"; pnpm build
```

可选值：
- `default`
- `spring_festival_horse`

## 免费托管部署（低出错）

推荐优先 `Cloudflare Pages`，其次 `Vercel`。两者都可直接托管 Vite 静态产物。

### 方案 A：Cloudflare Pages（推荐）

1. 代码推送到 GitHub 仓库。
2. Cloudflare Pages 新建项目并连接仓库。
3. 构建配置填写：
- Framework preset: `Vite`
- Build command: `pnpm build`
- Build output directory: `dist`
- Node.js: `20`
4. 环境变量（可选，春节活动时启用）：
- `VITE_EVENT_THEME=spring_festival_horse`
5. 点击部署，发布后检查：
- `https://<your-domain>/face_landmarker.task` 可访问
- 摄像头权限能正常弹出并可重试

### 方案 B：Vercel（备选）

1. 导入 GitHub 仓库到 Vercel。
2. 构建配置：
- Framework: `Vite`
- Build command: `pnpm build`
- Output directory: `dist`
3. 环境变量（可选）：
- `VITE_EVENT_THEME=spring_festival_horse`
4. 部署后执行同样验收：
- `face_landmarker.task` 可访问
- 摄像头权限与 1-4 人识别正常

## 上线前最小验收清单

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. 浏览器手测：
- 摄像头授权失败后可重试
- 1-4 人识别独立且不串状态
- Game Over 与重开可用
- 春节主题开关前后都能正常进局

## 目录

```txt
src/
  ai/
    faceTracker.ts
  config/
    gameConfig.ts
  core/
    state.ts
    types.ts
  gameplay/
    gameplaySystem.ts
  ui/
    hudOverlay.ts
    render.ts
  main.ts
  style.css
```

## M2 当前范围

1. 代码按 `ai/core/gameplay/ui/config` 拆层
2. 最多 4 人识别与独立状态
3. 左到右初始编号 + 最近距离跟踪防串号
4. 1/2/3/4 人平衡分档（陷阱权重/掉落速度）
5. 最小工程流程：`pnpm lint` / `pnpm typecheck` / `pnpm test`

## 操作

- `Space` 或 `P`: 暂停/继续
- `F3`: 显示或隐藏调试面板



 1. 运行 pnpm lint
  2. 运行 pnpm typecheck
  3. 运行 pnpm test
