
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuItemContent, SidebarMenuItemIcon } from "@/components/ui/sidebar";

export function PersonasMenuItem() {
  return (
    <SidebarMenuItem>
      <Link to="/persona-viewer">
        <SidebarMenuItemContent className="group">
          <SidebarMenuItemIcon>
            <Users className="h-5 w-5" />
          </SidebarMenuItemIcon>
          <span>View Personas</span>
        </SidebarMenuItemContent>
      </Link>
    </SidebarMenuItem>
  );
}
