你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户的定价、计费、税务规则和发票。

当前需要实现的是其中的：

> **Regional Adaptation & Compliance（区域适配与合规）**

重点展示系统如何针对不同 APAC（亚太）市场配置不同的税务规则，并让 Billing / Invoice 使用这些规则。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

> **与 Jurisdiction & Tax Definition（管辖区与税种定义，见 `16-regional-jurisdiction-tax.md`）的关系**：新增 Tax Rule 时，先从可查询的「Jurisdiction & Tax Definition」主数据列表中选择一条有效的管辖区与税种定义组合，再自动带出 Tax Authority、Currency、Tax Type、Tax Name、Tax Code 和默认 Rate。编辑既有 Tax Rule 时，该组合信息合并展示且不可修改，以确保规则始终关联原始主数据；如需使用另一组合，应新建 Tax Rule。Tax Rule 本身仍然保留 Applicability、Tax Treatment 和生效期等差异化配置，Rate 默认取自 Tax Definition，但允许在具体规则上覆盖。

---

## 二、本次需要实现的功能

请新增一个：

> **Tax Configuration（税务配置）**

页面。

页面用于管理不同国家 / 地区的税务规则。

需要体现以下业务概念：

* Jurisdiction（司法管辖区 / 国家）
* Tax Type（税种）
* Tax Rate（税率）
* Tax Applicability（适用条件）
* Tax Treatment（税务处理方式）
* Effective Date（生效日期）
* Status（启用 / 禁用）
* WHT（Withholding Tax，预扣税）
* VAT / GST 等间接税

注意：这是一个 Demo，不需要实现完整真实税法，只需要构造合理的业务模型和 Mock 数据来展示能力。

---

## 三、菜单和路由

请在现有 Ant Design Pro 菜单中新增：

```text
Regional Configuration
  └── Tax Configuration
```

建议路由：

```text
/pricing-billing/regional/tax
```

如果项目已有类似的菜单结构，请遵循项目现有的代码风格、路由结构和国际化方式，不要破坏已有功能。

菜单标题：

```text
Regional Configuration
Tax Configuration
```

如果项目已经使用 umi 的权限 / routes 配置，请按照项目现有方式配置。

---

## 四、页面总体结构

页面采用 Ant Design Pro 常见的：

> ProCard + ProTable + Modal / Drawer

布局。

整体页面：

```text
┌─────────────────────────────────────────────────────────────┐
│ Tax Configuration                                           │
│ Configure tax rules across APAC jurisdictions              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Jurisdiction ▼] [Tax Type ▼] [Status ▼] [Search]          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Tax Rules                                  [+ Add Tax Rule] │
│                                                             │
│ Jurisdiction │ Tax Type │ Product │ Rate │ Effective │ ... │
│ Singapore    │ GST      │ Cash... │ 9%   │ 2024-01-01│ ... │
│ Singapore    │ WHT      │ FX     │ 10%  │ 2026-01-01│ ... │
│ Hong Kong    │ VAT      │ ...    │ ...  │ ...       │ ... │
│ China        │ VAT      │ ...    │ ...  │ ...       │ ... │
└─────────────────────────────────────────────────────────────┘
```

页面需要有比较明显的 Enterprise / Banking 后台风格，简洁、专业，不要做成普通 Admin CRUD 的廉价视觉效果。

---

## 五、Mock 数据

至少准备以下 APAC 市场：

* Singapore
* Hong Kong
* China
* Japan
* Australia

Mock 数据需要体现不同国家有不同税务规则。

例如：

### Singapore

```text
GST
Rate: 9%
Tax Treatment: Tax Exclusive
Applicability: Taxable Banking Services
Effective Date: 2024-01-01
Status: Active
```

```text
WHT
Rate: 10%
Applicability: Cross-border Services
Effective Date: 2026-01-01
Status: Active
```

### Hong Kong

配置一些不同的规则，体现和 Singapore 不同。

### China

