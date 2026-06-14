import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, User, Briefcase, FileText, 
  Phone, Mail, MapPin, Calendar, 
  ShieldCheck, CreditCard, Users, ExternalLink,
  Download, Eye, Image as ImageIcon, Loader,
  Trash2, Edit2, Save, Plus, Search, Building2,
  CheckCircle2, Clock, ChevronDown
} from 'lucide-react';
import Modal from '../components/Modal';
import { State, City } from 'country-state-city';
import { geoData } from '../utils/geoData';
import './CandidateDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Custom single-select dropdown component (styled with vanilla CSS)
const CustomDropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option',
  disabled = false,
  required = false,
  label = '',
  showOthers = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  if (showOthers) {
    const hasOthers = filteredOptions.some(opt => opt.toLowerCase() === 'others');
    if (!hasOthers) {
      if (!search || 'others'.includes(search.toLowerCase()) || filteredOptions.length === 0) {
        filteredOptions = [...filteredOptions, 'Others'];
      }
    }
  }

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="form-group custom-dropdown-container" ref={dropdownRef}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`custom-dropdown-trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
      >
        <span className={value ? 'selected-text' : 'placeholder'}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} />
      </div>

      {isOpen && !disabled && (
        <div className="custom-dropdown-menu">
          <div className="custom-dropdown-search-wrapper">
            <Search size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="custom-dropdown-search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="custom-dropdown-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`custom-dropdown-option ${value === option ? 'selected' : ''}`}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="custom-dropdown-option" style={{ color: 'var(--text-muted)', textAlign: 'center', cursor: 'default' }}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  // Get states from npm package
  const statesList = State.getStatesOfCountry("IN").map(s => s.name);

  // Resolve districts from static local geoData
  const getDistrictsList = () => {
    if (!editData.state) return [];
    let lookupName = editData.state;
    if (lookupName === 'Jammu and Kashmir') lookupName = 'Jammu & Kashmir';
    return Object.keys(geoData[lookupName] || {});
  };

  // Resolve cities from package + local geoData
  const getCitiesList = () => {
    if (!editData.state) return [];
    const selectedStateObj = State.getStatesOfCountry("IN").find(s => {
      const n1 = s.name.toLowerCase().replace(/and/g, '&');
      const n2 = editData.state?.toLowerCase().replace(/and/g, '&');
      return n1 === n2 || s.name === editData.state;
    });
    const stateCode = selectedStateObj ? selectedStateObj.isoCode : "";
    const packageCities = stateCode ? City.getCitiesOfState("IN", stateCode).map(c => c.name) : [];
    
    let lookupName = editData.state;
    if (lookupName === 'Jammu and Kashmir') lookupName = 'Jammu & Kashmir';
    const localCities = (editData.district && geoData[lookupName]?.[editData.district]) || [];
    
    return Array.from(new Set([...localCities, ...packageCities]));
  };

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
        <div className="data-row"><span className="data-label">Date of Birth</span><span className="data-value">{candidate.dob ? new Date(candidate.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
        <div className="data-row"><span className="data-label">Mobile</span><span className="data-value">{candidate.mobileNumber}</span></div>
        <div className="data-row"><span className="data-label">Father's Name</span><span className="data-value">{candidate.fatherName || 'N/A'}</span></div>
        <div className="data-row"><span className="data-label">Father's Mobile</span><span className="data-value">{candidate.fatherMobileNumber || 'N/A'}</span></div>
        <div className="data-row"><span className="data-label">Address</span><span className="data-value">{candidate.address || 'N/A'}, {candidate.district ? candidate.district + ', ' : ''}{candidate.city}, {candidate.state}</span></div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><Briefcase size={20} /> Professional Details</div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Professional')}><Edit2 size={14} /></button>
        </div>
        <div className="data-row"><span className="data-label">Job Type</span><span className="data-value">{candidate.type || 'N/A'}</span></div>
        <div className="data-row"><span className="data-label">Exp Level</span><span className="data-value">{candidate.experienceLevel || 'N/A'}</span></div>
        {candidate.experienceLevel === 'Experienced' && (
          <>
            <div className="data-row"><span className="data-label">Prev Job</span><span className="data-value">{candidate.previousJobTitle || 'N/A'}</span></div>
            <div className="data-row"><span className="data-label">Exp Years</span><span className="data-value">{candidate.experienceYears || '0'}</span></div>
          </>
        )}
        <div className="data-row"><span className="data-label">Wanted Jobs</span><span className="data-value">{candidate.wantedJobTitle || 'N/A'}</span></div>
        <div className="data-row"><span className="data-label">Skills</span><span className="data-value">{candidate.skills || 'N/A'}</span></div>
      </div>

      <div className="info-section">
        <div className="section-title">
          <div className="title-left"><CreditCard size={20} /> Status & Identity</div>
          <button className="edit-section-btn" onClick={() => handleEditClick('Identity')}><Edit2 size={14} /></button>
        </div>
        <div className="data-row"><span className="data-label">Status</span><span className={`status-pill ${candidate.candidateStatus?.toLowerCase().replace(/ /g, '-')}`}>{candidate.candidateStatus}</span></div>
        <div className="data-row"><span className="data-label">KYC Status</span><span className={`kyc-badge ${candidate.kycStatus?.toLowerCase().replace(/ /g, '-')}`}>{candidate.kycStatus}</span></div>
        <div className="data-row"><span className="data-label">Aadhar Number</span><span className="data-value">{candidate.aadharNumber || 'N/A'}</span></div>
        <div className="data-row"><span className="data-label">PAN Number</span><span className="data-value">{candidate.panNumber || 'N/A'}</span></div>
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
              <p><span>ID: {candidate.candidateId || candidate.id}</span><span className="dot"></span><span>Type: {candidate.type || 'Candidate'}</span></p>
              <div className="status-badges">
                <span className={`status-pill ${candidate.candidateStatus?.toLowerCase().replace(/ /g, '-')}`}>{candidate.candidateStatus}</span>
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
                <div className="form-group"><label>Date of Birth *</label><input type="date" name="dob" value={editData.dob || ''} onChange={handleEditChange} className="form-control" required /></div>
                <div className="form-group"><label>Mobile</label><input name="mobileNumber" value={editData.mobileNumber} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group"><label>Father Name</label><input name="fatherName" value={editData.fatherName} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group"><label>Father Mobile</label><input name="fatherMobileNumber" value={editData.fatherMobileNumber} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Address</label><textarea name="address" value={editData.address || ''} onChange={handleEditChange} className="form-control" rows="2" /></div>
                <CustomDropdown
                  label="State"
                  options={statesList}
                  value={editData.state || ''}
                  onChange={(val) => {
                    setEditData(prev => ({ ...prev, state: val, district: '', city: '' }));
                  }}
                  placeholder="Select State"
                  showOthers={true}
                />
                <CustomDropdown
                  label="District"
                  disabled={!editData.state}
                  options={editData.state && editData.state !== 'Others' ? getDistrictsList() : []}
                  value={editData.district || ''}
                  onChange={(val) => {
                    setEditData(prev => ({ ...prev, district: val, city: '' }));
                  }}
                  placeholder={editData.state ? "Select District" : "Select State First"}
                  showOthers={true}
                />
                <CustomDropdown
                  label="City"
                  disabled={!editData.district}
                  options={editData.district && editData.district !== 'Others' && editData.state !== 'Others' ? getCitiesList() : []}
                  value={editData.city || ''}
                  onChange={(val) => {
                    setEditData(prev => ({ ...prev, city: val }));
                  }}
                  placeholder={editData.district ? "Select City" : "Select District First"}
                  showOthers={true}
                />
              </>
            )}
            {editSection === 'Professional' && (
              <>
                <div className="form-group"><label>Job Type</label><select name="type" value={editData.type} onChange={handleEditChange} className="form-control"><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option></select></div>
                <div className="form-group"><label>Experience Level</label><select name="experienceLevel" value={editData.experienceLevel} onChange={handleEditChange} className="form-control"><option value="Fresher">Fresher</option><option value="Experienced">Experienced</option></select></div>
                {editData.experienceLevel === 'Experienced' && (
                  <>
                    <div className="form-group"><label>Prev Job</label><input name="previousJobTitle" value={editData.previousJobTitle} onChange={handleEditChange} className="form-control" /></div>
                    <div className="form-group"><label>Exp Years</label><input name="experienceYears" value={editData.experienceYears} onChange={handleEditChange} className="form-control" /></div>
                  </>
                )}
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Wanted Jobs</label><textarea name="wantedJobTitle" value={editData.wantedJobTitle} onChange={handleEditChange} className="form-control" rows="2" /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Skills</label><textarea name="skills" value={editData.skills} onChange={handleEditChange} className="form-control" rows="2" /></div>
              </>
            )}
            {editSection === 'Identity' && (
              <>
                <div className="form-group"><label>Candidate Status</label><select name="candidateStatus" value={editData.candidateStatus} onChange={handleEditChange} className="form-control"><option value="Open to Work">Open to Work</option><option value="allotted">Allotted</option><option value="on-leave">On Leave</option><option value="resigned">Resigned</option></select></div>
                <div className="form-group"><label>KYC Status</label><select name="kycStatus" value={editData.kycStatus} onChange={handleEditChange} className="form-control"><option value="Pending">Pending</option><option value="Verification in Progress">Verification in Progress</option><option value="Verified">Verified</option><option value="Rejected">Rejected</option></select></div>
                <div className="form-group"><label>Aadhar Number</label><input name="aadharNumber" value={editData.aadharNumber} onChange={handleEditChange} className="form-control" /></div>
                <div className="form-group"><label>PAN Number</label><input name="panNumber" value={editData.panNumber} onChange={handleEditChange} className="form-control" /></div>
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
