
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  Coins,
  Folder,
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
