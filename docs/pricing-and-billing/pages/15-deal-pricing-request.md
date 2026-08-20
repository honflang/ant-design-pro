# Deal Pricing Request - Agent Execution Specification

## 0. Task Overview

### Project

当前项目是基于 **Ant Design Pro + React + TypeScript** 的 Wholesale Banking Pricing & Billing System Demo。

### Task

新增：

> **Deal Pricing Request（个性化定价申请）**

页面用于让客户经理为指定企业客户提交协议级、活动级或特批级的个性化定价申请。申请以标准定价表或活动定价为基准，录入费用项调整后，可先执行 Mock 试算，再提交至 Pricing Approval。

### Important

这是一个 **Demo 项目**。

**不连接真实后端。** 所有客户、基准价格、试算和审批数据均使用 Mock。

不要实现真实：

* 核心银行定价引擎
* ECR 实际审批或额度占用
* 实时 Tariff / Promotion 同步
* 收益、风险或 FTP 的真实计算
* 合同生成或电子签署

只需要通过可解释的 Mock 规则完整展示“客户 - 申请价格 - 试算 - 审批”的业务路径。

---

# 1. Execution Rules

Agent 开始执行前必须：

1. 检查项目目录结构、Ant Design Pro 版本和现有 Customer Management 路由。
2. 检查现有 `ProTable`、`ProForm`、`Modal` / `Drawer` 页面以及 Mock 数据模式。
3. 优先复用项目已有组件、样式、服务与 Mock 组织方式。
4. 不升级依赖，不引入新的 UI Framework 或重量级计算库。
5. 不修改无关页面；不手工修改生成的 `src/services/ant-design-pro/`。
6. 页面必须支持中英文国际化；所有 UI 文案均使用 `useIntl().formatMessage` 或 `<FormattedMessage />`，不得硬编码中英文文案。
7. 新增文案统一写入 `src/locales/*/pages.ts`，使用前缀 `pages.dealPricingRequest.*`；至少同时维护 `zh-CN` 和 `en-US`。

---

# 2. Route and Menu

在现有 Customer Management 菜单下新增子菜单：

```text
Customer Management
├── Customer 360
├── Customer Portfolio
└── Deal Pricing Request
```

建议路由和菜单配置：

```text
Route: /pricing-billing/customer/deal-pricing-request
Route name: deal-pricing-request
Component: ./pricing-billing/customer/deal-pricing-request
Icon: fileAdd
```

不改变 Customer Management 当前的默认跳转 `/pricing-billing/customer/360`。

---

# 3. Business Scope and Flow

页面覆盖客户级个性化定价申请，不直接使价格生效。

```text
Customer Selection
   ↓
Request Type + Reason + Benchmark Source
   ↓
Price Line Items (baseline price -> requested price)
   ↓
Mock Pricing Simulation
   ↓
Submit Deal Pricing Request
   ↓
Pricing Approval
   ↓
Approved pricing becomes eligible for billing configuration
```

申请单状态：

```text
DRAFT | SIMULATED | PENDING_APPROVAL | APPROVED | REJECTED | WITHDRAWN
```

Demo 中提交申请后可创建一条 `PENDING_APPROVAL` Mock 记录，并提供跳转至 Pricing Approval 的入口；不需要真实工作流引擎。

---

# 4. Page Layout

页面采用：

> StatisticCard + ProCard + ProTable + Modal + ProForm

布局。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Deal Pricing Request                                      [+ New Request]     │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Draft] [Pending Approval] [Approved This Month] [ECR Requested]             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Customer ID | Customer Name | Request Type | Status | Date Range | Search     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Deal Pricing Request List                                                     │
│ Request ID | Customer | Type | Reason | Benchmark | ECR | Simulation | ...   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Top Summary

顶部显示适合客户现场 Demo 的轻量指标：

```text
Draft Requests
Pending Approval
Approved This Month
ECR Pricing Requested
```

四项统计卡在 Desktop 视图中必须横向排列为一行四列；使用响应式栅格实现，平板视图为每行两列，移动端为每行一列。

