
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  Coins,
  Folder,
  FlaskConical,
  Mail,
  Brain,
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
    title: "Characters",
    url: "/characters-home",
    icon: Brain,
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
    title: "Characters",
    href: "/characters-home",
    icon: Brain,
  },
  {
    title: "PRSNA",
    href: "/prsna",
    icon: Coins,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Mail,
  },
];
