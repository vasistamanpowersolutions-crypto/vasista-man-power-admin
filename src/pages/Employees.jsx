import React, { useState } from 'react';
import { UserPlus, Search, Filter, MoreHorizontal, Mail, Shield } from 'lucide-react';
import Modal from '../components/Modal';

const Employees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [employees] = useState([
    { id: 1, name: 'Admin User', role: 'Super Admin', dept: 'Management', status: 'Active', email: 'admin@vasista.com' },
    { id: 2, name: 'Kiran Kumar', role: 'Manager', dept: 'Operations', status: 'Active', email: 'kiran@vasista.com' },
    { id: 3, name: 'Sravani P', role: 'HR Executive', dept: 'Human Resources', status: 'Active', email: 'sravani@vasista.com' },
    { id: 4, name: 'Madhav Rao', role: 'Coordinator', dept: 'Field Work', status: 'Inactive', email: 'madhav@vasista.com' },
  ]);

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div className="header-text">
          <h1>Vasista Employees</h1>
          <p>Manage internal staff and their access levels.</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="card table-card-main">
        <div className="table-actions-row">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input type="text" placeholder="Search employees..." />
          </div>
          <div className="filter-buttons">
            <button className="filter-btn"><Filter size={16} /> Filter</button>
          </div>
        </div>

        <table className="main-data-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="user-profile-cell">
                    <div className="avatar-circle" style={{ backgroundColor: '#f0f0f0', color: '#555' }}>
                      {row.name.charAt(0)}
                    </div>
                    <div className="user-details">
                      <span className="user-name-text">{row.name}</span>
                      <span className="user-id-text"><Mail size={10} /> {row.email}</span>
                    </div>
                  </div>
                </td>
                <td>{row.dept}</td>
                <td>
                  <span className="role-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={12} /> {row.role}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
                <td>
                  <button className="icon-action-btn"><MoreHorizontal size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Internal Staff">
        <form className="admin-form">
          <div className="form-field">
            <label>Full Name</label>
            <input type="text" placeholder="Enter employee name" />
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label>Email Address</label>
              <input type="email" placeholder="official@vasista.com" />
            </div>
            <div className="form-field">
              <label>Department</label>
              <select>
                <option>Operations</option>
                <option>HR</option>
                <option>Finance</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Designation</label>
            <input type="text" placeholder="e.g. Manager" />
          </div>
          <div className="form-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="submit-btn">Add Employee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
