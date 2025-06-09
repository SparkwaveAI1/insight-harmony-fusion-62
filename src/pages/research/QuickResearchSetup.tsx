
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { PersonaLoader } from "@/components/research/PersonaLoader";
import { toast } from "sonner";

const QuickResearchSetup = () => {
  const [objective, setObjective] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();

  const handleStartSession = async (personas: string[]) => {
    if (!objective.trim()) {
      toast.error("Please define your research objective first");
      return;
    }

    setSelectedPersonas(personas);
    setIsStarting(true);

    try {
      // Store the session data and navigate to the focus group interface
      const sessionData = {
        objective: objective.trim(),
        personas: personas,
        type: 'quick_research'
      };
      
      // Store in sessionStorage for the research interface to pick up
      sessionStorage.setItem('quickResearchSession', JSON.stringify(sessionData));
      
      toast.success("Starting your research session...");
      navigate('/focus-group');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error("Failed to start research session");
      setIsStarting(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 min-h-0">
              <div className="container h-full flex flex-col">
                <div className="flex items-center justify-between mb-8 pt-24 flex-shrink-0">
                  <SidebarTrigger className="hidden md:flex" />
                </div>
                
                <div className="flex-1 max-w-4xl mx-auto w-full">
                  <div className="mb-6">
                    <Link to="/research">
                      <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Research
                      </Button>
                    </Link>
                  </div>

                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-4">
                      <Sparkles className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-medium text-primary">Quick Research</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-plasmik">Quick Research Setup</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Start a casual conversation with up to 4 personas for quick feedback and ideation
                    </p>
                  </div>

                  <div className="space-y-6">
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Step 1: Define Objective</h2>
                      <p className="text-muted-foreground mb-4">
                        What would you like to learn from this research session?
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="objective">Research Objective</Label>
                        <Textarea
                          id="objective"
                          placeholder="e.g., Get feedback on our new product concept, understand user pain points with our current service, explore reactions to a marketing campaign..."
                          value={objective}
                          onChange={(e) => setObjective(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Step 2: Choose Personas</h2>
                      <p className="text-muted-foreground mb-4">
                        Select up to 4 personas to participate in your research session.
                      </p>
                      <PersonaLoader
                        maxPersonas={4}
                        onStartSession={handleStartSession}
                        isLoading={isStarting}
                      />
                    </Card>
                  </div>
                </div>
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

export default QuickResearchSetup;
