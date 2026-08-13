你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Deal Performance Monitoring（交易绩效监控）**

重点展示客户经理如何按 Deal 维度持续跟踪收入兑现、到期风险与复查动作。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Deal Performance（交易绩效）**

页面。

需要体现以下业务概念：

* Deal-level Revenue Tracking（按交易结构跟踪收入）
* Achievement vs Commitment（达成率 vs 承诺值）
* Expiry Alert（到期预警）
* Under-performance Identification（低表现识别）
* Request Review（发起复查）
* RM / Sales Actionability（客户经理可执行动作）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Performance Management
  └── Deal Performance
```

建议路由：

```text
/pricing-billing/performance/deal
```

---

## 四、页面总体结构

页面采用：

> StatisticCard + ProTable + Drawer + Modal + Trend Chart

布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Deal Performance                                                 │
│ Track revenue achievement against deal commitments              │
├──────────────────────────────────────────────────────────────────┤
│ [Active Deals] [Expiring Soon] [Under Review] [Avg Achievement]│
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [RM ▼] [Status ▼] [Expiry ▼] [Search]               │
├──────────────────────────────────────────────────────────────────┤
│ Deal Performance Table                                           │
│ Deal ID │ Client │ Products │ Expiry │ Achievement │ Status      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、Mock 数据

至少覆盖：

* Active Deal
* Expiring Soon Deal
* Under-performing Deal
* Under-review Deal
* Over-achieving Deal

并覆盖 SG/HK/CN/JP/AU 市场代表性客户。

---

## 六、列表字段

Deal Performance 列表至少包含：

1. Deal ID
2. Client
3. Market
4. RM Name
5. Products
6. Deal Start Date
7. Deal End Date
8. Committed Revenue
9. Achieved Revenue YTD
10. Target Revenue YTD
11. Achievement Percent
12. Projected Year-end Revenue
13. Status
14. Actions

Actions：

```text
View
Request Review
```

---

## 七、新增 / 编辑（复查操作）

该页主要是监控与复查，不强调新增 Deal 主数据。

需要支持：

### 1. Request Review

```text
Review Reason
Priority
Owner
```

提交后将 Deal 状态改为 UNDER_REVIEW，并记录请求时间。

---

## 八、Deal Detail

点击 View 打开详情 Drawer，建议使用：

> ProDescriptions + Line Chart + ProTable

展示：

```text
Deal Summary
Committed Revenue
Achieved Revenue YTD
Projected Year-end
Applied Pricing Rules
Monthly Target vs Actual Trend
```

并增加：

### Deal Risk Preview

```text
Achievement Band
Expiry Risk
Primary Gap Driver
Recommended Action
```

---

## 九、页面顶部增加区域概览

建议统计卡：

```text
Active Deals
Expiring in 30 Days
Under Review Deals
Average Achievement
Total Deal Revenue MTD
```

---

## 十、与 Revenue Tracking / Approval 的业务关系

页面中需体现：

> Revenue Tracking 发现偏差后，Deal Performance 提供客户经理处置入口；必要时触发定价复审审批。

流程建议：

```text
Revenue Deviation Detected
   ↓
Deal Performance Drill-down
   ↓
RM Request Review
   ↓
Pricing/Approval Follow-up
   ↓
Performance Recovery
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface Deal {
  id: string;
  clientName: string;
  market: string;
  rmName: string;
  products: string[];
  dealStartDate: string;
  dealEndDate: string;
  committedRevenueAnnual: number;
  achievedRevenueYTD: number;
  targetRevenueYTD: number;
  achievementPercent: number;
  projectedYearEnd: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNDER_REVIEW' | 'COMPLETED';
}
```

Mock API：

```text
GET    /api/performance/deals
GET    /api/performance/deals/:id
GET    /api/performance/deals/:id/monthly
POST   /api/performance/deals/:id/review-request
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
* 现有图表组件方案

不要引入新的 UI framework。不要升级依赖。

---

## 十三、交互要求

至少实现：

### 查询

```text
Market
RM
Status
Expiry Window
Keyword
```

### 查看详情

View → Deal Detail Drawer（含月度趋势）。

### 发起复查

Request Review → 填写原因 → 更新状态并记录。

### 到期预警

到期 30 天内展示高亮告警状态。

---

## 十四、Demo 重点

这个页面不是为了展示“交易列表”，而是为了向银行客户展示：

> **客户经理可基于数据及时识别偏差 Deal 并触发治理动作。**

建议突出：

```text
Deal-level Visibility
        ↓
Achievement Gap Detection
        ↓
RM Review Action
        ↓
Pricing Governance Loop
```

---

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有趋势图与状态标签实现模式。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 详情查看
* 复查申请
* 到期预警
* Deal Risk Preview

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实 CRM、真实绩效引擎、真实后端 API。当前目标是可用于客户演示的高质量 Demo。**
