你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Pricing Approval Workflow（定价审批工作流）**

重点展示系统如何基于门槛规则进行自动审批与分级人工审批，确保风险可控与流程可审计。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Pricing Approval（定价审批）**

页面。

需要体现以下业务概念：

* Threshold-based Auto Approval（门槛内自动通过）
* Multi-level Approval（L1 / L2 / CFO）
* Product-specific Delegation（产品级门槛差异）
* Approval Decision（通过 / 拒绝）
* Approval History（审批轨迹）
* Auditability（可追溯）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Pricing Configuration
  └── Pricing Approval
```

建议路由：

```text
/pricing-billing/pricing/approval
```

如果项目已存在该路由和菜单，请保持结构不变，仅升级文档提示词表达方式。

---

## 四、页面总体结构

页面采用：

> ProCard + StatisticCard + ProTable + Drawer + Modal

布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Pricing Approval                                                 │
│ Rule-based workflow with threshold and delegation               │
├──────────────────────────────────────────────────────────────────┤
│ [Pending] [Auto Approved Today] [Approved] [Rejected]          │
├──────────────────────────────────────────────────────────────────┤
│ Threshold Rules Banner (Auto / L1 / L2 / CFO)                  │
├──────────────────────────────────────────────────────────────────┤
│ [Status ▼] [Product ▼] [Requestor ▼] [Date Range] [Search]     │
├──────────────────────────────────────────────────────────────────┤
│ Approval Requests                                                │
│ ID │ Subject │ Discount │ Threshold │ Level │ Status │ Actions  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、Mock 数据

至少准备：

* AUTO_APPROVED 样例
* L1 待审样例
* L2 待审样例
* CFO 待审样例
* REJECTED 样例

示例：

```text
REQ-001  Discount -8%   → AUTO_APPROVED
REQ-002  Discount -15%  → PENDING (L1)
REQ-003  Discount -25%  → PENDING (L2)
REQ-004  Discount -35%  → PENDING (CFO)
REQ-005  Discount -22%  → REJECTED
```

---

## 六、列表字段

Approval Request 列表至少包含：

1. Request ID
2. Subject
3. Client
4. Product
5. Market
6. Requested Discount
7. Threshold Percent
8. Threshold Check（Within / Exceeded）
9. Required Approval Level
10. Status
11. Current Approver
12. Requested By
13. Requested At
14. Actions

Actions：

```text
View
Approve
Reject
```

---

## 七、新增 / 编辑（审批操作）

该页一般不新增审批单，而是承接其他页面提交。

需实现操作：

### 1. Approve

```text
Approve with Comment
```

### 2. Reject

```text
Reject with Reason
```

两者都需要确认框并记录审批历史。

---

## 八、Approval Detail

点击 View 打开详情 Drawer，建议使用：

> ProDescriptions + Steps / Timeline

展示：

```text
Simulation / Rule Context
Threshold Check Result
Required Approval Level
Current Approver
Approval History
Comments
```

并可视化门槛判定：

```text
Configured Threshold: -10%
Requested Discount: -15%
Result: Exceeded
Routing: L1 Approval
```

---

## 九、页面顶部增加区域概览

建议统计卡：

```text
Pending Requests
Auto Approved Today
Approved Requests
Rejected Requests
```

可补充：

```text
Average Turnaround Time
```

---

## 十、与 Simulation / Rules / Billing 的业务关系

页面中需体现：

> Simulation 或 Rule 变更先进入审批；审批通过后才可参与 Billing 执行。

流程：

```text
Simulation / Rule Change
   ↓
Threshold Evaluation
   ↓
Auto or Manual Approval
   ↓
Approved Pricing Activation
   ↓
Billing Run
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface ApprovalRequest {
  id: string;
  simulationId?: string;
  subject: string;
  clientName: string;
  product: string;
  market: string;
  requestedDiscountPercent: number;
  thresholdPercent: number;
  thresholdExceeded: boolean;
  requiredApprovalLevel: 'AUTO' | 'L1' | 'L2' | 'CFO';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED' | 'WITHDRAWN';
  requestedBy: string;
  requestedAt: string;
}
```

Mock API：

```text
GET    /api/pricing/approval-requests
GET    /api/pricing/approval-requests/:id
POST   /api/pricing/approval-requests/:id/approve
POST   /api/pricing/approval-requests/:id/reject
GET    /api/pricing/approval-thresholds
```

---

## 十二、技术要求

必须遵循现有技术栈：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProDescriptions
* ProCard
* Steps / Timeline

不要引入新的 UI framework。不要升级依赖。

---

## 十三、交互要求

至少实现：

### 查询

```text
Status
Product
Requestor
Date Range
Keyword
```

### 查看

View → Detail Drawer。

### 审批通过

Approve → 输入备注 → 更新状态与审批历史。

### 审批拒绝

Reject → 输入原因 → 更新状态与审批历史。

### 自动审批展示

门槛内请求自动变更为 AUTO_APPROVED，并记录 System 操作记录。

---

## 十四、Demo 重点

这个页面不是为了展示“按钮审批”，而是为了向银行客户展示：

> **可配置的风险门槛与授权路径，能够在提升效率的同时保持治理和审计能力。**

建议突出：

```text
Policy Threshold
        ↓
Risk-based Routing
        ↓
Controlled Decision
        ↓
Audit Trail
```

---

## 国际化要求（仅中文 / English）

- 本页面仅支持 `zh-CN` 和 `en-US` 两种语言，不新增或要求其他语言包。
- 所有 UI 文案，包括审批状态、申请类型、优先级、表格列、按钮、操作菜单、详情字段、校验和审批结果提示，必须使用 i18n key，不得硬编码中文或英文。
- 新增文案统一维护在 `src/locales/zh-CN/pages.ts`、`src/locales/en-US/pages.ts` 和对应的 `menu.ts` 中，使用 `pages.pricing.approval.*` 与菜单专属 key。
- Request ID、客户名称、规则编号等 Mock 业务数据可以保留标准值；状态、类型和审批动作的显示名称必须国际化。
- 切换 `zh-CN` / `en-US` 后，审批列表、详情 Drawer、操作 Modal 和审批时间线都必须显示对应语言。

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有审批状态与 Tag 展示风格。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 查看
* 审批通过
* 审批拒绝
* 自动审批展示
* 审批历史展示

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实 BPM 工作流引擎、真实后端审批系统。当前目标是可用于客户演示的高质量 Demo。**
