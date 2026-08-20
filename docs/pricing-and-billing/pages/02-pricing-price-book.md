你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户的产品定价、协议条款、计费与发票。

当前需要实现的是其中的：

> **Price Book（价格手册）**

重点展示平台如何在 APAC（亚太）多个国家和区域下，集中管理标准定价点，并作为后续 Pricing Rule / Billing 的输入。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Price Book（价格手册）**

页面。

页面用于管理以服务价格为基本数据单元的标准定价点（Pricing Points）。价格归属遵循 `Product → Service Group → Service` 的层级：先选择产品，再选择服务组，最后选择具体服务；价格类型、币种和费率定义在具体服务上，再通过四个适用范围维度决定它服务于哪些客户和交易场景。

价格适用范围按具体性分为四层：

1. **BASE（基础定价）**：产品的默认价格，普遍适用于所有未命中更具体配置的客户和交易。
2. **REGION（区域定价）**：针对某个区域 / Jurisdiction 的价格。本 Demo 中区域值使用国家，例如 Singapore、Hong Kong、China、Japan、Australia；不同国家的监管、税务、清算网络或本地竞争环境可能导致定价差异。命中区域定价时优先于基础定价。
3. **SEGMENT（客群定价）**：针对客户属性或经营分层的价格，例如 Corporate、SME、Financial Institution、Public Sector。它描述“客户属于什么类型”，而不是某一组具体客户。
4. **GROUP（客户分组定价）**：针对银行内部维护的客户组合、关系组或协议组的价格，例如跨境集团客户、战略客户池、某个行业联盟或 bundled-product 客户组。它描述“哪些具体客户共享一份商业安排”，而不是客户的普遍属性。

因此，Segment 是可复用的客户分类，Group 是可治理、可审计的客户集合。一个大型集团可能整体属于 Corporate Segment，同时属于 `APAC Strategic Accounts` Group；后者可以在基础、区域和客群价格之上提供集团级价格。单一客户的临时谈判价或 Deal Price 不应直接污染 Price Book，建议由 Pricing Rules / Deal Pricing 继续承载。

需要体现以下业务概念：

* Product（产品）
* Applicability Dimension（适用维度：BASE / REGION / SEGMENT / GROUP）
* Region（区域 / Jurisdiction；本 Demo 的区域值为国家，在 REGION 维度使用）
* Segment（客群，在 SEGMENT 维度使用）
* Client Group（客户分组，在 GROUP 维度使用）
* Price Type（定价类型）
* Currency（币种）
* Flat / Tiered / Volume / ECR（多种定价方式）
* Effective Period（生效区间）
* Category（Standard / Negotiated）
* Status（Draft / Active / Inactive）

注意：这是一个 Demo，不需要构造真实银行全部定价逻辑，只需要通过合理的数据模型与交互体现平台能力。

---

## 三、菜单和路由

请在现有 Ant Design Pro 菜单中确认并使用：

```text
Pricing Configuration
  └── Price Book
```

建议路由：

```text
/pricing-billing/pricing/price-book
```

如果项目已存在该路由和菜单，请保持现有结构，仅补强页面能力，不要破坏现有导航与权限控制。

菜单标题建议：

```text
Pricing Configuration
Price Book
```

如果项目已经使用 umi 的权限 / routes 配置，请按项目既有方式实现。

---

## 四、页面总体结构

页面采用 Ant Design Pro 常见的：

> ProCard + StatisticCard + ProTable + Drawer / Modal

布局。

