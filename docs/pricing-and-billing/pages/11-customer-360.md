你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Customer 360 View（客户 360 视图）**

重点展示在单一客户视角下，如何聚合客户画像、当前定价、计费发票、收入表现与推荐建议，支持客户经理进行综合决策。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Customer 360 View（客户 360 视图）**

页面。

需要体现以下业务概念：

* Unified Customer Profile（客户统一画像）
* Current Effective Pricing（当前生效定价）
* Billing & Invoice Snapshot（计费与发票摘要）
* Revenue & Performance Alerts（收入与绩效预警）
* Product Recommendation（产品推荐，Mock AI）
* Relationship-based Pricing Context（关系型定价上下文）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Customer Management
  └── Customer 360
```

建议路由：

```text
/pricing-billing/customer/360
```

详情建议：

```text
/pricing-billing/customer/360/:clientId
```

若项目中已采用 query 形式（如 `?clientId=`），请沿用既有模式。

---

## 四、页面总体结构

页面建议分为两层：

> 客户列表页 + 单客户 360 详情页

整体示意：

```text
Customer List
[Market][Segment][RM][Search]
Client | Market | RM | MTD Revenue | Performance

Customer 360 Detail
Header KPI Cards
Profile | Effective Pricing
Billing History | Recent Invoices
Recommendations
Performance Alerts
```

页面风格应突出“Relationship Management Cockpit”，而非普通信息页。

---

## 五、Mock 数据

至少覆盖客户：

* Singapore Corporate（高价值）
* Japan FI（风险偏高）
* China Corporate（多产品）
* Australia SME（低活跃）

并体现：

* 不同市场收入与币种
* 不同定价层级（P2/P3/P4）
* 不同绩效状态（On Track / At Risk / Under-performing）

---

## 六、列表字段

客户列表至少包含：

1. Client ID
2. Client Name
3. Market
4. Segment
5. RM Name
6. MTD Revenue
7. YTD Revenue
8. Active Deals
9. Product Count
10. Outstanding Invoices
11. Performance Status
12. Actions

360 详情中 Current Pricing 至少包含：

1. Product
2. Base Rate
3. Applied Rate
4. Discount / Surcharge
5. Rule Scope
6. Price Point Link
7. Pricing Rule Link

Actions：

```text
View 360
View Price Book
View Pricing Rule
```

---

## 七、新增 / 编辑（关系动作）

该页以“查看与管理动作”为主，不强调新增主数据。

建议支持：

### 1. Relationship Notes（可选）

```text
Add RM Note
Flag Follow-up
```

### 2. Recommendation Action（可选）

```text
Mark Recommendation as Accepted / Ignored
```

用于演示客户经理工作流闭环。

---

## 八、Customer 360 Detail

点击客户进入详情，建议使用：

> ProDescriptions + StatisticCard + ProCard + ProList

展示：

```text
Client Profile
Effective Pricing Summary
Billing History (6 months)
Recent Invoices
Performance Alerts
```

并增加：

### Product Recommendation Preview

```text
Recommendation Type
Potential Benefit
Priority
Rationale
```

推荐逻辑可由 Mock 规则生成，不需真实 AI 服务。

---

## 九、页面顶部增加区域概览

在详情页顶部增加 KPI：

```text
MTD Revenue
YTD Revenue
Active Deals
Products in Use
Outstanding Invoices
```

列表页可增加：

```text
Total Clients
At-risk Clients
```

---

## 十、与 Pricing / Billing / Performance 的业务关系

页面中需体现：

> Customer 360 连接定价、计费、绩效三条主线，提供单一客户的可执行决策视图。

流程建议：

```text
Pricing Setup
   ↓
Billing & Invoice Outcome
   ↓
Customer 360 Insights
   ↓
RM Action / Recommendation
   ↓
Performance Improvement
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface Customer {
  id: string;
  name: string;
  market: string;
  segment: 'Corporate' | 'Financial Institution' | 'SME' | 'Government';
  rmName: string;
  mtdRevenue: number;
  ytdRevenue: number;
  activeDeals: number;
  products: string[];
  outstandingInvoices: number;
  performanceStatus: 'ON_TRACK' | 'AT_RISK' | 'UNDER_PERFORMING';
}
```

Mock API：

```text
GET    /api/customers
GET    /api/customers/:id
GET    /api/customers/:id/pricing-summary
GET    /api/customers/:id/billing-history
GET    /api/customers/:id/recent-invoices
GET    /api/customers/:id/recommendations
GET    /api/customers/:id/alerts
```

---

## 十二、技术要求

必须遵循当前项目已有技术栈：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProDescriptions
* ProCard
* ProList

不要引入新的 UI framework。不要升级依赖。

---

## 十三、交互要求

至少实现：

### 查询

```text
Market
Segment
RM
Performance Status
Keyword
```

### 查看 360

点击客户进入详情页。

### 定价溯源跳转

从 360 详情跳转到 Price Book / Pricing Rules 对应记录。

### 预警查看

展示该客户关联预警并支持进入 Revenue / Deal 页面。

---

## 十四、Demo 重点

这个页面不是为了展示“客户详情页”，而是为了向银行客户展示：

> **以客户为中心的一站式定价与计费运营视图。**

建议突出：

```text
Unified Customer Data
        ↓
Pricing/Billing Context
        ↓
Insight & Recommendation
        ↓
RM Actionability
```

---

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有 Customer 模块页面风格。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面（列表 + 详情）
* 路由
* 菜单
* Mock 数据
* 查询
* 360 详情展示
* 定价溯源跳转
* 推荐与预警区

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实 CRM、真实 AI 推荐服务、真实后端 API。当前目标是可用于客户演示的高质量 Demo。**
