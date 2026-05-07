import React from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, ChevronDown } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h2>Welcome, Vasista Admin 👋</h2>
            <span>{currentDate}</span>
          </div>
          
          <div className="header-center">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search for candidates, jobs or clients..." />
            </div>
          </div>
          
          <div className="header-right">
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="badge">5</span>
            </button>
            <div className="profile-trigger">
              <div className="avatar">A</div>
              <div className="profile-info">
                <span className="name">Admin</span>
                <span className="role">Administrator</span>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