整体页面示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Price Book                                                       │
│ Standard pricing points across products, segments & geographies │
├──────────────────────────────────────────────────────────────────┤
│ [Products] [Active Price Points] [Regions] [Standard/Negotiated]│
├──────────────────────────────────────────────────────────────────┤
│ [Base] [Region] [Segment] [Group]                                │
├──────────────────────────────────────────────────────────────────┤
│ Region: [Singapore ▼]   [Product ▼] [Status ▼] [Keyword] [Search]│
│ [Keyword] [Search]                                               │
├──────────────────────────────────────────────────────────────────┤
│ Price Points                                [+ Add Price Point]  │
│ Product │ Applicability │ Type │ Currency │ Rate/Amount │ Status  │
│ Cash Mgmt│ BASE          │ Flat │ SGD      │ SGD 50/month│ Active  │
│ Cash Mgmt│ REGION        │ Flat │ SGD      │ SGD 45/month│ Active  │
│ Trade Fin│ SEGMENT       │ Tiered│ HKD     │ 0.10%-0.30% │ Active  │
└──────────────────────────────────────────────────────────────────┘
```

页面需要有明显的 Enterprise / Banking 平台感，重点体现“集中治理 + 多国家区域适配”，避免普通 CRUD 视觉。

### 四个定价维度的 Tab 交互

建议使用 antd `Tabs` 作为页面主体导航，而不是让用户在一个筛选器中手工切换四种 Dimension。四个 Tab 固定为：

```text
Base Pricing | Region Pricing | Segment Pricing | Group Pricing
```

每个 Tab 都展示同一套产品价格列表和 `Add Price Point` 操作，但 Tab 决定当前配置的 `Applicability Dimension`：

| Tab | 首要操作 | 目标选择 | 页面含义 |
|---|---|---|---|
| Base Pricing | 直接查看或配置产品价格 | 无需选择目标 | 全部客户和交易的默认价格 |
| Region Pricing | 先选择区域 | 选择国家，例如 Singapore | 该国家区域覆盖基础价格 |
| Segment Pricing | 先选择客群 | 选择 Corporate、SME 等 | 该类客户覆盖基础或区域价格 |
| Group Pricing | 先选择客户分组 | 选择 `APAC Strategic Accounts` 等 | 该客户组合或协议组的专属价格 |

Region、Segment 和 Group Tab 的目标选择器应位于列表上方，选择目标后再加载对应价格；未选择目标时显示空状态和选择提示，不展示所有目标混在一起的结果。Base Tab 不显示目标选择器，直接展示基础价格。

Tab 内的列表仍只展示 Product、Applicability Dimension、Price Type、Currency、Rate / Amount、Category、Status 和 Actions，不展示具体目标、生效日期或审计字段。当前目标通过 Tab 上方的上下文标题展示，例如 `Region Pricing / Singapore`，完整信息仍在详情 Drawer 中查看。

可以在 Tab 导航旁显示每个维度的价格数量和 ACTIVE 数量，但不建议把四个维度的记录合并成一个默认列表。这样用户的操作路径清晰：先进入治理层，再选择目标，再配置该目标下的产品价格。

---

## 五、Mock 数据

至少准备以下 APAC 区域（区域值为国家）：

* Singapore
* Hong Kong
* China
* Japan
* Australia

Mock 数据需体现四个维度的覆盖关系、不同国家区域、产品、币种和定价方式的差异。建议至少准备 **1 组 BASE + 5 个 REGION × 3 个产品 + 3 个 SEGMENT + 3 个 GROUP（20 条以上）**，其中同一产品至少有一条基础价和一条更具体的覆盖价，用于演示解析优先级。

示例：

### Singapore

```text
Dimension: BASE
Product: Cash Management
Price Type: FLAT
Amount: SGD 50 / month
Category: STANDARD
Status: ACTIVE
Effective From: 2025-01-01
```

```text
Dimension: REGION: Singapore
Product: Trade Finance
Price Type: TIERED
Rate: 0.30% / 0.20% / 0.10%
Status: ACTIVE
```

### Hong Kong

配置不同于 Singapore 的费率或阶梯区间，体现国家区域差异。

### Segment 与 Group 示例

```text
Dimension: SEGMENT: SME
Product: Cash Management
Rule: 对所有 SME 客户统一收取较低的月费
```

```text
Dimension: GROUP: APAC Strategic Accounts
Product: Cash Management + Trade Finance
Rule: 对该关系组内的企业客户使用集团协商价或 bundled-product 费率
```

Group 的成员应来自客户主数据或客户组合配置，而不是在每条价格记录中手工输入客户名称。若同一客户同时属于多个 Group，应通过 Group 的优先级、协议有效期和互斥规则先确定唯一命中的 Group，再解析价格。

### China

以 CNY 场景为主，体现本地币种和本地区域价格策略。

### Japan

包含高频交易产品按笔收费（如 JPY 固定每笔）。

### Australia

可包含 ECR（参考利率 + Spread）场景。

注意：Mock 数据仅用于演示 UI 和业务流程，不代表真实或完整银行定价政策。

---

## 六、列表字段

Price Point 列表以“产品价格单元”为中心，至少包含：

1. Product
2. Applicability Dimension（BASE / REGION / SEGMENT / GROUP）
3. Price Type
4. Currency
5. Rate / Amount
6. Category
7. Status
8. Actions

列表中**不展示** Region、Segment、Client Group、Effective From、Effective To、Updated By 和 Updated At。主列表只展示适用维度类型，不展示具体国家区域、客群或分组名称；完整适用范围、生效区间和审计信息在 View 详情、Edit Drawer 和审计区域中查看。这样列表表达的是“有哪些产品价格”，而不是把每一条记录渲染成客户维度的宽表。

建议在每个 Tab 内支持按 Product、Price Type、Status 和 Keyword 查询。Region / Country、Segment、Client Group 不再作为通用筛选项，而是由当前 Tab 的目标选择器负责；Dimension 也由当前 Tab 固定，不需要重复提供筛选器。

Actions：

```text
View
Edit
Disable / Enable
```

可使用 Dropdown / MoreOutlined。

---

## 七、新增 / 编辑 Price Point

点击：

> Add Price Point

打开 Drawer，而不是跳转新页面。

Drawer 建议按业务逻辑分组：

### 1. Product & Applicability

```text
Product
Applicability Dimension（由当前 Tab 固定）
Region / Country（仅 Region Pricing Tab）
Segment（仅 Segment Pricing Tab）
Client Group（仅 Group Pricing Tab）
Category
```

新增或编辑时，`Applicability Dimension` 由当前 Tab 自动带入并锁定，不建议在 Drawer 中再次选择。Base Pricing Tab 不显示目标字段；Region Pricing、Segment Pricing 和 Group Pricing Tab 分别只显示对应的目标选择字段，避免产生含义冲突的组合。Region / Country 的值使用国家，例如 Singapore 或 Japan。

产品作用范围支持四个层级：`Product`、`Service Group`、`Service`、`Fee Item`。新增 Price Point 时只要求选择 Product，后续层级按需选择或填写，因此可分别维护产品级默认价、服务组级默认价、服务级价格和收费项级价格。价格解析时，更具体的产品层级覆盖更上层的同维度价格。

### 2. Pricing Definition

```text
Price Type
Currency
Flat Amount / Unit
Tier Rules（当 Price Type = TIERED）
ECR Reference / Spread（当 Price Type = ECR）
```

Price Type 示例：

```text
FLAT
TIERED
VOLUME
ECR
```

### 3. Effective Period

```text
Effective From
Effective To
```

### 4. Status

```text
DRAFT
ACTIVE
INACTIVE
```

表单需要包含合理 validation（必填、数值范围、日期先后关系、价格类型与字段联动校验）。Tab 切换时应分别保留 Region、Segment 和 Group 的目标选择状态；切换到另一个 Tab 后不能沿用上一个 Tab 的目标值。编辑已有记录时，Drawer 应从当前列表上下文带入并锁定 Dimension 和 Target，防止把价格保存到错误的作用域。

还需要校验：BASE 价格不能填写区域、客群或分组；REGION / SEGMENT / GROUP 必须有且只有当前 Tab 对应的目标；同一 Product + Dimension + Target + Price Type + Currency 在重叠生效期内不能存在多个 ACTIVE 价格，除非明确配置了版本优先级。

---

## 八、Price Point Detail

点击 View 时，打开 Drawer 展示完整规则。

建议使用：

> ProDescriptions

展示示例：

```text
Price Point Details

