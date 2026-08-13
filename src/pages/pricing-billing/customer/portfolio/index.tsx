import { EyeOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProCard, ProDescriptions, ProForm, ProFormSelect, ProFormText, ProFormTextArea, ProTable, StatisticCard } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Drawer, Dropdown, Modal, Space, Tag } from 'antd';
import React, { useState } from 'react';

type GroupStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'INACTIVE';

type GroupRecord = {
  id: string;
  name: string;
  memberCount: number;
  pricingLevel: 'P2' | 'P3' | 'P4';
  avgDiscount: string;
  totalRevenue: string;
  marketsCovered: string;
  status: GroupStatus;
  createdBy: string;
  createdAt: string;
  description: string;
};

const initialGroups: GroupRecord[] = [
  { id: 'GROUP-01', name: 'Premium Corporate', memberCount: 18, pricingLevel: 'P2', avgDiscount: '6.5%', totalRevenue: 'SGD 9.2M', marketsCovered: 'SG/HK/AU', status: 'ACTIVE', createdBy: 'Avery Chan', createdAt: '2026-05-12', description: 'Top-tier corporate clients with strategic treasury footprint.' },
  { id: 'GROUP-02', name: 'Standard Corporate', memberCount: 32, pricingLevel: 'P3', avgDiscount: '9.5%', totalRevenue: 'SGD 14.4M', marketsCovered: 'SG/CN/JP', status: 'ACTIVE', createdBy: 'Liam Tan', createdAt: '2026-04-18', description: 'Mid-tier corporates with steady transaction growth.' },
  { id: 'GROUP-03', name: 'SME Group', memberCount: 26, pricingLevel: 'P4', avgDiscount: '12.0%', totalRevenue: 'SGD 7.1M', marketsCovered: 'HK/JP/AU', status: 'UNDER_REVIEW', createdBy: 'Mio Kato', createdAt: '2026-06-02', description: 'SME clients with tactical discount strategy.' },
];

const statusColors = { ACTIVE: 'success', UNDER_REVIEW: 'processing', INACTIVE: 'default' };

