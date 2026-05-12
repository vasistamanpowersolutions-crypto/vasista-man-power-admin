import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Building2, User, Phone, Mail, MapPin, 
  FileText, Briefcase, Trash2, Edit2, Save, Download, 
  Eye, Loader, ShieldCheck, Image as ImageIcon, Plus, Search, Calendar,
  CheckCircle2, Clock
} from 'lucide-react';
import Modal from '../components/Modal';
import './CandidateDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const BusinessOwnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [business, setBusiness] = useState(null);
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // Allotment Form States
  const [candidates, setCandidates] = useState([]);
  const [searchCandidate, setSearchCandidate] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [allotRole, setAllotRole] = useState('');
  const [allotDate, setAllotDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchBusinessDetails();
    fetchAllotments();
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(`${API_URL}/businesses/${id}`, {
        headers: { 'x-admin-secret': secret }
      });
      setBusiness(response.data);
    } catch (error) {
      console.error('Error fetching business details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllotments = async () => {
    try {
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(`${API_URL}/allotments/filter?businessId=${id}`, {
        headers: { 'x-admin-secret': secret }
      });
      setAllotments(response.data);
    } catch (error) {
      console.error('Error fetching allotments:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(`${API_URL}/candidates`, {
        headers: { 'x-admin-secret': secret }
      });
      // Show all candidates, we will filter/disable in UI
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleAddAllotment = () => {
    fetchCandidates();
    setIsAllotModalOpen(true);
  };

  const submitAllotment = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !allotRole || !allotDate) {
      alert('Please fill all fields');
      return;
    }

    if (selectedCandidate.candidateStatus?.toLowerCase() === 'allotted') {
      alert('This candidate is already allotted to another business');
      return;
    }

    try {
      setSaving(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      
      await axios.post(`${API_URL}/allotments`, {
        candidateId: selectedCandidate.id,
        businessId: id,
        candidateName: `${selectedCandidate.firstName} ${selectedCandidate.lastName}`,
        businessName: business.businessName,
        role: allotRole,
        allottedDate: allotDate
      }, {
        headers: { 'x-admin-secret': secret }
      });

      setIsAllotModalOpen(false);
      fetchAllotments();
      // Reset
      setSelectedCandidate(null);
      setAllotRole('');
      setSearchCandidate('');
    } catch (error) {
      console.error('Error saving allotment:', error);
      alert('Failed to save allotment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        setLoading(true);
        const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
        await axios.delete(`${API_URL}/businesses/${id}`, {
          headers: { 'x-admin-secret': secret }
        });
        alert('Business deleted');
        navigate('/clients');
      } catch (error) {
        console.error('Delete error:', error);
        setLoading(false);
      }
    }
  };

  const handleEditClick = (section) => {
    setEditSection(section);
    setEditData({ ...business });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      await axios.put(`${API_URL}/businesses/${id}`, editData, {
        headers: { 'x-admin-secret': secret }
      });
      setBusiness(editData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !business) {
    return (
      <div className="candidate-details-page">
        <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <Loader size={40} className="spin" />
          <p style={{ marginTop: '16px' }}>Loading business profile...</p>
        </div>
      </div>
    );
  }

  const renderInfoTab = () => (
    <div className="info-grid">
      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><Building2 size={20} /> Business Details</div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Business')}><Edit2 size={14} /></button>
        </div>
        <div className="data-row"><span className="data-label">Business Name</span><span className="data-value">{business.businessName}</span></div>
        <div className="data-row"><span className="data-label">Owner Name</span><span className="data-value">{business.ownerName}</span></div>
        <div className="data-row"><span className="data-label">Mobile</span><span className="data-value">{business.mobileNumber}</span></div>
        <div className="data-row"><span className="data-label">Email</span><span className="data-value">{business.email || 'N/A'}</span></div>
        <div className="data-row"><span className="data-label">Address</span><span className="data-value">{business.address}</span></div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><FileText size={20} /> Documents & Status</div>
        </div>
        <div className="data-row"><span className="data-label">Document Type</span><span className="data-value">{business.docType}</span></div>
        <div className="data-row"><span className="data-label">Status</span><span className="status-pill active">{business.status || 'Active'}</span></div>
      </div>
    </div>
  );

  const renderAllocationsTab = () => (
    <div className="allotment-tab-container">
      <div className="tab-section-header">
        <h2>Allotment History</h2>
        <button className="btn-primary" onClick={handleAddAllotment}>
          <Plus size={18} /> New Allotment
        </button>
      </div>

      {allotments.length === 0 ? (
        <div className="empty-tab-state">
          <Briefcase size={48} />
          <h2>No Allotments</h2>
          <p>No manpower has been assigned to this business yet.</p>
        </div>
      ) : (
        <div className="allotment-grid">
          {allotments.map(allot => (
            <div key={allot.id} className="allotment-card">
              <div className="allotment-card-header">
                <div className="allotment-user">
                  <div className="allotment-avatar">{allot.candidateName[0]}</div>
                  <div>
                    <h3 className="allotment-name">{allot.candidateName}</h3>
                    <span className="allotment-role-badge">
                      <Briefcase size={12} /> {allot.role}
                    </span>
                  </div>
                </div>
                <span className={`status-pill ${allot.status}`}>
                  {allot.status === 'active' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {allot.status}
                </span>
              </div>
              <div className="allotment-details">
                <div className="detail-item">
                  <Calendar size={16} /> Allotted on: {new Date(allot.allottedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="detail-item">
                  <MapPin size={16} /> Location: {business.address}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDocumentsTab = () => {
    const docs = [
      { id: 'd1', title: business.docType, url: business.docImageUrl },
      { id: 'd2', title: 'Business Frontside', url: business.businessFrontUrl },
    ];

    return (
      <div className="docs-grid">
        {docs.map(doc => (
          <div key={doc.id} className="doc-card">
            <div className="doc-header">
              <div className="doc-icon"><FileText size={20} /></div>
              <div className="doc-info"><h3>{doc.title}</h3><p>Legal Document</p></div>
            </div>
            <div className="doc-preview">
              {doc.url ? <img src={doc.url} alt={doc.title} /> : <div className="placeholder"><ImageIcon size={32} /><span>Not Uploaded</span></div>}
            </div>
            <div className="doc-actions">
              <button className="doc-btn" onClick={() => doc.url && window.open(doc.url, '_blank')}><Eye size={14} /> View</button>
              <button className="doc-btn"><Download size={14} /> Download</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const filteredCandidates = candidates.filter(c => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const mobile = (c.mobileNumber || '').toString();
    const search = searchCandidate.toLowerCase();
    return fullName.includes(search) || mobile.includes(search);
  });

  return (
    <div className="candidate-details-page">
      <div className="details-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/clients')}><ArrowLeft size={20} /></button>
          <div className="candidate-profile-summary">
            <div className="large-avatar"><Building2 size={32} /></div>
            <div className="summary-info">
              <h1>{business.businessName}</h1>
              <p><span>Owner: {business.ownerName}</span><span className="dot"></span><span>ID: #{business.id.substring(0, 8)}</span></p>
              <div className="status-badges">
                <span className="status-pill active">{business.status || 'Active'}</span>
                <span className="kyc-badge verified"><ShieldCheck size={14} /> Verified Client</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="delete-btn" onClick={handleDelete}><Trash2 size={18} /> Delete Business</button>
        </div>
      </div>

      <div className="details-tabs">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}><User size={16} /> Info</button>
        <button className={`tab-btn ${activeTab === 'allocations' ? 'active' : ''}`} onClick={() => setActiveTab('allocations')}><Briefcase size={16} /> Allotment</button>
        <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}><FileText size={16} /> Documents</button>
      </div>

      <div className="tab-content">
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'allocations' && renderAllocationsTab()}
        {activeTab === 'documents' && renderDocumentsTab()}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${editSection}`} width="600px">
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Business Name</label>
              <input name="businessName" value={editData.businessName} onChange={handleEditChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Owner Name</label>
              <input name="ownerName" value={editData.ownerName} onChange={handleEditChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input name="mobileNumber" value={editData.mobileNumber} onChange={handleEditChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" value={editData.email} onChange={handleEditChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={editData.status} onChange={handleEditChange} className="form-control">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Address</label>
              <textarea name="address" value={editData.address} onChange={handleEditChange} className="form-control" rows="2" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader size={16} className="spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Improved Allotment Modal */}
      <Modal isOpen={isAllotModalOpen} onClose={() => { setIsAllotModalOpen(false); setSelectedCandidate(null); }} title="New Allotment" width="500px">
        <form onSubmit={submitAllotment}>
          <div className="form-group">
            <label>Search & Select Candidate</label>
            <div className="custom-search-wrapper">
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by name or mobile number..."
                  style={{ paddingLeft: '40px', borderColor: selectedCandidate ? 'var(--secondary)' : '' }}
                  value={selectedCandidate && !searchCandidate ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}` : searchCandidate}
                  onChange={(e) => {
                    setSearchCandidate(e.target.value);
                    if (selectedCandidate) setSelectedCandidate(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
                {(searchCandidate || selectedCandidate) && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setSearchCandidate('');
                      setSelectedCandidate(null);
                      setShowDropdown(false);
                    }} 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              {showDropdown && searchCandidate && (
                <div className="search-dropdown">
                  {filteredCandidates.length === 0 ? (
                    <div className="empty-search">No matching candidates found</div>
                  ) : (
                    filteredCandidates.map(c => {
                      const isAllotted = c.candidateStatus?.toLowerCase() === 'allotted';
                      return (
                        <div 
                          key={c.id} 
                          className={`dropdown-item ${isAllotted ? 'disabled' : ''}`} 
                          style={{ 
                            opacity: isAllotted ? 0.6 : 1, 
                            cursor: isAllotted ? 'not-allowed' : 'pointer',
                            pointerEvents: isAllotted ? 'none' : 'auto'
                          }}
                          onClick={() => {
                            if (!isAllotted) {
                              setSelectedCandidate(c);
                              setSearchCandidate('');
                              setShowDropdown(false);
                            }
                          }}
                        >
                          <div className="item-avatar">{c.firstName ? c.firstName[0] : 'U'}</div>
                          <div className="item-info">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="item-name">{c.firstName || ''} {c.lastName || ''}</span>
                              <span className={`status-pill ${c.candidateStatus?.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                {c.candidateStatus}
                              </span>
                            </div>
                            <span className="item-sub">{c.mobileNumber || 'No Mobile'}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="form-group">
              <label>Assigned Role</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Role..." 
                  style={{ paddingLeft: '40px' }}
                  value={allotRole}
                  onChange={(e) => setAllotRole(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Allotment Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="date" 
                  className="form-control" 
                  style={{ paddingLeft: '40px' }}
                  value={allotDate}
                  onChange={(e) => setEditData(prev => ({ ...prev, allotDate: e.target.value })) /* wait, allotDate state is separate */}
                  // Fixing local state vs editData
                  onInput={(e) => setAllotDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAllotModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !selectedCandidate} style={{ background: 'var(--secondary)', border: 'none' }}>
              {saving ? <Loader size={18} className="spin" /> : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BusinessOwnerDetails;
