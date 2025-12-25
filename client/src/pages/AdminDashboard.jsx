import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUsers, approveUser, rejectUser, deleteUser } from '../services/authService';
import './Dashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [actionLoading, setActionLoading] = useState({});
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const statusParam = filter === 'all' ? '' : filter;
      const response = await getUsers(statusParam);
      
      if (response.success) {
        setUsers(response.data.users);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'An error occurred while fetching users'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: 'approving' });
    
    try {
      const response = await approveUser(userId);
      
      if (response.success) {
        // Update user in local state
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isApproved: true } : u
        ));
      } else {
        alert(response.message || 'Failed to approve user');
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 
        'An error occurred while approving user'
      );
    } finally {
      setActionLoading({ ...actionLoading, [userId]: null });
    }
  };

  const handleReject = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: 'rejecting' });
    
    try {
      const response = await rejectUser(userId);
      
      if (response.success) {
        // Update user in local state
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isApproved: false } : u
        ));
      } else {
        alert(response.message || 'Failed to reject user');
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 
        'An error occurred while rejecting user'
      );
    } finally {
      setActionLoading({ ...actionLoading, [userId]: null });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading({ ...actionLoading, [userId]: 'deleting' });
    
    try {
      const response = await deleteUser(userId);
      
      if (response.success) {
        // Remove user from local state
        setUsers(users.filter(u => u._id !== userId));
      } else {
        alert(response.message || 'Failed to delete user');
      }
    } catch (err) {
      alert(
        err.response?.data?.message || 
        'An error occurred while deleting user'
      );
    } finally {
      setActionLoading({ ...actionLoading, [userId]: null });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Panel</h1>
          <div className="header-user">
            <button 
              onClick={() => navigate('/annotate')} 
              className="btn btn-primary"
              style={{ marginRight: '1rem' }}
            >
              RSML Annotator
            </button>
            <span>Hey {user?.name} 👋</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
          </div>
          <button onClick={fetchUsers} className="btn btn-refresh">
            Refresh
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <div className="users-stats">
              <div className="stat-card">
                <h3>{users.length}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{users.filter(u => u.isApproved).length}</h3>
                <p>Active</p>
              </div>
              <div className="stat-card">
                <h3>{users.filter(u => !u.isApproved).length}</h3>
                <p>Waiting Approval</p>
              </div>
              <div className="stat-card">
                <h3>{users.filter(u => u.role === 'admin').length}</h3>
                <p>Admins</p>
              </div>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${u.isApproved ? 'approved' : 'pending'}`}>
                            {u.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td className="action-buttons">
                          {u._id !== user?._id && (
                            <>
                              {!u.isApproved ? (
                                <button
                                  onClick={() => handleApprove(u._id)}
                                  className="btn btn-sm btn-success"
                                  disabled={actionLoading[u._id]}
                                >
                                  {actionLoading[u._id] === 'approving' ? 'Approving...' : 'Approve'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReject(u._id)}
                                  className="btn btn-sm btn-warning"
                                  disabled={actionLoading[u._id]}
                                >
                                  {actionLoading[u._id] === 'rejecting' ? 'Rejecting...' : 'Revoke'}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(u._id)}
                                className="btn btn-sm btn-danger"
                                disabled={actionLoading[u._id]}
                              >
                                {actionLoading[u._id] === 'deleting' ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          )}
                          {u._id === user?._id && (
                            <span className="current-user-label">You</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
