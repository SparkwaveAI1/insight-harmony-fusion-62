import { useState } from "react";
import { Lightbulb, Bot } from "lucide-react";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Footer from "@/components/sections/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Reveal from "@/components/ui-custom/Reveal";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";

// Import components
import EcosystemHero from "@/components/ecosystem/EcosystemHero";
import TokenFeaturesOverview from "@/components/ecosystem/TokenFeaturesOverview";
import ResearchTab from "@/components/ecosystem/dashboard/ResearchTab";
import AIAgentTab from "@/components/ecosystem/dashboard/AIAgentTab";
import ResearchAgentSection from "@/components/ecosystem/ResearchAgentSection";
import AvatarFeature from "@/components/ecosystem/AvatarFeature";

const PRSNAEcosystem = () => {
  const [activeTab, setActiveTab] = useState("research");
  const { 
    isWalletConnected, 
    connectWallet, 
    disconnectWallet
  } = useWeb3Wallet();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <EcosystemHero 
          isWalletConnected={isWalletConnected}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          setActiveTab={setActiveTab}
        />

        {/* AI Avatar Feature Section - Directly under Hero */}
        <Section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16 mt-0">
          <AvatarFeature />
        </Section>
        
        {/* Research Agent Section */}
        {!isWalletConnected && <ResearchAgentSection />}
        
        {/* Web3 Dashboard Section */}
        <Section className="bg-gray-900">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto">
              {isWalletConnected && (
                <Reveal delay={100}>
                  <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-10">
                    <TabsList className="grid grid-cols-2 mb-8 bg-gray-800 p-1 border border-gray-700">
                      <TabsTrigger value="research" className="data-[state=active]:bg-gray-700">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Research</span>
                      </TabsTrigger>
                      <TabsTrigger value="ai-agent" className="data-[state=active]:bg-gray-700">
                        <Bot className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">AI Agent</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="research">
                      <ResearchTab />
                    </TabsContent>
                    
                    <TabsContent value="ai-agent">
                      <AIAgentTab />
                    </TabsContent>
                  </Tabs>
                </Reveal>
              )}
            </div>
          </div>
        </Section>
        
        {/* For non-connected wallet users, show token features */}
        {!isWalletConnected && (
          <>
            {/* Token Features Overview */}
            <Section className="bg-gray-900">
              <div className="container px-4 mx-auto">
                <div className="max-w-5xl mx-auto">
                  <TokenFeaturesOverview />
                </div>
              </div>
            </Section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PRSNAEcosystem;
