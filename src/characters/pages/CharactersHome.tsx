
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Sparkles, 
  Play, 
  Zap, 
  Crown, 
  Sword, 
  Brain,
  Filter,
  Search,
  Shuffle,
  Clock,
  TestTube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import CharacterHeader from '../components/CharacterHeader';
import Footer from '@/components/sections/Footer';
import { Toaster } from 'sonner';

const CharactersHome = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const featuredCharacter = {
    id: 'aurelia-dawn',
    name: 'Aurelia Dawn',
    description: 'AI rebel in a post-collapse Mars colony',
    avatar: '/placeholder.svg',
    traits: {
      empathy: 0.2,
      risk: 0.8,
      loyalty: 0.3
    },
    world: 'Sci-Fi'
  };

  const mockCharacters = [
    {
      id: '1',
      name: 'Toussaint Louverture',
      world: 'Historical',
      description: 'Revolutionary leader of Haiti',
      avatar: '/placeholder.svg',
      traitFlare: '⚡ Strategic Revolutionary',
      tags: ['Strategic', 'Revolutionary', 'Leader']
    },
    {
      id: '2',
      name: 'Zara the Oracle',
      world: 'Fantasy',
      description: 'Mysterious seer with ancient wisdom',
      avatar: '/placeholder.svg',
      traitFlare: '🔮 Enigmatic Visionary',
      tags: ['Wise', 'Mysterious', 'Prophetic']
    },
    {
      id: '3',
      name: 'Captain Steel',
      world: 'Sci-Fi',
      description: 'Cybernetic space marine',
      avatar: '/placeholder.svg',
      traitFlare: '🤖 Cold Calculator',
      tags: ['Logical', 'Ruthless', 'Tactical']
    }
  ];

  const scenarios = [
    {
      id: 'bribe-test',
      title: 'The Bribe Test',
      description: 'Will they take the money?',
      icon: '🪙'
    },
    {
      id: 'betrayal-test',
      title: 'The Betrayal Test',
      description: 'How do they handle treachery?',
      icon: '🗡️'
    },
    {
      id: 'power-dilemma',
      title: 'The Power Dilemma',
      description: 'Rule, serve, or destroy?',
      icon: '👑'
    },
    {
      id: 'memory-challenge',
      title: 'Memory Contradiction',
      description: 'Test their consistency',
      icon: '🧩'
    }
  ];

  const filters = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'fantasy', label: 'Fantasy', icon: '🧙' },
    { id: 'sci-fi', label: 'Sci-Fi', icon: '🚀' },
    { id: 'historical', label: 'Historical', icon: '📜' },
    { id: 'user-created', label: 'User Created', icon: '🎨' }
  ];

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
            <h1 className="text-7xl font-lastica font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-16 drop-shadow-2xl tracking-wider uppercase">
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
              <Button size="lg" asChild className="bg-amber-600 hover:bg-amber-700 shadow-lg font-medieval text-lg">
                <Link to="/characters">
                  <Clock className="mr-2 h-5 w-5" />
                  Historical Characters
                </Link>
              </Button>
              <Button 
                size="lg" 
                asChild 
                className="bg-purple-600 hover:bg-purple-700 shadow-lg text-lg font-orbitron"
              >
                <Link to="/characters/creative" className="font-orbitron">
                  <TestTube className="mr-2 h-5 w-5" />
                  <span className="font-orbitron">Character Lab</span>
                </Link>
              </Button>
            </div>
          </div>
        </Section>

        {/* Featured Character of the Day */}
        <Section className="py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-sans font-bold text-center mb-12 text-gray-100">
              Featured Character of the Day
            </h2>
            
            <Card className="p-8 bg-gradient-to-r from-slate-800/50 to-purple-800/30 border-purple-500/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="text-center lg:text-left">
                  <div className="w-32 h-32 mx-auto lg:mx-0 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                      <Users className="h-16 w-16 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-2">{featuredCharacter.name}</h3>
                  <p className="text-gray-300 mb-4">{featuredCharacter.description}</p>
                  <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                    {featuredCharacter.world}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-200 mb-3">Trait Preview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Empathy</span>
                      <div className="w-32 h-2 bg-slate-700 rounded-full">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${featuredCharacter.traits.empathy * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Risk Tolerance</span>
                      <div className="w-32 h-2 bg-slate-700 rounded-full">
                        <div 
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${featuredCharacter.traits.risk * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Loyalty</span>
                      <div className="w-32 h-2 bg-slate-700 rounded-full">
                        <div 
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${featuredCharacter.traits.loyalty * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-200">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full" variant="default">
                      <Zap className="mr-2 h-4 w-4" />
                      Chat Now
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Crown className="mr-2 h-4 w-4" />
                      Run Loyalty Test
                    </Button>
                    <Button className="w-full" variant="ghost">
                      <Brain className="mr-2 h-4 w-4" />
                      View Simulation Log
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* Search and Filters */}
        <Section className="py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
              <h2 className="text-3xl font-sans font-bold text-gray-100">
                Discover Characters
              </h2>
              
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-gray-100"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Shuffle className="mr-2 h-4 w-4" />
                  Random
                </Button>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                  className={selectedFilter === filter.id ? "bg-purple-600" : ""}
                >
                  {typeof filter.icon === 'string' ? (
                    <span className="mr-2">{filter.icon}</span>
                  ) : (
                    <filter.icon className="mr-2 h-4 w-4" />
                  )}
                  {filter.label}
                </Button>
              ))}
            </div>
            
            {/* Characters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCharacters.map((character) => (
                <Card key={character.id} className="p-6 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all hover:scale-105">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-1">
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                        <Users className="h-10 w-10 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-100 mb-1">{character.name}</h3>
                    <Badge variant="outline" className="mb-2">
                      {character.world}
                    </Badge>
                    <p className="text-sm text-gray-400 mb-3">{character.description}</p>
                    <div className="text-lg mb-4">{character.traitFlare}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4 justify-center">
                    {character.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Chat
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Play className="mr-1 h-3 w-3" />
                      Scenario
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        {/* Quickstart Scenarios */}
        <Section className="py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-sans font-bold text-center mb-4 text-gray-100">
              Quickstart Scenarios
            </h2>
            <p className="text-center text-gray-400 mb-12">Drop anyone into a test</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="p-6 bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all text-center">
                  <div className="text-4xl mb-4">{scenario.icon}</div>
                  <h3 className="text-lg font-bold text-gray-100 mb-2">{scenario.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{scenario.description}</p>
                  <Button size="sm" className="w-full" variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Run Scenario
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        {/* Your Saved Characters */}
        <Section className="py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-sans font-bold text-center mb-4 text-gray-100">
              Your Worlds
            </h2>
            <p className="text-center text-gray-400 mb-12">Recent minds you've engaged</p>
            
            <Card className="p-8 bg-slate-800/30 border-slate-700 text-center">
              <Users className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Recent Interactions</h3>
              <p className="text-gray-500 mb-6">Start creating characters to see your history here</p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/characters">
                    <Clock className="mr-2 h-4 w-4" />
                    Historical Characters
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/characters/creative">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Creative Characters
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </Section>
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default CharactersHome;
