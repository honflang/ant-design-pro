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

本页面的模拟上下文来自 **Customer 360**。Pricing Simulation 不重复维护客户主数据，而是读取客户全景中的定价相关维度，在提交审批前形成可解释的客户级报价建议。

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

## 四-A、Customer 360 定价上下文

### 1. 设计原则

Pricing Simulation 与 Customer 360 的关系如下：

```text
Customer 360 Profile
   ↓ 读取客户画像与关系数据
Pricing Simulation Context
   ↓ 调整可模拟的价格参数与场景假设
Revenue / Margin / Risk Outcome
   ↓ 选择方案
Approval-ready Pricing Proposal
   ↓ 审批通过后
Effective Pricing → Billing Run
```

页面需要区分两类字段：

| 类型 | 说明 | 页面行为 |
|---|---|---|
| Customer 360 Context | 客户身份、关系规模、风险、价值、交易行为和历史定价 | 只读展示；标记数据来源和快照时间 |
| Simulation Inputs | 折扣、返佣、产品组合、交易量和特殊条件 | 可编辑；仅影响当前模拟，不直接修改客户主数据 |

### 2. Customer 360 维度映射

选择客户后，系统从 Customer 360 加载以下定价上下文：

| Customer 360 维度 | 关键字段 | 在模拟中的用途 |
|---|---|---|
| Identity & Segment | Customer ID、客户类型、行业、注册国家、经营市场 | 确定客户级场景、适用市场和默认定价策略 |
| Relationship Health | Relationship Health、Customer Since、Relationship Manager | 作为关系稳定性和审批说明的背景信息 |
| Product Portfolio | 已持有产品、产品状态、交叉销售机会 | 预选已有产品，提示可加入的交叉销售产品 |
| Banking Relationship | 存款余额、贷款余额、交易量、交易金额、Fee Discount | 支撑交易量、客户贡献度和产品组合假设的默认值 |
| Value & Contribution | Gross Revenue、Risk-adjusted Contribution、RFM Value、Customer Value | 评估调整后收入是否改善客户价值与关系贡献 |
| Pricing Profile | Customized Pricing、历史折扣、可接受费率阈值、价格敏感度 | 识别当前方案是否超出历史或客户可接受范围 |
| Risk & Compliance | Credit Rating、Risk Level、PD、AML Risk、FX Qualification、跨境权限 | 限制不适用的产品/市场，并影响预估利润率与审批提示 |
| Group Relationship | 集团授信敞口、额度使用率、母子公司关系 | 支持集团级定价视角和集中度风险提示 |
| Interaction & Insights | 最近议价、客户反馈、Pricing Opportunity、推荐行动 | 为特殊条件和方案说明提供可追溯的业务依据 |

### 3. 页面顶部客户上下文卡

在 `Simulation Setup` 之前增加 `Customer 360 Context` 摘要区，至少显示：

```text
Client: ABC Global Holdings             Customer ID: CUST-000128
Segment: Strategic Corporate             Customer Value: VIP Core
Relationship Health: 92 / 100             Risk Level: Low / Credit Rating: AA
Annual Revenue: USD 4.82M                 Risk-adjusted Contribution: USD 2.31M
Deposit / Loan: USD 420M / USD 280M       Annual Transactions: 1.28M
Current Pricing: Strategic Corporate Package, 8.5% discount
Pricing Sensitivity: Interest Rate High / Fee Medium / Acceptable Fee ≤ 12 bps
Data Snapshot: 2026-08-12  |  View Customer 360
```

该区域只展示客户画像快照，不允许直接编辑。提供 `View Customer 360` 操作，跳转到 `/pricing-billing/customer/360?customerId=<id>`，并保留当前客户。

### 4. 客户上下文对模拟的约束

Mock Demo 中采用以下可解释规则，不实现真实定价或风险引擎：

* Customer 360 中状态为 `Opportunity` 的产品可以加入模拟，但应显示为交叉销售机会，并展示预估增量收入。
* 客户已持有的产品默认勾选；不满足 `Cross-border Trading` 或 `FX Qualification` 的产品/市场组合显示警告，并禁止提交审批。
* 当前客户的历史折扣、Customized Pricing 和 Acceptable Fee Threshold 作为参考线；超出参考线时显示 `Outside historical range` 或 `Requires justification`。
* `Risk-adjusted Contribution` 与 `Credit Rating` 只作为结果解释和审批提示输入，不由本页面修改。
* 集团客户可切换 `Client-level` 与 `Group-aware` 视角；后者显示集团敞口、额度使用率和子公司覆盖范围，但本次 Demo 不执行真实集团额度分摊。
* 客户互动和 Mock Insight 可生成特殊条件建议，例如“高交易量客户可考虑 FX fee review”，但不自动改变折扣。

### 5. 客户驱动的场景维度

除原有 `-10% / -15% / -20%` 折扣场景外，场景对比至少包含以下客户维度：

```text
Scenario A: Current / Baseline Pricing
Scenario B: Relationship Investment
  - higher product penetration or cross-sell volume
  - moderate discount within historical range
Scenario C: Aggressive Retention
  - larger discount or rebate
  - explicit margin and risk warning
```

每个场景需要显示：

