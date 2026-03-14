import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Hexagon, Image as ImageIcon, Video, FolderOpen, Box, User, Settings, Clock, Sparkles, LayoutDashboard, HelpCircle, CreditCard } from 'lucide-react';
import './Dashboard.css';

const recentProjects = [
  { id: 1, name: 'Cyberpunk Soldier Model', type: 'Character', updated: '2 hours ago', icon: <User size={20} /> },
  { id: 2, name: 'Sci-Fi Corridor Scene', type: 'Environment', updated: 'Yesterday', icon: <ImageIcon size={20} /> },
  { id: 3, name: 'Robot Walk Cycle', type: 'Animation', updated: '3 days ago', icon: <Video size={20} /> },
  { id: 4, name: 'Rusty Metal Material', type: 'Material', updated: 'Last week', icon: <Hexagon size={20} /> },
];

const templates = [
  { name: 'Vehicle Concept', type: 'Asset', description: 'Start with a standard 4-wheel base.' },
  { name: 'Bipedal Creature', type: 'Character', description: 'Standard humanoid rig setup.' },
  { name: 'Studio Realism', type: 'Lighting', description: '3-point light setup with soft shadows.' },
  { name: 'Fantasy Tavern', type: 'Environment', description: 'Indoor scene blockout with warm lighting.' }
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handlePrompt = (e) => {
    e.preventDefault();
    navigate('/editor');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar glass-panel">
        <Link to="/" className="navbar-brand dash-brand">
          <Box className="brand-icon text-gradient" size={24} />
          <span className="brand-name">OmniForm</span>
        </Link>
        
        <nav className="dash-nav">
          <Link to="/dashboard" className="dash-nav-item active">
            <LayoutDashboard size={18} /> Projects
          </Link>
          <a href="#" className="dash-nav-item">
            <FolderOpen size={18} /> Library
          </a>
          <Link to="/billing" className="dash-nav-item">
            <CreditCard size={18} /> Billing
          </Link>
          <Link to="/help" className="dash-nav-item">
            <HelpCircle size={18} /> Help & Docs
          </Link>
          <Link to="/settings" className="dash-nav-item mt-auto">
            <Settings size={18} /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        {/* Top Header */}
        <header className="dash-header">
          <div className="dash-search input-with-icon">
            <Search size={18} className="input-icon" />
            <input type="text" placeholder="Search projects and assets..." />
          </div>
          
          <div className="dash-user-actions">
            <Link to="/billing" className="dash-credits">
              <Sparkles size={16} className="text-gradient" />
              <span>950 Credits</span>
            </Link>
            <Link to="/settings" className="dash-avatar">AC</Link>
          </div>
        </header>

        <div className="dash-content">
          <div className="dash-creation-hero glass-panel">
            <div className="dash-hero-text">
              <h2>What will you build today?</h2>
              <p>Type a prompt or choose a start point below.</p>
            </div>
            
            <form className="dash-prompt-form" onSubmit={handlePrompt}>
              <div className="dash-prompt-wrapper">
                <Sparkles size={20} className="prompt-icon hidden-mobile" />
                <input 
                  type="text" 
                  placeholder="e.g., A low poly ancient ruins diorama with mysterious glowing ruins..." 
                  className="dash-prompt-input"
                  required
                />
                <button type="submit" className="btn-primary prompt-generate-btn">
                  Generate
                </button>
              </div>
            </form>
            
            <div className="prompt-chips">
              <button className="chip">Cyberpunk Alleyway <span className="chip-tag text-accent">Scene</span></button>
              <button className="chip">Sci-fi Heavy Armor <span className="chip-tag text-primary">Character</span></button>
              <button className="chip">Mossy Stone <span className="chip-tag text-purple">Material</span></button>
            </div>
          </div>

          <div className="dash-section">
            <div className="dash-section-header">
              <h3>Recent Projects</h3>
              <button className="btn-secondary btn-sm">View All</button>
            </div>
            
            <div className="projects-grid">
              <div 
                className="project-card create-new" 
                onClick={() => navigate('/editor')}
              >
                <div className="create-icon-wrapper">
                  <Plus size={32} />
                </div>
                <h4>New Manual Project</h4>
                <p>Start from scratch with the editor</p>
              </div>
              
              {recentProjects.map(proj => (
                <div key={proj.id} className="project-card glass-panel" onClick={() => navigate('/editor')}>
                  <div className="project-thumbnail">
                    {proj.icon}
                  </div>
                  <div className="project-info">
                    <h4>{proj.name}</h4>
                    <div className="project-meta">
                      <span className="project-type">{proj.type}</span>
                      <span className="project-date"><Clock size={12} /> {proj.updated}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-section">
            <div className="dash-section-header">
              <h3>Starter Templates</h3>
            </div>
            
            <div className="templates-grid">
              {templates.map((tpl, i) => (
                <div key={i} className="template-card" onClick={() => navigate('/editor')}>
                  <div className="template-header">
                    <h4>{tpl.name}</h4>
                    <span className="template-badge">{tpl.type}</span>
                  </div>
                  <p>{tpl.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
