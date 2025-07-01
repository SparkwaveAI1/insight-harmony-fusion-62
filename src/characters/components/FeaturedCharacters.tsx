
import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useFeaturedCharacterVideos } from '../hooks/useFeaturedCharacterVideos';

const FeaturedCharacters = () => {
  const { data: featuredVideos, isLoading, error } = useFeaturedCharacterVideos();

  if (isLoading) {
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
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="bg-black/40 border-purple-500/30 animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-700 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-700 rounded mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                    <div className="flex gap-3">
                      <div className="h-8 bg-gray-700 rounded w-32"></div>
                      <div className="h-8 bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-5xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Featured Characters
            </h2>
            <p className="text-red-400">Unable to load featured characters at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  const videos = featuredVideos || [];

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
          {videos.map((video) => (
            <Card key={video.id} className="bg-black/40 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <video 
                      src={video.video_url}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      preload="metadata"
                    />
                  )}
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
                      video.character_type === 'historical' 
                        ? 'bg-amber-600/80 text-amber-100' 
                        : 'bg-purple-600/80 text-purple-100'
                    }`}>
                      {video.character_type === 'historical' ? 'Historical' : 'Creative'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-orbitron font-bold text-white mb-3">
                    {video.name}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {video.description}
                  </p>
                  
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                      asChild
                    >
                      <Link to={video.character_type === 'historical' ? '/characters' : '/characters/creative'}>
                        Explore Character
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-purple-400/50 text-purple-300 hover:bg-purple-600/20"
                      asChild
                    >
                      <Link to={video.character_type === 'historical' ? '/characters' : '/characters/creative'}>
                        Chat Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {videos.length > 0 && (
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-purple-400/50 text-purple-300 hover:bg-purple-600/20 font-orbitron" asChild>
              <Link to="/characters">
                View All Characters
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCharacters;
