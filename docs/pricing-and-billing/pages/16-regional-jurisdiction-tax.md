你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户的产品定价、协议条款、计费、发票和区域合规配置。

当前需要实现的是其中的：

> **Jurisdiction & Tax Definition（管辖区与税种定义）**

页面定位与 **Product & Service Catalog（产品与服务目录，见 `00-product-service-catalog.md`）** 对 **Price Book（价格手册，见 `02-pricing-price-book.md`）** 的关系类似：

```text
Jurisdiction & Tax Definition          Product & Service Catalog
        ↓ 提供主数据                          ↓ 提供主数据
Tax Configuration（税务规则）           Price Book（标准价格）
```

现有 **Tax Configuration（`13-regional-tax.md` / `13-regional-tax-ext.md`）** 页面把「管辖区」「税种定义」「适用条件（Applicability）」「税务处理方式（Tax Treatment）」和「税率」全部揉合在同一条 `TaxRule` 记录里，导致同一个国家、同一个税种的基础信息（税务机关、币种、税种名称、税码、默认税率）会在多条规则中重复维护。

本页面把其中偏「主数据」性质的两层信息拆分出来，作为 Tax Configuration 的上游输入：

1. **Jurisdiction（管辖区）**：国家 / 地区、税务机关、默认币种等区域级主数据。
2. **Tax Definition（税种定义）**：某个管辖区下可用的税种、税种名称、税码和默认税率，供 Tax Configuration 在配置具体规则时选择，而不是每条规则都手工重新输入。

`Applicability`（产品、客户类型、服务地点等适用条件）、`Tax Treatment`（Tax Exclusive / Inclusive / Exempt 等）以及按规则生效期管理的能力，**仍然保留在现有 Tax Configuration 页面**，不在本页面中处理。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

> **重要约束**：本文档只新增设计说明，**不修改**现有 `13-regional-tax.md`、`13-regional-tax-ext.md` 文档，也不修改现有 `src/pages/pricing-billing/regional/tax` 页面、`mock/taxConfig.ts` 或其 i18n key。新页面第一阶段是独立的主数据管理页面，与现有 Tax Configuration 的数据尚不互通；后续若要打通，应在现有 Tax Configuration 增加对本页面数据的引用（下拉选择 Jurisdiction / Tax Definition），而不是反向改动本页面。

---

## 二、本次需要实现的功能

请新增一个：

> **Jurisdiction & Tax Definition（管辖区与税种定义）**

页面，管理以下两层业务对象：

* Jurisdiction（管辖区）：国家 / 地区、税务机关（Tax Authority）、默认币种（Default Currency）、状态。
* Tax Definition（税种定义）：归属于某个 Jurisdiction，包含 Tax Type、Tax Name、Tax Code、Default Rate、Default Tax Treatment、生效区间和状态。

需要体现以下业务概念：

* Jurisdiction（管辖区 / 国家）
* Tax Authority（税务机关）
* Default Currency（默认币种）
* Tax Type（税种：GST / VAT / WHT / Consumption Tax / Other）
* Tax Code（税码）
* Default Rate（默认税率）
* Default Tax Treatment（默认税务处理方式：Tax Exclusive / Tax Inclusive / Tax Exempt / Zero Rated / Input Taxed / Out of Scope）
* Effective Period（生效区间）
* Status（Draft / Active / Inactive）

注意：这是一个 Demo，不需要构造真实银行全部税务主数据体系，只需要通过合理的数据模型与交互体现「管辖区 → 税种定义」两层主数据治理能力，并解释与现有 Tax Configuration 的分工。

---

## 三、菜单和路由

请在现有 **Regional Configuration** 菜单下新增一个平级页面：

```text
Regional Configuration
  ├── Tax Configuration        （现有，不改动）
  └── Jurisdiction & Tax Definition   （本次新增）
```

建议路由：

```text
/pricing-billing/regional/jurisdiction-tax
```

建议组件路径：

