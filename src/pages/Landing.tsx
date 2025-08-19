import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold">PersonaAI</h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Qualitative Research Platform
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/persona-viewer')}>
              View Personas
            </Button>
            <Button variant="outline" onClick={() => navigate('/collections')}>
              Collections
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;