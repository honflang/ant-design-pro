你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Customer Portfolio（客户组合管理）**

重点展示如何从“单客户视角”上升到“客户组合视角”，实现分组管理、组合定价和批量策略应用。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Customer Portfolio（客户组合管理）**

页面。

需要体现以下业务概念：

* Portfolio Segmentation（组合分层）
* Client Group Management（客户组管理）
* Revenue Distribution by Segment/Market（收入分布）
* Relationship-based Pricing Strategy（关系型定价策略）
* Bulk Pricing Apply（批量定价应用）
* Approval Linkage for Bulk Changes（批量策略审批联动）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Customer Management
  └── Customer Portfolio
```

建议路由：

```text
/pricing-billing/customer/portfolio
```

---

## 四、页面总体结构

页面采用：

> StatisticCard + ProCard + ProTable + Drawer + Modal

布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Customer Portfolio                                               │
├──────────────────────────────────────────────────────────────────┤
│ [Total Clients] [Client Groups] [Total Revenue] [Avg Deal Size]│
├────────────────────────────┬────────────────────────────────────┤
│ Portfolio by Segment       │ Portfolio by Market                │
├────────────────────────────┴────────────────────────────────────┤
│ Client Groups                                    [+ New Group]  │
├──────────────────────────────────────────────────────────────────┤
│ Client List                   [Assign Group] [Bulk Pricing]     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、Mock 数据

至少覆盖：

* Premium Corporate Group
* Standard Corporate Group
* SME Group
* FI Group

并体现：

* 不同组的平均折扣差异
* 不同组的收入贡献差异
* 不同市场覆盖差异

---

## 六、列表字段

Client Group 列表至少包含：

1. Group ID
2. Group Name
3. Member Count
4. Pricing Level
5. Avg Discount
6. Total Revenue MTD
7. Markets Covered
8. Status
9. Created By
10. Created At
11. Actions

Client List 至少包含：

1. Client
2. Segment
3. Market
4. Group
5. RM
6. Revenue
7. Performance Status
8. Actions

Actions：

```text
View Group
Edit Group
Assign to Group
Bulk Pricing
```

---

## 七、新增 / 编辑 Group

点击：

> New Group

打开 Drawer。

建议分组：

### 1. Group Definition

```text
Group Name
Description
Pricing Level
Status
```

### 2. Scope & Members

```text
Markets Covered
Target Segment
Members (multi-select)
```

### 3. Pricing Policy (optional)

```text
Default Discount Band
Preferred Products
Review Cycle
```

---

## 八、Portfolio Detail

支持 Group 详情查看，建议使用：

> ProDescriptions + ProTable + ProCard

展示：

```text
Group Profile
Member List
Revenue Contribution
Applied Pricing Level
Recent Portfolio Actions
```

并增加：

### Bulk Pricing Preview

```text
Target Clients
Adjustment Type
Adjustment Value
Effective Period
Approval Requirement
```

---

## 九、页面顶部增加区域概览

建议统计卡：

```text
Total Clients
Total Groups
Portfolio Revenue MTD
Top 20% Revenue Clients
Average Deal Size
```

可补充：

```text
Groups Under Review
```

---

## 十、与 Pricing Rules / Approval 的业务关系

页面中需体现：

> Portfolio 批量策略会生成 CLIENT_GROUP 级规则；超过门槛的批量变更进入审批流程。

流程建议：

```text
Portfolio Grouping
   ↓
Bulk Pricing Strategy
   ↓
Threshold Check
   ↓
Approval (if required)
   ↓
Group-level Pricing Effective
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface ClientGroup {
  id: string;
  groupName: string;
  pricingLevel: 'P2' | 'P3';
  memberCount: number;
  avgDiscountPercent: number;
  totalRevenueMTD: number;
  markets: string[];
  status: 'ACTIVE' | 'INACTIVE';
}
```

Mock API：

```text
GET    /api/customers/groups
POST   /api/customers/groups
PUT    /api/customers/groups/:id
GET    /api/customers/groups/:id/members
POST   /api/customers/groups/:id/members
POST   /api/pricing/bulk-apply
```

---

## 十二、技术要求

必须遵循当前项目已有技术栈：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProForm
* ProDescriptions
* ProCard

不要引入新的 UI framework。不要升级依赖。

---

## 十三、交互要求

至少实现：

### 查询

```text
Market
Segment
Group
RM
Keyword
```

### 新建客户组

New Group → Drawer → Submit → Mock 新增。

### 分配客户

Assign to Group → 批量选择客户 → 更新归属。

### 批量定价

Bulk Pricing → 提交批量调整 → 返回直接生效或审批要求。

### 组详情

View Group → 展示成员和收入贡献。

---

## 十四、Demo 重点

这个页面不是为了展示“客户分组表”，而是为了向银行客户展示：

> **面向客户组合的定价运营能力，可在规模化场景下保持策略一致与风险可控。**

建议突出：

```text
Portfolio Segmentation
        ↓
Group Strategy
        ↓
Bulk Pricing Action
        ↓
Controlled Approval & Execution
```

---

## 国际化要求（仅中文 / English）

- 本页面仅支持 `zh-CN` 和 `en-US` 两种语言，不新增或要求其他语言包。
- 所有 UI 文案，包括客户字段、组合类型、状态、指标、表格列、筛选器、按钮、详情、校验和提示，必须使用 i18n key，不得硬编码中文或英文。
- 新增文案统一维护在 `src/locales/zh-CN/pages.ts`、`src/locales/en-US/pages.ts` 和对应的 `menu.ts` 中，使用 `pages.customer.portfolio.*` 与菜单专属 key。
- 客户名称、组合编号、市场和 Mock 统计数据可以保留标准值；状态、类型和指标标签必须国际化。
- 切换 `zh-CN` / `en-US` 后，组合列表、详情 Drawer、筛选器和操作确认都必须显示对应语言。

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有客户模块表格与筛选模式。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 新建/编辑 Group
* 分配客户
* 批量定价
* 详情展示
* 审批联动提示

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实客户主数据平台、真实审批引擎、真实后端 API。当前目标是可用于客户演示的高质量 Demo。**
