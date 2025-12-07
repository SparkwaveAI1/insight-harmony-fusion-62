import { CollectionMatcherTest } from "@/components/admin/CollectionMatcherTest";
import { EmbeddingGenerator } from "@/components/admin/EmbeddingGenerator";
import { SemanticSearchTest } from "@/components/admin/SemanticSearchTest";
import { CollectionPersonaMatcher } from "@/components/collections/CollectionPersonaMatcher";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const MatcherTest = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex min-h-svh flex-col">
            <Header />
            <main className="flex-1 pt-24">
              <div className="container py-6 space-y-6">
                <div className="flex items-center justify-between">
                  <SidebarTrigger className="hidden md:flex" />
                  <h1 className="text-3xl font-bold">Collection Matcher Test</h1>
                </div>
                <CollectionPersonaMatcher />
                <SemanticSearchTest />
                <EmbeddingGenerator />
                <CollectionMatcherTest />
              </div>
            </main>
            <Footer />
            <Toaster />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MatcherTest;
