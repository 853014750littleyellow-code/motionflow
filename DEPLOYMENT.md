# MotionFlow 部署指南

本文档详细说明如何部署 MotionFlow 动效灵感库。

## 前置准备

### 1. Supabase 项目设置

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 记录以下信息：
   - Project URL（项目 URL）
   - Anon/Public Key（匿名公钥）
   - Service Role Key（服务密钥，用于 Python 脚本）

### 2. 初始化数据库

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 创建新查询，粘贴 `supabase/schema.sql` 的全部内容
3. 点击 **Run** 执行 SQL 脚本
4. 验证表已创建：在 **Table Editor** 中应该能看到 `brands` 和 `motions` 表

### 3. 创建 Storage Bucket

1. 在 Supabase Dashboard 中，进入 **Storage**
2. 点击 **New bucket**
3. 输入名称：`motions`
4. 设置为 **Public bucket**（允许公开访问文件）
5. 点击 **Create bucket**

## 前端部署

### 方式一：Vercel 部署（推荐）

#### 步骤 1：准备代码仓库

```bash
cd motionflow
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 步骤 2：Vercel 导入

1. 访问 [Vercel](https://vercel.com)
2. 点击 **Add New** → **Project**
3. 导入你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `motionflow`（如果仓库根目录就是项目，则留空）

#### 步骤 3：配置环境变量

在 Vercel 项目设置中添加：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 步骤 4：部署

点击 **Deploy**，等待构建完成。

### 方式二：自托管部署

#### 步骤 1：构建项目

```bash
cd motionflow
npm install
npm run build
```

#### 步骤 2：配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 步骤 3：启动生产服务器

```bash
npm start
```

默认运行在 `http://localhost:3000`

#### 步骤 4：使用 PM2 保持运行（可选）

```bash
npm install -g pm2
pm2 start npm --name "motionflow" -- start
pm2 save
pm2 startup
```

## Python 自动同步脚本部署

### 步骤 1：安装 Python 依赖

```bash
cd scripts
pip install -r requirements.txt
```

### 步骤 2：配置环境变量

复制 `.env.example` 为 `.env`：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
WATCH_DIRECTORY=C:\Users\YourName\Videos\Screenshots
```

**注意**：
- `SUPABASE_SERVICE_KEY` 需要使用 Service Role Key（而非 Anon Key）
- `WATCH_DIRECTORY` 设置为你的手机录屏备份目录

### 步骤 3：运行脚本

#### Windows

```bash
python watchdog_sync.py
```

#### 设置开机自启（Windows）

1. 创建批处理文件 `start_watchdog.bat`：

```batch
@echo off
cd /d "C:\path\to\motionflow\scripts"
python watchdog_sync.py
```

2. 将批处理文件添加到启动文件夹：
   - 按 `Win + R`，输入 `shell:startup`
   - 将 `start_watchdog.bat` 的快捷方式放入该文件夹

#### Linux/macOS

使用 systemd 或 launchd 创建服务：

**systemd 示例** (`/etc/systemd/system/motionflow-sync.service`):

```ini
[Unit]
Description=MotionFlow Auto Sync
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/motionflow/scripts
ExecStart=/usr/bin/python3 watchdog_sync.py
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable motionflow-sync
sudo systemctl start motionflow-sync
```

## 验证部署

### 1. 验证前端

访问部署的 URL，检查：
- 页面正常加载
- 导航栏功能正常
- 品牌专区显示示例品牌

### 2. 验证上传功能

1. 访问 `/upload` 页面
2. 拖拽测试文件（MP4 或 GIF）
3. 填写标签信息
4. 点击上传
5. 返回首页查看是否显示

### 3. 验证自动同步

1. 确保 Python 脚本正在运行
2. 复制一个测试视频到监听目录
3. 查看脚本输出日志
4. 刷新前端页面，确认文件已同步

## 故障排查

### 前端无法连接 Supabase

- 检查环境变量是否正确配置
- 确认 Supabase 项目状态正常
- 检查浏览器控制台的错误信息

### 上传失败

- 确认 Storage bucket 已创建且权限正确
- 检查文件大小是否超过限制（Supabase 免费版限制 50MB）
- 查看浏览器网络请求的错误信息

### Python 脚本无法上传

- 确认使用的是 Service Role Key（而非 Anon Key）
- 检查 `WATCH_DIRECTORY` 路径是否正确
- 确认文件格式在支持列表中（.mp4, .webp, .gif, .json）
- 查看脚本输出的错误日志

### 动效无法播放

- 确认 Storage bucket 设置为 Public
- 检查文件 URL 是否可访问
- 对于 Lottie 文件，确认 JSON 格式正确

## 性能优化建议

### 1. 图片/视频优化

- 上传前压缩视频（推荐使用 HandBrake 或 FFmpeg）
- 建议视频分辨率：720p 或 1080p
- 建议视频码率：2-5 Mbps

### 2. 数据库优化

- 定期清理未使用的素材
- 为常用查询添加索引（已在 schema.sql 中包含）

### 3. CDN 加速

- Supabase Storage 自带 CDN
- 可考虑使用 Cloudflare 等额外 CDN 加速

## 安全建议

### 1. 认证与授权

当前版本为开发阶段，所有数据公开访问。生产环境建议：

- 启用 Supabase Auth
- 配置 Row Level Security (RLS) 策略
- 限制上传权限仅对登录用户开放

### 2. 文件验证

- 在上传前验证文件类型和大小
- 对用户上传的文件名进行清理
- 考虑添加病毒扫描（如使用 ClamAV）

## 监控与维护

### 1. 日志监控

- Vercel 提供实时日志查看
- Python 脚本建议输出到日志文件：

```bash
python watchdog_sync.py >> sync.log 2>&1
```

### 2. 存储空间监控

- 定期检查 Supabase Storage 使用量
- 免费版限制 1GB，超出需升级套餐

### 3. 数据备份

- Supabase 提供自动备份（付费功能）
- 建议定期导出数据库和重要文件

## 支持

如有问题，请查看：
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [项目 Issues](https://github.com/your-repo/issues)
