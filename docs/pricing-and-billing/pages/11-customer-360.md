# 11 — 客户 360 视图 Customer 360 View

**路由**：`/pricing-billing/customer/360`  
**组件路径**：`src/pages/customer/360/index.tsx`  
**菜单 i18n key**：`menu.customer.360`  
**所属用例**：客户管理需求、UC-3（第 4 点）

---

## 1. 页面目的

Client 360 视图是客户经理的核心工作界面，在单一视图中聚合客户的：
- 基础信息与市场分布
- 当前有效定价方案（Price Book + Deal）
- 计费历史与发票摘要
- 产品推荐（使用简单 Mock 规则模拟 AI 推荐）
- 收入绩效与预警

演示价值：
- "360 customer view"（客户管理需求第 1 条）
- "Relationship-based pricing across client portfolios"（UC-3 第 4 点）
- "Optimize pricing for loyal and quality customers"（客户管理需求第 3 条）
- "Product recommendations using data analytics/Gen AI"（客户管理需求第 2 条，简化演示）

---

## 2. 页面布局

此页面由两部分组成：**客户搜索列表** + **单客户 360 详情**（点击进入）。

### 客户列表
```
┌─────────────────────────────────────────────────────────────────┐
│ Customer 360                                                     │
│ Unified view of pricing, billing and performance per client     │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Segment ▼] [RM ▼] [Search client name / ID]        │
├──────────────────────────────────────────────────────────────────┤
│ ACME Corp       SG  Corporate  RM: John  SGD 15K/mo  ✓ Active  │
│ Daiwa Securities JP  FI        RM: Sarah JPY 2M/mo   ⚠ Risk    │
│ CCB             CN  Corporate  RM: Wei   CNY 80K/mo  ✓ Active  │
└─────────────────────────────────────────────────────────────────┘
```

### 客户 360 详情页（子路由 `/pricing-billing/customer/360/:clientId`）
```
┌────────────────────────────────────────────────────────────────┐
│ ← Back    ACME Corporation Pte. Ltd.   [SG] [Corporate] [RM: John]│
├──────────────────────────────────────────────────────────────────┤
│ [MTD Revenue: SGD 15K] [YTD: SGD 126K] [Active Deals: 1]       │
│ [Products: 3] [Outstanding Invoices: 0]                         │
├─────────────────────┬────────────────────────────────────────────┤
│ Client Profile      │ Current Pricing (Price Book + Deal)       │
│ Tax Reg: 12345     │ Cash: SGD 42.50/mo (P4 -15% from SGD 50)  │
│ Incorporated: 2001  │ Trade: 0.18% (P4 -10% from 0.20%)        │
│ Relationship: 2015  │ FX: 0.08% (P3 standard)                  │
│                     │ [View in Price Book] [View Rules]         │
├─────────────────────┴────────────────────────────────────────────┤
│ Billing History (recent 6 months)    Recent Invoices            │
│ （BarChart）                           （ProList 简洁版）        │
├──────────────────────────────────────────────────────────────────┤
│ Product Recommendations (AI-assisted)                            │
│ 💡 Trade Finance Bundle: Bundling Cash+Trade may save 8%        │
│ 💡 FX Hedging Service: High FX volume detected, consider ECR   │
├──────────────────────────────────────────────────────────────────┤
│ Performance Alerts                                               │
│ ⚠ Cash Mgmt actual -7.8% vs deal target (SGD -400/mo)          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 客户列表 | `ProTable` | 简洁模式，含 RM、Revenue、绩效状态 |
| 360 详情顶部 | `PageContainer` + `StatisticCard.Group` | 返回按钮 + 关键指标 |
| 客户信息 | `ProCard` + `ProDescriptions` | 基础信息 |
| 当前定价 | `ProCard` + 自定义 `Table` | 展示各产品有效价格及规则来源 |
| 计费历史 | `ProCard` + `Bar` 图 | 近 6 月计费金额 |
| 近期发票 | `ProList` | 最近 3 张发票 + 链接 |
| 产品推荐 | `ProCard` + `List` + 自定义 Icon | Mock 推荐规则 |
| 绩效预警 | `ProCard` + `Alert` 组件 | 同步来自 performance/revenue |

---

## 4. Mock 数据结构

```typescript
// mock/customer.ts

