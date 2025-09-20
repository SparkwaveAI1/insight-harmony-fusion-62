import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Plus, FileText, BarChart3, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { V4Persona } from '@/types/persona-v4';
import { getV4PersonaById } from '@/services/v4-persona';
import { getPersonaAge, getPersonaLocation, getPersonaBackgroundDescription, getPersonaDisplayName } from '@/utils/personaDisplayUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PersonaCollection {
  collection_id: string;
  name: string;
}

export default function PersonaProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<V4Persona | null>(null);
  const [collections, setCollections] = useState<PersonaCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPersona(id);
    }
  }, [id]);

  const loadPersona = async (personaId: string) => {
    try {
      setIsLoading(true);
      const personaData = await getV4PersonaById(personaId);
      
      if (!personaData) {
        toast.error('Persona not found');
        navigate('/persona-library');
        return;
      }

      setPersona(personaData);
      await loadCollections(personaId);
    } catch (error) {
      console.error('Error loading persona:', error);
      toast.error('Failed to load persona');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async (personaId: string) => {
    try {
      const { data, error } = await supabase
        .from('collection_personas')
        .select(`
          collection_id,
          collections!inner(name)
        `)
        .eq('persona_id', personaId);

      if (error) throw error;

      const collectionData = data?.map(item => ({
        collection_id: item.collection_id,
        name: (item.collections as any).name
      })) || [];

      setCollections(collectionData);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const generateDescription = (persona: V4Persona): string => {
    // V4 personas don't have a description field, generate from other data
    
    // Generate from attitude_narrative + current_focus
    const attitude = persona.full_profile?.attitude_narrative || '';
    const focus = persona.full_profile?.prompt_shaping?.current_focus || '';
    
    if (attitude && focus) {
      return `${attitude.slice(0, 200)}... Currently focused on: ${focus}`;
    }
    
    if (attitude) {
      return attitude.slice(0, 400);
    }
    
    return 'No description available.';
  };

  const generateBackground = (persona: V4Persona): string => {
    // Generate background from attitude_narrative + life details
    const attitude = persona.full_profile?.attitude_narrative || '';
    const identity = persona.full_profile?.identity;
    const relationships = persona.full_profile?.relationships;
    const money = persona.full_profile?.money_profile;
    
    let background = '';
    
    if (attitude) {
      background = attitude;
    }
    
    // Add formative life details if available
    if (identity?.occupation) {
      background += ` Their career as a ${identity.occupation} has shaped their worldview.`;
    }
    
    if (relationships?.household?.status) {
      background += ` Their ${relationships.household.status} has influenced their life priorities.`;
    }
    
    if (money?.attitude_toward_money) {
      background += ` Their relationship with money reflects ${money.attitude_toward_money}.`;
    }
    
    return background.slice(0, 900);
  };

  const getCharacterCount = (text: string, limit: number) => {
    const count = text.length;
    const percentage = (count / limit) * 100;
    
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Persona Not Found</h1>
          <Button onClick={() => navigate('/persona-library')}>
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  const displayName = getPersonaDisplayName(persona);
  const age = getPersonaAge(persona);
  const location = getPersonaLocation(persona);
  const description = generateDescription(persona);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/persona-library')}
            className="gap-2 p-0 h-auto text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Library
          </Button>
          <span>/</span>
          <span className="text-foreground font-medium">{displayName}</span>
        </div>

        {/* Identity Header - Always Visible */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar/Photo */}
            <div className="flex-shrink-0">
              {persona.profile_image_url ? (
                <img 
                  src={persona.profile_image_url} 
                  alt={`${displayName} profile`}
                  className="w-32 h-32 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center border">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Name + Description */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                {age && (
                  <div className="text-lg text-muted-foreground mb-2">
                    {age} years old {location && `• ${location}`}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Description</span>
                    <span className={`text-xs ${getCharacterCount(description, 400)}`}>
                      {description.length}/400 characters
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              {/* Collection Badges */}
              {collections.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => (
                    <Badge 
                      key={collection.collection_id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => navigate(`/collection/${collection.collection_id}`)}
                    >
                      {collection.name}
                    </Badge>
                  ))}
                </div>
              )}

              {collections.length === 0 && (
                <Badge variant="outline">No collections</Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
              <Button variant="outline" size="sm" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add to Study
              </Button>
              <Button variant="outline" size="sm" disabled>
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare
              </Button>
              <Button variant="outline" size="sm" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          <CollapsibleSection title="Background & Demographics" defaultOpen>
            <div className="space-y-6">
              {/* Background Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Background</h4>
                  <span className={`text-xs ${getCharacterCount(generateBackground(persona), 900)}`}>
                    {generateBackground(persona).length}/900 characters
                  </span>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {generateBackground(persona) || 'No background information available.'}
                  </p>
                </div>
              </div>

              {/* Demographics Grid */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Demographics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Age:</span>
                      <span className="text-sm">
                        {age || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Gender:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.gender || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Pronouns:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.pronouns || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Ethnicity:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.ethnicity || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Nationality:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.nationality || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Location:</span>
                      <span className="text-sm">
                        {location || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Education Level:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.education_level || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Occupation:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.occupation || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Income Bracket:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.income_bracket || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Relationship Status:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.relationship_status || <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Dependents:</span>
                      <span className="text-sm">
                        {persona.full_profile?.identity?.dependents !== undefined 
                          ? persona.full_profile.identity.dependents 
                          : <span className="text-muted-foreground">Not specified</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Daily Life Snapshot">
            <div className="text-muted-foreground">
              Content coming soon...
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Home Life & Relationships">
            <div className="text-muted-foreground">
              Content coming soon...
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Money & Health">
            <div className="text-muted-foreground">
              Content coming soon...
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Traits Dashboard">
            <div className="text-muted-foreground">
              Content coming soon...
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Public Issues & Attitudes">
            <div className="text-muted-foreground">
              Content coming soon...
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}