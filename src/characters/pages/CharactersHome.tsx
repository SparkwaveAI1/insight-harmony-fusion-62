
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Play, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CharactersHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #9C92AC 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.1
        }}></div>
      </div>
      
      {/* Navigation Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white text-xl font-bold">PersonaAI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/characters-home')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-6"
            >
              Character Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/characters/create/historical')}
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              Create Historical
            </Button>
            <Button 
              onClick={() => navigate('/characters/create/creative')}
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              Create Fictional
            </Button>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
            CHARACTER
            <br />
            GENESIS
          </h1>
          
          {/* Subtitle */}
          <p className="text-white/90 text-xl md:text-2xl mb-4 font-light">
            Step into the minds of generals, poets, rebels, and androids.
          </p>
          
          {/* Description */}
          <div className="space-y-2 mb-12">
            <p className="text-white/80 text-lg">
              Build them. Chat with them. Challenge them.
            </p>
            <p className="text-white/70 text-base flex items-center justify-center">
              <span className="mr-2">🧬</span>
              Every character thinks, remembers, and evolves.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate('/characters/create/historical')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-medium min-w-[200px]"
            >
              <Users className="h-5 w-5 mr-2" />
              Create a Character
            </Button>
            
            <Button 
              onClick={() => navigate('/research')}
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-medium min-w-[200px]"
            >
              <Play className="h-5 w-5 mr-2" />
              Run a Scenario
            </Button>
            
            <Button 
              onClick={() => navigate('/characters')}
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10 px-8 py-4 text-lg font-medium min-w-[200px]"
            >
              <Library className="h-5 w-5 mr-2" />
              Browse All Characters
            </Button>
          </div>
        </div>
      </main>
      
      {/* Ambient Lighting Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default CharactersHome;
