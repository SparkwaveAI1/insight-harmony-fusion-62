
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Auth Provider
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PersonaProvider } from './context/PersonaProvider';

// Pages
import Index from './pages/Index';
import CustomResearch from './pages/CustomResearch';
import EarnPRSNA from './pages/EarnPRSNA';
import PRSNAEcosystem from './pages/PRSNAEcosystem';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Team from './pages/Team';
import NotFound from './pages/NotFound';
import Research from './pages/Research';
import Interviewer from './pages/Interviewer';
import SimulatedPersona from './pages/SimulatedPersona';
import AIFocusGroups from './pages/AIFocusGroups';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import ParticipateResearch from './pages/ParticipateResearch';
import InterviewProcess from './pages/InterviewProcess';
import PersonaViewer from './pages/PersonaViewer';
import PersonaDetail from './pages/PersonaDetail';
import PersonaChat from './pages/PersonaChat';
import DualChat from './pages/DualChat';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MyPersonas from './pages/MyPersonas';
import PersonaLibrary from './pages/PersonaLibrary';

// Persona Creation Pages
import PersonaCreationLanding from './pages/persona-creation/PersonaCreationLanding';
import PersonaCreationScreener from './pages/persona-creation/PersonaCreationScreener';
import ConsentForm from './pages/persona-creation/ConsentForm';
import PersonaCreationQuestionnaire from './pages/persona-creation/PersonaCreationQuestionnaire';
import PersonaCreationComplete from './pages/persona-creation/PersonaCreationComplete';
import YourPersona from './pages/YourPersona';
import PersonaAIInterviewer from './pages/PersonaAIInterviewer';
import InsightConductor from './pages/InsightConductor';

import './App.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PersonaProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/custom-research" element={<CustomResearch />} />
              <Route path="/earn-prsna" element={<EarnPRSNA />} />
              <Route path="/prsna-ecosystem" element={<PRSNAEcosystem />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/team" element={<Team />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
              <Route path="/interviewer" element={<ProtectedRoute><Interviewer /></ProtectedRoute>} />
              <Route path="/simulated-persona" element={<ProtectedRoute><SimulatedPersona /></ProtectedRoute>} />
              <Route path="/ai-focus-groups" element={<ProtectedRoute><AIFocusGroups /></ProtectedRoute>} />
              <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
              <Route path="/collection/:collectionId" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
              <Route path="/participate" element={<ProtectedRoute><ParticipateResearch /></ProtectedRoute>} />
              <Route path="/interview-process" element={<ProtectedRoute><InterviewProcess /></ProtectedRoute>} />
              <Route path="/persona-viewer" element={<ProtectedRoute><PersonaViewer /></ProtectedRoute>} />
              <Route path="/persona-detail/:personaId" element={<ProtectedRoute><PersonaDetail /></ProtectedRoute>} />
              <Route path="/persona-chat/:personaId" element={<ProtectedRoute><PersonaChat /></ProtectedRoute>} />
              <Route path="/dual-chat" element={<ProtectedRoute><DualChat /></ProtectedRoute>} />
              <Route path="/my-personas" element={<ProtectedRoute><MyPersonas /></ProtectedRoute>} />
              <Route path="/persona-library" element={<ProtectedRoute><PersonaLibrary /></ProtectedRoute>} />
              
              {/* Persona Creation Routes */}
              <Route path="/persona-creation" element={<ProtectedRoute><PersonaCreationLanding /></ProtectedRoute>} />
              <Route path="/persona-creation/screener" element={<ProtectedRoute><PersonaCreationScreener /></ProtectedRoute>} />
              <Route path="/persona-creation/consent" element={<ProtectedRoute><ConsentForm /></ProtectedRoute>} />
              <Route path="/persona-creation/questionnaire" element={<ProtectedRoute><PersonaCreationQuestionnaire /></ProtectedRoute>} />
              <Route path="/persona-creation/complete" element={<ProtectedRoute><PersonaCreationComplete /></ProtectedRoute>} />
              <Route path="/your-persona/:id" element={<ProtectedRoute><YourPersona /></ProtectedRoute>} />
              <Route path="/interviewer-ai" element={<ProtectedRoute><PersonaAIInterviewer /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><InsightConductor /></ProtectedRoute>} />
            </Routes>
            
            <Toaster position="top-center" />
          </Router>
        </PersonaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
