# 01 — 系统总览仪表盘 Dashboard

**路由**：`/pricing-billing`  
**组件路径**：`src/pages/pricing-billing/dashboard/index.tsx`  
**菜单 i18n key**：`menu.pricing-billing`  
**所属用例**：全部用例（系统入口）

---

## 业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户（管理层、产品经理、运营人员），用于管理企业客户的定价、计费、税务规则和发票。

Dashboard 作为系统入口，需要向管理层快速传达：

> **集中化平台管理 APAC 多市场定价与计费，确保各地区合规性**

的产品定位。因此不仅要展示关键业务指标（如计费金额、客户数），还要突出**区域覆盖**与**合规体系**的完整性。

---

## 实现目标

Dashboard 应该让用户一眼看到：

1. **平台规模**：覆盖多少个APAC市场，有多少活跃客户和产品
2. **业务流量**：月度计费金额、计费执行状态（成功/进行/失败）
3. **运营健康度**：待审批事项数、系统可用性提示
4. **系统架构**：从Pricing→Billing→Tax→Invoice→Delivery的全流程可视化
5. **快速导航**：提供各业务模块（定价、计费、税务、发票）的入口

---

## 1. 页面目的

作为整个系统的入口，面向银行管理层和产品经理，展示：

- 平台覆盖的市场规模（国家/客户/产品）
- 关键业务指标的全局概览
- 各模块状态的快速入口
- 平台架构与实施策略的说明（对应 UC-4）

---

## 2. 菜单和路由配置

### 菜单结构

“定价与计费”不再作为菜单目录。Dashboard 及各业务分组直接显示在主导航中，访问 `/pricing-billing` 仍会自动进入 Dashboard。

主导航菜单示例：

```text
Dashboard (menu.pricing-billing-dashboard) [当前页，自动进入]
Pricing Configuration (menu.pricing)
  ├── Price Book (menu.pricing.price-book)
  ├── Activity Pricing (menu.pricing.activity-pricing)
  ├── Pricing Rules (menu.pricing.rules)
  ├── Pricing Simulation (menu.pricing.simulation)
  └── Approval Center (menu.pricing.approval)
Billing Management (menu.billing)
  ├── Billing Configuration (menu.billing.configuration)
  ├── Billing Run (menu.billing.run)
  └── Invoice Management (menu.billing.invoice)
Performance Management (menu.performance)
Customer Management (menu.customer)
Regional Configuration (menu.regional)
  └── Tax Configuration (menu.regional.tax)
Reports (menu.reports)
```

### 路由配置

```text
/pricing-billing              → Dashboard [当前页]
/pricing-billing/pricing      → Pricing Configuration
/pricing-billing/billing      → Billing Management
/pricing-billing/regional/tax → Tax Configuration
/pricing-billing/invoice      → Invoice Management
/pricing-billing/approvals    → Approvals
```

Dashboard 中的各卡片、链接需要支持跳转到相应的模块页面，具体跳转规则见"业务逻辑"章节。

---

## 3. 页面总体结构

页面采用 Ant Design Pro 常见的分层布局：

> 顶部统计 → 多区域内容卡片 → 底部架构流程

```
┌────────────────────────────────────────────────────────────────┐
│  Wholesale Banking Pricing & Billing Platform                   │
│  Centralized pricing and billing across APAC markets           │
├────────────────────────────────────────────────────────────────┤
│  顶部关键指标统计卡                                              │
│  [APAC Markets: 5] [Clients: 120] [Products: 8] [Monthly: 2.4M] │
├────────────────────────────────────────────────────────────────┤
│  [市场覆盖] │ [收入概览]                                         │
│  SG/HK/    │  30天各市场                                         │
│  CN/JP/AU  │  计费趋势                                           │
├────────────────────────────────────────────────────────────────┤
│  [近期计费Run] │ [待审批事项]                                     │
│  最近5条      │  优先级/类型标签                                 │
├────────────────────────────────────────────────────────────────┤
│  平台架构流程可视化 (Steps)                                      │
│  Pricing → Billing → Tax Determination → Invoice → Delivery    │
└────────────────────────────────────────────────────────────────┘
```

