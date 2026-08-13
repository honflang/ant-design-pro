你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Invoice Management（发票管理）**

重点展示发票生成、查看、更正、重发与税务规则溯源能力，体现从 Pricing/Billing 到 Invoice 的完整闭环。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Invoice Management（发票管理）**

页面。

需要体现以下业务概念：

* On-demand Invoice Generation（按需开票）
* Invoice Lifecycle（Draft / Issued / Sent / Corrected / Cancelled）
* Tax Rule Traceability（税务规则来源）
* Jurisdiction-specific Format（不同市场合规格式差异）
* Correction & Re-issue（更正与重发）
* Download / Send（下载与发送）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Billing Management
  └── Invoice Management
```

建议路由：

```text
/pricing-billing/billing/invoice
```

---

## 四、页面总体结构

页面采用：

> ProCard + StatisticCard + ProTable + Drawer + Modal

布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Invoice Management                                               │
│ Generate and manage compliant invoices across markets           │
├──────────────────────────────────────────────────────────────────┤
│ [Total] [Draft] [Issued] [Corrected] [Total Billed]            │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Client ▼] [Period ▼] [Status ▼] [Search]           │
├──────────────────────────────────────────────────────────────────┤
│ Invoices                         [+ Generate] [Bulk Download]   │
│ Invoice # │ Client │ Market │ Amount │ Tax │ Status │ Actions   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、Mock 数据

至少覆盖市场：

* Singapore（GST）
* China（VAT）
* Japan（Consumption Tax）
* Hong Kong（可展示低税/免税场景）
* Australia（GST）

并包含：

* DRAFT 发票
* ISSUED 发票
* CORRECTED 发票

---

## 六、列表字段

Invoice 列表至少包含：

1. Invoice Number
2. Client
3. Market
4. Billing Period
5. Sub Total
6. Tax Type
7. Tax Rate
8. Tax Amount
9. Total Amount
10. Invoice Format
11. Status
12. Issue Date
13. Due Date
14. Actions

Actions：

```text
View
Issue
Correct
Download
Send
```

---

## 七、新增 / 编辑 Invoice（操作）

该页主要操作为生成和更正，不是直接手工维护全部字段。

### 1. Generate Invoice

```text
Billing Run
Client
Invoice Format
Issue Date
```

### 2. Correct Invoice

```text
Correction Reason
Adjusted Line Items (optional)
```

生成更正后，原单状态更新为 CORRECTED，新单记录 originalInvoiceId。

---

## 八、Invoice Detail

点击 View 打开详情 Drawer，建议使用：

> 自定义发票布局 + ProDescriptions + Table

展示：

```text
Invoice Header
Invoice Line Items
Sub Total / Tax / Total Due
Tax Rule Applied
Billing Run Reference
```

并增加：

### Tax Determination Preview

```text
Tax Rule ID
Tax Treatment
Tax Authority
Tax Calculation Basis
```

用于解释税额来源。

---

## 九、页面顶部增加区域概览

建议统计卡：

```text
Total Invoices
Draft Invoices
Issued Invoices
Corrected Invoices
Total Billed Amount
```

---

## 十、与 Tax / Billing Run 的业务关系

页面需体现：

> Invoice 由 Billing Run 结果生成，税额由 Tax Configuration 规则决定。

流程建议：

```text
Tax Configuration
   ↓
Billing Run Calculation
   ↓
Invoice Generation
   ↓
Issue / Send / Correct
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface Invoice {
  id: string;
  billingRunId: string;
  clientName: string;
  market: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  subTotal: number;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  taxRuleId: string;
  invoiceFormat: 'PDF' | 'ISO20022' | 'MT940' | 'XLSX';
  status: 'DRAFT' | 'ISSUED' | 'SENT' | 'CORRECTED' | 'CANCELLED' | 'OVERDUE';
  isCorrection: boolean;
  originalInvoiceId?: string;
}
```

Mock API：

```text
GET    /api/billing/invoices
GET    /api/billing/invoices/:id
POST   /api/billing/invoices
POST   /api/billing/invoices/:id/issue
POST   /api/billing/invoices/:id/correct
GET    /api/billing/invoices/:id/download
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
Client
Period
Status
Keyword
```

### 生成发票

Generate Invoice → Mock 创建 DRAFT。

### 发出发票

Issue → 状态从 DRAFT 到 ISSUED。

### 更正发票

Correct → 录入原因 → 生成新发票并关联原单。

### 查看详情

View → Drawer（含税务规则溯源）。

---

## 十四、Demo 重点

这个页面不是为了展示“发票表格”，而是为了向银行客户展示：

> **合规、可追溯、可更正的企业级发票管理能力。**

请突出：

```text
Billing Output
        ↓
Tax-aware Invoice
        ↓
Compliant Issuance
        ↓
Traceable Correction
```

---

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有发票详情样式与表格模式。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 生成
* 发出
* 更正
* 查看
* 下载/发送入口
* Tax Determination Preview

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实电子发票网关、真实邮件/报文通道、真实后端 API。当前目标是可用于客户演示的高质量 Demo。**
