import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import PersonaDetail from '@/pages/PersonaDetail';
import PersonaViewer from '@/pages/PersonaViewer';
import PersonaChat from '@/pages/PersonaChat';
import CollectionDetail from '@/pages/CollectionDetail';
import Collections from '@/pages/Collections';
import SurveyInterface from '@/components/research/SurveyInterface';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/persona-detail/:personaId" element={<PersonaDetail />} />
              <Route path="/persona/:personaId/chat" element={<PersonaChat />} />
              <Route path="/persona-viewer" element={<PersonaViewer />} />
              <Route path="/personas" element={<PersonaViewer />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collection/:collectionId" element={<CollectionDetail />} />
              <Route path="/survey" element={<SurveyInterface />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;