```text
src/pages/pricing-billing/regional/jurisdiction-tax/index.tsx
```

菜单标题建议：

```text
Jurisdiction & Tax Definition
管辖区与税种定义
```

菜单 i18n key 建议使用 `menu.regional.jurisdiction-tax`，与现有 `menu.regional.tax` 平级，遵循项目现有 `config/routes.ts` 中 `regional` 子路由的组织方式（`redirect` + 子路由数组）。

---

## 四、页面总体结构

页面主体布局参考 **Product & Service Catalog** 的单一可展开 `ProTable` 思路（而不是 Price Book 的多 Tab 目标选择器），因为 Jurisdiction → Tax Definition 是两层主数据层级关系，不是「基础价格 + 覆盖维度」的定价解析模型：

> PageContainer + StatisticCard + ProTable（可展开两层层级）+ Drawer / Modal

页面示意：

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Jurisdiction & Tax Definition                                         │
│ Shared jurisdiction and tax definition master data for Tax Configuration │
├──────────────────────────────────────────────────────────────────────┤
│ [Jurisdictions] [Active Tax Definitions] [Tax Types] [Markets Covered]│
├──────────────────────────────────────────────────────────────────────┤
│ [Search] [Status ▼] [Tax Type ▼]              [+ Add Jurisdiction]    │
├──────────────────────────────────────────────────────────────────────┤
│ Name                     │ Code       │ Status │ Rate │ ... │ Actions │
│ ▼ 🌐 Singapore           │ SG         │ ACTIVE │ —    │ ... │ ⋯       │
│     🧾 GST               │ SG-GST     │ ACTIVE │ 9%   │ ... │ ⋯       │
│     🧾 WHT               │ SG-WHT     │ ACTIVE │ 10%  │ ... │ ⋯       │
│ ▶ 🌐 Hong Kong           │ HK         │ ACTIVE │ —    │ ... │ ⋯       │
└──────────────────────────────────────────────────────────────────────┘
```

布局要求（与 Catalog 页面保持一致的实现细节，避免风格割裂）：

- 主体为单一 `ProTable`，通过行展开呈现 Jurisdiction → Tax Definition 两层混合层级；`Name` 列使用图标 + 字重区分层级（Jurisdiction 加粗 + 地球图标，Tax Definition 常规字重 + 税务图标），`Code` 拆分为独立一列展示，`Node Type`（`JURISDICTION` / `TAX_DEFINITION`）默认在表格中隐藏（`hideInTable`），仅作为筛选条件保留
- Tax Definition 是层级中的叶子节点，不提供 `Add Child` 入口；叶子行不显示空的展开箭头占位
- 每一行 Actions 统一收纳到 `MoreOutlined` 下拉菜单中，包含 `View` / `Edit` / `Add Child`（仅 Jurisdiction 行）/ `Enable` / `Disable`
- 点击 `View` 打开详情 Drawer；点击 `Edit` 或 `Add Child` 打开新增/编辑表单 Drawer；提交或关闭后返回同一张表格
- 顶部展示 `StatisticCard`：Jurisdictions（管辖区数）、Active Tax Definitions（启用中的税种定义数）、Tax Types（税种类型覆盖数）、Markets Covered（覆盖的 APAC 国家数）
- 支持较宽的 `Supported Currencies` / `Default Currency` 展示，超出宽度使用省略号 + `Tooltip` 展示完整内容（沿用 Catalog 列表的处理方式）

---

## 五、Mock 数据

至少覆盖以下 APAC 管辖区（与 Tax Configuration、Price Book、Catalog 现有 Mock 数据保持市场口径一致）：

* Singapore
* Hong Kong
* China
* Japan
* Australia

每个 Jurisdiction 至少包含 2～3 个 Tax Definition，体现不同税种、税率和默认税务处理方式的差异。建议至少 5 个 Jurisdiction × 平均 2.5 个 Tax Definition（12 条以上）。

示例：

### Singapore

```text
Jurisdiction: Singapore
Tax Authority: Inland Revenue Authority of Singapore (IRAS)
Default Currency: SGD
Status: ACTIVE
```

```text
Tax Definition: GST
Tax Code: SG-GST
Default Rate: 9%
Default Tax Treatment: Tax Exclusive
Status: ACTIVE
```

```text
Tax Definition: WHT
Tax Code: SG-WHT
Default Rate: 10%
Default Tax Treatment: Tax Exclusive
Status: ACTIVE
```

### Hong Kong

以 WHT 和 Exempt 场景为主，体现和 Singapore 不同的税务机关和默认税率。

### China

以 VAT 为主要税种，默认币种 CNY。

### Japan

以 Consumption Tax 为主要税种，默认币种 JPY。

### Australia

以 GST 和 Input Taxed 场景为主，默认币种 AUD。

注意：Mock 数据仅用于演示 UI 和业务流程，不代表真实或完整银行税务政策，也不要求与现有 `mock/taxConfig.ts` 中的规则一一对应。

---

## 六、列表字段

列表以「管辖区 / 税种定义」两层主数据为中心，至少包含：

1. Name（Jurisdiction 名称 或 Tax Definition 名称）
2. Code（Jurisdiction Code 或 Tax Code）
3. Node Type（`JURISDICTION` / `TAX_DEFINITION`，默认隐藏，仅用于筛选）
4. Default Rate（仅 Tax Definition 展示，Jurisdiction 行留空）
5. Default Tax Treatment（仅 Tax Definition 展示）
6. Default Currency（仅 Jurisdiction 展示）
7. Status
8. Updated By
9. Updated At
10. Actions

列表中**不展示** Applicability（Product / Customer Type / Service Location 等）和具体的生效期区间；这些字段仍由现有 Tax Configuration 的 Tax Rule 承载。完整信息在 View 详情 Drawer 中查看。

支持按 Jurisdiction、Tax Type、Status 和 Keyword 查询；Keyword 搜索范围覆盖 Jurisdiction / Tax Definition 的 Code、Name 和 Description。

Actions：

```text
View
Edit
Add Child（仅 Jurisdiction 行）
Enable / Disable
```

使用 Dropdown / MoreOutlined，与 Catalog 页面的 Actions 交互保持一致。

---

## 七、新增 / 编辑

点击：

> Add Jurisdiction（页面右上角，默认新增根级 Jurisdiction）

或点击 Jurisdiction 行 Actions 中的：

> Add Child（新增其下的 Tax Definition）

打开 Drawer，而不是跳转新页面。节点类型由挂载位置自动推导，不需要手动选择：

```text
挂载位置（父节点）        自动新增的节点类型
根节点（无父节点）          Jurisdiction
Jurisdiction               Tax Definition
```

Tax Definition 是最底层节点，不提供 `Add Child` 入口。

### Jurisdiction 字段

```text
Jurisdiction Code
Jurisdiction Name
Tax Authority
Default Currency
Description
Status
Effective From
Effective To
```

### Tax Definition 字段

```text
Parent Jurisdiction（只读，锁定挂载位置）
Tax Code
Tax Name
Tax Type（GST / VAT / WHT / Consumption Tax / Other）
Default Rate
Default Tax Treatment（Tax Exclusive / Tax Inclusive / Tax Exempt / Zero Rated / Input Taxed / Out of Scope）
Description
Status
Effective From
Effective To
```

表单需要包含合理 validation：

- Code 必填，且在同一层级内唯一
- Name、Tax Type、Default Rate、Default Tax Treatment 必填
- Effective From 必须早于 Effective To
- Default Rate 必须为 0～100 之间的数值
- ACTIVE 的 Tax Definition 必须挂载在 ACTIVE 的 Jurisdiction 下
- 不允许创建孤立的 Tax Definition（必须先有 Jurisdiction）

编辑已有记录时，Drawer 应锁定节点类型和父级 Jurisdiction，不支持将 Tax Definition 移动到其他 Jurisdiction 下；如需迁移应单独设计流程，不在本 Demo 中实现。

---

## 八、详情 Drawer

点击 View 打开详情 Drawer，使用 `ProDescriptions` 展示完整信息，并按 Jurisdiction / Tax Definition 分别设计展示内容。

### Jurisdiction 详情示例

```text
Jurisdiction Details

