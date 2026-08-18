# Customer 360 — Agent Execution Specification

## 0. Task Overview

### Project

当前项目是基于 **Ant Design Pro + React + TypeScript** 的 Wholesale Banking Pricing & Billing System Demo。

### Task

实现：

> **Customer 360**

用于展示 Wholesale Banking 企业客户的完整客户画像，包括：

* 基础身份
* 联系人
* 合规状态
* 存贷款关系
* 交易关系
* 客户贡献度
* RFM 价值
* 定价适配
* 风险价值
* 客户互动
* 集团关联关系
* 产品关系
* 交叉销售机会
* 外部客户信息

### Important

这是一个 **Demo 项目**。

**不连接真实后端。**

所有数据使用 Mock。

不要实现真实：

* AML
* Credit Risk
* Tax
* External Data
* AI
* Banking Core Integration

只需要通过 Mock 数据展示完整业务场景。

---

# 1. Execution Rules

Agent 开始执行前必须：

1. 检查项目目录结构。
2. 检查现有 Ant Design Pro 版本。
3. 检查路由配置。
4. 检查菜单配置。
5. 检查现有页面结构。
6. 找到一个现有的 `ProTable` 页面作为实现参考。
7. 找到一个现有的 `ProForm` / `Drawer` 页面作为实现参考。
8. 找到项目现有 Mock 数据实现方式。
9. **优先复用现有项目模式。**
10. 不升级依赖。
11. 不引入新的 UI Framework。
12. 不修改无关页面。

如果项目已有类似 Customer / Client / Account 页面，应优先复用其组件和数据模式。

---

# 2. Route

```text
/pricing-billing/customer/360
```

菜单：

```text
Customer Management
└── Customer 360
```

如果项目已经存在 `Customer Management`，直接添加子菜单。

---

# 3. Page Layout

页面整体结构：

```text
Customer 360
│
├── Customer Search
│
├── Customer Header
│
├── KPI Summary
│
└── Tabs
    │
    ├── Overview
    ├── Identity & Compliance
    ├── Banking Relationship
    ├── Value & Pricing
    ├── Interaction
    └── Relationship Graph
```

使用：

* ProCard
* StatisticCard
* ProDescriptions
* Tabs
* Timeline
* Progress
* Tag
* Badge
* Alert

具体组件以项目已有组件为准。

---

# 4. Customer Search

页面顶部提供 Customer Search。

支持：

```text
Customer Name
Customer ID
Unified Social Credit Code
Business Registration Number
```

Mock 客户：

```text
ABC Global Holdings
CUST-000128
China / Singapore
Strategic Corporate
```

```text
Pacific Trading Group
CUST-000256
Singapore / Hong Kong
Large Corporate
```

```text
Sakura Manufacturing Co.
CUST-000384
Japan
Large Corporate
```

选择客户后刷新整个 Customer 360 页面。

---

# 5. Customer Header

显示：

```text
Customer Name
Customer ID
Customer Segment
Registration Country
Operating Markets
Relationship Manager
Customer Since
Status
```

示例：

```text
ABC Global Holdings

Customer ID
CUST-000128

Segment
Strategic Corporate

Registration
China

Operating Markets
China · Singapore · Hong Kong

Relationship Manager
Zhang San

Customer Since
2014

Status
Active
```

Header 操作：

```text
[Pricing]
[Billing]
[Group View]
```

其中：

### Pricing

跳转到：

```text
Pricing Simulation
```

并携带当前 Customer ID。

### Billing

跳转到：

```text
Billing Management
```

并携带当前 Customer ID。

### Group View

切换：

```text
Relationship Graph
```

---

# 6. KPI Summary

Header 下方显示：

```text
Total Revenue
$4.82M
```

```text
Risk-adjusted Profit
$2.31M
```

```text
Deposit Balance
$420M
```

```text
Loan Balance
$280M
```

```text
Annual Transactions
1.28M
```

```text
Customer Value
VIP Core
```

支持显示同比变化：

```text
+12.4% YoY
```

---

# 7. Overview Tab

Overview 是 Customer 360 的默认 Tab。

---

## 7.1 Customer Health

显示：

```text
Relationship Health
92 / 100

Revenue Growth
+12.4%

Product Penetration
68%

Customer Value
VIP Core

Risk Level
Low
```

使用 Progress / Statistic / Tag。

---

## 7.2 Business Summary

