type MockResponse = { data: unknown; success: true };

const customers = [
  { id: 'CUST-SG-001', name: 'Singapore Corporate', market: 'Singapore', segment: 'Corporate', performanceStatus: 'ON_TRACK' },
  { id: 'CUST-JP-002', name: 'Japan FI', market: 'Japan', segment: 'Financial Institution', performanceStatus: 'AT_RISK' },
  { id: 'CUST-CN-003', name: 'China Corporate', market: 'China', segment: 'Corporate', performanceStatus: 'ON_TRACK' },
  { id: 'CUST-AU-004', name: 'Australia SME', market: 'Australia', segment: 'SME', performanceStatus: 'UNDER_PERFORMING' },
];

const response = (data: unknown): MockResponse => ({ data, success: true });

export default {
  'GET /api/customers': (_req: unknown, res: { json: (body: MockResponse) => void }) => res.json(response(customers)),
  'GET /api/customers/:id': (req: { params: { id: string } }, res: { json: (body: MockResponse) => void }) => res.json(response(customers.find((item) => item.id === req.params.id) ?? customers[0])),
  'GET /api/customers/:id/pricing-summary': (_req: unknown, res: { json: (body: MockResponse) => void }) => res.json(response([{ product: 'Cash Management', baseRate: '0.18%', appliedRate: '0.15%', scope: 'Relationship tier' }, { product: 'FX Services', baseRate: '0.12%', appliedRate: '0.10%', scope: 'Deal specific' }])),
  'GET /api/customers/:id/billing-history': (_req: unknown, res: { json: (body: MockResponse) => void }) => res.json(response([{ period: '2026-07', amount: '412,000', status: 'ISSUED' }, { period: '2026-06', amount: '395,000', status: 'PAID' }])),
  'GET /api/customers/:id/recent-invoices': (_req: unknown, res: { json: (body: MockResponse) => void }) => res.json(response([{ invoiceNo: 'INV-2026-0811', status: 'ISSUED' }, { invoiceNo: 'INV-2026-0806', status: 'PAID' }])),
  'GET /api/customers/:id/recommendations': (_req: unknown, res: { json: (body: MockResponse) => void }) => res.json(response([{ id: 'REC-001', priority: 'HIGH', status: 'PENDING' }])),
  'GET /api/customers/:id/alerts': (_req: unknown, res: { json: (body: MockResponse) => void }) => res.json(response([{ id: 'ALERT-1001', severity: 'HIGH', type: 'REVENUE_LEAKAGE' }])),
};