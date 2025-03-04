# Alist Web Client

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.15.4-00DC82.svg)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D.svg)](https://vuejs.org/)

基于 Nuxt 3 构建的现代化 Alist Web 客户端，提供优雅的文件浏览和管理体验。

## ✨ 特性

- 🚀 基于 Nuxt 3.15.4 和 Vue 3 构建
- 🎨 现代化 UI 设计，使用 Vuetify
- 📱 响应式设计，支持多端访问
- 🖼️ 支持图片预览，包括 HEIC 格式转换
- 🎥 支持视频播放 (使用 Plyr)
- 🔍 文件搜索和管理功能
- ⚡️ 基于 UnoCSS 的原子化 CSS，提供高性能样式
- 📦 支持 SSR，优化首屏加载速度

## 🛠️ 技术栈

- [Nuxt 3.15.4](https://nuxt.com/) - Vue.js 全栈框架
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vuetify](https://vuetifyjs.com/) - Material Design 组件库
- [UnoCSS](https://unocss.dev/) - 高性能且灵活的即时原子化 CSS 引擎
- [VueUse](https://vueuse.org/) - Vue Composition API 工具集
- [Plyr](https://plyr.io/) - 现代化媒体播放器
- [Vue Easy Lightbox](https://www.npmjs.com/package/vue-easy-lightbox) - 图片预览组件
- [HEIC2ANY](https://www.npmjs.com/package/heic2any) - HEIC 图片格式转换

## 📦 安装

确保你已经安装了 [Node.js](https://nodejs.org/) (>=16.x)。本项目使用 yarn 作为包管理器。

```bash
# 克隆项目
git clone https://github.com/yourusername/alist-web-client.git

# 进入项目目录
cd alist-web-client

# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

## 🚀 开发命令

```bash
# 开发模式
yarn dev

# 构建生产版本
yarn build

# 预览生产版本
yarn preview

# 生成静态文件
yarn generate
```

## 📝 项目结构

```
├── app.vue              # 应用入口
├── components/         # 组件目录
├── composables/        # 组合式函数
├── pages/             # 页面文件
├── public/            # 静态资源
├── server/            # 服务端接口
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
└── nuxt.config.ts     # Nuxt 配置文件
```

## 🔧 环境要求

- Node.js >= 16.x
- yarn >= 1.22.19

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

该项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Alist](https://github.com/alist-org/alist) - 强大的文件列表程序
- [Nuxt](https://nuxt.com/) - 现代化的 Vue 框架
- 所有贡献者和用户

## 📞 问题反馈

如有问题或建议，请：

- 提交 [Issue](https://github.com/yourusername/alist-web-client/issues)
- 通过 Pull Request 贡献代码

---

如果这个项目对你有帮助，请给它一个 ⭐️！
