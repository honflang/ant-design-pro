# 00 — 产品与服务目录 Product & Service Catalog

**路由**：`/pricing-billing/catalog`  
**组件路径**：`src/pages/pricing-billing/catalog/index.tsx`  
**菜单 i18n key**：`menu.catalog`  
**所属模块**：平台基础主数据

---

## 一、业务背景

Wholesale Banking Pricing & Billing System 中的产品和服务会被多个业务模块共同引用。目前 Product、Service Group 和 Service 信息容易分散在 Price Book、Activity Pricing、Tax Configuration、Billing 和 Reports 页面中，导致产品名称、服务层级和可用状态难以统一治理。

因此需要建立一个统一的 **Product & Service Catalog（产品与服务目录）**，作为产品、服务组和服务的单一事实来源。

```text
Product & Service Catalog
        ↓
Price Book
        ↓
Pricing Rules / Activity Pricing
        ↓
Billing Calculation
        ↓
Invoice
```

本页面定义的是“系统有哪些可销售、可定价、可计费的业务对象”，不负责维护标准价格、折扣、促销或最终计费金额。

---

## 二、页面目标

页面需要为以下模块提供统一的目录选择项：

- Price Book：选择 Product、Service Group 和 Service
- Pricing Rules：关联可定价的产品或服务
- Activity Pricing：配置产品优惠范围
- Billing Configuration：配置可计费产品和服务
- Tax Configuration：关联税务分类
- Pricing Simulation：选择待模拟的产品和服务
- Reports：按产品和服务进行统计分析

重点体现：

- 集中式产品治理
- 清晰的产品到服务层级
- 产品和服务生命周期管理
- Pricing Enabled / Billing Enabled 能力控制
- APAC 多市场与多币种支持
- 下游模块统一消费目录数据

---

## 三、菜单和路由

产品目录应与现有 Pricing Configuration 平级，不放在 Price Book 下面。Price Book 只管理标准价格，而产品目录还会被 Billing、Tax、Reports 和 Simulation 使用。

建议菜单结构：

```text
Product & Service Catalog
  └── Product & Service Hierarchy

Pricing Configuration
  ├── Price Book
  ├── Activity Pricing
  ├── Pricing Rules
  ├── Pricing Simulation
  └── Approval Center
```

建议配置：

```ts
{
  path: '/pricing-billing/catalog',
  name: 'catalog',
  icon: 'appstore',
  component: './pricing-billing/catalog',
}
```

访问 `/pricing-billing/catalog` 后直接进入统一目录管理页面，不再额外拆分为 Products 和 Services 多个菜单页面。

菜单标题建议：

```text
Product & Service Catalog
Product & Service Hierarchy
```

中文建议：

```text
产品与服务目录
产品服务层级
```

---

## 四、页面总体结构

页面主体布局与 Price Book（价格手册）保持一致的设计语言：使用单一的 `ProTable` 作为唯一主体列表，通过表格行展开（expandable row）呈现 Product / Service Group / Service 三层混合层级，不再拆分为 Products / Services 等独立分栏页面，也**不采用左右各占一半、左侧目录树 + 右侧详情面板的分栏布局**。查看详情、新增和编辑均通过传统弹窗（Modal / Drawer）完成，弹窗关闭后返回同一张表格。

页面采用：

> PageContainer + StatisticCard + ProTable（可展开层级表格）+ Drawer / Modal

