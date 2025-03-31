
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PersonaCreationScreener from './pages/persona-creation/PersonaCreationScreener';
import ConsentForm from './pages/persona-creation/ConsentForm';
import PersonaCreationQuestionnaire from './pages/persona-creation/PersonaCreationQuestionnaire';
import InterviewPage from './pages/interview/InterviewPage';
import ThankYouPage from './pages/ThankYouPage';
import UnlockInterview from './pages/interview/UnlockInterview';
import { Toaster } from "@/components/ui/toaster";
import PersonaCreationLanding from './pages/persona-creation/PersonaCreationLanding';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PersonaCreationScreener />} />
          <Route path="/persona-creation/screener" element={<PersonaCreationScreener />} />
          <Route path="/persona-creation/consent" element={<ConsentForm />} />
          <Route path="/persona-creation/questionnaire" element={<PersonaCreationQuestionnaire />} />
          <Route path="/interview/unlock" element={<UnlockInterview />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/persona-creation/landing" element={<PersonaCreationLanding />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
