import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false, requireApproval = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // Check if user needs to be approved and isn't an admin
  if (requireApproval && user.role !== 'admin' && !user.isApproved) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h2>Access Pending</h2>
        <p>Your account is waiting for admin approval to access this feature.</p>
        <a href="/dashboard" style={{ marginTop: '1rem' }}>Go to Dashboard</a>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
