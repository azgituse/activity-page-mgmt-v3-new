import { ConfigProvider } from 'antd';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import BasicLayout from './layouts/BasicLayout';

const PageManagement = lazy(() => import('./pages/PageManagement'));
const PageDetail = lazy(() => import('./pages/PageDetail'));
const PageEditor = lazy(() => import('./pages/PageEditor'));
const PlayManagement = lazy(() => import('./pages/PlayManagement'));
const TaskManagement = lazy(() => import('./pages/TaskManagement'));
const CouponManagement = lazy(() => import('./pages/CouponManagement'));
const ActivityPageList = lazy(() => import('./pages/ActivityPageList'));

// 全屏布局（用于页面详情编辑器）
const FullscreenLayout = () => {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>加载中...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/ai-create" replace />} />
        <Route path="/pages" element={<BasicLayout />}>
          <Route index element={<ActivityPageList />} />
        </Route>
        <Route path="/ai-create" element={<BasicLayout />}>
          <Route index element={<PageManagement />} />
        </Route>
        <Route path="/pages/detail/:id" element={
          <div style={{ height: '100vh', overflow: 'hidden' }}>
            <PageDetail />
          </div>
        } />
        <Route path="/editor/page/:id" element={
          <div style={{ height: '100vh', overflow: 'hidden' }}>
            <PageEditor />
          </div>
        } />
        <Route path="/plays" element={<BasicLayout />}>
          <Route index element={<PlayManagement />} />
        </Route>
        <Route path="/tasks" element={<BasicLayout />}>
          <Route index element={<TaskManagement />} />
        </Route>
        <Route path="/coupons" element={<BasicLayout />}>
          <Route index element={<CouponManagement />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#52c41a',
        },
      }}
    >
      <HashRouter>
        <FullscreenLayout />
      </HashRouter>
    </ConfigProvider>
  );
}

export default App;
