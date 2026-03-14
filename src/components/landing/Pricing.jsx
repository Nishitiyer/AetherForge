import React from 'react';
import { Check } from 'lucide-react';
import './Pricing.css';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring AI 3D generation.',
    features: [
      '100 Generations / month',
      'Standard resolution models',
      'Basic materials & textures',
      'GLTF & OBJ Export',
      'Community support'
    ],
    buttonText: 'Start Free',
    isPopular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For independent creators and freelancers.',
    features: [
      'Unlimited Generations',
      'High-res 4K textures',
      'Auto-rigging & animation generation',
      'FBX, USD, & Native Exports',
      'Commercial usage rights',
      'Priority queue access'
    ],
    buttonText: 'Get Pro',
    isPopular: true
  },
  {
    name: 'Studio',
    price: '$99',
    period: '/seat/mo',
    description: 'For professional teams and studios.',
    features: [
      'Everything in Pro',
      'Team collaboration workspace',
      'Custom LoRA training',
      'API access (10k req/mo)',
      'Enterprise SSO',
      'Dedicated account manager'
    ],
    buttonText: 'Contact Sales',
    isPopular: false
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2 className="section-title">Sensible Pricing for Every Creator</h2>
          <p className="section-subtitle">Start for free, upgrade when you need production power.</p>
        </div>
        
        <div className="pricing-grid">
          {tiers.map((tier, index) => (
            <div key={index} className={`pricing-card glass-panel ${tier.isPopular ? 'popular' : ''}`}>
              {tier.isPopular && <div className="popular-badge">Most Popular</div>}
              <h3 className="tier-name">{tier.name}</h3>
              <div className="tier-price-wrapper">
                <span className="tier-price">{tier.price}</span>
                {tier.period && <span className="tier-period">{tier.period}</span>}
              </div>
              <p className="tier-description">{tier.description}</p>
              
              <ul className="tier-features">
                {tier.features.map((feature, i) => (
                  <li key={i}>
                    <Check size={18} className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`btn-primary pricing-btn ${!tier.isPopular ? 'btn-secondary' : ''}`}>
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