页面示意：

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Product & Service Catalog                                             │
│ Centralized product and service hierarchy                            │
├──────────────────────────────────────────────────────────────────────┤
│ [Products] [Active Services] [Services] [Markets] [Billable Items]   │
├──────────────────────────────────────────────────────────────────────┤
│ [Search catalog] [Status ▼] [Market ▼] [Type ▼] [Pricing ▼]           │
│                                          [+ Add Catalog Item]         │
├──────────────────────────────────────────────────────────────────────┤
│ Name                        │ Code       │ Status │ ... │ Markets │⋯ │
│ ▼ 📦 Cash Management         │ CASH-MGMT  │ ACTIVE │ ... │ SG,HK…  │⋯ │
│   ▼ 🔗 Account Services       │ CASH-ACCT  │ ACTIVE │ ... │ SG,HK…  │⋯ │
│     🔧 Account Maintenance    │ ACCT-MAINT │ ACTIVE │ ... │ SG,HK…  │⋯ │
│ ▶ 📦 Trade Finance            │ TRADE-FIN  │ ACTIVE │ ... │ SG,HK…  │⋯ │
└──────────────────────────────────────────────────────────────────────┘
```

布局要求：

- 主体为单一 `ProTable`，通过行展开呈现 Product / Service Group / Service 三层混合层级；`Name` 列使用图标区分层级（Product / Service Group / Service 各有独立图标），Product 与 Service Group 名称加粗，Service 为常规字重，整体呈现类似手册目录的层层展开结构，但始终以表格形式占满主区域，不拆分左右分栏。叶子节点（Service）不带空的展开箭头占位
- `Code` 从 `Name` 列中拆分为独立一列展示，避免名称列信息过载；`Node Type` 列默认在表格中隐藏（`hideInTable`），仅作为搜索筛选项保留，层级信息已通过 `Name` 列的图标与字重区分，无需重复展示列
- `Supported Markets` 列超出宽度时使用省略号截断，鼠标悬浮通过 `Tooltip` 展示完整市场列表
- 每一行的 Actions 统一收纳到 `MoreOutlined` 下拉菜单中，包含 `View` / `Edit` / `Add Child` / `Enable` / `Disable`（不再单独展示 `View` 按钮）；`Add Child` 仅对非叶子节点（Product / Service Group）展示，用于在该行下直接新增下一层级子节点
- 点击 `View` 打开详情弹窗（Drawer / Modal），展示选中节点的详情和使用情况；点击 `Edit` 或 `Add Child` 打开新增/编辑表单弹窗；弹窗提交或关闭后回到同一张表格，不常驻右侧详情面板、不跳转新页面
- 顶部展示平台级目录统计（StatisticCard）
- 顶部筛选器与右上角 `Add Catalog Item` 用于从根级新增 Product；行内 `Add Child` 用于在该节点下新增子级
- 搜索后自动展开命中节点的父级路径（表格行展开状态联动）

---

## 五、产品服务层级

统一目录支持以下三层：

```text
Product
  └── Service Group
      └── Service
```

示例：

```text
Cash Management
  ├── Account Services
  │   ├── Account Maintenance
  │   └── Account Reporting
  └── Liquidity Services
      └── Operating Balance Management

Trade Finance
  └── Trade Services
      ├── Letter of Credit
      └── Bank Guarantee

FX Services
  └── Foreign Exchange
      └── FX Conversion
```

### Product

银行对外提供的业务产品，例如 Cash Management、Trade Finance、FX Services、Deposit Services、Treasury Services 和 Liquidity Management。

Product 是 Price Book、Pricing Rules 和 Activity Pricing 的主要业务关联对象。

### Service Group

对产品下服务进行业务分类，例如 Account Services、Liquidity Services、Trade Services、Foreign Exchange 和 Investment Services。

### Service

客户实际使用的最小业务单元，也是可计费的最小颗粒度，例如 Account Maintenance、Account Reporting、FX Conversion、Letter of Credit 和 Operating Balance Management。Service 是层级中的叶子节点，不再进一步拆分为独立的 Fee Item 节点；计费相关的 `Billing Unit` 和 `Tax Category` 直接维护在 Service 上，可以被 Billing Calculation 和 Invoice Line Item 直接引用。

---

## 六、页面统计卡片

页面顶部使用 `StatisticCard` 展示目录级指标：

```text
Products
8

Active Services
24

Services
32

Markets Covered
5

