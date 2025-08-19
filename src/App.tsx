
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';
import SignIn from '@/pages/SignIn';
import Dashboard from '@/pages/Dashboard';
import PersonaDetail from '@/pages/PersonaDetail';
import PersonaViewer from '@/pages/PersonaViewer';
import PersonaChat from '@/pages/PersonaChat';
import CollectionDetail from '@/pages/CollectionDetail';
import Collections from '@/pages/Collections';
import Projects from '@/pages/Projects';
import Admin from '@/pages/Admin';
import Docs from '@/pages/Docs';
import CustomResearch from '@/pages/CustomResearch';
import SimulatedPersona from '@/pages/SimulatedPersona';
import Research from '@/pages/Research';
import Prsna from '@/pages/Prsna';
import SurveyInterface from '@/components/research/SurveyInterface';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<SignIn />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/persona-detail/:personaId" element={
                <ProtectedRoute>
                  <PersonaDetail />
                </ProtectedRoute>
              } />
              <Route path="/persona/:personaId/chat" element={
                <ProtectedRoute>
                  <PersonaChat />
                </ProtectedRoute>
              } />
              <Route path="/persona-viewer" element={
                <ProtectedRoute>
                  <PersonaViewer />
                </ProtectedRoute>
              } />
              <Route path="/personas" element={
                <ProtectedRoute>
                  <PersonaViewer />
                </ProtectedRoute>
              } />
              <Route path="/collections" element={
                <ProtectedRoute>
                  <Collections />
                </ProtectedRoute>
              } />
              <Route path="/collection/:collectionId" element={
                <ProtectedRoute>
                  <CollectionDetail />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/docs" element={
                <ProtectedRoute>
                  <Docs />
                </ProtectedRoute>
              } />
              <Route path="/custom-research" element={
                <ProtectedRoute>
                  <CustomResearch />
                </ProtectedRoute>
              } />
              <Route path="/simulated-persona" element={
                <ProtectedRoute>
                  <SimulatedPersona />
                </ProtectedRoute>
              } />
              <Route path="/research" element={
                <ProtectedRoute>
                  <Research />
                </ProtectedRoute>
              } />
              <Route path="/prsna" element={<Prsna />} />
              <Route path="/survey" element={<SurveyInterface />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
