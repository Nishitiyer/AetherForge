import React from 'react';
import { User, Mail, Shield, Bell, Key } from 'lucide-react';

const Settings = () => {
  return (
    <div className="dashboard-layout">
      {/* Reusing sidebar from Dashboard if possible, but let's just mock the content */}
      <div style={{padding: '3rem', width: '100%'}}>
        <h1 style={{fontSize: '2rem', marginBottom: '2rem'}}>Account Settings</h1>
        
        <div className="glass-panel" style={{maxWidth: '800px', padding: '2rem', borderRadius: '12px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <section>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                <User size={20} className="text-primary"/> Profile Information
              </h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue="Alex Chen" className="settings-input" style={{width: '100%', marginTop: '0.5rem'}} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" defaultValue="alex@example.com" className="settings-input" style={{width: '100%', marginTop: '0.5rem'}} />
                </div>
              </div>
            </section>

            <section>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                <Shield size={20} className="text-primary"/> Security
              </h3>
              <button className="btn-secondary" style={{padding: '0.5rem 1rem'}}>Change Password</button>
            </section>

            <section>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                <Bell size={20} className="text-primary"/> Notifications
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input type="checkbox" defaultChecked /> Email me about new features
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input type="checkbox" defaultChecked /> Email me about community mentions
                </label>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
