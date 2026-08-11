# 02 — 价格手册 Price Book

**路由**：`/pricing-billing/pricing/price-book`  
**组件路径**：`src/pages/pricing/price-book/index.tsx`  
**菜单 i18n key**：`menu.pricing.price-book`  
**所属用例**：UC-2 灵活定价配置

---

## 1. 页面目的

价格手册是定价体系的基础配置层，定义各产品、客群、市场维度的**标准定价点（Pricing Points）**。每个价格手册条目是定价规则的模板，供后续定价规则、客户专属定价引用。

演示价值：
- 展示平台支持跨产品、跨客群、跨市场的集中定价设置
- 体现阶梯定价、固定费率等多种定价类型
- 为 UC-2 "Flexible Pricing" 奠定基础数据

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Price Book                                                       │
│ Standard pricing points across products, segments & geographies │
├──────────────────────────────────────────────────────────────────┤
│ [Products: 8]  [Active Price Points: 64]  [Markets: 5]          │
│ [Standard Prices: 52]  [Negotiated Prices: 12]                  │
├──────────────────────────────────────────────────────────────────┤
│ [Product ▼] [Market ▼] [Segment ▼] [Price Type ▼] [Search]     │
├──────────────────────────────────────────────────────────────────┤
│ Price Points                              [+ Add Price Point]   │
│                                                                  │
│ Product │ Market │ Segment │ Type  │ Rate/Amount │ Status │ ... │
│ Cash Mgmt│ SG    │ Corp    │ Flat  │ SGD 50/month│ Active │ ... │
│ Trade Fin│ HK    │ Corp    │ Tiered│ 0.1%–0.3%  │ Active │ ... │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | 产品数、定价点数、市场数、Standard/Negotiated 分类 |
| 筛选栏 | ProTable 内置 `search` | Product、Market、Segment、Price Type、Status 筛选 |
| 列表 | `ProTable` | 可排序、列状态持久化 |
| 新增/编辑 | `Drawer` + `ProForm` | 按 Jurisdiction / Product / Pricing 分组 |
| 查看详情 | `Drawer` + `ProDescriptions` | 含阶梯定价预览表格 |

---

## 4. Mock 数据结构

```typescript
// mock/pricing.ts

interface PricePoint {
  id: string;
  product: string;           // 'Cash Management' | 'Trade Finance' | 'FX' | ...
  market: string;            // 'Singapore' | 'Hong Kong' | ...
  segment: string;           // 'Corporate' | 'Financial Institution' | 'SME' | 'Government'
  priceType: 'FLAT' | 'TIERED' | 'VOLUME' | 'ECR';
  currency: string;          // 'SGD' | 'HKD' | 'CNY' | 'JPY' | 'AUD'
  // 固定费率：flatAmount + flatUnit
  flatAmount?: number;
  flatUnit?: 'PER_MONTH' | 'PER_TRANSACTION' | 'PER_ACCOUNT';
  // 阶梯定价：tiers
  tiers?: PricingTier[];
  // ECR：参考利率
  ecrRate?: number;
  ecrCurrency?: string;
  description: string;
  effectiveFrom: string;
  effectiveTo?: string;
  category: 'STANDARD' | 'NEGOTIATED';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  updatedBy: string;
  updatedAt: string;
}

interface PricingTier {
  tierFrom: number;        // 起始交易量/余额
  tierTo?: number;         // 结束交易量/余额（null = 无上限）
  unit: string;            // 'SGD' | 'TXN'
  rate?: number;           // 百分比，如 0.1
  amount?: number;         // 固定金额
}
```

**Mock 数据示例**（至少覆盖 5 个市场 × 3 个产品 = 15 条以上）：

| Product | Market | Type | Rate |
|---------|--------|------|------|
| Cash Management | Singapore | FLAT | SGD 50/month |
| Cash Management | China | FLAT | CNY 300/month |
| Trade Finance | Hong Kong | TIERED | 0.10%–0.30% |
| FX Services | Japan | FLAT | JPY 5,000/transaction |
| Deposit Services | Australia | ECR | AUD BBSW + 0.25% |

