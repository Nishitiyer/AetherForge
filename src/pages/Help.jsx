import React from 'react';
import { BookOpen, Search, MessageSquare, CirclePlay } from 'lucide-react';

const Help = () => {
  return (
    <div className="dashboard-layout">
      <div style={{padding: '3rem', width: '100%', overflowY: 'auto'}}>
        <div style={{textAlign: 'center', marginBottom: '4rem'}}>
          <h1 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>How can we help?</h1>
          <div className="input-with-icon" style={{maxWidth: '600px', margin: '0 auto'}}>
            <Search className="input-icon" />
            <input type="text" placeholder="Search documentation, tutorials, and more..." className="settings-input" style={{width: '100%', borderRadius: '100px', padding: '1rem 3rem'}} />
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto'}}>
          <div className="glass-panel" style={{padding: '2rem', borderRadius: '12px', textAlign: 'center'}}>
            <BookOpen size={40} className="text-primary" style={{margin: '0 auto 1.5rem'}} />
            <h3>Documentation</h3>
            <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem'}}>Deep dive into every tool, node, and AI capability.</p>
          </div>
          <div className="glass-panel" style={{padding: '2rem', borderRadius: '12px', textAlign: 'center'}}>
            <CirclePlay size={40} className="text-accent" style={{margin: '0 auto 1.5rem'}} />
            <h3>Video Tutorials</h3>
            <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem'}}>Learn from pros with our step-by-step masterclasses.</p>
          </div>
          <div className="glass-panel" style={{padding: '2rem', borderRadius: '12px', textAlign: 'center'}}>
            <MessageSquare size={40} style={{margin: '0 auto 1.5rem', color: '#10b981'}} />
            <h3>Community</h3>
            <p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem'}}>Join the Discord to share assets and get help.</p>
          </div>
        </div>

        <div style={{marginTop: '4rem', maxWidth: '1000px', margin: '4rem auto 0'}}>
          <h2 style={{marginBottom: '1.5rem'}}>Popular Articles</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>Getting started with Character AI Generation</span>
                <span style={{color: 'var(--color-primary)', fontSize: '0.875rem'}}>Read more</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
