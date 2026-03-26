import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Heart, Trophy, CreditCard, Clock } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate days until end of month for the badge
  const daysUntilDraw = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Charities', path: '/charities', icon: <Heart size={18} /> },
    { name: 'Draws', path: '/draws', icon: <Trophy size={18} /> },
  ];

  const authLinks = user ? [
    // If admin, primary link is Admin panel. If user, primary link is Dashboard.
    user.role === 'admin' 
      ? { name: 'Admin Panel', path: '/admin', icon: <UserIcon size={18} /> }
      : { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Subscribe', path: '/subscribe', icon: <CreditCard size={18} /> },
  ] : [
    { name: 'Login', path: '/login' },
    { name: 'Join Now', path: '/register', className: 'btn btn-primary' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <motion.div className="scroll-progress-bar" style={{ scaleX }} />
      <div className="container nav-content">
        <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
          <span className="logo-icon">⛳</span>
          <span className="logo-text">Golf<span>Hero</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links desktop">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className={location.pathname === link.path ? 'active' : ''}>
              {link.name}
              {link.name === 'Draws' && (
                <span className="nav-badge pulse">
                  <Clock size={10} /> {daysUntilDraw}d
                </span>
              )}
            </Link>
          ))}
          <div className="nav-divider"></div>
          {user ? (
            <>
              {authLinks.map(link => (
                <Link key={link.path} to={link.path} className={location.pathname === link.path ? 'active' : ''}>
                  {link.name}
                </Link>
              ))}
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            authLinks.map(link => (
              <Link key={link.path} to={link.path} className={link.className || ''}>
                {link.name}
              </Link>
            ))
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu animate-fade-in">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                {link.icon} {link.name}
              </Link>
            ))}
            <div className="mobile-divider"></div>
            {user ? (
              <>
                {authLinks.map(link => (
                  <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                    {link.icon} {link.name}
                  </Link>
                ))}
                <button onClick={handleLogout} className="mobile-logout">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              authLinks.map(link => (
                <Link key={link.path} to={link.path} className={link.className || ''} onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              ))
            )}
          </div>
        )}
      </div>
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 1.5rem 0;
          transition: var(--transition);
        }
        .navbar.scrolled {
          padding: 1rem 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
        }
        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 800;
        }
        .logo-text span {
          color: var(--primary);
        }
        .scroll-progress-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
          transform-origin: 0%;
          z-index: 1001;
        }
        .nav-links.desktop {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-links.desktop a {
          position: relative;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav-badge {
          font-size: 0.65rem;
          padding: 0.15rem 0.4rem;
          background: rgba(16, 185, 129, 0.15);
          color: var(--primary);
          border-radius: 4px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .nav-links.desktop a:hover, .nav-links.desktop a.active {
          color: var(--text-main);
        }
        .nav-divider {
          width: 1px;
          height: 20px;
          background: var(--glass-border);
        }
        .logout-btn {
          color: var(--text-dim);
        }
        .logout-btn:hover {
          color: var(--error);
        }
        .mobile-toggle {
          display: none;
          color: var(--text-main);
        }
        .mobile-menu {
          position: fixed;
          top: 70px;
          left: 0;
          width: 100%;
          background: var(--bg-dark);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }
        .mobile-menu a, .mobile-logout {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.125rem;
          color: var(--text-muted);
        }
        .mobile-logout {
          color: var(--error);
          width: 100%;
          text-align: left;
          padding: 0;
        }
        @media (max-width: 768px) {
          .nav-links.desktop { display: none; }
          .mobile-toggle { display: block; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
