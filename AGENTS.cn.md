# AGENTS.cn.md — Ant Design Pro

本文件面向 AI 编程助手编写。假设你对该项目没有任何先验知识。在修改代码、运行测试或生成新文件之前，请先阅读本文件。

## 项目概述

Ant Design Pro 是一个开箱即用的 React 企业级中后台前端模板。本仓库是官方模板的 `6.0.2` 版本。

- **前端**：React 19 + TypeScript 7 + Umi Max 4 + antd 6 + ProComponents 3。
- **构建工具**：本地使用 Umi Max 自带的 `max build`；CI 使用 `utoo` 工具链（`ut build`、`ut lint`），其底层包装了 `utoopack`（Umi Max v4 使用的 Rust 构建器）。
- **样式**：Tailwind CSS v4 → antd-style v4 / `createStyles`（主题 token）→ CSS Modules → Less（仅用于遗留代码）。
- **状态**：Umi Max 数据流（`initialState`、`src/models/`）加上 `@tanstack/react-query` 管理服务端状态。
- **网络**：Umi Max request 插件（基于 axios），配置在 `src/requestErrorConfig.ts`。
- **Mock**：`mock/` 目录下的 Express 风格 mock 处理器，以及页面同级的 `src/pages/**/_mock.ts`。
- **后端 API**：一个独立的 Cloudflare Worker 位于 `cloudflare-worker/`，基于 Hono 构建。它**不是** npm workspace，拥有自己的 `package.json`。
- **部署**：静态站点部署到 GitHub Pages，CNAME 为 `preview.pro.ant.design`。

## 关键配置文件

| 文件 | 用途 |
|------|------|
| `package.json` | 项目元数据、脚本、依赖。要求 Node `>=22`。使用 `npm` 与 `package-lock.json`。 |
| `config/config.ts` | Umi Max `defineConfig`。启用 model、initialState、layout、locale、antd、request、reactQuery、access、analytics、tailwindcss、mock、openapi、utoopack、exportStatic。 |
| `config/routes.ts` | 声明式路由表。路由的 `name` 映射到 `src/locales/*/menu.ts` 中的 `menu.xxx` 国际化键；`access` 控制可见性。 |
| `config/defaultSettings.ts` | ProLayout 默认配置（主题、布局模式、颜色）。 |
| `config/proxy.ts` | 按 `UMI_ENV`（`dev`、`test`、`pre`）配置开发代理。 |
| `config/oneapi.json` | 用于生成 `src/services/ant-design-pro/` 的 OpenAPI 模式。 |
| `biome.json` | Linter 与格式化配置。Biome 替代 ESLint + Prettier。 |
| `vitest.config.ts` | 测试运行器配置。使用 `happy-dom` 与 `@testing-library/react`。 |
| `tsconfig.json` | TypeScript 严格模式配置，路径别名 `@/*`、`@@/*`、`@root/*`。 |
| `doctor.config.json` | `react-doctor` / `antd doctor` 的忽略/覆盖配置。 |
| `.commitlintrc.js` | 强制约定式提交。 |
| `.lintstagedrc` | 对暂存文件运行 Biome 检查。 |
| `tailwind.css` | Tailwind v4 入口，使用 `@source "./src"`。 |

## 构建与开发命令

```bash
# 安装
npm install

# 开发
npm start                 # 带 mock 数据的开发服务器
npm run dev               # 不带 mock 的开发服务器（MOCK=none）
npm run start:no-mock     # 不带 mock 开发的别名
npm run start:test        # UMI_ENV=test，不带 mock
npm run start:pre         # UMI_ENV=pre，不带 mock

# 构建与预览
npm run build             # 使用 max build 进行生产构建
npm run preview           # 在 8000 端口预览 dist
npm run preview:build     # 构建并预览
npm run analyze           # 带包分析器的构建

# 代码质量
npm run lint              # Biome lint + TypeScript 检查
npm run biome:lint        # 仅 Biome lint
npm run biome             # Biome check --write（自动修复）
npm run tsc               # 仅类型检查

# 测试
npm test                  # vitest run
npm run test:coverage     # vitest run --coverage
npm run test:watch        # vitest watch
npm run test:ui           # vitest UI

# 代码生成与工具
npm run openapi           # 从 config/oneapi.json 重新生成 src/services/ant-design-pro/
npm run simple            # 不可逆地将项目精简为简单版本 — 请先提交
npm run i18n-remove       # 移除国际化基础设施

# Ant Design CLI（开发依赖）
npx antd info <Component> # 编写 antd 代码前查询组件 props/API
npx antd demo <Component> <demo> # 获取可运行的 demo
npx antd lint ./src       # 检查已废弃或有问题的 antd 用法
npx antd doctor           # 项目健康检查
npx antd migrate <from> <to> # 迁移检查清单
```

