import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CollectionsMultiSelector } from '@/components/collections/CollectionsMultiSelector';
import { generatePersonaImage } from '@/services/persona';
import { supabase } from '@/integrations/supabase/client';

interface PersonaSchema {
  identity: {
    name: string;
    age: number;
    gender: string;
    pronouns: string;
    ethnicity: string;
    nationality: string;
    occupation: string;
    relationship_status: string;
    dependents: number;
    education_level: string;
    income_bracket: string;
    location: {
      city: string;
      region: string;
      country: string;
      urbanicity: string;
    };
  };
  daily_life: {
    primary_activities: Record<string, number>;
    schedule_blocks: Array<{
      start: string;
      end: string;
      activity: string;
      setting: string;
    }>;
    time_sentiment: Record<string, string>;
    screen_time_summary: string;
    mental_preoccupations: string[];
  };
  health_profile: {
    bmi_category: string;
    chronic_conditions: string[];
    mental_health_flags: string[];
    medications: string[];
    adherence_level: string;
    sleep_hours: number;
    substance_use: Record<string, string>;
    fitness_level: string;
    diet_pattern: string;
  };
  relationships: {
    household: {
      status: string;
      harmony_level: string;
      dependents: number;
    };
    caregiving_roles: string[];
    friend_network: {
      size: string;
      frequency: string;
      anchor_contexts: string[];
    };
    pets: string[];
  };
  money_profile: {
    attitude_toward_money: string;
    earning_context: string;
    spending_style: string;
    savings_investing_habits: {
      emergency_fund_months: number;
      retirement_contributions: string;
      investing_style: string;
    };
    debt_posture: string;
    financial_stressors: string[];
    money_conflicts: string;
    generosity_profile: string;
  };
  motivation_profile: {
    primary_motivation_labels: string[];
    deal_breakers: string[];
    primary_drivers: Record<string, number>;
    goal_orientation: {
      strength: number;
      time_horizon: string;
      primary_goals: string[];
      goal_flexibility: number;
    };
    want_vs_should_tension: {
      major_conflicts: string[];
      default_resolution: string;
    };
  };
  communication_style: {
    regional_register: {
      region: string;
      urbanicity: string;
      dialect_hints: string[];
    };
    voice_foundation: {
      formality: string;
      directness: string;
      pace_rhythm: string;
      positivity: string;
      empathy_level: number;
      honesty_style: string;
      charisma_level: number;
    };
    style_markers: {
      metaphor_domains: string[];
      aphorism_register: string;
      storytelling_vs_bullets: number;
      humor_style: string;
      code_switching_contexts: string[];
    };
    context_switches: {
      work: { formality: string; directness: string };
      home: { formality: string; directness: string };
      online: { formality: string; directness: string };
    };
    authenticity_filters: {
      avoid_registers: string[];
      embrace_registers: string[];
      personality_anchors: string[];
    };
  };
  humor_profile: {
    frequency: string;
    style: string[];
    boundaries: string[];
    targets: string[];
    use_cases: string[];
  };
  truth_honesty_profile: {
    baseline_honesty: number;
    situational_variance: Record<string, number>;
    typical_distortions: string[];
    red_lines: string[];
    pressure_points: string[];
    confession_style: string;
  };
  bias_profile: {
    cognitive: Record<string, number>;
    mitigations: string[];
  };
  cognitive_profile: {
    verbal_fluency: number;
    abstract_reasoning: number;
    problem_solving_orientation: string;
    thought_coherence: number;
  };
  emotional_profile: {
    stress_responses: string[];
    negative_triggers: string[];
    positive_triggers: string[];
    explosive_triggers: string[];
    emotional_regulation: string;
  };
  attitude_narrative: string;
  political_narrative: string;
  adoption_profile: {
    buyer_power: number;
    adoption_influence: number;
    risk_tolerance: number;
    change_friction: number;
    expected_objections: string[];
    proof_points_needed: string[];
  };
  prompt_shaping: {
    voice_foundation: {
      formality: string;
      directness: string;
      pace_rhythm: string;
      positivity: string;
      empathy_level: number;
    };
    style_markers: {
      metaphor_domains: string[];
      humor_style: string;
      storytelling_vs_bullets: number;
    };
    primary_motivations: string[];
    deal_breakers: string[];
    honesty_vector: {
      baseline: number;
      work: number;
      home: number;
      public: number;
      distortions: string[];
    };
    bias_vector: {
      top_cognitive: string[];
      top_social: string[];
      mitigation_playbook: string[];
    };
    context_switches: {
      work: string;
      home: string;
      online: string;
    };
    current_focus: string;
  };
}

interface UploadState {
  uploadText: string;
  description: string;
  background: string;
  selectedCollections: string[];
  uploading: boolean;
  progress: number;
  success: boolean;
  error: string | null;
  generatedPersona: any | null;
  generatedImageUrl: string | null;
  parsedData: {
    description: string;
    background: string;
    collections: string[];
    jsonData: any;
  } | null;
}

