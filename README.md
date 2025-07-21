# AI Chat Desktop

一个简单的AI聊天桌面应用程序，支持自定义API密钥。

## 开发环境设置

### 格式化配置

项目已配置了完整的代码格式化工具：

#### Prettier

- 自动格式化代码风格
- 支持Vue、JavaScript、CSS等文件
- 配置文件：`.prettierrc`

#### ESLint

- 代码质量检查
- Vue.js语法检查
- 配置文件：`eslint.config.js`

### 可用的脚本命令

```bash
# 格式化代码
npm run format

# 检查代码格式（不修改文件）
npm run format:check

# 代码质量检查和自动修复
npm run lint
```

### VSCode 配置

项目包含 `.vscode/settings.json` 配置，启用：

- 保存时自动格式化
- ESLint自动修复
- Prettier作为默认格式化工具

### 格式化规则

#### Prettier 配置

- 使用单引号
- 不使用分号
- 缩进使用2个空格
- 行宽限制80字符
- 箭头函数参数括号：避免

#### ESLint 规则

- Vue组件名可以是单个单词
- 未使用变量警告
- console语句警告
- 禁用debugger

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 项目结构

```
src/
├── components/     # Vue组件
├── composables/    # Vue组合式函数
├── router/         # 路由配置
├── styles/         # 样式文件
├── utils/          # 工具函数
└── views/          # 页面组件
```
