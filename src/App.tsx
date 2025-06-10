import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PersonaProvider } from './contexts/PersonaContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PersonaList from './pages/personas/PersonaList';
import PersonaDetail from './pages/personas/PersonaDetail';
import PersonaCreate from './pages/personas/PersonaCreate';
import PersonaEdit from './pages/personas/PersonaEdit';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetail from './pages/projects/ProjectDetail';
import ProjectCreate from './pages/projects/ProjectCreate';
import ProjectEdit from './pages/projects/ProjectEdit';
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/personas" element={<PersonaList />} />
              <Route path="/personas/:id" element={<PersonaDetail />} />
              <Route path="/personas/create" element={<PersonaCreate />} />
              <Route path="/personas/:id/edit" element={<PersonaEdit />} />
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
