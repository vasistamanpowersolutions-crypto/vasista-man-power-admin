import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, User, Briefcase, FileText, 
  Phone, Mail, MapPin, Calendar, 
  ShieldCheck, CreditCard, Users, ExternalLink,
  Download, Eye, Image as ImageIcon, Loader,
  Trash2, Edit2, Save, Plus, Search, Building2,
  CheckCircle2, Clock
} from 'lucide-react';
import Modal from '../components/Modal';
import './CandidateDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [candidate, setCandidate] = useState(null);
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // Allotment Form States
  const [businesses, setBusinesses] = useState([]);
  const [searchBusiness, setSearchBusiness] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [allotRole, setAllotRole] = useState('');
  const [allotDate, setAllotDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchCandidateDetails();
    fetchAllotments();
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(`${API_URL}/candidates/${id}`, {
        headers: { 'x-admin-secret': secret }
      });
      setCandidate(response.data);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllotments = async () => {
    try {
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(`${API_URL}/allotments/filter?candidateId=${id}`, {
        headers: { 'x-admin-secret': secret }
      });
      setAllotments(response.data);
    } catch (error) {
      console.error('Error fetching allotments:', error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(`${API_URL}/businesses`, {
        headers: { 'x-admin-secret': secret }
      });
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const handleAddAllotment = () => {
    fetchBusinesses();
    setIsAllotModalOpen(true);
  };

  const submitAllotment = async (e) => {
    e.preventDefault();
    if (!selectedBusiness || !allotRole || !allotDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      setSaving(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      
      await axios.post(`${API_URL}/allotments`, {
        candidateId: id,
        businessId: selectedBusiness.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        businessName: selectedBusiness.businessName,
        role: allotRole,
        allottedDate: allotDate
      }, {
        headers: { 'x-admin-secret': secret }
      });

      setIsAllotModalOpen(false);
      fetchAllotments();
      fetchCandidateDetails();
      setSelectedBusiness(null);
      setAllotRole('');
      setSearchBusiness('');
    } catch (error) {
      console.error('Error saving allotment:', error);
      alert('Failed to save allotment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        setLoading(true);
        const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
        await axios.delete(`${API_URL}/candidates/${id}`, {
          headers: { 'x-admin-secret': secret }
        });
        alert('Candidate deleted');
        navigate('/candidates');
      } catch (error) {
        console.error('Delete error:', error);
        setLoading(false);
      }
    }
  };

  const handleEditClick = (section) => {
    setEditSection(section);
    setEditData({ ...candidate });
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
      await axios.put(`${API_URL}/candidates/${id}`, editData, {
        headers: { 'x-admin-secret': secret }
      });
      setCandidate(editData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !candidate) {
    return (
      <div className="candidate-details-page">
        <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <Loader size={40} className="spin" />
          <p style={{ marginTop: '16px' }}>Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  const renderInfoTab = () => (
    <div className="info-grid">
      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><User size={20} /> Personal Information</div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Personal')}><Edit2 size={14} /></button>
        </div>
        <div className="data-row"><span className="data-label">Full Name</span><span className="data-value">{candidate.firstName} {candidate.lastName}</span></div>
        <div className="data-row"><span className="data-label">Mobile</span><span className="data-value">{candidate.mobileNumber}</span></div>
        <div className="data-row"><span className="data-label">Email</span><span className="data-value">{candidate.email || 'N/A'}</span></div>
        <div className="data-row"><span className="data-label">DOB</span><span className="data-value">{candidate.dateOfBirth}</span></div>
        <div className="data-row"><span className="data-label">Address</span><span className="data-value">{candidate.address}, {candidate.city}, {candidate.state}</span></div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><Briefcase size={20} /> Professional Details</div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Professional')}><Edit2 size={14} /></button>
        </div>
        <div className="data-row"><span className="data-label">Qualification</span><span className="data-value">{candidate.qualification}</span></div>
        <div className="data-row"><span className="data-label">Experience</span><span className="data-value">{candidate.experience}</span></div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><CreditCard size={20} /> Status & Identity</div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Identity')}><Edit2 size={14} /></button>
        </div>
        <div className="data-row"><span className="data-label">Allotment</span><span className={`status-pill ${candidate.candidateStatus?.toLowerCase()}`}>{candidate.candidateStatus}</span></div>
        <div className="data-row"><span className="data-label">KYC Status</span><span className={`kyc-badge ${candidate.kycStatus?.toLowerCase().replace(/ /g, '-')}`}>{candidate.kycStatus}</span></div>
        <div className="data-row"><span className="data-label">Aadhar Number</span><span className="data-value">{candidate.aadharNumber}</span></div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><Users size={20} /> Guardian Information</div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Guardian')}><Edit2 size={14} /></button>
        </div>
        <div className="data-row"><span className="data-label">Guardian Name</span><span className="data-value">{candidate.guardianName}</span></div>
        <div className="data-row"><span className="data-label">Relation</span><span className="data-value">{candidate.guardianRelation}</span></div>
        <div className="data-row"><span className="data-label">Guardian Mobile</span><span className="data-value">{candidate.guardianMobile}</span></div>
      </div>
    </div>
  );

  const renderAllocationsTab = () => (
    <div className="allotment-tab-container">
      <div className="tab-section-header">
        <h2>Allotment History</h2>
        {candidate.candidateStatus?.toLowerCase() !== 'allotted' && (
          <button className="btn-primary" onClick={handleAddAllotment}>
            <Plus size={18} /> New Allotment
          </button>
        )}
      </div>

      {allotments.length === 0 ? (
        <div className="empty-tab-state">
          <Briefcase size={48} />
          <h2>No History Found</h2>
          <p>This candidate has not been assigned to any business yet.</p>
        </div>
      ) : (
        <div className="allotment-grid">
          {allotments.map(allot => (
            <div key={allot.id} className="allotment-card">
              <div className="allotment-card-header">
                <div className="allotment-user">
                  <div className="allotment-avatar">{allot.businessName[0]}</div>
                  <div>
                    <h3 className="allotment-name">{allot.businessName}</h3>
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
                  <MapPin size={16} /> Employer ID: #{allot.businessId.substring(0, 8)}
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
      { id: 'd1', title: 'Aadhar Front', url: candidate.aadharFront },
      { id: 'd2', title: 'Aadhar Back', url: candidate.aadharBack },
      { id: 'd3', title: 'PAN Card', url: candidate.panCard },
      { id: 'd4', title: 'Profile Photo', url: candidate.profilePhoto },
    ];
    return (
      <div className="docs-grid">
        {docs.map(doc => (
          <div key={doc.id} className="doc-card">
            <div className="doc-header"><div className="doc-icon"><FileText size={20} /></div><div className="doc-info"><h3>{doc.title}</h3><p>Identity Document</p></div></div>
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

  const filteredBusinesses = businesses.filter(b => {
    const search = searchBusiness.toLowerCase();
    const bName = (b.businessName || '').toLowerCase();
    const oName = (b.ownerName || '').toLowerCase();
    return bName.includes(search) || oName.includes(search);
  });

  return (
    <div className="candidate-details-page">
      <div className="details-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/candidates')}><ArrowLeft size={20} /></button>
          <div className="candidate-profile-summary">
            <div className="large-avatar">
              {candidate.profilePhoto ? <img src={candidate.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={32} />}
            </div>
            <div className="summary-info">
              <h1>{candidate.firstName} {candidate.lastName}</h1>
              <p><span>UID: {candidate.uid}</span><span className="dot"></span><span>Role: {candidate.role}</span></p>
              <div className="status-badges">
                <span className={`status-pill ${candidate.candidateStatus?.toLowerCase()}`}>{candidate.candidateStatus}</span>
                <span className={`kyc-badge ${candidate.kycStatus?.toLowerCase().replace(/ /g, '-')}`}><ShieldCheck size={14} /> {candidate.kycStatus}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="delete-btn" onClick={handleDelete}><Trash2 size={18} /> Delete Candidate</button>
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
            {editSection === 'Personal' && (
              <>
                <div className="form-group"><label>First Name</label><input name="firstName" value={editData.firstName} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group"><label>Last Name</label><input name="lastName" value={editData.lastName} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group"><label>Mobile</label><input name="mobileNumber" value={editData.mobileNumber} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group"><label>Email</label><input name="email" value={editData.email} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group"><label>DOB</label><input name="dateOfBirth" type="date" value={editData.dateOfBirth} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Address</label><textarea name="address" value={editData.address} onChange={handleEditChange} className="form-control" rows="2" /></div>
              </>
            )}
            {editSection === 'Identity' && (
              <>
                <div className="form-group"><label>Allotment Status</label><select name="candidateStatus" value={editData.candidateStatus} onChange={handleEditChange} className="form-control"><option value="available">Available</option><option value="allotted">Allotted</option><option value="on-leave">On Leave</option><option value="resigned">Resigned</option></select></div>
                <div className="form-group"><label>KYC Status</label><select name="kycStatus" value={editData.kycStatus} onChange={handleEditChange} className="form-control"><option value="in progress">In Progress</option><option value="verified">Verified</option><option value="rejected">Rejected</option><option value="pending">Pending</option></select></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Aadhar Number</label><input name="aadharNumber" value={editData.aadharNumber} onChange={handleEditChange} className="form-control" /></div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <Loader size={16} className="spin" /> : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Improved Allotment Modal */}
      <Modal isOpen={isAllotModalOpen} onClose={() => { setIsAllotModalOpen(false); setSelectedBusiness(null); }} title="New Allotment" width="500px">
        <form onSubmit={submitAllotment}>
          <div className="form-group">
            <label>Search & Select Business</label>
            <div className="custom-search-wrapper">
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type business name..."
                  style={{ paddingLeft: '40px', borderColor: selectedBusiness ? 'var(--secondary)' : '' }}
                  value={selectedBusiness && !searchBusiness ? selectedBusiness.businessName : searchBusiness}
                  onChange={(e) => {
                    setSearchBusiness(e.target.value);
                    if (selectedBusiness) setSelectedBusiness(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
                {(searchBusiness || selectedBusiness) && (
                  <button type="button" onClick={() => { setSearchBusiness(''); setSelectedBusiness(null); setShowDropdown(false); }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              {showDropdown && searchBusiness && (
                <div className="search-dropdown">
                  {filteredBusinesses.length === 0 ? (
                    <div className="empty-search">No businesses found</div>
                  ) : (
                    filteredBusinesses.map(b => (
                      <div key={b.id} className="dropdown-item" onClick={() => {
                        setSelectedBusiness(b);
                        setSearchBusiness('');
                        setShowDropdown(false);
                      }}>
                        <div className="item-avatar">{b.businessName ? b.businessName[0] : 'B'}</div>
                        <div className="item-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="item-name">{b.businessName}</span>
                            <span className="status-pill active" style={{ fontSize: '10px', padding: '2px 8px' }}>
                              {b.status || 'Active'}
                            </span>
                          </div>
                          <span className="item-sub">{b.ownerName}</span>
                        </div>
                      </div>
                    ))
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
                <input type="text" className="form-control" placeholder="Role..." style={{ paddingLeft: '40px' }} value={allotRole} onChange={(e) => setAllotRole(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Allotment Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="date" className="form-control" style={{ paddingLeft: '40px' }} value={allotDate} onChange={(e) => setAllotDate(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAllotModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !selectedBusiness} style={{ background: 'var(--secondary)', border: 'none' }}>
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CandidateDetails;
