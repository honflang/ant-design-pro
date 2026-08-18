你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户的产品定价、活动优惠、协议条款、计费与发票。

当前需要实现的是其中的：

> **Activity Pricing（活动定价）**

Activity Pricing 用于管理银行面向特定客户、客户群体或机构范围推出的阶段性优惠政策。一个活动（Activity）由一个 **Activity Overview（活动概况）** 和多个 **Pricing Rule（活动定价规则）** 组成：活动概况定义活动本身的生命周期、客户范围、机构范围和触发条件；活动规则定义在客户满足条件后，具体哪些产品、服务或收费项可以获得什么形式的优惠。

Activity Pricing 不替代 Price Book。Price Book 定义产品、服务和收费项的标准价格，是标准定价体系的基础输入；Activity Pricing 建立在 Price Book 的标准价格之上，在客户满足活动范围及触发条件后，对标准价格应用活动规则，形成最终的优惠价格或费用结果。整体关系：

```text
Price Book
    ↓
Standard Price
    ↓
Activity Pricing（客户范围 + 机构范围 + 触发条件）
    ↓
Pricing Rule（优惠类型 + 优惠值）
    ↓
Promotional Price / Waived Charge
    ↓
Billing Calculation
    ↓
Invoice
```

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增一个：

> **Activity Pricing（活动定价）**

页面，用于管理银行的阶段性优惠活动。

需要体现以下业务概念：

* Activity Overview（活动编码、名称、状态、生效 / 失效日期）
* Customer Scope（客户范围：Bank-wide / Segment / Client Group / Specific Customer）
* Institution Scope（机构范围：Bank-wide / Region / Branch，与 Price Book 的定价 Region 是不同概念）
* Trigger Conditions（触发条件：字段 + 操作符 + 值，支持 AND / OR 组合）
* Pricing Rule（Product Scope + Benefit Type + Benefit Value）
* Benefit Type（Fixed Amount / Percentage Discount / Rate Discount / Full Waiver / ECR Credit）
* Activity Status（Draft / Published / Inactive）及其生命周期

注意：这是一个 Demo，不需要实现完整真实银行的规则引擎和条件求值系统，只需通过合理的数据模型与交互体现平台能力。

---

## 三、菜单和路由

请在现有 Ant Design Pro 菜单中确认并使用：

```text
Pricing Configuration
  ├── Price Book
  ├── Activity Pricing
  ├── Pricing Rules
  ├── Pricing Simulation
  └── Pricing Approval
```

建议路由：

```text
/pricing-billing/pricing/activity-pricing
```

如果项目已存在 `Pricing Configuration` 菜单，请只新增 `Activity Pricing` 节点，保持 `Price Book` 等现有路由和权限控制不变。菜单标题建议：

```text
Pricing Configuration
Activity Pricing
```

请按项目既有的 umi `routes.ts` + `access` 权限方式实现。

---

## 四、页面总体结构

页面采用 Ant Design Pro 常见的：

> ProCard + StatisticCard + ProTable + Drawer / Modal

