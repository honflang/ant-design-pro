# Wholesale Banking Pricing & Billing System — Demo 设计总览

> **文档说明**：本文档为面向客户演示的 Demo 系统设计总览。所有接口均使用 Mock，不接入真实后端。
> 需求来源：[Requirements & Use cases](./Requirements%20&%20Use%20cases.md)

---

## 一、系统定位

本 Demo 面向银行内部用户，展示一个支持亚太多市场的**批发银行定价与计费平台**的核心能力，涵盖四大业务用例：

| 用例编号 | 业务用例                              | 核心能力                           |
| ---- | --------------------------------- | ------------------------------ |
| UC-1 | 区域适配与合规（Regional Fit & Compliance） | 多语言、WHT/VAT/GST、合规发票           |
| UC-2 | 灵活定价配置（Flexible Pricing）          | 多维度定价、捆绑、返佣/减免、批量上传            |
| UC-3 | 交易定价、模拟与收入追踪（Deal Pricing）        | 交易定价、审批工作流、发票更正、费用重算、追溯交易      |
| UC-4 | 实施方法与过渡策略（Implementation）         | 数据迁移方案、并行运行策略、零影响过渡（本 Demo 侧重展示架构思路，不做可交互页面） |

---

## 二、菜单与路由结构

```
/pricing-billing               ← 系统总览仪表盘
/pricing                       ← 定价管理（父菜单）
  /pricing/price-book          ← 价格手册
  /pricing/rules               ← 定价规则
  /pricing/simulation          ← 定价模拟工具
  /pricing/approval            ← 审批工作流
/billing                       ← 计费管理（父菜单）
  /billing/configuration       ← 计费配置
  /billing/run                 ← 计费执行
  /billing/invoice             ← 发票管理
/performance                   ← 绩效管理（父菜单）
  /performance/revenue         ← 收入追踪
  /performance/deal            ← 交易绩效监控
/customer                      ← 客户管理（父菜单）
  /customer/360                ← 客户 360 全景视图
  /customer/portfolio          ← 客户组合管理
/regional                      ← 区域配置（父菜单）
  /regional/tax                ← 税务配置 ✅ 已实现
/reports                       ← 数据分析（父菜单）
  /reports/analytics           ← 分析报表
```

路由对应的 `config/routes.ts` 配置片段：

```ts
{
  path: '/pricing-billing',
  name: 'pricing-billing',
  icon: 'bank',
  component: './pricing-billing/dashboard',
},
{
  path: '/pricing',
  name: 'pricing',
  icon: 'dollarCircle',
  routes: [
    { path: '/pricing', redirect: '/pricing/price-book' },
    { name: 'price-book',   icon: 'book',        path: '/pricing/price-book',   component: './pricing/price-book' },
    { name: 'rules',        icon: 'setting',     path: '/pricing/rules',        component: './pricing/rules' },
    { name: 'simulation',   icon: 'experiment',  path: '/pricing/simulation',   component: './pricing/simulation' },
    { name: 'approval',     icon: 'checkCircle', path: '/pricing/approval',     component: './pricing/approval' },
  ],
},
{
  path: '/billing',
  name: 'billing',
  icon: 'fileText',
  routes: [
    { path: '/billing', redirect: '/billing/configuration' },
    { name: 'configuration', icon: 'tool',        path: '/billing/configuration', component: './billing/configuration' },
    { name: 'run',           icon: 'playCircle',  path: '/billing/run',           component: './billing/run' },
    { name: 'invoice',       icon: 'fileInvoice', path: '/billing/invoice',       component: './billing/invoice' },
  ],
},
{
  path: '/performance',
  name: 'performance',
  icon: 'lineChart',
  routes: [
    { path: '/performance', redirect: '/performance/revenue' },
    { name: 'revenue', icon: 'rise',      path: '/performance/revenue', component: './performance/revenue' },
    { name: 'deal',    icon: 'fund',      path: '/performance/deal',    component: './performance/deal' },
  ],
},
{
  path: '/customer',
  name: 'customer',
  icon: 'team',
  routes: [
    { path: '/customer', redirect: '/customer/360' },
    { name: '360',       icon: 'radar-chart', path: '/customer/360',       component: './customer/360' },
    { name: 'portfolio', icon: 'wallet',      path: '/customer/portfolio', component: './customer/portfolio' },
  ],
},
{
  path: '/regional',
  name: 'regional',
  icon: 'global',
  routes: [
    { path: '/regional', redirect: '/regional/tax' },
    { name: 'tax', icon: 'audit', path: '/regional/tax', component: './regional/tax' }, // ✅ 已实现
  ],
},
{
  path: '/reports',
  name: 'reports',
  icon: 'barChart',
  routes: [
    { path: '/reports', redirect: '/reports/analytics' },
    { name: 'analytics', icon: 'pieChart', path: '/reports/analytics', component: './reports/analytics' },
  ],
},
```

