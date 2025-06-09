
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  Coins,
  Folder,
  FlaskConical,
  Microscope,
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
    title: "Collections",
    url: "/collections",
    icon: Folder,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Briefcase,
  },
  {
    title: "Interviewer",
    url: "/interviewer",
    icon: Microscope,
  },
  {
    title: "Researcher",
    url: "/research",
    icon: FlaskConical,
  },
  {
    title: "PRSNA Token",
    url: "/prsna",
    icon: Coins,
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
    title: "Web3",
    href: "/prsna",
    icon: Coins,
  },
];