Billable Items
24
```

至少支持以下指标：

1. Products：产品总数
2. Active Services：ACTIVE 状态的服务数量
3. Services：服务总数（Service 层级节点数量）
4. Markets Covered：目录覆盖的 APAC 国家数量
5. Billable Items：Service 层级中允许进入计费流程的数量

这些统计用于体现产品目录是全平台共享的基础主数据，而不是某个价格页面的下拉选项。

---

## 七、查询和筛选

支持以下条件：

```text
Keyword
Status
Node Type
Market
Pricing Enabled
Billing Enabled
```

Keyword 搜索范围包括：

- Product Code / Name
- Service Group Code / Name
- Service Code / Name
- Description

Node Type：

```text
PRODUCT
SERVICE_GROUP
SERVICE
```

Node Type 不作为独立展示列，仅作为筛选条件；层级信息通过 `Name` 列的图标和字重区分。

Status：

```text
DRAFT
ACTIVE
INACTIVE
```

Market 使用国家值：

```text
Singapore
Hong Kong
China
Japan
Australia
```

筛选结果只展示匹配节点，但保留其完整父级路径，避免用户无法判断节点属于哪个产品。

---

## 八、目录节点字段

表格列表和详情弹窗至少展示：

1. Code
2. Name
3. Node Type
4. Parent
5. Status
6. Pricing Enabled
7. Billing Enabled
8. Supported Markets
9. Supported Currencies
10. Updated By
11. Updated At
12. Actions

Actions：

```text
View
Edit
Enable / Disable
Add Child
```

Product Catalog 的列表字段与 Price Book 分工如下：

- Product Catalog：主数据属性、层级和治理状态
- Price Book：价格类型、费率和适用维度
- Pricing Rules：客户范围和价格调整
- Billing：计费执行和账单配置

---

## 九、新增 / 编辑目录项

新增目录项支持从目录表格的任意层级直接发起，用户不需要预先选择节点类型：

- 从页面右上角 `Add Catalog Item` 发起：默认在根级新增 Product
- 从目录表格中任意行 Actions 列的 `Add Child` 发起：自动在该行下新增其下一层级子节点

节点类型由挂载位置（父节点所在层级）自动推导，无需手动选择：

```text
挂载位置（父节点）        自动新增的节点类型
根节点（无父节点）          Product
Product                    Service Group
Service Group               Service
```

Service 是最底层节点，不提供 `Add Child` 入口。

打开 Drawer 后，父级路径以只读面包屑展示，例如：

```text
Cash Management / Account Services
新增 Service
```

编辑时节点类型和父级路径同样锁定，不支持将节点移动到不同层级或挂载到其他父节点下。若未来需要移动节点，应单独设计迁移流程，不在本 Demo 中实现。

### Product

```text
Product Code
Product Name
Description
Product Owner
Supported Markets
Supported Currencies
Pricing Enabled
Billing Enabled
Status
Effective From
Effective To
```

### Service Group

```text
Parent Product
Service Group Code
Service Group Name
Description
Status
Effective From
Effective To
```

### Service

```text
Parent Product
Service Group
Service Code
Service Name
Description
Default Billing Unit
Tax Category
Pricing Enabled
Billing Enabled
Supported Markets
Supported Currencies
Status
Effective From
Effective To
```

---

## 十、表单校验

### 基础校验

- Code 必填，并在同一层级内唯一
- Name 必填
- Status 必填
- Effective From 必须早于 Effective To
- ACTIVE 节点必须具备完整的父级路径
- Product 至少支持一个市场
- Pricing Enabled 的节点至少允许一种 Currency

### 层级校验

- Service Group 必须选择 Product
- Service 必须选择 Product 和 Service Group
- 子节点不能挂载到 INACTIVE 父节点下
- 不允许创建孤立的 Service

### 能力校验

- `Billing Enabled = true` 时必须填写 Billing Unit
- Service 启用 Billing 前必须填写 Tax Category
- 只有 `status = ACTIVE` 且 `pricingEnabled = true` 的节点，才能被新增 Price Book 价格
- 只有 `status = ACTIVE` 且 `billingEnabled = true` 的 Service，才能进入计费配置

---

## 十一、详情 Drawer

点击 View 打开详情 Drawer，使用 `ProDescriptions`、`ProCard` 和 `Tabs` 展示完整信息。

详情示例：

```text
Product & Service Details

Code
CASH-MGMT

Name
Cash Management

Node Type
PRODUCT

Status
ACTIVE

Pricing Enabled
Yes

Billing Enabled
Yes

Supported Markets
Singapore, Hong Kong, China, Japan, Australia

Supported Currencies
SGD, HKD, CNY, JPY, AUD

Effective From
2025-01-01

Updated By
Product Administration

Updated At
2026-08-20
```

详情 Tab：

```text
Overview
Hierarchy
Pricing Usage
Billing Usage
Audit
```

### Overview

展示当前节点的基本信息、状态和能力开关。

### Hierarchy

展示完整父级路径和子节点数量：

```text
Cash Management
  → Account Services
    → Account Maintenance
