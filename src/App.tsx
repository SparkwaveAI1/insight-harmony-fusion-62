
import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

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
import ParticipateResearch from './pages/ParticipateResearch';
import InterviewProcess from './pages/InterviewProcess';
import PersonaViewer from './pages/PersonaViewer';
import PersonaDetail from './pages/PersonaDetail';
import PersonaChat from './pages/PersonaChat';
import DualChat from './pages/DualChat';

// Persona Creation Pages
import PersonaCreationLanding from './pages/persona-creation/PersonaCreationLanding';
import PersonaCreationScreener from './pages/persona-creation/PersonaCreationScreener';
import ConsentForm from './pages/persona-creation/ConsentForm';
import PersonaCreationQuestionnaire from './pages/persona-creation/PersonaCreationQuestionnaire';
import PersonaCreationComplete from './pages/persona-creation/PersonaCreationComplete';
import YourPersona from './pages/YourPersona';
import PersonaAIInterviewer from './pages/PersonaAIInterviewer';
import InsightConductor from './pages/InsightConductor';

import { PersonaProvider } from './context/PersonaProvider';

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
      <PersonaProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/custom-research" element={<CustomResearch />} />
            <Route path="/earn" element={<EarnPRSNA />} />
            <Route path="/ecosystem" element={<PRSNAEcosystem />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/research" element={<Research />} />
            <Route path="/interviewer" element={<Interviewer />} />
            <Route path="/simulated-persona" element={<SimulatedPersona />} />
            <Route path="/ai-focus-groups" element={<AIFocusGroups />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/participate" element={<ParticipateResearch />} />
            <Route path="/interview-process" element={<InterviewProcess />} />
            <Route path="/persona-viewer" element={<PersonaViewer />} />
            <Route path="/persona-detail/:personaId" element={<PersonaDetail />} />
            <Route path="/persona-chat/:personaId" element={<PersonaChat />} />
            <Route path="/dual-chat" element={<DualChat />} />
            
            {/* Persona Creation Routes */}
            <Route path="/persona-creation" element={<PersonaCreationLanding />} />
            <Route path="/persona-creation/screener" element={<PersonaCreationScreener />} />
            <Route path="/persona-creation/consent" element={<ConsentForm />} />
            <Route path="/persona-creation/questionnaire" element={<PersonaCreationQuestionnaire />} />
            <Route path="/persona-creation/complete" element={<PersonaCreationComplete />} />
            <Route path="/your-persona/:id" element={<YourPersona />} />
            <Route path="/interviewer-ai" element={<PersonaAIInterviewer />} />
            <Route path="/insights" element={<InsightConductor />} />
            
            {/* Catch any unknown routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Toaster position="top-center" />
        </Router>
      </PersonaProvider>
    </QueryClientProvider>
  );
}

export default App;
