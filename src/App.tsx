import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "sonner";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { ensureTablesExist } from "./services/supabase/databaseSetup";

// Use lazy loading for routes to improve initial load time
const PersonaAIInterviewer = lazy(() => import("./pages/PersonaAIInterviewer"));
const AIFocusGroups = lazy(() => import("./pages/AIFocusGroups"));
const EarnPRSNA = lazy(() => import("./pages/EarnPRSNA"));
const Contact = lazy(() => import("./pages/Contact"));
const Research = lazy(() => import("./pages/Research"));
const Interviewer = lazy(() => import("./pages/Interviewer"));
const YourPersona = lazy(() => import("./pages/YourPersona"));
const Pricing = lazy(() => import("./pages/Pricing"));
const InterviewProcess = lazy(() => import("./pages/InterviewProcess"));
const ParticipateResearch = lazy(() => import("./pages/ParticipateResearch"));
const Team = lazy(() => import("./pages/Team"));
const PersonaCreationLanding = lazy(() => import("./pages/persona-creation/PersonaCreationLanding"));
const PersonaCreationScreener = lazy(() => import("./pages/persona-creation/PersonaCreationScreener"));
const PersonaCreationQuestionnaire = lazy(() => import("./pages/persona-creation/PersonaCreationQuestionnaire"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/research",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Research />
      </Suspense>
    ),
  },
  {
    path: "/interviewer",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Interviewer />
      </Suspense>
    ),
  },
  {
    path: "/your-persona",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <YourPersona />
      </Suspense>
    ),
  },
  {
    path: "/persona-ai-interviewer",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PersonaAIInterviewer />
      </Suspense>
    ),
  },
  {
    path: "/ai-focus-groups",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AIFocusGroups />
      </Suspense>
    ),
  },
  {
    path: "/prsna-ecosystem",
    element: <Navigate to="/earn-prsna" replace />,
  },
  {
    path: "/earn-prsna",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <EarnPRSNA />
      </Suspense>
    ),
  },
  {
    path: "/contact",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Contact />
      </Suspense>
    ),
  },
  {
    path: "/pricing",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Pricing />
      </Suspense>
    ),
  },
  {
    path: "/interview-process",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <InterviewProcess />
      </Suspense>
    ),
  },
  {
    path: "/participate-research",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ParticipateResearch />
      </Suspense>
    ),
  },
  {
    path: "/team",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Team />
      </Suspense>
    ),
  },
  {
    path: "/persona-creation/landing",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PersonaCreationLanding />
      </Suspense>
    ),
  },
  {
    path: "/persona-creation/screener",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PersonaCreationScreener />
      </Suspense>
    ),
  },
  {
    path: "/persona-creation/questionnaire",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PersonaCreationQuestionnaire />
      </Suspense>
    ),
  },
]);

function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const isReady = await ensureTablesExist();
        setIsDbReady(isReady);
      } catch (error) {
        console.error("Database setup error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDatabase();
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
