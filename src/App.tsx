
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PersonaProvider } from "./context/PersonaProvider";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Index from "./pages/Index";
import PersonaViewer from "./pages/PersonaViewer";
import PersonaChat from "./pages/PersonaChat";
import PersonaDetail from "./pages/PersonaDetail";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ConversationDetail from "./pages/ConversationDetail";
import YourPersona from "./pages/YourPersona";
import Interviewer from "./pages/Interviewer";
import PRSNAEcosystem from "./pages/PRSNAEcosystem";
import MyPersonas from "./pages/MyPersonas";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import PersonaAIInterviewer from "./pages/PersonaAIInterviewer";
import DualChat from "./pages/DualChat";
import AIFocusGroups from "./pages/AIFocusGroups";
import SimulatedPersona from "./pages/SimulatedPersona";
import CustomResearch from "./pages/CustomResearch";
import InsightConductor from "./pages/InsightConductor";
import Research from "./pages/Research";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ParticipateResearch from "./pages/ParticipateResearch";
import InterviewProcess from "./pages/InterviewProcess";
import WhitePaper from "./pages/WhitePaper";
import Roadmap from "./pages/Roadmap";
import EarnPRSNA from "./pages/EarnPRSNA";

// Pages - Persona Creation
import ConsentForm from "./pages/persona-creation/ConsentForm";
import PersonaCreationLanding from "./pages/persona-creation/PersonaCreationLanding";
import PersonaCreationScreener from "./pages/persona-creation/PersonaCreationScreener";
import PersonaCreationQuestionnaire from "./pages/persona-creation/PersonaCreationQuestionnaire";
import PersonaCreationComplete from "./pages/persona-creation/PersonaCreationComplete";

import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PersonaProvider>
            <Routes>
              {/* Main marketing/landing page */}
              <Route path="/" element={<Index />} />
              
              {/* App routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/persona-viewer" element={<PersonaViewer />} />
              <Route path="/persona-detail/:personaId" element={<PersonaDetail />} />
              <Route path="/persona/:personaId/chat" element={<PersonaChat />} />
              <Route path="/dual-chat" element={<DualChat />} />
              <Route path="/your-persona" element={<YourPersona />} />
              <Route path="/my-personas" element={<MyPersonas />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/conversations/:conversationId" element={<ConversationDetail />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:collectionId" element={<CollectionDetail />} />
              
              {/* PRSNA token routes - consolidated section */}
              <Route path="/prsna-ecosystem" element={<PRSNAEcosystem />} />
              <Route path="/prsna" element={<EarnPRSNA />} />
              <Route path="/prsna/roadmap" element={<Roadmap />} />
              <Route path="/prsna/whitepaper" element={<WhitePaper />} />
              
              {/* Research section */}
              <Route path="/interviewer" element={<Interviewer />} />
              <Route path="/persona-ai-interviewer" element={<PersonaAIInterviewer />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sign-in" element={<Auth />} />
              <Route path="/ai-focus-groups" element={<AIFocusGroups />} />
              <Route path="/simulated-persona" element={<SimulatedPersona />} />
              <Route path="/custom-research" element={<CustomResearch />} />
              <Route path="/insight-conductor" element={<InsightConductor />} />
              <Route path="/research" element={<Research />} />
              <Route path="/participate" element={<ParticipateResearch />} />
              <Route path="/interview-process" element={<InterviewProcess />} />
              <Route path="/whitepaper" element={<WhitePaper />} />
              
              {/* Persona Creation Flow */}
              <Route path="/create" element={<PersonaCreationLanding />} />
              <Route path="/consent" element={<ConsentForm />} />
              <Route path="/screener" element={<PersonaCreationScreener />} />
              <Route path="/questionnaire" element={<PersonaCreationQuestionnaire />} />
              <Route path="/complete" element={<PersonaCreationComplete />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" />
          </PersonaProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
