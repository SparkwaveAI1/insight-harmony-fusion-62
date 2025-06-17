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
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import PersonaAIInterviewer from "./pages/PersonaAIInterviewer";
import AIFocusGroups from "./pages/AIFocusGroups";
import SimulatedPersona from "./pages/SimulatedPersona";
import CustomResearch from "./pages/CustomResearch";
import InsightConductor from "./pages/InsightConductor";
import Research from "./pages/Research";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import Contact from "./pages/Contact";
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

import { ProtectedRoute } from "./components/auth/ProtectedRoute";

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
              {/* Public Routes - Accessible without login */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sign-in" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* PRSNA token routes - public access */}
              <Route path="/prsna-ecosystem" element={<PRSNAEcosystem />} />
              <Route path="/prsna" element={<EarnPRSNA />} />
              <Route path="/prsna/roadmap" element={<Roadmap />} />
              <Route path="/prsna/whitepaper" element={<WhitePaper />} />
              <Route path="/whitepaper" element={<WhitePaper />} />
              
              {/* User Profile Route */}
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              
              {/* Protected Routes - Require authentication */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/persona-viewer" element={<ProtectedRoute><PersonaViewer /></ProtectedRoute>} />
              <Route path="/persona/:personaId" element={<ProtectedRoute><PersonaDetail /></ProtectedRoute>} />
              <Route path="/persona-detail/:personaId" element={<ProtectedRoute><PersonaDetail /></ProtectedRoute>} />
              <Route path="/persona/:personaId/chat" element={<ProtectedRoute><PersonaChat /></ProtectedRoute>} />
              <Route path="/your-persona" element={<ProtectedRoute><YourPersona /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
              <Route path="/conversations/:conversationId" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
              <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
              
              {/* IMPORTANT: Add support for both URL formats to avoid breaking existing links */}
              <Route path="/collections/:collectionId" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
              <Route path="/collection/:collectionId" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
              
              {/* Research section - Protected */}
              <Route path="/interviewer" element={<ProtectedRoute><Interviewer /></ProtectedRoute>} />
              <Route path="/persona-ai-interviewer" element={<ProtectedRoute><PersonaAIInterviewer /></ProtectedRoute>} />
              <Route path="/ai-focus-groups" element={<ProtectedRoute><AIFocusGroups /></ProtectedRoute>} />
              <Route path="/simulated-persona" element={<ProtectedRoute><SimulatedPersona /></ProtectedRoute>} />
              <Route path="/custom-research" element={<ProtectedRoute><CustomResearch /></ProtectedRoute>} />
              <Route path="/insight-conductor" element={<ProtectedRoute><InsightConductor /></ProtectedRoute>} />
              <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
              <Route path="/participate" element={<ProtectedRoute><ParticipateResearch /></ProtectedRoute>} />
              <Route path="/interview-process" element={<ProtectedRoute><InterviewProcess /></ProtectedRoute>} />
              
              {/* Persona Creation Flow - Protected */}
              <Route path="/create" element={<ProtectedRoute><PersonaCreationLanding /></ProtectedRoute>} />
              <Route path="/consent" element={<ProtectedRoute><ConsentForm /></ProtectedRoute>} />
              <Route path="/screener" element={<ProtectedRoute><PersonaCreationScreener /></ProtectedRoute>} />
              <Route path="/questionnaire" element={<ProtectedRoute><PersonaCreationQuestionnaire /></ProtectedRoute>} />
              <Route path="/complete" element={<ProtectedRoute><PersonaCreationComplete /></ProtectedRoute>} />
              
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
