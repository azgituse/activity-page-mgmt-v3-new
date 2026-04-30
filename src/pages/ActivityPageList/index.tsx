import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  message,
  Typography,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { mockPages } from '../../mock/pageManagement';
import type { ActivityPage } from '../../mock/pageManagement';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ActivityPageList() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pages, setPages] = useState<ActivityPage[]>(mockPages);

  // 筛选数据
  const filteredData = pages.filter(page => {
    const matchSearch = !searchText ||
      page.pageName.toLowerCase().includes(searchText.toLowerCase()) ||
      page.pageId.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || page.bizStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleBack = () => {
    navigate('/ai-create');
  };

  const handleEdit = (page: ActivityPage) => {
    navigate(`/editor/page/${page.id}`);
  };

  const handleCopy = (page: ActivityPage) => {
    message.success(`已复制页面: ${page.pageName}`);
  };

  const handleDeploy = (page: ActivityPage) => {
    message.success(`投放页面: ${page.pageName}`);
  };

  const handleToggleStatus = (page: ActivityPage) => {
    const newStatus = page.bizStatus === 'enabled' ? 'disabled' : 'enabled';
    setPages(prev => prev.map(p =>
      p.id === page.id ? { ...p, bizStatus: newStatus } : p
    ));
    message.success(`${page.pageName} 已${newStatus === 'enabled' ? '启用' : '停用'}`);
  };

  const handleData = (page: ActivityPage) => {
    message.info(`查看数据: ${page.pageName}`);
  };

  const getStatusTag = (bizStatus: string) => {
    switch (bizStatus) {
      case 'enabled':
        return <Tag color="success">已启用</Tag>;
      case 'disabled':
        return <Tag color="default">已停用</Tag>;
      case 'draft':
        return <Tag color="warning">草稿</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
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
      title: '页面ID',
      dataIndex: 'pageId',
      key: 'pageId',
      width: 120,
      render: (text: string) => (
        text === '待生成' ? (
          <Tag color="default">待生成</Tag>
        ) : (
          <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{text}</span>
        )
      ),
    },
    {
      title: '页面名称',
      dataIndex: 'pageName',
      key: 'pageName',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '创建/更新时间',
      key: 'time',
      width: 180,
      render: (_: any, record: ActivityPage) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>创建: {record.createTime}</Text>
          {record.publishTime && (
            <Text type="secondary" style={{ fontSize: 12 }}>发布: {record.publishTime}</Text>
          )}
        </Space>
      ),
    },
    {
      title: '创建/更新人',
      key: 'creator',
      width: 120,
      render: (_: any, record: ActivityPage) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{record.publisher || '何旭'}</Text>
        </Space>
      ),
    },
    {
      title: '页面状态',
      dataIndex: 'bizStatus',
      key: 'bizStatus',
      width: 100,
      render: (bizStatus: string) => getStatusTag(bizStatus),
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      render: (_: any, record: ActivityPage) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}
          >
            复制
          </Button>
          {record.bizStatus !== 'draft' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleDeploy(record)}
            >
              投放
            </Button>
          )}
          {record.bizStatus !== 'draft' && (
            <Space size="small">
              <Switch
                size="small"
                checked={record.bizStatus === 'enabled'}
                onChange={() => handleToggleStatus(record)}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.bizStatus === 'enabled' ? '启用' : '停用'}
              </Text>
            </Space>
          )}
          <Button
            type="link"
            size="small"
            icon={<LineChartOutlined />}
            onClick={() => handleData(record)}
          >
            数据
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 顶部导航 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              活动页面管理
            </Title>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/ai-create')}>
            新建页面
          </Button>
        </div>
      </Card>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <Space>
            <Text type="secondary">页面名称/ID:</Text>
            <Input
              placeholder="请输入"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
          </Space>
          <Space>
            <Text type="secondary">页面状态:</Text>
            <Select
              placeholder="全部"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="all">全部</Option>
              <Option value="enabled">已启用</Option>
              <Option value="disabled">已停用</Option>
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
