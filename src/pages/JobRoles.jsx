import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import './JobRoles.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ROLES_API_URL = `${API_BASE}/collection/job-roles`;
const CATEGORIES_API_URL = `${API_BASE}/collection/business-categories`;

const JobRoles = () => {
  const [activeTab, setActiveTab] = useState('jobRoles');
  const [searchQuery, setSearchQuery] = useState('');

  // Job Roles State
  const [jobRoles, setJobRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [showAddRoleSection, setShowAddRoleSection] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ title: '', category: '' });

  // Business Categories State
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [showAddCatSection, setShowAddCatSection] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });

  // Fetch job roles
  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(ROLES_API_URL, {
        headers: { 'x-admin-secret': secret }
      });
      setJobRoles(response.data);
    } catch (error) {
      console.error('Error fetching job roles:', error);
      // Fallback dummy data if API fails or is empty
      setJobRoles([
        { id: 'role-1', title: 'Mason', category: 'Construction' },
        { id: 'role-2', title: 'Welder', category: 'Manufacturing' },
        { id: 'role-3', title: 'Electrician', category: 'Construction' },
        { id: 'role-4', title: 'Plumber', category: 'Construction' },
        { id: 'role-5', title: 'Carpenter', category: 'Construction' },
        { id: 'role-6', title: 'Helper', category: 'General' }
      ]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  // Fetch business categories
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const response = await axios.get(CATEGORIES_API_URL, {
        headers: { 'x-admin-secret': secret }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching business categories:', error);
      // Fallback dummy data if API fails or is empty
      setCategories([
        { id: 'cat-1', name: 'Construction' },
        { id: 'cat-2', name: 'Hospitality' },
        { id: 'cat-3', name: 'Manufacturing' },
        { id: 'cat-4', name: 'Retail & Logistics' }
      ]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchCategories();
  }, []);

  // Job Roles submit handler
  const handleRoleSave = async () => {
    if (!roleFormData.title.trim() || !roleFormData.category) return;
    try {
      setIsSavingRole(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const config = { headers: { 'x-admin-secret': secret } };

      if (editingRole) {
        await axios.put(`${ROLES_API_URL}/${editingRole.id}`, roleFormData, config);
      } else {
        await axios.post(ROLES_API_URL, roleFormData, config);
      }
      setEditingRole(null);
      setRoleFormData({ title: '', category: '' });
      fetchRoles();
    } catch (error) {
      console.error('Error saving job role:', error);
      alert('Failed to save job role. Make sure the API is running.');
    } finally {
      setIsSavingRole(false);
    }
  };

  // Job Roles delete handler
  const handleRoleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job role?')) {
      try {
        const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
        await axios.delete(`${ROLES_API_URL}/${id}`, {
          headers: { 'x-admin-secret': secret }
        });
        fetchRoles();
      } catch (error) {
        console.error('Error deleting job role:', error);
        alert('Failed to delete job role.');
      }
    }
  };

  // Business Category submit/save handler
  const handleCategorySave = async () => {
    if (!categoryFormData.name.trim()) return;
    try {
      setIsSavingCategory(true);
      const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
      const config = { headers: { 'x-admin-secret': secret } };

      if (editingCategory) {
        await axios.put(`${CATEGORIES_API_URL}/${editingCategory.id}`, categoryFormData, config);
      } else {
        await axios.post(CATEGORIES_API_URL, categoryFormData, config);
      }
      setEditingCategory(null);
      setCategoryFormData({ name: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving business category:', error);
      alert('Failed to save business category. Make sure the API is running.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Business Category delete handler
  const handleCategoryDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this business category?')) {
      try {
        const secret = import.meta.env.VITE_ADMIN_SECRET_KEY;
        await axios.delete(`${CATEGORIES_API_URL}/${id}`, {
          headers: { 'x-admin-secret': secret }
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting business category:', error);
        alert('Failed to delete business category.');
      }
    }
  };

  const openAddRoleSection = () => {
    setEditingRole(null);
    setRoleFormData({ title: '', category: '' });
    setShowAddRoleSection(true);
  };

  const openEditRoleSection = (role) => {
    setEditingRole(role);
    setRoleFormData({ title: role.title, category: role.category || '' });
    setShowAddRoleSection(true);
  };

  const openAddCategorySection = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: '' });
    setShowAddCatSection(true);
  };

  const openEditCategorySection = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({ name: cat.name });
    setShowAddCatSection(true);
  };

  // Filtering based on active tab
  const filteredRoles = jobRoles.filter(role => 
    role.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="job-roles-page">
      <div className="page-header">
        <div className="header-info">
          <h1>Settings & Configurations</h1>
          <p>Manage job roles and business categories for the platform.</p>
        </div>
        {activeTab === 'jobRoles' ? (
          !showAddRoleSection && (
            <button className="btn-primary" onClick={openAddRoleSection}>
              <Plus size={16} />
              <span>Add Job Role</span>
            </button>
          )
        ) : (
          !showAddCatSection && (
            <button className="btn-primary" onClick={openAddCategorySection}>
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          )
        )}
      </div>

      {/* Tabs */}
      <div className="details-tabs">
        <button 
          className={`tab-btn ${activeTab === 'jobRoles' ? 'active' : ''}`} 
          onClick={() => {
            setActiveTab('jobRoles');
            setSearchQuery('');
          }}
        >
          <Briefcase size={16} />
          <span>Job Roles</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'businessCategories' ? 'active' : ''}`} 
          onClick={() => {
            setActiveTab('businessCategories');
            setSearchQuery('');
          }}
        >
          <Building2 size={16} />
          <span>Business Categories</span>
        </button>
      </div>

      {/* Search Actions */}
      <div className="table-toolbar" style={{ padding: '0 0 24px 0', borderBottom: 'none', background: 'transparent' }}>
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder={activeTab === 'jobRoles' ? "Search job roles..." : "Search business categories..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {activeTab === 'jobRoles' ? (
        // Job Roles Tab Content
        <div className="job-roles-tab">
          {/* Add/Edit Inline Section for Job Roles */}
          {showAddRoleSection && (
            <div className="add-category-section">
              <h3>{editingRole ? "Edit Job Role" : "Add New Job Role"}</h3>
              <div className="section-body-inline">
                <div className="form-field">
                  <label>Job Role Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mason, Welder, Electrician..." 
                    value={roleFormData.title}
                    onChange={(e) => setRoleFormData({ ...roleFormData, title: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="form-field">
                  <label>Business Category</label>
                  <select 
                    value={roleFormData.category}
                    onChange={(e) => setRoleFormData({ ...roleFormData, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="inline-actions">
                  <button 
                    type="button" 
                    className="btn-secondary-action" 
                    onClick={() => {
                      setShowAddRoleSection(false);
                      setEditingRole(null);
                      setRoleFormData({ title: '', category: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary-action" 
                    disabled={isSavingRole || !roleFormData.title.trim() || !roleFormData.category}
                    onClick={handleRoleSave}
                  >
                    {isSavingRole ? (
                      <>
                        <Loader2 className="spinner-small" size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingRole ? "Update Role" : "Save Role"}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoadingRoles ? (
            <div className="loader-container">
              <Loader2 className="spinner" />
              <span>Loading job roles...</span>
            </div>
          ) : (
            <div className="job-roles-grid">
              {filteredRoles.map((role) => (
                <div key={role.id} className="job-role-card horizontal">
                  <div className="card-left">
                    <div className="card-icon">
                      <Briefcase size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <h3>{role.title}</h3>
                      <span className="category-tag-mini">{role.category || 'General'}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="action-btn edit" onClick={() => openEditRoleSection(role)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleRoleDelete(role.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredRoles.length === 0 && (
                <div className="empty-state">
                  <Briefcase size={48} />
                  <p>No job roles found. Add your first one!</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Business Categories Tab Content
        <div className="business-categories-tab">
          {/* Add/Edit Inline Section */}
          {showAddCatSection && (
            <div className="add-category-section">
              <h3>{editingCategory ? "Edit Business Category" : "Add New Business Category"}</h3>
              <div className="section-body-inline">
                <div className="form-field">
                  <label>Business Category Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Construction, Manufacturing, Retail..." 
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="inline-actions">
                  <button 
                    type="button" 
                    className="btn-secondary-action" 
                    onClick={() => {
                      setShowAddCatSection(false);
                      setEditingCategory(null);
                      setCategoryFormData({ name: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary-action" 
                    disabled={isSavingCategory || !categoryFormData.name.trim()}
                    onClick={handleCategorySave}
                  >
                    {isSavingCategory ? (
                      <>
                        <Loader2 className="spinner-small" size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingCategory ? "Update Category" : "Save Category"}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoadingCategories ? (
            <div className="loader-container">
              <Loader2 className="spinner" />
              <span>Loading business categories...</span>
            </div>
          ) : (
            <div className="job-roles-grid">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="job-role-card horizontal">
                  <div className="card-left">
                    <div className="card-icon" style={{ backgroundColor: 'var(--orange-bg)', color: 'var(--secondary)' }}>
                      <Building2 size={18} />
                    </div>
                    <h3>{cat.name}</h3>
                  </div>
                  <div className="card-actions">
                    <button className="action-btn edit" onClick={() => openEditCategorySection(cat)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleCategoryDelete(cat.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <div className="empty-state">
                  <Building2 size={48} />
                  <p>No business categories found. Add your first one!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobRoles;