指标仅基于当前 Mock 列表聚合，不连接真实审批数据。

### 4.2 Search and Filter

列表搜索区至少支持：

```text
Customer ID
Customer Name
Request Type
Benchmark Source
ECR Pricing Requested (Y/N)
Status
Requested Date Range
```

筛选条件使用 `ProTable` 的查询表单或项目既有模式；重置后恢复默认列表状态。

---

# 5. Deal Pricing Request List

默认按 `requestedAt` 倒序展示。

列表至少包含：

1. Request ID
2. Customer ID
3. Customer Name
4. Customer Segment
5. Request Type
6. Request Reason
7. Benchmark Source
8. Requested Effective Date
9. ECR Pricing Requested
10. Simulation Result
11. Status
12. Requested By
13. Requested At
14. Actions

申请类型枚举：

```text
NEW_AGREEMENT       新签协议 / New Agreement
RENEWAL             续约 / Renewal
TEMPORARY_PROMOTION 临时促销 / Temporary Promotion
SPECIAL_WAIVER      特批豁免 / Special Waiver
```

申请理由至少支持：

```text
COMPETITIVE_PRESSURE       竞争压力 / Competitive Pressure
STRATEGIC_CUSTOMER         战略客户 / Strategic Customer
EXPECTED_TOTAL_RETURN      预期综合收益 / Expected Total Return
RELATIONSHIP_RETENTION     客户关系维系 / Relationship Retention
CROSS_SELL_OPPORTUNITY     交叉销售机会 / Cross-sell Opportunity
```

基准来源：

```text
TARIFF     标准定价表（Tariff） / Standard Tariff
PROMOTION  活动定价（Promotion） / Promotion Pricing
```

操作：

```text
View
Edit (DRAFT / SIMULATED only)
Simulate
Submit for Approval (SIMULATED only)
Withdraw (PENDING_APPROVAL only)
```

列表操作栏沿用 Customer Portfolio 的交互形式：使用 `MoreOutlined` 图标按钮触发下拉菜单，而不是并排文字链接。下拉菜单中的每个操作必须配置对应图标；例如 `View` 使用 `EyeOutlined`，`Edit` 使用 `EditOutlined`。状态不允许的操作不显示。

`View` 可打开详情 Drawer；`Edit` 和 `Simulate` 打开申请编辑 Modal。状态不允许的操作应隐藏或禁用，并提供项目既有风格的提示。

---

# 6. New and Edit Request Modal

点击 `New Request` 或可编辑记录的 `Edit` 后，在较宽的 Modal 中打开申请表单。建议宽度 `1100`，长表单采用分区和稳定的操作栏，避免在主列表页直接展开。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Deal Pricing Request                                                   [X]    │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. Customer & Request Context                                                │
│ 2. Benchmark and Effective Period                                             │
│ 3. Requested Price Details (2 items)                            [Edit lines] │
│    Fee Item | Requested Price Type | Requested Price | Baseline Price        │
│    ...current price detail rows (read-only preview)...                       │
│ 4. ECR Pricing                                                               │
│ 5. Simulation Summary                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Cancel] [Save Draft] [Run Simulation] [Submit for Approval]                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 6.1 Customer and Request Context

字段：

```text
Customer ID                 required, searchable Select
Customer Name               auto-filled, read-only
Customer Segment            auto-filled, read-only
Relationship Manager        auto-filled, read-only
Request Type                required Select
Request Reason              required Select
Reason Description          optional TextArea
```

选择客户后，自动刷新客户名称、客户分层、关系经理、可用资费项和对应的基准价格。至少支持以下 Mock 客户：

```text
CUST-000128  ABC Global Holdings       Strategic Corporate
CUST-000256  Pacific Trading Group     Large Corporate
CUST-000384  Sakura Manufacturing Co.  Large Corporate
```

客户数据应优先复用 Customer 360 的 Mock 数据模型或共享 Mock 文件；不重复建立不一致的客户主数据。

## 6.2 Benchmark and Effective Period

字段：

