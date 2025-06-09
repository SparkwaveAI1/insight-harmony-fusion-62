
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

const StructuredStudySetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [studyGoal, setStudyGoal] = useState<StudyGoal | null>(null);

  const handleGoalDefined = (goal: StudyGoal) => {
    setStudyGoal(goal);
    setCurrentStep(2);
  };

  const steps = [
    { number: 1, title: "Study Type", description: "Define your research goals and objectives" },
    { number: 2, title: "Audience", description: "Define your target audience and select personas" },
    { number: 3, title: "Format", description: "Choose research format and methodology" },
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
                      <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Audience Definition</h2>
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-medium text-green-800 mb-2">Study Goal</h3>
                            <p className="text-green-700 text-sm">{studyGoal?.objective}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Audience definition will be implemented next</p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {currentStep > 2 && (
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
                      disabled={currentStep === 1 && !studyGoal}
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