### CI 与本地构建

本地脚本直接调用 `max`（`max dev`、`max build`）。CI 通过 `utooland/setup-utoo` 安装 `utoo` 工具链并运行 `ut lint` / `ut build`。两者输出应保持一致，但如果出现 CI 专属失败，可在安装工具链后用 `ut` 命令验证。

## 项目结构

```
.
├── cloudflare-worker/     # Hono API worker（独立包）
├── config/                # Umi Max 配置、路由、代理、设置、OpenAPI 模式
├── mock/                  # 全局 Express 风格 mock
├── public/                # 静态资源
├── scripts/               # 一次性脚本（simple.js、i18n-remove.js）
├── src/
│   ├── .umi/              # Umi Max 自动生成 — 可安全删除并重启
│   ├── components/        # 共享布局与业务组件
│   ├── locales/           # 国际化消息文件（8 种语言）
│   ├── pages/             # 页面组件，同级存放 service/mock/style/test
│   ├── services/          # API 服务；ant-design-pro/ 为自动生成
│   ├── utils/             # 工具函数与测试
│   ├── access.ts          # 权限定义（canAdmin）
│   ├── app.tsx            # 运行时配置：getInitialState、layout、request、rootContainer
│   ├── global.tsx         # 全局副作用（导入 tailwind.css）
│   ├── global.less        # 全局样式
│   ├── loading.tsx        # 初始加载组件
│   ├── requestErrorConfig.ts # 请求/响应拦截器与错误处理
│   ├── service-worker.js  # Service worker 注册
│   ├── typings.d.ts       # 全局环境类型声明
│   └── manifest.json      # PWA 配置
├── tests/
│   ├── __mocks__/         # 测试 mock
│   └── setupTests.ts      # Vitest 配置：localStorage、Worker、matchMedia、ResizeObserver
├── types/
│   └── index.d.ts         # 手写 API 类型
└── vitest.config.ts
```

## 代码组织与约定

### 页面同位存放

每个页面目录应包含：

- `index.tsx` — 页面组件。
- `service.ts` — 针对非生成端点的手写 API 辅助函数。
- `_mock.ts` — 同位的 Express 风格 mock 处理器。
- `data.d.ts` — 本地 TypeScript 类型。
- `*.style.ts` / `*.less` — 页面专属样式（优先使用 `antd-style` 的 `createStyles`）。
- `*.test.tsx` / `*.test.ts` — Vitest 测试。

### 核心运行时文件

- `src/app.tsx`
  - `getInitialState()` 通过 `GET /api/currentUser` 获取当前用户。401 时重定向到 `/user/login` 并附带 `redirect` 查询参数。
  - `layout` 返回 ProLayout 运行时配置。
  - `request` 在生产环境设置 Cloudflare Worker 为 `baseURL`，并合并 `errorConfig`。
  - `rootContainer` 用 `OfflineBanner` 与 `ErrorBoundary` 包裹应用。
- `src/access.ts` — 返回 `{ canAdmin: currentUser?.access === 'admin' }`。供路由的 `access` 字段使用。
- `src/requestErrorConfig.ts` — 针对 `success`、`errorCode`、`errorMessage`、`showType` 的标准化错误处理，以及网络/离线处理。

### 路由

路由声明在 `config/routes.ts`。`name` 字段映射到 `src/locales/*/menu.ts` 中的 `menu.<name>` 键。`access` 字段引用 `src/access.ts` 返回的键。

### 样式优先级

1. Tailwind CSS v4 用于布局与工具类。
2. `antd-style` v4 的 `createStyles` 用于感知主题 token 的组件样式。
3. CSS Modules。
4. Less 仅用于遗留代码；新代码避免使用。

`src/global.tsx` 导入 `tailwind.css`。全局样式位于 `src/global.less`。

### 国际化

`src/locales/` 下支持八种语言：`bn-BD`、`en-US`、`fa-IR`、`id-ID`、`ja-JP`、`pt-BR`、`zh-CN`、`zh-TW`。

使用 `useIntl().formatMessage({ id, defaultMessage })` 或 `<FormattedMessage />`。默认语言为 `zh-CN`。

### 状态

- 使用 `useModel('@@initialState')` 获取当前用户与布局设置。
- 使用 `useModel('filename')` 获取 `src/models/` 中的自定义全局 hook（如需要可创建该目录）。
- 使用 ProTable 的 `request` 处理简单列表数据加载。
- 使用 `@tanstack/react-query`（`useQuery`、`useMutation`）处理复杂服务端状态（例如 `src/pages/table-list/index.tsx`）。

## 测试策略

