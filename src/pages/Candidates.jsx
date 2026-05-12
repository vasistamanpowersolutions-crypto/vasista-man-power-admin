import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, Filter, Plus, Mail, Phone, MapPin, 
  ShieldCheck, Eye, Edit, Trash2, RefreshCw,
  MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-react';
import './Candidates.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(`${API_URL}/candidates`, {
        headers: { 'x-admin-secret': secret }
      });
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Fallback dummy data for demo if API fails
      setCandidates([
        { id: 'CAN-82341', firstName: 'Rahul', lastName: 'Kumar', phone: '9876543210', email: 'rahul@example.com', candidateStatus: 'Available', kycStatus: 'Verified', city: 'Nellore' },
        { id: 'CAN-82342', firstName: 'Priya', lastName: 'Sharma', phone: '9876543211', email: 'priya@example.com', candidateStatus: 'Placed', kycStatus: 'Verified', city: 'Hyderabad' },
        { id: 'CAN-82343', firstName: 'Anil', lastName: 'Reddy', phone: '9876543212', email: 'anil@example.com', candidateStatus: 'Available', kycStatus: 'Pending', city: 'Tirupati' },
        { id: 'CAN-82344', firstName: 'Sneha', lastName: 'Latha', phone: '9876543213', email: 'sneha@example.com', candidateStatus: 'In Process', kycStatus: 'Verified', city: 'Vijayawada' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="candidates-page">
      <div className="page-header">
        <div className="header-info">
          <h1>Candidates Management</h1>
          <p>Total {candidates.length} candidates registered in the platform.</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn-secondary" onClick={fetchCandidates} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn-primary" onClick={() => navigate('/candidates/add')}>
            <Plus size={18} /> Add Candidate
          </button>
        </div>
      </div>

      <div className="card table-container-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or phone..." 
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
                <th>CANDIDATE</th>
                <th>CONTACT</th>
                <th>LOCATION</th>
                <th>WORK STATUS</th>
                <th>KYC STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="table-loader">
                      <RefreshCw size={32} className="spin" />
                      <p>Loading candidates...</p>
                    </div>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No candidates found.</td>
                </tr>
              ) : (
                candidates.map((can) => (
                  <tr key={can.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="avatar-small">{can.firstName[0]}</div>
                        <div className="user-names">
                          <span className="full-name">{can.firstName} {can.lastName}</span>
                          <span className="user-id">#{can.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <span><Phone size={12} /> {can.phone}</span>
                        <span className="email"><Mail size={12} /> {can.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="location-info">
                        <MapPin size={12} /> {can.city || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${can.candidateStatus?.toLowerCase().replace(/ /g, '-') || 'available'}`}>
                        {can.candidateStatus || 'Available'}
                      </span>
                    </td>
                    <td>
                      <span className={`kyc-badge ${can.kycStatus?.toLowerCase() || 'pending'}`}>
                        <ShieldCheck size={14} /> {can.kycStatus || 'Pending'}
                      </span>
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
            Showing 1 to {candidates.length} of {candidates.length} entries
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

export default Candidates;