显示：

```text
Industry
Manufacturing

Annual Revenue
$8.2B

Banking Relationship
12 Years

Operating Countries
5

Products Held
8

Relationship Manager
Zhang San
```

使用 `ProDescriptions`。

---

## 7.3 Revenue & Contribution

使用简单折线图或项目已有图表组件。

展示最近 12 个月：

```text
Revenue
Cost
Contribution
Risk-adjusted Contribution
```

Mock 数据即可。

---

## 7.4 Product Portfolio

展示：

```text
Cash Management              Active
FX                           Active
Cross-border Payment         Active
Trade Finance                Active
Lending                      Active
Supply Chain Finance         Opportunity
Interest Rate Hedging        Opportunity
```

Active 使用成功状态。

Opportunity 使用 warning / processing 状态。

---

## 7.5 Recent Activities

使用 Timeline。

Mock：

```text
2026-08-12
Pricing proposal approved

2026-08-10
Cross-border payment volume increased

2026-08-05
Customer requested fee adjustment

2026-07-28
Trade Finance facility renewed
```

---

## 7.6 Customer Insights

增加一个 Analytics / AI 风格 Card。

示例：

```text
Customer Insight

Pricing Opportunity

Customer's current FX pricing is above
the historical acceptable threshold.

Recommended Action

Review FX pricing for high-volume transactions.

Estimated Annual Revenue Impact

+$180K
```

明确：

> 数据为 Mock Analytics / Gen AI 数据。

不实现真实 AI。

---

# 8. Identity & Compliance Tab

---

## 8.1 Basic Identity

使用 `ProDescriptions`。

字段：

```text
Customer ID
Customer Name
Unified Social Credit Code
Business Registration Number
Registration Country
Registration Place
Operating Address
Industry
Industry Code
Foreign Ownership
```

---

## 8.2 Contacts

显示：

```text
Primary Contact
Finance Contact
Operations Contact
```

每个联系人：

```text
Name
Mobile
Email
WeChat
```

使用 Card。

---

## 8.3 Compliance

显示 4 个状态卡：

### AML Risk

```text
Low
Medium
High
```

### Blacklist

```text
Clear
Potential Match
Confirmed
```

### Cross-border Trading

```text
Enabled
Restricted
Disabled
```

### FX Qualification

```text
Valid
Expiring Soon
Expired
```

示例：

```text
AML Risk
Low

Blacklist
Clear

Cross-border Trading
Enabled

FX Qualification
Valid
Expires: 2027-06-30
```

状态颜色遵循项目现有 Design Token，不要硬编码颜色。

---

# 9. Banking Relationship Tab

Tab 内部分成四个 Card / Section：

```text
Deposits & Loans
Transaction Banking
Cross-border Payments
Contribution
```

---

## 9.1 Deposits & Loans

KPI：

```text
Deposit Balance
$420M

Loan Balance
$280M

Loan Utilization
72%

Average Deposit Balance
$380M
```

Pricing：

```text
FTP Benchmark
3.42%

Average Deposit Rate
2.81%

Average Lending Rate
4.18%
```

增加 12 个月：

```text
Deposit Balance
Loan Balance
```

趋势图。

---

## 9.2 Transaction Banking

显示：

```text
Settlement Transactions
1,280,000

Intermediary Services
12

Annual Fees
$820K

Fee Discount
8.5%
```

手续费趋势：

```text
2024
$620K

2025
$740K

2026 YTD
$820K
```

---

## 9.3 Cross-border Payments

显示：

```text
Annual Transactions
320,820

Total Transaction Value
$4.2B

Preferred Channel
SWIFT

Peak Transaction Period
09:00 - 12:00
```

交易路线：

```text
China → Singapore
Singapore → China
Hong Kong → China
Singapore → Australia
```

---

## 9.4 Contribution

显示：

```text
Gross Revenue
$4.82M

Operating Cost
$1.28M

Credit Cost
$420K

Economic Capital Cost
$380K

Risk-adjusted Contribution
$2.31M
```

重点突出：

```text
Risk-adjusted Contribution
$2.31M
```

---

## 9.5 Billing Statement

在 Contribution 区域提供 **View Billing** 入口。

用户点击后，打开账单明细 Drawer / Modal，展示当前客户的账单列表。

### 9.5.1 筛选

账单列表顶部提供 **月份筛选**。

支持：

