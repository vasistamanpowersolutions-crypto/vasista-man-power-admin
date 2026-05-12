import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Upload, AlertCircle, CheckCircle,
  Loader, X, Image as ImageIcon, Save, Building2
} from 'lucide-react';
import './AddCandidate.css'; // Reusing form styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AddBusinessOwner = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    mobileNumber: '',
    email: '',
    ownerName: '',
    address: '',
    docType: 'GST', // Default
  });

  const [images, setImages] = useState({
    businessFront: null,
    selectedDoc: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    businessFront: '',
    selectedDoc: '',
  });

  const [uploading, setUploading] = useState({
    businessFront: false,
    selectedDoc: false,
  });

  const [uploadedUrls, setUploadedUrls] = useState({
    businessFront: '',
    selectedDoc: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      setImages((prev) => ({ ...prev, [fieldName]: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviews((prev) => ({ ...prev, [fieldName]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (fieldName) => {
    if (!images[fieldName]) return;
    
    try {
      setUploading((prev) => ({ ...prev, [fieldName]: true }));
      const data = new FormData();
      data.append('file', images[fieldName]);
      data.append('fieldName', fieldName);

      const response = await axios.post(`${API_URL}/upload-image`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET_KEY,
        },
      });

      if (response.data.url) {
        setUploadedUrls((prev) => ({ ...prev, [fieldName]: response.data.url }));
        setMessage(`${fieldName === 'businessFront' ? 'Business photo' : formData.docType} uploaded!`);
        setMessageType('success');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed');
      setMessageType('error');
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName || !formData.mobileNumber || !formData.ownerName) {
      setMessage('Please fill required fields');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      
      const payload = {
        ...formData,
        businessFrontUrl: uploadedUrls.businessFront || imagePreviews.businessFront, // Fallback to base64 if not uploaded
        docImageUrl: uploadedUrls.selectedDoc || imagePreviews.selectedDoc,
      };

      await axios.post(`${API_URL}/businesses`, payload, {
        headers: { 'x-admin-secret': secret }
      });

      setMessage('Business Owner added successfully!');
      setMessageType('success');
      setTimeout(() => navigate('/clients'), 2000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to save details');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const ImageUploadBox = ({ label, fieldName }) => {
    const preview = imagePreviews[fieldName];
    return (
      <div className="form-group image-upload-group">
        <label className="form-label">{label}</label>
        <div className="image-upload-container">
          {preview ? (
            <div className="image-preview">
              <img src={preview} alt={label} />
              <button type="button" className="remove-image-btn" onClick={() => {
                setImagePreviews(p => ({ ...p, [fieldName]: '' }));
                setImages(p => ({ ...p, [fieldName]: null }));
              }}><X size={18} /></button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <ImageIcon size={32} />
              <p>No image selected</p>
            </div>
          )}
          <div className="upload-actions">
            <input type="file" id={`file-${fieldName}`} accept="image/*" onChange={(e) => handleImageSelect(e, fieldName)} style={{ display: 'none' }} />
            <button type="button" className="btn-secondary upload-btn" onClick={() => document.getElementById(`file-${fieldName}`).click()}>
              Select Image
            </button>
            <button type="button" className="btn-primary upload-btn" onClick={() => uploadImage(fieldName)} disabled={!images[fieldName] || uploading[fieldName]}>
              {uploading[fieldName] ? <Loader size={16} className="spin" /> : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="add-candidate-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/clients')}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-info">
          <h1>Add New Business Owner</h1>
          <p>Register a new client for manpower services</p>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`}>
          <div className="alert-content">
            {messageType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message}</span>
          </div>
          <button className="alert-close" onClick={() => setMessage('')}><X size={16} /></button>
        </div>
      )}

      <form className="add-candidate-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-header">
            <h2>Business Details</h2>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Business Name <span className="required">*</span></label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="form-input" placeholder="ABC Pvt Ltd" required />
            </div>
            <div className="form-group">
              <label className="form-label">Owner Name <span className="required">*</span></label>
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="form-input" placeholder="John Doe" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mobile Number <span className="required">*</span></label>
              <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="form-input" placeholder="10-digit number" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email (Optional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="email@business.com" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Business Address</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} className="form-input" rows="2" placeholder="Full office address"></textarea>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Legal Documents</h2>
          </div>
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select name="docType" value={formData.docType} onChange={handleInputChange} className="form-input">
              <option value="GST">GST Certificate</option>
              <option value="Labour">Labour License</option>
              <option value="Udhyam">Udhyam Registration</option>
            </select>
          </div>
          <ImageUploadBox label={`${formData.docType} Document`} fieldName="selectedDoc" />
          <ImageUploadBox label="Business Frontside Photo" fieldName="businessFront" />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/clients')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader size={18} className="spin" /> : <><Save size={18} /> Save Business Owner</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBusinessOwner;
