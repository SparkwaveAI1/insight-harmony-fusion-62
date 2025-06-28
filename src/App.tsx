
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PersonaViewer from './pages/PersonaViewer';
import SimulatedPersona from './pages/SimulatedPersona';
import Research from './pages/Research';
import PRSNAToken from './pages/PRSNAEcosystem';
import Contact from './pages/Contact';
import Support from './pages/Contact';
import Settings from './pages/UserProfile';
import PageNotFound from './pages/NotFound';
import CharacterLibrary from './characters/pages/CharacterLibrary';
import CharacterDetail from './characters/pages/CharacterDetail';
import CharacterEdit from './characters/pages/CharacterEdit';
import CharacterChat from './characters/pages/CharacterChat';
import CharactersHome from './characters/pages/CharactersHome';
import HistoricalCharacterCreate from './characters/pages/HistoricalCharacterCreate';
import FictionalCharacterCreate from './characters/pages/FictionalCharacterCreate';
import CreativeCharacterCreate from './characters/pages/CreativeCharacterCreate';
import Collections from './pages/Collections';
import Projects from './pages/Projects';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Core App Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/persona-viewer" element={<PersonaViewer />} />
          <Route path="/simulated-persona" element={<SimulatedPersona />} />
          <Route path="/research" element={<Research />} />
          <Route path="/prsna" element={<PRSNAToken />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="*" element={<PageNotFound />} />
          
          {/* Character routes */}
          <Route path="/characters" element={<CharacterLibrary />} />
          <Route path="/characters-home" element={<CharactersHome />} />
          <Route path="/characters/create/historical" element={<HistoricalCharacterCreate />} />
          <Route path="/characters/create/creative" element={<CreativeCharacterCreate />} />
          <Route path="/characters/:characterId" element={<CharacterDetail />} />
          <Route path="/characters/:characterId/edit" element={<CharacterEdit />} />
          <Route path="/characters/:characterId/chat" element={<CharacterChat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