export function PersonaJsonUpload() {
  const [state, setState] = useState<UploadState>({
    uploadText: '',
    description: '',
    background: '',
    selectedCollections: [],
    uploading: false,
    progress: 0,
    success: false,
    error: null,
    generatedPersona: null,
    generatedImageUrl: null,
    parsedData: null,
  });

  const validatePersonaSchema = (jsonData: any): jsonData is PersonaSchema => {
    // Check for required top-level fields
    const requiredFields = [
      'identity', 'daily_life', 'health_profile', 'relationships',
      'money_profile', 'motivation_profile', 'communication_style',
      'humor_profile', 'truth_honesty_profile', 'bias_profile',
      'cognitive_profile', 'emotional_profile', 'attitude_narrative',
      'political_narrative', 'adoption_profile', 'prompt_shaping'
    ];

    for (const field of requiredFields) {
      if (!jsonData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check identity structure (most critical)
    if (!jsonData.identity || typeof jsonData.identity !== 'object') {
      throw new Error('Identity field must be an object');
    }
    
    if (!jsonData.identity.name || typeof jsonData.identity.name !== 'string') {
      throw new Error('Identity must include a valid name (string)');
    }
    
    if (!jsonData.identity.age || typeof jsonData.identity.age !== 'number') {
      throw new Error('Identity must include a valid age (number)');
    }

    return true;
  };

  const parseUploadFormat = (text: string) => {
    try {
      // Check if text starts with the expected format
      if (!text.includes('---PERSONA-UPLOAD---') || !text.includes('---END-PERSONA---')) {
        throw new Error('Invalid format. Please use the standardized persona upload format.');
      }

      // Extract description
      const descMatch = text.match(/DESCRIPTION:\s*(.*?)\s*BACKGROUND:/s);
      if (!descMatch) throw new Error('Description not found in format');
      const description = descMatch[1].trim();

      // Extract background
      const backgroundMatch = text.match(/BACKGROUND:\s*(.*?)\s*COLLECTIONS:/s);
      if (!backgroundMatch) throw new Error('Background not found in format');
      const background = backgroundMatch[1].trim();

      // Extract collections
      const collectionsMatch = text.match(/COLLECTIONS:\s*(.*?)\s*JSON:/s);
      if (!collectionsMatch) throw new Error('Collections not found in format');
      const collectionsStr = collectionsMatch[1].trim();
      const collections = collectionsStr.split(',').map(c => c.trim()).filter(c => c.length > 0);

      // Extract JSON
      const jsonMatch = text.match(/JSON:\s*(.*?)\s*---END-PERSONA---/s);
      if (!jsonMatch) throw new Error('JSON not found in format');
      const jsonStr = jsonMatch[1].trim();
      const jsonData = JSON.parse(jsonStr);

      return { description, background, collections, jsonData };
    } catch (error) {
      throw new Error(`Format parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateProgress = (progress: number) => {
    setState(prev => ({ ...prev, progress }));
  };

  const handleUpload = async () => {
    if (!state.uploadText.trim()) {
      setState(prev => ({ ...prev, error: 'Please paste the persona upload format' }));
      return;
    }

    setState(prev => ({ ...prev, uploading: true, progress: 0, error: null }));

    try {
      // Step 1: Parse upload format
      updateProgress(10);
      const parsedData = parseUploadFormat(state.uploadText);
      setState(prev => ({ ...prev, parsedData }));
      
      validatePersonaSchema(parsedData.jsonData);
      updateProgress(20);

      // Step 2: Validate collections exist
      const { data: existingCollections } = await supabase
        .from('collections')
        .select('name')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      const existingCollectionNames = existingCollections?.map(c => c.name) || [];
      const invalidCollections = parsedData.collections.filter(name => !existingCollectionNames.includes(name));
      
      if (invalidCollections.length > 0) {
        throw new Error(`Collections not found: ${invalidCollections.join(', ')}`);
      }

      // Get collection IDs
      const { data: collectionsData } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .in('name', parsedData.collections);
      
      const collectionIds = collectionsData?.map(c => c.id) || [];

      // Step 3: Enhance JSON with additional fields
      const enhancedPersona = {
        ...parsedData.jsonData,
        description: parsedData.description,
        background: parsedData.background,
        collections: collectionIds,
      };

      updateProgress(30);

      // Step 3: Generate unique persona ID
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const personaId = `v4_${timestamp}_${randomSuffix}`;

      updateProgress(40);

      // Step 4: Store in v4_personas table
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Create conversation summary for v4 format
      const conversationSummary = {
        demographics: {
          age: enhancedPersona.identity.age,
          location: enhancedPersona.identity.location,
          occupation: enhancedPersona.identity.occupation,
          name: enhancedPersona.identity.name,
          background_description: state.background
        },
        communication_style: {
          directness: enhancedPersona.communication_style.voice_foundation.directness,
          formality: enhancedPersona.communication_style.voice_foundation.formality,
          response_patterns: enhancedPersona.communication_style.style_markers.humor_style
        },
        motivational_summary: enhancedPersona.motivation_profile.primary_motivation_labels.join(', '),
        personality_summary: state.description
      };

      const { data: personaData, error: insertError } = await supabase
        .from('v4_personas')
        .insert({
          persona_id: personaId,
          name: enhancedPersona.identity.name,
          user_id: user.user.id,
          full_profile: enhancedPersona,
          conversation_summary: conversationSummary,
          is_public: true, // Default to public as per requirements
          creation_completed: true,
          schema_version: 'v4.0'
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      updateProgress(60);

      // Step 5: Add to collections
      if (collectionIds.length > 0) {
        const collectionInserts = collectionIds.map(collectionId => ({
          collection_id: collectionId,
          persona_id: personaId,
        }));

        const { error: collectionError } = await supabase
          .from('collection_personas')
          .insert(collectionInserts);

        if (collectionError) {
          console.warn('Failed to add to some collections:', collectionError.message);
        }
      }

      updateProgress(70);

      // Step 6: Generate profile image
      try {
        updateProgress(80);
        
        // Create a minimal persona object for image generation
        const mockPersona = {
          persona_id: personaId,
          name: enhancedPersona.identity.name,
          profile_image_url: null,
          identity: enhancedPersona.identity,
          // Add other required fields for image generation
          user_id: user.user.id,
          created_at: new Date().toISOString(),
          is_public: true,
        };

        const imageUrl = await generatePersonaImage(mockPersona as any);
        
        if (imageUrl) {
          // Update persona with image URL
          await supabase
            .from('v4_personas')
            .update({ profile_image_url: imageUrl })
            .eq('persona_id', personaId);
          
          setState(prev => ({ ...prev, generatedImageUrl: imageUrl }));
          updateProgress(90);
        }
      } catch (imageError) {
        console.warn('Image generation failed (non-fatal):', imageError);
        // Continue without image - this is non-fatal
      }

      updateProgress(100);

      setState(prev => ({ 
        ...prev, 
        success: true, 
        uploading: false,
        generatedPersona: personaData
      }));

      toast.success(`Persona "${enhancedPersona.identity.name}" uploaded and created successfully!`);

    } catch (error) {
      console.error('Upload failed:', error);
      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }));
      toast.error('Upload failed');
    }
  };

  const resetForm = () => {
    setState({
      uploadText: '',
      description: '',
      background: '',
      selectedCollections: [],
      uploading: false,
      progress: 0,
      success: false,
      error: null,
      generatedPersona: null,
      generatedImageUrl: null,
      parsedData: null,
    });
  };

  if (state.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Upload Successful
          </CardTitle>
          <CardDescription>
            Persona "{state.generatedPersona?.name}" has been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.generatedImageUrl && (
            <div className="flex items-center gap-4">
              <img 
                src={state.generatedImageUrl} 
                alt="Generated profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">Profile image generated</p>
                <p className="text-sm text-muted-foreground">
                  Based on persona characteristics
                </p>
              </div>
            </div>
          )}
          
          {state.selectedCollections.length > 0 && (
            <div>
              <p className="font-medium">Added to collections:</p>
              <p className="text-sm text-muted-foreground">
                {state.selectedCollections.length} collection(s)
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={() => window.open(`/persona/${state.generatedPersona?.persona_id}`, '_blank')}
              variant="outline"
            >
              View Persona
            </Button>
            <Button onClick={resetForm}>
              Upload Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Paste Persona Upload Format
        </CardTitle>
        <CardDescription>
          Paste the standardized persona format to automatically create a new persona with image generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {state.uploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Processing upload...</span>
            </div>
            <Progress value={state.progress} className="w-full" />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="upload-format">Paste Persona Upload Format *</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Format example:
              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
{`---PERSONA-UPLOAD---
DESCRIPTION: [Present-moment snapshot]
BACKGROUND: [Life history and influences]
COLLECTIONS: [Collection Name 1, Collection Name 2]
JSON:
{"identity": {"name": "...", "age": ...}, ...}
---END-PERSONA---`}
              </pre>
            </div>
            <Textarea
              id="upload-format"
              placeholder="Paste the complete persona upload format here..."
              value={state.uploadText}
              onChange={(e) => setState(prev => ({ ...prev, uploadText: e.target.value }))}
              disabled={state.uploading}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>


          <Button 
            onClick={handleUpload}
            disabled={!state.uploadText.trim() || state.uploading}
            className="w-full"
          >
            {state.uploading ? 'Processing...' : 'Process Upload'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}