```text
Benchmark Source            required: TARIFF / PROMOTION
Tariff / Promotion Plan     required, depends on benchmark source
Market                      required
Currency                    required
Effective Start Date        required
Effective End Date          required for TEMPORARY_PROMOTION
```

规则：

* 选择 `TARIFF` 时显示适用的标准价目表与有效期。
* 选择 `PROMOTION` 时只展示当前市场和客户分层可用的 Mock 活动；活动的原始价格仍为只读基准价格。
* `TEMPORARY_PROMOTION` 必须录入结束日期，且结束日期不得早于开始日期。
* `NEW_AGREEMENT`、`RENEWAL`、`SPECIAL_WAIVER` 的结束日期可选；若录入则不得早于开始日期。

## 6.3 ECR Pricing

字段：

```text
Apply for ECR Pricing       required Switch / Radio: Y / N
ECR Reason                  required when Y
ECR Reference               optional text
```

ECR 仅作为申请标识和审批路由提示。Demo 中不调用真实 ECR 系统，也不计算实际资本或授信影响。

## 6.4 Requested Price Details Preview

`3. Requested Price Details` 分区中，`[Edit lines]` 按钮下方必须展示当前申请草稿已添加的价格明细只读预览列表，而不是仅显示按钮：

```text
Fee Item | Requested Price Type | Requested Price | Baseline Price
```

规则：

* 预览列表数据来源于当前编辑中的价格明细状态，新增、编辑或删除费用项后，主表单内的预览必须同步刷新，无需重新打开弹窗。
* 尚未添加任何费用项时，展示项目既有风格的空状态提示，并引导点击 `Edit lines`。
* 预览列表仅用于概览，不提供行内编辑；修改价格明细仍需通过 `Edit lines` 打开第 7 节的独立弹窗。
* 分区标题旁以 `(N items)` 形式展示当前费用项数量，`N` 随价格明细数量实时更新。
* `5. Simulation Summary` 必须作为独立分区（独立 ProCard）展示，不得与 `3. Requested Price Details` 合并为同一分区；两者各自拥有独立标题，避免申请价格明细预览与试算结果混排在同一个信息块中。
* 尚未运行过本版本试算时，`5. Simulation Summary` 分区展示醒目的“待试算”提示，引导用户点击 `Run Simulation`；试算完成后替换为 Mock 试算结果标签与关键指标。

---

# 7. Requested Price Details Modal

申请价格明细必须通过独立弹窗维护，避免主申请表单过长。点击 `Edit lines` 后打开嵌套 Modal；关闭时仅回填当前申请草稿，不影响主列表筛选状态。

建议宽度 `1200`，使用可编辑 `ProTable` 或项目已有可编辑表格模式，并支持横向滚动。

