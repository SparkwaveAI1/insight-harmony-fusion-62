
import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useFeaturedCharacterVideos } from '../hooks/useFeaturedCharacterVideos';

const FeaturedCharacters = () => {
  const { data: featuredVideos, isLoading, error } = useFeaturedCharacterVideos();
  const [videoStates, setVideoStates] = useState<{[key: string]: {isPlaying: boolean, isMuted: boolean}}>({});
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});

  const togglePlayPause = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    const currentState = videoStates[videoId] || { isPlaying: false, isMuted: true };
    
    if (currentState.isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.error('Play failed:', err));
    }
    
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...currentState, isPlaying: !currentState.isPlaying }
    }));
  };

  const toggleMute = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    const currentState = videoStates[videoId] || { isPlaying: false, isMuted: true };
    video.muted = !currentState.isMuted;
    
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...currentState, isMuted: !currentState.isMuted }
    }));
  };

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
                  <div className="aspect-[9/16] bg-gray-700 rounded-t-lg"></div>
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
          {videos.map((video) => {
            console.log('Rendering video:', video.name, 'URL:', video.video_url);
            const videoState = videoStates[video.id] || { isPlaying: false, isMuted: true };
            
            return (
              <Card key={video.id} className="bg-black/40 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[9/16] bg-gray-900 rounded-t-lg overflow-hidden">
                    <video 
                      ref={(el) => videoRefs.current[video.id] = el}
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted={videoState.isMuted}
                      loop
                      playsInline
                      crossOrigin="anonymous"
                      onLoadStart={() => console.log('Video load started for:', video.name)}
                      onLoadedData={() => console.log('Video loaded for:', video.name)}
                      onError={(e) => console.error('Video error for:', video.name, e)}
                      onPlay={() => setVideoStates(prev => ({
                        ...prev,
                        [video.id]: { ...videoState, isPlaying: true }
                      }))}
                      onPause={() => setVideoStates(prev => ({
                        ...prev,
                        [video.id]: { ...videoState, isPlaying: false }
                      }))}
                    />
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-black/70 hover:bg-black/90 text-white border-0"
                          onClick={() => togglePlayPause(video.id)}
                        >
                          {videoState.isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-black/70 hover:bg-black/90 text-white border-0"
                          onClick={() => toggleMute(video.id)}
                        >
                          {videoState.isMuted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Character type badge */}
                    <div className="absolute top-4 left-4 z-10">
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
                        <Link to={`/characters/${video.character_id}`}>
                          Explore Character
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-purple-400/50 text-purple-300 hover:bg-purple-600/20"
                        asChild
                      >
                        <Link to={`/characters/${video.character_id}/chat`}>
                          Chat Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