interface Customer {
  id: string;
  name: string;
  market: string;
  segment: 'Corporate' | 'Financial Institution' | 'SME' | 'Government';
  taxRegNo: string;
  incorporatedYear: number;
  relationshipSince: number;     // 与银行建立关系的年份
  rmId: string;
  rmName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'REVIEW';
  // 概览指标
  mtdRevenue: number;
  ytdRevenue: number;
  currency: string;
  activeDeals: number;
  products: string[];
  outstandingInvoices: number;
  performanceStatus: 'ON_TRACK' | 'AT_RISK' | 'UNDER_PERFORMING';
}

interface CustomerPricingSummary {
  clientId: string;
  items: {
    product: string;
    baseRate: string;            // 价格手册标准价 '0.20%' 或 'SGD 50/month'
    appliedRate: string;         // 实际应用价格
    discountPercent?: number;
    ruleScope: string;           // 'P4 Individual Deal' 等
    pricePointId: string;
    pricingRuleId: string;
  }[];
}

interface ProductRecommendation {
  id: string;
  clientId: string;
  type: 'BUNDLE_OPPORTUNITY' | 'NEW_PRODUCT' | 'REPRICING' | 'RISK_ALERT';
  title: string;
  description: string;
  potentialSavingPercent?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}
```

---

## 5. Mock API

```
GET    /api/customers                           → { data: Customer[], total: number }
  params: market, segment, rmId, performanceStatus, keyword, current, pageSize

GET    /api/customers/:id                       → Customer
GET    /api/customers/:id/pricing-summary       → CustomerPricingSummary
GET    /api/customers/:id/billing-history       → { month: string, amount: number }[]  (6 months)
GET    /api/customers/:id/recent-invoices       → Invoice[]  (latest 3)
GET    /api/customers/:id/recommendations       → ProductRecommendation[]
GET    /api/customers/:id/alerts               → RevenueAlert[]
```

---

## 6. 业务逻辑

### 产品推荐（Mock AI）
不接真实 AI，Mock 服务根据客户数据返回固定规则推荐：
- 如果客户有 Cash + FX 但没有 Trade → 推荐 Trade Finance Bundle
- 如果 FX 交易量 > 阈值 → 推荐 ECR Hedging

### 定价溯源
"当前定价" 区域中每行价格旁有 "View Rule" 链接，点击跳转到 `/pricing-billing/pricing/rules` 并打开对应规则的详情 Drawer。

---

## 7. 国际化 Key 列表

```
menu.customer.360

pages.customer.360.title
pages.customer.360.subTitle
pages.customer.360.col.name
pages.customer.360.col.market
pages.customer.360.col.segment
pages.customer.360.col.rm
pages.customer.360.col.revenue
pages.customer.360.col.performance
pages.customer.360.stat.mtdRevenue
pages.customer.360.stat.ytdRevenue
pages.customer.360.stat.activeDeals
pages.customer.360.stat.products
pages.customer.360.stat.outstandingInvoices
pages.customer.360.profile.title
pages.customer.360.pricing.title
pages.customer.360.pricing.product
pages.customer.360.pricing.baseRate
pages.customer.360.pricing.appliedRate
pages.customer.360.pricing.discount
pages.customer.360.pricing.ruleScope
pages.customer.360.billingHistory.title
pages.customer.360.recentInvoices.title
pages.customer.360.recommendations.title
pages.customer.360.recommendations.type.bundle
pages.customer.360.recommendations.type.newProduct
pages.customer.360.recommendations.type.repricing
pages.customer.360.recommendations.type.risk
pages.customer.360.alerts.title
```

---

## 8. 文件结构

```
src/pages/customer/360/
├── index.tsx           ← 客户列表
├── [clientId].tsx      ← 360 详情（或用 query param 代替动态路由）
├── data.d.ts
└── service.ts

mock/customer.ts
```

> **注意**：Umi Max 动态路由使用 `[clientId]` 格式，或改用 `index.tsx` 通过 query string `?clientId=xxx` 切换视图，避免路由配置复杂度。Demo 建议使用后者。
