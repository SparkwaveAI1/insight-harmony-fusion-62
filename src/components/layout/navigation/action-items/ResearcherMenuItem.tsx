
import { FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function ResearcherMenuItem() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Researcher">
        <Link to="/research">
          <FlaskConical />
          <span>Researcher</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
