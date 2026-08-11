# 10 — 交易绩效监控 Deal Performance Monitoring

**路由**：`/pricing-billing/performance/deal`  
**组件路径**：`src/pages/performance/deal/index.tsx`  
**菜单 i18n key**：`menu.performance.deal`  
**所属用例**：UC-3（第 5 点）、绩效管理需求、客户管理需求

---

## 1. 页面目的

交易绩效监控页面面向客户经理（RM）/ 销售，聚焦**个别 Deal 层面的收入追踪**：
- 展示各 Deal 的实际收入 vs 预期收入
- 到期预警（Deal 即将到期、需要续签）
- 支持对表现不佳的 Deal 发起复查请求

演示价值：
- "Deal performance monitoring and tracking"（客户管理需求第 4 条）
- "Alerts to RM/Sales on customer performance"（绩效管理需求第 3 条）
- UC-3 第 5 点：对照交易结构进行持续收入追踪

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Deal Performance                                                 │
│ Track revenue performance against deal structures               │
├──────────────────────────────────────────────────────────────────┤
│ [Active Deals: 32]  [Expiring in 30d: 4]  [Under Review: 3]    │
│ [Avg Achievement: 91%]  [Total Deal Revenue MTD: SGD 1.8M]     │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [RM ▼] [Status ▼] [Expiry ▼] [Search]              │
├──────────────────────────────────────────────────────────────────┤
│ Deal Performance                          [Export]              │
│                                                                  │
│ Deal ID │ Client  │ Market │ Products│ Expiry │ Achieve│ Status│ │
│ DL-001  │ ACME    │ SG     │ C+T+FX  │ 2026-12│  94%  │ Active│ │
│ DL-002  │ Daiwa   │ JP     │ C+FX    │ 2026-09│  78%  │⚠ Risk │ │
│ DL-003  │ Huawei  │ CN     │ C+T     │ 2026-11│  102% │ Good  │ │
│ DL-004  │ JTC     │ SG     │ Cash    │ 2026-08│  63%  │⚠ Expir│ │
└─────────────────────────────────────────────────────────────────┘
```

Deal 详情 Drawer：
```
┌──────────────────────────────────────────────────────┐
│ Deal DL-001 — ACME Corporation         [Request Review] │
│                                                          │
│ Deal Summary                                             │
│ Products: Cash + Trade + FX                              │
│ Deal Period: 2026-01-01 ~ 2026-12-31                    │
│ Committed Revenue: SGD 180,000/year                     │
│                                                          │
│ Performance YTD                                          │
│ Achieved: SGD 126,000 (94% of 7-month target)           │
│ Projected Year-end: SGD 216,000 (+20% vs commitment)    │
│                                                          │
│ Monthly Breakdown (折线图: Target vs Actual)             │
│                                                          │
│ Pricing Rules Applied                                    │
│ Cash: P4 Individual -15%  |  Trade: P4 -10%  |  FX: P3  │
└──────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | Active/Expiring/UnderReview/Achievement/MTD Revenue |
| Deal 列表 | `ProTable` | Achievement 列使用 Progress 组件，颜色区分 |
| Deal 详情 | `Drawer` + `ProDescriptions` + 折线图 | 月度 Target vs Actual |
| 发起复查 | `Modal` + 简单表单 | RM 填写复查理由 → 生成待办 |

---

## 4. Mock 数据结构

```typescript
// mock/performance.ts (续)

interface Deal {
  id: string;                    // 'DL-001'
  clientId: string;
  clientName: string;
  market: string;
  rmName: string;                // 客户经理姓名
  products: string[];            // ['Cash Management', 'Trade Finance', 'FX Services']
  dealStartDate: string;
  dealEndDate: string;
  committedRevenueAnnual: number;
  currency: string;
  // 绩效
  achievedRevenueYTD: number;
  targetRevenueYTD: number;      // 按月份比例计算的 YTD 目标
  achievementPercent: number;    // achievedRevenueYTD / targetRevenueYTD * 100
  projectedYearEnd: number;
  // 关联的定价规则
  appliedPricingRules: { product: string; ruleId: string; ruleName: string }[];
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNDER_REVIEW' | 'COMPLETED';
  reviewRequestedAt?: string;
  reviewReason?: string;
}

interface DealMonthlyPerformance {
  dealId: string;
  month: string;                 // '2026-01'
  target: number;
  actual: number;
}
```

---

## 5. Mock API

```
GET    /api/performance/deals                   → { data: Deal[], total: number }
  params: market, rmName, status, expiringWithinDays, current, pageSize

GET    /api/performance/deals/:id               → Deal
GET    /api/performance/deals/:id/monthly       → DealMonthlyPerformance[]

# 发起复查
POST   /api/performance/deals/:id/review-request
  body: { reason: string }                      → Deal (status=UNDER_REVIEW)
```

---

## 6. 业务逻辑

### Achievement 颜色规则
| Achievement% | 颜色 | 状态标签 |
|-------------|------|---------|
| ≥ 95% | 绿色 | Good |
| 80% ~ 95% | 橙色 | At Risk |
| < 80% | 红色 | Under-performing |

### 到期预警
`dealEndDate` 在当前日期 30 天以内时，`status = 'EXPIRING_SOON'`，列表中显示 Warning 图标。

### 发起复查
147:RM 点击 "Request Review" 后，Deal 状态改为 `UNDER_REVIEW`，同时在 `/pricing-billing/pricing/approval` 中生成一条 `type=DEAL` 的待审批记录。

---

## 7. 国际化 Key 列表

```
menu.performance.deal

pages.performance.deal.title
pages.performance.deal.subTitle
pages.performance.deal.stat.activeDeals
pages.performance.deal.stat.expiringSoon
pages.performance.deal.stat.underReview
pages.performance.deal.stat.avgAchievement
pages.performance.deal.stat.mtdRevenue
pages.performance.deal.col.dealId
pages.performance.deal.col.client
pages.performance.deal.col.market
pages.performance.deal.col.products
pages.performance.deal.col.rm
pages.performance.deal.col.expiry
pages.performance.deal.col.achievement
pages.performance.deal.col.status
pages.performance.deal.col.actions
pages.performance.deal.status.active
pages.performance.deal.status.expiringSoon
pages.performance.deal.status.expired
pages.performance.deal.status.underReview
pages.performance.deal.status.completed
pages.performance.deal.perf.good
pages.performance.deal.perf.atRisk
pages.performance.deal.perf.underPerforming
pages.performance.deal.detail.title
pages.performance.deal.detail.monthlyChart
pages.performance.deal.detail.pricingRules
pages.performance.deal.detail.committed
pages.performance.deal.detail.achieved
pages.performance.deal.detail.projected
pages.performance.deal.action.view
pages.performance.deal.action.requestReview
pages.performance.deal.review.title
pages.performance.deal.review.reasonLabel
pages.performance.deal.msg.reviewSubmitted
```

---

## 8. 文件结构

```
src/pages/performance/deal/
├── index.tsx
├── data.d.ts
└── service.ts

mock/performance.ts
```
