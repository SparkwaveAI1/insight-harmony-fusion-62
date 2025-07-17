
import React from 'react';
import Header from '../components/sections/Header';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Footer from '../components/sections/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
