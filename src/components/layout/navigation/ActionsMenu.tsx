
import { Link } from "react-router-dom";
import { actionMenuItems } from "../config/navigationConfig";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function ActionsMenu() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Actions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {actionMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
