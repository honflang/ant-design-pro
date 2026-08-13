你现在正在一个基于 **Ant Design Pro（React + TypeScript + Ant Design）** 的后台管理系统中开发一个新的业务模块。

## 一、业务背景

这是一个 **Wholesale Banking Pricing & Billing System（批发银行定价与计费系统）** 的 Demo。

系统面向银行内部用户，用于管理企业客户定价、计费和发票流程。

当前需要实现的是其中的：

> **Billing Configuration（计费配置）**

重点展示同一平台如何为不同市场、客户、币种设置差异化计费参数，并作为 Billing Run 的执行基线。

本次 Demo 暂时**不接真实后端，全部使用 Mock 数据**。

---

## 二、本次需要实现的功能

请新增或完善一个：

> **Billing Configuration（计费配置）**

页面。

页面用于管理计费周期、扣费账户、合并规则、换汇规则、追溯设置与发票交付偏好。

需要体现以下业务概念：

* Billing Cycle（MONTHLY / QUARTERLY / ANNUAL / ON_DEMAND）
* Charge Account（扣费账户）
* Consolidation（跨产品 / 跨国家）
* Billing Currency & FX Method（计费币种与汇率方式）
* Backdated Policy（追溯天数与跨币种追溯）
* Invoice Format & Delivery Channel（发票格式与渠道）

---

## 三、菜单和路由

请在现有菜单中确认并使用：

```text
Billing Management
  └── Billing Configuration
```

建议路由：

```text
/pricing-billing/billing/configuration
```

如果项目已有该路由和菜单，请保持兼容。

---

## 四、页面总体结构

页面采用：

> ProCard + StatisticCard + ProTable + Drawer

布局。

整体示意：

```text
┌─────────────────────────────────────────────────────────────────┐
│ Billing Configuration                                            │
│ Configure billing behavior across clients and markets           │
├──────────────────────────────────────────────────────────────────┤
│ [Active Configs] [Markets] [Pending Review] [Cross-currency]   │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Client ▼] [Cycle ▼] [Status ▼] [Search]            │
├──────────────────────────────────────────────────────────────────┤
│ Billing Configurations                    [+ New Configuration]  │
│ Client │ Market │ Cycle │ Charge Account │ Currency │ Status    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、Mock 数据

至少覆盖以下 APAC 市场：

* Singapore
* Hong Kong
* China
* Japan
* Australia

并体现：

* 同币种计费（如 SGD -> SGD）
* 跨币种计费（如 CNY -> SGD, JPY -> SGD）
* 合并策略差异
* 追溯窗口差异（如 30 / 60 / 90 天）

---

## 六、列表字段

Billing Configuration 列表至少包含：

1. Client
2. Market
3. Billing Cycle
4. Charge Account
5. Charge Account Currency
6. Billing Currency
7. FX Conversion Method
8. Consolidate Products
9. Consolidate Countries
10. Max Backdate Days
11. Invoice Format
12. Delivery Channel
13. Status
14. Updated By
15. Updated At
16. Actions

Actions：

```text
View
Edit
Disable / Enable
```

---

## 七、新增 / 编辑 Billing Configuration

点击：

> New Configuration

打开 Drawer。

Drawer 建议分组：

### 1. Client & Market

```text
Client
Market
```

### 2. Billing Cycle & Account

```text
Billing Cycle
Charge Account
Charge Account Currency
```

### 3. Consolidation

```text
Consolidate Products
Consolidate Countries
```

### 4. Currency & FX

```text
Billing Currency
FX Conversion Method
```

### 5. Backdate & Delivery

```text
Max Backdate Days
Allow Non-local Currency Backdate
Invoice Format
Delivery Channel
Status
```

---

## 八、Configuration Detail

点击 View 打开详情 Drawer，建议使用：

> ProDescriptions

展示完整配置后，增加：

### Billing Logic Preview

```text
Charge Currency: CNY
Billing Currency: SGD
FX Method: Monthly Average
Backdate Window: 60 days
Consolidation: Product=true, Country=false
```

说明该配置如何影响后续 Billing Run。

---

## 九、页面顶部增加区域概览

建议统计卡：

```text
Active Configurations
Markets Covered
Pending Review
Cross-currency Configurations
```

---

## 十、与 Billing Run / Invoice 的业务关系

页面中需体现：

> Billing Configuration 决定 Run 的计费参数和换汇规则，Invoice 按配置输出格式与渠道。

流程建议：

```text
Billing Configuration
   ↓
Run Parameter Resolution
   ↓
FX / Consolidation / Backdate Rules
   ↓
Invoice Generation & Delivery
```

---

## 十一、Mock 数据与 API

建议结构：

```ts
interface BillingConfig {
  id: string;
  clientId: string;
  clientName: string;
  market: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ON_DEMAND';
  chargeAccountId: string;
  chargeAccountCurrency: string;
  consolidateProducts: boolean;
  consolidateCountries: boolean;
  billingCurrency: string;
  fxConversionMethod: 'SPOT' | 'MONTHLY_AVERAGE' | 'FIXED_RATE';
  maxBackdateDays: number;
  allowNonLocalCurrencyBackdate: boolean;
  invoiceFormat: 'PDF' | 'MT940' | 'ISO20022' | 'XLSX';
  deliveryChannel: 'EMAIL' | 'SFTP' | 'PORTAL' | 'SWIFT';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW';
  updatedBy: string;
  updatedAt: string;
}
```

Mock API：

```text
GET    /api/billing/configurations
POST   /api/billing/configurations
PUT    /api/billing/configurations/:id
PATCH  /api/billing/configurations/:id/status
GET    /api/billing/configurations/:id
```

---

## 十二、技术要求

必须遵循当前项目已有技术栈：

* React
* TypeScript
* Ant Design
* Ant Design Pro
* ProTable
* ProForm
* ProDescriptions
* ProCard

不要引入新的 UI framework。不要升级依赖。

---

## 十三、交互要求

至少实现：

### 查询

```text
Market
Client
Billing Cycle
Status
Keyword
```

### 新增

Add Configuration → Drawer → Submit → Mock 新增 → 列表刷新。

### 编辑

Edit → Drawer 回填 → Submit → Mock 更新 → 列表刷新。

### 查看

View → Detail Drawer（含 Billing Logic Preview）。

### 启用 / 禁用

Action → 确认弹窗 → 更新状态。

---

## 十四、Demo 重点

这个页面不是为了展示“参数表单”，而是为了向银行客户展示：

> **Centralized Billing Setup 可实现跨市场一致治理与本地差异化执行。**

建议突出：

```text
Central Parameter Governance
        ↓
Market-specific Billing Behavior
        ↓
Reliable Billing Runs
        ↓
Compliant Invoice Delivery
```

---

## 十五、实现要求

在开始修改代码之前：

1. 先检查当前项目目录结构。
2. 检查现有 routes 配置方式。
3. 检查现有菜单配置方式。
4. 检查现有 Billing 页面的 ProTable / ProForm 模式。
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
* Billing Logic Preview

完成后确保 TypeScript 编译没有明显错误，页面能够正常运行。

**不要实现真实结算后端、真实清算核心、真实外部账户系统。当前目标是可用于客户演示的高质量 Demo。**
