
import { Link, useLocation } from "react-router-dom";
import { navigationMenuItems } from "../config/navigationConfig";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavigationMenu() {
  const location = useLocation();

  return (
    <SidebarGroup className="pt-6 pb-6">
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
              >
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
