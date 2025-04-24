
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { NavigationMenu } from "./navigation/NavigationMenu";
import { ActionsMenu } from "./navigation/ActionsMenu";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-semibold">PersonaAI</span>
        </Link>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <NavigationMenu />
        <ActionsMenu />
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">v1.0.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
