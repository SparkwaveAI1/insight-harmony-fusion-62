
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import Logo from "@/components/ui-custom/Logo";
import {
  Folder,
  Users,
  User,
  Layers,
  MessageSquare,
  LayoutDashboard,
  BadgeDollarSign
} from "lucide-react";

export function AppSidebar() {
  return (
    <Sidebar className="w-64 border-r min-h-svh p-4 md:py-8">
      <div className="flex flex-col h-full justify-between gap-4">
        <div>
          <div className="ml-2 mb-6">
            <Link to="/" className="flex items-center">
              <Logo size="md" className="text-foreground" />
            </Link>
          </div>

          <nav className="grid gap-1">
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/my-personas"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="mr-2 h-5 w-5" />
              <span>My Personas</span>
            </Link>
            <Link
              to="/projects"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start text-muted-foreground hover:text-foreground"
              )}
            >
              <Folder className="mr-2 h-5 w-5" />
              <span>Projects</span>
            </Link>
            <Link
              to="/collections"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="mr-2 h-5 w-5" />
              <span>Collections</span>
            </Link>
            <Link
              to="/persona-viewer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="mr-2 h-5 w-5" />
              <span>Persona Library</span>
            </Link>
            <Link
              to="/dual-chat"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              <span>Multi-Persona Chat</span>
            </Link>

            <div className="border-t border-border my-4"></div>

            <Link
              to="/prsna-ecosystem"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "justify-start text-muted-foreground hover:text-foreground"
              )}
            >
              <BadgeDollarSign className="mr-2 h-5 w-5" />
              <span>$PRSNA Ecosystem</span>
            </Link>
          </nav>
        </div>

        <Link
          to="/custom-research"
          className={buttonVariants({ variant: "outline" })}
        >
          Custom Research
        </Link>
      </div>
    </Sidebar>
  );
}
