# 🍎 Face Fruit Eater (张嘴吃水果)

> 一个基于 AI 面部识别的魔性体感网页游戏。张大你的嘴，开始暴饮暴食吧！

[👉 在线试玩 Demo](https://www.google.com/search?q=https://%E4%BD%A0%E7%9A%84%E9%83%A8%E7%BD%B2%E9%93%BE%E6%8E%A5.com "null")

## 🎮 游戏简介

这是一个完全运行在浏览器端的体感游戏。通过 Google MediaPipe 技术捕捉你的面部动作。 无需键盘鼠标，**摇头**控制位置，**张嘴**吃掉食物！

### ✨ 核心特性

- **📷 纯前端 AI**：基于 MediaPipe FaceMesh，隐私安全，无后端推流。
    
- **🤣 魔性玩法**：
    
    - **真实物理反馈**：吃到坏东西会呕吐（物理粒子效果）。
        
    - **生理模拟**：吃糖太多会牙疼，吃辣椒需要哈气散热。
        
    - **环境互动**：小心随机的侧风和停电（深夜模式）。
        
- **🛠️ 高度可扩展**：简单的配置即可添加新道具和新机制。
    

## 🚀 快速开始

### 本地开发

1. 克隆项目
    
    ```
    git clone [https://github.com/yourname/face-fruit-eater.git](https://github.com/yourname/face-fruit-eater.git)
    ```
    
2. 进入目录 (建议未来迁移到 Vite)
    
    ```
    cd face-fruit-eater
    ```
    
3. 启动本地服务器 (推荐使用 VS Code Live Server 或 http-server)
    
    ```
    npx http-server .
    ```
    
4. 打开浏览器访问 `http://localhost:8080`，允许摄像头权限即可开玩。
    

## 🗺️ 路线图 (Roadmap)

- [x] 基础面部追踪与张嘴判定
    
- [x] 道具系统 (水果、炸弹、Buff)
    
- [x] 物理特效 (粒子系统)
    
- [ ] **重构**：从单 HTML 文件迁移至 TypeScript + Vite 工程架构
    
- [ ] **皮肤系统**：给玩家增加 AR 面具（猫耳、墨镜等）
    
- [ ] **录屏分享**：一键生成游戏精彩瞬间 GIF
    
- [ ] **排行榜**：基于 Supabase 的全球高分榜
    

## 🤝 如何贡献 (Contributing)

我们非常欢迎社区贡献！你可以做以下事情：

1. **新增食物**：在 `config.js` 中添加一行配置，画一个新的 Icon。
    
2. **脑洞设计**：设计新的 Buff（比如：吃到柠檬会让整个画面扭曲？）。
    
3. **Bug 修复**：优化物理碰撞或性能。
    

详见 [CONTRIBUTING.md](https://www.google.com/search?q=./CONTRIBUTING.md "null")。

## 📄 许可证

本项目采用 [MIT License](https://www.google.com/search?q=LICENSE "null")。你可以免费用于学习、修改和商业用途。

_Created by [Your Name]_