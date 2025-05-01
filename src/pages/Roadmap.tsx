
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import RoadmapSection from '@/components/prsna/RoadmapSection';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Roadmap = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <Section className="bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="container px-4 mx-auto py-12">
            <div className="mb-10">
              <Link to="/prsna">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to $PRSNA
                </Button>
              </Link>
            </div>
            
            <div className="mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">$PRSNA Roadmap</h1>
              <p className="text-xl text-gray-300">
                Our development plan and milestones for the PersonaAI ecosystem.
              </p>
            </div>
            
            <RoadmapSection />
          </div>
        </Section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Roadmap;
