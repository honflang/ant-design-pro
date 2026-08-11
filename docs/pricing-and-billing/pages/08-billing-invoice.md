# 08 — 发票管理 Invoice Management

**路由**：`/pricing-billing/billing/invoice`  
**组件路径**：`src/pages/billing/invoice/index.tsx`  
**菜单 i18n key**：`menu.billing.invoice`  
**所属用例**：UC-1（合规发票）、UC-3（第 6 点：按需开票、更正重发）

---

## 1. 页面目的

发票管理展示所有已生成的发票，支持：
- 查看发票详情（含税额、税务规则来源）
- 按需开票（On-demand Invoice Generation）
- 发票更正（Correction）并重新生成（UC-3 第 6 点）
- 不同司法管辖区的合规发票格式展示（UC-1 第 3 点）

演示价值：
- Tax Configuration → Billing Run → Invoice 完整闭环的终点
- 展示合规发票（不同国家格式差异）
- 展示发票更正和重发能力

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│ Invoice Management                                               │
│ Generate, view and manage compliant invoices across markets     │
├──────────────────────────────────────────────────────────────────┤
│ [Total: 186]  [Draft: 5]  [Issued: 170]  [Corrected: 11]       │
│ [Total Billed: SGD 4.8M]                                        │
├──────────────────────────────────────────────────────────────────┤
│ [Market ▼] [Client ▼] [Period ▼] [Status ▼] [Search]           │
├──────────────────────────────────────────────────────────────────┤
│ Invoices              [+ Generate Invoice] [Bulk Download]      │
│                                                                  │
│ Invoice # │ Client │ Market │ Period │ Amount │ Tax │ Status│... │
│ INV-2026-001│ ACME │ SG     │ 2026-07│ SGD 15k│GST │ Issued│..│
│ INV-2026-002│ Daiwa│ JP     │ 2026-07│ JPY 2M │ CT │ Issued│..│
│ INV-2026-003│ CCB  │ CN     │ 2026-07│ CNY 80k│VAT │ Draft │..│
└──────────────────────────────────────────────────────────────────┘
```

发票详情 Drawer：
```
┌────────────────────────────────────────────────────────────────────┐
│ Invoice INV-2026-001                  [Download PDF] [Send] [Correct]│
│                                                                       │
│ ── Header ──────────────────────────────────────────────────────── │
│ To: ACME Corporation Pte. Ltd.       Invoice No: INV-2026-001       │
│ Market: Singapore                    Period:     2026-07-01~07-31   │
│ Tax Reg No: 123456789X               Issue Date: 2026-08-01         │
│                                                                       │
│ ── Line Items ──────────────────────────────────────────────────── │
│ Product      │ Description      │ Amount      │ Tax Rate │ Tax Amt  │
│ Cash Mgmt    │ Account Services │ SGD 5,100   │ 9% GST   │ SGD 459  │
│ Trade Finance│ LC Services      │ SGD 10,000  │ 9% GST   │ SGD 900  │
│ ─────────────┴──────────────────┴─────────────┴──────────┴────────│
│                        Sub Total:   SGD 15,100                       │
│                        GST (9%):    SGD 1,359                        │
│                        Total Due:   SGD 16,459                       │
│                                                                       │
│ ── Tax Rule Applied ──────────────────────────────────────────────│
│ Tax Rule: SG-GST-9 | Treatment: Tax Exclusive | Auth: IRAS          │
│ (链接到 /pricing-billing/regional/tax 对应规则)                                       │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心组件

| 区域 | 组件 | 说明 |
|------|------|------|
| 统计卡 | `StatisticCard.Group` | Total/Draft/Issued/Corrected/Total Billed |
| 发票列表 | `ProTable` | 含 Tax Type Tag |
| 发票详情 | `Drawer` + 自定义 Invoice 布局 | 模拟 Invoice 外观 |
| 更正发票 | `Modal` + 表单 | 填写更正原因 → 生成 Corrected Invoice |
| 生成发票 | `Modal` + `ProForm` | 选择 Run、Client、Format |

---

## 4. Mock 数据结构

