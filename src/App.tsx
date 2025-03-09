
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
