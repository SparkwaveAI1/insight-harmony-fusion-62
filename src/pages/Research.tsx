
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card } from "@/components/ui/card";
import { Sparkles, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Research = () => {
  const navigate = useNavigate();

  const researchModules = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Quick Research Setup",
      description: "Start a casual conversation with up to 4 personas. Great for quick feedback or ideation.",
      path: "/focus-group"
    },
    {
      icon: <FlaskConical className="h-8 w-8 text-primary" />,
      title: "Structured Study Assistant", 
      description: "Design a real market research study step-by-step, with personas, formats, and output goals.",
      path: "/research/setup/structured"
    }
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
                
                <div className="flex-1 max-w-6xl mx-auto w-full">
                  <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 font-plasmik">Research Tools</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Choose your research approach to get insights from AI personas
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {researchModules.map((module, index) => (
                      <Card 
                        key={index}
                        className="p-8 cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group"
                        onClick={() => navigate(module.path)}
                      >
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                            {module.icon}
                          </div>
                          <h3 className="text-xl font-semibold">{module.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {module.description}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-16 text-center">
                    <div className="bg-muted/30 rounded-lg p-8">
                      <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                      <p className="text-muted-foreground max-w-3xl mx-auto">
                        New to AI persona research? Start with <strong>Quick Research Setup</strong> to have a casual conversation with personas. 
                        For more structured insights, try the <strong>Structured Study Assistant</strong>.
                      </p>
                    </div>
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

export default Research;
