
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PersonaDetail from './pages/PersonaDetail';
import PersonaEdit from './pages/PersonaEdit';
import PersonaDashboard from './pages/PersonaDashboard';
import PersonaClone from './pages/PersonaClone';
import PersonaCreate from './pages/PersonaCreate';
import PersonaLibrary from './pages/PersonaLibrary';
import PersonaChat from './pages/PersonaChat';
import PersonaComparison from './pages/PersonaComparison';
import Research from './pages/Research';
import SurveyInterface from './pages/SurveyInterface';
import ResearchSurveyExecution from './pages/ResearchSurveyExecution';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectCreate from './pages/ProjectCreate';
import Settings from './pages/Settings';
import Interview from './pages/Interview';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/interview" element={<Interview />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Persona routes */}
              <Route path="/personas" element={<ProtectedRoute><PersonaDashboard /></ProtectedRoute>} />
              <Route path="/personas/library" element={<ProtectedRoute><PersonaLibrary /></ProtectedRoute>} />
              <Route path="/personas/create" element={<ProtectedRoute><PersonaCreate /></ProtectedRoute>} />
              <Route path="/personas/:personaId" element={<ProtectedRoute><PersonaDetail /></ProtectedRoute>} />
              <Route path="/personas/:personaId/edit" element={<ProtectedRoute><PersonaEdit /></ProtectedRoute>} />
              <Route path="/personas/:personaId/clone" element={<ProtectedRoute><PersonaClone /></ProtectedRoute>} />
              <Route path="/personas/:personaId/chat" element={<ProtectedRoute><PersonaChat /></ProtectedRoute>} />
              <Route path="/personas/compare" element={<ProtectedRoute><PersonaComparison /></ProtectedRoute>} />

              {/* Research routes */}
              <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
              <Route path="/research/survey/:surveyId" element={<ProtectedRoute><SurveyInterface /></ProtectedRoute>} />
              <Route path="/research/survey/:surveyId/execute/:sessionId" element={<ProtectedRoute><ResearchSurveyExecution /></ProtectedRoute>} />

              {/* Collections routes */}
              <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
              <Route path="/collections/:collectionId" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />

              {/* Projects routes */}
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/projects/create" element={<ProtectedRoute><ProjectCreate /></ProtectedRoute>} />
              <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />

              {/* Settings */}
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
