
// 🚨 CRITICAL DEPLOYMENT VERIFICATION 🚨
// If you don't see these logs on the published site, deployment is broken
const CRITICAL_DEPLOYMENT_TEST = `CRITICAL_DEPLOYMENT_${Date.now()}_EMERGENCY_VERIFICATION`;
console.log(`🚨🚨🚨 CRITICAL: ${CRITICAL_DEPLOYMENT_TEST} 🚨🚨🚨`);
console.log(`🔥🔥🔥 INDEX PAGE EMERGENCY VERIFICATION - NEW CODE RUNNING! 🔥🔥🔥`);
console.log(`💀💀💀 IF YOU SEE THIS MESSAGE, DEPLOYMENT WORKED! 💀💀💀`);

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
