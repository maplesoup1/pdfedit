# PDF Editor - 全栈 PDF 编辑应用

一个现代化的 PDF 编辑器，支持文本添加、图片插入、页面管理等功能。

## 技术栈

### 后端
- **FastAPI** - 高性能 Python Web 框架
- **PyMuPDF (fitz)** - PDF 处理库
- **Uvicorn** - ASGI 服务器

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **PDF.js** - PDF 预览

---

## 🚀 快速开始

### 方法 1: 使用启动脚本（推荐）

```bash
# 全栈启动（后端 + 前端）
./start_dev.sh

# 或单独启动后端
./scripts/start_backend.sh
```

### 方法 2: 手动启动

**启动后端**:
```bash
cd "/Users/xtom/Downloads/A2 3/pdf"
source .venv/bin/activate
python -m uvicorn scripts.pdf_api:app --host 0.0.0.0 --port 8000 --reload
```

**启动前端**:
```bash
cd pdf-editor
npm install  # 首次运行
npm run dev
```

详细启动指南请查看 [START_GUIDE.md](START_GUIDE.md)

---

## 📋 功能特性

### PDF 编辑功能
- ✅ 添加文本（支持字体大小、颜色、位置自定义）
- ✅ 插入图片（支持尺寸调整）
- ✅ 删除页面
- ✅ 重排页面
- ✅ 合并 PDF
- ✅ 提取页面
- ✅ 文本遮盖
- ✅ PDF 信息查询

### 系统特性
- ✅ 实时 PDF 预览
- ✅ 自动文件清理（24 小时过期）
- ✅ 统一的错误处理
- ✅ 类型安全（TypeScript）
- ✅ 响应式设计
- ✅ 本地存储/Supabase 存储

---

## 🌐 访问地址

### 开发环境
- **前端**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/healthz

---

## 📁 项目结构

```
pdf/
├── scripts/
│   ├── pdf_api.py           # FastAPI 服务入口
│   ├── start_backend.sh     # 后端启动脚本
│   └── cleanup-cron.ts      # 清理定时任务
├── pdf_processor.py         # PDF 处理核心
├── .venv/                   # Python 虚拟环境
├── pdf-editor/              # Next.js 前端
│   ├── app/
│   │   ├── api/             # API Routes
│   │   ├── components/      # React 组件
│   │   └── page.tsx         # 主页面
│   ├── lib/
│   │   ├── api-utils.ts     # API 工具函数
│   │   ├── pdf-api-client.ts    # API 客户端
│   │   ├── pdf-operation-wrapper.ts  # PDF 操作包装器
│   │   ├── python-bridge.ts  # Python 服务桥接
│   │   └── supabase.ts      # Supabase 客户端
│   ├── hooks/
│   │   ├── usePdfEditor.ts  # PDF 编辑器 Hook
│   │   └── useToast.ts      # Toast 通知 Hook
│   └── types/
│       ├── pdf.ts           # PDF 类型定义
│       └── api.ts           # API 类型定义
├── START_GUIDE.md           # 启动指南
├── DEPLOYMENT.md            # 部署指南
├── OPTIMIZATION_SUMMARY.md  # 优化总结
└── README.md                # 本文件
```

---

## 🔧 环境配置

### 后端
无需额外配置，使用默认设置即可。

### 前端

创建 `pdf-editor/.env.local`:

```bash
# FastAPI 服务地址（必需）
PDF_API_BASE_URL=http://localhost:8000

# Supabase 配置（可选，默认使用本地存储）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🛠️ 开发

### 后端开发
```bash
# 激活虚拟环境
source .venv/bin/activate

# 安装新依赖
pip install <package>

# 运行测试
python -m pytest  # 如果有测试

# 查看 API 文档
open http://localhost:8000/docs
```

### 前端开发
```bash
cd pdf-editor

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run build

# 代码检查
npm run lint
```

---

## 📦 依赖管理

### Python 依赖
```bash
# 查看已安装包
pip list

# 安装所有依赖
pip install fastapi uvicorn pymupdf python-multipart
```

### Node.js 依赖
```bash
cd pdf-editor
npm install
```

---

## 🚢 部署

详细部署指南请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

### 关键步骤
1. 部署 FastAPI 后端（Docker/VPS/Cloud Run）
2. 配置 `PDF_API_BASE_URL` 环境变量
3. 部署 Next.js 前端（Vercel/Netlify）
4. 配置 Supabase 存储（可选）

---

## 🧹 维护

### 文件清理

**自动清理**（推荐）:
```bash
# 添加到 crontab
0 * * * * cd /path/to/pdf-editor && npx tsx scripts/cleanup-cron.ts
```

**手动清理**:
```bash
# 通过 API
curl -X POST http://localhost:3000/api/pdf/cleanup

# 或使用脚本
npx tsx pdf-editor/scripts/cleanup-cron.ts
```

---

## 📚 文档

- [START_GUIDE.md](START_GUIDE.md) - 详细启动指南
- [DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南
- [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md) - 代码优化总结

---

## 🐛 故障排除

### 后端问题

**问题**: 模块未找到
```bash
source .venv/bin/activate
pip install fastapi uvicorn pymupdf python-multipart
```

**问题**: 端口被占用
```bash
lsof -i :8000
kill -9 <PID>
```

### 前端问题

**问题**: PDF 服务不可用
- 检查后端是否运行: http://localhost:8000/healthz
- 检查 `.env.local` 配置

**问题**: 依赖安装失败
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

MIT License

---

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的 Python Web 框架
- [PyMuPDF](https://pymupdf.readthedocs.io/) - 强大的 PDF 处理库
- [Next.js](https://nextjs.org/) - React 框架
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF 渲染引擎
