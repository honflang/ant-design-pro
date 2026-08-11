# 09 — 收入追踪 Revenue Tracking

**路由**：`/pricing-billing/performance/revenue`  
**组件路径**：`src/pages/performance/revenue/index.tsx`  
**菜单 i18n key**：`menu.performance.revenue`  
**所属用例**：UC-3（第 5 点）、绩效管理需求

---

## 1. 页面目的

收入追踪页面面向产品管理和销售团队，提供：
- 实时收入看板（按市场、产品、客户维度）
- 收入预警：检测低于预期门槛的客户/产品（Revenue Leakage Detection）
- 定价执行追踪：实际收入 vs 合同约定收入的差异分析

演示价值：
- "Detect and stop revenue leakage"（绩效管理需求第 1 条）
- "Track pricing execution and alert management"（需求第 2 条）
- UC-3 第 5 点：持续收入追踪与绩效监控

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Revenue Tracking                                                 │
│ Monitor pricing execution and detect revenue leakage            │
├──────────────────────────────────────────────────────────────────┤
│ [MTD Revenue: SGD 2.4M] [vs Last Month: +3.2%] [Alerts: 4]     │
│ [Revenue Leakage Est.: SGD 48K] [Deal Achievement: 94%]         │
├──────────────────────────────────────────────────────────────────┤
│ [Period ▼] [Market ▼] [Product ▼]                               │
├────────────────────────────┬────────────────────────────────────┤
│ Revenue by Market          │ Revenue by Product                  │
│ （柱状图 or StackedBar）   │ （饼图或横向条形图）                 │
│ SG: 37%  HK: 27%           │ Cash: 45%  Trade: 33%  FX: 22%     │
│ CN: 22%  JP: 9%  AU: 5%   │                                     │
├────────────────────────────┴────────────────────────────────────┤
│ Revenue Alerts (收入预警)                    [View All]          │
│ ⚠ ACME Corp: Cash Mgmt actual -22% vs deal   SGD -2,400  HIGH  │
│ ⚠ Daiwa Securities: FX volume -15% vs target SGD -890    MED   │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Product ▼] [Status ▼] [Search]                      │
│ Revenue Performance Table                [Export]               │
│ Client │ Market│ Product │ Contracted │ Actual │ Var% │ Status │ │
│ ACME   │ SG    │ Cash    │ SGD 5,100  │4,700   │ -7.8%│ ⚠Alert │ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | MTD Revenue、环比、预警数、Deal Achievement |
| 收入分布图 | `ProCard` + antd `Bar` / `Pie` 图表（用 `@ant-design/charts` 或 `recharts`，如已有） | 按市场/产品维度 |
| 预警列表 | `ProCard` + `ProList` 或 `Alert` 样式列表 | 高亮 HIGH urgency |
| 绩效明细 | `ProTable` | 对比 Contracted vs Actual，差异着色 |
| 趋势图 | `ProCard` + 折线图 | 近 6 个月收入趋势 |

---

## 4. Mock 数据结构

```typescript
// mock/performance.ts

interface RevenueOverview {
  period: string;              // '2026-07'
  mtdRevenueSGD: number;
  vsLastMonthPercent: number;  // +3.2
  activeAlerts: number;
  estimatedLeakageSGD: number;
  dealAchievementPercent: number;
}

interface RevenueByDimension {
  dimension: string;           // market name or product name
  amount: number;
  percent: number;             // 占总收入的百分比
  trend: 'up' | 'down' | 'flat';
  changePercent: number;
}

interface RevenueAlert {
  id: string;
  clientId: string;
  clientName: string;
  market: string;
  product: string;
  alertType: 'VOLUME_BELOW_TARGET' | 'RATE_BELOW_DEAL' | 'REVENUE_LEAKAGE' | 'DEAL_UNDERPERFORMANCE';
  description: string;
  contractedAmount: number;
  actualAmount: number;
  variance: number;            // 负数 = 低于合同
  variancePercent: number;
  currency: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  detectedAt: string;
}

interface RevenuePerformanceRow {
  clientId: string;
  clientName: string;
  market: string;
  product: string;
  contractedAmount: number;
  actualAmount: number;
  varianceAmount: number;
  variancePercent: number;
  currency: string;
  performanceStatus: 'ON_TRACK' | 'AT_RISK' | 'UNDER_PERFORMING';
  dealId?: string;
}
```

---

## 5. Mock API

```
GET    /api/performance/revenue/overview         → RevenueOverview
  params: period, market

GET    /api/performance/revenue/by-market        → RevenueByDimension[]
GET    /api/performance/revenue/by-product       → RevenueByDimension[]
GET    /api/performance/revenue/trend            → { month: string, amount: number }[]

GET    /api/performance/revenue/alerts           → { data: RevenueAlert[], total: number }
  params: urgency, status, market, current, pageSize

PATCH  /api/performance/revenue/alerts/:id/acknowledge → RevenueAlert

GET    /api/performance/revenue/performance      → { data: RevenuePerformanceRow[], total: number }
  params: market, product, performanceStatus, current, pageSize
```

---

## 6. 业务逻辑

### 绩效状态判断（前端 Mock）
```
if variancePercent >= -5:  performanceStatus = 'ON_TRACK'
if variancePercent in [-15, -5):  performanceStatus = 'AT_RISK'
if variancePercent < -15:  performanceStatus = 'UNDER_PERFORMING'
```

差异列着色：正数绿色，负数 > -10% 橙色，< -10% 红色。

### 预警确认
点击 "Acknowledge" 后，预警状态改为 `ACKNOWLEDGED`，从活跃预警列表中降级显示。

---

## 7. 国际化 Key 列表

```
menu.performance.revenue

pages.performance.revenue.title
pages.performance.revenue.subTitle
pages.performance.revenue.stat.mtdRevenue
pages.performance.revenue.stat.vsLastMonth
pages.performance.revenue.stat.alerts
pages.performance.revenue.stat.leakage
pages.performance.revenue.stat.dealAchievement
pages.performance.revenue.chart.byMarket
pages.performance.revenue.chart.byProduct
pages.performance.revenue.chart.trend
pages.performance.revenue.alerts.title
pages.performance.revenue.alerts.viewAll
pages.performance.revenue.alerts.type.volumeBelow
pages.performance.revenue.alerts.type.rateBelow
pages.performance.revenue.alerts.type.leakage
pages.performance.revenue.alerts.type.underperformance
pages.performance.revenue.table.title
pages.performance.revenue.col.client
pages.performance.revenue.col.market
pages.performance.revenue.col.product
pages.performance.revenue.col.contracted
pages.performance.revenue.col.actual
pages.performance.revenue.col.variance
pages.performance.revenue.col.variancePct
pages.performance.revenue.col.status
pages.performance.revenue.perf.onTrack
pages.performance.revenue.perf.atRisk
pages.performance.revenue.perf.underPerforming
pages.performance.revenue.urgency.high
pages.performance.revenue.urgency.medium
pages.performance.revenue.urgency.low
pages.performance.revenue.msg.acknowledged
```

---

## 8. 文件结构

```
src/pages/performance/revenue/
├── index.tsx
├── data.d.ts
└── service.ts

mock/performance.ts
```
