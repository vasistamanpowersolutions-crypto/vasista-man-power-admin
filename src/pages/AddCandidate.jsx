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
    // Basic Information
    firstName: '',
    lastName: '',
    mobileNumber: '',
    type: 'Full-time', // Part-time or Full-time
    
    // Professional Information
    experienceLevel: 'Fresher', // Fresher or Experienced
    previousJobTitle: '',
    experienceYears: '',
    wantedJobTitle: '',
    skills: '',
    
    // Family Details
    fatherName: '',
    fatherMobileNumber: '',
    
    // Address Details
    address: '',
    city: '',
    state: '',
    
    // Identity Information
    aadharNumber: '',
    panNumber: '',
    
    // Status Information
    candidateStatus: 'Open to Work',
    kycStatus: 'Pending',
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

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('fieldName', fieldName);

      const response = await axios.post(
        `${API_URL}/upload-image`,
        formDataUpload,
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
      'firstName', 'lastName', 'mobileNumber', 'type',
      'experienceLevel', 'wantedJobTitle', 'skills',
      'fatherName', 'fatherMobileNumber', 'address', 'city', 'state'
    ];

    for (let field of required) {
      if (!formData[field]) {
        setMessage(`Please fill in ${field}`);
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

  const ImageUploadField = ({ label, fieldName, required = false }) => {
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
        {/* Basic Information Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Basic Information</h2>
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
                Job Type <span className="required">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Professional Information</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Experience Level <span className="required">*</span>
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Fresher">Fresher</option>
                <option value="Experienced">Experienced</option>
              </select>
            </div>
            {formData.experienceLevel === 'Experienced' && (
              <>
                <div className="form-group">
                  <label className="form-label">Previous Job Title <span className="required">*</span></label>
                  <input
                    type="text"
                    name="previousJobTitle"
                    value={formData.previousJobTitle}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g. Sales Executive"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Exp Years <span className="required">*</span></label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Years of experience"
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Wanted Job Title (Comma separated) <span className="required">*</span></label>
            <textarea
              name="wantedJobTitle"
              value={formData.wantedJobTitle}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Driver, Cook, Security Guard"
              rows="2"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills (Comma separated) <span className="required">*</span></label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Driving, Cooking, First Aid"
              rows="2"
              required
            />
          </div>
        </div>

        {/* Family Details Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Family Details</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Father's Name <span className="required">*</span></label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter father's name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Father's Mobile Number <span className="required">*</span></label>
              <input
                type="tel"
                name="fatherMobileNumber"
                value={formData.fatherMobileNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter mobile number"
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>
        </div>

        {/* Address Details Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Address Details</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Full Address <span className="required">*</span></label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter full address"
              rows="2"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City <span className="required">*</span></label>
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
              <label className="form-label">State <span className="required">*</span></label>
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
        </div>

        {/* Status Information Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Status Information</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Candidate Status <span className="required">*</span>
              </label>
              <select
                name="candidateStatus"
                value={formData.candidateStatus}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Open to Work">Open to Work</option>
                <option value="allotted">Allotted</option>
                <option value="on-leave">On Leave</option>
                <option value="resigned">Resigned</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                KYC Status <span className="required">*</span>
              </label>
              <select
                name="kycStatus"
                value={formData.kycStatus}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Pending">Pending</option>
                <option value="Verification in Progress">Verification in Progress</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Section (Optional during Add) */}
        <div className="form-section">
          <div className="section-header">
            <h2>Documents & Identity</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Aadhar Number</label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="12-digit Aadhar"
                pattern="[0-9]{12}"
              />
            </div>
            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="PAN Number"
              />
            </div>
          </div>

          <div className="form-row">
            <ImageUploadField label="Profile Photo" fieldName="profilePhoto" />
            <ImageUploadField label="Aadhar Front" fieldName="aadharFront" />
          </div>
          <div className="form-row">
            <ImageUploadField label="Aadhar Back" fieldName="aadharBack" />
            <ImageUploadField label="PAN Card" fieldName="panCard" />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={20} className="spin" /> Creating...
              </>
            ) : (
              <>
                <Save size={20} /> Create Candidate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCandidate;
