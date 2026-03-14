import React from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/landing/Hero';
import FeatureGrid from '../components/landing/FeatureGrid';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <FeatureGrid />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Landing;
