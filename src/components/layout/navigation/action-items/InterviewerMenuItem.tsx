
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function InterviewerMenuItem() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Persona Interviewer">
        <Link to="/interviewer">
          <Users />
          <span>Persona Interviewer</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
