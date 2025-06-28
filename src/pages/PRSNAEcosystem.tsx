
import { useState } from "react";
import { BarChart3, LockIcon, Lightbulb, Bot } from "lucide-react";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Footer from "@/components/sections/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Reveal from "@/components/ui-custom/Reveal";
import { useWeb3Wallet } from "@/hooks/useWeb3Wallet";

// Import components
import EcosystemHero from "@/components/ecosystem/EcosystemHero";
import TokenFeaturesOverview from "@/components/ecosystem/TokenFeaturesOverview";
import DashboardHeader from "@/components/ecosystem/DashboardHeader";
import DashboardOverview from "@/components/ecosystem/dashboard/DashboardOverview";
import StakingTab from "@/components/ecosystem/dashboard/StakingTab";
import ResearchTab from "@/components/ecosystem/dashboard/ResearchTab";
import AIAgentTab from "@/components/ecosystem/dashboard/AIAgentTab";
import StakingPreview from "@/components/ecosystem/StakingPreview";
import QualitativeAnalysis from "@/components/sections/QualitativeAnalysis"; 
import ResearchAgentSection from "@/components/ecosystem/ResearchAgentSection"; 
import AvatarFeature from "@/components/ecosystem/AvatarFeature";

const PRSNAEcosystem = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { 
    isWalletConnected, 
    connectWallet, 
    disconnectWallet,
    mockBalance,
    mockStaked,
    mockAPY,
    mockRewards,
    mockStakingTier
  } = useWeb3Wallet();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
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
        <Section className="bg-muted/50">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto">
              {isWalletConnected ? (
                <>
                  <DashboardHeader
                    title="$PRSNA Dashboard"
                    description="Manage your tokens and access AI research tools"
                    walletAddress="0x7b1B...42Fa"
                    disconnectWallet={disconnectWallet}
                  />
                  
                  <Reveal delay={100}>
                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-10">
                      <TabsList className="grid grid-cols-4 mb-8 bg-muted p-1 border">
                        <TabsTrigger value="dashboard" className="text-sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger value="staking" className="text-sm">
                          <LockIcon className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Staking</span>
                        </TabsTrigger>
                        <TabsTrigger value="research" className="text-sm">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Research</span>
                        </TabsTrigger>
                        <TabsTrigger value="ai-agent" className="text-sm">
                          <Bot className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">AI Agent</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="dashboard">
                        <DashboardOverview 
                          mockBalance={mockBalance}
                          mockStaked={mockStaked}
                          mockAPY={mockAPY}
                          mockRewards={mockRewards}
                          mockStakingTier={mockStakingTier}
                        />
                      </TabsContent>
                      
                      <TabsContent value="staking">
                        <StakingTab mockBalance={mockBalance} />
                      </TabsContent>
                      
                      <TabsContent value="research">
                        <ResearchTab />
                      </TabsContent>
                      
                      <TabsContent value="ai-agent">
                        <AIAgentTab />
                      </TabsContent>
                    </Tabs>
                  </Reveal>
                </>
              ) : (
                <div className="py-16 text-center">
                  <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-8">Connect your wallet to access the full $PRSNA ecosystem</p>
                </div>
              )}
            </div>
          </div>
        </Section>
        
        {/* For non-connected wallet users, show these sections */}
        {!isWalletConnected && (
          <>
            {/* Insights Conductor Section with proper background and spacing */}
            <div className="bg-muted">
              <Section className="pt-8 pb-16" reducedPadding>
                <QualitativeAnalysis />
              </Section>
            </div>
            
            {/* Staking Dashboard Preview */}
            <StakingPreview connectWallet={connectWallet} />
            
            {/* Token Features Overview (below staking) */}
            <Section className="bg-background">
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
