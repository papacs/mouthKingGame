# Mouth King Game

基于 `TypeScript + Vite + MediaPipe` 的体感小游戏工程。

## 说明

- `1.html` 仅为历史参考，不参与后续开发。
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
