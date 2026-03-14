import React from 'react';
import { CreditCard, History, Package, ShieldCheck } from 'lucide-react';

const Billing = () => {
  return (
    <div className="dashboard-layout">
      <div style={{padding: '3rem', width: '100%'}}>
        <h1 style={{fontSize: '2rem', marginBottom: '2rem'}}>Billing & Subscription</h1>
        
        <div className="glass-panel" style={{maxWidth: '800px', padding: '2rem', borderRadius: '12px', marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <p style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Current Plan</p>
              <h3 style={{fontSize: '1.5rem', marginTop: '0.25rem'}}>OmniPro Monthly</h3>
              <p style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>$29.00 / month • Renews on April 14, 2026</p>
            </div>
            <button className="btn-primary">Manage Plan</button>
          </div>
        </div>

        <div className="glass-panel" style={{maxWidth: '800px', padding: '2rem', borderRadius: '12px'}}>
          <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <CreditCard size={20} /> Payment Method
          </h3>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px'}}>
            <div style={{width: '40px', height: '24px', backgroundColor: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>VISA</div>
            <div>
              <p style={{fontSize: '0.875rem'}}>Visa ending in 4242</p>
              <p style={{fontSize: '0.75rem', color: 'var(--color-text-muted)'}}>Expires 12/28</p>
            </div>
            <button style={{marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-primary)'}}>Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
