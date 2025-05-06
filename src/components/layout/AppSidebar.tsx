
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import Logo from "@/components/ui-custom/Logo";
import { navigationMenuItems } from "./config/navigationConfig";

export function AppSidebar() {
  return (
    <Sidebar className="w-64 bg-[#222222] border-r min-h-svh p-4 md:py-8">
      <div className="flex flex-col h-full justify-between gap-4">
        <div>
          <div className="ml-2 mb-6">
            <Link to="/" className="flex items-center">
              <Logo size="md" className="text-white" />
            </Link>
          </div>

          <nav className="grid gap-1">
            {navigationMenuItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "justify-start text-gray-300 hover:text-white hover:bg-[#333333]"
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>

        <Link
          to="/custom-research"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-gray-600 text-gray-300 hover:text-white hover:bg-[#333333]"
          )}
        >
          Custom Research
        </Link>
      </div>
    </Sidebar>
  );
}