Product
Cash Management

Applicability Dimension
REGION

Applicability Target
Singapore

Price Type
FLAT

Currency
SGD

Rate / Amount
SGD 50 / month

Category
STANDARD

Effective From
2025-01-01

Status
ACTIVE
```

详情抽屉应补充完整作用域、生效期和审计字段；这些字段不在主列表重复展示。

### Pricing Resolution Preview

详情中建议增加“命中路径”预览，用来解释某个客户和交易为什么得到当前价格：

```text
BASE: Cash Management SGD 50 / month
→ REGION: Singapore SGD 48 / month
→ SEGMENT: Corporate SGD 45 / month
→ GROUP: APAC Strategic Accounts SGD 40 / month
Resolved Price: SGD 40 / month
```

解析顺序为 `GROUP > SEGMENT > REGION > BASE`。只要更具体层存在当前生效且为 ACTIVE 的价格，就覆盖较低层；没有命中时回退到下一层。若同一层存在多个候选项，先按 Group / Segment 的显式优先级，再按有效期版本和审批状态决议；无法唯一决议时应阻止发布并提示配置冲突，而不是静默选择。

当 Price Type = TIERED 时，详情区域中增加 Tier 预览表格。

下面增加一个：

### Pricing Simulation Preview

这是 Demo 中的重要展示能力。

例如：

```text
Pricing Simulation Preview

Monthly Volume
1,200 transactions

Pricing Type
TIERED

Estimated Charge
SGD 2,350

Pricing Basis
Tier 1 + Tier 2 blended
```

可使用 ProCard / Statistic / Descriptions 等组件，基于前端 Mock 数据计算即可，无需后端。

---

## 九、页面顶部增加区域概览

在列表上方增加统计卡片，例如：

```text
Products
8

Active Price Points
64

Base / Region / Segment / Group
16 / 28 / 12 / 8

Standard / Negotiated
52 / 12
```

使用：

> StatisticCard

或项目已有统计组件，突出平台级配置能力。

---

## 十、与 Rule / Billing 的业务关系

页面中需要通过 UI 体现 Price Book 的业务意义：

> Price Book 是 Pricing Rule、Deal Pricing、Billing Calculation 的基础输入。

可在页面加入简短说明区：

```text
Price Book Flow

