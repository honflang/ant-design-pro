# 01 — 系统总览仪表盘 Dashboard

**路由**：`/pricing-billing`  
**组件路径**：`src/pages/pricing-billing/dashboard/index.tsx`  
**菜单 i18n key**：`menu.pricing-billing`  
**所属用例**：全部用例（系统入口）

---

## 1. 页面目的

作为整个系统的入口，面向银行管理层和产品经理，展示：

- 平台覆盖的市场规模（国家/客户/产品）
- 关键业务指标的全局概览
- 各模块状态的快速入口
- 平台架构与实施策略的说明（对应 UC-4）

---

## 2. 页面布局

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

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 顶部统计 | `StatisticCard.Group` | 5 个全局指标卡，实时统计 |
| 市场覆盖 | `ProCard` + `Tag` 列表 | 展示 5 个 APAC 国家及其状态 |
| 收入概览 | `ProCard` + antd `Column` 图表（或 `@ant-design/charts`） | 近 30 天各市场计费金额 |
| 近期计费 | `ProTable` 轻量版（`ghost` card） | 最近 5 次计费执行记录 |
| 待审批 | `ProList` 或 `ProTable` | 待处理审批事项 |
| 平台架构 | `Steps` + `ProCard` | 可视化 Pricing→Billing→Invoice 流程 |

---

## 4. Mock 数据结构

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

## 5. Mock API

```
GET  /api/dashboard/summary            → DashboardSummary
GET  /api/dashboard/revenue-by-market  → RevenueByMarket[]
GET  /api/dashboard/recent-billing     → RecentBillingRun[]  (最多 5 条)
GET  /api/dashboard/pending-approvals  → PendingApproval[]
```

---

## 6. 业务逻辑

- 统计卡片数据从 `/api/dashboard/summary` 取，前端不做二次计算
- 收入图表展示各市场近 30 天计费金额，市场名固定为英文（国际货币专有名词）
- 近期计费 Run 列表点击行跳转 `/billing/run`
- 待审批列表点击跳转 `/pricing/approval`
- 平台架构 Steps 为纯静态展示，使用 `Steps` current=100（全部完成态）表示已上线

---

## 7. 国际化 Key 列表

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

## 8. 文件结构

```
src/pages/pricing-billing/dashboard/
├── index.tsx
├── data.d.ts
└── service.ts

mock/dashboard.ts
```
