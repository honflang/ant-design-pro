你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Pricing Rules（定价规则）**

重点展示平台如何将 Price Book 标准价格叠加到不同客户层级，并通过规则优先级与调整因子形成最终计费价格。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Pricing Rules（定价规则）**

页面。

页面用于管理规则层级、适用范围与调整方式，并体现“从标准价格到客户特价”的执行链路。

需要体现以下业务概念：

* Rule Scope（规则范围：Enterprise / Segment / Client Group / Individual）
* Rule Priority（优先级）
* Price Point Reference（关联 Price Book）
* Adjustment（Discount / Surcharge / Rebate / Waiver / Promotional）
* Effective Period（生效区间）
* Approval Status（审批状态）
* Bulk Upload（批量导入）

注意：这是 Demo，不需要实现完整真实银行规则引擎，只需构造合理模型与交互能力。

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Pricing Configuration
  └── Pricing Rules
```

建议路由：

```text
/pricing-billing/pricing/rules
```

若项目已存在该路由和菜单，请保持现有结构，不破坏权限、导航和国际化。

---

## 四、页面总体结构

页面采用：

> ProCard + StatisticCard + ProTable + Drawer / Modal

布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Pricing Rules                                                    │
│ Define hierarchy-based pricing rules and adjustments            │
├──────────────────────────────────────────────────────────────────┤
│ [Total Rules] [Enterprise] [Segment] [Client/Individual]        │
├──────────────────────────────────────────────────────────────────┤
│ Rule Hierarchy: P1 Enterprise → P2 Segment → P3 Group → P4 Ind │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Product ▼] [Scope ▼] [Status ▼] [Keyword] [Search] │
├──────────────────────────────────────────────────────────────────┤
│ Pricing Rules                                   [+ Add Rule]    │
│ Priority │ Rule Name │ Scope │ Adjustment │ Effective │ Status  │
└──────────────────────────────────────────────────────────────────┘
```

页面视觉需突出“规则治理平台”属性，而不是普通列表 CRUD。

---

## 五、Mock 数据

建议至少准备以下范围组合：

* Enterprise 基础规则
* Segment（Corporate / SME）规则
* Client Group（VIP）规则
* Individual（单客户 Deal）规则

示例：

### Enterprise（P1）

```text
Rule: Cash Management Base
Scope: ENTERPRISE
Adjustment: STANDARD
Status: ACTIVE
```

### Individual（P4）

```text
Rule: ACME Strategic Deal
Scope: INDIVIDUAL
Adjustment: DISCOUNT -15%
Status: ACTIVE
```

### Segment（P2）

```text
Rule: SME FX Surcharge
Scope: SEGMENT
Adjustment: SURCHARGE +0.05%
Status: ACTIVE
```

---

## 六、列表字段

Pricing Rule 列表至少包含：

1. Priority
2. Rule Name
3. Rule Code
4. Product
5. Market
6. Scope
7. Price Point
8. Adjustment Type
9. Adjustment Value
10. Effective From
11. Effective To
12. Approval Status
13. Status
14. Updated By
15. Updated At
16. Actions

Actions：

```text
View
Edit
Disable / Enable
Submit Approval（可选）
```

---

## 七、新增 / 编辑 Pricing Rule

点击：

> Add Rule

打开 Drawer。

Drawer 建议分组：

### 1. Rule Scope

```text
Rule Name
Rule Code
Market
Product
Scope
Priority
```

### 2. Price Point Reference

```text
Price Point
Price Point Name（只读或联动）
```

### 3. Adjustment

```text
Adjustment Type
Adjustment Value
Adjustment Unit (PERCENT / ABSOLUTE)
Rebate Threshold（可选）
Waiver Condition（可选）
Promotion End Date（可选）
```

### 4. Applicability Target

```text
Target Segment
Target Client Group
Target Client
```

### 5. Effective & Status

```text
Effective From
Effective To
Status
```

表单需有合理校验（优先级范围、百分比上下限、结束日期晚于开始日期）。

---

## 八、Pricing Rule Detail

点击 View 打开详情 Drawer。

建议使用：

> ProDescriptions

展示完整规则信息，并增加：

