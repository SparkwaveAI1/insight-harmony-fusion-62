
import { Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function ModeratorMenuItem() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Moderator">
        <Link to="/moderator">
          <Users2 />
          <span>Moderator</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
