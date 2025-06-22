
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import Logo from "@/components/ui-custom/Logo";
import { navigationMenuItems } from "./config/navigationConfig";
import ResearchModeSelector from "@/components/research/ResearchModeSelector";

export function AppSidebar() {
  const [showResearchSelector, setShowResearchSelector] = useState(false);

  const handleResearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowResearchSelector(true);
  };

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
            {navigationMenuItems.map((item) => {
              // Special handling for Researcher
              if (item.title === "Researcher") {
                return (
                  <button
                    key={item.title}
                    onClick={handleResearchClick}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "lg" }),
                      "justify-start text-muted-foreground hover:text-foreground w-full"
                    )}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                  </button>
                );
              }

              // Regular navigation items
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "justify-start text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          to="/custom-research"
          className={buttonVariants({ variant: "outline" })}
        >
          Custom Research
        </Link>
      </div>

      <ResearchModeSelector 
        open={showResearchSelector}
        onOpenChange={setShowResearchSelector}
      />
    </Sidebar>
  );
}