嵌套弹窗必须完整显示在 `Deal Pricing Request` 主弹窗之上，不得被主弹窗遮挡或与主弹窗内容重叠错位：主弹窗保持打开但不可交互（遮罩层置于主弹窗与嵌套弹窗之间），嵌套弹窗关闭后焦点与滚动位置回到主弹窗原有状态。若使用 antd `Modal`，需保证嵌套弹窗的层级（`zIndex`）高于主弹窗，且不要在打开嵌套弹窗时卸载或隐藏主弹窗。

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Requested Price Details                                      [+ Add Fee Item] │
├──────────────────────────────────────────────────────────────────────────────┤
│ Fee Item | Service | Tariff Item | Baseline Price | Requested Price | ...    │
└──────────────────────────────────────────────────────────────────────────────┘
```

列至少包含：

1. Fee Item
2. Charge Service
3. Tariff Item Code
4. Pricing Model
5. Charge Basis
6. Baseline Price
7. Requested Price Type
8. Requested Price
9. Currency
10. Discount versus Baseline
11. Effective Period
12. Remarks
13. Actions

点击 `+ Add Fee Item` 新增一行时，`Fee Item` 单元格默认为空，不预置默认收费项；必须由用户从当前 Tariff / Promotion 的可用收费项中主动选择（下拉 Select），系统不得自动带出或预填 `Fee Item` 本身。

用户选择 `Fee Item` 后，自动带出以下只读字段：

```text
Charge Service
Tariff Item Code
Pricing Model
Charge Basis
Baseline Price
Currency
```

用户选定的 `Fee Item` 名称必须作为该行的展示文本呈现在申请价格明细列表的 `Fee Item` 列中（选择完成后不再保持下拉编辑态），与其余只读字段一并作为该行记录的一部分展示。

申请价格输入规则：

```text
AMOUNT      录入具体数值，例如 USD 450.00
RATE        录入比例，例如 0.25%
DISCOUNT    录入相对基准价格的折扣，例如 10%
WAIVER      申请价格固定为 0，仅适用于 SPECIAL_WAIVER
```

Demo 校验规则：

* 至少保留一条收费明细才可试算或提交。
* 申请价格不可为负数；比例不可为负数。
* `WAIVER` 仅可由 `SPECIAL_WAIVER` 使用。
* 非豁免行的申请价格不得为空。
* 申请价格高于基准时显示中性提示；低于基准时显示折扣百分比；不需要禁止录入。
* 移除费用项前使用确认操作；删除草稿数据即可，不产生真实审计记录。

Mock 示例：

| Fee Item | Baseline Price | Requested Price | Price Type |
| --- | ---: | ---: | --- |
| Cash Pool Monthly Maintenance | USD 500.00 / account | USD 420.00 / account | AMOUNT |
| Cross-border Payment Fee | 0.30% | 0.25% | RATE |
| Trade Finance Processing | USD 1,000.00 / transaction | 10% discount | DISCOUNT |

---

# 8. Mock Simulation

`Run Simulation` 基于当前表单和申请价格明细执行前端 Mock 试算，不保存真实价格，也不调用后端。

输入要求：

```text
Customer
Request Type
Benchmark Source
Market and Currency
Effective Start Date
At least one requested price detail
```

试算完成后，申请状态变为 `SIMULATED`，并在编辑 Modal 的 Simulation Summary 区显示：

```text
Baseline Annualized Fee
Requested Annualized Fee
Estimated Discount / Uplift
Estimated Revenue Impact
Estimated Total Relationship Return
Threshold Check
ECR Indicator
```

建议 Demo 计算规则：

```text
lineBaseline = baselinePrice × mockAnnualVolume
lineRequested = requestedPrice × mockAnnualVolume
discount = (lineBaseline - lineRequested) / lineBaseline
estimatedRevenueImpact = sum(lineRequested) - sum(lineBaseline)
```

对于 `RATE` 与 `DISCOUNT`，可通过每个 Mock 收费项的 `mockAnnualVolume` 和 `baselinePrice` 转换为金额。数值仅用于 Demo 解释，需要明确以 `Mock Simulation` 标记，不得声称真实收益预测。

显示规则：

* 低于基准价格时突出 `Estimated Revenue Impact` 和折扣比例。
* 申请价格超过客户历史折扣或预定义阈值时显示 `Alert`，提示需要额外审批说明。
* 申请 ECR 定价时显示 `ECR Pricing Requested` 标签，并在提交前要求填写 ECR Reason。
* `Save Draft` 不要求试算；`Submit for Approval` 必须已完成本次表单版本的试算。

---

# 9. Request Detail Drawer

点击 `View` 打开详情 Drawer，建议使用：

> ProDescriptions + ProTable + StatisticCard + Timeline

展示：

```text
Request Profile
Customer Snapshot
Benchmark Information
Requested Price Details
Mock Simulation Summary
Status and Approval Timeline
```

各分区建议以独立 `ProCard` 呈现，具体内容：

* `Request Profile`：Request ID、Request Type、Request Reason、Reason Description、Requested By、Requested At、ECR Pricing Requested（含 ECR Reason / ECR Reference）。
* `Customer Snapshot`：Customer ID、Customer Name、Customer Segment、Relationship Manager。
* `Benchmark Information`：Benchmark Source、Tariff / Promotion Plan、Market、Currency、Effective Start/End Date。
* `Requested Price Details`：只读明细表，至少展示 Fee Item、Requested Price Type、Requested Price、Baseline Price。
* `Mock Simulation Summary`：使用 `StatisticCard` 展示 Baseline Annualized Fee、Requested Annualized Fee、Estimated Revenue Impact、Estimated Discount / Uplift、Threshold Check；尚未试算时展示引导提示，不得留空。
* `Status and Approval Timeline`：使用 `Timeline` 按 Requested → Simulated → Submitted → Approved / Rejected / Withdrawn 顺序展示已发生的节点，节点文案需与申请当前状态一致，未发生的节点不展示。

详情中所有申请价格明细均为只读。若申请仍为 `DRAFT` 或 `SIMULATED`，提供 `Edit` 与 `Run Simulation` 操作；若为 `PENDING_APPROVAL`，仅提供 `Withdraw`；审批完成后仅保留查看能力。Drawer 顶部操作区（`extra`）根据申请状态展示对应按钮，不允许的操作不显示。

---

# 10. Pricing Approval Integration

提交后传递以下最小上下文至 Pricing Approval：

```ts
interface DealPricingApprovalContext {
  requestId: string;
  customerId: string;
  customerName: string;
  requestType: DealPricingRequestType;
  benchmarkSource: BenchmarkSource;
  ecrPricingRequested: boolean;
  estimatedRevenueImpact: number;
  requestedDiscountPercent?: number;
}
```

跨模块跳转建议：

```text
/pricing-billing/pricing/approval?source=deal-pricing-request&requestId=<requestId>
```

在 Demo 中可通过 URL 参数预筛选或定位关联审批记录。申请页面不应直接把请求状态置为 `APPROVED`。

---

# 11. Data Model

建立清晰的本地类型，不要将申请、收费项或试算结果定义为 `any`。

```ts
type DealPricingRequestType =
  | 'NEW_AGREEMENT'
  | 'RENEWAL'
  | 'TEMPORARY_PROMOTION'
  | 'SPECIAL_WAIVER';

