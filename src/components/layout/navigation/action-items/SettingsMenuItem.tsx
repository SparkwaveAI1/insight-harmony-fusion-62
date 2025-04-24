
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function SettingsMenuItem() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Settings">
        <Link to="/settings">
          <Settings />
          <span>Settings</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