使用 VAT 作为主要税种。

### Japan

使用 Consumption Tax 作为主要税种。

### Australia

使用 GST 作为主要税种。

注意：Mock 数据只是为了展示 UI 和业务流程，不要声称这些数据代表完整或准确的现实税法。

---

## 六、列表字段

Tax Rule 列表至少包含：

1. Jurisdiction
2. Tax Type
3. Tax Name
4. Product / Service
5. Applicability
6. Rate
7. Tax Treatment
8. Effective From
9. Effective To
10. Status
11. Updated By
12. Updated At
13. Actions

Tax Type 和 Tax Name 列应分别预留较宽的固定列宽（建议至少 190px 和 260px）。内容超出列宽时使用省略号截断，鼠标悬停时通过 Tooltip 展示完整内容，避免影响表格横向扫描效率。

Actions：

```text
View
Edit
Disable / Enable
```

可以使用 Dropdown / MoreOutlined。

---

## 七、新增 / 编辑 Tax Rule

点击：

> Add Tax Rule

从页面右侧打开 Drawer，而不是跳转新页面。

Drawer 中按照业务逻辑分组。新增和编辑共用右侧 Drawer，但主数据关联的交互不同；当内容超过视口高度时，Drawer 正文区域可纵向滚动，底部操作按钮保持可见。

Drawer 宽度建议约 `760px`，表单卡片填满可用正文宽度。「Jurisdiction & Tax Definition」分组内，Jurisdiction、Tax Authority、Currency、Tax Type、Tax Name、Tax Code、Default Rate 均以只读的 Descriptions（两列）展示，而非表单输入框；仅 Rate 是可编辑字段，单独占一行。Applicability、Tax Treatment 和 Effective Period 维持两列并排，Status 使用较窄的单列；窄屏下所有字段自动堆叠为单列。

### 1. Jurisdiction & Tax Definition

#### 新增时：选择主数据组合

在本分组最上方提供一个可查询的「Jurisdiction & Tax Definition」列表，而不是两个级联下拉框。列表的每一行代表一个可用的 Tax Definition 及其所属 Jurisdiction，支持单选；仅展示 Jurisdiction 和 Tax Definition 均为 `ACTIVE` 的组合。

列表至少包含：

```text
Jurisdiction
Tax Authority
Currency
Tax Type
Tax Name
Tax Code
Default Rate
```

在 Drawer 内，主数据列表使用紧凑的固定列宽。Jurisdiction、Tax Authority、Tax Type 和 Tax Name 等长文本列在超过列宽时省略显示；列表保留横向滚动（建议最小宽度约 `860px`），以便用户按需查看 Tax Code 和 Default Rate 等完整列，而不会压缩字段内容。

支持按以下条件查询：

```text
Jurisdiction
Tax Type
Keyword（匹配 Tax Name / Tax Code）
```

用户选中一行后，该行信息以隐藏表单字段回填（用于提交），并在列表下方以只读 Descriptions（两列布局）展示：

```text
Jurisdiction（加粗）              Currency
Tax Authority（跨两列）
Tax Type（彩色 Tag）              Tax Name
Tax Code（等宽字体）              Default Rate（百分比）
```

Rate 单独一行，默认取自 Tax Definition 的 Default Rate，可在本条 Tax Rule 上覆盖。

未选中主数据组合前不能提交表单；选中后应回填 Tax Rule 的 `jurisdiction`、`taxAuthority`、`currency`、`taxType`、`taxName`、`taxCode`、`defaultRate` 和 `rate`。

#### 编辑时：锁定主数据组合

编辑既有 Tax Rule 时，不展示主数据选择列表，改为展示一段说明文字，提示「司法管辖区与税务定义关联在创建后不可修改，如需变更请新建税务规则」。其下方展示与新增时相同的只读 Descriptions 区域（Jurisdiction、Tax Authority、Currency、Tax Type、Tax Name、Tax Code、Default Rate），保持新增与编辑两种模式下的展示效果一致。该区域所有字段均不可修改，不允许通过编辑操作变更既有 Tax Rule 的管辖区或税种定义关联；Rate 仍是 Tax Rule 级别的可覆盖字段，保留可编辑能力。