布局。整体页面示意：

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Activity Pricing                                                     │
│ Promotional pricing programs built on top of standard Price Book    │
├───────────────────────────────────────────────────────────────────────┤
│ [Total Activities] [Draft] [Published] [Inactive]                    │
├───────────────────────────────────────────────────────────────────────┤
│ Status ▼   Customer Scope ▼   Institution Scope ▼   Keyword [Search] │
├───────────────────────────────────────────────────────────────────────┤
│ Activities                                     [+ Create Activity]   │
│ Code      │ Name                  │ Status    │ Period       │ Scope │
│ ACT-001   │ APAC Cash Mgmt Promo  │ Published │ Sep-Dec 2026 │ SEGMENT: Corporate │
│ ACT-002   │ SME Fee Campaign      │ Draft     │ Mar-Dec 2026 │ SEGMENT: SME       │
│ ACT-003   │ APAC Strategic Promo  │ Published │ Jan-Jun 2026 │ GROUP: APAC Strategic Accounts │
└───────────────────────────────────────────────────────────────────────┘
```

页面需要有明显的 Enterprise / Banking 平台感，重点体现“中央平台统一管理阶段性优惠政策，并将优惠规则透明关联到标准价格、客户范围和机构销售范围”，避免普通活动 CRUD 视觉。

---

## 五、Mock 数据

Mock 数据应覆盖不同客户范围、机构范围、触发条件、产品和优惠类型，建议至少准备 **6 个 Activity、20 条以上 Pricing Rule**，覆盖以下场景：

| Activity | Customer Scope | Institution Scope | Trigger Condition | 代表性 Rule |
|---|---|---|---|---|
| APAC Corporate Cash Management Promotion | SEGMENT: Corporate | REGION: ASEAN | TRB ≥ SGD 10M AND Product Count ≥ 3 | Cash Management 20% Discount；Account Maintenance SGD 20 Fixed Discount |
| SME Transaction Fee Campaign | SEGMENT: SME | Bank-wide | — | Cross-border Payment Full Waiver |
| APAC Strategic Accounts Promotion | GROUP: APAC Strategic Accounts | Bank-wide | — | Cash Management / Trade Finance Rate Discount |
| Manufacturing Industry Promotion | Bank-wide | Bank-wide | Industry = Manufacturing | Trade Finance 20% Discount |
| Japan Transaction Campaign | Bank-wide | BRANCH: Japan Branch | — | Payment Fee Fixed Amount Discount |
| Australia ECR Promotion | Bank-wide | REGION: Australia | — | Cash Management ECR Credit |

每个 Activity 至少包含 1-3 条 Pricing Rule，且需要体现从 Price Book 标准价格到活动优惠价格的完整换算（例如 `SGD 50/month` 经 `20% Discount` 后为 `SGD 40/month`）。Mock 数据仅用于演示 UI 和业务流程，不代表真实或完整银行优惠政策。

---

## 六、列表字段

Activity 列表以“活动”为基本数据单元，至少包含：

1. Activity Code
2. Activity Name
3. Status（Draft / Published / Inactive）
4. Effective Period（Effective From → Effective To）
5. Customer Scope（Bank-wide / Segment / Group / Customer，附带具体目标，如 `SEGMENT: Corporate`）
6. Institution Scope（Bank-wide / Region / Branch，附带具体目标）
7. Rules（该 Activity 下的 Pricing Rule 数量，如 `4 Rules`）
8. Updated At
9. Actions

建议支持按 Status、Customer Scope、Institution Scope 和 Keyword 查询。

Actions：

```text
View
Edit
Publish（DRAFT → PUBLISHED）
Disable（→ INACTIVE）
```

可使用 Dropdown / MoreOutlined。

---

## 七、新增 / 编辑 Activity

点击：

> Create Activity

打开 Drawer（若 Activity 详情较复杂，也可采用独立 Detail Page，优先与项目现有交互模式保持一致）。

Drawer 建议按业务逻辑分组：

### 1. Activity Overview

```text
Activity Code *（唯一，可由 Mock 层生成或手工输入）
Activity Name *
Status（新建默认 DRAFT）
Effective Date *
Expiry Date（若填写，必须晚于 Effective Date）
```

### 2. Customer Scope

```text
○ Bank-wide         — 无需选择目标
○ Customer Segment  — 选择 Corporate / SME / Financial Institution / Public Sector
○ Customer Group    — 选择 APAC Strategic Accounts 等既有客户组，来自客户主数据，不在此处手工录入客户名单
○ Specific Customer — 至少选择一个具体客户
```

### 3. Institution Scope

```text
○ Bank-wide  — 无需选择目标
○ Region     — 选择销售机构所在区域，如 ASEAN（与 Price Book 的定价 Region/国家是不同概念，不复用同一字段）
○ Branch     — 选择具体分行
```

### 4. Trigger Conditions

使用 Condition Builder，支持多个条件通过 AND / OR 组合（Demo 支持 Condition Group，不要求无限嵌套）：

```text
[ TRB ▼ ] [ >= ▼ ] [ 10,000,000 ] [ SGD ]
AND
[ Signed Product Count ▼ ] [ >= ▼ ] [ 3 ]
AND
[ Industry ▼ ] [ = ▼ ] [ Manufacturing ▼ ]

