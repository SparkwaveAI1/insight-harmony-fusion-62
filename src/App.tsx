
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
