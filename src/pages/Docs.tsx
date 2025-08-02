import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Card from "@/components/ui-custom/Card";
import Section from "@/components/ui-custom/Section";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserPlus,
  FlaskConical,
  Briefcase,
  Folder,
  BookOpen,
  ChevronRight,
  Target,
  MessageSquare,
  BarChart3,
  Lightbulb,
  ArrowRight,
  FileText,
  Settings,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  Star,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("overview");
  
  // Refs for each section
  const overviewRef = useRef<HTMLElement>(null);
  const workflowRef = useRef<HTMLElement>(null);
  const createPersonasRef = useRef<HTMLElement>(null);
  const personaLibraryRef = useRef<HTMLElement>(null);
  const researchToolsRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const collectionsRef = useRef<HTMLElement>(null);
  const tipsRef = useRef<HTMLElement>(null);

  const handleNavClick = (sectionId: string, ref: React.RefObject<HTMLElement>) => {
    setActiveSection(sectionId);
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Intersection Observer for active section tracking
  useEffect(() => {
    const sections = [
      { id: "overview", ref: overviewRef },
      { id: "workflow", ref: workflowRef },
      { id: "create-personas", ref: createPersonasRef },
      { id: "persona-library", ref: personaLibraryRef },
      { id: "research-tools", ref: researchToolsRef },
      { id: "projects", ref: projectsRef },
      { id: "collections", ref: collectionsRef },
      { id: "tips", ref: tipsRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setActiveSection(sectionId);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      sections.forEach(({ ref }) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  const navigationItems = [
    { id: "overview", label: "Overview", ref: overviewRef, icon: BookOpen },
    { id: "workflow", label: "Quick Start Workflow", ref: workflowRef, icon: Target },
    { id: "create-personas", label: "Create Personas", ref: createPersonasRef, icon: UserPlus },
    { id: "persona-library", label: "Persona Library", ref: personaLibraryRef, icon: Users },
    { id: "research-tools", label: "Research Tools", ref: researchToolsRef, icon: FlaskConical },
    { id: "projects", label: "Projects", ref: projectsRef, icon: Briefcase },
    { id: "collections", label: "Collections", ref: collectionsRef, icon: Folder },
    { id: "tips", label: "Best Practices", ref: tipsRef, icon: Lightbulb },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                  <SidebarTrigger className="hidden md:flex" />
                  <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard">
                        <ArrowRight className="h-4 w-4" />
                        Back to Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Sticky Navigation Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-32 space-y-2">
                      <Card className="p-4">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          User Guide
                        </h3>
                        <nav className="space-y-1">
                          {navigationItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleNavClick(item.id, item.ref)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                activeSection === item.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </button>
                          ))}
                        </nav>
                      </Card>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-3 space-y-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                      <h1 className="text-4xl font-bold mb-4 gradient-text">
                        PersonaAI User Guide
                      </h1>
                      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Master the art of AI-powered qualitative research with our comprehensive guide to PersonaAI's powerful features.
                      </p>
                    </div>

                    {/* Overview Section */}
                    <section id="overview" ref={overviewRef} className="w-full py-8 md:py-12">
                      <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <BookOpen className="h-6 w-6 text-primary" />
                          <h2 className="text-3xl font-bold">Overview</h2>
                        </div>
                        <p className="text-lg text-muted-foreground mb-6">
                          PersonaAI is a comprehensive platform for conducting qualitative research using AI-powered personas. 
                          Create behaviorally realistic personas, organize them into collections, and conduct advanced research 
                          through interviews and surveys.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <Card className="p-6 border-2">
                            <div className="flex items-center gap-3 mb-4">
                              <Users className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">Persona Creation</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Build detailed AI personas with demographic traits, personality profiles, and behavioral patterns.
                            </p>
                          </Card>
                          
                          <Card className="p-6 border-2">
                            <div className="flex items-center gap-3 mb-4">
                              <FlaskConical className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">Research Tools</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Use our Insight Engine for automated qualitative research. Submit multiple queries simultaneously to a group of personas, or conduct 1-on-1 real time chats to gain insights.
                            </p>
                          </Card>
                        </div>
                      </Card>
                    </section>

                    {/* Quick Start Workflow */}
                    <section id="workflow" ref={workflowRef} className="w-full py-8 md:py-12">
                      <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Target className="h-6 w-6 text-primary" />
                          <h2 className="text-3xl font-bold">Quick Start Workflow</h2>
                        </div>
                        
                        <div className="bg-primary/5 rounded-lg p-6 mb-8">
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            Recommended Workflow (TLDR)
                          </h3>
                          <ol className="space-y-3">
                            <li className="flex items-start gap-3">
                              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">1</span>
                              <span><strong>Create your own personas</strong> or use personas in the Public Library</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">2</span>
                              <span><strong>Organize with Collections:</strong> Group personas by research themes or demographics</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">3</span>
                              <span><strong>Set Up a Project:</strong> Create research projects for organized data analysis</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">4</span>
                              <span><strong>Add Collection(s):</strong> Group personas by themes for easy access in your Project</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">5</span>
                              <span><strong>Choose Research Mode:</strong> Use Insights Engine for broad analysis, 1-on-1 for deep dives</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">6</span>
                              <span><strong>Analyze Results:</strong> Review reports and insights for actionable findings</span>
                            </li>
                          </ol>
                        </div>

                        <div className="flex gap-4">
                          <Button asChild>
                            <Link to="/simulated-persona">
                              Start Creating Personas
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to="/dashboard">
                              Go to Dashboard
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    </section>

                    {/* Create Personas */}
                    <section id="create-personas" ref={createPersonasRef} className="w-full py-8 md:py-12">
                      <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <UserPlus className="h-6 w-6 text-primary" />
                          <h2 className="text-3xl font-bold">Create Personas</h2>
                        </div>
                        
                        <div className="mb-8">
                          <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
                          <p className="text-muted-foreground mb-4">
                            Navigate to <strong>"Create a Persona"</strong> from the sidebar or dashboard to begin building AI personas.
                          </p>
                          <Button asChild variant="outline" size="sm">
                            <Link to="/simulated-persona">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Create a Persona
                            </Link>
                          </Button>
                        </div>

                        <Separator className="my-8" />

                        <div className="space-y-8">
                          <div>
                            <h3 className="text-xl font-semibold mb-4">Persona Creation Process</h3>
                            <div className="space-y-6">
                              <Card className="p-6 border-l-4 border-l-primary">
                                <h4 className="font-semibold mb-2">Structured Generation</h4>
                                <p className="text-muted-foreground">
                                  Use demographic inputs and trait profiles to generate behavioral-realistic personas.
                                </p>
                              </Card>
                              
                              <Card className="p-6 border-l-4 border-l-primary">
                                <h4 className="font-semibold mb-2">Interview-Based Creation</h4>
                                <p className="text-muted-foreground">
                                  Build personas through structured conversations with our AI Persona chat to capture key details 
                                  regarding demographics, personality traits, emotional triggers, language use, and more.
                                </p>
                              </Card>
                              
                              <Card className="p-6 border-l-4 border-l-primary">
                                <h4 className="font-semibold mb-2">AI-Powered Generation</h4>
                                <p className="text-muted-foreground mb-3">
                                  The system uses advanced AI to create comprehensive personas with:
                                </p>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                  <li>• Demographic information (age, occupation, region)</li>
                                  <li>• Personality traits (Big Five model)</li>
                                  <li>• Behavioral patterns and emotional triggers</li>
                                  <li>• Interview responses and knowledge domains</li>
                                  <li>• Visual representation (profile images can be generated)</li>
                                </ul>
                              </Card>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold mb-4">Persona Enhancement</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                              <Card className="p-4 text-center">
                                <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <h4 className="font-medium mb-1">Enhancement Options</h4>
                                <p className="text-sm text-muted-foreground">
                                  Improve existing personas with additional traits and triggers
                                </p>
                              </Card>
                              
                              <Card className="p-4 text-center">
                                <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <h4 className="font-medium mb-1">Create Profile Images</h4>
                                <p className="text-sm text-muted-foreground">
                                  Generate visual representations for your personas
                                </p>
                              </Card>
                              
                              <Card className="p-4 text-center">
                                <Share2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <h4 className="font-medium mb-1">Visibility Controls</h4>
                                <p className="text-sm text-muted-foreground">
                                  Set personas as public or private
                                </p>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </section>

                    {/* Persona Library */}
                    <section id="persona-library" ref={personaLibraryRef} className="w-full py-8 md:py-12">
                      <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Users className="h-6 w-6 text-primary" />
                          <h2 className="text-3xl font-bold">Persona Library</h2>
                        </div>
                        
                        <Button asChild variant="outline" size="sm" className="mb-6">
                          <Link to="/persona-viewer">
                            <Users className="h-4 w-4 mr-2" />
                            View Persona Library
                          </Link>
                        </Button>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-xl font-semibold mb-4">My Personas Tab</h3>
                            <ul className="space-y-2 text-muted-foreground">
                              <li className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View all your created personas
                              </li>
                              <li className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filter by tags, age, region, income, and source type
                              </li>
                              <li className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search functionality for quick persona discovery
                              </li>
                              <li className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edit, enhance, or delete personas
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-semibold mb-4">Public Personas Tab</h3>
                            <ul className="space-y-2 text-muted-foreground">
                              <li className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Browse community-shared personas
                              </li>
                              <li className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Discover personas created by other users
                              </li>
                              <li className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Use public personas in your research projects
                              </li>
                              <li className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                View detailed persona profiles and traits
                              </li>
                            </ul>
                          </div>
                        </div>

                        <Separator className="my-8" />

                        <div>
                          <h3 className="text-xl font-semibold mb-4">Advanced Features</h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <Card className="p-4">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filter System
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Multi-dimensional filtering by tags, demographics, and traits
                              </p>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Full-Text Search
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Search across persona names, descriptions, and metadata
                              </p>
                            </Card>
                          </div>
                        </div>
                      </Card>
                    </section>

                    {/* Research Tools */}
                    <section id="research-tools" ref={researchToolsRef} className="w-full py-8 md:py-12">
                      <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <FlaskConical className="h-6 w-6 text-primary" />
                          <h2 className="text-3xl font-bold">Research Tools</h2>
                        </div>
                        
                        <Button asChild variant="outline" size="sm" className="mb-8">
                          <Link to="/research">
                            <FlaskConical className="h-4 w-4 mr-2" />
                            Start Research
                          </Link>
                        </Button>

                        <div className="space-y-12">
                          {/* Insights Engine */}
                          <div>
                            <Card className="p-6 bg-primary/5 border-primary/20">
                              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="h-6 w-6 text-primary" />
                                A. Insights Engine (Survey Mode)
                              </h3>
                              <p className="text-muted-foreground mb-6">
                                <strong>Purpose:</strong> Automated AI-powered research tool for structured analysis across multiple personas
                              </p>
                              
                              <div className="mb-6">
                                <h4 className="font-semibold mb-3">How It Works:</h4>
                                <ol className="space-y-2 ml-4">
                                  <li className="flex items-start gap-2">
                                    <span className="text-primary font-medium">1.</span>
                                    <span><strong>Project Selection:</strong> Choose or create a research project</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-primary font-medium">2.</span>
                                    <div>
                                      <strong>Survey Setup:</strong>
                                      <ul className="ml-4 mt-1 space-y-1 text-sm text-muted-foreground">
                                        <li>• Enter research questions or upload custom question sets</li>
                                        <li>• Attach documents or images</li>
                                        <li>• Choose multiple personas for comprehensive analysis</li>
                                      </ul>
                                    </div>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-primary font-medium">3.</span>
                                    <span><strong>Automated Execution:</strong> The AI conducts surveys with each selected persona</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-primary font-medium">4.</span>
                                    <span><strong>Results Generation:</strong> Receive structured reports with insights, patterns, and recommendations</span>
                                  </li>
                                </ol>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Key Features:</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                      Multi-persona simultaneous surveying
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                      AI-generated insights and pattern recognition
                                    </li>
                                  </ul>
                                  <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                      Structured reporting with visual data
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                      Export capabilities for further analysis
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </Card>
                          </div>

                          {/* 1-on-1 Interview Mode */}
                          <div>
                            <Card className="p-6 bg-secondary/5 border-secondary/20">
                              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                <MessageSquare className="h-6 w-6 text-secondary" />
                                B. 1-on-1 Interview Mode
                              </h3>
                              <p className="text-muted-foreground mb-6">
                                <strong>Purpose:</strong> Deep conversational research with individual personas
                              </p>
                              
                              <div className="mb-6">
                                <h4 className="font-semibold mb-3">How It Works:</h4>
                                <ol className="space-y-2 ml-4">
                                  <li className="flex items-start gap-2">
                                    <span className="text-secondary font-medium">1.</span>
                                    <span>Select a persona from your library</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-secondary font-medium">2.</span>
                                    <span>Start an open-ended conversation</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-secondary font-medium">3.</span>
                                    <span>Attach documents or images as desired</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-secondary font-medium">4.</span>
                                    <span>Ask questions, explore attitudes, and dive deep into decision-making processes</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-secondary font-medium">5.</span>
                                    <span>Maintain conversation history for reference</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-secondary font-medium">6.</span>
                                    <span>Save conversations to projects for organization</span>
                                  </li>
                                </ol>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Best Practices:</h4>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-secondary" />
                                    Use for qualitative insights and exploratory research
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-secondary" />
                                    Great for understanding motivations and thought processes
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-secondary" />
                                    Ideal for concept testing and feedback gathering
                                  </li>
                                </ul>
                              </div>
                            </Card>
                          </div>
                        </div>
                      </Card>
                    </section>

                    {/* Projects */}
                    <section id="projects" ref={projectsRef} className="w-full py-8 md:py-12">
                      <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Briefcase className="h-6 w-6 text-primary" />
                          <h2 className="text-3xl font-bold">Projects</h2>
                        </div>
                        
                        <Button asChild variant="outline" size="sm" className="mb-8">
                          <Link to="/projects">
                            <Briefcase className="h-4 w-4 mr-2" />
                            View Projects
                          </Link>
                        </Button>

                        <div className="space-y-8">
                          <div>
                            <h3 className="text-xl font-semibold mb-4">Project Management</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Briefcase className="h-4 w-4" />
                                  Create Projects
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Organize research by themes, campaigns, or objectives
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Project Details
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Add descriptions, methodologies, and research objectives
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Conversation Organization
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Group related research sessions and interviews
                                </p>
                              </Card>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold mb-4">Project Features</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                              <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                  <Folder className="h-4 w-4 text-primary" />
                                  <span><strong>Collections Integration:</strong> Link persona collections to projects</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span><strong>Research History:</strong> Track all conversations and survey sessions</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <Upload className="h-4 w-4 text-primary" />
                                  <span><strong>Document Storage:</strong> Upload and manage research-related documents</span>
                                </li>
                              </ul>
                              
                              <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  <span><strong>Knowledge Base:</strong> Build context-aware research with document integration</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <Share2 className="h-4 w-4 text-primary" />
                                  <span><strong>Collaboration:</strong> Share project insights and maintain research continuity</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold mb-4">Project Dashboard</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <Card className="p-4 border-l-4 border-l-primary">
                                <h4 className="font-semibold mb-2">Research Overview</h4>
                                <p className="text-sm text-muted-foreground">
                                  View all conversations and research sessions in one place
                                </p>
                              </Card>
                              
                              <Card className="p-4 border-l-4 border-l-primary">
                                <h4 className="font-semibold mb-2">Performance Metrics</h4>
                                <p className="text-sm text-muted-foreground">
                                  Track engagement and generate comprehensive reports
                                </p>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </section>

                    {/* Collections */}
                    <section id="collections" ref={collectionsRef} className="w-full py-8 md:py-12">
                      <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Folder className="h-6 w-6 text-primary" />
                          <h2 className="text-3xl font-bold">Collections</h2>
                        </div>
                        
                        <Button asChild variant="outline" size="sm" className="mb-8">
                          <Link to="/collections">
                            <Folder className="h-4 w-4 mr-2" />
                            View Collections
                          </Link>
                        </Button>

                        <div className="space-y-8">
                          <div>
                            <h3 className="text-xl font-semibold mb-4">Collection Management</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Folder className="h-4 w-4" />
                                  Create Collections
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Group personas by themes, demographics, or research purposes
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Settings className="h-4 w-4" />
                                  Organization
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Use collections to organize personas for specific research projects
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Search className="h-4 w-4" />
                                  Search and Filter
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Find collections quickly with search and filtering options
                                </p>
                              </Card>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold mb-4">Use Cases</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <Card className="p-4 border-l-4 border-l-blue-500">
                                  <h4 className="font-semibold mb-2">Demographic Segments</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Create collections for specific age groups, regions, or occupations
                                  </p>
                                </Card>
                                
                                <Card className="p-4 border-l-4 border-l-green-500">
                                  <h4 className="font-semibold mb-2">Research Themes</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Group personas relevant to specific research topics
                                  </p>
                                </Card>
                              </div>
                              
                              <div className="space-y-4">
                                <Card className="p-4 border-l-4 border-l-purple-500">
                                  <h4 className="font-semibold mb-2">Campaign Testing</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Assemble target audience groups for marketing research
                                  </p>
                                </Card>
                                
                                <Card className="p-4 border-l-4 border-l-orange-500">
                                  <h4 className="font-semibold mb-2">Behavioral Profiles</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Collect personas with similar psychological traits
                                  </p>
                                </Card>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </section>

                    {/* Best Practices */}
                    <section id="tips" ref={tipsRef} className="w-full py-8 md:py-12">
                      <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <Lightbulb className="h-6 w-6 text-primary" />
                          <h2 className="text-3xl font-bold">Best Practices & Navigation Tips</h2>
                        </div>
                        
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-xl font-semibold mb-4">Best Practices</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                              <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                  <Star className="h-4 w-4 text-primary mt-1" />
                                  <span><strong>Quality over Quantity:</strong> Focus on creating detailed, accurate personas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Settings className="h-4 w-4 text-primary mt-1" />
                                  <span><strong>Regular Enhancement:</strong> Use enhancement features to improve persona depth</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Briefcase className="h-4 w-4 text-primary mt-1" />
                                  <span><strong>Project Organization:</strong> Keep research organized with clear project structures</span>
                                </li>
                              </ul>
                              
                              <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                  <BookOpen className="h-4 w-4 text-primary mt-1" />
                                  <span><strong>Documentation:</strong> Use the knowledge base features for context-rich research</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Target className="h-4 w-4 text-primary mt-1" />
                                  <span><strong>Iterative Approach:</strong> Build on previous research findings progressively</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold mb-4">Integration Features</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <ArrowRight className="h-4 w-4" />
                                  Seamless Navigation
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Sidebar navigation for quick access to all features
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Settings className="h-4 w-4" />
                                  Cross-Platform Functionality
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  All features work together cohesively
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Data Persistence
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  All work is automatically saved and retrievable
                                </p>
                              </Card>
                              
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Download className="h-4 w-4" />
                                  Export Capabilities
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Extract data and insights for external use
                                </p>
                              </Card>
                            </div>
                          </div>

                          <div className="bg-primary/5 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Ready to Get Started?
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              This guide covers the complete workflow from persona creation through advanced research analysis. 
                              The application provides a comprehensive suite of tools for AI-powered qualitative research, 
                              with each component designed to work seamlessly together.
                            </p>
                            <div className="flex gap-4">
                              <Button asChild>
                                <Link to="/dashboard">
                                  Go to Dashboard
                                  <ChevronRight className="h-4 w-4 ml-2" />
                                </Link>
                              </Button>
                              <Button variant="outline" asChild>
                                <Link to="/simulated-persona">
                                  Create Your First Persona
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </section>
                  </div>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Docs;