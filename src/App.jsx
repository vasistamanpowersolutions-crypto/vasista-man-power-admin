import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateDetails from './pages/CandidateDetails';
import AddCandidate from './pages/AddCandidate';
import Clients from './pages/BusinessOwners';
import AddBusinessOwner from './pages/AddBusinessOwner';
import BusinessOwnerDetails from './pages/BusinessOwnerDetails';
import Login from './pages/Login';
import { initSecurity } from './utils/security';
import './App.css';

function App() {
  React.useEffect(() => {
    initSecurity();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/candidates" element={<Candidates />} />
                    <Route path="/candidates/add" element={<AddCandidate />} />
                    <Route path="/candidates/:id" element={<CandidateDetails />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/clients/add" element={<AddBusinessOwner />} />
                    <Route path="/clients/:id" element={<BusinessOwnerDetails />} />
                    
                    {/* Placeholder for other routes */}
                    <Route path="/jobs" element={<div className="page-placeholder"><h2>Jobs Management</h2><p>Coming Soon...</p></div>} />
                    <Route path="/employees" element={<div className="page-placeholder"><h2>Employees Management</h2><p>Coming Soon...</p></div>} />
                    <Route path="/assignments" element={<div className="page-placeholder"><h2>Assignments Management</h2><p>Coming Soon...</p></div>} />
                    <Route path="/attendance" element={<div className="page-placeholder"><h2>Attendance Tracking</h2><p>Coming Soon...</p></div>} />
                    <Route path="/payroll" element={<div className="page-placeholder"><h2>Payroll Processing</h2><p>Coming Soon...</p></div>} />
                    <Route path="/invoices" element={<div className="page-placeholder"><h2>Invoices & Billing</h2><p>Coming Soon...</p></div>} />
                    <Route path="/reports" element={<div className="page-placeholder"><h2>Analytical Reports</h2><p>Coming Soon...</p></div>} />
                    <Route path="/users" element={<div className="page-placeholder"><h2>Internal Users</h2><p>Coming Soon...</p></div>} />
                    <Route path="/settings" element={<div className="page-placeholder"><h2>System Settings</h2><p>Coming Soon...</p></div>} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
