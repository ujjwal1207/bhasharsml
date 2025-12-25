import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <div className="header-user">
            <span>Hey {user?.name} 👋</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="user-info-card">
          <h2>Your Profile</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span className={`badge badge-${user?.role}`}>
                {user?.role}
              </span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`badge badge-${user?.isApproved ? 'approved' : 'pending'}`}>
                {user?.isApproved ? 'Active' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="welcome-card">
          <h3>Welcome to BhashaCheck</h3>
          {user?.isApproved ? (
            <>
              <p>Your account is active and ready to go!</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/annotate')}
                style={{ marginTop: '1rem' }}
              >
                Start Annotating
              </button>
            </>
          ) : (
            <p>
              Your account is pending approval. Once approved by an administrator, 
              you'll be able to access the RSML annotation tool.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
