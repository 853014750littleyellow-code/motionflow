# MotionFlow 动效灵感库

专注 UI 动效的灵感库，支持多格式动效素材的高效采集、预览与品牌化归档。

## 功能特性

- **瀑布流展示**：Masonry 布局 + 无限滚动，卡片高度自适应
- **自动播放预览**：鼠标悬停时自动循环播放视频/动画
- **多格式支持**：MP4、WebP、GIF、Lottie (JSON)
- **快速采集**：拖拽上传 + 本地目录自动同步
- **品牌专区**：按品牌维度聚合浏览动效资产
- **智能筛选**：支持按品牌、动效类型、风格等多维度筛选

## 技术栈

- **前端**：Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **后端/数据库**：Supabase (PostgreSQL + Storage)
- **动效渲染**：dotLottie、lottie-react
- **自动化**：Python + Watchdog

## 快速开始

### 1. 安装依赖

```bash
cd motionflow
npm install
```

### 2. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 复制 `.env.example` 为 `.env`
3. 填入你的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 初始化数据库

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/schema.sql` 文件内容。

### 4. 创建 Storage Bucket

在 Supabase Dashboard 中：
1. 进入 Storage 页面
2. 创建名为 `motions` 的 bucket
3. 设置为 Public（或根据需求设置权限）

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 自动同步脚本

### 配置 Python 环境

```bash
cd scripts
pip install -r requirements.txt
```

### 配置环境变量

复制 `scripts/.env.example` 为 `scripts/.env`，填入配置：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
WATCH_DIRECTORY=./watch
```

### 运行监听脚本

```bash
python scripts/watchdog_sync.py
```

脚本会监听 `WATCH_DIRECTORY` 目录，自动上传新增的动效文件。

### 文件命名规范

建议使用以下命名格式以便自动识别：

```
品牌名_应用名_时间戳_描述.mp4
```

例如：
- `Duolingo_多邻国_20260317_登录动画.mp4`
- `Airbnb_爱彼迎_20260317_加载动效.webp`

## 项目结构

```
motionflow/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页（探索页）
│   ├── brands/            # 品牌专区
│   │   ├── page.tsx       # 品牌列表
│   │   └── [slug]/        # 品牌详情
│   ├── upload/            # 上传管理
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── Navbar.tsx         # 导航栏
│   ├── SearchBar.tsx      # 搜索框
│   ├── FilterPanel.tsx    # 筛选面板
│   ├── MasonryGrid.tsx    # 瀑布流布局
│   └── MotionCard.tsx     # 动效卡片
├── lib/                   # 工具库
│   ├── supabase.ts        # Supabase 客户端
│   └── constants.ts       # 常量定义
├── scripts/               # Python 脚本
│   ├── watchdog_sync.py   # 自动同步脚本
│   └── requirements.txt   # Python 依赖
├── supabase/              # 数据库 Schema
│   └── schema.sql         # 数据库表结构
└── package.json           # 项目依赖
```

## 部署指南

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY）
4. 部署

### 自托管

```bash
npm run build
npm start
```

## 开发计划

### v1.0（当前版本）
- ✅ 瀑布流展示 + 多格式动效预览
- ✅ 基础标签系统
- ✅ Upload Admin 后台
- ✅ Python Watchdog 自动同步
- ✅ 品牌专区

### v1.1（规划中）
- Chrome 插件：一键剪藏网页动效
- 详情页：展示完整动效信息与元数据
- 收藏功能：标记优秀案例

### v1.2（未来）
- AI 自动打标：基于视频内容自动识别场景
- 向量检索：根据描述反向检索相似动效
- 团队协作：分享链接、权限管理

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
