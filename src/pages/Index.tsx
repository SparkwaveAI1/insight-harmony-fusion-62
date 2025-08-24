
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { homepageSections } from "@/config/homePageSections";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="pt-24">
          {homepageSections.map(({ id, Component }) => (
            <Component key={id} />
          ))}
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;
