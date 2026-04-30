import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Row,
  Col,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  GiftOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { mockCouponTemplates } from '../../mock/pageManagement';
import type { CouponTemplate } from '../../mock/pageManagement';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CouponManagement() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 编辑状态
  const [editingCoupon, setEditingCoupon] = useState<CouponTemplate | null>(null);

  // 自动打开从页面详情跳转来的配置
  useEffect(() => {
    const openCouponId = localStorage.getItem('openCouponEdit');
    if (openCouponId) {
      const coupon = mockCouponTemplates.find(c => c.id === openCouponId);
      if (coupon) {
        setEditingCoupon(coupon);
      }
      localStorage.removeItem('openCouponEdit');
    }
  }, []);

  // 筛选数据
  const filteredData = mockCouponTemplates.filter(coupon => {
    const matchSearch = coupon.name.includes(searchText) || coupon.couponId.includes(searchText);
    const matchType = typeFilter ? coupon.type === typeFilter : true;
    const matchStatus = statusFilter ? coupon.status === statusFilter : true;
    return matchSearch && matchType && matchStatus;
  });

  const handleBack = () => {
    const sourcePageId = localStorage.getItem('sourcePageId');
    if (sourcePageId) {
      navigate(`/pages/detail/${sourcePageId}`);
      localStorage.removeItem('sourcePageId');
    } else {
      navigate('/ai-create');
    }
  };

  const handleEdit = (coupon: CouponTemplate) => {
    setEditingCoupon(coupon);
  };

  const handleCancelEdit = () => {
    setEditingCoupon(null);
  };

  const handleSave = () => {
    message.success('优惠券配置已保存');
    setEditingCoupon(null);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '券模板ID',
      dataIndex: 'templateId',
      key: 'templateId',
      width: 120,
    },
    {
      title: '券名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <GiftOutlined style={{ color: '#faad14' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '券类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          cash: { color: 'green', text: '立减券' },
          discount: { color: 'blue', text: '折扣券' },
          gift: { color: 'purple', text: '礼品券' },
        };
        const { color, text } = typeMap[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '面值/折扣',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value: string, _record: CouponTemplate) => (
        <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{value}</span>
      ),
    },
    {
      title: '有效期（天）',
      dataIndex: 'validityDays',
      key: 'validityDays',
      width: 100,
    },
    {
      title: '每人限领',
      key: 'limitPerUser',
      width: 100,
      render: (_: any, record: CouponTemplate) => (
        <span>{record.aiDraftConfig?.limitPerUser || '-'} 张</span>
      ),
    },
    {
      title: '总数量',
      key: 'totalQuantity',
      width: 100,
      render: (_: any, record: CouponTemplate) => (
        <span>{record.aiDraftConfig?.totalQuantity || '-'} 张</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          active: { color: 'success', text: '进行中' },
          pending: { color: 'warning', text: '未开始' },
          ended: { color: 'default', text: '已结束' },
          draft: { color: 'processing', text: '草稿' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: CouponTemplate) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  // 编辑表单
  if (editingCoupon) {
    return (
      <div style={{ padding: 24 }}>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={handleCancelEdit}>
                返回列表
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                编辑优惠券 - {editingCoupon.name}
              </Title>
            </Space>
            <Space>
              <Button onClick={handleCancelEdit}>取消</Button>
              <Button type="primary" onClick={handleSave}>保存</Button>
            </Space>
          </div>
        </Card>

        <Card title="优惠券配置" style={{ maxWidth: 1000 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 基础信息 */}
            <Card size="small" title={<Text strong>基础信息</Text>}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text type="secondary">券模板ID</Text>
                      <Input value={editingCoupon.couponId} readOnly style={{ marginTop: 4 }} />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text type="secondary">优惠券名称</Text>
                      <Input
                        value={editingCoupon.aiDraftConfig?.couponName || editingCoupon.name}
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text type="secondary">券类型</Text>
                      <Select
                        value={editingCoupon.aiDraftConfig?.couponType || editingCoupon.type}
                        style={{ width: '100%', marginTop: 4 }}
                      >
                        <Option value="discount">折扣券</Option>
                        <Option value="cash">立减券</Option>
                        <Option value="gift">礼品券</Option>
                      </Select>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text type="secondary">优惠值</Text>
                      <Input
                        value={editingCoupon.aiDraftConfig?.discountValue || editingCoupon.value}
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text type="secondary">最低订单金额</Text>
                      <Input
                        value={editingCoupon.aiDraftConfig?.minOrderAmount}
                        prefix="¥"
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text type="secondary">有效期（天）</Text>
                      <Input
                        value={editingCoupon.aiDraftConfig?.validityDays}
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  </Col>
                </Row>
              </Space>
            </Card>

            {/* 发放设置 */}
            <Card size="small" title={<Text strong>发放设置</Text>}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text type="secondary">每人限领</Text>
                      <Input
                        value={editingCoupon.aiDraftConfig?.limitPerUser}
                        suffix="张"
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text type="secondary">总数量</Text>
                      <Input
                        value={editingCoupon.aiDraftConfig?.totalQuantity}
                        suffix="张"
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  </Col>
                </Row>
                <div>
                  <Text type="secondary">使用范围</Text>
                  <Select
                    mode="multiple"
                    value={editingCoupon.aiDraftConfig?.usageScope}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    <Option value="all">全场通用</Option>
                    <Option value="store">门店</Option>
                    <Option value="miniapp">小程序</Option>
                    <Option value="delivery">外卖</Option>
                  </Select>
                </div>
              </Space>
            </Card>

            {/* 使用说明 */}
            <Card size="small" title={<Text strong>使用说明</Text>}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">使用说明</Text>
                <Input.TextArea
                  value={editingCoupon.aiDraftConfig?.description}
                  rows={4}
                  style={{ marginTop: 4 }}
                />
              </Space>
            </Card>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 顶部导航 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回详情
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              优惠券模板管理
            </Title>
          </Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新增券模板
          </Button>
        </div>
      </Card>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <Space>
            <Text type="secondary">券名称/ID:</Text>
            <Input
              placeholder="请输入"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
          </Space>
          <Space>
            <Text type="secondary">券类型:</Text>
            <Select
              placeholder="全部"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="cash">立减券</Option>
              <Option value="discount">折扣券</Option>
              <Option value="gift">礼品券</Option>
            </Select>
          </Space>
          <Space>
            <Text type="secondary">状态:</Text>
            <Select
              placeholder="全部"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="active">进行中</Option>
              <Option value="pending">未开始</Option>
              <Option value="ended">已结束</Option>
              <Option value="draft">草稿</Option>
            </Select>
          </Space>
          <Button type="primary">查询</Button>
          <Button>重置</Button>
        </Space>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
}