### Rule Calculation Steps

```text
Step 1: Base Price Point = SGD 50 / month
Step 2: Matched Rule = P4 Individual Discount -15%
Step 3: Adjusted Price = SGD 42.50
Step 4: Tax Applied = GST 9%
Step 5: Final Amount = SGD 46.33
```

此区域用于向业务方解释规则命中与计算逻辑。

---

## 九、页面顶部增加区域概览

建议统计卡：

```text
Total Rules
Enterprise Rules
Segment Rules
Client / Individual Rules
```

可补充：

```text
Pending Approval
Active Rules
```

---

## 十、与 Price Book / Billing 的业务关系

页面中需体现：

> Price Book 提供基准价格；Pricing Rule 负责差异化调整；Billing 按最高优先级有效规则计费。

可加流程说明：

```text
Price Book
   ↓
Pricing Rules (Hierarchy)
   ↓
Rule Match & Adjustment
   ↓
Billing Calculation
   ↓
Invoice
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface PricingRule {
  id: string;
  ruleName: string;
  ruleCode: string;
  product: string;
  market: string;
  scope: 'ENTERPRISE' | 'SEGMENT' | 'CLIENT_GROUP' | 'INDIVIDUAL';
  priority: number;
  pricePointId: string;
  adjustmentType: 'STANDARD' | 'DISCOUNT' | 'SURCHARGE' | 'REBATE' | 'WAIVER' | 'PROMOTIONAL';
  adjustmentValue?: number;
  adjustmentUnit?: 'PERCENT' | 'ABSOLUTE';
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'EXPIRED';
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  updatedBy: string;
  updatedAt: string;
}
```

Mock API：

```text
GET    /api/pricing/rules
POST   /api/pricing/rules
PUT    /api/pricing/rules/:id
PATCH  /api/pricing/rules/:id/status
GET    /api/pricing/rules/:id
POST   /api/pricing/rules/bulk-upload
```

---

## 十二、技术要求

必须遵循现有技术栈：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProForm
* ProDescriptions
* ProCard
* Umi 路由与权限机制

不要引入新框架，不要升级依赖，不要新增不必要第三方库。

---

## 十三、交互要求

至少实现：

### 查询

```text
Market
Product
Scope
Status
Keyword
```

### 新增

Add Rule → Drawer → Submit → Mock 新增 → 刷新列表。

### 编辑

Edit → Drawer 回填 → Submit → Mock 更新 → 刷新列表。

### 查看

View → Detail Drawer（含规则计算步骤）。

### 启用 / 禁用

操作前弹确认，确认后更新状态。

### 批量上传

支持上传入口，返回固定 Mock 导入结果（导入 N 条、失败 M 条）。

---

## 十四、Demo 重点

这个页面不是为了展示“规则 CRUD”，而是为了展示：

> **Centralized Rule Governance + Hierarchy-based Pricing Execution**

请突出：

```text
Central Rule Definition
        ↓
Priority-based Rule Match
        ↓
Client-specific Pricing Outcome
        ↓
Transparent Billing Result
```

---

## 国际化要求（仅中文 / English）

- 本页面仅支持 `zh-CN` 和 `en-US` 两种语言，不新增或要求其他语言包。
- 所有 UI 文案，包括规则范围、调整类型、审批状态、表格列、表单字段、按钮、计算步骤、校验和确认提示，必须使用 i18n key，不得硬编码中文或英文。
- 新增文案统一维护在 `src/locales/zh-CN/pages.ts`、`src/locales/en-US/pages.ts` 和对应的 `menu.ts` 中，使用 `pages.pricing.rules.*` 与菜单专属 key。
- Rule Code、Price Point ID、客户名称等 Mock 业务数据可以保留标准值；Scope、Adjustment 和 Status 的显示标签必须国际化。
- 切换 `zh-CN` / `en-US` 后，规则列表、详情 Drawer、编辑表单和 Rule Calculation Steps 都必须显示对应语言。

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
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
* 批量上传
* Rule Calculation Steps

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实规则引擎、真实审批引擎、真实后端 API。当前目标是可用于客户演示的高质量 Demo。**