```text
Year/Month Selector
Quick Filters: Last 3 Months / Last 6 Months / Last 12 Months / All
```

默认展示最近 12 个月账单。

### 9.5.2 账单列表

按 **账单日期倒序** 排列（最新账单在最前）。

表格字段：

| 账单日期 | 付款截止日期 | 服务周期开始日期 | 服务周期结束日期 | 本期应付款总额 | 币种 | 现金管理费 | 贸易融资费 | 全球市场交易费 | 附言 |
| -------- | ------------ | ---------------- | ---------------- | -------------- | ---- | ---------- | ---------- | -------------- | ---- |

Mock 示例（ABC Global Holdings）：

```text
2026-08-01    2026-08-15    2026-07-01    2026-07-31    $420,000    USD    $120,000    $180,000    $120,000    Monthly service fee
2026-07-01    2026-07-15    2026-06-01    2026-06-30    $390,000    USD    $110,000    $170,000    $110,000    Monthly service fee
2026-06-01    2026-06-15    2026-05-01    2026-05-31    $385,000    USD    $105,000    $175,000    $105,000    Monthly service fee
```

操作列：

```text
[Bill Details]    [Download Invoice]
```

### 9.5.3 账单详情

点击 **Bill Details** 打开二级 Drawer / Modal，展示单笔账单的明细。

显示字段：

```text
Bill Date
Payment Due Date
Service Period Start
Service Period End
Billing Currency
Total Amount Due
Cash Management Fee
Trade Finance Fee
Global Markets Transaction Fee
Other Fees
Remarks
Status
  - Issued
  - Paid
  - Overdue
```

明细行项目示例：

```text
Cash Management Fee
  Account Maintenance        $45,000
  Wire Transfer (outbound)   $38,000
  Collection Services        $37,000

Trade Finance Fee
  Letter of Credit           $120,000
  Trade Loan                 $60,000

Global Markets Transaction Fee
  FX Spot                    $85,000
  FX Forward                 $35,000
```

### 9.5.4 发票下载

点击 **Download Invoice** 触发 Mock 下载。

根据客户 **Registration Country / Operating Markets** 提供不同的固定发票模板：

| 国家/地区 | 模板说明 |
| --------- | -------- |
| China     | 中国大陆增值税普通发票模板 |
| Hong Kong | 香港商业发票模板 |
| Singapore | 新加坡 Tax Invoice 模板 |
| Japan     | 日本 請求書模板 |
| Default   | 国际通用 Invoice 模板 |

模板选择规则：

```text
优先取 Registration Country 对应模板；
若未命中，取 Operating Markets 第一个匹配市场；
否则使用 Default 模板。
```

发票内容为静态模板 + 当前账单数据填充，不连接真实税务或发票系统。

所有文件以 PDF / CSV Mock 下载即可，无需真实文件生成服务。

---

# 10. Value & Pricing Tab

这是 Customer 360 与 Pricing Management 的核心连接。

---

## 10.1 RFM Value

显示：

```text
Recency
3 days ago

Frequency
1.28M transactions / year

Monetary
$2.31M contribution
```

客户等级：

```text
★★★★★
VIP Core Customer
```

---

## 10.2 Pricing Sensitivity

显示：

```text
Interest Rate Sensitivity
High

Fee Sensitivity
Medium

Price Elasticity
Medium

Acceptable Fee Threshold
≤ 12 bps
```

---

## 10.3 Historical Negotiation

使用 ProTable。

字段：

```text
Date
Product
Requested Price
Approved Price
Discount
Status
```

Mock：

```text
2026-07
FX Fee
15 bps
12 bps
20%
Approved
```

```text
2026-04
Payment Fee
10 bps
9 bps
10%
Approved
```

---

## 10.4 Customized Pricing

显示：

```text
Customized Pricing
Enabled

Pricing Package
Strategic Corporate Package

Discount
8.5%

Valid Until
2026-12-31
```

按钮：

```text
[Open Pricing Simulation]
```

点击：

```text
/customer/360
        ↓
Pricing Simulation
```

当前 Customer 自动带入。

---

## 10.5 Risk Value

显示：

```text
Credit Rating
AA

Probability of Default
0.18%

Risk Mitigation
Collateral + Guarantee

Economic Capital
$18.2M

Risk-adjusted Return
13.8%
```

突出：

```text
Risk-adjusted Customer Value
$1.84M
```

