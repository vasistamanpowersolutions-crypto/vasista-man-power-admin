import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Building2, User, Phone, Mail, MapPin, 
  FileText, Briefcase, Trash2, Edit2, Save, Download, 
  Eye, Loader, ShieldCheck, Image as ImageIcon
} from 'lucide-react';
import Modal from '../components/Modal';
import './CandidateDetails.css'; // Reusing details styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const BusinessOwnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBusinessDetails();
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
        alert('Failed to delete');
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
      alert('Updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <div className="data-row">
          <span className="data-label">Business Name</span>
          <span className="data-value">{business.businessName}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Owner Name</span>
          <span className="data-value">{business.ownerName}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Mobile</span>
          <span className="data-value">{business.mobileNumber}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Email</span>
          <span className="data-value">{business.email || 'N/A'}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Address</span>
          <span className="data-value">{business.address}</span>
        </div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><FileText size={20} /> Documents & Status</div>
        </div>
        <div className="data-row">
          <span className="data-label">Document Type</span>
          <span className="data-value">{business.docType}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Status</span>
          <span className="status-pill active">{business.status || 'Active'}</span>
        </div>
      </div>
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

  return (
    <div className="candidate-details-page">
      <div className="details-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/clients')}>
            <ArrowLeft size={20} />
          </button>
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
        {activeTab === 'allocations' && <div className="empty-tab-state"><Briefcase size={48} /><h2>No Allotments</h2><p>No manpower has been assigned to this business yet.</p></div>}
        {activeTab === 'documents' && renderDocumentsTab()}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${editSection}`} width="600px">
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-field" style={{ gridColumn: 'span 2' }}><label>Business Name</label><input name="businessName" value={editData.businessName} onChange={handleEditChange} className="form-input" /></div>
            <div className="form-field"><label>Owner Name</label><input name="ownerName" value={editData.ownerName} onChange={handleEditChange} className="form-input" /></div>
            <div className="form-field"><label>Mobile</label><input name="mobileNumber" value={editData.mobileNumber} onChange={handleEditChange} className="form-input" /></div>
            <div className="form-field"><label>Email</label><input name="email" value={editData.email} onChange={handleEditChange} className="form-input" /></div>
            <div className="form-field"><label>Status</label><select name="status" value={editData.status} onChange={handleEditChange} className="form-input"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}><label>Address</label><textarea name="address" value={editData.address} onChange={handleEditChange} className="form-input" rows="2" /></div>
          </div>
          <div className="form-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader size={16} className="spin" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BusinessOwnerDetails;
