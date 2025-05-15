
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  Settings,
  UserPlus,
  Coins,
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
    title: "PRSNA Token",
    url: "/prsna",
    icon: Coins,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

// Header navigation - simplified menu for the header
export const headerNavItems = [
  {
    title: "Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Personas",
    href: "/persona-viewer",
    icon: Users,
  },
  {
    title: "Create",
    href: "/simulated-persona",
    icon: UserPlus,
  },
  {
    title: "PRSNA",
    href: "/prsna",
    icon: Coins,
  },
];
