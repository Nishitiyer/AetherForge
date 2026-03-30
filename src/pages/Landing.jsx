import React from 'react';
import Navbar from '../components/common/Navbar.jsx';
import Hero from '../components/landing/Hero.jsx';
import FeatureGrid from '../components/landing/FeatureGrid.jsx';
import Workflows from '../components/landing/Workflows.jsx';
import Pricing from '../components/landing/Pricing.jsx';
import Footer from '../components/landing/Footer.jsx';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      {/* <FeatureGrid />
      <Workflows />
      <Pricing />
      <Footer /> */}
    </div>
  );
};

export default Landing;
