import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  addToQueue, 
  getQueueItems, 
  updateQueueStatus, 
  updateQueueStatusSafe, 
  parsePersonaDescription, 
  popNextQueueItem,
  forceFailQueueItem,
  deleteQueueItem
} from "@/services/personaQueueService";
import { useToast } from "@/hooks/use-toast";
import { createV4PersonaUnified } from "@/services/v4-persona";
import { tryAcquireQueueLock, renewQueueLock, releaseQueueLock, readQueueLock } from '@/utils/queueLock';
import { addPersonaToCollection } from '@/services/collections/personaCollectionOperations';
import { getUserCollections } from '@/services/collections/collectionOperations';
import { supabase } from '@/integrations/supabase/client';
import { QueueHealthMonitor } from '@/components/persona-queue/QueueHealthMonitor';
import { getProcessingTimeText, getStatusColor, getStatusDisplay } from '@/services/queueHealthService';
import { RefreshCw, Trash2, ExternalLink } from 'lucide-react';

const ADMIN_EMAILS = [
  "cumbucotrader@gmail.com",
  "scott@sparkwave-ai.com",
];

const ensureV4PersonaCore = (persona: any) => {
  if (!persona) throw new Error('No persona returned from creation call');
  if (!persona.schema_version || !persona.schema_version.startsWith('v4')) {
    throw new Error(`Non-V4 persona detected (schema_version=${persona.schema_version || 'missing'})`);
  }

  const fp = persona.full_profile;
  if (!fp) throw new Error('V4 persona missing full_profile');
  if (!fp.identity) throw new Error('V4 persona missing full_profile.identity');
  if (!fp.communication_style) throw new Error('V4 persona missing full_profile.communication_style');
  if (!fp.motivation_profile) throw new Error('V4 persona missing full_profile.motivation_profile');

  // conversation_summary is strongly recommended for engine:
  if (!persona.conversation_summary) {
    console.warn('V4 persona missing conversation_summary (will degrade UX but not blocked)');
  }

  // DO NOT require legacy `trait_profile` for V4
  return persona;
};