const CustomerPortfolioPage: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [groups, setGroups] = useState(initialGroups);
  const [detail, setDetail] = useState<GroupRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupRecord | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const openNewGroup = () => {
    setEditingGroup(null);
    setOpen(true);
  };

  const openEditGroup = (group: GroupRecord) => {
    setEditingGroup(group);
    setOpen(true);
  };

  const columns: ProColumns<GroupRecord>[] = [
    { title: t('pages.customer.portfolio.col.groupId'), dataIndex: 'id' },
    { title: t('pages.customer.portfolio.col.groupName'), dataIndex: 'name' },
    { title: t('pages.customer.portfolio.col.memberCount'), dataIndex: 'memberCount' },
    { title: t('pages.customer.portfolio.col.pricingLevel'), dataIndex: 'pricingLevel' },
    { title: t('pages.customer.portfolio.col.avgDiscount'), dataIndex: 'avgDiscount' },
    { title: t('pages.customer.portfolio.col.totalRevenueMtd'), dataIndex: 'totalRevenue' },
    { title: t('pages.customer.portfolio.col.marketsCovered'), dataIndex: 'marketsCovered' },
    {
      title: t('pages.customer.portfolio.col.status'),
      dataIndex: 'status',
      render: (_, row) => <Tag color={statusColors[row.status]}>{t(`pages.customer.portfolio.status.${row.status.toLowerCase()}`)}</Tag>,
    },
    { title: t('pages.customer.portfolio.col.createdBy'), dataIndex: 'createdBy' },
    { title: t('pages.customer.portfolio.col.createdAt'), dataIndex: 'createdAt' },
    {
      title: t('pages.customer.portfolio.col.actions'),
      render: (_, row) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: t('pages.customer.portfolio.action.viewGroup'), icon: <EyeOutlined />, onClick: () => setDetail(row) },
              { key: 'edit', label: t('pages.customer.portfolio.action.editGroup'), icon: <MoreOutlined />, onClick: () => openEditGroup(row) },
              { key: 'assign', label: t('pages.customer.portfolio.action.assignGroup'), icon: <MoreOutlined />, onClick: () => setAssignOpen(true) },
              { key: 'bulk', label: t('pages.customer.portfolio.action.bulkPricing'), icon: <MoreOutlined />, onClick: () => setBulkOpen(true) },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('pages.customer.portfolio.title')}
      subTitle={t('pages.customer.portfolio.subTitle')}
      extra={[
        <Button key="new" type="primary" icon={<PlusOutlined />} onClick={openNewGroup}>
          {t('pages.customer.portfolio.action.newGroup')}
        </Button>,
      ]}
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard statistic={{ title: t('pages.customer.portfolio.stat.totalClients'), value: 128 }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.portfolio.stat.totalGroups'), value: groups.length }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.portfolio.stat.portfolioRevenueMtd'), value: 'SGD 42.1M' }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: t('pages.customer.portfolio.stat.avgDealSize'), value: 'SGD 1.3M' }} />
      </StatisticCard.Group>

      <ProCard>
        <ProTable
          rowKey="id"
          search={false}
          options={false}
          dataSource={groups}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </ProCard>

      <Drawer open={!!detail} onClose={() => setDetail(null)} width={640} title={detail?.name ?? ''}>
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <ProDescriptions
              title={t('pages.customer.portfolio.drawer.groupProfile')}
              column={2}
              dataSource={detail}
              columns={[
                { title: t('pages.customer.portfolio.col.groupName'), dataIndex: 'name' },
                { title: t('pages.customer.portfolio.col.memberCount'), dataIndex: 'memberCount' },
                { title: t('pages.customer.portfolio.col.pricingLevel'), dataIndex: 'pricingLevel' },
                { title: t('pages.customer.portfolio.col.avgDiscount'), dataIndex: 'avgDiscount' },
                { title: t('pages.customer.portfolio.col.totalRevenueMtd'), dataIndex: 'totalRevenue' },
                { title: t('pages.customer.portfolio.col.marketsCovered'), dataIndex: 'marketsCovered' },
                {
                  title: t('pages.customer.portfolio.col.status'),
                  render: () => <Tag color={statusColors[detail.status]}>{t(`pages.customer.portfolio.status.${detail.status.toLowerCase()}`)}</Tag>,
                },
              ]}
            />
            <ProCard title={t('pages.customer.portfolio.drawer.bulkPreview')} size="small">
              <p>{t('pages.customer.portfolio.drawer.targetClients')}: {detail.memberCount}</p>
              <p>{t('pages.customer.portfolio.drawer.adjustmentType')}: Discount</p>
              <p>{t('pages.customer.portfolio.drawer.adjustmentValue')}: -0.50%</p>
              <p>{t('pages.customer.portfolio.drawer.effectivePeriod')}: 2026-09 ~ 2026-12</p>
              <p>{t('pages.customer.portfolio.drawer.approvalRequirement')}: {t('pages.customer.portfolio.drawer.required')}</p>
            </ProCard>
          </Space>
        )}
      </Drawer>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editingGroup ? t('pages.customer.portfolio.modal.editTitle') : t('pages.customer.portfolio.modal.newTitle')}
        width={640}
      >
        <ProForm
          initialValues={
            editingGroup
              ? {
                  groupName: editingGroup.name,
                  description: editingGroup.description,
                  pricingLevel: editingGroup.pricingLevel,
                  status: editingGroup.status,
                }
              : {
                  groupName: 'Strategic Corporate',
                  description: 'High-value clients with cross-border treasury requirements.',
                  pricingLevel: 'P2',
                  status: 'ACTIVE',
                }
          }
          submitter={{ searchConfig: { submitText: t('pages.customer.portfolio.action.saveGroup') } }}
          onFinish={async (values) => {
            if (editingGroup) {
              setGroups((prev) =>
                prev.map((item) =>
                  item.id === editingGroup.id
                    ? {
                        ...item,
                        name: values.groupName,
                        description: values.description,
                        pricingLevel: values.pricingLevel,
                        status: values.status,
                      }
                    : item,
                ),
              );
              message.success(t('pages.customer.portfolio.msg.groupUpdated', { id: editingGroup.id }));
            } else {
              const nextId = `GROUP-${String(groups.length + 1).padStart(2, '0')}`;
              setGroups((prev) => [
                {
                  id: nextId,
                  name: values.groupName,
                  description: values.description,
                  pricingLevel: values.pricingLevel,
                  status: values.status,
                  memberCount: 0,
                  avgDiscount: '0.0%',
                  totalRevenue: 'SGD 0.0M',
                  marketsCovered: '-',
                  createdBy: 'Current User',
                  createdAt: new Date().toISOString().slice(0, 10),
                },
                ...prev,
              ]);
              message.success(t('pages.customer.portfolio.msg.groupCreated', { id: nextId }));
            }
            setOpen(false);
            return true;
          }}
        >
          <ProFormText
            name="groupName"
            label={t('pages.customer.portfolio.form.groupName')}
            rules={[{ required: true, message: t('pages.customer.portfolio.form.groupNameRequired') }]}
          />
          <ProFormTextArea name="description" label={t('pages.customer.portfolio.form.description')} />
          <ProFormSelect
            name="pricingLevel"
            label={t('pages.customer.portfolio.form.pricingLevel')}
            options={[
              { value: 'P2', label: 'P2' },
              { value: 'P3', label: 'P3' },
              { value: 'P4', label: 'P4' },
            ]}
          />
          <ProFormSelect
            name="status"
            label={t('pages.customer.portfolio.form.status')}
            options={[
              { value: 'ACTIVE', label: t('pages.customer.portfolio.status.active') },
              { value: 'UNDER_REVIEW', label: t('pages.customer.portfolio.status.under_review') },
              { value: 'INACTIVE', label: t('pages.customer.portfolio.status.inactive') },
            ]}
          />
        </ProForm>
      </Drawer>

      <Modal open={assignOpen} onCancel={() => setAssignOpen(false)} footer={null} title={t('pages.customer.portfolio.modal.assignTitle')}>
        <ProForm
          submitter={{ searchConfig: { submitText: t('pages.customer.portfolio.action.assignGroup') } }}
          onFinish={async () => {
            setAssignOpen(false);
            message.success(t('pages.customer.portfolio.msg.assigned'));
            return true;
          }}
        >
          <ProFormSelect
            name="group"
            label={t('pages.customer.portfolio.form.targetGroup')}
            options={groups.map((item) => ({ label: item.name, value: item.id }))}
            rules={[{ required: true }]}
          />
        </ProForm>
      </Modal>

      <Modal open={bulkOpen} onCancel={() => setBulkOpen(false)} footer={null} title={t('pages.customer.portfolio.modal.bulkTitle')}>
        <ProForm
          submitter={{ searchConfig: { submitText: t('pages.customer.portfolio.action.bulkPricing') } }}
          onFinish={async () => {
            setBulkOpen(false);
            message.success(t('pages.customer.portfolio.msg.bulkSubmitted'));
            return true;
          }}
        >
          <ProFormSelect
            name="adjustmentType"
            label={t('pages.customer.portfolio.form.adjustmentType')}
            options={[
              { value: 'discount', label: 'Discount' },
              { value: 'surcharge', label: 'Surcharge' },
            ]}
            rules={[{ required: true }]}
          />
          <ProFormText
            name="adjustmentValue"
            label={t('pages.customer.portfolio.form.adjustmentValue')}
            rules={[{ required: true }]}
          />
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default CustomerPortfolioPage;