---

## 三、技术栈与实现规范

### 3.1 技术栈

| 层次       | 技术                                                                  |
| -------- | ------------------------------------------------------------------- |
| 框架       | React 19 + TypeScript + Umi Max 4                                   |
| UI 组件    | Ant Design v6 + ProComponents v3（ProTable、ProForm、ProCard、ProDescriptions） |
| 样式       | Tailwind CSS v4 → antd-style v4 `createStyles` → CSS Modules        |
| 路由       | Umi Max 声明式路由（`config/routes.ts`）                                   |
| 状态       | `useModel('@@initialState')` + `@tanstack/react-query`              |
| 请求       | `request` from `@umijs/max`（axios-based）                            |
| Mock     | `mock/*.ts` Express 风格 + `src/pages/**/_mock.ts` 页面级 Mock           |
| 国际化      | `useIntl()` from `@umijs/max`，key 统一放 `src/locales/*/pages.ts`      |

### 3.2 Mock 规范

- 所有接口均为 Mock，不连接真实后端
- Mock 文件统一放在 `mock/` 目录，命名规则：`<module>.ts`（如 `mock/pricing.ts`、`mock/billing.ts`）
- 接口路径前缀：`/api/<module>/<resource>`
- Mock 文件导出 `export default { 'GET /api/...': handler, ... }` 格式
- 支持基本的 filter、pagination、CRUD 操作

### 3.3 国际化规范

- key 命名格式：`pages.<module>.<page>.<element>`
- 例：`pages.pricing.priceBook.title`、`pages.billing.invoice.col.amount`
- 新增 key 同时维护：`src/locales/en-US/pages.ts` 和 `src/locales/zh-CN/pages.ts`
- 菜单 key 在 `src/locales/*/menu.ts` 中维护，格式：`menu.<module>.<page>`
- **所有 JSX 中禁止硬编码中英文字符串**，必须使用 `useIntl().formatMessage({ id })`

### 3.4 页面结构规范

每个业务页面遵循以下文件结构：

```
src/pages/<module>/<page>/
├── index.tsx          # 页面主组件
├── _mock.ts           # 页面级 Mock（可选，优先用 mock/ 目录）
├── data.d.ts          # TypeScript 类型定义
├── service.ts         # API 调用函数（封装 request）
└── index.style.ts     # 页面样式（使用 createStyles，可选）
```

### 3.5 页面布局规范

- 外层使用 `PageContainer`（标题、面包屑、操作按钮）
- 统计卡片使用 `StatisticCard.Group`
- 列表使用 `ProTable`（支持 request、filter、pagination）
- 详情/表单使用 `Drawer`（宽度 680px）+ `ProForm` 或 `ProDescriptions`
- 分组卡片使用 `ProCard`（嵌套于 Drawer 内部分组）

---

## 四、业务用例与页面映射

