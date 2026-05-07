import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import Modal from '../components/Modal';
import './JobRoles.css';

const API_URL = import.meta.env.VITE_API_URL + '/job-roles';

const JobRoles = () => {
  const [jobRoles, setJobRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ title: '' });

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setJobRoles(response.data);
    } catch (error) {
      console.error('Error fetching job roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (editingRole) {
        await axios.put(`${API_URL}/${editingRole.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setIsModalOpen(false);
      setEditingRole(null);
      setFormData({ title: '' });
      fetchRoles();
    } catch (error) {
      console.error('Error saving job role:', error);
      alert('Failed to save job role. Make sure the API is running.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job role?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchRoles();
      } catch (error) {
        console.error('Error deleting job role:', error);
      }
    }
  };

  const openAddModal = () => {
    setEditingRole(null);
    setFormData({ title: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({ title: role.title });
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div className="header-text">
          <h1>Job Roles</h1>
          <p>Define and manage various job categories for candidates.</p>
        </div>
        <button className="add-btn" onClick={openAddModal}>
          <Plus size={18} />
          <span>Add Job Role</span>
        </button>
      </div>

      <div className="table-actions-row" style={{ padding: '0 0 24px 0', borderBottom: 'none' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input type="text" placeholder="Search job roles..." />
        </div>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <Loader2 className="spinner" />
          <span>Loading job roles...</span>
        </div>
      ) : (
        <div className="job-roles-grid">
          {jobRoles.map((role) => (
            <div key={role.id} className="job-role-card horizontal">
              <div className="card-left">
                <div className="card-icon">
                  <Briefcase size={20} />
                </div>
                <h3>{role.title}</h3>
              </div>
              <div className="card-actions-hover">
                <button className="action-btn edit" onClick={() => openEditModal(role)}>
                  <Edit2 size={16} />
                </button>
                <button className="action-btn delete" onClick={() => handleDelete(role.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {jobRoles.length === 0 && (
            <div className="empty-state">
              <Briefcase size={48} />
              <p>No job roles found. Add your first one!</p>
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRole ? "Edit Job Role" : "Create New Job Role"}
      >
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Job Role Name</label>
            <input 
              type="text" 
              placeholder="e.g. Mason, Welder, etc." 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required 
            />
          </div>
          <div className="form-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="spinner-small" size={16} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingRole ? "Update Role" : "Save Job Role"}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobRoles;
