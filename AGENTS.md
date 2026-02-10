# AGENTS.md

## 目标

把 Mouth King Game 按工程化方式持续开发，优先可玩稳定与玩法一致性。

## 强制约束

- `1.html` 只作历史参考，禁止继续在其上开发。
- 所有新功能只在 `TypeScript + Vite` 项目结构中实现。
- 道具与玩法参数必须集中在配置层，避免散落逻辑。

## 当前技术基线

- 框架：Vite
- 语言：TypeScript
- AI：`@mediapipe/tasks-vision`
- 当前多人上限：4 人
- 质量门禁：`pnpm lint`、`pnpm typecheck`、`pnpm test`

## 目录约定

- `src/ai/*`: 视觉识别与追踪
- `src/core/*`: 全局状态与核心类型
- `src/gameplay/*`: 刷新/碰撞/结算规则
- `src/ui/*`: HUD、Overlay 与渲染
- `src/config/*`: 玩法参数与平衡表

## 协作规则

- 改玩法前先更新 `详细设计文档.md` 的对应章节。
- 每次改动后至少验证：
  1. 摄像头授权流程
  2. 1-4 人识别与独立状态
  3. Game Over 与重开
- 不在一个提交里混合大规模重构和玩法大改。

## 提交建议

- `feat`: 新玩法/新系统
- `fix`: 逻辑修复
- `refactor`: 结构优化
- `docs`: 文档更新
