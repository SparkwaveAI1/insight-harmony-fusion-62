
import { SidebarHeading, SidebarMenu } from "@/components/ui/sidebar";
import { CreatePersonaMenuItem } from "./action-items/CreatePersonaMenuItem";
import { InterviewerMenuItem } from "./action-items/InterviewerMenuItem";
import { ResearcherMenuItem } from "./action-items/ResearcherMenuItem";
import { ModeratorMenuItem } from "./action-items/ModeratorMenuItem";
import { AuthMenuItem } from "./action-items/AuthMenuItem";

export function ActionsMenu() {
  return (
    <>
      <SidebarHeading>Actions</SidebarHeading>
      <SidebarMenu>
        <CreatePersonaMenuItem />
        <InterviewerMenuItem />
        <ResearcherMenuItem />
        <ModeratorMenuItem />
        <AuthMenuItem />
      </SidebarMenu>
    </>
  );
}
