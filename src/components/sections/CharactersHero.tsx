
import { Link } from 'react-router-dom';
import { 
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Section from '@/components/ui-custom/Section';

const CharactersHero = () => {
  return (
    <Section className="text-center relative overflow-hidden min-h-screen flex items-start justify-center pt-24 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
      </div>

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
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 className="text-7xl font-lastica font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl tracking-wider uppercase">
            Character Genesis
          </h1>
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-3 py-1 text-sm animate-pulse">
            NEW!
          </Badge>
        </div>
        <p className="text-xl text-gray-100 mb-6 drop-shadow-lg">
          Step into the minds of generals, poets, rebels, and androids.
        </p>
        <p className="text-lg text-gray-200 mb-12 drop-shadow-lg">
          Build them. Chat with them. Challenge them.
          <br />
          🧬 Every character thinks, remembers, and evolves.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" asChild className="bg-amber-600 hover:bg-amber-700 shadow-lg">
            <Link to="/characters">
              <Clock className="mr-2 h-5 w-5" />
              Historical Characters
            </Link>
          </Button>
          <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700 shadow-lg">
            <Link to="/characters/creative">
              <Sparkles className="mr-2 h-5 w-5" />
              Creative Characters
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
};

export default CharactersHero;
