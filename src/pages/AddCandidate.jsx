import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Upload, AlertCircle, CheckCircle,
  Loader, X, Image as ImageIcon, Save, ChevronDown, Search
} from 'lucide-react';
import { State, City } from 'country-state-city';
import { candidateAPI } from '../services/api';
import { geoData } from '../utils/geoData';
import './AddCandidate.css';

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

// Custom multi-select dropdown component (styled with vanilla CSS)
const CustomMultiSelectDropdown = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'Select options',
  label = '',
  required = false
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

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (option) => {
    let newSelected;
    if (selectedValues.includes(option)) {
      newSelected = selectedValues.filter(val => val !== option);
    } else {
      newSelected = [...selectedValues, option];
    }
    onChange(newSelected);
  };

  return (
    <div className="form-group custom-dropdown-container" ref={dropdownRef}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
      >
        <span className={selectedValues.length > 0 ? 'selected-text' : 'placeholder'}>
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : placeholder
          }
        </span>
        <ChevronDown size={16} />
      </div>

      {isOpen && (
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
              filteredOptions.map((option, idx) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleOption(option)}
                    className="custom-dropdown-option"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ marginRight: '8px' }}
                    />
                    <span className={isSelected ? 'selected-text' : ''}>{option}</span>
                  </div>
                );
              })
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

const AddCandidate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);

  // Get states from npm package
  const statesList = State.getStatesOfCountry("IN").map(s => s.name);

  // Resolve districts from static local geoData
  const getDistrictsList = () => {
    if (!formData.state) return [];
    let lookupName = formData.state;
    if (lookupName === 'Jammu and Kashmir') lookupName = 'Jammu & Kashmir';
    return Object.keys(geoData[lookupName] || {});
  };

  // Resolve cities from package + local geoData
  const getCitiesList = () => {
    if (!formData.state) return [];
    const selectedStateObj = State.getStatesOfCountry("IN").find(s => {
      const n1 = s.name.toLowerCase().replace(/and/g, '&');
      const n2 = formData.state?.toLowerCase().replace(/and/g, '&');
      return n1 === n2 || s.name === formData.state;
    });
    const stateCode = selectedStateObj ? selectedStateObj.isoCode : "";
    const packageCities = stateCode ? City.getCitiesOfState("IN", stateCode).map(c => c.name) : [];
    
    let lookupName = formData.state;
    if (lookupName === 'Jammu and Kashmir') lookupName = 'Jammu & Kashmir';
    const localCities = (formData.district && geoData[lookupName]?.[formData.district]) || [];
    
    return Array.from(new Set([...localCities, ...packageCities]));
  };

  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    dob: '',
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
    district: '',
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

  // Fetch job roles from database
  React.useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
        const response = await axios.get(`${API_URL}/collection/job-roles`, {
          headers: { 'x-admin-secret': secret }
        });
        setJobRoles(response.data.map(role => role.title));
      } catch (err) {
        console.error('Error fetching job roles, using fallbacks:', err);
        setJobRoles([
          'Mason', 'Welder', 'Electrician', 'Plumber', 'Carpenter', 'Helper',
          'Driver', 'Cook', 'Security Guard', 'Housekeeper', 'Delivery Boy',
          'Sales Executive', 'Receptionist', 'Office Assistant', 'Accountant',
          'Supervisor', 'Tailor', 'Painter', 'Fitter', 'Gardener', 'Caregiver'
        ]);
      }
    };
    fetchJobRoles();
  }, []);

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
      'firstName', 'lastName', 'dob', 'mobileNumber', 'type',
      'experienceLevel', 'wantedJobTitle', 'skills',
      'fatherName', 'fatherMobileNumber', 'address', 'city', 'district', 'state'
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
                Date of Birth <span className="required">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
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

          <CustomMultiSelectDropdown
            label="Wanted Job Title"
            required
            placeholder="Search and select job titles"
            options={jobRoles}
            selectedValues={selectedJobTitles}
            onChange={(titles) => {
              setSelectedJobTitles(titles);
              setFormData(prev => ({ ...prev, wantedJobTitle: titles.join(', ') }));
            }}
          />

          {selectedJobTitles.length > 0 && (
            <div className="selected-tags-container">
              {selectedJobTitles.map(title => (
                <span key={title} className="selected-tag">
                  {title}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = selectedJobTitles.filter(t => t !== title);
                      setSelectedJobTitles(updated);
                      setFormData(prev => ({ ...prev, wantedJobTitle: updated.join(', ') }));
                    }}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="form-group" style={{ marginTop: '20px' }}>
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

          {/* Dynamic Cascading Dropdowns */}
          <div className="form-row" style={{ marginBottom: '20px' }}>
            <CustomDropdown
              label="State"
              required
              options={statesList}
              value={formData.state}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, state: val, district: '', city: '' }));
              }}
              placeholder="Select State"
              showOthers={true}
            />
            <CustomDropdown
              label="District"
              required
              disabled={!formData.state}
              options={formData.state && formData.state !== 'Others' ? getDistrictsList() : []}
              value={formData.district}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, district: val, city: '' }));
              }}
              placeholder={formData.state ? "Select District" : "Select State First"}
              showOthers={true}
            />
            <CustomDropdown
              label="City / Town"
              required
              disabled={!formData.district}
              options={formData.district && formData.district !== 'Others' && formData.state !== 'Others' ? getCitiesList() : []}
              value={formData.city}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, city: val }));
              }}
              placeholder={formData.district ? "Select City / Town" : "Select District First"}
              showOthers={true}
            />
          </div>

          {/* Address Line 1 */}
          <div className="form-group">
            <label className="form-label">Address Line 1 <span className="required">*</span></label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter House No, Street Name, Area, etc."
              rows="2"
              required
            />
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
