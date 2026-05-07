import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building, 
  Handshake, 
  FileText, 
  Bell, 
  Settings,
  HelpCircle,
  LogOut,
  UserRound
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
    { icon: <Handshake size={18} />, label: 'Business Owners', path: '/business-owners' },
    { icon: <Users size={18} />, label: 'Candidates', path: '/candidates' },
    { icon: <Briefcase size={18} />, label: 'Job Roles', path: '/job-roles' },
    { icon: <UserRound size={18} />, label: 'Vasista Employees', path: '/employees' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-container">
          <div className="logo-mark">V</div>
          <div className="logo-text">
            <h1>VASISTA</h1>
            <span>MAN POWER SOLUTION</span>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
