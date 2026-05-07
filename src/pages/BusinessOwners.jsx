import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Plus, Mail, Phone, MapPin, 
  Building2, Briefcase, UserCheck, RefreshCw,
  Eye, Edit, Trash2, ChevronLeft, ChevronRight,
  Globe, Fingerprint
} from 'lucide-react';
import './Candidates.css'; // Reusing some table styles, but will add specific ones if needed

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(`${API_URL}/businesses`, {
        headers: { 'x-admin-secret': secret }
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Fallback dummy data
      setClients([
        { id: 'BUS-1001', businessName: 'ABC Pvt. Ltd.', businessCategory: 'Construction', phone: '9876500101', email: 'contact@abc.com', city: 'Nellore', employeeCount: 128, status: 'Active' },
        { id: 'BUS-1002', businessName: 'XYZ Industries', businessCategory: 'Manufacturing', phone: '9876500102', email: 'hr@xyz.com', city: 'Hyderabad', employeeCount: 94, status: 'Active' },
        { id: 'BUS-1003', businessName: 'Tech Solutions', businessCategory: 'IT Services', phone: '9876500103', email: 'jobs@techsol.com', city: 'Bangalore', employeeCount: 76, status: 'Active' },
        { id: 'BUS-1004', businessName: 'Global Logistics', businessCategory: 'Logistics', phone: '9876500104', email: 'admin@global.com', city: 'Chennai', employeeCount: 64, status: 'Active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="candidates-page">
      <div className="page-header">
        <div className="header-info">
          <h1>Clients Management</h1>
          <p>Total {clients.length} business clients registered in the platform.</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn-secondary" onClick={fetchClients} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn-primary">
            <Plus size={18} /> Add Client
          </button>
        </div>
      </div>

      <div className="card table-container-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by business name, ID, or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            <button className="btn-secondary"><Filter size={16} /> Filter</button>
            <button className="btn-secondary">Export</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>CLIENT NAME</th>
                <th>CATEGORY</th>
                <th>CONTACT</th>
                <th>LOCATION</th>
                <th>ASSIGNMENTS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="table-loader">
                      <RefreshCw size={32} className="spin" />
                      <p>Loading clients...</p>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No clients found.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="avatar-small" style={{ backgroundColor: '#F2972715', color: '#F29727' }}>
                          <Building2 size={20} />
                        </div>
                        <div className="user-names">
                          <span className="full-name">{client.businessName}</span>
                          <span className="user-id">#{client.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{client.businessCategory || 'General'}</span>
                    </td>
                    <td>
                      <div className="contact-info">
                        <span><Phone size={12} /> {client.phone}</span>
                        <span className="email"><Mail size={12} /> {client.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="location-info">
                        <MapPin size={12} /> {client.city || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <div className="assignment-count">
                        <Briefcase size={14} />
                        <span>{client.employeeCount || 0} active</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-row">
                        <button className="action-icon view"><Eye size={16} /></button>
                        <button className="action-icon edit"><Edit size={16} /></button>
                        <button className="action-icon delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-footer">
          <div className="page-info">
            Showing 1 to {clients.length} of {clients.length} entries
          </div>
          <div className="pagination-controls">
            <button className="p-btn disabled"><ChevronLeft size={18} /></button>
            <button className="p-btn active">1</button>
            <button className="p-btn"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
