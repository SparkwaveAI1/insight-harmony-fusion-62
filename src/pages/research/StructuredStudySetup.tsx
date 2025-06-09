
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const StructuredStudySetup = () => {
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

                  <div className="space-y-6">
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Step 1: Study Type</h2>
                      <p className="text-muted-foreground mb-4">
                        Choose the type of research study you want to conduct.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Study type selection will be implemented next</p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Step 2: Audience</h2>
                      <p className="text-muted-foreground mb-4">
                        Define your target audience and select appropriate personas.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Audience definition will be implemented next</p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Step 3: Format</h2>
                      <p className="text-muted-foreground mb-4">
                        Choose the format and methodology for your research study.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Format selection will be implemented next</p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Step 4: Output Goals</h2>
                      <p className="text-muted-foreground mb-4">
                        Define what insights and deliverables you want from this study.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Output goals will be implemented next</p>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Step 5: Review + Launch</h2>
                      <p className="text-muted-foreground mb-4">
                        Review your study configuration and launch the research session.
                      </p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Review and launch will be implemented next</p>
                      </div>
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

export default StructuredStudySetup;
