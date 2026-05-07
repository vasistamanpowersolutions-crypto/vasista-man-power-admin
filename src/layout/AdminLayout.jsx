import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Briefcase, 
  ClipboardCheck, CalendarCheck, Wallet, FileText, 
  BarChart3, Settings, LogOut, Search, Bell, Menu,
  ChevronDown, X
} from 'lucide-react';
import './Layout.css';
import logo from '../assets/logo.jpeg';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Business Owners', path: '/clients', icon: Building2 },
  ];

  return (
    <div className="admin-layout">
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
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span className="nav-label">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-mini">
            <div className="avatar-circle">AU</div>
            <div className="user-info-text">
              <span className="user-name">Admin User</span>
              <span className="user-role">Administrator</span>
            </div>
            <ChevronDown size={16} />
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
              <h2>Welcome back, Admin!</h2>
              <p>Here's what's happening with your business today.</p>
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search here..." />
            </div>
            
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="notif-dot"></span>
            </button>

            <div className="user-dropdown">
              <div className="avatar-circle">AU</div>
              <div className="user-meta">
                <span className="name">Admin User</span>
                <span className="role">Administrator</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <div className="content-viewport">
          {children}
        </div>
        
        <footer className="footer-credits">
          <span>© 2024 Vasista Man Power Solution. All rights reserved.</span>
          <span>Powering Your Growth</span>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