type DealPricingRequestReason =
  | 'COMPETITIVE_PRESSURE'
  | 'STRATEGIC_CUSTOMER'
  | 'EXPECTED_TOTAL_RETURN'
  | 'RELATIONSHIP_RETENTION'
  | 'CROSS_SELL_OPPORTUNITY';

type BenchmarkSource = 'TARIFF' | 'PROMOTION';
type RequestedPriceType = 'AMOUNT' | 'RATE' | 'DISCOUNT' | 'WAIVER';
type DealPricingRequestStatus =
  | 'DRAFT'
  | 'SIMULATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

interface DealPricingRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerSegment: string;
  relationshipManager: string;
  requestType: DealPricingRequestType;
  requestReason: DealPricingRequestReason;
  reasonDescription?: string;
  benchmarkSource: BenchmarkSource;
  benchmarkPlanId: string;
  market: string;
  currency: string;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  ecrPricingRequested: boolean;
  ecrReason?: string;
  ecrReference?: string;
  priceDetails: DealPricingPriceDetail[];
  simulation?: DealPricingSimulation;
  status: DealPricingRequestStatus;
  requestedBy: string;
  requestedAt: string;
}

interface DealPricingPriceDetail {
  id: string;
  feeItem: string;
  chargeService: string;
  tariffItemCode: string;
  pricingModel: 'FLAT' | 'RATE' | 'TIERED';
  chargeBasis: string;
  baselinePrice: number;
  baselinePriceDisplay: string;
  requestedPriceType: RequestedPriceType;
  requestedPrice?: number;
  requestedPriceDisplay: string;
  currency: string;
  mockAnnualVolume: number;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  remarks?: string;
}

