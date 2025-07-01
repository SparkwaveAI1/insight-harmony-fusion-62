
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import Logo from "@/components/ui-custom/Logo";
import { NavigationMenu } from "./navigation/NavigationMenu";
import { Button } from "@/components/ui/button";

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

          <div className="font-orbitron">
            <NavigationMenu />
          </div>
        </div>

        <Button asChild variant="outline" className="font-orbitron">
          <Link to="/custom-research">
            Custom Research
          </Link>
        </Button>
      </div>
    </Sidebar>
  );
}
