import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import CharacterDashboard from './characters/pages/CharacterDashboard';
import HistoricalCharacterCreate from './characters/pages/HistoricalCharacterCreate';
import CharacterDetail from './characters/pages/CharacterDetail';
import CharacterChat from './characters/pages/CharacterChat';
import SignIn from './auth/pages/SignIn';
import SignUp from './auth/pages/SignUp';
import Account from './auth/pages/Account';
import ProtectedRoute from './auth/components/ProtectedRoute';
import LandingPage from './home/pages/LandingPage';
import PricingPage from './pricing/pages/PricingPage';
import CreativeCharacterDashboard from './characters/pages/CreativeCharacterDashboard';
import CreativeCharacterCreate from './characters/pages/CreativeCharacterCreate';

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
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />

            {/* Protected Routes */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
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
			      <Route
              path="/characters/create/creative"
              element={
                <ProtectedRoute>
                  <CreativeCharacterCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/characters/creative"
              element={
                <ProtectedRoute>
                  <CreativeCharacterDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Character Lab Routes */}
            <Route path="/characters/lab" element={<CharacterLabDashboard />} />
            <Route path="/characters/lab/create" element={<CharacterLabCreate />} />
            
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
