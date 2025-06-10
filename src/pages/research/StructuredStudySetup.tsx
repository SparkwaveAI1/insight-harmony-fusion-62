
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowLeft, ArrowRight, Save, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { DefineStudyGoals, StudyGoal } from "@/components/research/structured/DefineStudyGoals";
import { SelectResearchFormat, ResearchFormat } from "@/components/research/structured/SelectResearchFormat";
import { DefineAudience, AudienceDefinition } from "@/components/research/structured/DefineAudience";
import { DefineOutputGoals, OutputGoalsData } from "@/components/research/structured/DefineOutputGoals";
import { structuredStudyService } from "@/services/structuredStudy/structuredStudyService";
import { toast } from "sonner";

const StructuredStudySetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [studyGoal, setStudyGoal] = useState<StudyGoal | null>(null);
  const [researchFormat, setResearchFormat] = useState<ResearchFormat | null>(null);
  const [audience, setAudience] = useState<AudienceDefinition | null>(null);
  const [outputGoals, setOutputGoals] = useState<OutputGoalsData | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

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
        if (session.audience_definition) setAudience(session.audience_definition);
        if (session.output_goals) setOutputGoals(session.output_goals);
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
        audience_definition: audience,
        output_goals: outputGoals,
        title: studyGoal?.objective ? `Study: ${studyGoal.objective.substring(0, 50)}...` : 'Untitled Study',
        ...updates
      };

      if (currentSessionId) {
        await structuredStudyService.updateSession(currentSessionId, sessionData);
      } else {
        const newSession = await structuredStudyService.createSession(sessionData);
        if (newSession) {
          setCurrentSessionId(newSession.id);
          // Update URL with session ID
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

  const handleGoalDefined = (goal: StudyGoal) => {
    setStudyGoal(goal);
    setCurrentStep(2);
    saveSession({ study_goal: goal, current_step: 2 });
  };

  const handleFormatSelected = (format: ResearchFormat) => {
    setResearchFormat(format);
    setCurrentStep(3);
    saveSession({ research_format: format, current_step: 3 });
  };

  const handleAudienceDefined = (audienceDefinition: AudienceDefinition) => {
    setAudience(audienceDefinition);
    setCurrentStep(4);
    saveSession({ audience_definition: audienceDefinition, current_step: 4 });
  };

  const handleOutputGoalsDefined = (goals: OutputGoalsData) => {
    setOutputGoals(goals);
    setCurrentStep(5);
    saveSession({ output_goals: goals, current_step: 5 });
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    saveSession({ current_step: newStep });
  };

  const steps = [
    { number: 1, title: "Study Goals", description: "Define your research goals and objectives" },
    { number: 2, title: "Research Format", description: "Select the format that matches your study" },
    { number: 3, title: "Audience", description: "Define your target audience and select personas" },
    { number: 4, title: "Output Goals", description: "Define insights and deliverables" },
    { number: 5, title: "Review + Launch", description: "Review configuration and launch" }
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
                            // Allow navigation to completed steps or current step
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
                      <DefineStudyGoals onGoalDefined={handleGoalDefined} />
                    )}

                    {currentStep === 2 && (
                      <SelectResearchFormat onFormatSelected={handleFormatSelected} />
                    )}

                    {currentStep === 3 && (
                      <DefineAudience onAudienceDefined={handleAudienceDefined} initialAudience={audience} />
                    )}

                    {currentStep === 4 && (
                      <DefineOutputGoals onGoalsDefined={handleOutputGoalsDefined} />
                    )}

                    {currentStep === 5 && (
                      <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Review & Launch</h2>
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-medium text-green-800 mb-2">Study Goal</h3>
                            <p className="text-green-700 text-sm">{studyGoal?.objective}</p>
                          </div>
                          {researchFormat && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h3 className="font-medium text-blue-800 mb-2">Research Format</h3>
                              <p className="text-blue-700 text-sm">{researchFormat.description}</p>
                              <p className="text-blue-600 text-xs mt-1">{researchFormat.persona_count}</p>
                            </div>
                          )}
                          {audience && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <h3 className="font-medium text-purple-800 mb-2">Target Audience</h3>
                              <p className="text-purple-700 text-sm">{audience.target_description}</p>
                              <p className="text-purple-600 text-xs mt-1">{audience.selected_personas.length} personas selected</p>
                            </div>
                          )}
                          {outputGoals && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <h3 className="font-medium text-amber-800 mb-2">Output Goals</h3>
                              <p className="text-amber-700 text-sm">{outputGoals.primary_goals.join(', ')}</p>
                              <p className="text-amber-600 text-xs mt-1">
                                {outputGoals.deliverables.length} deliverables • {outputGoals.timeline}
                                {outputGoals.project_id && " • Associated with project"}
                              </p>
                            </div>
                          )}
                          <div className="bg-muted/30 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Study launch functionality will be implemented next</p>
                          </div>
                        </div>
                      </Card>
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
                    
                    <Button
                      onClick={() => handleStepChange(Math.min(5, currentStep + 1))}
                      disabled={
                        (currentStep === 1 && !studyGoal) ||
                        (currentStep === 2 && !researchFormat) ||
                        (currentStep === 3 && !audience) ||
                        (currentStep === 4 && !outputGoals) ||
                        currentStep === 5
                      }
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
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

export default StructuredStudySetup;
