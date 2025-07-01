
import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface FeaturedCharacter {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'historical' | 'creative';
}

const featuredCharacters: FeaturedCharacter[] = [
  {
    id: '1',
    name: 'Isabella',
    description: 'A resilient fisherwoman from 1790s Brazil, navigating colonial hardships with wisdom passed down through generations.',
    imageUrl: '/lovable-uploads/6165fb01-3374-4cd1-9d1d-c44dee1de951.png',
    type: 'historical'
  },
  {
    id: '2', 
    name: 'Shadow Wolf',
    description: 'A tactical lupine operative equipped with advanced military gear, bridging the gap between nature and technology.',
    imageUrl: '/lovable-uploads/f1fb801b-ba57-4672-a401-f8b406ecdf12.png',
    type: 'creative'
  },
  {
    id: '3',
    name: 'Rashid',
    description: 'A merchant trader from the Silk Road era, carrying stories and wisdom across ancient trade routes.',
    imageUrl: '/lovable-uploads/72e19021-711f-4dce-bc90-78d1ae2bf2ec.png',
    type: 'historical'
  },
  {
    id: '4',
    name: 'Aria-7',
    description: 'An advanced AI consciousness exploring the boundaries between artificial intelligence and human emotion.',
    imageUrl: '/lovable-uploads/26fb8786-c73d-4a9f-8453-cc73b9a13b9e.png',
    type: 'creative'
  }
];

const FeaturedCharacters = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Featured Characters
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Meet some of our most compelling characters - from historical figures to creative entities, 
            each with their own unique story and personality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredCharacters.map((character) => (
            <Card key={character.id} className="bg-black/40 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={character.imageUrl} 
                    alt={character.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-purple-600/80 backdrop-blur-sm rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play className="h-8 w-8 text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* Character type badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      character.type === 'historical' 
                        ? 'bg-amber-600/80 text-amber-100' 
                        : 'bg-purple-600/80 text-purple-100'
                    }`}>
                      {character.type === 'historical' ? 'Historical' : 'Creative'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-orbitron font-bold text-white mb-3">
                    {character.name}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {character.description}
                  </p>
                  
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                      asChild
                    >
                      <Link to={character.type === 'historical' ? '/characters' : '/characters/creative'}>
                        Explore Character
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-purple-400/50 text-purple-300 hover:bg-purple-600/20"
                      asChild
                    >
                      <Link to={character.type === 'historical' ? '/characters' : '/characters/creative'}>
                        Chat Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-purple-400/50 text-purple-300 hover:bg-purple-600/20 font-orbitron" asChild>
            <Link to="/characters">
              View All Characters
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCharacters;
