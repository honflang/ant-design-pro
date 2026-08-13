你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Pricing Simulation（定价模拟）**

重点展示平台在正式报价前，如何通过多产品场景模拟快速评估收入影响，并支撑后续审批决策。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Pricing Simulation（定价模拟）**

页面。

页面用于模拟不同折扣、返佣、交易量和产品组合下的定价结果。

需要体现以下业务概念：

* Client-level Scenario（客户级场景）
* Multi-product Bundle（多产品组合）
* Discount / Rebate（折扣与返佣）
* Base Revenue vs Adjusted Revenue（调整前后收入）
* Margin Estimation（预估利润率）
* Scenario Comparison（方案对比）
* Submit for Approval（提交审批）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Pricing Configuration
  └── Pricing Simulation
```

建议路由：

```text
/pricing-billing/pricing/simulation
```

如果项目已存在该路由和菜单，请保持现有结构，仅补强页面能力与提示词描述。

---

## 四、页面总体结构

页面采用：

> ProForm + ProCard + Statistic + ProTable

左右分栏 + 底部历史记录布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Pricing Simulation                                               │
│ Simulate pricing scenarios and assess expected revenue impact   │
├──────────────────────┬──────────────────────────────────────────┤
│ Simulation Setup     │ Results                                  │
│ Client / Market      │ Revenue Summary                          │
│ Product Selection    │ Product Breakdown                        │
│ Discount / Rebate    │ Scenario Comparison                      │
│ Volume Assumption    │ Margin Estimate                          │
│ [Run] [Save] [Submit]│                                          │
└──────────────────────┴──────────────────────────────────────────┘
│ Simulation History                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 五、Mock 数据

至少准备：

* 5 个 APAC 市场（SG/HK/CN/JP/AU）
* 3 个产品（Cash / Trade / FX）
* 3 个折扣对比场景（-10% / -15% / -20%）

示例：

```text
Client: ACME Corp
Market: Singapore
Products: Cash Management + Trade Finance + FX Services
Discount: -15%
Base Revenue: SGD 12,500
Adjusted Revenue: SGD 10,625
Estimated Margin: 68%
```

---

## 六、列表字段

Simulation History 列表至少包含：

1. Simulation ID
2. Client
3. Market
4. Products
5. Discount
6. Base Revenue
7. Adjusted Revenue
8. Effective Discount
9. Estimated Margin
10. Status
11. Created By
12. Created At
13. Actions

Actions：

```text
View
Load
Submit for Approval
```

---

## 七、新增 / 编辑 Simulation

页面主交互集中在 Setup 面板，建议分组：

### 1. Client Context

```text
Client
Market
Products (multi-select)
```

### 2. Pricing Parameters

```text
Discount Percent
Rebate Type
Rebate Threshold
Special Conditions
```

### 3. Volume Assumptions

```text
Estimated Transactions per Month
Expected Deal Size
```

主要动作：

```text
Run Simulation
Save as Draft
Submit for Approval
```

---

## 八、Simulation Detail

点击 View 打开详情 Drawer，建议使用：

> ProDescriptions + ProCard + Table

展示：

```text
Simulation Details
Base Revenue
Adjusted Revenue
Discount Amount
Estimated Margin
Product Breakdown
```

并增加：

### Scenario Comparison Preview

```text
Scenario A (-10%)
Scenario B (-15%)
Scenario C (-20%)
```

用于可视化不同策略影响。

---

## 九、页面顶部增加区域概览

在页面顶部增加统计卡：

```text
Total Simulations
Draft Simulations
Submitted Simulations
Average Discount
```

可补充：

```text
Estimated Revenue Impact
```

---

## 十、与 Approval / Billing 的业务关系

页面中需体现：

> Simulation 是审批前的决策输入；审批通过后可生成生效定价并用于 Billing。

流程建议：

```text
Simulation Input
   ↓
Revenue/Margin Outcome
   ↓
Scenario Selection
   ↓
Submit for Approval
   ↓
Approved Pricing
   ↓
Billing Run
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface SimulationResult {
  id: string;
  baseRevenue: number;
  adjustedRevenue: number;
  discountAmount: number;
  effectiveDiscountPercent: number;
  estimatedMarginPercent: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
}
```

Mock API：

```text
POST   /api/pricing/simulations
POST   /api/pricing/simulations/draft
POST   /api/pricing/simulations/:id/submit
GET    /api/pricing/simulations
GET    /api/pricing/simulations/:id
```

---

## 十二、技术要求

必须遵循现有技术栈：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProForm
* ProTable
* ProDescriptions
* ProCard

不要引入新的 UI framework。不要升级依赖。

---

## 十三、交互要求

至少实现：

### 查询

```text
Client
Market
Status
Date Range
Keyword
```

### 运行模拟

Run Simulation → 前端 Mock 计算 → 展示结果与对比场景。

### 保存草稿

Save as Draft → 写入历史记录，状态为 DRAFT。

### 提交审批

Submit for Approval → 状态改为 SUBMITTED，并可联动审批页。

### 加载历史

Load 历史记录 → 回填参数并允许再次运行。

---

## 十四、Demo 重点

这个页面不是为了展示“简单计算器”，而是为了向银行客户展示：

> **基于数据的定价决策能力，可在提交审批前快速比较方案并量化影响。**

UI 上建议突出：

```text
Scenario Modeling
        ↓
Revenue Impact Visibility
        ↓
Approval-ready Proposal
        ↓
Controlled Pricing Execution
```

---

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有页面使用的 ProForm / ProTable 模式。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 模拟运行
* 场景对比
* 草稿保存
* 审批提交
* 历史加载

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实模型计算引擎、真实审批引擎、真实后端 API。当前目标是一个可用于客户演示的高质量 Demo。**
