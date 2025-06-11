import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowLeft, ArrowRight, Save, Clock, Rocket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DefineStudyGoals, StudyGoal } from "@/components/research/structured/DefineStudyGoals";
import { SelectResearchFormat, ResearchFormat } from "@/components/research/structured/SelectResearchFormat";
import { DefineAudience } from "@/components/research/structured/DefineAudience";
import { structuredStudyService } from "@/services/structuredStudy/structuredStudyService";
import { toast } from "sonner";
import ProjectSelectionDialog from "@/components/research/ProjectSelectionDialog";

const StructuredStudySetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [studyGoal, setStudyGoal] = useState<StudyGoal | null>(null);
  const [researchFormat, setResearchFormat] = useState<ResearchFormat | null>(null);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  // Load existing session if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  const loadSession = async (id: string) => {
    setIsLoading(true);
    try {
      const session = await structuredStudyService.getSession(id);
      if (session) {
        setCurrentStep(session.current_step);
        if (session.study_goal) setStudyGoal(session.study_goal);
        if (session.research_format) setResearchFormat(session.research_format);
        if (session.audience_definition?.selected_personas) {
          setSelectedPersonas(session.audience_definition.selected_personas);
        }
        if (session.output_goals?.project_id) {
          setSelectedProjectId(session.output_goals.project_id);
        }
        toast.success("Session loaded successfully");
      } else {
        toast.error("Session not found");
        navigate('/research/setup/structured');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error("Failed to load session");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = async (updates: any = {}) => {
    setAutoSaving(true);
    try {
      const sessionData = {
        current_step: currentStep,
        study_goal: studyGoal,
        research_format: researchFormat,
        audience_definition: { selected_personas: selectedPersonas },
        title: studyGoal?.objective ? `Study: ${studyGoal.objective.substring(0, 50)}...` : 'Untitled Study',
        ...updates
      };

      if (currentSessionId) {
        await structuredStudyService.updateSession(currentSessionId, sessionData);
      } else {
        const newSession = await structuredStudyService.createSession(sessionData);
        if (newSession) {
          setCurrentSessionId(newSession.id);
          const newSearchParams = new URLSearchParams();
          newSearchParams.set('session', newSession.id);
          navigate(`/research/setup/structured?${newSearchParams.toString()}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleProjectSelected = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    setCurrentStep(2);
    saveSession({ current_step: 2 });
  };

  const handleGoalDefined = (goal: StudyGoal) => {
    setStudyGoal(goal);
    setCurrentStep(3);
    saveSession({ study_goal: goal, current_step: 3 });
  };

  const handleFormatSelected = (format: ResearchFormat) => {
    setResearchFormat(format);
    // Skip directly to persona selection for group discussion
    if (format.format_type === 'group_discussion') {
      setCurrentStep(4);
      saveSession({ research_format: format, current_step: 4 });
    }
  };

  const handlePersonasSelected = async (personas: string[]) => {
    setSelectedPersonas(personas);
    
    // Auto-launch the study when personas are selected
    if (!studyGoal || !researchFormat || !currentSessionId) {
      toast.error("Please complete all steps before launching");
      return;
    }

    setIsLaunching(true);
    try {
      await structuredStudyService.updateSession(currentSessionId, {
        audience_definition: { selected_personas: personas },
        status: 'completed'
      });

      // Store session data for the focus group
      const researchData = {
        personas: personas,
        objective: studyGoal.objective,
        projectId: selectedProjectId,
        sessionId: currentSessionId
      };
      sessionStorage.setItem('quickResearchSession', JSON.stringify(researchData));
      
      // Navigate to focus group
      navigate('/focus-group');
      
      toast.success("Study launched! Starting group discussion...");
    } catch (error) {
      console.error('Error launching study:', error);
      toast.error("Failed to launch study");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    saveSession({ current_step: newStep });
  };

  const handleLaunchStudy = async () => {
    if (!studyGoal || !researchFormat || !currentSessionId) {
      toast.error("Please complete all steps before launching");
      return;
    }

    if (!selectedPersonas || selectedPersonas.length === 0) {
      toast.error("Please select at least one persona before launching");
      return;
    }

    setIsLaunching(true);
    try {
      await structuredStudyService.updateSession(currentSessionId, {
        status: 'completed'
      });

      // Store session data for the focus group
      const researchData = {
        personas: selectedPersonas,
        objective: studyGoal.objective,
        projectId: selectedProjectId,
        sessionId: currentSessionId
      };
      sessionStorage.setItem('quickResearchSession', JSON.stringify(researchData));
      
      // Navigate to focus group
      navigate('/focus-group');
      
      toast.success("Study launched! Starting group discussion...");
    } catch (error) {
      console.error('Error launching study:', error);
      toast.error("Failed to launch study");
    } finally {
      setIsLaunching(false);
    }
  };

  const steps = [
    { number: 1, title: "Project Setup", description: "Select or create a project for this study" },
    { number: 2, title: "Study Goals", description: "Define your research goals and objectives" },
    { number: 3, title: "Research Format", description: "Select the format that matches your study" },
    { number: 4, title: "Select Personas", description: "Choose specific personas for your study" }
  ];

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <div className="relative flex min-h-svh flex-col">
              <Header />
              <main className="flex-1 min-h-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading session...</p>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

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
                  
                  {/* Auto-save indicator */}
                  {autoSaving && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 animate-spin" />
                      Auto-saving...
                    </div>
                  )}
                </div>
                
                <div className="flex-1 max-w-4xl mx-auto w-full">
                  <div className="mb-6 flex items-center justify-between">
                    <Link to="/research">
                      <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Research
                      </Button>
                    </Link>
                    
                    {currentSessionId && (
                      <Button variant="outline" onClick={() => saveSession()} disabled={autoSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Progress
                      </Button>
                    )}
                  </div>

                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-4">
                      <FlaskConical className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-medium text-primary">Structured Study</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-plasmik">Structured Study Assistant</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Design a comprehensive market research study with guided setup and structured outputs
                    </p>
                    {currentSessionId && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Session ID: {currentSessionId.substring(0, 8)}...
                      </p>
                    )}
                  </div>

                  {/* Progress Steps */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium cursor-pointer ${
                            step.number === currentStep 
                              ? 'bg-primary text-primary-foreground' 
                              : step.number < currentStep
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          onClick={() => {
                            if (step.number <= currentStep || step.number === currentStep) {
                              handleStepChange(step.number);
                            }
                          }}
                          >
                            {step.number}
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`w-12 h-0.5 mx-2 ${
                              step.number < currentStep ? 'bg-green-500' : 'bg-muted'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <h2 className="text-lg font-semibold">{steps[currentStep - 1].title}</h2>
                      <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="mb-8">
                    {currentStep === 1 && (
                      <Card className="p-6">
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-semibold mb-2">Project Setup</h2>
                          <p className="text-muted-foreground">
                            Associate this study with a project to organize your research and findings.
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <Button 
                            onClick={() => setShowProjectDialog(true)}
                            size="lg"
                            className="px-8"
                          >
                            {selectedProjectId ? 'Change Project' : 'Select or Create Project'}
                          </Button>
                          
                          {selectedProjectId && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground">
                                Project selected • You can continue to the next step
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-6">
                            <Button 
                              variant="outline"
                              onClick={() => handleProjectSelected(null)}
                            >
                              Continue without Project
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    {currentStep === 2 && (
                      <DefineStudyGoals onGoalDefined={handleGoalDefined} />
                    )}

                    {currentStep === 3 && (
                      <SelectResearchFormat onFormatSelected={handleFormatSelected} />
                    )}

                    {currentStep === 4 && (
                      <DefineAudience 
                        onAudienceDefined={handlePersonasSelected} 
                        selectedPersonas={selectedPersonas}
                      />
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    {currentStep < 4 && (
                      <Button
                        onClick={() => handleStepChange(Math.min(4, currentStep + 1))}
                        disabled={
                          (currentStep === 1 && selectedProjectId === undefined) ||
                          (currentStep === 2 && !studyGoal) ||
                          (currentStep === 3 && !researchFormat)
                        }
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>

                  {/* Loading overlay when launching */}
                  {isLaunching && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-lg font-medium">Launching Study...</p>
                        <p className="text-sm text-muted-foreground">Starting group discussion</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </SidebarInset>
      </div>

      {/* Project Selection Dialog */}
      <ProjectSelectionDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onProjectSelected={handleProjectSelected}
      />
    </SidebarProvider>
  );
};

export default StructuredStudySetup;

}
