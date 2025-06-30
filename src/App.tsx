
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { PersonaProvider } from './context/PersonaProvider';

// Character pages
import CharacterDashboard from './characters/pages/CharacterDashboard';
import HistoricalCharacterCreate from './characters/pages/HistoricalCharacterCreate';
import CharacterDetail from './characters/pages/CharacterDetail';
import CharacterChat from './characters/pages/CharacterChat';
import CharacterLabDashboard from './characters/pages/CharacterLabDashboard';
import CharacterLabCreate from './characters/pages/CharacterLabCreate';

// Persona pages
import PersonaDashboard from './personas/pages/PersonaDashboard';
import PersonaViewer from './pages/PersonaViewer';
import PersonaDetail from './pages/PersonaDetail';
import PersonaChat from './pages/PersonaChat';
import PersonaCreate from './pages/PersonaCreate';
import ResearchSession from './pages/ResearchSession';

// General pages
import Auth from './pages/Auth';
import UserProfile from './pages/UserProfile';
import Index from './pages/Index';
import Pricing from './pages/Pricing';

// Components
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PersonaProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />

              {/* Protected Routes */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Persona Module Routes */}
              <Route
                path="/personas"
                element={
                  <ProtectedRoute>
                    <PersonaDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personas/create"
                element={
                  <ProtectedRoute>
                    <PersonaCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personas/viewer"
                element={
                  <ProtectedRoute>
                    <PersonaViewer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personas/research"
                element={
                  <ProtectedRoute>
                    <ResearchSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personas/:personaId"
                element={
                  <ProtectedRoute>
                    <PersonaDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personas/:personaId/chat"
                element={
                  <ProtectedRoute>
                    <PersonaChat />
                  </ProtectedRoute>
                }
              />

              {/* Character Module Routes */}
              <Route
                path="/characters"
                element={
                  <ProtectedRoute>
                    <CharacterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/characters/historical/create"
                element={
                  <ProtectedRoute>
                    <HistoricalCharacterCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/characters/:characterId"
                element={
                  <ProtectedRoute>
                    <CharacterDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/characters/:characterId/chat"
                element={
                  <ProtectedRoute>
                    <CharacterChat />
                  </ProtectedRoute>
                }
              />
              
              {/* Character Lab Routes */}
              <Route
                path="/characters/lab"
                element={
                  <ProtectedRoute>
                    <CharacterLabDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/characters/lab/create"
                element={
                  <ProtectedRoute>
                    <CharacterLabCreate />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </PersonaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