[ + Add Condition ]  [ + Add Condition Group ]
```

Demo 至少支持字段：`TRB`、`Signed Product Count`、`Industry`、`Customer Segment`；操作符：`= / != / > / >= / < / <= / IN`。

### 5. Pricing Rules

一个 Activity 下可配置多条 Pricing Rule：

```text
Product / Service Group / Service / Fee Item（沿用 Price Book 的产品层级，支持在 Product / Service Group / Service / Fee Item 任一层级作用）
Benefit Type：Fixed Amount Discount / Percentage Discount / Rate Discount / Full Waiver / ECR Credit
Benefit Value（随 Benefit Type 联动显示）
```

不同 Benefit Type 的字段联动：

| Benefit Type | 需要填写的字段 |
|---|---|
| FIXED_AMOUNT | Amount、Currency、Unit（Per Transaction / Per Month / Per Account） |
| PERCENTAGE_DISCOUNT | Discount %（对标准价格打折） |
| RATE_DISCOUNT | Promotional Rate（同时展示 Standard Rate 供对比） |
| WAIVER | 无需填写数值，固定 100% 豁免 |
| ECR | ECR Reference、Reference Rate、Credit Spread、Maximum Credit |

表单需要包含合理 validation：Activity Code / Name / Effective Date 必填；Expiry Date 晚于 Effective Date；Customer Scope 为 SEGMENT / GROUP / CUSTOMER 时必须选择对应目标，为 BANK_WIDE 时不能填写目标；Institution Scope 同理；Trigger Condition 必须包含 Field、Operator、Value 三要素；Pricing Rule 必须包含 Product Scope、Benefit Type，并按 Benefit Type 联动校验对应字段。

---

## 八、Activity Detail

点击 View 时，打开 Drawer 展示完整活动信息，建议使用 ProDescriptions 分区展示：

```text
Activity Overview
────────────────────────────
Activity Code: ACT-2026-001
Activity Name: APAC Corporate Cash Management Promotion
Status: Published
Effective Period: 01 Sep 2026 → 31 Dec 2026
Customer Scope: SEGMENT / Corporate
Institution Scope: REGION / ASEAN

Trigger Conditions
────────────────────────────
TRB >= SGD 10,000,000
AND Signed Product Count >= 3
AND Industry = Manufacturing

Pricing Rules
────────────────────────────
Cash Management / Account Maintenance
Percentage Discount 20%
Standard: SGD 50 / month → Promotional: SGD 40 / month

Trade Finance / Import LC Fee
Rate Discount
Standard: 0.10% → Promotional: 0.08%
```

### Pricing Impact 预览

每条 Pricing Rule 详情中展示标准价格与活动优惠后价格的换算：

```text
Standard Price (from Price Book)
SGD 50 / month
        ↓
Activity Benefit: 20% Discount
        ↓
