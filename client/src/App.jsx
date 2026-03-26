import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Charities from './pages/CharityListing';
import CharityDetail from './pages/CharityDetail';
import Subscribe from './pages/Subscribe';
import Dashboard from './pages/Dashboard';
import DrawResults from './pages/DrawResults';
import AdminDashboard from './pages/admin/AdminDashboard';
import WinnerUpload from './pages/WinnerUpload';
import InfoPages from './pages/InfoPages';
import NotFound from './pages/NotFound';

// Admin Sub-components for nested routing
import AdminOverview from './components/admin/AdminOverview';
import AdminUsers from './components/admin/AdminUsers';
import AdminDraws from './components/admin/AdminDraws';
import AdminCharities from './components/admin/AdminCharities';
import AdminWinners from './components/admin/AdminWinners';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="charities" element={<Charities />} />
        <Route path="charities/:id" element={<CharityDetail />} />
        <Route path="draws" element={<DrawResults />} />
        <Route path="faq" element={<InfoPages type="faq" />} />
        <Route path="terms" element={<InfoPages type="terms" />} />

        {/* Protected Auth Routes */}
        <Route path="subscribe" element={
          <ProtectedRoute disallowAdmin>
            <Subscribe />
          </ProtectedRoute>
        } />

        {/* Protected Subscriber Routes */}
        <Route path="dashboard" element={
          <ProtectedRoute requireSubscription>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="winnings/:id/upload" element={
          <ProtectedRoute requireSubscription>
            <WinnerUpload />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="draws" element={<AdminDraws />} />
          <Route path="charities" element={<AdminCharities />} />
          <Route path="winners" element={<AdminWinners />} />
        </Route>

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
