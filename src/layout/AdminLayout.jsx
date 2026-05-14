import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Briefcase, 
  ClipboardCheck, CalendarCheck, Wallet, FileText, 
  BarChart3, Settings, LogOut, Search, Bell, Menu,
  ChevronDown, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';
import logo from '../assets/logo.jpeg';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Business Owners', path: '/clients', icon: Building2 },
    { name: 'Job Roles', path: '/jobs', icon: Briefcase },
    { name: 'Employees', path: '/employees', icon: ClipboardCheck },
  ];

  // Close sidebar on mobile when route changes
  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Sidebar Backdrop for Mobile */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={logo} alt="Vasista Logo" className="sidebar-logo" />
            <div className="logo-text">
              <span className="brand-name">VASISTA</span>
              <span className="brand-sub">MAN POWER SOLUTION</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <item.icon size={20} />
              <span className="nav-label">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn-sidebar" onClick={handleLogout}>
            <LogOut size={20} />
            <span className="nav-label">Logout</span>
          </button>
          <div className="user-profile-mini">
            <div className="avatar-circle">
              {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info-text">
              <span className="user-name">{currentUser?.email?.split('@')[0] || 'Admin'}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-container">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <div className="welcome-text">
              <h2>Welcome back, {currentUser?.email?.split('@')[0] || 'Admin'}!</h2>
              <p className="mobile-hide">Here's what's happening with your business today.</p>
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar mobile-hide">
              <Search size={18} />
              <input type="text" placeholder="Search here..." />
            </div>
            
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="notif-dot"></span>
            </button>

            <div className="user-dropdown" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Click to logout">
              <div className="avatar-circle">
                {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="user-meta mobile-hide">
                <span className="name">{currentUser?.email?.split('@')[0] || 'Admin'}</span>
                <span className="role">Administrator</span>
              </div>
              <LogOut size={16} className="mobile-hide" style={{ marginLeft: '10px', opacity: 0.7 }} />
            </div>
          </div>
        </header>

        <div className="content-viewport">
          {children}
        </div>
        
        <footer className="footer-credits">
          <span>© 2024 Vasista Man Power Solution.</span>
          <span className="mobile-hide">Powering Your Growth</span>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
