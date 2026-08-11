# 13 — 税务配置 Tax Configuration ✅ 已实现

**路由**：`/pricing-billing/regional/tax`  
**组件路径**：`src/pages/regional/tax/index.tsx`  
**菜单 i18n key**：`menu.regional.tax`  
**所属用例**：UC-1 区域适配与合规

> **实现状态**：此页面已完整实现，本文档作为参考说明。

---

## 1. 已实现功能

- ✅ APAC 5 市场（SG / HK / CN / JP / AU）税务规则集中管理
- ✅ 统计卡：APAC Jurisdictions / Active Tax Rules / GST·VAT Rules / WHT Rules
- ✅ 计费流程横幅（Billing → Tax Determination → Tax Rule → Tax Calculation → Invoice）
- ✅ ProTable：13 列，支持列过滤、排序、列状态持久化
- ✅ 新增/编辑 Drawer（6 Section ProForm）
- ✅ 查看 Drawer（ProDescriptions）
- ✅ Tax Calculation Preview（前端实时计算，支持 Tax Inclusive / Exclusive / Exempt）
- ✅ 启用/禁用规则（含 Modal 确认）
- ✅ 完整 i18n（`useIntl()`，en-US + zh-CN）
- ✅ Mock API（CRUD + toggle-status）

---

## 2. Mock 数据概览

18 条规则，覆盖：

| Market | Tax Types | Rules |
|--------|-----------|-------|
| Singapore | GST (9%), WHT (10%) | 3 |
| Hong Kong | WHT (15%), Exempt (0%) | 2 |
| China | VAT (6%), WHT (10%) | 3 |
| Japan | Consumption Tax (10%), Zero Rated (0%) | 3 |
| Australia | GST (10%), Input Taxed (0%), WHT (10%) | 3 |

---

## 3. 数据结构

```typescript
// mock/taxConfig.ts

interface TaxRule {
  id: string;
  jurisdiction: string;
  taxType: string;              // 'GST' | 'VAT' | 'WHT' | 'Consumption Tax'
  taxName: string;
  taxCode: string;
  productService: string;
  applicability: string;
  customerType: string;
  customerTaxStatus: string;
  serviceLocation: string;
  customerLocation: string;
  rate: number;
  taxTreatment: string;         // 'Tax Exclusive' | 'Tax Inclusive' | 'Tax Exempt' | 'Zero Rated'
  calculationMethod: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE';
  currency: string;
  taxAuthority: string;
  updatedBy: string;
  updatedAt: string;
}
```

---

## 4. Mock API

```
GET    /api/regional/tax-rules                         → { success, data: TaxRule[] }
POST   /api/regional/tax-rules                         → { success, data: TaxRule }
PUT    /api/regional/tax-rules/:id                     → { success, data: TaxRule }
PATCH  /api/regional/tax-rules/:id/toggle-status       → { success, data: TaxRule }
```

---

## 5. 业务关联

此页面的税务规则被 **Invoice Management**（`/pricing-billing/billing/invoice`）引用：
- 发票详情中展示适用的 `taxRuleId` + `taxRuleName`
- 链接回本页面对应规则行（体现 Tax Configuration → Invoice 业务闭环）

---

## 6. 国际化 Key 前缀

所有 key 以 `pages.regional.tax.*` 为前缀，详见：
- `src/locales/en-US/pages.ts`
- `src/locales/zh-CN/pages.ts`

---

## 7. 文件位置

```
src/pages/regional/tax/index.tsx     ← 主页面
mock/taxConfig.ts                    ← Mock 数据与处理器
```
