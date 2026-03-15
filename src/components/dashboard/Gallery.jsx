import React from 'react';
import { Sparkles, Download, ExternalLink, Clock, Trash2 } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
  const assets = [
    { id: 1, name: 'Cyberpunk Soldier', type: 'Character', date: '2 hours ago', status: 'Completed', thumb: '/assets/soldier.png' },
    { id: 2, name: 'Sci-Fi Corridor', type: 'Environment', date: 'Yesterday', status: 'Completed', thumb: '/assets/corridor.png' },
    { id: 3, name: 'Neon Dragon', type: 'Creature', date: 'Mar 12, 2024', status: 'Completed', thumb: '/assets/dragon.png' },
    { id: 4, name: 'Modular Crate', type: 'Prop', date: 'Mar 10, 2024', status: 'Completed', thumb: '/assets/crate.png' },
  ];

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <div className="header-title">
          <h1>My Creations</h1>
          <p>Access and manage all your AI-generated 3D assets.</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-value">14</span>
            <span className="stat-label">Total Assets</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">3</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </header>

      <div className="gallery-grid">
        {assets.map(asset => (
          <div key={asset.id} className="asset-card glass-panel">
            <div className="asset-thumb">
              <img src={asset.thumb} alt={asset.name} />
              <div className="asset-badge">{asset.type}</div>
              <div className="asset-overlay">
                <button className="icon-btn"><Download size={18} /></button>
                <button className="icon-btn"><ExternalLink size={18} /></button>
              </div>
            </div>
            <div className="asset-info">
              <div className="asset-main">
                <h3>{asset.name}</h3>
                <span className={`status-pill ${asset.status.toLowerCase().replace(' ', '-')}`}>
                  {asset.status}
                </span>
              </div>
              <div className="asset-meta">
                <span className="meta-item"><Clock size={12} /> {asset.date}</span>
                <button className="delete-btn"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="add-asset-card">
          <Sparkles size={32} />
          <span>New Generation</span>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