页面需要体现**Enterprise / Banking** 风格：简洁、专业、信息密度高、配色稳重。

---

## 4. 页面布局详情

```
┌────────────────────────────────────────────────────────────────┐
│  Wholesale Banking Pricing & Billing Platform                   │
│  Centralized pricing and billing across APAC markets           │
├────────────────────────────────────────────────────────────────┤
│  [APAC Markets: 5]  [Active Clients: 120]  [Products: 8]       │
│  [Monthly Billing: SGD 2.4M]  [Pending Approvals: 3]           │
├──────────────────────────┬─────────────────────────────────────┤
│  Market Coverage         │  Revenue Summary (30 days)          │
│  （地图或标志卡片展示      │  （折线图 / BarChart）               │
│   SG / HK / CN / JP / AU│                                      │
├──────────────────────────┼─────────────────────────────────────┤
│  Recent Billing Runs     │  Pending Approvals                  │
│  （最近5条，状态+金额）    │  （待审批的 Deal / Price 变更）       │
├──────────────────────────┴─────────────────────────────────────┤
│  Platform Architecture Flow                                     │
│  [Pricing Config] → [Billing Engine] → [Tax Determination]     │
│                  → [Invoice Generation] → [Client Delivery]    │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 顶部统计 | `StatisticCard.Group` | 5 个全局指标卡，实时统计 |
| 市场覆盖 | `ProCard` + `Tag` 列表 | 展示 5 个 APAC 国家及其状态 |
| 收入概览 | `ProCard` + antd `Column` 图表（或 `@ant-design/charts`） | 近 30 天各市场计费金额 |
| 近期计费 | `ProTable` 轻量版（`ghost` card） | 最近 5 次计费执行记录 |
| 待审批 | `ProList` 或 `ProTable` | 待处理审批事项 |
| 平台架构 | `Steps` + `ProCard` | 可视化 Pricing→Billing→Invoice 流程 |

---

## 6. Mock 数据结构

```typescript
// mock/dashboard.ts

interface DashboardSummary {
  apacMarkets: number;        // 5
  activeClients: number;      // 120
  products: number;           // 8
  monthlyBillingAmount: number; // 2_400_000 (SGD)
  pendingApprovals: number;   // 3
}

interface RevenueByMarket {
  market: string;       // 'Singapore' | 'Hong Kong' | 'China' | 'Japan' | 'Australia'
  currency: string;     // 'SGD'
  amount: number;       // 月度计费金额（折算 SGD）
  trend: 'up' | 'down' | 'flat';
  changePercent: number;
}

interface RecentBillingRun {
  id: string;
  market: string;
  billingCycle: string;   // '2026-07'
  totalAmount: number;
  currency: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  completedAt: string;
}

interface PendingApproval {
  id: string;
  type: 'PRICE_CHANGE' | 'DEAL' | 'WAIVER';
  subject: string;
  requestedBy: string;
  requestedAt: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}
```

---

## 7. Mock API

```
GET  /api/dashboard/summary            → DashboardSummary
GET  /api/dashboard/revenue-by-market  → RevenueByMarket[]
GET  /api/dashboard/recent-billing     → RecentBillingRun[]  (最多 5 条)
GET  /api/dashboard/pending-approvals  → PendingApproval[]
```

---

## 8. 业务逻辑

- 统计卡片数据从 `/api/dashboard/summary` 取，前端不做二次计算
- 收入图表展示各市场近 30 天计费金额，市场名固定为英文（国际货币专有名词）
- 近期计费 Run 列表点击行跳转 `/pricing-billing/billing/run`
- 待审批列表点击跳转 `/pricing-billing/pricing/approval`
- 平台架构 Steps 为纯静态展示，使用 `Steps` current=100（全部完成态）表示已上线

---

## 9. 国际化 Key 列表

```
menu.pricing-billing

