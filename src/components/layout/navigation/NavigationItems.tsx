import {
  LayoutDashboard,
  Calendar,
  HelpCircle,
  Settings,
  Compass,
  Route,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon?: any;
  description?: string;
  disabled?: boolean;
  external?: boolean;
  submenu?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Getting Started",
    href: "/docs",
    icon: LayoutDashboard,
    description: "Explore the documentation",
  },
  {
    title: "Roadmap",
    href: "/prsna/roadmap",
    icon: Route,
    description: "See our development plan and milestones",
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
    disabled: true,
    description: "Check out upcoming events",
  },
  {
    title: "Support",
    href: "/support",
    icon: HelpCircle,
    description: "Get help with PersonaAI",
    submenu: [
      {
        title: "Documentation",
        href: "/docs",
        description: "Explore the documentation",
      },
      {
        title: "Roadmap",
        href: "/roadmap",
        description: "See what's coming up next",
      },
      {
        title: "Support",
        href: "/support",
        description: "Get help with PersonaAI",
      },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Manage your account settings",
  },
  
  // Add these items after the existing ones
  {
    title: "Build Personas",
    href: "/simulated-persona",
    submenu: [
      {
        title: "Generate AI Persona",
        href: "/simulated-persona",
        description: "Create behaviorally accurate AI personas"
      },
      {
        title: "View Personas",
        href: "/persona-viewer",
        description: "Browse and view your generated personas"
      }
    ]
  },
  
];
