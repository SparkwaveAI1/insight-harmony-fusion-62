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
import { addToQueue, getQueueItems, updateQueueStatus } from "@/services/personaQueueService";
import { useToast } from "@/hooks/use-toast";
import { createV4PersonaCall1, createV4PersonaCall2, createV4PersonaCall3 } from "@/services/v4-persona/createV4Persona";

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
      await addToQueue(
        user.id,
        'Queued Persona',
        textareaContent.trim()
      );
      toast({
        title: "Success",
        description: "Added to queue",
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

    try {
      setProcessing(true);
      
      // Find the first pending item
      const pendingItem = queueItems.find(item => item.status === 'pending');
      if (!pendingItem) {
        toast({
          title: "No Items",
          description: "No pending items to process",
        });
        return;
      }

      // Update status to processing
      await updateQueueStatus(pendingItem.id, 'processing');
      loadQueueItems(); // Refresh to show processing status

      // Generate persona using V4 system (3-step process)
      // Step 1: Create initial persona with detailed traits
      const call1Result = await createV4PersonaCall1({
        user_prompt: pendingItem.description,
        user_id: user.id
      });
      
      if (!call1Result.success || !call1Result.persona_id) {
        throw new Error('Failed at persona creation step 1');
      }

      // Step 2: Generate conversation summaries
      await updateQueueStatus(pendingItem.id, 'processing_stage2');
      const call2Result = await createV4PersonaCall2(call1Result.persona_id);
      
      if (!call2Result.success) {
        throw new Error('Failed at persona creation step 2');
      }

      // Step 3: Generate profile image
      await updateQueueStatus(pendingItem.id, 'processing_stage3');
      const call3Result = await createV4PersonaCall3(call1Result.persona_id, true);
      
      if (!call3Result.success) {
        console.warn('Image generation failed, but persona created successfully');
      }

      // Update status to completed
      await updateQueueStatus(pendingItem.id, 'completed');
      toast({
        title: "Success",
        description: `Persona "${call1Result.persona_name}" created successfully`,
      });
      
      loadQueueItems(); // Refresh the list
    } catch (error) {
      console.error('Error processing queue item:', error);
      toast({
        title: "Error",
        description: "Failed to process queue item",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
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