```

### Pricing Usage

展示当前节点被 Price Book 引用的情况，并提供跳转入口：

```text
Base Price Points: 4
Region Price Points: 12
Segment Price Points: 3
Group Price Points: 2
```

### Billing Usage

展示当前节点被 Billing Configuration、Billing Run 或 Invoice 使用的情况。

### Audit

展示 Created By、Created At、Updated By、Updated At 和状态变化记录。

---

## 十二、启用和停用

所有删除操作使用逻辑停用，不直接删除目录节点。

停用时显示确认 Modal：

```text
Disable Product

Are you sure you want to disable Cash Management?

Existing Price Book and Billing references will be preserved,
but new pricing and billing configuration cannot use this item.
```

规则：

- 停用父节点前提示当前 ACTIVE 子节点
- 已存在的 Price Book 价格不删除
- 已存在的 Billing 和 Invoice 历史数据不修改
- INACTIVE 节点不能被新的 Price Book、Pricing Rules 或 Billing 配置选择
- 重新启用时检查父节点是否仍为 ACTIVE
- 停用 Product 时可选择仅停用当前节点，或同时停用子节点；Demo 中默认要求用户明确确认

---

## 十三、Mock 数据与数据模型

本页面暂时不连接真实后端，使用前端 Mock 数据。Mock 数据至少覆盖 5 个 APAC 市场、SGD / HKD / CNY / JPY / AUD、多种计费单位以及 DRAFT / ACTIVE / INACTIVE 状态。

建议类型：

```ts
type CatalogNodeType = 'PRODUCT' | 'SERVICE_GROUP' | 'SERVICE';

type CatalogStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

type BillingUnit =
  | 'PER_MONTH'
  | 'PER_TRANSACTION'
  | 'PER_ACCOUNT'
  | 'PER_DOCUMENT';

interface CatalogNode {
  id: string;
  code: string;
  name: string;
  nodeType: CatalogNodeType;
  parentId?: string;
  productId?: string;
  serviceGroupId?: string;
  description?: string;
  status: CatalogStatus;
  supportedMarkets?: string[];
  supportedCurrencies?: string[];
  pricingEnabled?: boolean;
  billingEnabled?: boolean;
  billingUnit?: BillingUnit;
  taxCategory?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  updatedBy: string;
  updatedAt: string;
}
```

建议数据至少包括：

- 6 个产品
- 每个产品至少 1 个 Service Group
- 每个 Service Group 至少 1 个 Service
- 按月、按笔、按账户、按文件收费的场景
- 可定价但不可直接计费的 Service
- 可计费且需要 Tax Category 的 Service

产品和服务目录数据应作为共享 Mock 数据源，后续被 Price Book、Activity Pricing 和 Tax Configuration 的选择器复用。

---

## 十四、Mock API

优先复用项目现有 Mock 机制，不连接真实后端。

建议接口：

```text
GET    /api/catalog/nodes
POST   /api/catalog/nodes
GET    /api/catalog/nodes/:id
PUT    /api/catalog/nodes/:id
PATCH  /api/catalog/nodes/:id/status
GET    /api/catalog/nodes/:id/usage
```

查询参数：

```ts
interface CatalogQuery {
  nodeType?: CatalogNodeType;
  parentId?: string;
  status?: CatalogStatus;
  market?: string;
  pricingEnabled?: boolean;
  billingEnabled?: boolean;
  keyword?: string;
}
```

接口返回的数据应支持平铺列表和树形结构两种展示方式。

---

## 十五、与其他模块的边界

### Catalog → Price Book

Catalog 提供产品、服务组、服务、支持市场、支持币种和 Billing Unit。Price Book 负责 BASE / REGION / SEGMENT / GROUP、Flat / Tiered / Volume / ECR、标准价格和生效期。

### Catalog → Pricing Rules

Pricing Rules 只能关联 ACTIVE 且允许定价的目录节点，并引用 Price Book 中的标准价格点。

### Catalog → Billing

Billing 使用 Service 作为最小计费单元，并读取 Billing Unit、Currency 和 Tax Category。

### Catalog → Tax Configuration

Tax Configuration 可根据 Product 或 Service 关联税务分类。区域和税务规则仍由 Regional Configuration 管理，Catalog 只保存引用关系。

### Catalog → Activity Pricing

Activity Pricing 只能选择 ACTIVE 且 `pricingEnabled = true` 的产品或服务。

---

## 十六、数据治理原则

```text
Catalog defines what can be sold and charged
Price Book defines the standard price
Pricing Rules define customer-specific adjustments
Billing defines how charges are calculated
Invoice records the final outcome
```

具体原则：

1. 产品和服务只在目录中定义一次
2. 下游模块使用目录选择器，不重复维护产品名称和服务列表
3. 目录停用不删除历史价格、账单和发票数据
4. ACTIVE 节点必须具备完整且 ACTIVE 的父级路径
5. Service 是最终可计费单元
6. Price Book 不直接维护客户名称
7. 客户分组由 Customer Management 管理
8. 区域和币种主数据由对应基础配置管理
9. Catalog 只引用市场和币种，不重新定义它们的治理规则
10. 目录变更保留操作人、时间和状态变化记录

---

## 十七、页面业务流程

### 新增产品

```text
Product & Service Catalog
  → Add Catalog Item
  → Select Product
  → Fill Product Information
  → Select Markets and Currencies
  → Enable Pricing / Billing
  → Save
  → Product appears in hierarchy
