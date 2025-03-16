
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PersonaAIInterviewer from "./pages/PersonaAIInterviewer";
import AIFocusGroups from "./pages/AIFocusGroups";
import EarnPRSNA from "./pages/EarnPRSNA";
import Contact from "./pages/Contact";
import Research from "./pages/Research";
import Interviewer from "./pages/Interviewer";
import YourPersona from "./pages/YourPersona";
import Pricing from "./pages/Pricing";
import InterviewProcess from "./pages/InterviewProcess";
import ParticipateResearch from "./pages/ParticipateResearch";
import Team from "./pages/Team";
import InterviewLanding from "./pages/InterviewLanding";
import PreInterviewQuestionnaire from "./pages/PreInterviewQuestionnaire";
import ResearchAvatar from "./pages/ResearchAvatar";
import "./App.css";
import "./index.css";

// Add detailed console logs for debugging
console.log('App.tsx is executing and setting up router');

// Create router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/research",
    element: <Research />,
  },
  {
    path: "/interviewer",
    element: <Interviewer />,
  },
  {
    path: "/your-persona",
    element: <YourPersona />,
  },
  {
    path: "/persona-ai-interviewer",
    element: <PersonaAIInterviewer />,
  },
  {
    path: "/ai-focus-groups",
    element: <AIFocusGroups />,
  },
  {
    path: "/prsna-ecosystem",
    element: <Navigate to="/earn-prsna" replace />,
  },
  {
    path: "/earn-prsna",
    element: <EarnPRSNA />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/interview-process",
    element: <InterviewProcess />,
  },
  {
    path: "/interview-landing",
    element: <InterviewLanding />,
  },
  {
    path: "/pre-interview-questionnaire",
    element: <PreInterviewQuestionnaire />,
  },
  {
    path: "/participate-research",
    element: <ParticipateResearch />,
  },
  {
    path: "/team",
    element: <Team />,
  },
  {
    path: "/research-avatar",
    element: <ResearchAvatar />,
  },
]);

function App() {
  console.log('App component rendered');
  
  try {
    console.log('About to return RouterProvider');
    return <RouterProvider router={router} />;
  } catch (error) {
    console.error('Error rendering RouterProvider:', error);
    return <div>Error loading application. Check console for details.</div>;
  }
}

export default App;
