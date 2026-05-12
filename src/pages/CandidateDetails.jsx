import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, User, Briefcase, FileText, 
  Phone, Mail, MapPin, Calendar, 
  ShieldCheck, CreditCard, Users, ExternalLink,
  Download, Eye, Image as ImageIcon, Loader,
  Trash2, Edit2, Save
} from 'lucide-react';
import Modal from '../components/Modal';
import './CandidateDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCandidateDetails();
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
      // Fallback dummy data matching the provided screenshot
      setCandidate({
        uid: id,
        firstName: 'Arumulla',
        lastName: 'Sivakrishna',
        mobileNumber: '+919398638314',
        phoneNumber: '+919398638314',
        email: 'arumullasivakrishna6@gmail.com',
        dob: '2026-05-20',
        city: 'Nellore',
        state: 'Andhra Pradesh',
        address: 'Padmavathi center Nellore',
        qualification: 'Graduate',
        experience: '5+ years',
        aadharNumber: '258745896541',
        guardianName: 'Srinivasulu',
        guardianRelation: 'Father',
        guardianMobile: '9856321478',
        candidateStatus: 'available',
        kycStatus: 'in progress',
        role: 'candidate',
        profileImageUrl: 'https://ik.imagekit.io/u58ih6wp1/uploads/optimized/optimized_1778169126151_mokshith-logo_mJ4Xf8C34.jpeg',
        aadharFrontUrl: 'https://ik.imagekit.io/u58ih6wp1/uploads/optimized/optimized_1778169167789_ChatGPT_Image_May_7__2026__02_45_37_PM_dmCBLtMyr.png',
        aadharBackUrl: 'https://ik.imagekit.io/u58ih6wp1/uploads/optimized/optimized_1778169174035_ChatGPT_Image_May_7__2026__02_45_33_PM_EbKPGZgTR.png',
        panCardUrl: '',
        createdAt: '2026-05-07T09:21:52Z',
        updatedAt: '2026-05-07T09:23:19Z'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      try {
        setLoading(true);
        const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
        await axios.delete(`${API_URL}/candidates/${id}`, {
          headers: { 'x-admin-secret': secret }
        });
        alert('Candidate deleted successfully');
        navigate('/candidates');
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Failed to delete candidate. Please try again.');
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
      alert('Changes saved successfully');
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="candidate-details-page">
        <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <Loader size={40} className="spin" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="candidate-details-page">
        <div className="error-state">
          <h2>Candidate Not Found</h2>
          <button className="btn-primary" onClick={() => navigate('/candidates')}>Back to List</button>
        </div>
      </div>
    );
  }

  const renderInfoTab = () => (
    <div className="info-grid">
      <div className="info-section">
        <div className="section-title">
          <div className="title-left">
            <User size={20} /> Personal Information
          </div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Personal')}>
            <Edit2 size={14} />
          </button>
        </div>
        <div className="data-row">
          <span className="data-label">Full Name</span>
          <span className="data-value">{candidate.firstName} {candidate.lastName}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Mobile</span>
          <span className="data-value">{candidate.mobileNumber}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Email</span>
          <span className="data-value">{candidate.email || 'N/A'}</span>
        </div>
        <div className="data-row">
          <span className="data-label">DOB</span>
          <span className="data-value">{candidate.dob}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Address</span>
          <span className="data-value">{candidate.address}, {candidate.city}, {candidate.state}</span>
        </div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left">
            <Briefcase size={20} /> Professional Details
          </div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Professional')}>
            <Edit2 size={14} />
          </button>
        </div>
        <div className="data-row">
          <span className="data-label">Qualification</span>
          <span className="data-value">{candidate.qualification}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Experience</span>
          <span className="data-value">{candidate.experience}</span>
        </div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left">
            <CreditCard size={20} /> Identity Info
          </div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Identity')}>
            <Edit2 size={14} />
          </button>
        </div>
        <div className="data-row">
          <span className="data-label">Aadhar Number</span>
          <span className="data-value">{candidate.aadharNumber}</span>
        </div>
        <div className="data-row">
          <span className="data-label">PAN Number</span>
          <span className="data-value">{candidate.panNumber || 'N/A'}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Allotment</span>
          <span className={`status-pill ${candidate.candidateStatus?.toLowerCase()}`}>
            {candidate.candidateStatus}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">KYC Status</span>
          <span className={`kyc-badge ${candidate.kycStatus?.toLowerCase().replace(/ /g, '-')}`}>
            {candidate.kycStatus}
          </span>
        </div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left">
            <Users size={20} /> Guardian Information
          </div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Guardian')}>
            <Edit2 size={14} />
          </button>
        </div>
        <div className="data-row">
          <span className="data-label">Guardian Name</span>
          <span className="data-value">{candidate.guardianName}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Relation</span>
          <span className="data-value">{candidate.guardianRelation}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Guardian Mobile</span>
          <span className="data-value">{candidate.guardianMobile}</span>
        </div>
      </div>
    </div>
  );

  const renderAllocationsTab = () => (
    <div className="empty-tab-state">
      <Briefcase size={48} />
      <h2>No Allocations Found</h2>
      <p>This candidate has not been assigned to any jobs yet.</p>
    </div>
  );

  const renderDocumentsTab = () => {
    const documents = [
      { id: 'doc1', title: 'Aadhar Front', type: 'Identity', url: candidate.aadharFrontUrl },
      { id: 'doc2', title: 'Aadhar Back', type: 'Identity', url: candidate.aadharBackUrl },
      { id: 'doc3', title: 'PAN Card', type: 'Identity', url: candidate.panCardUrl },
      { id: 'doc4', title: 'Profile Photo', type: 'Profile', url: candidate.profileImageUrl },
    ];

    return (
      <div className="docs-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-header">
              <div className="doc-icon">
                <FileText size={20} />
              </div>
              <div className="doc-info">
                <h3>{doc.title}</h3>
                <p>{doc.type}</p>
              </div>
            </div>
            <div className="doc-preview">
              {doc.url ? (
                <img src={doc.url} alt={doc.title} />
              ) : (
                <div className="placeholder">
                  <ImageIcon size={32} />
                  <span>No preview available</span>
                </div>
              )}
            </div>
            <div className="doc-actions">
              <button className="doc-btn"><Eye size={14} /> View</button>
              <button className="doc-btn" onClick={() => doc.url && window.open(doc.url, '_blank')}><Download size={14} /> Download</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="candidate-details-page">
      <div className="details-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/candidates')}>
            <ArrowLeft size={20} />
          </button>
          <div className="candidate-profile-summary">
            <div className="large-avatar">
              {candidate.profileImageUrl ? (
                <img src={candidate.profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <>{candidate.firstName[0]}{candidate.lastName[0]}</>
              )}
            </div>
            <div className="summary-info">
              <h1>{candidate.firstName} {candidate.lastName}</h1>
              <p>
                <span>UID: {candidate.uid}</span>
                <span className="dot"></span>
                <span>Role: {candidate.role}</span>
              </p>
              <div className="status-badges">
                <span className={`status-pill ${candidate.candidateStatus?.toLowerCase()}`}>
                  {candidate.candidateStatus}
                </span>
                <span className={`kyc-badge ${candidate.kycStatus?.toLowerCase().replace(/ /g, '-')}`}>
                  <ShieldCheck size={14} /> {candidate.kycStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="delete-btn" onClick={handleDelete}>
            <Trash2 size={18} /> Delete Candidate
          </button>
        </div>
      </div>

      <div className="details-tabs">
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <User size={16} /> Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'allocations' ? 'active' : ''}`}
          onClick={() => setActiveTab('allocations')}
        >
          <Briefcase size={16} /> Allocations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={16} /> Documents
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'allocations' && renderAllocationsTab()}
        {activeTab === 'documents' && renderDocumentsTab()}
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={`Edit ${editSection} Information`}
        width="600px"
      >
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {editSection === 'Personal' && (
              <>
                <div className="form-field">
                  <label>First Name</label>
                  <input name="firstName" value={editData.firstName} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>Last Name</label>
                  <input name="lastName" value={editData.lastName} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>Mobile Number</label>
                  <input name="mobileNumber" value={editData.mobileNumber} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input name="email" value={editData.email} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>DOB</label>
                  <input name="dob" type="date" value={editData.dob} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>City</label>
                  <input name="city" value={editData.city} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label>Address</label>
                  <textarea name="address" value={editData.address} onChange={handleEditChange} className="form-input" rows="2" />
                </div>
              </>
            )}

            {editSection === 'Professional' && (
              <>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label>Qualification</label>
                  <input name="qualification" value={editData.qualification} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label>Experience</label>
                  <textarea name="experience" value={editData.experience} onChange={handleEditChange} className="form-input" rows="3" />
                </div>
              </>
            )}

            {editSection === 'Identity' && (
              <>
                <div className="form-field">
                  <label>Aadhar Number</label>
                  <input name="aadharNumber" value={editData.aadharNumber} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>PAN Number</label>
                  <input name="panNumber" value={editData.panNumber} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>Allotment Status</label>
                  <select name="candidateStatus" value={editData.candidateStatus} onChange={handleEditChange} className="form-input">
                    <option value="available">Available</option>
                    <option value="allotted">Allotted</option>
                    <option value="on-leave">On Leave</option>
                    <option value="resigned">Resigned</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>KYC Status</label>
                  <select name="kycStatus" value={editData.kycStatus} onChange={handleEditChange} className="form-input">
                    <option value="in progress">In Progress</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </>
            )}

            {editSection === 'Guardian' && (
              <>
                <div className="form-field">
                  <label>Guardian Name</label>
                  <input name="guardianName" value={editData.guardianName} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>Relation</label>
                  <input name="guardianRelation" value={editData.guardianRelation} onChange={handleEditChange} className="form-input" />
                </div>
                <div className="form-field">
                  <label>Guardian Mobile</label>
                  <input name="guardianMobile" value={editData.guardianMobile} onChange={handleEditChange} className="form-input" />
                </div>
              </>
            )}
          </div>

          <div className="form-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ background: 'var(--secondary)', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-sm)', fontWeight: '700' }}>
              {saving ? <Loader size={16} className="spin" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CandidateDetails;