---

# 11. Interaction Tab

使用 Timeline。

顶部过滤：

```text
All
Marketing
RM
Customer Service
Pricing
Billing
Complaint
```

Mock：

```text
2026-08-12
Pricing Proposal

RM submitted new FX pricing proposal.
```

```text
2026-08-10
RM Meeting

Discussed cross-border payment pricing.
```

```text
2026-08-05
Billing Request

Customer requested monthly billing.
```

```text
2026-07-28
Product Recommendation

Trade Finance product recommended.
```

---

# 12. Relationship Graph Tab

目标：

> 展示集团客户、母子公司、实际控制人和关联公司的关系。

使用项目已有图形组件。

如果项目没有图谱组件：

**不要新增重量级 Graph Library。**

可以使用：

* Card
* Tree
* 简单 CSS 节点
* Ant Design Tree

实现 Demo。

---

## 12.1 Mock Structure

```text
John Smith
Actual Owner
       │
       ▼
ABC Holdings
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
ABC   ABC   ABC
China HK    Singapore
```

---

## 12.2 Group Exposure

右侧：

```text
Group Credit Exposure
$680M

Group Credit Limit
$800M

Utilization
85%
```

分公司：

```text
ABC China
$320M

ABC Hong Kong
$140M

ABC Singapore
$120M

Others
$100M
```

---

## 12.3 Product Relationship

显示：

```text
Cash Management
Active

FX
Active

Cross-border Payment
Active

Trade Finance
Active

Lending
Active
```

---

## 12.4 Cross-sell Opportunities

```text
Supply Chain Finance
Opportunity Score: 82%
Estimated Revenue: +$320K
```

```text
Interest Rate Hedging
Opportunity Score: 64%
Estimated Revenue: +$180K
```

按钮：

```text
[Create Opportunity]
```

点击只需要显示成功 Message / Mock 状态即可。

---

# 13. External Intelligence

可以放在 Overview 底部，或者 Relationship Graph 页面底部。

显示：

```text
Financial Health
Stable

Industry Outlook
Positive

Company Registration
No Major Change

Public Sentiment
Positive
```

增加：

```text
Latest Update
2026-08-12
```

所有数据均为 Mock。

---

# 14. Data Model

建立统一的数据类型。

```typescript
interface Customer360 {
  id: string;
  customerName: string;
  customerType: string;
  status: CustomerStatus;

  identity: CustomerIdentity;

  contacts: CustomerContact[];

  compliance: ComplianceProfile;

  banking: BankingRelationship;

  billing: BillingProfile;

  value: CustomerValue;

  pricing: PricingProfile;

  risk: RiskProfile;

  interactions: CustomerInteraction[];

  relationships: CustomerRelationship[];

  products: CustomerProduct[];

  opportunities: CustomerOpportunity[];

  externalIntelligence: ExternalIntelligence;
}
```

相关类型至少包括：

```typescript
interface CustomerIdentity {}

interface CustomerContact {}

interface ComplianceProfile {}

interface BankingRelationship {}

interface BillingProfile {
  statements: BillingStatement[];
}

interface BillingStatement {
  billDate: string;
  paymentDueDate: string;
  servicePeriodStart: string;
  servicePeriodEnd: string;
  totalAmountDue: number;
  currency: string;
  cashManagementFee: number;
  tradeFinanceFee: number;
  globalMarketsTransactionFee: number;
  otherFees?: number;
  remarks: string;
  status: 'Issued' | 'Paid' | 'Overdue';
  details?: BillingStatementDetail[];
}

interface BillingStatementDetail {
  category: string;
  items: {
    name: string;
    amount: number;
  }[];
}

interface CustomerValue {}

interface PricingProfile {}

interface RiskProfile {}

interface CustomerInteraction {}

interface CustomerRelationship {}

interface CustomerProduct {}

interface CustomerOpportunity {}

interface ExternalIntelligence {}
```

不要把所有字段全部定义为 `any`。

---

# 15. Mock Data

至少实现三个 Customer。

---

## Customer 1

```text
ABC Global Holdings

ID:
CUST-000128

Country:
China / Singapore

Segment:
Strategic Corporate

Risk:
Low

Value:
VIP Core

Revenue:
$4.82M

Deposit:
$420M

Loan:
$280M
```

---

## Customer 2