Code
SG

Name
Singapore

Tax Authority
Inland Revenue Authority of Singapore (IRAS)

Default Currency
SGD

Status
ACTIVE

Tax Definitions
2 (GST, WHT)
```

### Tax Definition 详情示例

```text
Tax Definition Details

Parent Jurisdiction
Singapore

Tax Code
SG-GST

Tax Name
Goods and Services Tax

Tax Type
GST

Default Rate
9%

Default Tax Treatment
Tax Exclusive

Status
ACTIVE

Effective From
2024-01-01
```

详情 Drawer 可增加一个 **Referenced by Tax Configuration** 区域（Demo 展示用，基于 Mock 数据估算），说明该 Jurisdiction / Tax Definition 预计会被多少条 Tax Rule 引用，用于体现「主数据 → 下游规则」的治理关系，例如：

```text
Referenced Tax Rules（Demo Estimate）
3
```

---

## 九、页面顶部区域概览

在列表上方增加统计卡片，例如：

```text
Jurisdictions
5

Active Tax Definitions
11

Tax Types
5

Markets Covered
5
```

使用 `StatisticCard`，与 Catalog、Price Book 页面保持一致的视觉语言。

---

## 十、与 Tax Configuration 的业务关系

页面中需要通过 UI 体现本页面的业务意义：

> Jurisdiction & Tax Definition 是 Tax Configuration（Tax Rule）的主数据输入，Tax Configuration 在此基础上叠加 Applicability 和 Tax Treatment 差异化配置。

可在页面加入简短说明区（Steps / Card）：

```text
Jurisdiction & Tax Definition
        ↓
