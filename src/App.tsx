
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
import PersonaCreationLanding from "./pages/persona-creation/PersonaCreationLanding";
import PersonaCreationScreener from "./pages/persona-creation/PersonaCreationScreener";
import PersonaCreationQuestionnaire from "./pages/persona-creation/PersonaCreationQuestionnaire";
import "./App.css";
import "./index.css";

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
    path: "/participate-research",
    element: <ParticipateResearch />,
  },
  {
    path: "/team",
    element: <Team />,
  },
  {
    path: "/persona-creation/landing",
    element: <PersonaCreationLanding />,
  },
  {
    path: "/persona-creation/screener",
    element: <PersonaCreationScreener />,
  },
  {
    path: "/persona-creation/questionnaire",
    element: <PersonaCreationQuestionnaire />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