---

## 5. Mock API

```
GET    /api/pricing/price-points              → { data: PricePoint[], total: number }
  params: product, market, segment, priceType, status, keyword, current, pageSize

POST   /api/pricing/price-points              → PricePoint       (新增)
PUT    /api/pricing/price-points/:id          → PricePoint       (更新)
PATCH  /api/pricing/price-points/:id/status   → PricePoint       (切换状态)
GET    /api/pricing/price-points/:id          → PricePoint       (详情)
```

---

## 6. 业务逻辑

### 阶梯定价展示
当 `priceType === 'TIERED'` 时，详情 Drawer 内展示 Tier 明细表格：

```
Tier  | Volume (SGD)          | Rate
------|----------------------|------
1     | 0 – 100,000           | 0.30%
2     | 100,001 – 500,000     | 0.20%
3     | 500,001+              | 0.10%
```

### ECR 定价说明
当 `priceType === 'ECR'` 时，展示参考利率公式：
`ECR Rate = Reference Rate (BBSW / HIBOR / SOFR) + Spread`

### 状态流转
`DRAFT → ACTIVE → INACTIVE`（不支持反向激活 INACTIVE）

---

## 7. 国际化 Key 列表

```
menu.pricing.price-book

pages.pricing.priceBook.title
pages.pricing.priceBook.subTitle
pages.pricing.priceBook.addPricePoint
pages.pricing.priceBook.stat.products
pages.pricing.priceBook.stat.activePoints
pages.pricing.priceBook.stat.markets
pages.pricing.priceBook.stat.standard
pages.pricing.priceBook.stat.negotiated
pages.pricing.priceBook.col.product
pages.pricing.priceBook.col.market
pages.pricing.priceBook.col.segment
pages.pricing.priceBook.col.priceType
pages.pricing.priceBook.col.currency
pages.pricing.priceBook.col.rateAmount
pages.pricing.priceBook.col.category
pages.pricing.priceBook.col.effectiveFrom
pages.pricing.priceBook.col.effectiveTo
pages.pricing.priceBook.col.status
pages.pricing.priceBook.col.updatedBy
pages.pricing.priceBook.col.updatedAt
pages.pricing.priceBook.col.actions
pages.pricing.priceBook.priceType.flat
pages.pricing.priceBook.priceType.tiered
pages.pricing.priceBook.priceType.volume
pages.pricing.priceBook.priceType.ecr
pages.pricing.priceBook.category.standard
pages.pricing.priceBook.category.negotiated
pages.pricing.priceBook.status.active
pages.pricing.priceBook.status.inactive
pages.pricing.priceBook.status.draft
pages.pricing.priceBook.tierTable.title
pages.pricing.priceBook.tierTable.tier
pages.pricing.priceBook.tierTable.volumeRange
pages.pricing.priceBook.tierTable.rate
pages.pricing.priceBook.form.section.market
pages.pricing.priceBook.form.section.product
pages.pricing.priceBook.form.section.pricing
pages.pricing.priceBook.form.section.period
pages.pricing.priceBook.form.section.status
pages.pricing.priceBook.form.product
pages.pricing.priceBook.form.market
pages.pricing.priceBook.form.segment
pages.pricing.priceBook.form.priceType
pages.pricing.priceBook.form.currency
pages.pricing.priceBook.form.flatAmount
pages.pricing.priceBook.form.flatUnit
pages.pricing.priceBook.form.description
pages.pricing.priceBook.msg.created
pages.pricing.priceBook.msg.updated
pages.pricing.priceBook.msg.saveFailed
pages.pricing.priceBook.action.view
pages.pricing.priceBook.action.edit
pages.pricing.priceBook.action.disable
pages.pricing.priceBook.action.enable
```

---

## 8. 文件结构

```
src/pages/pricing/price-book/
├── index.tsx
├── data.d.ts
└── service.ts

mock/pricing.ts        ← 与 pricing/rules 共用
```
