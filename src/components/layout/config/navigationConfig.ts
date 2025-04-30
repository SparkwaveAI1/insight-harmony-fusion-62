
import { User, Users, Library, FlaskConical, PieChart, BarChart3, BookText, MessageCircle } from "lucide-react";

export const navigationMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: PieChart,
  },
  {
    title: "My Personas",
    url: "/my-personas",
    icon: User,
  },
  {
    title: "Collections",
    url: "/collections",
    icon: Users,
  },
  {
    title: "Persona Library",
    url: "/persona-library",
    icon: Library,
  },
  {
    title: "Research",
    url: "/research",
    icon: FlaskConical,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: BarChart3,
  },
  {
    title: "Interview",
    url: "/interviewer",
    icon: BookText,
  },
  {
    title: "Chat",
    url: "/dual-chat",
    icon: MessageCircle,
  },
];

export const actionMenuItems = [
  {
    title: "Create Persona",
    url: "/persona-creation",
    icon: User,
  },
  {
    title: "New Interview",
    url: "/interviewer",
    icon: BookText,
  },
  {
    title: "AI Moderator",
    url: "/ai-focus-groups",
    icon: MessageCircle,
  },
];
