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
import { addToQueue, getQueueItems, updateQueueStatus, parsePersonaDescription } from "@/services/personaQueueService";
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

  const processNextQueueItem = async () => {
    if (!user || processing) return;

    let pendingItem = null;
    
    try {
      setProcessing(true);
      console.log('🚀 Starting queue processing...');
      
      // Find the first pending item
      pendingItem = queueItems.find(item => item.status === 'pending');
      if (!pendingItem) {
        console.log('❌ No pending items found');
        toast({
          title: "No Items",
          description: "No pending items to process",
        });
        return;
      }
      
      console.log('📝 Processing item:', pendingItem.name, 'ID:', pendingItem.id);

      // Update status to processing
      console.log('🔄 Updating status to processing...');
      await updateQueueStatus(pendingItem.id, 'processing');
      console.log('✅ Status updated to processing');
      loadQueueItems(); // Refresh to show processing status

      // Generate persona using V4 system (3-step process)
      console.log('🎯 Starting V4 persona creation step 1...');
      // Step 1: Create initial persona with detailed traits
      const call1Response = await createV4PersonaCall1({
        user_prompt: pendingItem.description,
        user_id: user.id
      });
      
      console.log('📊 Call 1 response:', call1Response);
      
      if (!call1Response.success || !call1Response.persona_id) {
        console.error('❌ Step 1 failed:', call1Response);
        throw new Error('Failed at persona creation step 1');
      }
      
      console.log('✅ Step 1 completed, persona_id:', call1Response.persona_id);

      // Step 2: Generate conversation summaries
      console.log('🎯 Starting V4 persona creation step 2...');
      await updateQueueStatus(pendingItem.id, 'processing_stage2');
      console.log('✅ Status updated to processing_stage2');
      
      const call2Response = await createV4PersonaCall2(call1Response.persona_id);
      console.log('📊 Call 2 response:', call2Response);
      
      if (!call2Response.success) {
        console.error('❌ Step 2 failed:', call2Response);
        throw new Error('Failed at persona creation step 2');
      }
      
      console.log('✅ Step 2 completed');

      // Step 3: Generate profile image
      console.log('🎯 Starting V4 persona creation step 3...');
      await updateQueueStatus(pendingItem.id, 'processing_stage3');
      console.log('✅ Status updated to processing_stage3');
      
      const call3Response = await createV4PersonaCall3(call2Response.persona_id, true);
      console.log('📊 Call 3 response:', call3Response);
      
      if (!call3Response.success) {
        console.warn('⚠️ Image generation failed, but persona created successfully');
      } else {
        console.log('✅ Step 3 completed');
      }

      // Update status to completed
      console.log('🏁 Updating final status to completed...');
      await updateQueueStatus(pendingItem.id, 'completed');
      console.log('✅ Final status updated to completed');
      
      toast({
        title: "Success",
        description: `Persona "${call1Response.persona_name}" created successfully`,
      });
      
      console.log('🎉 Persona creation completed successfully!');
      
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
      }, 1000); // Small delay to let UI update
      
      loadQueueItems(); // Refresh the list
    } catch (error) {
      console.error('💥 QUEUE PROCESSING ERROR:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        pendingItem: pendingItem?.id,
        pendingItemName: pendingItem?.name
      });
      
      // Try to update status to failed if we have a pending item
      if (pendingItem) {
        try {
          console.log('🔄 Updating status to failed...');
          await updateQueueStatus(pendingItem.id, 'failed');
          console.log('✅ Status updated to failed');
        } catch (statusError) {
          console.error('❌ Failed to update status to failed:', statusError);
        }
      }
      
      toast({
        title: "Error",
        description: "Failed to process queue item",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      console.log('🔚 Queue processing finished');
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