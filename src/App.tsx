
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PersonaProvider } from "./context/PersonaProvider";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Index from "./pages/Index";
import PersonaViewer from "./pages/PersonaViewer";
import PersonaChat from "./pages/PersonaChat";
import PersonaProfile from "./pages/PersonaProfile";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ConversationDetail from "./pages/ConversationDetail";

import PRSNAEcosystem from "./pages/PRSNAEcosystem";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import CustomResearch from "./pages/CustomResearch";
import Research from "./pages/Research";
import ResearchResults from "./pages/ResearchResults";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import PersonaQueue from "./pages/PersonaQueue";
import ParticipateResearch from "./pages/ParticipateResearch";
import WhitePaper from "./pages/WhitePaper";
import Roadmap from "./pages/Roadmap";
import EarnPRSNA from "./pages/EarnPRSNA";
import Docs from "./pages/Docs";

import { V4PersonaCreationPage } from "./pages/v4";
import TestPersonaLibrary from "./pages/TestPersonaLibrary";
import { V4Diagnostic } from "./components/debug/V4Diagnostic";

// Pages - Persona Creation
import ConsentForm from "./pages/persona-creation/ConsentForm";
import PersonaCreationLanding from "./pages/persona-creation/PersonaCreationLanding";
import PersonaCreationScreener from "./pages/persona-creation/PersonaCreationScreener";
import PersonaCreationQuestionnaire from "./pages/persona-creation/PersonaCreationQuestionnaire";
import PersonaCreationComplete from "./pages/persona-creation/PersonaCreationComplete";


import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DeploymentVerifier } from "./components/deployment/DeploymentVerifier";
import { JobCompletionNotifier } from "./components/persona-creation/JobCompletionNotifier";
import ScrollToTop from "./components/layout/ScrollToTop";



import "./App.css";


// NUCLEAR CACHE BUSTER - Force complete fresh deployment
const NUCLEAR_BUILD_ID = `NUCLEAR_${Date.now()}_V4_PERSONAS_ONLY`;
const DEPLOYMENT_VERIFICATION = `PRODUCTION_VERIFICATION_${Math.random().toString(36)}`;
console.log(`🚨 NUCLEAR CACHE BUSTER ACTIVE: ${NUCLEAR_BUILD_ID}`);
console.log(`🔥 DEPLOYMENT VERIFICATION ID: ${DEPLOYMENT_VERIFICATION}`);
console.log(`🚀 PersonaAI App Loaded - FORCED FRESH BUILD - Using v4_personas table EXCLUSIVELY`);
console.log(`🎯 If you see this message, the NEW code is running!`);

// Force immediate cache invalidation
if (typeof window !== 'undefined') {
  (window as any).LOVABLE_DEPLOYMENT_CHECK = DEPLOYMENT_VERIFICATION;
  console.log(`✅ Window deployment check set: ${(window as any).LOVABLE_DEPLOYMENT_CHECK}`);
}

// Create a client with aggressive cache invalidation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Force fresh queries
      gcTime: 0, // Clear cache immediately (replaces cacheTime)
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <PersonaProvider>
            <DeploymentVerifier />
            <JobCompletionNotifier />
            
            
            <Routes>
                {/* DEPLOYMENT TEST ROUTE - Independent persona test */}
                <Route path="/test-persona-library" element={<ProtectedRoute><TestPersonaLibrary /></ProtectedRoute>} />
                <Route path="/v4-diagnostic" element={<ProtectedRoute><V4Diagnostic /></ProtectedRoute>} />
                
                {/* Public Routes - Accessible without login */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/sign-in" element={<Auth />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Documentation - Protected Route */}
                <Route path="/docs" element={<ProtectedRoute><Docs /></ProtectedRoute>} />
                
                
                {/* PRSNA token routes - public access */}
                <Route path="/prsna-ecosystem" element={<PRSNAEcosystem />} />
                <Route path="/prsna" element={<EarnPRSNA />} />
                <Route path="/prsna/roadmap" element={<Roadmap />} />
                <Route path="/prsna/whitepaper" element={<WhitePaper />} />
                <Route path="/whitepaper" element={<WhitePaper />} />
                
                {/* User Profile Route */}
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/persona-queue" element={<ProtectedRoute><PersonaQueue /></ProtectedRoute>} />
                
                {/* Protected Routes - Require authentication */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                <Route path="/billing/success" element={<BillingSuccess />} />
                <Route path="/billing/cancel" element={<BillingCancel />} />
                <Route path="/persona-viewer" element={<ProtectedRoute><PersonaViewer /></ProtectedRoute>} />
                <Route path="/persona-library" element={<ProtectedRoute><PersonaViewer /></ProtectedRoute>} />
                <Route path="/persona-detail/:personaId" element={<ProtectedRoute><PersonaProfile /></ProtectedRoute>} />
                <Route path="/persona-detail/:personaId/chat" element={<ProtectedRoute><PersonaChat /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute><PersonaProfile /></ProtectedRoute>} />
                
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                <Route path="/conversations/:conversationId" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
                <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
                
                {/* IMPORTANT: Add support for both URL formats to avoid breaking existing links */}
                <Route path="/collections/:collectionId" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
                <Route path="/collection/:collectionId" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
                
                {/* Research section - Protected */}
                
                <Route path="/persona-creator" element={<ProtectedRoute><V4PersonaCreationPage /></ProtectedRoute>} />
                <Route path="/custom-research" element={<ProtectedRoute><CustomResearch /></ProtectedRoute>} />
                <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
                <Route path="/research/results/:surveySessionId" element={<ProtectedRoute><ResearchResults /></ProtectedRoute>} />
                <Route path="/participate" element={<ProtectedRoute><ParticipateResearch /></ProtectedRoute>} />
                
                {/* Persona Creation Flow - Protected */}
                <Route path="/create" element={<ProtectedRoute><PersonaCreationLanding /></ProtectedRoute>} />
                <Route path="/consent" element={<ProtectedRoute><ConsentForm /></ProtectedRoute>} />
                <Route path="/screener" element={<ProtectedRoute><PersonaCreationScreener /></ProtectedRoute>} />
                <Route path="/questionnaire" element={<ProtectedRoute><PersonaCreationQuestionnaire /></ProtectedRoute>} />
                <Route path="/complete" element={<ProtectedRoute><PersonaCreationComplete /></ProtectedRoute>} />
                <Route path="/persona-creation/complete" element={<ProtectedRoute><PersonaCreationComplete /></ProtectedRoute>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" />
          </PersonaProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
