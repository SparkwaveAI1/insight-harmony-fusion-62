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
import { 
  addToQueue, 
  getQueueItems, 
  updateQueueStatus, 
  updateQueueStatusSafe, 
  parsePersonaDescription, 
  popNextQueueItem 
} from "@/services/personaQueueService";
import { useToast } from "@/hooks/use-toast";
import { createV4PersonaCall1, createV4PersonaCall2, createV4PersonaCall3 } from "@/services/v4-persona";

const ADMIN_EMAILS = [
  "cumbucotrader@gmail.com",
  "scott@sparkwave-ai.com",
];

const PersonaQueue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [textareaContent, setTextareaContent] = useState('');
  const [processing, setProcessing] = useState(false);

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
      await addToQueue(
        user.id,
        'Test Person',
        'Test description',
        ['Test Collection']
      );
      toast({
        title: "Success",
        description: "Test item added to queue",
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

  // Cross-tab lock management
  const LOCK_KEY = 'pcq-processing-lock';
  const LOCK_TTL_MS = 60_000; // 60 seconds

  const tryAcquireUiLock = () => {
    const raw = localStorage.getItem(LOCK_KEY);
    if (raw) {
      try {
        const { until } = JSON.parse(raw);
        if (Date.now() < until) return false;
      } catch (e) {
        // Invalid lock data, proceed to acquire
      }
    }
    localStorage.setItem(LOCK_KEY, JSON.stringify({ until: Date.now() + LOCK_TTL_MS }));
    return true;
  };

  const releaseUiLock = () => localStorage.removeItem(LOCK_KEY);

  const processNextQueueItem = async () => {
    if (!user || processing) {
      console.log('🚫 Already processing or no user, skipping...');
      return;
    }

    // Try to acquire cross-tab lock
    if (!tryAcquireUiLock()) {
      toast({
        title: 'Already processing',
        description: 'Processing is already running in another tab',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    console.log('🚀 Starting to process queue with atomic pop...');
    
    let currentItemId: string | null = null;

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

      // === Stage 1: Create (idempotent) ===
      if (item.status === 'processing' || item.status === 'processing_stage1') {
        if (!personaId) {
          console.log('🎯 Starting V4 persona creation step 1...');
          
          const call1Response = await createV4PersonaCall1({
            user_prompt: item.description,
            user_id: user.id
          });

          if (!call1Response.success) {
            throw new Error(`V4 Call 1 failed: ${call1Response.error}`);
          }

          personaId = call1Response.persona_id;
          await updateQueueStatusSafe(item.id, 'processing_stage1', personaId);
          console.log('✅ V4 persona creation step 1 completed:', personaId);
        } else {
          console.log('📋 Persona already exists, skipping stage 1:', personaId);
          await updateQueueStatusSafe(item.id, 'processing_stage1', personaId);
        }
      }

      // === Stage 2: Enrich / finalize metadata ===
      if (item.status === 'processing_stage1' || item.status === 'processing_stage2') {
        // Guard: must have personaId by now
        if (!personaId) {
          throw new Error('Missing persona_id before stage 2');
        }
        
        console.log('🎯 Starting V4 persona creation step 2...');
        
        const call2Response = await createV4PersonaCall2(personaId);
        
        if (!call2Response.success) {
          throw new Error(`V4 Call 2 failed: ${call2Response.error}`);
        }
        
        // Update personaId if call2 returns a different one
        personaId = call2Response.persona_id || personaId;
        await updateQueueStatusSafe(item.id, 'processing_stage2', personaId);
        console.log('✅ V4 persona creation step 2 completed');
      }

      // === Stage 3: Image / attachments ===
      if (item.status === 'processing_stage2' || item.status === 'processing_stage3') {
        if (!personaId) {
          throw new Error('Missing persona_id before stage 3');
        }
        
        console.log('🎯 Starting V4 persona creation step 3...');
        
        const call3Response = await createV4PersonaCall3(personaId, true);
        
        if (!call3Response.success) {
          throw new Error(`V4 Call 3 failed: ${call3Response.error}`);
        }
        
        // Update personaId if call3 returns a different one
        personaId = call3Response.persona_id || personaId;
        await updateQueueStatusSafe(item.id, 'processing_stage3', personaId);
        console.log('✅ V4 persona creation step 3 completed');
      }

      // === Finalize ===
      await updateQueueStatusSafe(item.id, 'completed', personaId);
      console.log('🏁 Processing completed successfully for:', item.name);
      
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
          processNextQueueItem(); // Process the next item automatically
        } else {
          console.log('✅ No more pending items found');
        }
      }, 1000);

    } catch (error: any) {
      console.error('❌ Error processing queue item:', error);
      
      // Update status to failed with error message if we have an item ID
      if (currentItemId) {
        await updateQueueStatusSafe(currentItemId, 'failed', undefined, `ERR: ${error?.message ?? 'unknown'}`);
      }
      
      toast({
        title: 'Processing failed',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      releaseUiLock();
      setProcessing(false);
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
                
                <div className="space-y-6 mb-8">
                  {/* Text Input Area */}
                  <div className="bg-card border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Add Personas to Queue</h2>
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
                        <Button onClick={processNextQueueItem} disabled={processing}>
                          {processing ? "Processing..." : "Process Queue"}
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
                    <p>Loading queue items...</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queueItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8">
                              No queue items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          queueItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.status}</TableCell>
                              <TableCell>
                                {new Date(item.created_at).toLocaleString()}
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