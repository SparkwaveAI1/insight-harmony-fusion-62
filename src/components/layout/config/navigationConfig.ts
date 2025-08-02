
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  Coins,
  Folder,
  FlaskConical,
  Mail,
  BookOpen,
} from "lucide-react";

export const navigationMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Persona Library",
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
    title: "Researcher",
    url: "/research",
    icon: FlaskConical,
  },
  {
    title: "User Guide",
    url: "/docs",
    icon: BookOpen,
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
    title: "Personas",
    href: "/dashboard",
    icon: Users,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
  },
];