Promotional Price
SGD 40 / month
```

详情 Drawer 使用响应式宽面板（桌面最大约 1080px，移动端占视口 92%），避免产品路径、规则说明和 ECR 参数在窄列中被过度换行。触发条件按条件组卡片逐行展示：组内条件使用蓝色 `AND` 或紫色 `OR` 连接，组间连接使用橙色 `AND`，以区分两种逻辑层级。活动定价规则采用紧凑列表展示，列依次为产品/服务范围（包含规则说明）、优惠类型、`Standard Price`、`Activity Benefit` 和 `Promotional Price`；窄屏时列表保持横向滚动，确保每一列信息完整可读。优惠类型、优惠说明和计费单位必须使用国际化文案，不能直接显示枚举值或英文常量。

Demo 中基于 Mock 的 Price Book 标准价格数据计算即可，无需后端。

### Activity Lifecycle

```text
DRAFT ──Publish──▶ PUBLISHED ──Disable──▶ INACTIVE
```

在此基础上可结合 Effective From / To 展示辅助状态（`Upcoming` / `Running` / `Expired`），但底层 `status` 字段仍只保持 `DRAFT / PUBLISHED / INACTIVE` 三态。已发布活动不建议直接编辑关键业务条件，Demo 中可允许编辑但需在 UI 上保持状态语义清晰。

---

## 九、页面顶部增加区域概览

在列表上方增加统计卡片，例如：

```text
Total Activities
8

Draft
2

Published
5

Inactive
1
```

使用 StatisticCard 或项目已有统计组件，突出平台级配置能力。

---

## 十、与 Price Book / Pricing Rule / Billing 的业务关系

页面中需要通过 UI 体现 Activity Pricing 的业务意义：

> Activity Pricing 建立在 Price Book 标准定价之上，是 Pricing Rule 优先级体系和 Billing Calculation 的中间输入。

```text
Price Book（Standard Price）
        ↓
Activity Pricing（Customer Scope + Institution Scope + Trigger Conditions）
        ↓
Pricing Rule（Benefit Type + Benefit Value）
        ↓
Promotional Price
        ↓
Billing Calculation
        ↓
Invoice
```

Price Book 已经定义了 BASE / REGION / SEGMENT / GROUP 的标准价格解析模型，Activity Pricing 不重新定义这套解析层级，而是作为标准价格确定后的后续优惠层。可在页面加入简短说明区，使用 Steps / Card 实现，无需实现真实 Billing / Invoice 模块。

---

## 十一、Mock 数据与 API

暂时不要连接真实 API，请建立清晰的 Mock 数据结构：

```ts
interface PricingActivity {
  id: string;
  activityCode: string;
  activityName: string;
  status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  effectiveFrom: string;
  effectiveTo?: string;
  customerScope: 'BANK_WIDE' | 'SEGMENT' | 'GROUP' | 'CUSTOMER';
  customerSegment?: string;
  clientGroup?: string;
  customerIds?: string[];
  institutionScope: 'BANK_WIDE' | 'REGION' | 'BRANCH';
  institutionRegion?: string;
  branchIds?: string[];
  triggerConditions: ConditionGroup[];
  rules: ActivityPricingRule[];
  updatedBy: string;
  updatedAt: string;
}

interface ActivityPricingRule {
  id: string;
  product: string;
  serviceGroup?: string;
  service?: string;
  feeItem?: string;
  benefitType: 'FIXED_AMOUNT' | 'PERCENTAGE_DISCOUNT' | 'RATE_DISCOUNT' | 'WAIVER' | 'ECR';
  benefitValue?: number;
  currency?: string;
  standardRate?: number;
  promotionalRate?: number;
  ecrReference?: string;
  ecrRate?: number;
  ecrSpread?: number;
  description?: string;
}

interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: ActivityCondition[];
}

interface ActivityCondition {
  field: 'TRB' | 'PRODUCT_COUNT' | 'INDUSTRY' | 'SEGMENT';
  operator: 'EQ' | 'NE' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN';
  value: string | number | string[];
}
```

Mock 数据必须覆盖产品层、服务组层、服务层和收费项层四种规则范围。例如可在同一活动内分别使用 `Cash Management`、`Trade Finance / Documentary Trade`、`Trade Finance / Documentary Trade / Letter of Credit Issuance`，以及 `Cash Management / Account Services / Account Maintenance / Account Maintenance Fee`，以验证产品层级的逐级作用范围。

Mock API 建议：

```text
GET    /api/pricing/activities
POST   /api/pricing/activities
PUT    /api/pricing/activities/:id
GET    /api/pricing/activities/:id
PATCH  /api/pricing/activities/:id/status