```

### 新增服务

```text
Select Product
  → Add Service
  → Select Service Group
  → Fill Service Information
  → Configure Billing Unit
  → Configure Tax Category
  → Configure Supported Markets
  → Save
```

### 从目录进入 Price Book

```text
Select Active Service
  → View Pricing Usage
  → Open Price Book
  → Add BASE / REGION / SEGMENT / GROUP Price Point
```

---

## 十八、页面说明区

页面顶部可增加简短说明：

```text
Product & Service Catalog

A single source of truth for products and services
across pricing, billing, tax and reporting workflows.
```

页面底部可使用 `Steps` 展示平台关系：

```text
Product Catalog
      ↓
Service Hierarchy
      ↓
Price Book
      ↓
Pricing Rules
      ↓
Billing Calculation
      ↓
Invoice
```

---

## 国际化要求（仅中文 / English）

- 本页面仅支持 `zh-CN` 和 `en-US` 两种语言，不新增或要求其他语言包。
- 所有 UI 文案，包括标题、菜单、按钮、字段、枚举、状态、空态、校验和错误提示，必须通过 `useIntl().formatMessage` 或 `<FormattedMessage />` 展示，不得硬编码中文或英文。
- 新增文案统一维护在 `src/locales/zh-CN/pages.ts`、`src/locales/en-US/pages.ts` 和对应的 `menu.ts` 中，使用页面专属 key 前缀。
- Product Code、市场名称、币种代码等业务数据可以保留 Mock 中的标准值；目录节点的自由文本不要求额外翻译。
- 切换 `zh-CN` / `en-US` 后，目录表格、详情弹窗、编辑表单、操作确认和校验提示都必须显示对应语言。

## 十九、实现要求

实现时需要：

- 新增统一产品与服务目录页面
- 新增 `/pricing-billing/catalog` 路由
- 新增中英文菜单 i18n key
- 创建共享 Mock Catalog 数据
- 支持 Product → Service Group → Service 三层混合层级展示（单一可展开 ProTable，类似手册目录，不使用左右分栏的树 + 详情面板布局），`Name` 列用图标和字重区分层级，`Code` 独立成列，`Node Type` 仅作为筛选条件不在表格中展示
- 支持搜索和筛选
- 支持在目录表格任意层级发起新增（自动推导节点类型）、编辑、查看，均以传统弹窗（Modal / Drawer）方式呈现
- 支持启用和停用
- 支持状态、层级和能力开关校验
- 支持 Pricing Usage 和 Billing Usage 的 Demo 展示
- 不连接真实后端
- 不引入新的 UI Framework
- 不升级依赖
- 不修改无关页面

后续应逐步将 Price Book、Activity Pricing 和 Tax Configuration 中重复维护的产品数组和 Service Catalog 改为消费统一 Catalog 数据，但本页面第一阶段可以先独立完成目录管理和 Mock 数据展示。
