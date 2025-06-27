import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Providers } from "@/lib/providers";

// Lazy load pages for better performance
const Index = lazy(() => import("@/pages/Index"));
const PersonaViewer = lazy(() => import("@/pages/PersonaViewer"));
const PersonaDetail = lazy(() => import("@/pages/PersonaDetail"));
const PersonaChat = lazy(() => import("@/pages/PersonaChat"));
const CharacterChat = lazy(() => import("@/pages/CharacterChat"));
const Research = lazy(() => import("@/pages/Research"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Collections = lazy(() => import("@/pages/Collections"));
const CollectionDetail = lazy(() => import("@/pages/CollectionDetail"));
const ConversationDetail = lazy(() => import("@/pages/ConversationDetail"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Auth = lazy(() => import("@/pages/Auth"));
const PersonaCreationLanding = lazy(() => import("@/pages/persona-creation/PersonaCreationLanding"));
const PersonaCreationScreener = lazy(() => import("@/pages/persona-creation/PersonaCreationScreener"));
const ConsentForm = lazy(() => import("@/pages/persona-creation/ConsentForm"));
const PersonaCreationQuestionnaire = lazy(() => import("@/pages/persona-creation/PersonaCreationQuestionnaire"));
const PersonaCreationComplete = lazy(() => import("@/pages/persona-creation/PersonaCreationComplete"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SimulatedPersona = lazy(() => import("@/pages/SimulatedPersona"));
const WhitePaper = lazy(() => import("@/pages/WhitePaper"));
const Team = lazy(() => import("@/pages/Team"));
const Contact = lazy(() => import("@/pages/Contact"));
const PersonaAIInterviewer = lazy(() => import("@/pages/PersonaAIInterviewer"));
const Interviewer = lazy(() => import("@/pages/Interviewer"));
const InterviewProcess = lazy(() => import("@/pages/InterviewProcess"));
const AIFocusGroups = lazy(() => import("@/pages/AIFocusGroups"));
const YourPersona = lazy(() => import("@/pages/YourPersona"));
const PRSNAEcosystem = lazy(() => import("@/pages/PRSNAEcosystem"));
const EarnPRSNA = lazy(() => import("@/pages/EarnPRSNA"));
const Roadmap = lazy(() => import("@/pages/Roadmap"));
const ParticipateResearch = lazy(() => import("@/pages/ParticipateResearch"));
const CustomResearch = lazy(() => import("@/pages/CustomResearch"));
const InsightConductor = lazy(() => import("@/pages/InsightConductor"));
const Pricing = lazy(() => import("@/pages/Pricing"));

// Character pages
const CharacterLibrary = lazy(() => import("@/characters/pages/CharacterLibrary"));
const CharacterCreate = lazy(() => import("@/characters/pages/CharacterCreate"));
const CharacterDetail = lazy(() => import("@/characters/pages/CharacterDetail"));
const CharacterEdit = lazy(() => import("@/characters/pages/CharacterEdit"));
const HistoricalCharacterCreate = lazy(() => import("@/characters/pages/HistoricalCharacterCreate"));
const FictionalCharacterCreate = lazy(() => import("@/characters/pages/FictionalCharacterCreate"));
const CharacterDashboard = lazy(() => import("@/characters/pages/CharacterDashboard"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Providers>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/persona-viewer" element={<PersonaViewer />} />
                <Route path="/personas/:personaId" element={<PersonaDetail />} />
                <Route path="/personas/:personaId/chat" element={<PersonaChat />} />
                <Route path="/research" element={<Research />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:collectionId" element={<CollectionDetail />} />
                <Route path="/conversations/:conversationId" element={<ConversationDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/persona-creation" element={<PersonaCreationLanding />} />
                <Route path="/persona-creation/screener" element={<PersonaCreationScreener />} />
                <Route path="/persona-creation/consent" element={<ConsentForm />} />
                <Route path="/persona-creation/questionnaire" element={<PersonaCreationQuestionnaire />} />
                <Route path="/persona-creation/complete" element={<PersonaCreationComplete />} />
                <Route path="/simulated-persona" element={<SimulatedPersona />} />
                <Route path="/whitepaper" element={<WhitePaper />} />
                <Route path="/team" element={<Team />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/persona-ai-interviewer" element={<PersonaAIInterviewer />} />
                <Route path="/interviewer" element={<Interviewer />} />
                <Route path="/interview-process" element={<InterviewProcess />} />
                <Route path="/ai-focus-groups" element={<AIFocusGroups />} />
                <Route path="/your-persona" element={<YourPersona />} />
                <Route path="/prsna-ecosystem" element={<PRSNAEcosystem />} />
                <Route path="/earn-prsna" element={<EarnPRSNA />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/participate-research" element={<ParticipateResearch />} />
                <Route path="/custom-research" element={<CustomResearch />} />
                <Route path="/insight-conductor" element={<InsightConductor />} />
                <Route path="/pricing" element={<Pricing />} />
                
                {/* Character routes */}
                <Route path="/characters" element={<CharacterLibrary />} />
                <Route path="/characters/create" element={<CharacterCreate />} />
                <Route path="/characters/create/historical" element={<HistoricalCharacterCreate />} />
                <Route path="/characters/create/fictional" element={<FictionalCharacterCreate />} />
                <Route path="/characters/dashboard" element={<CharacterDashboard />} />
                <Route path="/characters/:characterId" element={<CharacterDetail />} />
                <Route path="/characters/:characterId/edit" element={<CharacterEdit />} />
                <Route path="/characters/:characterId/chat" element={<CharacterChat />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </Providers>
    </QueryClientProvider>
  );
}

export default App;