```typescript
// mock/billing.ts (续)

type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'SENT' | 'CORRECTED' | 'CANCELLED' | 'OVERDUE';

interface Invoice {
  id: string;                    // 'INV-2026-001'
  billingRunId: string;
  clientId: string;
  clientName: string;
  clientTaxRegNo?: string;
  market: string;
  billingPeriodFrom: string;
  billingPeriodTo: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  taxType: string;               // 'GST' | 'VAT' | 'WHT' | 'Consumption Tax'
  taxRate: number;
  taxRuleId: string;             // 关联 /regional/tax 中的 TaxRule.id
  taxRuleName: string;
  invoiceFormat: string;         // 'PDF' | 'ISO20022' | 'MT940'
  lineItems: InvoiceLineItem[];
  status: InvoiceStatus;
  // 更正
  isCorrection: boolean;
  originalInvoiceId?: string;
  correctionReason?: string;
  createdBy: string;
  createdAt: string;
}

interface InvoiceLineItem {
  product: string;
  description: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}
```

---

## 5. Mock API

```
GET    /api/billing/invoices                    → { data: Invoice[], total: number }
  params: market, clientId, period, status, keyword, current, pageSize

GET    /api/billing/invoices/:id                → Invoice

# 按需生成
POST   /api/billing/invoices                    → Invoice (status=DRAFT)

# 发出（DRAFT → ISSUED）
POST   /api/billing/invoices/:id/issue          → Invoice

# 更正发票（生成一张新 Invoice，originalInvoiceId 指向原单）
POST   /api/billing/invoices/:id/correct
  body: { reason: string, adjustedLineItems?: InvoiceLineItem[] }
  → Invoice (isCorrection=true)

# 下载（Mock：返回固定 Blob 或触发前端生成 PDF 占位）
GET    /api/billing/invoices/:id/download       → file
```

---

## 6. 业务逻辑

### 合规发票格式（UC-1 第 3 点）
发票详情根据 `market` 展示对应格式说明：

| Market | Tax Type | Invoice Note |
|--------|---------|--------------|
| Singapore | GST 9% | IRAS-compliant, Tax Reg. No. required |
| China | VAT 6% | Fapiao number required |
| Japan | Consumption Tax 10% | Qualified Invoice (T-number) |
| Hong Kong | N/A (Exempt) | No tax line required |
| Australia | GST 10% | ABN required |

### 发票更正流程（UC-3 第 6 点）
1. 对 `ISSUED` 发票点击 "Correct"
2. Modal 中填写更正原因（Pricing Error / Volume Correction / Tax Rate Change / ...）
3. 可选：修改 Line Items 金额
4. 确认后：原发票状态改为 `CORRECTED`，生成新的 Corrected Invoice

### 税务规则溯源
发票详情底部展示所应用的税务规则来源，链接到 `/pricing-billing/regional/tax` 对应条目，体现 Tax Configuration → Invoice 的业务闭环。

---

## 7. 国际化 Key 列表

```
menu.billing.invoice

pages.billing.invoice.title
pages.billing.invoice.subTitle
pages.billing.invoice.generate
pages.billing.invoice.bulkDownload
pages.billing.invoice.stat.total
pages.billing.invoice.stat.draft
pages.billing.invoice.stat.issued
pages.billing.invoice.stat.corrected
pages.billing.invoice.stat.totalBilled
pages.billing.invoice.col.invoiceNo
pages.billing.invoice.col.client
pages.billing.invoice.col.market
pages.billing.invoice.col.period
pages.billing.invoice.col.subTotal
pages.billing.invoice.col.taxType
pages.billing.invoice.col.taxAmount
pages.billing.invoice.col.totalAmount
pages.billing.invoice.col.status
pages.billing.invoice.col.issueDate
pages.billing.invoice.col.actions
pages.billing.invoice.status.draft
pages.billing.invoice.status.issued
pages.billing.invoice.status.sent
pages.billing.invoice.status.corrected
pages.billing.invoice.status.cancelled
pages.billing.invoice.action.view
pages.billing.invoice.action.issue
pages.billing.invoice.action.correct
pages.billing.invoice.action.download
pages.billing.invoice.action.send
pages.billing.invoice.detail.header
pages.billing.invoice.detail.lineItems
pages.billing.invoice.detail.taxRule
pages.billing.invoice.detail.subTotal
pages.billing.invoice.detail.taxTotal
pages.billing.invoice.detail.grandTotal
pages.billing.invoice.correct.title
pages.billing.invoice.correct.reason
pages.billing.invoice.correct.adjustItems
pages.billing.invoice.msg.generated
pages.billing.invoice.msg.issued
pages.billing.invoice.msg.corrected
pages.billing.invoice.msg.opFailed
```

---

## 8. 文件结构

```
src/pages/billing/invoice/
├── index.tsx
├── data.d.ts
└── service.ts

mock/billing.ts
```
