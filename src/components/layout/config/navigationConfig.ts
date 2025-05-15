
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  Settings,
  UserPlus,
} from "lucide-react";

export const navigationMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Personas",
    url: "/persona-viewer",
    icon: Users,
  },
  {
    title: "Create a Persona",
    url: "/simulated-persona",
    icon: UserPlus,
  },
  {
    title: "Chat",
    url: "/dual-chat",
    icon: MessageSquare,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Briefcase,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
