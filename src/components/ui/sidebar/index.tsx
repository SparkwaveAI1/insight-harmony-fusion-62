
import { TooltipProvider } from "@/components/ui/tooltip";

// Re-export everything from component files
export { useSidebar, SidebarProvider } from "./context";

export { 
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset
} from "./main-components";

export {
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent
} from "./content-components";

export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent
} from "./group-components";

export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton
} from "./menu-components";

export {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "./submenu-components";

// Wrap the TooltipProvider so other components can use it
export { TooltipProvider };
