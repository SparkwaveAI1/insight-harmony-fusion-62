import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createV4PersonaUnified } from '@/services/v4-persona';
import { CollectionsMultiSelector } from '@/components/collections/CollectionsMultiSelector';
import { addPersonaToCollection } from '@/services/collections/collectionsService';
import { useAuth } from '@/context/AuthContext';
import { backgroundJobService } from '@/services/persona/backgroundJobService';
import { usePersonaCreationJob } from '@/hooks/useBackgroundPersonaJobs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkUserCredits } from '@/utils/creditCheck';

export function V4PersonaCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generateImage, setGenerateImage] = useState(true);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  
  // Remove all specific persona parameters - now using simple text input
  const currentJob = usePersonaCreationJob(currentJobId || undefined);

  const handleCreatePersona = async () => {
    if (!user || !prompt.trim()) return;

    // Check if user has enough credits for persona creation
    const { hasEnoughCredits, currentBalance } = await checkUserCredits(user.id, 3);

    if (!hasEnoughCredits) {
      toast({
        title: "Insufficient credits",
        description: `Need 3 credits for persona creation, you have ${currentBalance}. Please purchase more credits.`,
        variant: "destructive",
      });
      return; // Stop persona creation
    }

    // If we get here, user has enough credits - proceed with normal persona creation

    // Create background job
    const job = backgroundJobService.createJob({
      userId: user.id,
      prompt: prompt.trim(),
      generateImage,
      selectedCollections: selectedCollectionIds,
    });

    setCurrentJobId(job.id);
    
    toast({
      title: "Persona creation started",
      description: "Your persona is being created in the background. You can navigate away and check progress from the job indicator.",
    });

    // Start background processing with simplified parameters
    processPersonaCreation(job.id, {
      user_prompt: prompt.trim(),
      user_id: user.id,
      generateImage,
      selectedCollectionIds,
    });
  };

  const processPersonaCreation = async (
    jobId: string,
    params: {
      user_prompt: string;
      user_id: string;
      generateImage: boolean;
      selectedCollectionIds: string[];
    }
  ) => {
    try {
      // Call 1: Generate detailed traits
      backgroundJobService.updateJob(jobId, {
        status: 'stage1',
        progress: 10,
        message: 'Generating detailed personality traits...',
      });
      
      // DIAGNOSTIC: Log trace before creation call with simplified data
      const creationData = {
        user_prompt: params.user_prompt,
        user_id: params.user_id,
      };
      
      console.log('TRACE_M_START', {
        job_id: jobId,
        payload_keys: Object.keys(creationData),
        form_inputs: creationData,
        ts: new Date().toISOString(),
      });
      
      const unifiedResponse = await createV4PersonaUnified({
        user_description: creationData.user_prompt || '',
        user_id: user.id
      });

      if (!unifiedResponse.success) {
        throw new Error(unifiedResponse.error || 'Unified persona creation failed');
      }

      // DIAGNOSTIC: Fetch created persona from DB for comparison
      const { data: fresh, error } = await supabase
        .from('v4_personas')
        .select('persona_id, schema_version, full_profile, profile_image_url, creation_stage, creation_completed')
        .eq('persona_id', unifiedResponse.persona_id!)
        .maybeSingle();

      // DIAGNOSTIC: Log trace after unified creation
      console.log('TRACE_M_AFTER_UNIFIED', {
        job_id: jobId,
        persona_id: unifiedResponse?.persona_id,
        db: {
          schema: fresh?.schema_version,
          has_identity: !!(fresh?.full_profile as any)?.identity,
          has_motivation: !!(fresh?.full_profile as any)?.motivation_profile,
          has_comm_style: !!(fresh?.full_profile as any)?.communication_style,
          card_description: null, // V4 personas don't have separate card_description field
          profile_image_url: fresh?.profile_image_url ?? null,
          creation_stage: fresh?.creation_stage ?? null,
          creation_completed: fresh?.creation_completed ?? null,
        },
        ts: new Date().toISOString(),
      });

      backgroundJobService.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        message: 'Persona created successfully!',
      });

      // Add to selected collections if any
      if (params.selectedCollectionIds.length > 0) {
        backgroundJobService.updateJob(jobId, {
          progress: 90,
          message: 'Adding to collections...',
        });

        for (const collectionId of params.selectedCollectionIds) {
          await addPersonaToCollection(collectionId, unifiedResponse.persona_id!);
        }
      }

      // Complete
      backgroundJobService.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        message: 'Persona created successfully!',
      });

      // Complete the job
      backgroundJobService.completeJob(jobId, {
        personaId: unifiedResponse.persona_id!,
        personaName: unifiedResponse.persona_name || 'New Persona',
        imageUrl: null, // Image generation happens in the unified function
      });

      toast({
        title: "Persona created successfully!",
        description: `"${unifiedResponse.persona_name}" is ready to chat with.`,
      });

    } catch (error) {
      console.error('Error creating V4 persona:', error);
      backgroundJobService.failJob(jobId, error instanceof Error ? error.message : 'Unknown error occurred');
      
      toast({
        title: "Persona creation failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const handleViewPersona = () => {
    if (currentJob?.personaId) {
      navigate(`/persona-detail/${currentJob.personaId}`);
      setCurrentJobId(null);
    }
  };

  const isCreating = currentJob && ['pending', 'stage1', 'stage2', 'stage3'].includes(currentJob.status);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Persona Creator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe the persona you want to create:
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A 35-year-old electrical contractor from North Carolina who served in the military and is interested in MMA training..."
              rows={3}
              disabled={isCreating}
            />
          </div>

          {/* All structured fields removed - using only free-text description */}

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="generate-image"
              checked={generateImage}
              onCheckedChange={(checked) => setGenerateImage(checked === true)}
              disabled={isCreating}
            />
            <label 
              htmlFor="generate-image" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Generate profile image automatically
            </label>
          </div>

          <CollectionsMultiSelector
            selectedCollectionIds={selectedCollectionIds}
            onSelectionChange={setSelectedCollectionIds}
          />

          <Button
            onClick={handleCreatePersona}
            disabled={!!isCreating || !prompt.trim() || !user}
            className="w-full"
          >
            {isCreating ? 'Creating Persona...' : 'Create Persona'}
          </Button>

          {currentJob && (
            <Alert className={currentJob.status === 'failed' ? 'border-red-200 bg-red-50' : 
                            currentJob.status === 'completed' ? 'border-green-200 bg-green-50' : ''}>
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {currentJob.status === 'completed' ? 'Persona Ready!' : 
                       currentJob.status === 'failed' ? 'Creation Failed' : 'Creating Persona'}
                    </div>
                    {currentJob.progress > 0 && currentJob.status !== 'completed' && (
                      <span className="text-sm text-muted-foreground">{currentJob.progress}%</span>
                    )}
                  </div>
                  
                  <div>{currentJob.message}</div>
                  
                  {currentJob.personaName && (
                    <div className="font-medium">{currentJob.personaName}</div>
                  )}
                  
                  {isCreating && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${currentJob.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {currentJob.status === 'completed' && currentJob.personaId && (
                    <Button onClick={handleViewPersona} className="w-full mt-2">
                      View Persona
                    </Button>
                  )}
                  
                  {currentJob.status === 'failed' && currentJob.error && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                      {currentJob.error}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}