- **运行器**：Vitest（`vitest.config.ts`），非 Jest。
- **环境**：`happy-dom`。
- **全局**：启用 Vitest 全局变量（`describe`、`it`、`expect`、`vi`）。
- **配置**：`tests/setupTests.ts` 提供 `localStorage`、`Worker`、`URL.createObjectURL`、`MessageChannel`、`matchMedia`、`ResizeObserver` 的 mock。
- **测试位置**：`src/**/*.{test,spec}.{ts,tsx}`。
- **排除**：`src/pages/user/login/login.test.tsx` 被排除，因为它依赖 Umi 的 Jest 运行器，无法在 Vitest 下运行。
- **覆盖率**：由 `@vitest/coverage-v8` 提供。覆盖率排除 `src/.umi/**`、`src/services/ant-design-pro/**`、`src/**/*.d.ts`、`src/**/index.style.ts`。

提交前运行测试：`npm test`。

## 代码风格指南

- **仅使用 Biome** — 不要添加 ESLint 或 Prettier 配置。
- Biome 忽略 `src/.umi*`、`src/services`、`mock`、`dist`、`public`、`coverage`、`node_modules`。
- 格式化器对 JS/TS 使用空格与单引号。
- Biome 中 JSX runtime 配置为 `reactClassic`。
- 有意禁用的 lint 规则：`noExplicitAny`、`noUnknownAtRules`、`useUniqueElementIds`、`useExhaustiveDependencies`，以及若干 a11y 规则。
- 运行 `npm run biome` 自动修复暂存区级别问题；提交前运行 `npm run lint` 验证。

## 关键规则

1. **永远不要手动编辑 `src/services/ant-design-pro/`。** 它通过 `npm run openapi` 从 `config/oneapi.json` 生成。
2. **`src/.umi/` 是自动生成的。** 如果 Umi 表现异常，删除它并重启开发服务器。
3. **`npm run simple` 是不可逆的。** 它会删除页面目录、mock 与依赖。运行前请先提交或创建分支。
4. **始终使用约定式提交。** Husky + commitlint 会强制校验。
5. **要求 Node ≥ 22。** 使用 `npm` 并保持 `package-lock.json` 同步。
6. **编写 antd 代码前**，运行 `npx antd info <Component>` 验证 props/API；不要依赖记忆。
7. **CI 中必须通过两个 lint 关卡**：`npm run biome:lint` 与 `npm run tsc`。`antd-cli.yml` 工作流还会运行 `npx antd doctor`、`npx antd lint ./src` 与 `npx antd usage ./src`。

## Mock 与 API

- 本地开发 mock 来自 `mock/` 与 `src/pages/**/_mock.ts`。
- 默认 mock 凭据：`admin` / `ant.design`（管理员权限）或 `user` / `ant.design`（普通用户权限）。
- 生产环境前端通过 `src/app.tsx` 中的 `baseURL` 指向 `https://pro-api.ant-design-demo.workers.dev`。
- `cloudflare-worker/` 中的 Cloudflare Worker 在 `/api` 下暴露路由，使用 Hono + CORS。

## 部署

- 推送到 `all-blocks` 分支时，GitHub Actions 构建并部署到 GitHub Pages。
- `deploy.yml` 从 `github.sha` 设置 `COMMIT_HASH`，以便前端展示。
- CNAME 为 `preview.pro.ant.design`。
- Cloudflare Worker 单独从 `cloudflare-worker/` 使用 `wrangler deploy` 部署。

## 安全注意事项

- 默认请求不附带 bearer token；`src/requestErrorConfig.ts` 中的拦截器有注释掉的示例。仅在有意需要时添加认证。
- 生产环境 `baseURL` 是公开 demo worker；不要向其发送真实密钥或 PII。
- Mock 凭据是公开的，仅用于本地开发。
- Cloudflare Worker CORS 根据 `corsOrigin()` 允许来源，并回退到 `https://preview.pro.ant.design`。

## AI Skills

本仓库在 `.claude/skills/` 下包含 Claude Code skills：

- `/pro-upgrade` — 在保留业务代码的前提下升级到最新 Ant Design Pro 模板。
- `/antd` — 查询 antd API、运行 antd 专属 lint、获取 demo、执行迁移。

如果这些 skills 已可用，直接运行即可；否则通过 `npx skills add ant-design/ant-design-pro` 刷新。

## 有用参考

- Umi Max 文档：https://umijs.org/docs/max/introduce
- antd 文档：https://ant.design/
- ProComponents 文档：https://procomponents.ant.design/
- Ant Design X 文档：https://x.ant.design/
- Tailwind CSS v4 文档：https://tailwindcss.com/
- 项目速查表：`docs/cheatsheet.en-US.md` / `docs/cheatsheet.zh-CN.md`
