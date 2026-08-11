# 06 — 计费配置 Billing Configuration

**路由**：`/billing/configuration`  
**组件路径**：`src/pages/billing/configuration/index.tsx`  
**菜单 i18n key**：`menu.billing.configuration`  
**所属用例**：UC-2（第 4 点）、UC-3（第 6、7、8 点）

---

## 1. 页面目的

计费配置定义**如何对客户执行计费**，包括：计费周期、扣费账户、计费合并策略（跨产品/跨国家）、货币换算规则、追溯计费设置。

演示价值：
- 展示 "Configurable Billing"（UC-2 第 4 点：计费周期、扣费账户）
- 展示 "Billing Consolidation across products, countries"（需求第 2 条）
- 展示多货币结算（IDR/CNY/BHT → SGD）和追溯天数限制（UC-3 第 8 点）

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Billing Configuration                                            │
│ Configure billing parameters for clients across markets         │
├──────────────────────────────────────────────────────────────────┤
│ [Active Configs: 38]  [Markets: 5]  [Pending Review: 2]         │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Client ▼] [Billing Cycle ▼] [Status ▼] [Search]    │
├──────────────────────────────────────────────────────────────────┤
│ Billing Configurations                   [+ New Configuration]  │
│                                                                  │
│ Client  │ Market │ Cycle │ Charge Acct │ Currency │ Status │... │
│ ACME    │ SG     │Monthly│ 001-SGD     │ SGD      │ Active │... │
│ Daiwa   │ JP     │Monthly│ 002-JPY     │ JPY→SGD  │ Active │... │
│ CCB     │ CN     │Qtly   │ 003-CNY     │ CNY→SGD  │ Active │... │
└──────────────────────────────────────────────────────────────────┘
```

配置详情/编辑 Drawer 分 5 个 Section：
1. Client & Market
2. Billing Cycle & Charge Account
3. Consolidation Settings（跨产品/跨国家合并）
4. Currency & FX Settings（多货币换算）
5. Backdated Transaction Rules（追溯设置）

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | Active、Markets、Pending |
| 配置列表 | `ProTable` | |
| 新增/编辑 | `Drawer` + `ProForm` | 5 Section，含 Switch 开关 |
| 详情 | `Drawer` + `ProDescriptions` | 展示完整配置 |

---

## 4. Mock 数据结构

```typescript
// mock/billing.ts

type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ON_DEMAND';

interface BillingConfig {
  id: string;
  clientId: string;
  clientName: string;
  market: string;
  billingCycle: BillingCycle;
  // 计费账户
  chargeAccountId: string;
  chargeAccountCurrency: string;    // 'SGD' | 'HKD' | 'CNY' | 'JPY' | 'AUD'
  // 合并计费
  consolidateProducts: boolean;     // 跨产品合并
  consolidateCountries: boolean;    // 跨国家合并（须同一 Legal Entity）
  // 多货币
  billingCurrency: string;          // 最终计费货币
  fxConversionMethod: 'SPOT' | 'MONTHLY_AVERAGE' | 'FIXED_RATE';
  // 追溯设置
  maxBackdateDays: number;          // 最大允许追溯天数，如 60
  allowNonLocalCurrencyBackdate: boolean;
  // 发票交付
  invoiceFormat: 'PDF' | 'MT940' | 'ISO20022' | 'XLSX';
  deliveryChannel: 'EMAIL' | 'SFTP' | 'PORTAL' | 'SWIFT';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_REVIEW';
  updatedBy: string;
  updatedAt: string;
}
```

---

## 5. Mock API

```
GET    /api/billing/configurations              → { data: BillingConfig[], total: number }
POST   /api/billing/configurations              → BillingConfig
PUT    /api/billing/configurations/:id          → BillingConfig
PATCH  /api/billing/configurations/:id/status   → BillingConfig
GET    /api/billing/configurations/:id          → BillingConfig
```

---

## 6. 业务逻辑

### 多货币展示
当 `chargeAccountCurrency !== billingCurrency` 时，列表展示换算指示（如 `CNY → SGD`），详情中说明换算方式。

### 追溯交易规则说明（UC-3 第 8 点）
在详情 Drawer 的 "Backdated Transaction Rules" 区域展示：

```
Max Backdated Days:       60 days
Non-local Currency:       Allowed (converted at booking date FX rate)
Re-calculation Window:    Last 2 billing cycles
```

### 发票格式
不同市场默认不同格式（演示用）：

| Market | Default Format | Default Channel |
|--------|---------------|----------------|
| Singapore | PDF / ISO20022 | Email / Portal |
| China | PDF | SFTP |
| Japan | MT940 | SWIFT |
| Hong Kong | PDF / ISO20022 | Email |
| Australia | PDF / XLSX | Email / Portal |

---

## 7. 国际化 Key 列表

```
menu.billing.configuration

pages.billing.config.title
pages.billing.config.subTitle
pages.billing.config.addConfig
pages.billing.config.stat.active
pages.billing.config.stat.markets
pages.billing.config.stat.pendingReview
pages.billing.config.col.client
pages.billing.config.col.market
pages.billing.config.col.cycle
pages.billing.config.col.chargeAccount
pages.billing.config.col.currency
pages.billing.config.col.status
pages.billing.config.col.actions
pages.billing.config.cycle.monthly
pages.billing.config.cycle.quarterly
pages.billing.config.cycle.annual
pages.billing.config.cycle.onDemand
pages.billing.config.fxMethod.spot
pages.billing.config.fxMethod.monthlyAvg
pages.billing.config.fxMethod.fixed
pages.billing.config.form.section.client
pages.billing.config.form.section.billing
pages.billing.config.form.section.consolidation
pages.billing.config.form.section.currency
pages.billing.config.form.section.backdate
pages.billing.config.form.section.invoice
pages.billing.config.form.client
pages.billing.config.form.market
pages.billing.config.form.billingCycle
pages.billing.config.form.chargeAccount
pages.billing.config.form.consolidateProducts
pages.billing.config.form.consolidateCountries
pages.billing.config.form.billingCurrency
pages.billing.config.form.fxMethod
pages.billing.config.form.maxBackdate
pages.billing.config.form.allowNonLocal
pages.billing.config.form.invoiceFormat
pages.billing.config.form.deliveryChannel
```

---

## 8. 文件结构

```
src/pages/billing/configuration/
├── index.tsx
├── data.d.ts
└── service.ts

mock/billing.ts        ← 与 billing/run、billing/invoice 共用
```
