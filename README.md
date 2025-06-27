# QuesBank 智能题库网页版

**版本号：1.1**  
开发者：史智阳  
邮箱：562052228@qq.com

## 在线体验

🌐 **在线地址**: [https://weeexiao.github.io/QuesBank/](https://weeexiao.github.io/QuesBank/)

## 项目简介

QuesBank 智能题库网页版是一个面向教师和学生的本地化题库管理与刷题、考试平台。支持题库的导入导出、AI 生成题目、题库管理、刷题模式、考试模式等多种功能，界面美观，交互友好。

## 主要功能
- 支持手动输入、AI 生成、导入导出题库
- 题库本地管理（重命名、删除、导出、导入、新建）
- 刷题模式：自由刷题、查看解析、保存到题库
- 考试模式：多题库随机抽题、倒计时、自动评分、错题解析
- 题库详情：题目增删改查，支持多题型
- 支持批量导入、导出题库
- 响应式设计，适配PC和移动端

## 主要页面
- `index.html`：刷题模式主页面，支持AI生成、手动输入、题库收藏
- `exam.html`：考试模式页面，支持多题库抽题、倒计时、自动评分
- `bank.html`：题库管理页面，支持题库的增删改查、导入导出、新建
- `bank_detail.html`：题库详情页，支持题目增删改查
- `settings.html`：设置页面，预留通用设置项

## 使用说明
1. 打开 `index.html` 进入刷题模式，可手动输入或AI生成题目，保存到本地题库
2. 进入"题库"页面可管理所有题库，支持新建、重命名、删除、导入、导出
3. 点击题库"详情"可对题目进行增删改查
4. 进入"考试模式"页面，选择题库、设置题数和时间，开始考试
5. 支持题库和题目数据的本地导入导出，兼容多种格式

## 反馈与支持
如有建议或问题，请联系开发者：史智阳  
邮箱：562052228@qq.com

## 技术特性

### 前端技术
- HTML5 + CSS3 + JavaScript
- Tailwind CSS 样式框架
- Font Awesome 图标库
- 响应式设计

### API集成
- DeepSeek Chat API
- 异步请求处理
- 错误处理和重试机制
- 用户友好的提示信息

### 数据格式
```json
{
  "选择题": [
    {
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确答案",
      "explanation": "解析说明"
    }
  ],
  "填空题": [
    {
      "question": "题目内容，用(  )表示空位",
      "answer": "正确答案",
      "explanation": "解析说明"
    }
  ],
  "判断题": [
    {
      "question": "题目内容",
      "answer": "正确/错误",
      "explanation": "解析说明"
    }
  ]
}
```

## 使用方法

### 1. 启动应用
```bash
# 使用Python启动本地服务器
python -m http.server 8000

# 或使用Node.js
npx http-server

# 然后在浏览器中访问 http://localhost:8000
```

### 2. 输入题目
- **JSON输入**：直接粘贴符合格式的JSON题目
- **AI生成**：输入文本内容，设置各题型数量，点击生成

### 3. 答题
- 选择答案后自动评分
- 点击"查看解析"查看详细说明
- 完成所有题目后显示最终得分

### 4. 题库管理
- 点击"保存到题库"收藏当前题目
- 使用导入/导出功能备份题库
- 在"我的题库"中管理收藏的题目

## 配置说明

### API配置
默认API Key已配置，如需使用自己的Key：
1. 在"API Key"输入框中输入您的DeepSeek API Key
2. 点击眼睛图标可切换显示/隐藏

### 存储限制
- 单个题库最多50个题目
- 本地存储最多50个题库
- 超出限制时自动删除最旧的题库

## 浏览器兼容性
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项
1. 请确保网络连接正常以使用AI生成功能
2. 建议定期导出题库作为备份
3. 清空题库操作不可恢复，请谨慎操作
4. API调用可能产生费用，请注意使用频率

## 更新日志

### v1.0.0 (2025-01-XX)
- 初始版本发布
- 支持基础题目解析和答题功能
- 集成DeepSeek API
- 实现本地题库管理
- 添加导入导出功能 

## 部署教程

### 方法一：GitHub Pages 部署（推荐）

1. **Fork 项目**
   ```bash
   # 点击右上角 Fork 按钮，将项目复制到你的 GitHub 账户
   ```

2. **启用 GitHub Pages**
   - 进入你的仓库设置 (Settings)
   - 找到 Pages 选项
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 或 "master"
   - 保存设置

3. **访问你的网站**
   ```
   https://你的用户名.github.io/QuesBank/
   ```

### 方法二：本地部署

1. **下载项目**
   ```bash
   git clone https://github.com/Weeexiao/QuesBank.git
   cd QuesBank
   ```

2. **使用本地服务器**
   ```bash
   # 使用 Python 内置服务器
   python -m http.server 8000
   
   # 或使用 Node.js 的 http-server
   npx http-server -p 8000
   
   # 或使用 PHP 内置服务器
   php -S localhost:8000
   ```

3. **访问网站**
   ```
   http://localhost:8000
   ```

### 方法三：Vercel 部署

1. **注册 Vercel**
   - 访问 [vercel.com](https://vercel.com) 注册账户

2. **导入项目**
   - 点击 "New Project"
   - 选择 "Import Git Repository"
   - 选择你的 QuesBank 仓库

3. **自动部署**
   - Vercel 会自动检测并部署
   - 获得一个 `.vercel.app` 域名

### 方法四：Netlify 部署

1. **注册 Netlify**
   - 访问 [netlify.com](https://netlify.com) 注册账户

2. **部署项目**
   - 点击 "New site from Git"
   - 选择你的 QuesBank 仓库
   - 选择分支和构建设置

3. **自定义域名**
   - 获得一个 `.netlify.app` 域名
   - 可绑定自定义域名

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: Tailwind CSS
- **图标**: Font Awesome
- **AI API**: DeepSeek API
- **存储**: LocalStorage

## 页面导航

- **刷题模式**: 主要功能页面，支持题目输入和答题
- **测试模式**: 功能测试页面
- **考试模式**: 模拟考试环境
- **题库管理**: 题库的增删改查
- **设置**: 系统配置
- **帮助**: 使用说明

## 开发说明

### 项目结构
```
QuesBank/
├── index.html          # 主页面（刷题模式）
├── exam.html           # 考试模式页面
├── bank.html           # 题库管理页面
├── bank_detail.html    # 题库详情页面
├── settings.html       # 设置页面
├── help.html           # 帮助页面
├── exam.js             # 考试模式逻辑
├── bank.js             # 题库管理逻辑
├── bank_detail.js      # 题库详情逻辑
└── README.md           # 项目说明
```

### 本地开发
1. 克隆项目到本地
2. 使用本地服务器运行（避免 CORS 问题）
3. 修改代码后刷新页面查看效果

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目地址: [https://github.com/Weeexiao/QuesBank](https://github.com/Weeexiao/QuesBank)
- 在线体验: [https://weeexiao.github.io/QuesBank/](https://weeexiao.github.io/QuesBank/)
- 邮箱: 562052228@qq.com

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！ 