Tax Configuration（Applicability + Treatment + Rate Override）
        ↓
Billing Calculation
        ↓
Invoice
```

本次无需把现有 Tax Configuration 页面改为消费本页面数据，重点是让用户理解两者的上下游关系；后续阶段可以在 Tax Configuration 的新增 / 编辑表单中，把目前手工输入的 Jurisdiction / Tax Authority / Currency / Tax Type / Tax Name / Tax Code 替换为对本页面数据的下拉选择。

---

## 十一、Mock 数据与数据模型

暂时不连接真实 API，使用前端 Mock 数据，且与现有 `mock/taxConfig.ts` **相互独立**（新建单独的 Mock 文件，例如 `mock/jurisdictionTax.ts`），不修改现有 Mock。

建议类型（数据结构与 Catalog 的两层节点模型保持一致的设计思路：单一节点类型 + `parentId` 表达层级）：

```ts
type JurisdictionTaxNodeType = 'JURISDICTION' | 'TAX_DEFINITION';

type JurisdictionTaxStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

type TaxTreatment =
  | 'TAX_EXCLUSIVE'
  | 'TAX_INCLUSIVE'
  | 'TAX_EXEMPT'
  | 'ZERO_RATED'
  | 'INPUT_TAXED'
  | 'OUT_OF_SCOPE';