pages.dashboard.title
pages.dashboard.subTitle
pages.dashboard.stat.markets
pages.dashboard.stat.clients
pages.dashboard.stat.products
pages.dashboard.stat.monthlyBilling
pages.dashboard.stat.pendingApprovals
pages.dashboard.section.marketCoverage
pages.dashboard.section.revenueSummary
pages.dashboard.section.recentBilling
pages.dashboard.section.pendingApprovals
pages.dashboard.section.architecture
pages.dashboard.col.market
pages.dashboard.col.billingCycle
pages.dashboard.col.totalAmount
pages.dashboard.col.status
pages.dashboard.col.completedAt
pages.dashboard.col.type
pages.dashboard.col.subject
pages.dashboard.col.requestedBy
pages.dashboard.col.urgency
pages.dashboard.status.completed
pages.dashboard.status.inProgress
pages.dashboard.status.failed
pages.dashboard.urgency.high
pages.dashboard.urgency.medium
pages.dashboard.urgency.low
```

---

## 10. 文件结构

```
src/pages/pricing-billing/dashboard/
├── index.tsx
├── data.d.ts
└── service.ts

mock/dashboard.ts
```

---

## 11. 与其他模块的业务关系

Dashboard 作为系统入口，需要通过 UI 清晰地体现各模块之间的业务流程：

### 定价配置 (Pricing Configuration)

- 定价规则是 Billing 的输入
- Dashboard 展示定价配置的状态（多少条规则、是否有待审批变更）
- 提供快速导航入口

### 计费管理 (Billing Management)

- 计费执行依赖Pricing规则
- Dashboard 展示最近的计费执行结果和状态
- 用户可点击行跳转查看详情

### 区域税务配置 (Tax Configuration)

- 税务规则配置是 Billing Tax Determination 的输入
- Dashboard 可展示各市场的税务规则覆盖情况（通过可选的统计卡或链接）
- Tax Configuration 模块通过自身的 Demo 来展示单个市场的税务规则

### 发票管理 (Invoice Management)

- 发票生成是整个流程的最后一步
- Invoice 使用 Billing Result + Tax Determination 结果生成
- Dashboard 中"平台架构"步骤明示了这一依赖关系

### 审批管理 (Approvals)

- Dashboard 展示待审批事项（包括定价变更、税规变更、交易豁免等）
- 快速跳转到审批界面进行处理

### 平台架构流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      Dashboard (Entry Point)                     │
│        Quick overview + Navigation to all modules                │
└──────────┬──────────────┬──────────────┬──────────────┬──────────┘
           │              │              │              │
    ┌──────▼──┐    ┌──────▼──┐    ┌──────▼──┐    ┌──────▼──┐
    │ Pricing │    │ Billing │    │   Tax   │    │ Invoice │
    │  Config │    │ Manager │    │  Config │    │ Manager │
    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                         │
                    [Approvals Hub]
                         │
          (所有模块的变更审批入口)
```

---

## 12. 交互要求

### 页面加载

- 进入 `/pricing-billing` 自动加载 Dashboard
- 同时发起 4 个 API 请求（并行）：
  - `/api/dashboard/summary` → 统计卡片数据
  - `/api/dashboard/revenue-by-market` → 收入图表数据
  - `/api/dashboard/recent-billing` → 最近计费列表
  - `/api/dashboard/pending-approvals` → 待审批列表
- 页面显示 Loading 骨架屏，所有数据加载完成后一起展示

### 统计卡片交互

- 卡片仅展示数据，**不可点击**（纯信息展示）
- 支持数字动画（从0到目标值）
- 如有趋势图标，可用向上/向下箭头表示环比变化

### Market Coverage 区域

- 展示 5 个 APAC 国家标志/卡片
- 点击某个国家卡片 → 可弹出该国的快速统计（可选）
- 长按或右键 → 快捷菜单（进入该国Pricing/Billing/Tax配置）
- 国家卡片可根据状态显示不同颜色（绿=正常，黄=有待审批，红=有异常）

