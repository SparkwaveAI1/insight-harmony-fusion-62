
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PersonaAIInterviewer from "./pages/PersonaAIInterviewer";
import AIFocusGroups from "./pages/AIFocusGroups";
import PRSNAEcosystem from "./pages/PRSNAEcosystem";
import Contact from "./pages/Contact";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
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
    element: <PRSNAEcosystem />,
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
