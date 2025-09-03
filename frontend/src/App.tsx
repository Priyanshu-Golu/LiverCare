import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { PatientDashboard } from './components/dashboard/PatientDashboard';
import { ClinicianDashboard } from './components/dashboard/ClinicianDashboard';
import { Unauthorized } from './components/Unauthorized';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar />}
        
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={`/dashboard/${user?.role}`} replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to={`/dashboard/${user?.role}`} replace /> : <Register />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard/patient" 
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/clinician" 
            element={
              <ProtectedRoute roles={['clinician']}>
                <ClinicianDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Utility routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Default redirects */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to={`/dashboard/${user?.role}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Catch all - redirect to appropriate dashboard or login */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? (
                <Navigate to={`/dashboard/${user?.role}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;