const PersonaQueue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [textareaContent, setTextareaContent] = useState('');
  const [processing, setProcessing] = useState(false);
  const [busy, setBusy] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (user && !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadQueueItems();
    }
  }, [user, isAdmin]);


  const loadQueueItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const items = await getQueueItems(user.id);
      setQueueItems(items || []);
    } catch (error) {
      console.error('Error loading queue items:', error);
      toast({
        title: "Error",
        description: "Failed to load queue items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestAdd = async () => {
    if (!user) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const probeName = `Queue Probe ${timestamp}`;
      
      await addToQueue(
        user.id,
        probeName,
        'A test probe persona to observe queue behavior and trace logging',
        []
      );
      toast({
        title: "Success",
        description: `Added "${probeName}" to queue`,
      });
      loadQueueItems(); // Refresh the list
    } catch (error) {
      console.error('Error adding test item:', error);
      toast({
        title: "Error",
        description: "Failed to add test item",
        variant: "destructive",
      });
    }
  };

  const testStatusUpdate = async () => {
    // Test with Denise Chen's ID
    const deniseId = '10bdf9e6-8327-4f4a-9f57-02de800dc7e7';
    console.log('🧪 Testing updateQueueStatus with Denise Chen...');
    
    try {
      console.log('Before update - checking current status...');
      const result = await updateQueueStatus(deniseId, 'test_status');
      console.log('✅ updateQueueStatus SUCCESS:', result);
      toast({ title: "Test Success", description: "Status update worked!" });
      loadQueueItems(); // Refresh to see the change
    } catch (error) {
      console.error('❌ updateQueueStatus FAILED:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      toast({ title: "Test Failed", description: `Status update failed: ${error.message}`, variant: "destructive" });
    }
  };

  // Test function to update status WITH persona_id
  const testStatusWithPersonaId = async () => {
    const deniseId = '10bdf9e6-8327-4f4a-9f57-02de800dc7e7';
    console.log('🧪 Testing status + persona_id update for Denise Chen...');
    
    try {
      const result = await updateQueueStatus(deniseId, 'test_with_persona', 'test_persona_id_123');
      console.log('✅ Status + persona_id update successful:', result);
      console.log('📋 Check persona_id field:', result.persona_id);
      toast({ 
        title: "Test Success", 
        description: `Status + persona_id update worked! persona_id: ${result.persona_id}`
      });
      loadQueueItems(); // Refresh to see the change
    } catch (error) {
      console.error('❌ Status + persona_id update failed:', error);
      toast({ 
        title: "Test Failed", 
        description: `Status + persona_id update failed: ${error.message}`, 
        variant: "destructive" 
      });
    }
  };

  const handleManualClear = async (id: string, name: string) => {
    try {
      await forceFailQueueItem(id, 'Manually cleared by admin');
      toast({
        title: "Success",
        description: `Cleared ${name} from queue`,
      });
      loadQueueItems(); // Refresh to see the change
    } catch (error) {
      console.error('Error clearing queue item:', error);
      toast({
        title: "Error",
        description: `Failed to clear ${name}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will permanently remove it from the queue.`)) {
      return;
    }
    
    try {
      setBusy(true);
      await deleteQueueItem(id);
      toast({
        title: "Success",
        description: `Deleted "${name}" from queue`,
      });
      loadQueueItems(); // Refresh to see the change
    } catch (error) {
      console.error('Error deleting queue item:', error);
      toast({
        title: "Error",
        description: `Failed to delete ${name}`,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleParseAndAdd = async () => {
    if (!user || !textareaContent.trim()) return;

    try {
      // Parse the text to extract name and collections
      const parsed = parsePersonaDescription(textareaContent.trim());
      
      await addToQueue(
        user.id,
        parsed.name,        // Use extracted name instead of 'Queued Persona'
        parsed.description,
        parsed.collections  // Pass extracted collections
      );
      toast({
        title: "Success",
        description: `Added "${parsed.name}" to queue`,
      });
      setTextareaContent(''); // Clear textarea
      loadQueueItems(); // Refresh the list
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: "Error",
        description: "Failed to add to queue",
        variant: "destructive",
      });
    }
  };

  // New enhanced cross-tab lock processing handler
  const onProcessClick = async () => {
    if (busy) return;

    // Cross-tab guard using new utility
    if (!tryAcquireQueueLock(60_000)) {
      const held = readQueueLock();
      toast({
        title: 'Already processing elsewhere',
        description: `Another tab started processing. Try again in ~60s.`,
        variant: 'destructive',
      });
      return;
    }

    setBusy(true);
    const renew = setInterval(() => renewQueueLock(60_000), 30_000); // keepalive if it runs long
    try {
      await processQueueItemInternal();
    } finally {
      clearInterval(renew);
      releaseQueueLock();
      setBusy(false);
    }
  };

  const processQueueItemInternal = async () => {
    if (!user || processing) {
      console.log('🚫 Already processing or no user, skipping...');
      return;
    }

    setProcessing(true);
    console.log('🚀 Starting to process queue with atomic pop...');
    
    let currentItemId: string | null = null;

    // Timeout wrapper to prevent hanging stages
    const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        p,
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('queue-stage-timeout')), ms)),
      ]);

    // Helper to fail with proper error capture
    const fail = async (msg: string): Promise<never> => {
      if (currentItemId) {
        await updateQueueStatusSafe(currentItemId, 'failed', undefined, msg);
      }
      throw new Error(msg);
    };

    try {
      // 1) Atomically claim a job
      const item = await popNextQueueItem();
      if (!item) {
        toast({
          title: 'Queue empty',
          description: 'No pending items to process',
        });
        return;
      }

      currentItemId = item.id;
      console.log('📋 Claimed queue item:', item.name, 'Status:', item.status);

      let personaId = item.persona_id ?? null;
      let currentStatus = item.status; // Track current status locally

      // === STEP 2: Resume Logic - Fetch fresh queue row to check existing persona_id ===
      const { data: queueRow } = await supabase
        .from('persona_creation_queue')
        .select('status, persona_id, collections')
        .eq('id', item.id)
        .single();

      if (queueRow?.persona_id) {
        personaId = queueRow.persona_id;
        currentStatus = queueRow.status; // Use actual current status
        console.log('📋 Resume detected - existing persona_id:', personaId);
        
        // Skip to correct stage based on current status
        if (queueRow.status === 'completed') {
          console.log('✅ Item already completed, skipping');
          return;
        }
      }

      // === Stage 1: Create (idempotent) ===
      if (!personaId && (currentStatus === 'processing' || currentStatus === 'processing_stage1')) {
        console.log('🎯 Starting V4 persona creation...');
        
        // DIAGNOSTIC: Log trace before queue creation call
        console.log('TRACE_Q_START', {
          queue_item_id: item.id,
          payload_keys: Object.keys({
            user_prompt: item.description,
            user_id: user.id
          }),
          ts: new Date().toISOString(),
        });
        
        const unifiedResponse = await withTimeout(createV4PersonaUnified({
          user_description: item.description,
          user_id: user.id
        }), 120000); // 120 second timeout

        if (!unifiedResponse.success) {
          await fail(`V4 Unified creation failed: ${unifiedResponse.error}`);
        }

        // === STEP 1: Validate and persist persona_id after creation ===
        personaId = unifiedResponse.persona_id;
        
        // Guard: only accept real V4 ids; never write queue uuid by accident
        if (!personaId || !String(personaId).startsWith('v4_')) {
          await fail(`Unified creation returned non-v4 persona_id: ${personaId}`);
        }

        // 🔒 Fetch the created persona from DB and enforce V4 schema
        const { data: fresh, error } = await supabase
          .from('v4_personas')
          .select('persona_id, schema_version, full_profile, profile_image_url, creation_stage, creation_completed')
          .eq('persona_id', personaId)
          .maybeSingle();

        if (error) throw error;
        ensureV4PersonaCore(fresh);
        
        // DIAGNOSTIC: Log trace after queue creation call
        console.log('TRACE_Q_AFTER_UNIFIED', {
          queue_item_id: item.id,
          persona_id: unifiedResponse?.persona_id,
          db: {
            schema: fresh?.schema_version,
            has_identity: !!(fresh?.full_profile as any)?.identity,
            has_motivation: !!(fresh?.full_profile as any)?.motivation_profile,
            has_comm_style: !!(fresh?.full_profile as any)?.communication_style,
            profile_image_url: fresh?.profile_image_url ?? null,
            creation_stage: fresh?.creation_stage ?? null,
            creation_completed: fresh?.creation_completed ?? null,
          },
          ts: new Date().toISOString(),
        });
        
        console.log('✅ V4 unified persona creation completed:', personaId);
        
        // Add to collections if specified
        if (item.collections && item.collections.length > 0) {
          console.log('📁 Adding persona to collections:', item.collections);
          
          // Fetch user collections and create name-to-ID map
          const userCollections = await getUserCollections();
          const collectionMap = new Map();
          userCollections.forEach(collection => {
            // Normalize collection name for matching
            const normalizedName = collection.name.toLowerCase().trim();
            collectionMap.set(normalizedName, collection.id);
          });
          
          for (const collectionName of item.collections) {
            try {
              const normalizedSearchName = collectionName.toLowerCase().trim();
              const collectionId = collectionMap.get(normalizedSearchName);
              
              if (collectionId) {
                await addPersonaToCollection(collectionId, personaId);
                console.log(`✅ Added persona to collection "${collectionName}" (${collectionId})`);
              } else {
                console.warn(`⚠️ Collection "${collectionName}" not found for user. Available collections:`, Array.from(collectionMap.keys()));
              }
            } catch (collectionError) {
              console.warn(`⚠️ Failed to add persona to collection "${collectionName}":`, collectionError);
            }
          }
        }
        
        // Mark as completed
        await updateQueueStatusSafe(item.id, 'completed', personaId);
        console.log('🎉 Queue item marked as completed');
        
      } else if (personaId) {
        console.log('📋 Persona already exists, marking as completed:', personaId);
        await updateQueueStatusSafe(item.id, 'completed', personaId);
      } else if (currentStatus === 'completed') {
        console.log('✅ Item already completed, skipping');
        return;
      }

      console.log('🎉 Unified persona creation and collection assignment completed');
      
      toast({
        title: 'Persona created successfully!',
        description: `${item.name} has been processed and is ready for use.`,
      });

      // Check if there are more pending items and process automatically
      setTimeout(async () => {
        console.log('🔍 Checking for next pending item...');
        const updatedItems = await getQueueItems(user.id);
        const nextPending = updatedItems?.find(item => item.status === 'pending');
        if (nextPending) {
          console.log('🚀 Found next pending item, processing automatically...');
          onProcessClick(); // Process the next item automatically
        } else {
          console.log('✅ No more pending items found');
        }
      }, 1000);

    } catch (error: any) {
      console.error('❌ Error processing queue item:', error);
      
      // Update status to failed with error message if we have an item ID
      if (currentItemId) {
        await updateQueueStatusSafe(currentItemId, 'failed', undefined, `Processor error: ${error?.message ?? 'unknown'}`);
      }
      
      toast({
        title: 'Processing failed',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setBusy(false);
      console.log('🏁 Processing complete, refreshing queue...');
      loadQueueItems();
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6">
                <div className="flex items-center justify-between mb-6">
                  <SidebarTrigger className="hidden md:flex" />
                  <h1 className="text-3xl font-bold">Persona Queue Admin</h1>
                </div>
                
                <div className="grid lg:grid-cols-4 gap-6 mb-8">
                  {/* Queue Health Monitor */}
                  <div className="lg:col-span-1">
                    <QueueHealthMonitor 
                      onRefresh={loadQueueItems}
                      refreshing={loading}
                    />
                  </div>

                  {/* Text Input Area */}
                  <div className="lg:col-span-3 bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Add Personas to Queue</h2>
                      <div className="flex items-center gap-2">
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Paste persona descriptions here..."
                        value={textareaContent}
                        onChange={(e) => setTextareaContent(e.target.value)}
                        className="min-h-[200px] text-base"
                        rows={8}
                      />
                      <div className="flex gap-3">
                        <Button onClick={handleParseAndAdd} className="flex-1">
                          Parse & Add to Queue
                        </Button>
                        <Button onClick={onProcessClick} disabled={busy}>
                          {busy ? "Processing..." : "Process Queue"}
                        </Button>
                        <Button onClick={handleTestAdd} variant="outline">
                          Test Add
                        </Button>
                        <Button onClick={testStatusUpdate} variant="outline">
                          Test Status Update
                        </Button>
                        <Button onClick={testStatusWithPersonaId} variant="outline">
                          Test Status + Persona ID
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <p>Loading queue items...</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Processing Time</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queueItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No queue items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          queueItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.name}
                                {item.persona_id && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    ID: {item.persona_id}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={item.status === 'completed' ? 'default' : 
                                           item.status === 'failed' ? 'destructive' : 
                                           item.status.startsWith('processing') ? 'secondary' : 'outline'}
                                  className={getStatusColor(item.status)}
                                >
                                  {getStatusDisplay(item.status)}
                                </Badge>
                                {item.error_message && (
                                  <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                                    {item.error_message}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {getProcessingTimeText(item.processing_started_at)}
                                </div>
                                {item.attempt_count > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Attempt {item.attempt_count}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(item.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {item.persona_id && item.status === 'completed' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(`/persona/${item.persona_id}`, '_blank')}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {item.status === 'pending' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item.id, item.name)}
                                      title="Delete from queue"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {(item.status === 'failed' || item.status.startsWith('processing')) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleManualClear(item.id, item.name)}
                                      title="Mark as failed"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PersonaQueue;