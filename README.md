# Mouth King Game

基于 `TypeScript + Vite + MediaPipe` 的体感小游戏工程。

## 说明

- `1.html` 仅为历史参考，不参与后续开发。
- 当前开发入口：`index.html` + `src/main.ts`。
- M1 第二段已开始：多人识别（最多 4 人）并做状态隔离。

## 运行

```bash
npm install
npm run dev
```

浏览器打开终端提示地址（默认 `http://localhost:5173`）。

## 构建

```bash
npm run build
npm run preview
```

## 目录

```txt
src/
  ai.ts
  config.ts
  gameplay.ts
  main.ts
  render.ts
  state.ts
  style.css
  types.ts
  ui.ts
```

## M1 当前范围

1. 新框架迁移（TypeScript + Vite）
2. 最多 4 人识别（`numFaces: 4`）
3. 每位玩家独立：`HP/Score/Sugar/Combo/Balance`
4. 同屏共享掉落道具并按最近碰撞玩家结算
5. 左到右初始编号 + 最近距离跟踪，降低多人换位串号
6. 多人平衡分档（1/2/3/4 人）控制陷阱权重与下落速度

## 操作

- `Space` 或 `P`: 暂停/继续
- `F3`: 显示或隐藏调试面板
