
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PersonaCreationScreener from './pages/persona-creation/PersonaCreationScreener';
import ConsentForm from './pages/persona-creation/ConsentForm';
import PersonaCreationQuestionnaire from './pages/persona-creation/PersonaCreationQuestionnaire';
import PersonaCreationLanding from './pages/persona-creation/PersonaCreationLanding';
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Contact from './pages/Contact';
import AIFocusGroups from './pages/AIFocusGroups';
import CustomResearch from './pages/CustomResearch';
import EarnPRSNA from './pages/EarnPRSNA';
import Interviewer from './pages/Interviewer';
import InterviewProcess from './pages/InterviewProcess';
import PersonaAIInterviewer from './pages/PersonaAIInterviewer';
import PRSNAEcosystem from './pages/PRSNAEcosystem';
import ParticipateResearch from './pages/ParticipateResearch';
import Pricing from './pages/Pricing';
import Research from './pages/Research';
import Team from './pages/Team';
import YourPersona from './pages/YourPersona';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/persona-creation" element={<PersonaCreationLanding />} />
          <Route path="/persona-creation/screener" element={<PersonaCreationScreener />} />
          <Route path="/persona-creation/consent-form" element={<ConsentForm />} />
          <Route path="/persona-creation/consent" element={<ConsentForm />} /> {/* Alias for backward compatibility */}
          <Route path="/persona-creation/questionnaire" element={<PersonaCreationQuestionnaire />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ai-focus-groups" element={<AIFocusGroups />} />
          <Route path="/custom-research" element={<CustomResearch />} />
          <Route path="/earn-prsna" element={<EarnPRSNA />} />
          <Route path="/interviewer" element={<Interviewer />} />
          <Route path="/interview-process" element={<InterviewProcess />} />
          <Route path="/persona-ai-interviewer" element={<PersonaAIInterviewer />} />
          <Route path="/prsna-ecosystem" element={<PRSNAEcosystem />} />
          <Route path="/participate-research" element={<ParticipateResearch />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/research" element={<Research />} />
          <Route path="/team" element={<Team />} />
          <Route path="/your-persona" element={<YourPersona />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
