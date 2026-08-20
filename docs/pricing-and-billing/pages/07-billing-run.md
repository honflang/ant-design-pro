你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Billing Run（计费执行）**

重点展示计费批次如何触发、执行、重算、处理追溯交易，并与发票生成形成闭环。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Billing Run（计费执行）**

页面。

需要体现以下业务概念：

* Billing Batch Execution（批次执行）
* Run Status Tracking（状态追踪）
* Line-item Breakdown（明细拆分）
* Recalculation（重算）
* Backdated Transaction Handling（追溯交易处理）
* Generate Invoice（从 Run 发起开票）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Billing Management
  └── Billing Run
```

建议路由：

```text
/pricing-billing/billing/run
```

如果项目已存在该路由和菜单，请保持现有结构兼容。

---

## 四、页面总体结构

页面采用：

> ProCard + StatisticCard + ProTable + Drawer + Modal

布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Billing Run                                                      │
│ Execute and monitor billing runs across markets                 │
├──────────────────────────────────────────────────────────────────┤
│ [Total Runs] [Completed] [In Progress] [Failed] [MTD Amount]   │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Cycle ▼] [Status ▼] [Date Range] [Search]          │
├──────────────────────────────────────────────────────────────────┤
│ Billing Runs                            [Trigger] [Recalculate] │
│ Run ID │ Market │ Period │ Clients │ Amount │ Status │ Actions  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、Mock 数据

至少覆盖：

* 正常完成批次（COMPLETED）
* 进行中批次（IN_PROGRESS）
* 失败批次（FAILED）
* 重算批次（RECALCULATION）
* 含追溯交易批次（BACKDATED）

建议覆盖 SG/HK/CN/JP/AU 市场。

---

## 六、列表字段

Billing Run 列表至少包含：

1. Run ID
2. Market
3. Billing Period
4. Run Type
5. Total Clients
6. Total Amount
7. Currency
8. Status
9. Started At
10. Completed At
11. Created By
12. Actions

Actions：

```text
View
Recalculate
Generate Invoice
```

---

## 七、新增 / 编辑 Billing Run（操作）

该页通常不“编辑 Run”，核心是执行与重算：

### 1. Trigger New Run

```text
Market
Billing Period
Run Type (Regular / Recalculation / Backdated)
```

### 2. Recalculate

```text
Reason
Include Backdated Transactions
```

触发后显示状态从 IN_PROGRESS 到 COMPLETED 的演示流程。

---

## 八、Run Detail

点击 View 打开 Drawer，建议使用：

> ProDescriptions + ProTable + ProCard

展示：

```text
Run Summary
Line Items by Client/Product
Applied Pricing Rule
Tax Amount
Total Amount
```

并增加：

### Backdated Transactions Preview

```text
Backdated Tx Date
FX at Booking Date
Recalculated Amount
Policy Check (within max backdate window)
```

---

## 九、页面顶部增加区域概览

建议统计卡：

```text
Total Runs
Completed Runs
In-progress Runs
Failed Runs
Total Billed MTD
```

---

## 十、与 Billing Configuration / Invoice 的业务关系

页面中需体现：

> Billing Configuration 提供执行参数；Billing Run 产出计费结果；Invoice 基于 Run 结果生成。

流程建议：

```text
Billing Configuration
   ↓
Billing Run Trigger
   ↓
Line-item Calculation
   ↓
Recalculation / Backdate Handling
   ↓
Invoice Generation
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface BillingRun {
  id: string;
  market: string;
  billingPeriod: string;
  runType: 'REGULAR' | 'RECALCULATION' | 'BACKDATED';
  totalClients: number;
  totalAmountSGD: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'RECALCULATED';
  startedAt: string;
  completedAt?: string;
  originalRunId?: string;
  createdBy: string;
}
```

Mock API：

```text
GET    /api/billing/runs
GET    /api/billing/runs/:id
GET    /api/billing/runs/:id/line-items
POST   /api/billing/runs
POST   /api/billing/runs/:id/recalculate
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
Billing Cycle
Status
Date Range
Keyword
```

### 触发计费

Trigger New Run → Mock 创建 → 状态轮询更新。

### 重算

Recalculate → 选择原因 → 生成关联重算批次。

### 查看详情

View → Detail Drawer（含 line items 和追溯交易信息）。

### 生成发票

Generate Invoice → 跳转或联动 Invoice 页面。

---

## 十四、Demo 重点

这个页面不是为了展示“批处理列表”，而是为了向银行客户展示：

> **可追踪、可重算、可审计的计费执行能力。**

请突出：

```text
Run Orchestration
        ↓
Transparent Calculation
        ↓
Controlled Recalculation
        ↓
Invoice-ready Output
```

---

## 国际化要求（仅中文 / English）

- 本页面仅支持 `zh-CN` 和 `en-US` 两种语言，不新增或要求其他语言包。
- 所有 UI 文案，包括执行状态、运行类型、计费周期、表格列、按钮、操作菜单、详情字段、错误和确认提示，必须使用 i18n key，不得硬编码中文或英文。
- 新增文案统一维护在 `src/locales/zh-CN/pages.ts`、`src/locales/en-US/pages.ts` 和对应的 `menu.ts` 中，使用 `pages.billing.run.*` 与菜单专属 key。
- Run ID、市场、币种代码和 Mock 金额可以保留标准值；状态和运行类型的展示名称必须国际化。
- 切换 `zh-CN` / `en-US` 后，运行列表、详情 Drawer、重跑 / 取消 / 发票操作都必须显示对应语言。

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有 Billing 模块表格与状态组件模式。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 触发 Run
* 重算
* 查看详情
* 追溯交易展示
* 生成发票入口

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实批处理调度器、真实账务引擎、真实后端 API。当前目标是可用于客户演示的高质量 Demo。**