```text
Client Context Used
Products / Market
Volume Assumption
Discount + Rebate
Base Revenue → Adjusted Revenue
Risk-adjusted Contribution Impact
Estimated Margin
Customer Value / Pricing Threshold Check
Approval Recommendation
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

选择 `Client` 后自动加载 Customer 360 Context。客户级上下文包括客户分层、客户价值、风险等级、关系健康度、存贷款关系、交易量、现有产品、历史定价和集团关系；这些字段在 Setup 面板中以只读方式展示，并支持跳转 Customer 360。

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

默认值优先从 Customer 360 的 Annual Transactions、Annual Transaction Value、Settlement Transactions 和产品历史使用量推导。用户修改后只影响当前模拟结果。

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
Customer 360 Context Snapshot
Risk-adjusted Contribution Impact
Pricing Threshold Check
Approval Recommendation
```

并增加：

### Scenario Comparison Preview

```text
Scenario A (-10%)
Scenario B (-15%)
Scenario C (-20%)
```

用于可视化不同策略影响。

方案对比中增加 Customer 360 维度列：

```text
Scenario | Customer Value | Products / Penetration | Revenue Impact
         | Margin | Risk-adjusted Contribution | Threshold / Risk Flag
```

结果区应明确标识：`Mock calculation based on Customer 360 snapshot`，避免 Demo 用户误认为这是实时银行定价或风险决策结果。

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
   customerId: string;
   clientName: string;
   customerSegment: string;
   customerValue: string;
   riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
   relationshipHealthScore: number;
   market: string;
   products: string[];
   volumeAssumption: {
      transactionsPerMonth: number;
      expectedDealSize: number;
   };
   customer360Snapshot: {
      capturedAt: string;
      annualRevenue: number;
      riskAdjustedContribution: number;
      depositBalance: number;
      loanBalance: number;
      annualTransactions: number;
      currentDiscountPercent: number;
      acceptableFeeThresholdBps?: number;
      creditRating?: string;
      pricingPackage?: string;
   };
   discountPercent: number;
   rebateType?: 'NONE' | 'VOLUME' | 'RELATIONSHIP' | 'PRODUCT_BUNDLE';
   rebateThreshold?: number;
  baseRevenue: number;
  adjustedRevenue: number;
  discountAmount: number;
  effectiveDiscountPercent: number;
  estimatedMarginPercent: number;
   riskAdjustedContributionImpact: number;
   pricingThresholdStatus: 'WITHIN_RANGE' | 'OUTSIDE_RANGE' | 'REQUIRES_JUSTIFICATION';
   complianceWarnings: string[];
   selectedScenario?: 'BASELINE' | 'RELATIONSHIP_INVESTMENT' | 'AGGRESSIVE_RETENTION';
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
}
```

Customer 360 上下文必须以 snapshot 形式写入 `SimulationResult`，确保审批人员看到的是提交当时使用的客户画像，而不是随着 Customer 360 后续更新而漂移的结果。

Mock API：

```text
POST   /api/pricing/simulations
POST   /api/pricing/simulations/draft
POST   /api/pricing/simulations/:id/submit
GET    /api/pricing/simulations
GET    /api/pricing/simulations/:id
GET    /api/customer/:customerId/360/pricing-context
```

`GET /api/customer/:customerId/360/pricing-context` 为 Mock 只读接口，返回 Pricing Simulation 所需的最小 Customer 360 定价上下文；不返回完整客户 360 页面数据。

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

增加 Customer 360 相关查询：

```text
Customer Segment
Customer Value
Risk Level
Product
Relationship Manager
Pricing Exception / Threshold Breach
```

### 运行模拟

Run Simulation → 前端 Mock 计算 → 展示结果与对比场景。

### 保存草稿

Save as Draft → 写入历史记录，状态为 DRAFT。

### 提交审批

Submit for Approval → 状态改为 SUBMITTED，并可联动审批页。

### 加载历史

Load 历史记录 → 回填参数并允许再次运行。

加载历史记录时同时恢复当时的 Customer 360 snapshot metadata（客户 ID、画像版本/快照时间、客户价值、风险等级、历史定价参考线）。如果当前客户画像已经变化，页面显示 `Customer 360 context has changed`，用户需要确认后才能重新运行或提交审批。

### Customer 360 联动验收

* 从 Customer 360 的 `Value & Pricing` 打开 Pricing Simulation 时，自动带入 `customerId` 并加载客户上下文。
* 切换客户后，默认产品、市场、交易量、历史折扣参考线和风险提示同步刷新。
* 提交审批时保存 Customer 360 snapshot、场景选择、阈值检查和合规警告。
* Customer 360 中的客户状态、合规限制或风险等级变化时，旧模拟仍可查看，但重新运行和提交审批必须重新确认上下文。

---

## 十四、Demo 重点

这个页面不是为了展示“简单计算器”，而是为了向银行客户展示：

> **基于数据的定价决策能力，可在提交审批前快速比较方案并量化影响。**

UI 上建议突出：

```text
Scenario Modeling
        ↓
Customer 360 Context
   ↓
Revenue Impact Visibility
        ↓
Approval-ready Proposal
        ↓
Controlled Pricing Execution
```

Demo 讲解应突出：同一个折扣对不同客户并不代表同一个决策。客户价值、关系规模、产品渗透率、风险调整贡献、历史议价和合规状态共同决定方案的可解释性与审批优先级。

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
