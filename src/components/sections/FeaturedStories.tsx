
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface FeaturedStory {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  author: string;
}

interface FeaturedStoriesProps {
  stories: FeaturedStory[];
  className?: string;
}

const FeaturedStories = ({ stories, className }: FeaturedStoriesProps) => {
  return (
    <div className={cn("w-full py-6", className)}>
      <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {stories.map((story) => (
            <CarouselItem key={story.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <AspectRatio ratio={16 / 9}>
                      {story.imageUrl ? (
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-primary/30 to-accent/40 rounded-t-lg" />
                      )}
                    </AspectRatio>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{story.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {story.description}
                    </p>
                    <p className="text-xs text-muted-foreground">By {story.author}</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default FeaturedStories;
