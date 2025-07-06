
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Character } from "../types/characterTypes";
import CharacterTraits from "./CharacterTraits";
import CharacterMemories from "@/components/characters/CharacterMemories";

interface CharacterInfoSectionsProps {
  character: Character;
  isOwner: boolean;
}

const CharacterInfoSections = ({ character, isOwner }: CharacterInfoSectionsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="traits">Traits</TabsTrigger>
        <TabsTrigger value="memories">Memories</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {character.age && (
              <div>
                <strong>Age:</strong> {character.age}
              </div>
            )}
            {character.gender && (
              <div>
                <strong>Gender:</strong> {character.gender}
              </div>
            )}
            {character.historical_period && (
              <div>
                <strong>Historical Period:</strong> {character.historical_period}
              </div>
            )}
            {character.region && (
              <div>
                <strong>Region:</strong> {character.region}
              </div>
            )}
            {character.social_class && (
              <div>
                <strong>Social Class:</strong> {character.social_class}
              </div>
            )}
          </CardContent>
        </Card>

        {character.metadata && Object.keys(character.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Background</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(character.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="traits" className="space-y-6">
        <CharacterTraits character={character} />
      </TabsContent>

      <TabsContent value="memories" className="space-y-6">
        <CharacterMemories 
          characterId={character.character_id} 
          isOwner={isOwner} 
        />
      </TabsContent>
      
      <TabsContent value="details" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Character ID:</strong> {character.character_id}
            </div>
            <div>
              <strong>Character Type:</strong> {character.character_type}
            </div>
            <div>
              <strong>Creation Date:</strong> {character.creation_date}
            </div>
            <div>
              <strong>Creation Source:</strong> {character.creation_source}
            </div>
            {character.enhanced_metadata_version && (
              <div>
                <strong>Metadata Version:</strong> {character.enhanced_metadata_version}
              </div>
            )}
          </CardContent>
        </Card>

        {character.emotional_triggers && (
          <Card>
            <CardHeader>
              <CardTitle>Emotional Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {character.emotional_triggers.positive_triggers && 
                 character.emotional_triggers.positive_triggers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Positive Triggers</h4>
                    <div className="flex flex-wrap gap-2">
                      {character.emotional_triggers.positive_triggers.map((trigger, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {character.emotional_triggers.negative_triggers && 
                 character.emotional_triggers.negative_triggers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Negative Triggers</h4>
                    <div className="flex flex-wrap gap-2">
                      {character.emotional_triggers.negative_triggers.map((trigger, index) => (
                        <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CharacterInfoSections;
