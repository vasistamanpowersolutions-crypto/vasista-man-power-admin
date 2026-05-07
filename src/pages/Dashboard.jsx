import React from 'react';
import { 
  Users, Briefcase, ClipboardCheck, CircleDollarSign, 
  TrendingUp, Eye, Bell, Plus, FileSpreadsheet, 
  ChevronRight, CalendarDays, MoreVertical
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'TOTAL CANDIDATES', value: '1,248', growth: '+ 12.5%', icon: Users, color: '#4318FF', bg: '#F4F7FE' },
    { title: 'TOTAL CLIENTS', value: '328', growth: '+ 8.3%', icon: Briefcase, color: '#F29727', bg: '#FFF7ED' },
    { title: 'ACTIVE ASSIGNMENTS', value: '856', growth: '+ 15.2%', icon: ClipboardCheck, color: '#05CD99', bg: '#E6FFF1' },
    { title: 'TOTAL REVENUE', value: '₹48,75,000', growth: '+ 10.6%', icon: CircleDollarSign, color: '#FF5C8D', bg: '#FFF1F5' },
  ];

  const recentAssignments = [
    { id: 'ASG-00125', title: 'Security Guard', client: 'ABC Pvt. Ltd.', status: 'Active', date: '05 Jul 2024' },
    { id: 'ASG-00124', title: 'Warehouse Helper', client: 'XYZ Industries', status: 'Active', date: '04 Jul 2024' },
    { id: 'ASG-00123', title: 'Office Assistant', client: 'Tech Solutions', status: 'Completed', date: '03 Jul 2024' },
    { id: 'ASG-00122', title: 'Driver', client: 'Global Logistics', status: 'Active', date: '02 Jul 2024' },
    { id: 'ASG-00121', title: 'Cleaner', client: 'Elite Facilities', status: 'Completed', date: '01 Jul 2024' },
  ];

  const topClients = [
    { name: 'ABC Pvt. Ltd.', assignments: 128 },
    { name: 'XYZ Industries', assignments: 94 },
    { name: 'Tech Solutions', assignments: 76 },
    { name: 'Global Logistics', assignments: 64 },
    { name: 'Elite Facilities', assignments: 54 },
  ];

  return (
    <div className="dashboard-content">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-title">{stat.title}</span>
              <div className="stat-value-row">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-growth"><TrendingUp size={14} /> {stat.growth}</span>
              </div>
              <span className="stat-sub">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-left-panel">
          {/* Charts Row */}
          <div className="charts-row">
            <div className="card chart-card flex-2">
              <div className="card-header">
                <h3>Assignment Overview</h3>
                <select className="period-select">
                  <option>This Month</option>
                </select>
              </div>
              <div className="line-chart-placeholder">
                <svg viewBox="0 0 800 300" className="chart-svg">
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200, 250].map(y => (
                    <line key={y} x1="50" y1={250-y} x2="750" y2={250-y} stroke="#E0E5F2" strokeWidth="1" strokeDasharray="5,5" />
                  ))}
                  {/* Axis */}
                  <line x1="50" y1="250" x2="750" y2="250" stroke="#E0E5F2" strokeWidth="1" />
                  
                  {/* Active Line (Blue) */}
                  <path d="M50,180 L150,160 L250,140 L350,120 L450,100 L550,90 L650,80 L750,70" fill="none" stroke="#4318FF" strokeWidth="3" />
                  <circle cx="750" cy="70" r="5" fill="#4318FF" />
                  
                  {/* Completed Line (Orange) */}
                  <path d="M50,230 L150,210 L250,190 L350,180 L450,160 L550,150 L650,130 L750,110" fill="none" stroke="#F29727" strokeWidth="3" />
                  <circle cx="750" cy="110" r="5" fill="#F29727" />
                  
                  {/* Labels */}
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, i) => (
                    <text key={m} x={50 + i*116} y="275" fontSize="12" fill="#A3AED0" textAnchor="middle">{m}</text>
                  ))}
                </svg>
                <div className="chart-legend">
                  <span className="legend-item"><span className="dot blue"></span> Active Assignments</span>
                  <span className="legend-item"><span className="dot orange"></span> Completed Assignments</span>
                </div>
              </div>
            </div>

            <div className="card chart-card flex-1">
              <div className="card-header">
                <h3>Candidates by Status</h3>
              </div>
              <div className="donut-container">
                <svg viewBox="0 0 200 200" className="donut-svg">
                  <circle cx="100" cy="100" r="70" fill="transparent" stroke="#E0E5F2" strokeWidth="20" />
                  <circle cx="100" cy="100" r="70" fill="transparent" stroke="#4318FF" strokeWidth="20" strokeDasharray="440" strokeDashoffset="240" />
                  <circle cx="100" cy="100" r="70" fill="transparent" stroke="#F29727" strokeWidth="20" strokeDasharray="440" strokeDashoffset="380" transform="rotate(-90 100 100)" />
                  <circle cx="100" cy="100" r="70" fill="transparent" stroke="#05CD99" strokeWidth="20" strokeDasharray="440" strokeDashoffset="420" transform="rotate(45 100 100)" />
                </svg>
                <div className="donut-center">
                  <span className="total-num">1,248</span>
                  <span className="total-label">Total</span>
                </div>
              </div>
              <div className="donut-legend">
                <div className="d-legend-item">
                  <span className="dot blue"></span>
                  <div className="d-label"><span>Available</span><small>568 (45.5%)</small></div>
                </div>
                <div className="d-legend-item">
                  <span className="dot orange"></span>
                  <div className="d-label"><span>Placed</span><small>512 (41.0%)</small></div>
                </div>
                <div className="d-legend-item">
                  <span className="dot green"></span>
                  <div className="d-label"><span>In Process</span><small>168 (13.5%)</small></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="tables-row">
            <div className="card table-card flex-2">
              <div className="card-header">
                <h3>Recent Assignments</h3>
                <button className="view-all">View All</button>
              </div>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ASSIGNMENT ID</th>
                    <th>JOB TITLE</th>
                    <th>CLIENT</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssignments.map((asg, i) => (
                    <tr key={i}>
                      <td className="id-cell">{asg.id}</td>
                      <td className="title-cell">{asg.title}</td>
                      <td>{asg.client}</td>
                      <td>
                        <span className={`status-pill status-${asg.status.toLowerCase()}`}>
                          {asg.status}
                        </span>
                      </td>
                      <td className="date-cell">{asg.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card table-card flex-1">
              <div className="card-header">
                <h3>Top Clients</h3>
                <button className="view-all">View All</button>
              </div>
              <div className="clients-list">
                <div className="client-header">
                  <span>CLIENT NAME</span>
                  <span>TOTAL ASSIGNMENTS</span>
                </div>
                {topClients.map((client, i) => (
                  <div key={i} className="client-row">
                    <span className="c-name">{client.name}</span>
                    <span className="c-val">{client.assignments}</span>
                  </div>
                ))}
                <button className="clients-footer">
                  All Clients <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-right-panel">
          {/* Notifications */}
          <div className="card widget-card">
            <div className="card-header">
              <h3>Recent Notifications</h3>
              <button className="view-all">View All</button>
            </div>
            <div className="notifications-list">
              {[
                { text: 'New candidate John Doe added successfully.', time: '10 mins ago', icon: Users, color: '#4318FF' },
                { text: 'Assignment for Security Guard completed.', time: '1 hour ago', icon: Briefcase, color: '#05CD99' },
                { text: 'Payment received from ABC Pvt. Ltd.', time: '3 hours ago', icon: CircleDollarSign, color: '#F29727' },
                { text: 'New job post "Warehouse Helper" created.', time: '5 hours ago', icon: Plus, color: '#4318FF' },
              ].map((notif, i) => (
                <div key={i} className="notif-item">
                  <div className="notif-icon" style={{ backgroundColor: notif.color + '10', color: notif.color }}>
                    <notif.icon size={16} />
                  </div>
                  <div className="notif-content">
                    <p>{notif.text}</p>
                    <span>{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card widget-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="actions-grid">
              <button className="action-btn navy">
                <Plus size={18} /> Add Candidate
              </button>
              <button className="action-btn orange">
                <Plus size={18} /> Add Client
              </button>
              <button className="action-btn navy">
                <Briefcase size={18} /> Create Job
              </button>
              <button className="action-btn orange">
                <FileSpreadsheet size={18} /> Generate Report
              </button>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="card widget-card">
            <div className="card-header">
              <h3>Attendance Summary</h3>
              <select className="period-select">
                <option>This Month</option>
              </select>
            </div>
            <div className="attendance-grid">
              {[
                { label: 'Present', val: '854', pct: '85.4%', color: '#4318FF', icon: CalendarDays },
                { label: 'Absent', val: '92', pct: '9.2%', color: '#F29727', icon: MoreVertical },
                { label: 'On Leave', val: '54', pct: '5.4%', color: '#05CD99', icon: ClipboardCheck },
              ].map((item, i) => (
                <div key={i} className="attendance-item">
                  <div className="att-icon" style={{ backgroundColor: item.color + '15', color: item.color }}>
                    <item.icon size={20} />
                  </div>
                  <span className="att-label">{item.label}</span>
                  <span className="att-val">{item.val}</span>
                  <span className="att-pct" style={{ color: item.color }}>{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