interface DealPricingSimulation {
  simulatedAt: string;
  baselineAnnualizedFee: number;
  requestedAnnualizedFee: number;
  estimatedRevenueImpact: number;
  estimatedTotalRelationshipReturn: number;
  requestedDiscountPercent: number;
  thresholdStatus: 'WITHIN_THRESHOLD' | 'REQUIRES_JUSTIFICATION';
}
```

---

# 12. Mock Data

至少提供三条不同状态和不同申请类型的记录：

```text
DPR-2026-001
ABC Global Holdings / CUST-000128
New Agreement
Strategic Customer
Standard Tariff
ECR: Y
Status: PENDING_APPROVAL
```

```text
DPR-2026-002
Pacific Trading Group / CUST-000256
Renewal
Competitive Pressure
Promotion Pricing
ECR: N
Status: SIMULATED
```

```text
DPR-2026-003
Sakura Manufacturing Co. / CUST-000384
Temporary Promotion
Cross-sell Opportunity
Standard Tariff
ECR: N
Status: DRAFT
```

Mock 资费项至少覆盖：

```text
Cash Pool Monthly Maintenance
Cross-border Payment Fee
Trade Finance Processing Fee
FX Transaction Commission
```

每个资费项需有：服务编码、资费项编号、定价模型、计费基础、基准价格、币种及 Mock 年交易量，以支持试算结果随客户和申请明细变化。

---

# 13. Internationalization

所有 UI 文案写入 `src/locales/*/pages.ts`。至少维护：

```text
pages.dealPricingRequest.title
pages.dealPricingRequest.action.new
pages.dealPricingRequest.action.saveDraft
pages.dealPricingRequest.action.runSimulation
pages.dealPricingRequest.action.submitForApproval
pages.dealPricingRequest.table.*
pages.dealPricingRequest.form.*
pages.dealPricingRequest.priceDetails.*
pages.dealPricingRequest.simulation.*
pages.dealPricingRequest.enum.*
pages.dealPricingRequest.validation.*
```

必须覆盖：

* 页面标题、统计卡、搜索项、表格列、按钮和空值占位符。
* 全部申请类型、申请理由、基准来源、价格类型、定价模型、阈值结果和申请状态。
* 申请表单、价格明细 Modal、试算摘要、详情 Drawer 和确认提示。
* 中英文切换后，不得出现缺失 key、中文/英文硬编码混排或仅依赖默认英文文案的情况。

Mock 自由文本，例如客户名、备注和申请说明，可以维持单一语言。

---

# 14. Acceptance Criteria

### Page and Menu

* [ ] `/pricing-billing/customer/deal-pricing-request` 可访问。
* [ ] Customer Management 下正确显示 Deal Pricing Request 菜单。
* [ ] 默认 Mock 申请列表按申请时间倒序加载。
* [ ] Customer ID、Customer Name、申请类型、基准来源、ECR、状态和日期范围可筛选。

### Request Management

* [ ] 可新建、查看和编辑 `DRAFT` / `SIMULATED` 申请。
* [ ] 客户切换后，客户快照与可选资费项、基准价格同步更新。
* [ ] 支持新签协议、续约、临时促销、特批豁免四种申请类型。
* [ ] 支持竞争压力、战略客户、预期综合收益等申请理由。
* [ ] 支持 Tariff 和 Promotion 两种基准来源。
* [ ] ECR 定价可选择 Y/N；选择 Y 后必须填写申请原因。

### Price Details and Simulation

* [ ] 申请价格明细在独立 Modal 内展示和维护。
* [ ] 费用项选择后，基准价格自动带出且不可直接修改。
* [ ] 支持金额、比例、折扣和特批豁免价格申请方式。
* [ ] 试算基于当前客户和申请价格明细产生可解释的 Mock 结果。
* [ ] 未完成本版本试算时不得提交审批。
* [ ] 提交后生成 `PENDING_APPROVAL` Mock 申请，并可跳转至 Pricing Approval。

### Technical

* [ ] 使用 TypeScript 明确建模，不使用无约束 `any`。
* [ ] 不接入真实银行、ECR、定价或审批系统。
* [ ] 不新增不必要依赖，不修改无关模块。
* [ ] 全部页面文案使用 i18n key，`zh-CN` 与 `en-US` 均提供翻译。
* [ ] TypeScript、Biome 和相关页面测试通过。