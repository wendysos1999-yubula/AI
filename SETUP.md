# AI 情报站 - 自动更新设置指南

## 部署步骤

### 1. 创建 GitHub 仓库

1. 登录 GitHub，创建新仓库（如 `ai-intelligence-hub`）
2. 将本地代码推送到 GitHub：

```bash
cd "D:/fish2026/资讯站"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/ai-intelligence-hub.git
git push -u origin main
```

### 2. 配置 Anthropic API 密钥

1. 获取 API 密钥：访问 https://console.anthropic.com/
2. 在 GitHub 仓库中添加密钥：
   - 进入仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的 API 密钥
   - 点击 "Add secret"

### 3. 启用 GitHub Pages

1. 进入仓库 → Settings → Pages
2. Source 选择 "GitHub Actions"
3. 保存设置

### 4. 启用 GitHub Actions

1. 进入仓库 → Actions
2. 如果看到提示，点击 "I understand my workflows, go ahead and enable them"
3. 选择 "Daily Content Update" workflow
4. 点击 "Run workflow" 手动测试一次

## 自动更新时间

- 默认每天北京时间 **早上 8:00** 自动运行
- 可在 `.github/workflows/daily-update.yml` 中修改 cron 表达式

```yaml
schedule:
  - cron: '0 0 * * *'  # UTC 时间，对应北京时间 8:00
```

常用时间设置：
- 北京时间 6:00 → `'0 22 * * *'` (前一天 UTC)
- 北京时间 8:00 → `'0 0 * * *'`
- 北京时间 12:00 → `'0 4 * * *'`
- 北京时间 20:00 → `'0 12 * * *'`

## 手动触发更新

1. 进入 GitHub 仓库 → Actions
2. 选择 "Daily Content Update"
3. 点击 "Run workflow"

## 本地测试

```bash
# 设置 API 密钥（Windows PowerShell）
$env:ANTHROPIC_API_KEY="your-api-key"

# 生成今日内容
npm run generate

# 更新 data.js
npm run update-data
```

## 费用估算

- Claude API 每次调用约消耗 2000-4000 tokens
- 每天一次更新，月费用约 $1-3（取决于具体用量）

## 故障排查

### Actions 运行失败
1. 检查 Actions 日志查看错误信息
2. 确认 `ANTHROPIC_API_KEY` 已正确设置
3. 确认 API 密钥有效且有余额

### 内容未更新
1. 检查 data 目录是否有新的 JSON 文件
2. 检查 js/data.js 是否包含最新日期
3. 清除浏览器缓存后刷新页面

## 自定义内容模板

编辑 `scripts/generate-daily-content.js` 中的 `buildPrompt` 函数可以自定义：
- 生成内容的风格和角度
- 各个 section 的卡片数量
- 信息来源的偏好
