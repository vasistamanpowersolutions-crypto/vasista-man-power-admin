import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Upload, AlertCircle, CheckCircle,
  Loader, X, Image as ImageIcon, Save
} from 'lucide-react';
import { candidateAPI } from '../services/api';
import './AddCandidate.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AddCandidate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    mobileNumber: '',
    dateOfBirth: '',
    city: '',
    state: '',
    
    // Professional Information
    qualification: '',
    experience: '',
    skills: '',
    
    // Aadhar Information
    aadharNumber: '',
    
    // PAN Information
    panNumber: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactMobile: '',
  });

  const [images, setImages] = useState({
    profilePhoto: null,
    aadharFront: null,
    aadharBack: null,
    panCard: null,
  });

  const [uploadedImages, setUploadedImages] = useState({
    profilePhoto: '',
    aadharFront: '',
    aadharBack: '',
    panCard: '',
  });

  const [imagePreviews, setImagePreviews] = useState({
    profilePhoto: '',
    aadharFront: '',
    aadharBack: '',
    panCard: '',
  });

  const [uploading, setUploading] = useState({
    profilePhoto: false,
    aadharFront: false,
    aadharBack: false,
    panCard: false,
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
      // Store the file in state
      setImages((prev) => ({
        ...prev,
        [fieldName]: file,
      }));

      // Create a preview URL immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviews((prev) => ({
          ...prev,
          [fieldName]: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToServer = async (file, fieldName) => {
    try {
      setUploading((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldName', fieldName);

      const response = await axios.post(
        `${API_URL}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET_KEY,
          },
        }
      );

      if (response.data.url) {
        setUploadedImages((prev) => ({
          ...prev,
          [fieldName]: response.data.url,
        }));
        setMessage(`${fieldName} uploaded successfully`);
        setMessageType('success');
      }
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      setMessage(`Failed to upload ${fieldName}`);
      setMessageType('error');
    } finally {
      setUploading((prev) => ({
        ...prev,
        [fieldName]: false,
      }));
    }
  };

  const handleUploadClick = async (fieldName) => {
    if (!images[fieldName]) {
      setMessage('Please select an image first');
      setMessageType('warning');
      return;
    }
    await uploadImageToServer(images[fieldName], fieldName);
  };

  const handleRemoveImage = (fieldName) => {
    setImages((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
    setImagePreviews((prev) => ({
      ...prev,
      [fieldName]: '',
    }));
    setUploadedImages((prev) => ({
      ...prev,
      [fieldName]: '',
    }));
  };

  const validateForm = () => {
    const required = [
      'firstName', 'lastName', 'mobileNumber', 'dateOfBirth',
      'city', 'state', 'aadharNumber', 'panNumber',
      'emergencyContactName', 'emergencyContactRelation', 'emergencyContactMobile'
    ];

    for (let field of required) {
      if (!formData[field]) {
        setMessage(`Please fill in ${field}`);
        setMessageType('error');
        return false;
      }
    }

    // Check if all images are selected or uploaded
    // Accept either uploadedImages (from backend) or images (from local selection)
    const imageFields = ['profilePhoto', 'aadharFront', 'aadharBack', 'panCard'];
    
    for (let field of imageFields) {
      if (!uploadedImages[field] && !images[field]) {
        setMessage(`Please select and upload ${field}`);
        setMessageType('error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Helper function to convert File to base64 if needed
      const getImageData = async (fieldName) => {
        // If already uploaded to server, use the URL
        if (uploadedImages[fieldName]) {
          return uploadedImages[fieldName];
        }

        // If local image is selected, convert to base64
        if (images[fieldName]) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve(e.target.result);
            };
            reader.readAsDataURL(images[fieldName]);
          });
        }

        return null;
      };

      // Get all image data (URLs or base64)
      const profilePhotoData = await getImageData('profilePhoto');
      const aadharFrontData = await getImageData('aadharFront');
      const aadharBackData = await getImageData('aadharBack');
      const panCardData = await getImageData('panCard');

      const candidateData = {
        ...formData,
        profilePhoto: profilePhotoData,
        aadharFront: aadharFrontData,
        aadharBack: aadharBackData,
        panCard: panCardData,
      };

      const response = await candidateAPI.create(candidateData);

      setMessage('Candidate created successfully!');
      setMessageType('success');

      setTimeout(() => {
        navigate('/candidates');
      }, 2000);
    } catch (error) {
      console.error('Error creating candidate:', error);
      setMessage(
        error.response?.data?.message || 'Error creating candidate. Please try again.'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const ImageUploadField = ({ label, fieldName, required = true }) => {
    const displayImage = imagePreviews[fieldName] || uploadedImages[fieldName];
    
    return (
      <div className="form-group image-upload-group">
        <label className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
        <div className="image-upload-container">
          {displayImage ? (
            <div className="image-preview">
              <img src={displayImage} alt={label} />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => handleRemoveImage(fieldName)}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <ImageIcon size={32} />
              <p>No image selected</p>
            </div>
          )}
          <div className="upload-actions">
            <input
              type="file"
              id={`file-input-${fieldName}`}
              accept="image/*"
              onChange={(e) => handleImageSelect(e, fieldName)}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn-secondary upload-btn"
              onClick={() => document.getElementById(`file-input-${fieldName}`).click()}
              disabled={uploading[fieldName]}
            >
              <Upload size={16} /> Select Image
            </button>
            <button
              type="button"
              className="btn-primary upload-btn"
              onClick={() => handleUploadClick(fieldName)}
              disabled={!images[fieldName] || uploading[fieldName]}
            >
              {uploading[fieldName] ? (
                <>
                  <Loader size={16} className="spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} /> Upload
                </>
              )}
            </button>
          </div>
          {uploadedImages[fieldName] && (
            <div className="upload-success">
              <CheckCircle size={16} /> Uploaded
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="add-candidate-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/candidates')}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-info">
          <h1>Add New Candidate</h1>
          <p>Fill in all the required information to create a new candidate profile</p>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`}>
          <div className="alert-content">
            {messageType === 'error' && <AlertCircle size={18} />}
            {messageType === 'success' && <CheckCircle size={18} />}
            <span>{message}</span>
          </div>
          <button
            className="alert-close"
            onClick={() => setMessage('')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form className="add-candidate-form" onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Personal Information</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Mobile Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter 10-digit mobile number"
                pattern="[0-9]{10}"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Date of Birth <span className="required">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                City <span className="required">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter city"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                State <span className="required">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter state"
                required
              />
            </div>
          </div>

          <ImageUploadField label="Profile Photo" fieldName="profilePhoto" />
        </div>

        {/* Professional Information Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Professional Information</h2>
          </div>

          <div className="form-group">
            <label className="form-label">
              Qualification
            </label>
            <textarea
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter qualification details (e.g., B.Tech, M.A, etc.)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Experience
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter experience details"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Skills
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter skills (comma-separated)"
              rows="3"
            />
          </div>
        </div>

        {/* Aadhar Information Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Aadhar Card Information</h2>
          </div>

          <div className="form-group">
            <label className="form-label">
              Aadhar Number <span className="required">*</span>
            </label>
            <input
              type="text"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter 12-digit Aadhar number"
              pattern="[0-9]{12}"
              required
            />
          </div>

          <div className="form-row">
            <ImageUploadField label="Aadhar Front" fieldName="aadharFront" />
            <ImageUploadField label="Aadhar Back" fieldName="aadharBack" />
          </div>
        </div>

        {/* PAN Information Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>PAN Card Information</h2>
          </div>

          <div className="form-group">
            <label className="form-label">
              PAN Number <span className="required">*</span>
            </label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter PAN number"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              required
            />
          </div>

          <ImageUploadField label="PAN Card" fieldName="panCard" />
        </div>

        {/* Emergency Contact Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Emergency Contact Information</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Contact Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter contact name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Relation <span className="required">*</span>
              </label>
              <select
                name="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select relation</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="emergencyContactMobile"
              value={formData.emergencyContactMobile}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter 10-digit mobile number"
              pattern="[0-9]{10}"
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/candidates')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={18} /> Save Candidate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCandidate;
