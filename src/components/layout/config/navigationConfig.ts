import { 
  User, 
  Users, 
  Library, 
  FlaskConical, 
  PieChart, 
  BookText, 
  Coins, 
  MessageCircle,
  Layers,
  BarChart3,
  FileText,
  Inbox,
  FileQuestion,
  BookOpen,
  LightbulbIcon,
  Sparkles,
  Route as RouteIcon,
  ScrollText
} from "lucide-react";

// Main consolidated navigation - this will be used for the sidebar
export const navigationMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: PieChart,
  },
  {
    title: "My Personas",
    url: "/my-personas",
    icon: User,
  },
  {
    title: "Collections",
    url: "/collections",
    icon: Layers,
  },
  {
    title: "Persona Library",
    url: "/persona-viewer",
    icon: Library,
  },
  {
    title: "Interview",
    url: "/interviewer",
    icon: BookText,
  },
  {
    title: "Research",
    url: "/research",
    icon: FlaskConical,
  },
  {
    title: "$PRSNA Ecosystem",
    url: "/prsna-ecosystem",
    icon: Coins,
  },
];

// Additional navigation items not shown in the main sidebar but needed for other parts of the app
export const additionalRoutes = [
  // Chat and interaction routes
  {
    title: "Persona Chat",
    url: "/persona/:personaId/chat",
    icon: MessageCircle,
  },
  {
    title: "Dual Chat",
    url: "/dual-chat",
    icon: MessageCircle,
  },
  {
    title: "Your Persona",
    url: "/your-persona",
    icon: User,
  },
  
  // Research and insight routes
  {
    title: "Persona AI Interviewer",
    url: "/persona-ai-interviewer",
    icon: BookText,
  },
  {
    title: "AI Focus Groups",
    url: "/ai-focus-groups",
    icon: Users,
  },
  {
    title: "Create Simulated Persona",
    url: "/simulated-persona",
    icon: Sparkles,
  },
  {
    title: "Custom Research",
    url: "/custom-research",
    icon: FileQuestion,
  },
  {
    title: "Insight Conductor",
    url: "/insight-conductor",
    icon: LightbulbIcon,
  },
  
  // Content routes
  {
    title: "Participate in Research",
    url: "/participate",
    icon: Users,
  },
  {
    title: "Interview Process",
    url: "/interview-process",
    icon: BarChart3,
  },
  
  // PRSNA Ecosystem routes
  {
    title: "$PRSNA",
    url: "/prsna",
    icon: Coins,
  },
  {
    title: "Roadmap",
    url: "/prsna/roadmap",
    icon: RouteIcon,
  },
  {
    title: "White Paper",
    url: "/prsna/whitepaper",
    icon: ScrollText,
  },
  
  // Persona creation flow
  {
    title: "Create Persona",
    url: "/create",
    icon: User,
  },
  {
    title: "Consent Form",
    url: "/consent",
    icon: FileText,
  },
  {
    title: "Screener",
    url: "/screener",
    icon: FileQuestion,
  },
  {
    title: "Questionnaire",
    url: "/questionnaire",
    icon: BookOpen,
  },
  {
    title: "Complete",
    url: "/complete",
    icon: Inbox,
  },
  
  // Detail views
  {
    title: "Persona Detail",
    url: "/persona-detail/:personaId",
    icon: User,
  },
  {
    title: "Project Detail",
    url: "/projects/:projectId",
    icon: Layers,
  },
  {
    title: "Collection Detail",
    url: "/collections/:collectionId",
    icon: Layers,
  },
  {
    title: "Conversation Detail",
    url: "/conversations/:conversationId",
    icon: MessageCircle,
  },
];

// Header navigation - simplified subset for the header menu
export const headerNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: PieChart,
  },
  {
    title: "Persona Library",
    href: "/persona-viewer",
    icon: Library,
  },
  {
    title: "$PRSNA",
    href: "/prsna",
    icon: Coins,
  },
];