POST   /api/pricing/activities/:id/rules
PUT    /api/pricing/activity-rules/:id
DELETE /api/pricing/activity-rules/:id
```

如果当前 Demo 的 Mock 层不需要拆分 Activity 和 Rule API，也可以通过 Activity 对象整体维护 `rules` 数组。如果项目已有统一 request / service / mock 机制，优先复用，不要新建另一套架构。

---

## 十二、技术要求

必须遵循当前项目已有技术栈和代码风格：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProForm
* ProDescriptions
* ProCard
* StatisticCard（若项目已有）
* Umi / 项目当前路由机制

不要引入新的 UI framework。不要修改无关页面。不要升级依赖。不要添加没有必要的第三方依赖。

---

## 十三、交互要求

至少实现：

### 查询

支持 Status、Customer Scope、Institution Scope、Keyword。

### 新增

Create Activity → Drawer（Overview + Customer Scope + Institution Scope + Trigger Conditions + Pricing Rules）→ Submit → Mock 新增 → 列表刷新。

### 编辑

Edit → Drawer → 自动填充当前数据 → Submit → Mock 更新 → 列表刷新。

### 查看

View → Detail Drawer，展示 Activity Overview、Trigger Conditions、Pricing Rules 和每条规则的 Pricing Impact 预览。

### 发布 / 停用

```text
Publish：DRAFT → PUBLISHED
Disable：PUBLISHED → INACTIVE
```

显示确认 Modal，确认后更新 Mock 状态。

---

## 十四、Demo 重点

这个页面不是为了展示“银行可以创建优惠活动”，而是为了向银行客户展示：

> **中央定价平台可以根据客户关系、客户属性、机构范围和业务条件，统一管理阶段性优惠政策，并将优惠规则透明地应用到 Price Book 标准价格和最终计费。**

Demo 应明确展示以下完整链路：

```text
Customer Eligibility（TRB / Product Count / Industry / Segment 是否满足触发条件）
        ↓
Activity（匹配到的活动）
        ↓
Pricing Rule（Benefit Type + Benefit Value）
        ↓
Promotional Price（相对 Price Book 标准价格的优惠结果）
        ↓
Billing Calculation
```

现实案例：客户 ABC Manufacturing 属于 Corporate Segment 及 APAC Strategic Accounts Group，在 Singapore Branch 交易，TRB 为 SGD 15M，签约 5 个产品，所属行业为制造业。系统判断该客户满足 `APAC Corporate Cash Management Promotion` 的触发条件（TRB ≥ 10M AND Product Count ≥ 3 AND Industry = Manufacturing），进而将 Account Maintenance 的 Price Book 标准价格 `SGD 50/month` 应用 `20% Discount` 后得到最终计费价格 `SGD 40/month`。

---

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构（`src/pages/pricing-billing/pricing/`）。
2. 检查现有 routes 配置方式（`config/routes.ts` 中 `Pricing Configuration` 节点）。
3. 检查现有菜单与 i18n key 组织方式。
4. 检查现有页面（如 Price Book、Pricing Rules）的 ProTable / ProForm 实现模式。
5. 检查现有 Mock 数据组织方式（`mock/` 与 `src/pages/**/_mock.ts`）。
6. 尽可能复用既有组件与 service 模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 新增
* 编辑
* 查看
* 发布 / 停用
* Pricing Impact 预览

完成后确保 TypeScript 编译无明显错误，页面可正常运行。

**不要实现真实后端对接、真实条件求值引擎或真实计费结算逻辑。当前目标是一个可用于客户演示的高质量 Demo。**
