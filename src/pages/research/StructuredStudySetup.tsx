
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DefineStudyGoals, StudyGoal } from "@/components/research/structured/DefineStudyGoals";
import { SelectResearchFormat, ResearchFormat } from "@/components/research/structured/SelectResearchFormat";
import { DefineAudience, AudienceDefinition } from "@/components/research/structured/DefineAudience";

const StructuredStudySetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [studyGoal, setStudyGoal] = useState<StudyGoal | null>(null);
  const [researchFormat, setResearchFormat] = useState<ResearchFormat | null>(null);
  const [audience, setAudience] = useState<AudienceDefinition | null>(null);

  const handleGoalDefined = (goal: StudyGoal) => {
    setStudyGoal(goal);
    setCurrentStep(2);
  };

  const handleFormatSelected = (format: ResearchFormat) => {
    setResearchFormat(format);
    setCurrentStep(3);
  };

  const handleAudienceDefined = (audienceDefinition: AudienceDefinition) => {
    setAudience(audienceDefinition);
    setCurrentStep(4);
  };

  const steps = [
    { number: 1, title: "Study Goals", description: "Define your research goals and objectives" },
    { number: 2, title: "Research Format", description: "Select the format that matches your study" },
    { number: 3, title: "Audience", description: "Define your target audience and select personas" },
    { number: 4, title: "Output Goals", description: "Define insights and deliverables" },
    { number: 5, title: "Review + Launch", description: "Review configuration and launch" }
  ];

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
                      <FlaskConical className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-medium text-primary">Structured Study</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-plasmik">Structured Study Assistant</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Design a comprehensive market research study with guided setup and structured outputs
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                            step.number === currentStep 
                              ? 'bg-primary text-primary-foreground' 
                              : step.number < currentStep
                              ? 'bg-green-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}>
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
                      <DefineAudience onAudienceDefined={handleAudienceDefined} />
                    )}

                    {currentStep === 4 && (
                      <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Output Goals</h2>
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
                          <div className="bg-muted/30 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Output goals definition will be implemented next</p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {currentStep > 4 && (
                      <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">{steps[currentStep - 1].title}</h2>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description} will be implemented next</p>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                      disabled={
                        (currentStep === 1 && !studyGoal) ||
                        (currentStep === 2 && !researchFormat) ||
                        (currentStep === 3 && !audience)
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
