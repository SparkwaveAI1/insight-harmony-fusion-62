
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { CreatePersonaMenuItem } from "./action-items/CreatePersonaMenuItem";
import { InterviewerMenuItem } from "./action-items/InterviewerMenuItem";
import { ResearcherMenuItem } from "./action-items/ResearcherMenuItem";
import { ModeratorMenuItem } from "./action-items/ModeratorMenuItem";

export function ActionsMenu() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Actions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <CreatePersonaMenuItem />
          <InterviewerMenuItem />
          <ResearcherMenuItem />
          <ModeratorMenuItem />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
