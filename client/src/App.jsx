import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Charities from './pages/CharityListing';
import CharityDetail from './pages/CharityDetail';
import Subscribe from './pages/Subscribe';
import Dashboard from './pages/Dashboard';
import Draws from './pages/DrawResults';
import AdminDashboard from './pages/admin/AdminDashboard';
import WinnerUpload from './pages/WinnerUpload';

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
        <Route path="charities" element={<Charities />} />
        <Route path="charities/:id" element={<CharityDetail />} />
        <Route path="draws" element={<Draws />} />

        {/* Protected Auth Routes */}
        <Route path="subscribe" element={
          <ProtectedRoute>
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
      </Route>
    </Routes>
  );
};

export default App;
