
import { Link, useLocation } from "react-router-dom";
import { navigationMenuItems, adminNavItems } from "../config/navigationConfig";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const ADMIN_EMAILS = ["your-email@example.com"]; // Replace with actual admin emails

export function NavigationMenu() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  
  // Combine regular navigation with admin items if user is admin
  const allNavItems = isAdmin ? [...navigationMenuItems, ...adminNavItems] : navigationMenuItems;

  return (
    <SidebarGroup className="pt-6 pb-6">
      <SidebarGroupContent>
        <SidebarMenu>
          {allNavItems.map((item) => {
            const isActive = location.pathname === item.url || 
                            (item.url !== "/" && location.pathname.startsWith(item.url));
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className="font-orbitron"
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