```text
Pacific Trading Group

ID:
CUST-000256

Country:
Singapore / Hong Kong

Segment:
Large Corporate

Risk:
Medium

Value:
VIP

Revenue:
$2.16M
```

---

## Customer 3

```text
Sakura Manufacturing Co.

ID:
CUST-000384

Country:
Japan

Segment:
Large Corporate

Risk:
Low

Value:
Core

Revenue:
$1.84M
```

不同 Customer 切换后：

* Header
* KPI
* Overview
* Banking
* Pricing
* Risk
* Interaction
* Relationship

必须跟随 Customer 变化。

---

# 16. Cross-module Navigation

必须实现以下联动。

## Customer → Pricing

```text
Customer 360
    ↓
Value & Pricing
    ↓
Open Pricing Simulation
    ↓
Pricing Simulation
```

传递：

```text
customerId
```

---

## Customer → Billing

### 入口一：Header [Billing]

```text
Customer 360
    ↓
Header [Billing]
    ↓
Billing Management
```

传递：

```text
customerId
```

### 入口二：Banking Relationship → View Billing

```text
Customer 360
    ↓
Banking Relationship
    ↓
View Billing
    ↓
Billing Statement Drawer
```

本入口不跳转页面，直接在 Customer 360 页面内打开账单明细。

支持：

```text
Month filter
Bill list (sorted by bill date desc)
Bill details
Invoice download (region-specific template)
```

---

## Customer → Group

```text
Customer 360
    ↓
Group View
    ↓
Relationship Graph
```

---

# 17. UI Requirements

整体视觉：

> Enterprise Banking / Financial Platform

要求：

* 信息密度适中
* 清晰的层级
* 不要过度使用 Card
* 不要做成普通 CRM
* KPI 突出
* Risk / Compliance 状态明显
* Pricing / Value 数据突出
* 支持 Desktop 优先
* 页面需要适合客户现场 Demo

不要：

* 添加新的 UI Framework
* 添加大量动画
* 添加无意义的渐变
* 使用过多彩色装饰
* 创建复杂 3D 图表

---

# 18. Priority

## P0 — 必须完成

```text
Customer Search
Customer Header
KPI Summary

Overview
Identity & Compliance
Banking Relationship
Value & Pricing
```

尤其保证：

```text
Customer
   ↓
Value
   ↓
Pricing
```

这个核心路径完整。

---

## P1 — 第二优先级

```text
Interaction
Relationship Graph
Cross-sell Opportunities
External Intelligence
```

---

## P2 — 可选

```text
真实 AI
真实外部数据
真实工商信息
真实舆情
真实 Graph Database
真实银行系统 API
```

全部不要实现。

---

# 19. Acceptance Criteria

完成后必须满足：

### 页面

* [ ] `/customer/360` 可以访问
* [ ] 菜单正确显示
* [ ] 默认 Customer 正确加载
* [ ] Customer Search 可切换客户
* [ ] Header 正确显示
* [ ] KPI 正确显示

### Overview

* [ ] Customer Health
* [ ] Business Summary
* [ ] Revenue Chart
* [ ] Product Portfolio
* [ ] Recent Activities
* [ ] Customer Insights

### Identity

* [ ] Basic Identity
* [ ] Contacts
* [ ] AML
* [ ] Blacklist
* [ ] Cross-border Permission
* [ ] FX Qualification

### Banking

* [ ] Deposits
* [ ] Loans
* [ ] FTP
* [ ] Transaction Banking
* [ ] Cross-border Payment
* [ ] Contribution
* [ ] Billing Statement
  * [ ] Month filter
  * [ ] Bill list sorted by bill date desc
  * [ ] Bill details drawer
  * [ ] Invoice download with region-specific template

### Pricing

* [ ] RFM
* [ ] Pricing Sensitivity
* [ ] Historical Negotiation
* [ ] Customized Pricing
* [Risk Value]
* [Open Pricing Simulation]

### Interaction

* [ ] Timeline
* [ ] Filter

### Relationship

* [ ] Group Structure
* [ ] Group Exposure
* [ ] Product Relationship
* [Cross-sell Opportunity]

### Technical

* [ ] TypeScript 无明显错误
* [ ] 使用 Mock 数据
* [ ] 不依赖真实后端
* [ ] 不修改无关模块
* [ ] 不新增不必要依赖
* [ ] 遵循现有 Ant Design Pro 项目结构
