
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function CreatePersonaMenuItem() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Create Simulated Persona">
        <Link to="/simulated-persona">
          <Plus />
          <span>Create Simulated Persona</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
