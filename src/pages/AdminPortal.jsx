import React from 'react';
import { Database, Users, Settings, Activity, ShieldAlert } from 'lucide-react';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/landing/Footer.jsx';

const AdminPortal = () => {
  return (
    <div className="admin-portal-page dark-workspace h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 p-10 grid grid-cols-12 gap-6">
        <aside className="col-span-3 glass-panel p-6 flex flex-col gap-2">
          <div className="text-cyan-500 text-[10px] font-bold mb-4 flex items-center gap-2">
            <ShieldAlert size={12} /> SYSTEM_STATUS: STABLE
          </div>
          <button className="admin-nav-item active"><Database size={16}/> User Management</button>
          <button className="admin-nav-item"><Users size={16}/> Feature Gating</button>
          <button className="admin-nav-item"><Activity size={16}/> Traffic Analytics</button>
          <button className="admin-nav-item"><Settings size={16}/> Global Settings</button>
        </aside>

        <main className="col-span-9 flex flex-col gap-6">
          <header className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-white">ADMIN_CONTROL_CENTER</h1>
            <div className="flex gap-4">
              <div className="stat-pill">CPU: 14%</div>
              <div className="stat-pill">MEM: 2.1GB</div>
            </div>
          </header>

          <div className="grid grid-cols-3 gap-6">
            <div className="stat-card glass-panel p-6">
              <label>TOTAL_USERS</label>
              <h3>1,402</h3>
            </div>
            <div className="stat-card glass-panel p-6">
              <label>PRO_CONVERSIONS</label>
              <h3>28%</h3>
            </div>
            <div className="stat-card glass-panel p-6">
              <label>DAILY_RHYTHM</label>
              <h3>High</h3>
            </div>
          </div>

          <div className="table-container glass-panel flex-1 p-6 overflow-hidden">
            <h4 className="mb-4 text-slate-500 font-mono text-xs">ACTIVE_SESSIONS_LOG</h4>
            <table className="w-full text-left text-sm text-slate-400">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-4">USER_ID</th>
                  <th className="pb-4">TIER</th>
                  <th className="pb-4">STATUS</th>
                  <th className="pb-4">LATENCY</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} className="border-b border-slate-900/50">
                    <td className="py-4 font-mono">user_77{i}x_f</td>
                    <td><span className="badge-pro">PRO</span></td>
                    <td><span className="text-green-500">ACTIVE</span></td>
                    <td>24ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <Footer />
      
      <style>{`
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          color: #64748b;
          font-weight: 600;
          transition: 0.2s;
        }
        .admin-nav-item.active {
          background: rgba(0, 212, 255, 0.1);
          color: #00d4ff;
        }
        .stat-pill {
          background: #111;
          border: 1px solid #333;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          color: #777;
          font-family: 'JetBrains Mono', monospace;
        }
        .stat-card label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #555;
          display: block;
          margin-bottom: 8px;
        }
        .stat-card h3 {
          font-size: 24px;
          font-weight: 900;
          color: #fff;
        }
        .badge-pro {
          background: #00d4ff22;
          color: #00d4ff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default AdminPortal;