### 收入图表区域

- 默认展示最近 30 天各市场的计费金额趋势
- 图表交互：
  - Hover 展示具体数值和日期
  - 可选的Legend筛选（点击Legend项 → 图表动画更新）
  - 下钻能力（可选：点击图表上某个数据点 → 弹出该天的详细账单）

### 最近计费 Runs 列表

- 展示最多 5 条最新的计费执行记录
- 列表项点击 → 跳转到 `/pricing-billing/billing/run/{runId}`
- 状态列支持过滤/排序
- 支持快速操作菜单（More / ⋮）：
  - View Details
  - Re-run (for COMPLETED runs)
  - Cancel (for IN_PROGRESS runs)
  - Retry (for FAILED runs)

### 待审批事项列表

- 展示最多 10 条待审批项
- 按 urgency (HIGH → MEDIUM → LOW) 排序
- 列表项点击 → 跳转到 `/pricing-billing/approvals/{approvalId}`
- 可按类型筛选（PRICE_CHANGE, DEAL, WAIVER 等）
- 支持快速审批操作菜单（More）：
  - Approve
  - Reject
  - Request More Info

### 平台架构 Steps 区域

- 展示全流程的 5-6 个步骤（纯静态展示）
- 所有步骤默认为 completed 状态（current=无穷大）
- 步骤标题可点击 → 跳转到对应模块（可选）
- 步骤之间的连线可用箭头或虚线表示数据流向

### 页面操作

- 支持全页面的**刷新**（Ctrl+R 或右上角刷新按钮）
- 支持**智能刷新**（如用户从其他模块返回Dashboard，自动刷新数据）
- 支持**导出**（Dashboard数据 → PDF/Excel，可选功能）

---

## 13. 技术要求

必须遵循当前项目已有的技术栈和代码风格：

- **Framework**: React 19 + TypeScript 7
- **UI Library**: Ant Design v6 + ProComponents v3
- **Styling**: 
  - Tailwind CSS v4 for layout
  - antd-style v4 with `createStyles` for theme-aware styles
  - Avoid Less unless absolutely necessary
- **State Management**: 
  - `useModel('@@initialState')` for current user/app state
  - `@tanstack/react-query` for server state (if needed beyond simple requests)
- **Request**: Umi Max built-in request plugin (configured in `src/requestErrorConfig.ts`)
- **Routing**: Umi Max declarative routing (defined in `config/routes.ts`)
- **i18n**: `useIntl()` + message files in `src/locales/`
- **Mock**: Express-style mock handlers in `mock/dashboard.ts` and/or `src/pages/pricing-billing/dashboard/_mock.ts`
- **Charts**: 
  - Ant Design `Column` / `Line` / `Area` components from antd
  - Or `@ant-design/charts` if more complex visualizations needed
  - Prefer antd native charts for simplicity

### Code Organization

```
src/pages/pricing-billing/dashboard/
├── index.tsx               # Page component (主要交互逻辑)
├── data.d.ts              # TypeScript interfaces (DashboardSummary, etc.)
├── service.ts             # API call wrappers (fetchSummary, fetchRevenue, ...)
└── _mock.ts               # Co-located mock handlers (可选)

mock/
└── dashboard.ts           # Global mock data (可选，如果co-locate)
```

### 不允许

- 不要引入新的 UI framework（如 Material-UI, Chakra）
- 不要修改现有无关页面
- 不要升级依赖（除非必要且被项目明确要求）
- 不要添加没有必要的第三方依赖
- 不要在 Dashboard 中硬编码业务逻辑（应通过 Mock 数据模拟）

### ESLint / TypeScript 检查

- 代码必须通过 `npm run lint` 检查
- 必须通过 `npm run tsc` 类型检查
- 可选：运行 `npm test` 确保单元测试通过

---

## 14. Demo 重点

这个页面的目标是向银行客户展示：

