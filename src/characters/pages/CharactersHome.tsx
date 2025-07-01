
import { Link } from 'react-router-dom';
import { 
  TestTube,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Section from '@/components/ui-custom/Section';
import CharacterHeader from '../components/CharacterHeader';
import FeaturedCharacters from '../components/FeaturedCharacters';
import Footer from '@/components/sections/Footer';
import { Toaster } from 'sonner';

const CharactersHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <CharacterHeader />
      
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
      </div>

      <main className="relative pt-20">
        {/* Hero Section with Background Image */}
        <Section className="text-center relative overflow-hidden min-h-screen flex items-start justify-center pt-24">
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/lovable-uploads/d628bc8b-42cb-48fc-b9c4-16c21cf80cfe.png')`
            }}
          >
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="text-7xl font-orbitron font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-16 drop-shadow-2xl tracking-wider uppercase">
              Character Genesis
            </h1>
            <p className="text-xl text-gray-100 mb-6 drop-shadow-lg">
              Step into the minds of generals, poets, rebels, and androids.
            </p>
            <p className="text-lg text-gray-200 mb-12 drop-shadow-lg">
              Build them. Chat with them. Challenge them.
              <br />
              🧬 Every character thinks, remembers, and evolves.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                asChild 
                className="bg-purple-600 hover:bg-purple-700 shadow-lg font-orbitron text-lg px-8 w-64"
              >
                <Link to="/characters/creative">
                  <TestTube className="mr-2 h-5 w-5" />
                  Character Lab
                </Link>
              </Button>
              <Button size="lg" asChild className="bg-amber-600 hover:bg-amber-700 shadow-lg font-medieval text-lg px-8 w-64">
                <Link to="/characters">
                  <Clock className="mr-2 h-5 w-5" />
                  Historical Characters
                </Link>
              </Button>
            </div>
          </div>
        </Section>

        {/* Featured Characters Section */}
        <FeaturedCharacters />
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default CharactersHome;
