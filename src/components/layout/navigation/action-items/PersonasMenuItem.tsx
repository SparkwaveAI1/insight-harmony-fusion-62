
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function PersonasMenuItem() {
  return (
    <SidebarMenuItem>
      <Link to="/persona-viewer">
        <SidebarMenuButton className="group">
          <Users className="h-5 w-5" />
          <span>View Personas</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}
