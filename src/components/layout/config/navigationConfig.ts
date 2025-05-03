
import { User, Users, Library, FlaskConical, PieChart, BarChart3, BookText, Coins } from "lucide-react";

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
    url: "/persona-viewer",
    icon: Library,
  },
  {
    title: "Create Simulated Persona",
    url: "/simulated-persona",
    icon: User,
  },
  {
    title: "Interview",
    url: "/interviewer",
    icon: BookText,
  },
  {
    title: "Research",
    url: "/research",
    icon: FlaskConical,
  },
  {
    title: "$PRSNA Ecosystem",
    url: "/prsna-ecosystem",
    icon: Coins,
  },
];
