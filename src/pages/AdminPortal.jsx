import React, { useState, useEffect } from 'react';
import { Shield, Lock, Users, Mail, Clock, ChevronRight } from 'lucide-react';
import './AdminPortal.css';

const AdminPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    verifyAdmin();
  };

  const verifyAdmin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Incorrect admin password or server error');
      }
    } catch (err) {
      setError('Could not connect to admin server');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      verifyAdmin();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="auth-container glass-panel">
          <div className="auth-header">
            <Shield size={40} className="text-primary" style={{marginBottom: '1rem'}} />
            <h2>AetherForge Admin</h2>
            <p>Enter the master password to access user records.</p>
          </div>
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn-primary auth-submit">Verify Identity</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand">
            <Shield size={24} className="text-primary" />
            <h1>Admin Control Center</h1>
          </div>
          <div className="admin-stats">
            <div className="stat-item">
              <strong>{users.length}</strong>
              <span>Total Users</span>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="glass-panel admin-table-container">
          <div className="table-header">
            <h3>Registered Users</h3>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th><Mail size={16}/> User Email</th>
                <th><Clock size={16}/> Joined</th>
                <th><Users size={16}/> Profile Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i}>
                  <td className="email-cell">{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.profile ? (
                      <span className="badge badge-success">Onboarded</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-details">
                      View Info <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No users registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminPortal;