interface JurisdictionTaxNode {
  id: string;
  code: string;
  name: string;
  nodeType: JurisdictionTaxNodeType;
  parentId?: string;
  description?: string;
  status: JurisdictionTaxStatus;
  // Jurisdiction-only fields
  taxAuthority?: string;
  defaultCurrency?: string;
  // Tax Definition-only fields
  taxType?: string; // 'GST' | 'VAT' | 'WHT' | 'Consumption Tax' | 'Other'
  defaultRate?: number;
  defaultTaxTreatment?: TaxTreatment;
  effectiveFrom: string;
  effectiveTo?: string;
  updatedBy: string;
  updatedAt: string;
}
```

建议数据至少包括：

- 5 个 Jurisdiction（Singapore / Hong Kong / China / Japan / Australia）
- 每个 Jurisdiction 至少 2 个 Tax Definition
- 覆盖 GST、VAT、WHT、Consumption Tax 等主要税种
- 至少 1 条 DRAFT 状态的 Jurisdiction 或 Tax Definition，用于演示状态治理

---

## 十二、Mock API

优先复用项目现有 Mock 机制（Express 风格 handler + `mock/` 目录注册），不连接真实后端，接口与现有 `taxConfig.ts` 的 API 路径区分开：

```text
GET    /api/regional/jurisdiction-tax/nodes
POST   /api/regional/jurisdiction-tax/nodes
GET    /api/regional/jurisdiction-tax/nodes/:id
PUT    /api/regional/jurisdiction-tax/nodes/:id
PATCH  /api/regional/jurisdiction-tax/nodes/:id/status
```

查询参数：

```ts
interface JurisdictionTaxQuery {
  nodeType?: JurisdictionTaxNodeType;
  parentId?: string;
  status?: JurisdictionTaxStatus;
  taxType?: string;
  keyword?: string;
}
```

---

## 十三、技术要求

必须遵循当前项目已有技术栈和代码风格：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProForm
* ProDescriptions
* ProCard
* StatisticCard
* Umi / 项目当前路由机制

不要引入新的 UI framework。

不要修改无关页面，尤其是现有 `src/pages/pricing-billing/regional/tax/index.tsx`、`mock/taxConfig.ts`、`13-regional-tax.md`、`13-regional-tax-ext.md`。

不要升级依赖。

不要添加没有必要的第三方依赖。

---

## 十四、交互要求

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

Add Jurisdiction（根级）/ Add Child（Tax Definition）→ Drawer → Submit → Mock 新增 → 列表刷新。

### 编辑

Edit → Drawer → 自动填充当前数据 → Submit → Mock 更新 → 列表刷新。

### 查看

View → Detail Drawer。

### 启用 / 禁用

点击 Action：

```text
Disable / Enable
```

显示确认 Modal，确认后更新 Mock 状态；停用 Jurisdiction 前提示其下的 ACTIVE Tax Definition 数量。

---

## 国际化要求（仅中文 / English）

- 本页面仅支持 `zh-CN` 和 `en-US` 两种语言，不新增或要求其他语言包。
- 所有 UI 文案，包括标题、菜单、按钮、字段、枚举、状态、空态、校验和确认提示，必须通过 `useIntl().formatMessage` 或 `<FormattedMessage />` 展示，不得硬编码中文或英文。
- 新增文案统一维护在 `src/locales/zh-CN/pages.ts`、`src/locales/en-US/pages.ts` 和对应的 `menu.ts` 中，使用 `pages.regional.jurisdictionTax.*` 与菜单专属 key，不与现有 `pages.regional.tax.*` 混用。
- 切换 `zh-CN` / `en-US` 后，列表、筛选器、详情 Drawer、编辑 Drawer 和确认提示都必须显示对应语言。

## 十五、实现要求

在开始修改代码之前：

1. 先检查现有 `src/pages/pricing-billing/catalog/index.tsx` 的两/三层可展开 `ProTable` 实现模式（本页面的层级交互应与其保持一致）。
2. 检查现有 `config/routes.ts` 中 `regional` 子路由的组织方式。
3. 检查现有菜单与 i18n key 组织方式（`menu.regional.tax` 的写法）。
4. 检查现有 `mock/taxConfig.ts` 和 `mock/catalog.ts` 的 Mock 数据组织方式，新建独立的 `mock/jurisdictionTax.ts`。
5. 确认本次改动不触碰现有 Tax Configuration 页面、Mock 和文档。

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

完成后确保 TypeScript 编译无明显错误，页面可正常运行。

**不要实现真实后端对接、真实税务计算或真实合规校验逻辑。当前目标是一个可用于客户演示的高质量 Demo。**
