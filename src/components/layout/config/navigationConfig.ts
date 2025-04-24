
import { User, Library, Folder } from "lucide-react";

export const navigationMenuItems = [
  {
    title: "My Personas",
    icon: User,
    url: "/persona-viewer",
  },
  {
    title: "Persona Library",
    icon: Library,
    url: "/persona-viewer",  // Updated to point to persona-viewer
  },
  {
    title: "Collections",
    icon: Folder,
    url: "/collections",
  },
];
