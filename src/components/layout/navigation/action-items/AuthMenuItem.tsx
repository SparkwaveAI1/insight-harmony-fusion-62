
import { LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function AuthMenuItem() {
  const { user, signOut, isLoading } = useAuth();

  if (!user) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Sign In">
          <Link to="/auth">
            <User />
            <span>Sign In</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        tooltip="Sign Out" 
        onClick={signOut}
        disabled={isLoading}
      >
        <LogOut />
        <span>Sign Out</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