Price Book
   ↓
Pricing Rule
   ↓
Customer Deal Pricing
   ↓
Billing Calculation
   ↓
Invoice
```

可使用 Steps / Card / 简单流程图形实现。

本次无需实现真实 Billing / Invoice 模块，重点是让用户理解 Price Book 的上游定位。

---

## 十一、Mock 数据与 API

暂时不要连接真实 API。

请建立清晰的 Mock 数据结构，例如：

```ts
interface PricePoint {
  id: string;
  product: string;
        serviceGroup: string;
        service: string;
        // Existing API fields remain compatible; scope fields are interpreted by dimension.
        dimension?: 'BASE' | 'REGION' | 'SEGMENT' | 'GROUP';
        market?: string; // Legacy API field; the value is a country / region.
        segment?: string;
        clientGroup?: string;
  priceType: 'FLAT' | 'TIERED' | 'VOLUME' | 'ECR';
  currency: string;
  flatAmount?: number;
  flatUnit?: 'PER_MONTH' | 'PER_TRANSACTION' | 'PER_ACCOUNT';
  tiers?: {
    tierFrom: number;
    tierTo?: number;
    unit: string;
    rate?: number;
    amount?: number;
  }[];
  ecrRate?: number;
  ecrReference?: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  category: 'STANDARD' | 'NEGOTIATED';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  updatedBy: string;
  updatedAt: string;
}
```

接口可以保持现状，不要求拆分或重命名字段。前端和 Mock 层新增的 `dimension`、`clientGroup` 可作为兼容扩展；当 `dimension` 缺省时，按以下规则兼容旧数据：有 `clientGroup` 视为 GROUP，有 `segment` 视为 SEGMENT，有 `market` 视为 REGION，三者都为空视为 BASE。现有 `market` 字段继续保留，但其业务含义统一解释为区域，字段值为国家；`effectiveFrom`、`effectiveTo`、`updatedBy` 和 `updatedAt` 也继续保留在接口中，只是不在列表中展示。

Mock API 建议：

```text
GET    /api/pricing/price-points
POST   /api/pricing/price-points
PUT    /api/pricing/price-points/:id
PATCH  /api/pricing/price-points/:id/status
GET    /api/pricing/price-points/:id
```

如果项目已有统一 request / service / mock 机制，优先复用，不要新建另一套架构。

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

不要引入新的 UI framework。

不要修改无关页面。

不要升级依赖。

不要添加没有必要的第三方依赖。

---

## 十三、交互要求

至少实现：

### 查询

支持：

```text
Product
Applicability Dimension
Region / Country
Segment
Client Group
Price Type
Status
Keyword
```

### 新增

Add Price Point → Drawer → Submit → Mock 新增 → 列表刷新。

### 编辑

Edit → Drawer → 自动填充当前数据 → Submit → Mock 更新 → 列表刷新。

### 查看

View → Detail Drawer。

### 启用 / 禁用

点击 Action：

```text
Disable / Enable Price Point
```

显示确认 Modal，确认后更新 Mock 状态。

---

## 十四、Demo 重点

这个页面不是为了展示“简单价格 CRUD”，而是为了向银行客户展示：

> **同一个中央平台可以管理 APAC 多国家区域、多产品、多客群和客户组合的标准定价体系。**

Demo 应明确展示以下治理模型：

```text
BASE product price
        ↓ override when applicable
REGION price
        ↓ override when applicable
SEGMENT price
        ↓ override when applicable
GROUP price
        ↓
Resolved price for pricing rule / billing
```

现实案例：某企业属于 Corporate Segment，同时是 `APAC Strategic Accounts` Group 的成员，并在 Singapore 发生交易。系统先找到该产品的 BASE 价，再检查 Singapore 的 REGION 价、Corporate 的 SEGMENT 价，最后检查客户所在 Group 的 GROUP 价；若 Group 价在当前生效期内有效，则使用 Group 价。这样既保留了全行统一的默认价格，又能承载国家区域差异、客群政策和集团协议。

UI 上需要突出：

```text
Centralized Price Book
        ↓
Multi-Region Pricing Governance
        ↓
Standardized Pricing Points
        ↓
Consistent Billing Input
        ↓
Transparent Invoice Outcome
```

请让页面有明确的“Central Pricing Governance Platform”产品感。

---

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单与 i18n key 组织方式。
4. 检查现有页面的 ProTable / ProForm 实现模式。
5. 检查现有 Mock 数据组织方式。
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
* 启用 / 禁用
* Pricing Simulation Preview

完成后确保 TypeScript 编译无明显错误，页面可正常运行。

**不要实现真实后端对接、真实授信或真实计费结算逻辑。当前目标是一个可用于客户演示的高质量 Demo。**