> **一个集中化平台可以跨越多个 APAC 市场进行定价、计费、税务和合规管理**

因此 UI 上需要突出：

### 1. 市场覆盖范围

```
5 APAC Jurisdictions
120 Active Clients
8 Product Categories
```

→ 清晰传达平台的**规模感**和**多市场能力**

### 2. 流程完整性

```
Pricing → Billing → Tax Determination → Invoice → Delivery
```

→ 让用户理解这是一条**完整的端到端流程**，而非孤立的模块

### 3. 运营健康度

```
Recent Billing Runs [状态]
Pending Approvals [优先级]
```

→ 展示系统的**实时运营状态**和**审批管理能力**

### 4. Regional Compliance

通过导航链接和卡片提示，暗示：

- 每个APAC市场有特定的**税务规则配置**
- 计费时会**自动应用**对应市场的税务规则
- Dashboard 是进入各市场详细配置的**入口**

---

## 国际化要求（仅中文 / English）

- 本页面仅支持 `zh-CN` 和 `en-US` 两种语言，不新增或要求其他语言包。
- 所有 UI 文案，包括标题、菜单、按钮、字段、图表标题、状态、空态、错误提示和导航文本，必须通过 `useIntl().formatMessage` 或 `<FormattedMessage />` 展示，不得硬编码中文或英文。
- 新增文案统一维护在 `src/locales/zh-CN/pages.ts`、`src/locales/en-US/pages.ts` 和对应的 `menu.ts` 中，使用 `pages.dashboard.*` 与菜单专属 key。
- 市场名、币种代码、客户名称等 Mock 业务数据可以保留标准值；图表和列表的展示标签仍必须国际化。
- 切换 `zh-CN` / `en-US` 后，Dashboard、统计卡片、图表、列表、Steps 和导航入口都必须显示对应语言。

## 15. 实现要求

在开始修改代码之前：

1. **检查当前项目结构**
   - 现有页面位置：`src/pages/pricing-billing/` 是否存在
   - 现有路由配置：`config/routes.ts` 的写法
   - 现有菜单写法：`config/routes.ts` 中的 `name` 和 `menu.xxx` i18n key

2. **检查现有模式**
   - 现有页面使用的 `ProTable` / `ProCard` 写法
   - Mock 数据的组织方式（co-located `_mock.ts` 还是全局 `mock/` ）
   - 请求拦截和错误处理方式（`src/requestErrorConfig.ts`）

3. **尽可能复用**
   - Ant Design Pro 内置的 `StatisticCard` / `ProCard` / `ProList` 等组件
   - 现有的 i18n 配置
   - 现有的 request 中间件和 error handling

4. **实现清单**
   - [ ] 页面结构和布局完成
   - [ ] 所有统计卡片展示（支持数字动画）
   - [ ] Market Coverage 区域展示 5 个国家卡片
   - [ ] Revenue Summary 图表展示 30 天趋势
   - [ ] Recent Billing Runs 列表（5条，支持跳转）
   - [ ] Pending Approvals 列表（按优先级排序）
   - [ ] Platform Architecture Steps 流程展示
   - [ ] 所有导航链接正确指向对应模块
   - [ ] Mock 数据完整且合理
   - [ ] 国际化 Key 完整添加（`zh-CN` 和 `en-US` 两个语言包）
   - [ ] TypeScript 编译无错误
   - [ ] Biome lint 通过
   - [ ] 页面能够正常运行并交互流畅

5. **可选增强**
   - Dashboard 右上角添加"导出"功能（导出为PDF或Excel）
   - Market Coverage 支持地图展示（如使用 @antv/l7）
   - Revenue Summary 支持更多维度的图表切换
   - 待审批列表支持快速批量审批

**完成后确保 TypeScript 编译没有明显错误，页面能够正常运行，具有银行级后台系统的专业感。**

**不要实现真实的后端 API 调用或真实业务逻辑。当前目标是一个可用于客户演示的高质量 Demo，所有数据通过 Mock 提供。**
