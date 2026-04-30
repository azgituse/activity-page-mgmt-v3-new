import { Layout, Menu, theme, Space, Badge, Avatar, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BellOutlined,
  GiftOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const BasicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTopMenu, setActiveTopMenu] = useState<string>('marketing');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 根据路由自动同步顶部菜单选中状态
  useEffect(() => {
    const path = location.pathname;
    if (path === '/coupons') {
      setActiveTopMenu('rewards');
    } else if (
      path === '/ai-create' ||
      path === '/pages' ||
      path.startsWith('/pages/detail') ||
      path.startsWith('/editor') ||
      path === '/plays' ||
      path === '/tasks'
    ) {
      setActiveTopMenu('marketing');
    }
  }, [location.pathname]);

  const topMenuItems = [
    { key: 'home', label: '首页' },
    { key: 'marketing', label: '营销中心' },
    { key: 'rewards', label: '奖励中心' },
    { key: 'member', label: '会员' },
    { key: 'tech', label: '技术中心' },
  ];

  // 营销中心下的左侧菜单
  const marketingSiderItems = [
    {
      key: 'promotions',
      icon: <GiftOutlined />,
      label: '促销活动',
    },
    {
      key: 'new-marketing',
      icon: <RocketOutlined />,
      label: '新营销平台',
      children: [
        { key: 'ai-create', label: '智能建活动' },
        { key: 'pages', label: '活动页面管理' },
        { key: 'plays', label: '玩法管理' },
        { key: 'tasks', label: '营销任务管理' },
      ],
    },
  ];

  // 奖励中心下的左侧菜单
  const rewardsSiderItems = [
    {
      key: 'coupon-mgmt',
      icon: <GiftOutlined />,
      label: '优惠券管理',
      children: [
        { key: 'coupon-templates', label: '优惠券模板管理' },
      ],
    },
  ];

  const getSelectedSiderKey = () => {
    if (location.pathname === '/pages' || location.pathname.startsWith('/pages/detail') || location.pathname.startsWith('/editor')) {
      return ['new-marketing', 'pages'];
    }
    if (location.pathname === '/ai-create') return ['new-marketing', 'ai-create'];
    if (location.pathname === '/plays') return ['new-marketing', 'plays'];
    if (location.pathname === '/tasks') return ['new-marketing', 'tasks'];
    if (location.pathname === '/coupons') return ['coupon-mgmt', 'coupon-templates'];
    return ['new-marketing', 'ai-create'];
  };

  const siderTitle = activeTopMenu === 'rewards' ? 'REWARDS' : 'MARKETING';
  const currentSiderItems = activeTopMenu === 'rewards' ? rewardsSiderItems : marketingSiderItems;
  const defaultOpenKeys = activeTopMenu === 'rewards' ? ['coupon-mgmt'] : ['new-marketing'];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
        }}
      >
        <Space style={{ marginRight: 32 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: '#52c41a',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>C</span>
          </div>
          <Text strong style={{ fontSize: 16 }}>会员营销</Text>
        </Space>
        <Menu
          mode="horizontal"
          selectedKeys={[activeTopMenu]}
          items={topMenuItems}
          onClick={({ key }) => {
            setActiveTopMenu(key);
            if (key === 'marketing') navigate('/ai-create');
            if (key === 'rewards') navigate('/coupons');
          }}
          style={{
            flex: 1,
            borderBottom: 'none',
            fontSize: 14,
          }}
        />
        <Space>
          <Badge dot>
            <BellOutlined style={{ fontSize: 18, color: '#8c8c8c', cursor: 'pointer' }} />
          </Badge>
          <Avatar size="small" style={{ backgroundColor: '#87d068' }}>何</Avatar>
          <Text>何旭</Text>
        </Space>
      </Header>
      <Layout>
        <Sider
          width={200}
          style={{
            background: '#f5f5f5',
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              fontSize: 12,
              color: '#8c8c8c',
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            {siderTitle}
          </div>
          <Menu
            mode="inline"
            defaultOpenKeys={defaultOpenKeys}
            selectedKeys={getSelectedSiderKey()}
            items={currentSiderItems}
            onClick={({ key }) => {
              if (key === 'pages') navigate('/pages');
              if (key === 'ai-create') navigate('/ai-create');
              if (key === 'plays') navigate('/plays');
              if (key === 'tasks') navigate('/tasks');
              if (key === 'coupon-templates') navigate('/coupons');
            }}
            style={{
              background: 'transparent',
              borderRight: 'none',
            }}
          />
        </Sider>
        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          <div
            style={{
              background: colorBgContainer,
              minHeight: 280,
              padding: 24,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
