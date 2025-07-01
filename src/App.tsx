
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { PersonaProvider } from '@/context/PersonaProvider';
import { CharacterProvider } from '@/context/CharacterProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

// Pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import PersonaViewer from './pages/PersonaViewer';
import PersonaDetail from './pages/PersonaDetail';
import PersonaChat from './pages/PersonaChat';
import Research from './pages/Research';
import CustomResearch from './pages/CustomResearch';
import UserProfile from './pages/UserProfile';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ConversationDetail from './pages/ConversationDetail';
import NotFound from './pages/NotFound';

// Character pages
import CharactersHome from './characters/pages/CharactersHome';
import CharacterLibrary from './characters/pages/CharacterLibrary';
import CharacterDashboard from './characters/pages/CharacterDashboard';
import CharacterDetail from './characters/pages/CharacterDetail';
import CharacterChat from './characters/pages/CharacterChat';
import CharacterCreate from './characters/pages/CharacterCreate';
import CharacterEdit from './characters/pages/CharacterEdit';
import HistoricalCharacterCreate from './characters/pages/HistoricalCharacterCreate';
import CreativeCharacterCreate from './characters/pages/CreativeCharacterCreate';
import CreativeCharacterDashboard from './characters/pages/CreativeCharacterDashboard';
import UnifiedCreativeCharacterLibrary from './characters/pages/UnifiedCreativeCharacterLibrary';

// Other pages
import Interviewer from './pages/Interviewer';
import PersonaAIInterviewer from './pages/PersonaAIInterviewer';
import InterviewProcess from './pages/InterviewProcess';
import PersonaCreationLanding from './pages/persona-creation/PersonaCreationLanding';
import PersonaCreationScreener from './pages/persona-creation/PersonaCreationScreener';
import PersonaCreationQuestionnaire from './pages/persona-creation/PersonaCreationQuestionnaire';
import PersonaCreationComplete from './pages/persona-creation/PersonaCreationComplete';
import ConsentForm from './pages/persona-creation/ConsentForm';
import YourPersona from './pages/YourPersona';
import SimulatedPersona from './pages/SimulatedPersona';
import InsightConductor from './pages/InsightConductor';
import AIFocusGroups from './pages/AIFocusGroups';
import PRSNAEcosystem from './pages/PRSNAEcosystem';
import EarnPRSNA from './pages/EarnPRSNA';
import ParticipateResearch from './pages/ParticipateResearch';
import Contact from './pages/Contact';
import Team from './pages/Team';
import Pricing from './pages/Pricing';
import Roadmap from './pages/Roadmap';
import WhitePaper from './pages/WhitePaper';

// Protected route wrapper - using named import
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PersonaProvider>
            <CharacterProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/roadmap" element={<Roadmap />} />
                    <Route path="/white-paper" element={<WhitePaper />} />
                    
                    {/* Persona creation routes */}
                    <Route path="/persona-creation" element={<PersonaCreationLanding />} />
                    <Route path="/persona-creation/screener" element={<PersonaCreationScreener />} />
                    <Route path="/persona-creation/consent" element={<ConsentForm />} />
                    <Route path="/persona-creation/questionnaire" element={<PersonaCreationQuestionnaire />} />
                    <Route path="/persona-creation/complete" element={<PersonaCreationComplete />} />
                    <Route path="/your-persona" element={<YourPersona />} />
                    
                    {/* Public character routes */}
                    <Route path="/characters" element={<CharactersHome />} />
                    <Route path="/characters/library" element={<CharacterLibrary />} />
                    <Route path="/characters/creative" element={<UnifiedCreativeCharacterLibrary />} />
                    <Route path="/characters/:id" element={<CharacterDetail />} />
                    <Route path="/characters/:id/chat" element={<CharacterChat />} />
                    
                    {/* Product pages */}
                    <Route path="/simulated-persona" element={<SimulatedPersona />} />
                    <Route path="/interviewer" element={<Interviewer />} />
                    <Route path="/persona-ai-interviewer" element={<PersonaAIInterviewer />} />
                    <Route path="/insight-conductor" element={<InsightConductor />} />
                    <Route path="/ai-focus-groups" element={<AIFocusGroups />} />
                    
                    {/* PRSNA Ecosystem */}
                    <Route path="/prsna-ecosystem" element={<PRSNAEcosystem />} />
                    <Route path="/earn-prsna" element={<EarnPRSNA />} />
                    <Route path="/participate-research" element={<ParticipateResearch />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/personas" element={
                      <ProtectedRoute>
                        <PersonaViewer />
                      </ProtectedRoute>
                    } />
                    <Route path="/personas/:id" element={
                      <ProtectedRoute>
                        <PersonaDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/personas/:id/chat" element={
                      <ProtectedRoute>
                        <PersonaChat />
                      </ProtectedRoute>
                    } />
                    <Route path="/research" element={
                      <ProtectedRoute>
                        <Research />
                      </ProtectedRoute>
                    } />
                    <Route path="/custom-research" element={
                      <ProtectedRoute>
                        <CustomResearch />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    } />
                    <Route path="/collections" element={
                      <ProtectedRoute>
                        <Collections />
                      </ProtectedRoute>
                    } />
                    <Route path="/collections/:id" element={
                      <ProtectedRoute>
                        <CollectionDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/projects" element={
                      <ProtectedRoute>
                        <Projects />
                      </ProtectedRoute>
                    } />
                    <Route path="/projects/:id" element={
                      <ProtectedRoute>
                        <ProjectDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/conversations/:id" element={
                      <ProtectedRoute>
                        <ConversationDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/interview" element={
                      <ProtectedRoute>
                        <InterviewProcess />
                      </ProtectedRoute>
                    } />
                    
                    {/* Protected character routes */}
                    <Route path="/characters/dashboard" element={
                      <ProtectedRoute>
                        <CharacterDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/characters/create" element={
                      <ProtectedRoute>
                        <CharacterCreate />
                      </ProtectedRoute>
                    } />
                    <Route path="/characters/create/historical" element={
                      <ProtectedRoute>
                        <HistoricalCharacterCreate />
                      </ProtectedRoute>
                    } />
                    <Route path="/characters/create/creative" element={
                      <ProtectedRoute>
                        <CreativeCharacterCreate />
                      </ProtectedRoute>
                    } />
                    <Route path="/characters/creative/dashboard" element={
                      <ProtectedRoute>
                        <CreativeCharacterDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/characters/:id/edit" element={
                      <ProtectedRoute>
                        <CharacterEdit />
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
                <SonnerToaster />
              </Router>
            </CharacterProvider>
          </PersonaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
