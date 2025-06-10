
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { PersonaProvider } from './context/PersonaProvider';
import Home from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/UserProfile';
import PersonaList from './pages/PersonaViewer';
import PersonaDetail from './pages/PersonaDetail';
import PersonaCreate from './pages/persona-creation/PersonaCreationLanding';
import PersonaEdit from './pages/PersonaDetail';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import ProjectList from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectCreate from './pages/Projects';
import ProjectEdit from './pages/ProjectDetail';
import FocusGroup from './pages/FocusGroup';
import Research from './pages/Research';
import GenerateStudy from './pages/GenerateStudy';
import StructuredStudy from './pages/StructuredStudy';
import QuickResearchSetup from './pages/research/QuickResearchSetup';
import StructuredStudySetup from './pages/research/StructuredStudySetup';
import StructuredStudySession from './pages/research/StructuredStudySession';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PersonaProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sign-in" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/personas" element={<PersonaList />} />
              <Route path="/persona-viewer" element={<PersonaList />} />
              <Route path="/personas/:id" element={<PersonaDetail />} />
              <Route path="/persona-detail/:id" element={<PersonaDetail />} />
              <Route path="/personas/:personaId" element={<PersonaDetail />} />
              <Route path="/persona-detail/:personaId" element={<PersonaDetail />} />
              <Route path="/personas/create" element={<PersonaCreate />} />
              <Route path="/personas/:id/edit" element={<PersonaEdit />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:collectionId" element={<CollectionDetail />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/create" element={<ProjectCreate />} />
              <Route path="/projects/:id/edit" element={<ProjectEdit />} />
              <Route path="/focus-group" element={<FocusGroup />} />
              <Route path="/research" element={<Research />} />
              <Route path="/research/generate" element={<GenerateStudy />} />
              <Route path="/research/structured" element={<StructuredStudy />} />
              <Route path="/research/setup/structured" element={<StructuredStudySetup />} />
              <Route path="/research/session/structured" element={<StructuredStudySession />} />
              <Route path="/research/quick-setup" element={<QuickResearchSetup />} />
            </Routes>
          </PersonaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
