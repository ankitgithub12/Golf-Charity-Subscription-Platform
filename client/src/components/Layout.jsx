import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './common/Navbar';
import Footer from './common/Footer';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content" style={{ minHeight: '80vh', paddingTop: '80px' }}>
        <Outlet />
      </main>
      <Footer />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  );
};

export default Layout;
