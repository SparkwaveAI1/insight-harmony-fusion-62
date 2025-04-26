
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const Collections = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6 flex flex-col items-center justify-center">
            <div className="max-w-3xl text-center">
              <h1 className="text-4xl font-bold mb-4">Collections Under Construction</h1>
              <p className="text-muted-foreground text-lg">
                Coming soon: organize your personas according for specific projects or preferences
              </p>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Collections;
