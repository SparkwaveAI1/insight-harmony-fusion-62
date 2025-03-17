
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "sonner";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { ensureTablesExist, getSetupSQLScripts } from "./services/supabase/databaseSetup";

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

// Database setup instructions component
const DatabaseSetupInstructions = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="max-w-3xl bg-white rounded-lg shadow-xl p-6 md:p-8">
      <h1 className="text-2xl font-bold text-primary mb-4">Supabase Setup Required</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Step 1: Create the participants table</h2>
        <p className="mb-4">Go to your Supabase dashboard, navigate to the SQL Editor, and run the following SQL script:</p>
        <div className="bg-gray-50 rounded p-4 overflow-x-auto">
          <pre className="text-sm">{getSetupSQLScripts()}</pre>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Step 2: Create storage buckets</h2>
        <p className="mb-2">Create the following storage buckets in Supabase:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>transcripts</strong> - For storing interview transcripts</li>
          <li><strong>interview-audio</strong> - For storing interview recordings</li>
        </ul>
        <p>Set both buckets with "Public" access to allow reading files without authentication.</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Step 3: Verify your Supabase configuration</h2>
        <p className="mb-2">Make sure your Supabase URL and API key are correct in the supabaseService.ts file.</p>
        <p className="mb-2">The current configuration is:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>URL: wgerdrdsuusnrdnwwelt.supabase.co</li>
          <li>API Key: <span className="font-mono text-xs">eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...</span> (check supabaseService.ts for the full key)</li>
        </ul>
        <p>These should match your Supabase project settings.</p>
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
      >
        Refresh after setup
      </button>
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

  if (!isDbReady) {
    return <DatabaseSetupInstructions />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
