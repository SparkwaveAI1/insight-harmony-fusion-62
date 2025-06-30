
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import CharacterDashboard from './characters/pages/CharacterDashboard';
import HistoricalCharacterCreate from './characters/pages/HistoricalCharacterCreate';
import CharacterDetail from './characters/pages/CharacterDetail';
import CharacterChat from './characters/pages/CharacterChat';
import Auth from './pages/Auth';
import UserProfile from './pages/UserProfile';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Index from './pages/Index';
import Pricing from './pages/Pricing';
import CharacterLabDashboard from './characters/pages/CharacterLabDashboard';
import CharacterLabCreate from './characters/pages/CharacterLabCreate';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
