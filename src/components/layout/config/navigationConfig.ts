
import { Home, User, Search, Folder, Mic } from "lucide-react";

export const navigationMenuItems = [
  {
    title: "Home",
    icon: Home,
    url: "/",
  },
  {
    title: "My Personas",
    icon: User,
    url: "/persona-viewer",
  },
  {
    title: "Persona Library",
    icon: Folder,
    url: "/library",
  },
];

export const actionMenuItems = [
  {
    title: "Persona Builder",
    icon: User,
    url: "/simulated-persona",
  },
  {
    title: "Interviewer",
    icon: Mic,
    url: "/interviewer",
  },
  {
    title: "Researcher",
    icon: Search,
    url: "/research",
  },
];
