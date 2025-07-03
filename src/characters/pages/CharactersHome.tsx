
import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Users, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CharacterHeader from '../components/CharacterHeader';
import FeaturedCharacters from '../components/FeaturedCharacters';
import { useAuth } from '@/context/AuthContext';

const CharactersHome = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CharacterHeader />
      
      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-orbitron">
              Character Universe
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create, explore, and interact with AI-powered characters. From historical figures to creative personas, 
              bring your imagination to life with advanced character generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <>
                  <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                    <Link to="/characters/creative" className="flex items-center gap-2">
                      <FlaskConical className="h-5 w-5" />
                      Enter Character Lab
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-slate-900">
                    <Link to="/characters" className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Historical Characters
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 mb-4">
                    <Link to="/auth" className="flex items-center gap-2">
                      Sign In to Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-gray-400">Sign in to create and manage your own characters</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Character Lab */}
              <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-8 w-8 text-purple-400" />
                    <div>
                      <CardTitle className="text-white text-xl">Character Lab</CardTitle>
                      <CardDescription className="text-gray-300">
                        Creative character generation and customization
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p className="mb-4">
                    Unleash your creativity with our advanced Character Lab. Create unique, 
                    AI-powered personas with detailed trait profiles, behavioral patterns, and rich backstories.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Advanced trait architecture
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Custom personality profiles
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      AI-generated images
                    </li>
                  </ul>
                  {user ? (
                    <Button asChild className="w-full">
                      <Link to="/characters/creative">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Character
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth">Sign In to Create</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Historical Characters */}
              <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-400" />
                    <div>
                      <CardTitle className="text-white text-xl">Historical Characters</CardTitle>
                      <CardDescription className="text-gray-300">
                        Historically accurate character profiles
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p className="mb-4">
                    Explore meticulously researched historical figures with accurate biographical 
                    information, cultural context, and period-appropriate characteristics.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      Research-backed profiles
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      Cultural authenticity
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      Historical accuracy
                    </li>
                  </ul>
                  {user ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/characters">
                        <Users className="h-4 w-4 mr-2" />
                        Browse Characters
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth">Sign In to Access</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Characters */}
        <FeaturedCharacters />
      </main>
    </div>
  );
};

export default CharactersHome;
