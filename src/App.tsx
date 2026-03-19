import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageLoader from "./components/layout/PageLoader";
import { ErrorBoundary } from "./components/error/ErrorBoundary";

// Eager imports — critical path (SEO, first paint, error handling)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy imports — deferred until route is visited
const PersonaViewer = lazy(() => import("./pages/PersonaViewer"));
const PersonaChat = lazy(() => import("./pages/PersonaChat"));
const PersonaProfile = lazy(() => import("./pages/PersonaProfile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Billing = lazy(() => import("./pages/Billing"));
const BillingSuccess = lazy(() => import("./pages/BillingSuccess"));
const BillingCancel = lazy(() => import("./pages/BillingCancel"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const ConversationDetail = lazy(() => import("./pages/ConversationDetail"));
const PRSNAEcosystem = lazy(() => import("./pages/PRSNAEcosystem"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const CustomResearch = lazy(() => import("./pages/CustomResearch"));
const Research = lazy(() => import("./pages/Research"));
const ResearchResults = lazy(() => import("./pages/ResearchResults"));
const ACPResults = lazy(() => import("./pages/ACPResults"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Admin = lazy(() => import("./pages/Admin"));
const MatcherTest = lazy(() => import("./pages/admin/MatcherTest"));
const PersonaQueue = lazy(() => import("./pages/PersonaQueue"));
const ParticipateResearch = lazy(() => import("./pages/ParticipateResearch"));
const WhitePaper = lazy(() => import("./pages/WhitePaper"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const EarnPRSNA = lazy(() => import("./pages/EarnPRSNA"));
const Docs = lazy(() => import("./pages/Docs"));
const TestPersonaLibrary = lazy(() => import("./pages/TestPersonaLibrary"));

// Lazy imports — v4 pages
const V4PersonaCreationPage = lazy(() =>
  import("./pages/v4").then((m) => ({ default: m.V4PersonaCreationPage }))
);
const V4Diagnostic = lazy(() =>
  import("./components/debug/V4Diagnostic").then((m) => ({ default: m.V4Diagnostic }))
);

// Lazy imports — Persona creation flow
const ConsentForm = lazy(() => import("./pages/persona-creation/ConsentForm"));
const PersonaCreationLanding = lazy(() => import("./pages/persona-creation/PersonaCreationLanding"));
const PersonaCreationScreener = lazy(() => import("./pages/persona-creation/PersonaCreationScreener"));
const PersonaCreationQuestionnaire = lazy(() => import("./pages/persona-creation/PersonaCreationQuestionnaire"));
const PersonaCreationComplete = lazy(() => import("./pages/persona-creation/PersonaCreationComplete"));

// Lazy imports — Blog pages
const BlogIndex = lazy(() => import("./pages/blog/BlogIndex"));
const BlogPost = lazy(() => import("./pages/blog/BlogPost"));

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DeploymentVerifier } from "./components/deployment/DeploymentVerifier";
import { JobCompletionNotifier } from "./components/persona-creation/JobCompletionNotifier";
import ScrollToTop from "./components/layout/ScrollToTop";

import "./App.css";

// Helper: wrap a lazy element in its own Suspense boundary
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Create a client with reasonable cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory for fast access
      refetchOnWindowFocus: false, // Don't refetch on tab switch (use cache)
      refetchOnMount: false, // Don't refetch on component mount (use cache)
      refetchOnReconnect: true, // Refetch on network reconnection
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <JobCompletionNotifier />
          <DeploymentVerifier />

          <Routes>
            {/* Debug / test routes */}
            <Route path="/test-persona-library" element={<S><ProtectedRoute><TestPersonaLibrary /></ProtectedRoute></S>} />
            <Route path="/v4-diagnostic" element={<S><ProtectedRoute><V4Diagnostic /></ProtectedRoute></S>} />

            {/* Public Routes - Eager (critical path) */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sign-in" element={<Auth />} />

            {/* Public Routes - Lazy */}
            <Route path="/pricing" element={<S><Pricing /></S>} />
            <Route path="/contact" element={<S><Contact /></S>} />

            {/* Blog Routes — public */}
            <Route path="/blog" element={<S><BlogIndex /></S>} />
            <Route path="/blog/:slug" element={<S><BlogPost /></S>} />

            {/* Documentation - Protected */}
            <Route path="/docs" element={<S><ProtectedRoute><Docs /></ProtectedRoute></S>} />

            {/* PRSNA token routes - public */}
            <Route path="/prsna-ecosystem" element={<S><PRSNAEcosystem /></S>} />
            <Route path="/prsna" element={<S><EarnPRSNA /></S>} />
            <Route path="/prsna/roadmap" element={<S><Roadmap /></S>} />
            <Route path="/prsna/whitepaper" element={<S><WhitePaper /></S>} />
            <Route path="/whitepaper" element={<S><WhitePaper /></S>} />

            {/* User Profile */}
            <Route path="/profile" element={<S><ProtectedRoute><UserProfile /></ProtectedRoute></S>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<S><ProtectedRoute><Admin /></ProtectedRoute></S>} />
            <Route path="/admin/matcher-test" element={<S><ProtectedRoute><MatcherTest /></ProtectedRoute></S>} />
            <Route path="/persona-queue" element={<S><ProtectedRoute><PersonaQueue /></ProtectedRoute></S>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<S><ProtectedRoute><Dashboard /></ProtectedRoute></S>} />
            <Route path="/dashboard/billing" element={<S><ProtectedRoute><Billing /></ProtectedRoute></S>} />
            <Route path="/billing/success" element={<S><BillingSuccess /></S>} />
            <Route path="/billing/cancel" element={<S><BillingCancel /></S>} />
            <Route path="/persona-viewer" element={<S><ProtectedRoute><PersonaViewer /></ProtectedRoute></S>} />
            <Route path="/persona-library" element={<S><ProtectedRoute><PersonaViewer /></ProtectedRoute></S>} />
            <Route path="/persona-detail/:personaId" element={<S><ProtectedRoute><PersonaProfile /></ProtectedRoute></S>} />
            <Route path="/persona-detail/:personaId/chat" element={<S><ProtectedRoute><PersonaChat /></ProtectedRoute></S>} />
            <Route path="/profile/:id" element={<S><ProtectedRoute><PersonaProfile /></ProtectedRoute></S>} />

            <Route path="/projects" element={<S><ProtectedRoute><Projects /></ProtectedRoute></S>} />
            <Route path="/projects/:id" element={<S><ProtectedRoute><ProjectDetail /></ProtectedRoute></S>} />
            <Route path="/conversations/:conversationId" element={<S><ProtectedRoute><ConversationDetail /></ProtectedRoute></S>} />
            <Route path="/collections" element={<S><ProtectedRoute><Collections /></ProtectedRoute></S>} />
            <Route path="/collections/:collectionId" element={<S><ProtectedRoute><CollectionDetail /></ProtectedRoute></S>} />
            <Route path="/collection/:collectionId" element={<S><ProtectedRoute><CollectionDetail /></ProtectedRoute></S>} />

            {/* Research section */}
            <Route path="/persona-creator" element={<S><ProtectedRoute><V4PersonaCreationPage /></ProtectedRoute></S>} />
            <Route path="/custom-research" element={<S><ProtectedRoute><CustomResearch /></ProtectedRoute></S>} />
            <Route path="/research" element={<S><ProtectedRoute><Research /></ProtectedRoute></S>} />
            <Route path="/research/results/:surveySessionId" element={<S><ProtectedRoute><ResearchResults /></ProtectedRoute></S>} />
            <Route path="/participate" element={<S><ProtectedRoute><ParticipateResearch /></ProtectedRoute></S>} />

            {/* ACP Results - Public */}
            <Route path="/acp-results/:jobId" element={<S><ACPResults /></S>} />

            {/* Persona Creation Flow */}
            <Route path="/create" element={<S><ProtectedRoute><PersonaCreationLanding /></ProtectedRoute></S>} />
            <Route path="/consent" element={<S><ProtectedRoute><ConsentForm /></ProtectedRoute></S>} />
            <Route path="/screener" element={<S><ProtectedRoute><PersonaCreationScreener /></ProtectedRoute></S>} />
            <Route path="/questionnaire" element={<S><ProtectedRoute><PersonaCreationQuestionnaire /></ProtectedRoute></S>} />
            <Route path="/complete" element={<S><ProtectedRoute><PersonaCreationComplete /></ProtectedRoute></S>} />
            <Route path="/persona-creation/complete" element={<S><ProtectedRoute><PersonaCreationComplete /></ProtectedRoute></S>} />

            {/* 404 — eager */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
