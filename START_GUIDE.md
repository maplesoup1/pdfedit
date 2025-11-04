# PDF Editor 启动指南

## 项目架构

```
pdf/
├── scripts/pdf_api.py      # FastAPI 后端服务
├── pdf_processor.py         # PDF 处理核心
├── .venv/                   # Python 虚拟环境
└── pdf-editor/              # Next.js 前端应用
```

---

## 🚀 快速启动

### 1. 启动后端 (FastAPI)

**方法一：使用虚拟环境**（推荐）

```bash
# 进入项目根目录
cd "/Users/xtom/Downloads/A2 3/pdf"

# 激活虚拟环境
source .venv/bin/activate

# 启动 FastAPI 服务器
python -m uvicorn scripts.pdf_api:app --host 0.0.0.0 --port 8000 --reload
```

**方法二：直接运行**

```bash
cd "/Users/xtom/Downloads/A2 3/pdf"
python scripts/pdf_api.py
```

**验证后端运行**：
- 访问 http://localhost:8000/docs 查看 API 文档
- 访问 http://localhost:8000/healthz 检查健康状态

---

### 2. 配置前端环境

```bash
cd "/Users/xtom/Downloads/A2 3/pdf/pdf-editor"

# 创建环境变量文件（如果不存在）
cp .env.example .env.local

# 编辑 .env.local，确保包含：
# PDF_API_BASE_URL=http://localhost:8000
```

---

### 3. 启动前端 (Next.js)

```bash
cd "/Users/xtom/Downloads/A2 3/pdf/pdf-editor"

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

前端地址：http://localhost:3000

---

## 📋 完整启动流程

### 终端 1 - 后端
```bash
cd "/Users/xtom/Downloads/A2 3/pdf"
source .venv/bin/activate
python -m uvicorn scripts.pdf_api:app --host 0.0.0.0 --port 8000 --reload
```

### 终端 2 - 前端
```bash
cd "/Users/xtom/Downloads/A2 3/pdf/pdf-editor"
npm run dev
```

---

## 🛠️ 便捷启动脚本

我已为你准备了启动脚本（下面会创建）：

### 后端启动脚本
```bash
./scripts/start_backend.sh
```

### 全栈启动脚本
```bash
./start_dev.sh
```

---

## 📦 依赖检查

### Python 依赖
```bash
cd "/Users/xtom/Downloads/A2 3/pdf"
source .venv/bin/activate
pip list
```

必需包：
- fastapi
- uvicorn
- pymupdf (fitz)
- python-multipart

如果缺少依赖：
```bash
pip install fastapi uvicorn pymupdf python-multipart
```

### Node.js 依赖
```bash
cd pdf-editor
npm install
```

---

## 🔍 常见问题

### 问题 1: 后端启动失败 "No module named 'fastapi'"
```bash
# 解决方案：安装依赖
source .venv/bin/activate
pip install fastapi uvicorn pymupdf python-multipart
```

### 问题 2: 前端无法连接后端
```bash
# 检查 .env.local 文件
cat pdf-editor/.env.local

# 确保包含：
PDF_API_BASE_URL=http://localhost:8000
```

### 问题 3: 端口被占用
```bash
# 查找占用端口的进程
lsof -i :8000   # 后端
lsof -i :3000   # 前端

# 杀死进程
kill -9 <PID>
```

### 问题 4: PDF 操作失败 "Service unavailable"
- 确认后端服务正在运行
- 检查 http://localhost:8000/healthz
- 查看后端终端的错误日志

---

## 🌐 可用的 API 端点

访问 http://localhost:8000/docs 查看完整的 API 文档

主要端点：
- `POST /pdf/add-text` - 添加文本
- `POST /pdf/add-image` - 添加图片
- `POST /pdf/delete-pages` - 删除页面
- `POST /pdf/reorder-pages` - 重排页面
- `POST /pdf/merge` - 合并 PDF
- `POST /pdf/extract-pages` - 提取页面
- `POST /pdf/redact-text` - 遮盖文本
- `POST /pdf/get-info` - 获取 PDF 信息
- `GET /healthz` - 健康检查

---

## 📝 开发模式特性

### 后端 (FastAPI)
- ✅ 自动重载（修改代码后自动重启）
- ✅ 交互式 API 文档（Swagger UI）
- ✅ 详细的错误信息

### 前端 (Next.js)
- ✅ 热重载（修改代码后自动刷新）
- ✅ 快速刷新（保持组件状态）
- ✅ TypeScript 类型检查

---

## 🚢 生产部署

参考 `DEPLOYMENT.md` 文件获取完整的部署指南。

关键步骤：
1. 部署 FastAPI 服务到云服务器
2. 配置环境变量 `PDF_API_BASE_URL`
3. 部署 Next.js 应用到 Vercel/Netlify
4. 配置 Supabase 存储（可选）

---

## 📚 更多文档

- `DEPLOYMENT.md` - 部署指南
- `OPTIMIZATION_SUMMARY.md` - 代码优化总结
- `.env.example` - 环境变量示例

---

## 💡 提示

1. **开发时始终保持后端运行**，否则前端无法进行 PDF 操作
2. **查看两个终端的日志**以便调试问题
3. **修改代码后无需手动重启**，两个服务都支持热重载
4. **使用 API 文档测试**后端功能：http://localhost:8000/docs
