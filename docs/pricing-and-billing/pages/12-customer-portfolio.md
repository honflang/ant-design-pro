# 12 — 客户组合管理 Customer Portfolio

**路由**：`/customer/portfolio`  
**组件路径**：`src/pages/customer/portfolio/index.tsx`  
**菜单 i18n key**：`menu.customer.portfolio`  
**所属用例**：客户管理需求、UC-3（第 4 点）

---

## 1. 页面目的

客户组合管理面向产品经理/销售负责人，提供跨客户的组合级视图：
- 按客群、市场、RM 维度汇总收入与定价情况
- 识别高价值客户与定价优化机会
- 支持为客户组（Client Group）批量应用定价策略

演示价值：
- "Relationship-based pricing across client portfolios"（UC-3 第 4 点）
- "Optimize pricing for loyal and quality customers"（客户管理需求第 3 条）
- 支持 Segment / Client Group 维度的批量定价设置（UC-2 第 1 点）

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Customer Portfolio                                               │
│ Manage pricing and performance across client groups             │
├──────────────────────────────────────────────────────────────────┤
│ [Total Clients: 120]  [Client Groups: 8]  [Total Revenue/mo: SGD 2.4M] │
│ [Avg Deal Size: SGD 20K]  [Top 20% Revenue Clients: 24]         │
├────────────────────────────┬────────────────────────────────────┤
│ Portfolio by Segment       │ Portfolio by Market                │
│ Corporate: 68  SGD 1.8M    │ SG: 42   HK: 28   CN: 31          │
│ FI: 22         SGD 420K    │ JP: 12   AU: 7                     │
│ SME: 24        SGD 180K    │                                    │
│ Gov: 6         SGD 200K    │                                    │
├────────────────────────────┴────────────────────────────────────┤
│ Client Groups                          [+ New Group]            │
│                                                                  │
│ Group Name     │ Clients│ Pricing Level│ Avg Discount│ Revenue  │
│ Premium Corp   │  12    │  P3          │    -12%     │ SGD 890K │
│ Standard Corp  │  36    │  P2          │    -5%      │ SGD 780K │
│ SME Standard   │  24    │  P2          │    -3%      │ SGD 180K │
│ ASEAN FI       │  8     │  P3          │    -8%      │ SGD 310K │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Segment ▼] [Group ▼] [RM ▼] [Search]              │
│ Clients                         [Assign to Group] [Bulk Pricing] │
│                                                                   │
│ Client  │ Segment │ Market │ Group        │ Revenue │ Performance│
│ ACME    │ Corp    │ SG     │ Premium Corp │ SGD 15K │ On Track  │
│ Huawei  │ Corp    │ CN     │ Premium Corp │ CNY 80K │ Good      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | 总客户数、Groups 数、总收入、均值等 |
| 组合概览 | `ProCard` 双列 | Segment 分布 + Market 分布（简单数字列表或迷你图） |
| Client Groups | `ProTable` | 可展开查看组内客户 |
| 新建/编辑 Group | `Drawer` + `ProForm` | 组名、定价级别、关联客户多选 |
| 客户列表 | `ProTable` | 多选行 → 批量操作（分组、批量定价） |
| 批量定价 | `Modal` + `ProForm` | 选择定价规则 → 应用到选中客户 |

---

## 4. Mock 数据结构

```typescript
// mock/customer.ts (续)

interface ClientGroup {
  id: string;
  groupName: string;
  description?: string;
  pricingLevel: 'P2' | 'P3';      // 组级别适用的定价规则层级
  memberCount: number;
  avgDiscountPercent: number;
  totalRevenueMTD: number;
  currency: string;
  markets: string[];               // 组内覆盖的市场
  status: 'ACTIVE' | 'INACTIVE';
  createdBy: string;
  createdAt: string;
}

interface ClientGroupMember {
  groupId: string;
  clientId: string;
  clientName: string;
  market: string;
  segment: string;
  addedAt: string;
}

interface BulkPricingRequest {
  clientIds: string[];
  product: string;
  adjustmentType: 'DISCOUNT' | 'SURCHARGE' | 'WAIVER';
  adjustmentValue: number;
  adjustmentUnit: 'PERCENT' | 'ABSOLUTE';
  effectiveFrom: string;
  effectiveTo?: string;
  reason: string;
}
```

---

## 5. Mock API

```
GET    /api/customers/groups                    → { data: ClientGroup[], total: number }
POST   /api/customers/groups                    → ClientGroup
PUT    /api/customers/groups/:id                → ClientGroup
GET    /api/customers/groups/:id/members        → ClientGroupMember[]
POST   /api/customers/groups/:id/members        → { added: number }   (批量加入)

# 批量定价（生成多条 PricingRule，scope=CLIENT_GROUP）
POST   /api/pricing/bulk-apply
  body: BulkPricingRequest
  → { created: number, approvalRequired: boolean, approvalRequestIds: string[] }
```

---

## 6. 业务逻辑

### 批量定价审批联动
批量定价提交后，Mock 服务判断折扣幅度是否超过门槛：
- 若超过 → 返回 `approvalRequired: true`，同时在 `/pricing/approval` 生成对应待审批记录
- 若未超过 → 直接生效

### 收入分布展示
Portfolio 概览中的 Segment / Market 分布使用简单数字列表（无需真实图表库），展示各维度的客户数 + 月度收入，保持实现简单。

---

## 7. 国际化 Key 列表

```
menu.customer.portfolio

pages.customer.portfolio.title
pages.customer.portfolio.subTitle
pages.customer.portfolio.stat.totalClients
pages.customer.portfolio.stat.groups
pages.customer.portfolio.stat.totalRevenue
pages.customer.portfolio.stat.avgDeal
pages.customer.portfolio.stat.topClients
pages.customer.portfolio.section.bySegment
pages.customer.portfolio.section.byMarket
pages.customer.portfolio.groups.title
pages.customer.portfolio.groups.addGroup
pages.customer.portfolio.groups.col.name
pages.customer.portfolio.groups.col.members
pages.customer.portfolio.groups.col.pricingLevel
pages.customer.portfolio.groups.col.avgDiscount
pages.customer.portfolio.groups.col.revenue
pages.customer.portfolio.groups.col.status
pages.customer.portfolio.clients.title
pages.customer.portfolio.clients.assignGroup
pages.customer.portfolio.clients.bulkPricing
pages.customer.portfolio.clients.col.name
pages.customer.portfolio.clients.col.segment
pages.customer.portfolio.clients.col.market
pages.customer.portfolio.clients.col.group
pages.customer.portfolio.clients.col.revenue
pages.customer.portfolio.clients.col.performance
pages.customer.portfolio.bulk.title
pages.customer.portfolio.bulk.product
pages.customer.portfolio.bulk.adjustType
pages.customer.portfolio.bulk.adjustValue
pages.customer.portfolio.bulk.period
pages.customer.portfolio.bulk.reason
pages.customer.portfolio.msg.groupCreated
pages.customer.portfolio.msg.bulkApplied
pages.customer.portfolio.msg.approvalRequired
```

---

## 8. 文件结构

```
src/pages/customer/portfolio/
├── index.tsx
├── data.d.ts
└── service.ts

mock/customer.ts
```
