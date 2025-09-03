import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createV4PersonaCall1, createV4PersonaCall2, createV4PersonaCall3 } from '@/services/v4-persona';
import { CollectionsMultiSelector } from '@/components/collections/CollectionsMultiSelector';
import { addPersonaToCollection } from '@/services/collections/collectionsService';
import { useAuth } from '@/context/AuthContext';
import { backgroundJobService } from '@/services/persona/backgroundJobService';
import { usePersonaCreationJob } from '@/hooks/useBackgroundPersonaJobs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function V4PersonaCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generateImage, setGenerateImage] = useState(true);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const currentJob = usePersonaCreationJob(currentJobId || undefined);

  const handleCreatePersona = async () => {
    if (!user || !prompt.trim()) return;

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

    // Start background processing
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
      
      // DIAGNOSTIC: Log trace before regular creation call
      console.log('TRACE_M_START', {
        job_id: jobId,
        payload_keys: Object.keys({
          user_prompt: params.user_prompt,
          user_id: params.user_id,
        }),
        ts: new Date().toISOString(),
      });
      
      const call1Response = await createV4PersonaCall1({
        user_prompt: params.user_prompt,
        user_id: params.user_id,
      });

      if (!call1Response.success) {
        throw new Error(call1Response.error || 'Call 1 failed');
      }

      // DIAGNOSTIC: Fetch created persona from DB for comparison
      const { data: fresh, error } = await supabase
        .from('v4_personas')
        .select('id, persona_id, schema_version, full_profile, profile_image_url, creation_stage, creation_completed')
        .eq('persona_id', call1Response.persona_id!)
        .maybeSingle();

      // DIAGNOSTIC: Log trace after regular creation call
      console.log('TRACE_M_AFTER_CALL1', {
        job_id: jobId,
        persona_id: call1Response?.persona_id,
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

      backgroundJobService.updateJobFromApiResponse(jobId, call1Response);

      // Call 2: Generate summaries
      backgroundJobService.updateJob(jobId, {
        status: 'stage2',
        progress: 40,
        message: 'Creating conversation summaries...',
      });

      const call2Response = await createV4PersonaCall2(call1Response.persona_id!);

      if (!call2Response.success) {
        throw new Error(call2Response.error || 'Call 2 failed');
      }

      // DIAGNOSTIC: Fetch persona from DB after Stage 2
      const { data: fresh2, error: error2 } = await supabase
        .from('v4_personas')
        .select('id, persona_id, schema_version, full_profile, profile_image_url, creation_stage, creation_completed')
        .eq('persona_id', call2Response.persona_id!)
        .maybeSingle();

      if (error2) throw error2;
      
      console.log('TRACE_M_AFTER_CALL2', {
        job_id: jobId,
        persona_id: call2Response.persona_id,
        card_description: null, // V4 personas don't have separate card_description field  
        profile_image_url: fresh2?.profile_image_url ?? null,
        creation_stage: fresh2?.creation_stage ?? null,
        creation_completed: fresh2?.creation_completed ?? null,
        ts: new Date().toISOString(),
      });

      backgroundJobService.updateJobFromApiResponse(jobId, call2Response);

      // Call 3: Generate profile image (optional)
      backgroundJobService.updateJob(jobId, {
        status: 'stage3',
        progress: 70,
        message: 'Generating profile image...',
      });

      const call3Response = await createV4PersonaCall3(call2Response.persona_id!, params.generateImage);
      
      // DIAGNOSTIC: Fetch persona from DB after Stage 3
      const { data: fresh3, error: error3 } = await supabase
        .from('v4_personas')
        .select('id, persona_id, schema_version, full_profile, profile_image_url, creation_stage, creation_completed')
        .eq('persona_id', call2Response.persona_id!)
        .maybeSingle();

      if (error3) throw error3;
      
      console.log('TRACE_M_AFTER_CALL3', {
        job_id: jobId,
        persona_id: call2Response.persona_id,
        card_description: null, // V4 personas don't have separate card_description field  
        profile_image_url: fresh3?.profile_image_url ?? null,
        creation_stage: fresh3?.creation_stage ?? null,
        creation_completed: fresh3?.creation_completed ?? null,
        ts: new Date().toISOString(),
      });
      
      backgroundJobService.updateJobFromApiResponse(jobId, call3Response);

      // Add to selected collections if any
      if (params.selectedCollectionIds.length > 0) {
        backgroundJobService.updateJob(jobId, {
          progress: 90,
          message: 'Adding to collections...',
        });

        for (const collectionId of params.selectedCollectionIds) {
          await addPersonaToCollection(collectionId, call1Response.persona_id!);
        }
      }

      // DIAGNOSTIC: Final trace before marking completed and navigating
      const { data: finalFresh, error: finalError } = await supabase
        .from('v4_personas')
        .select('id, persona_id, schema_version, full_profile, profile_image_url, creation_stage, creation_completed')
        .eq('persona_id', call2Response.persona_id!)
        .maybeSingle();

      if (finalError) throw finalError;
      
      console.log('TRACE_M_BEFORE_COMPLETE', {
        job_id: jobId,
        persona_id: call2Response.persona_id,
        // IMPORTANT: what object are we about to render?
        render_source: finalFresh ? 'db_fetch' : 'create_response',
        has_full_profile: !!finalFresh?.full_profile,
        has_identity: !!(finalFresh?.full_profile as any)?.identity,
        has_motivation: !!(finalFresh?.full_profile as any)?.motivation_profile,
        has_comm_style: !!(finalFresh?.full_profile as any)?.communication_style,
        card_description: null, // V4 personas don't have separate card_description field  
        profile_image_url: finalFresh?.profile_image_url ?? null,
        ts: new Date().toISOString(),
      });

      // Complete the job
      backgroundJobService.completeJob(jobId, {
        personaId: call2Response.persona_id!,
        personaName: call2Response.persona_name || 'New Persona',
        imageUrl: call3Response.image_url,
      });

      toast({
        title: "Persona created successfully!",
        description: `"${call2Response.persona_name}" is ready to chat with.`,
      });

    } catch (err) {
      console.error('Error creating V4 persona:', err);
      backgroundJobService.failJob(jobId, err instanceof Error ? err.message : 'Unknown error occurred');
      
      toast({
        title: "Persona creation failed",
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const handleViewPersona = () => {
    if (currentJob?.personaId) {
      navigate(`/persona/${currentJob.personaId}`);
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
              rows={4}
              disabled={isCreating}
            />
          </div>

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