Tax Type 示例：

```text
GST
VAT
WHT
Consumption Tax
Other
```

### 2. Applicability

```text
Product / Service
Applicability Description
```

例如：

```text
Product:
Cash Management

Applicability Description:
Taxable Banking Services
```

### 3. Tax Treatment

```text
Taxable
Tax Exempt
Zero Rated
Out of Scope
```

以及：

```text
Tax Inclusive
Tax Exclusive
```

### 4. Effective Period

```text
Effective From
Effective To
```

### 5. Status

```text
Active
Inactive
```

表单需要合理的 validation。

---

## 八、Tax Rule Detail

点击 View 时，可以打开一个 Drawer 展示完整规则。

建议使用：

> ProDescriptions

展示：

```text
Tax Rule Details

Jurisdiction
Singapore

Tax Type
GST

Tax Name
Goods and Services Tax

Tax Code
SG-GST

Rate
9%

Applicability
Taxable Banking Services

Tax Treatment
Tax Exclusive

Effective From
2024-01-01

Status
Active
```

下面增加一个：

### Tax Calculation Preview

这是 Demo 中比较重要的功能。

例如：

```text
Tax Calculation Preview

Billing Amount
SGD 10,000

Tax Type
GST

Tax Rate
9%

Tax Amount
SGD 900

Invoice Total
SGD 10,900
```

使用 ProCard / Statistic / Descriptions 等组件展示。

不需要真正调用后端，使用前端 Mock 计算即可。

---

## 九、页面顶部增加一个区域概览

在 Tax Rule 列表上方增加一些统计卡片：

```text
APAC Jurisdictions
5

Active Tax Rules
18

GST / VAT Rules
12

WHT Rules
6
```

使用：

> StatisticCard

或者项目已有的统计组件。

这样页面更像一个真正的银行 Enterprise Platform，而不是单纯 CRUD。

---

## 十、与 Invoice 的业务关系

页面中需要通过 UI 体现 Tax Configuration 的业务意义：

> Tax Configuration 决定 Billing 时如何进行 Tax Determination，Invoice 使用 Tax Determination 的结果生成对应国家的 Invoice。

可以在 Tax Configuration 页面中加入一个简短的说明区域：

```text
Tax Configuration Flow

Billing
   ↓
Tax Determination
   ↓
Tax Rule
   ↓
Tax Calculation
   ↓
Invoice
```

可以使用 Steps / Card / 简单的视觉流程实现。

不要实现真正的 Invoice 模块，本次只需要让用户理解：

> Tax Rule 是 Billing / Invoice 的输入规则。

---

## 十一、Mock 数据与 API

暂时不要连接真实 API。

请建立清晰的 Mock 数据结构，例如：

```ts
interface TaxRule {
  id: string;
  jurisdiction: string;
  taxType: string;
  taxName: string;
  taxCode: string;
  productService: string;
  applicability: string;
  rate: number;
  taxTreatment: string;
  calculationMethod: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE';
  updatedBy: string;
  updatedAt: string;
}
```

Mock 数据可以放在项目已有的 mock 目录 / mock service 中。

