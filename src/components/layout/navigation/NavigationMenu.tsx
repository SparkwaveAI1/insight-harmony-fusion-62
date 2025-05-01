
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
          {navigationMenuItems.map((item) => {
            const isActive = location.pathname === item.url || 
                            (item.url !== "/" && location.pathname.startsWith(item.url));
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link to={item.url}>
                    <item.icon className="h-5 w-5" />
                    <span className="ml-2">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