| 业务用例 | 覆盖页面                                                                 |
| ---- | -------------------------------------------------------------------- |
| UC-1 区域适配与合规 | Regional > **Tax Configuration** ✅                              |
| UC-2 灵活定价配置  | Pricing > **Price Book**、**Pricing Rules**、**Simulation**、**Approval** |
| UC-3 交易定价与追踪 | Pricing > **Simulation**、Billing > **Invoice**、Performance > **Revenue**、**Deal** |
| UC-4 实施过渡策略  | Dashboard（架构说明区块）                                               |

---

## 五、页面设计文档索引

| # | 页面 | 路由 | 文档链接 | 状态 |
|---|------|------|---------|------|
| 01 | 系统总览仪表盘 | `/pricing-billing` | [01-dashboard.md](./pages/01-dashboard.md) | 待实现 |
| 02 | 价格手册 | `/pricing/price-book` | [02-pricing-price-book.md](./pages/02-pricing-price-book.md) | 待实现 |
| 03 | 定价规则 | `/pricing/rules` | [03-pricing-rules.md](./pages/03-pricing-rules.md) | 待实现 |
| 04 | 定价模拟工具 | `/pricing/simulation` | [04-pricing-simulation.md](./pages/04-pricing-simulation.md) | 待实现 |
| 05 | 审批工作流 | `/pricing/approval` | [05-pricing-approval.md](./pages/05-pricing-approval.md) | 待实现 |
| 06 | 计费配置 | `/billing/configuration` | [06-billing-config.md](./pages/06-billing-config.md) | 待实现 |
| 07 | 计费执行 | `/billing/run` | [07-billing-run.md](./pages/07-billing-run.md) | 待实现 |
| 08 | 发票管理 | `/billing/invoice` | [08-billing-invoice.md](./pages/08-billing-invoice.md) | 待实现 |
| 09 | 收入追踪 | `/performance/revenue` | [09-performance-revenue.md](./pages/09-performance-revenue.md) | 待实现 |
| 10 | 交易绩效监控 | `/performance/deal` | [10-performance-deal.md](./pages/10-performance-deal.md) | 待实现 |
| 11 | 客户 360 视图 | `/customer/360` | [11-customer-360.md](./pages/11-customer-360.md) | 待实现 |
| 12 | 客户组合管理 | `/customer/portfolio` | [12-customer-portfolio.md](./pages/12-customer-portfolio.md) | 待实现 |
| 13 | 税务配置 | `/regional/tax` | [13-regional-tax.md](./pages/13-regional-tax.md) | ✅ 已实现 |
| 14 | 分析报表 | `/reports/analytics` | [14-reports-analytics.md](./pages/14-reports-analytics.md) | 待实现 |

---

## 六、Mock 数据核心实体关系

```
Customer (客户)
  ├── PriceBook (价格手册) ←── PricingRule (定价规则)
  │     └── BillingConfig (计费配置)
  │           └── BillingRun (计费执行)
  │                 └── Invoice (发票)
  │                       └── TaxRule (税务规则) ← /regional/tax
  └── Deal (交易)
        ├── DealSimulation (模拟)
        ├── ApprovalWorkflow (审批)
        └── RevenueTracking (收入追踪)
```

---

## 七、Demo 演示路径建议

**推荐演示顺序（约 30 分钟）：**

1. **Dashboard** — 系统总览，展示平台规模与全局指标
2. **Regional > Tax Configuration** — UC-1：展示多市场税务规则集中管理
3. **Pricing > Price Book** → **Pricing Rules** — UC-2：展示灵活定价配置
4. **Pricing > Simulation** — UC-2/UC-3：定价模拟，实时测算定价方案
5. **Pricing > Approval** — UC-3：审批工作流，含门槛自动通过逻辑
6. **Billing > Configuration** → **Billing Run** → **Invoice** — UC-3：端到端计费与发票生成
7. **Performance > Revenue** — UC-3：收入追踪与预警
8. **Reports > Analytics** — 数据分析与报表