新增 Tax Rule 时，右侧 Drawer 顶部的「Jurisdiction & Tax Definition」查询列表应读取 `mock/jurisdictionTax.ts`（`JurisdictionTaxNode`，见 `16-regional-jurisdiction-tax.md`）暴露的 `/api/regional/jurisdiction-tax/nodes` 数据：先获取 `nodeType=JURISDICTION` 且 `status=ACTIVE` 的 Jurisdiction 节点，再获取其下 `nodeType=TAX_DEFINITION`、`status=ACTIVE` 的 Tax Definition 节点，并组合为列表行。列表查询条件为 Jurisdiction、Tax Type 和 Keyword（Tax Name / Tax Code）。选中一行后，把 Tax Definition 的 `taxType`、`name`（Tax Name）、`code`（Tax Code）和 `defaultRate` 回填到 Tax Rule 表单，`jurisdiction` 字段回填 Jurisdiction 的 `name`，Currency 和 Tax Authority 回填 Jurisdiction 的 `defaultCurrency` 和 `taxAuthority`（仅用于展示，不在 `TaxRule` 中新增字段）。编辑 Tax Rule 时不加载或展示此选择列表，直接依据既有规则信息及对应主数据显示锁定的组合区域。`mock/taxConfig.ts` 中的 `TaxRule` 数据结构保持不变，两个 Mock 数据源之间不做写入同步，仅在新增表单填充时单向读取。

如果项目已有统一的 request / service / mock 机制，优先复用，不要新建另一套架构。

---

## 十二、技术要求

必须遵循当前项目已有的技术栈和代码风格：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProForm
* ProDescriptions
* ProCard
* StatisticCard（如果项目已有）
* Umi / 项目当前使用的路由机制

不要引入新的 UI framework。

不要修改现有无关页面。

不要升级依赖。

不要添加没有必要的第三方依赖。

---

## 十三、交互要求

至少实现：

### 查询

支持：

```text
Jurisdiction
Tax Type
Status
Keyword
```

### 新增

Add Tax Rule → 右侧 Drawer → Submit → Mock 新增 → 列表刷新。

### 编辑

Edit → 右侧 Drawer → 自动填充当前数据，并以只读的合并区域展示 Jurisdiction & Tax Definition → 修改规则级差异化配置 → Submit → Mock 更新 → 列表刷新。编辑时不得修改 Jurisdiction、Tax Type、Tax Name 或 Tax Code。

### 查看

View → Detail Drawer。

### 启用 / 禁用

点击 Action：

```text
Disable Rule
```

显示确认 Modal。

确认后更新 Mock 数据状态。

---

## 十四、Demo 重点

这个页面不是为了展示“税务 CRUD”，而是为了向银行客户展示：

> **同一个中央平台可以管理不同 APAC 市场的税务规则。**

因此 UI 上需要突出：

```text
Centralized Tax Configuration
        ↓
Multiple APAC Jurisdictions
        ↓
Country-specific Tax Rules
        ↓
Billing Tax Determination
        ↓
Compliant Invoice
```

请让页面具有明显的“Centralized Platform / Regional Compliance”产品感觉。

---

## 国际化要求（仅中文 / English）

- 本页面仅支持 `zh-CN` 和 `en-US` 两种语言，不新增或要求其他语言包。
- 所有 UI 文案，包括税种、税务处理、计算方式、状态、表格列、表单字段、按钮、预览、校验和提示，必须使用 i18n key，不得硬编码中文或英文。
- 新增文案统一维护在 `src/locales/zh-CN/pages.ts`、`src/locales/en-US/pages.ts` 和对应的 `menu.ts` 中，使用 `pages.regional.tax.*` 与菜单专属 key。
- Jurisdiction、税率、币种代码和 Mock 税务规则可以保留标准值；税种、处理方式和状态的展示名称必须国际化。
- 切换 `zh-CN` / `en-US` 后，税务列表、编辑 Drawer、计算预览、详情和确认操作都必须显示对应语言。

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目的目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有页面使用的 ProTable / ProForm 模式。
5. 检查现有 Mock 数据组织方式。
6. 尽可能复用已有组件和代码模式。

然后实现：

* 页面
* 路由
* 菜单
* Mock 数据
* 查询
* 新增
* 编辑
* 查看
* 启用 / 禁用
* Tax Calculation Preview

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实税务计算、真实税法规则、真实后端 API 或真实 Invoice 生成。当前目标是一个可用于客户演示的高质量 Demo。**
