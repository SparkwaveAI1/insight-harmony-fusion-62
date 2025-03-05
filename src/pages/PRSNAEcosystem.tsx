
import { useState } from "react";
import { 
  ArrowRight, 
  Rocket, 
  Globe, 
  TrendingUp, 
  Link as LinkIcon, 
  Wallet, 
  LockIcon, 
  Bot, 
  Users, 
  ChevronRight,
  Plus,
  BarChart3,
  Lightbulb,
  MessageSquare,
  Gem,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import Card from "@/components/ui-custom/Card";
import Footer from "@/components/sections/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRSNAEcosystem = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stakeAmount, setStakeAmount] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: "user" | "assistant"; content: string}[]>([
    {role: "assistant", content: "Hello! I'm your PersonaAI research agent. How can I help with market insights today?"}
  ]);
  
  const mockBalance = "1,245.00";
  const mockStaked = "750.00";
  const mockAPY = "12.5%";
  const mockRewards = "22.43";
  const mockStakingTier = "Silver";
  
  const connectWallet = () => {
    // In a real implementation, this would connect to a wallet provider
    setIsWalletConnected(true);
  };
  
  const disconnectWallet = () => {
    setIsWalletConnected(false);
  };
  
  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock staking logic
    if (stakeAmount && !isNaN(Number(stakeAmount))) {
      alert(`Successfully staked ${stakeAmount} $PRSNA tokens!`);
      setStakeAmount("");
    } else {
      alert("Please enter a valid amount to stake");
    }
  };
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // Add user message to chat
    const newChatHistory = [
      ...chatHistory,
      {role: "user" as const, content: chatMessage}
    ];
    setChatHistory(newChatHistory);
    
    // Mock AI response
    setTimeout(() => {
      setChatHistory([
        ...newChatHistory,
        {role: "assistant" as const, content: "Thank you for your message. Based on current market sentiment analysis, DeFi projects are showing increased user engagement despite market volatility. NFT sentiment trends indicate a shift toward utility-focused collections."}
      ]);
    }, 1000);
    
    setChatMessage("");
  };
  
  const sections = [
    {
      id: "token-utility",
      title: "Token Utility & Research Access",
      description: "$PRSNA fuels AI-driven market intelligence. Token holders gain access to exclusive research insights, AI-generated intelligence, and staking rewards.",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
    },
    {
      id: "staking",
      title: "Staking & Research Rewards",
      description: "Stake $PRSNA to unlock premium AI-generated insights, participate in focus groups, and earn staking rewards.",
      icon: <LockIcon className="h-6 w-6 text-primary" />,
    },
    {
      id: "research",
      title: "Web3 Research & AI Insights",
      description: "Gain access to AI-powered market intelligence, tracking sentiment across DAOs, DeFi, and NFT ecosystems.",
      icon: <Globe className="h-6 w-6 text-primary" />,
    },
    {
      id: "token-ecosystem",
      title: "Token Utility & AI-Powered Research",
      description: "$PRSNA is the key to accessing PersonaAI's intelligence ecosystem for AI-driven insights and market data.",
      icon: <Rocket className="h-6 w-6 text-primary" />,
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Section className="bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <div className="inline-flex items-center justify-center bg-primary/20 px-4 py-2 rounded-full mb-6">
                  <Rocket className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">Base Chain</span>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 font-plasmik">
                  PersonaAI Web3: Research Layer for Base Chain
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="text-gray-300 text-pretty mb-10 max-w-2xl mx-auto">
                  The $PRSNA token powers AI-driven market research and qualitative intelligence. 
                  Stake $PRSNA to unlock premium insights, research tools, and AI-powered predictions.
                </p>
              </Reveal>
              
              <Reveal delay={300}>
                {!isWalletConnected ? (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="group bg-gradient-to-r from-primary to-primary/80 border-none"
                    onClick={connectWallet}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="group border-gray-700 hover:bg-gray-800"
                      onClick={disconnectWallet}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="group bg-gradient-to-r from-primary to-primary/80 border-none"
                      onClick={() => setActiveTab("staking")}
                    >
                      <LockIcon className="w-4 h-4 mr-2" />
                      Stake $PRSNA
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                    </Button>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </Section>

        {/* Web3 Dashboard Section */}
        <Section className="bg-gray-900">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto">
              {isWalletConnected ? (
                <>
                  <Reveal>
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold">$PRSNA Dashboard</h2>
                        <p className="text-gray-400">
                          Manage your tokens and access AI research tools
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-0 px-4 py-2 bg-gray-800 rounded-lg flex items-center border border-gray-700">
                        <Wallet className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          0x7b1B...42Fa
                        </span>
                      </div>
                    </div>
                  </Reveal>
                  
                  <Reveal delay={100}>
                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-10">
                      <TabsList className="grid grid-cols-4 mb-8 bg-gray-800 p-1 border border-gray-700">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-gray-700">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger value="staking" className="data-[state=active]:bg-gray-700">
                          <LockIcon className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Staking</span>
                        </TabsTrigger>
                        <TabsTrigger value="research" className="data-[state=active]:bg-gray-700">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Research</span>
                        </TabsTrigger>
                        <TabsTrigger value="ai-agent" className="data-[state=active]:bg-gray-700">
                          <Bot className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">AI Agent</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card className="p-4 bg-gray-800 border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-1">$PRSNA Balance</h3>
                            <p className="text-2xl font-bold">{mockBalance}</p>
                          </Card>
                          <Card className="p-4 bg-gray-800 border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-1">Staked $PRSNA</h3>
                            <p className="text-2xl font-bold">{mockStaked}</p>
                          </Card>
                          <Card className="p-4 bg-gray-800 border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-1">Current APY</h3>
                            <p className="text-2xl font-bold text-primary">{mockAPY}</p>
                          </Card>
                          <Card className="p-4 bg-gray-800 border-gray-700">
                            <h3 className="text-sm font-medium text-gray-400 mb-1">Rewards</h3>
                            <p className="text-2xl font-bold text-primary">{mockRewards}</p>
                          </Card>
                        </div>
                        
                        <Card className="p-6 bg-gray-800 border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Research Access</h3>
                            <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                              {mockStakingTier} Tier
                            </div>
                          </div>
                          <p className="text-gray-400 mb-4">
                            Your current staking position grants you access to:
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>AI Focus Group participation (up to 3 per month)</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Unlimited access to the AI Persona Interviewer</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Weekly market sentiment reports</span>
                            </li>
                          </ul>
                          <div className="mt-6">
                            <Button className="bg-gray-700 hover:bg-gray-600 border-none">
                              <Plus className="h-4 w-4 mr-2" />
                              Stake more for Gold Tier
                            </Button>
                          </div>
                        </Card>
                        
                        {/* Live AI Insights Preview */}
                        <Card className="p-6 bg-gray-800 border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Live AI Insights</h3>
                            <div className="px-3 py-1 bg-green-900/40 text-green-400 rounded-full text-xs flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              LIVE
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Bot className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm font-medium">DeFi Sentiment</span>
                              </div>
                              <p className="text-xs text-gray-300">
                                Positive shift in Base Chain DeFi protocols sentiment over the past 24 hours. User engagement up 12% despite market volatility.
                              </p>
                            </div>
                            <div className="p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Bot className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm font-medium">NFT Market Trend</span>
                              </div>
                              <p className="text-xs text-gray-300">
                                Sentiment analysis indicates shift toward utility-focused NFT collections. Collections with clear use cases show 3x more positive mentions.
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 text-right">
                            <Button variant="link" className="text-primary p-0 h-auto">
                              View Full Research Hub
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="staking" className="space-y-6">
                        <Card className="p-6 bg-gray-800 border-gray-700">
                          <h3 className="text-xl font-semibold mb-4">Stake $PRSNA Tokens</h3>
                          <p className="text-gray-400 mb-6">
                            Stake your tokens to earn rewards and gain access to advanced research features.
                            The longer you stake, the higher your rewards and research access levels.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="p-4 border-2 border-gray-700 hover:border-primary cursor-pointer transition-all bg-gray-800/80">
                              <h4 className="font-semibold mb-2">30 Days</h4>
                              <p className="text-primary text-lg font-bold mb-1">8% APY</p>
                              <p className="text-xs text-gray-400">Bronze Tier Access</p>
                            </Card>
                            <Card className="p-4 border-2 border-primary cursor-pointer transition-all bg-primary/5">
                              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-primary text-black text-xs rounded-full">
                                Popular
                              </div>
                              <h4 className="font-semibold mb-2">90 Days</h4>
                              <p className="text-primary text-lg font-bold mb-1">12.5% APY</p>
                              <p className="text-xs text-gray-400">Silver Tier Access</p>
                            </Card>
                            <Card className="p-4 border-2 border-gray-700 hover:border-primary cursor-pointer transition-all bg-gray-800/80">
                              <h4 className="font-semibold mb-2">180 Days</h4>
                              <p className="text-primary text-lg font-bold mb-1">18% APY</p>
                              <p className="text-xs text-gray-400">Gold Tier Access</p>
                            </Card>
                          </div>
                          
                          <form onSubmit={handleStakeSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="stake-amount" className="text-gray-300">Amount to Stake</Label>
                              <div className="relative mt-1">
                                <Input
                                  id="stake-amount"
                                  type="number"
                                  placeholder="0.00"
                                  value={stakeAmount}
                                  onChange={(e) => setStakeAmount(e.target.value)}
                                  className="pl-3 pr-20 bg-gray-800 border-gray-700 text-white"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <span className="text-gray-400">$PRSNA</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Available: {mockBalance} $PRSNA
                              </p>
                            </div>
                            
                            <div className="flex gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700"
                                onClick={() => setStakeAmount((parseFloat(mockBalance.replace(/,/g, '')) / 4).toString())}
                              >
                                25%
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700"
                                onClick={() => setStakeAmount((parseFloat(mockBalance.replace(/,/g, '')) / 2).toString())}
                              >
                                50%
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700"
                                onClick={() => setStakeAmount(mockBalance.replace(/,/g, ''))}
                              >
                                Max
                              </Button>
                            </div>
                            
                            <Button 
                              type="submit" 
                              className="w-full bg-gradient-to-r from-primary to-primary/80 border-none"
                            >
                              Stake Tokens
                            </Button>
                          </form>
                        </Card>
                        
                        <Card className="p-6 bg-gray-800 border-gray-700">
                          <h3 className="text-xl font-semibold mb-4">Your Staking Positions</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-700">
                                  <th className="py-2 text-left">Amount</th>
                                  <th className="py-2 text-left">Lock Period</th>
                                  <th className="py-2 text-left">APY</th>
                                  <th className="py-2 text-left">Rewards</th>
                                  <th className="py-2 text-left">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-700">
                                  <td className="py-3">750 $PRSNA</td>
                                  <td className="py-3">90 Days</td>
                                  <td className="py-3 text-primary">12.5%</td>
                                  <td className="py-3">22.43 $PRSNA</td>
                                  <td className="py-3">
                                    <span className="px-2 py-1 bg-green-900/40 text-green-400 rounded-full text-xs">
                                      Active
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="research" className="space-y-6">
                        <Card className="p-6 bg-gray-800 border-gray-700">
                          <h3 className="text-xl font-semibold mb-4">Research Tools Access</h3>
                          <p className="text-gray-400 mb-6">
                            Access AI-powered research tools and insights with your $PRSNA tokens.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4 border border-gray-700 hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all bg-gray-800/80">
                              <div className="flex items-start mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                                  <Bot className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">AI Persona Interviewer</h4>
                                  <p className="text-sm text-gray-400">
                                    Conduct 1:1 interviews with custom AI personas
                                  </p>
                                </div>
                              </div>
                              <Link to="/persona-ai-interviewer">
                                <Button className="bg-gray-700 hover:bg-gray-600 border-none">Launch Tool</Button>
                              </Link>
                            </Card>
                            
                            <Card className="p-4 border border-gray-700 hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all bg-gray-800/80">
                              <div className="flex items-start mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">AI Focus Groups</h4>
                                  <p className="text-sm text-gray-400">
                                    Run moderated discussions with diverse AI personas
                                  </p>
                                </div>
                              </div>
                              <Link to="/ai-focus-groups">
                                <Button className="bg-gray-700 hover:bg-gray-600 border-none">Launch Tool</Button>
                              </Link>
                            </Card>
                            
                            <Card className="p-4 border border-gray-700 hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all bg-gray-800/80">
                              <div className="flex items-start mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                                  <Globe className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">Web3 Sentiment Analysis</h4>
                                  <p className="text-sm text-gray-400">
                                    Track market sentiment across DAOs and DeFi projects
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                                Coming Soon
                              </Button>
                            </Card>
                            
                            <Card className="p-4 border border-gray-700 hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all bg-gray-800/80">
                              <div className="flex items-start mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                                  <Gem className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">Tokenized AI Insights (NFTs)</h4>
                                  <p className="text-sm text-gray-400">
                                    Access exclusive AI-generated research insights as NFTs
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                                Stake More to Unlock
                              </Button>
                            </Card>
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="ai-agent" className="space-y-6">
                        <Card className="p-6 bg-gray-800 border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">
                              PersonaAI Research Assistant
                            </h3>
                            <div className="px-3 py-1 bg-green-900/40 text-green-400 rounded-full text-xs flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              LIVE
                            </div>
                          </div>
                          <p className="text-gray-400 mb-6">
                            Chat with our AI agent to get research insights and help with Web3 market analysis.
                          </p>
                          
                          <div className="bg-gray-900 rounded-lg p-4 h-[300px] mb-4 overflow-y-auto flex flex-col space-y-3 border border-gray-700">
                            {chatHistory.map((message, index) => (
                              <div 
                                key={index} 
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div 
                                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    message.role === "user" 
                                      ? "bg-primary/80 text-white" 
                                      : "bg-gray-800 border border-gray-700"
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <form onSubmit={sendMessage} className="flex gap-3">
                            <Input
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Ask about market research, sentiment analysis, or Web3 trends..."
                              className="flex-1 bg-gray-800 border-gray-700 text-white"
                            />
                            <Button 
                              type="submit" 
                              className="bg-gradient-to-r from-primary to-primary/80 border-none"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          </form>
                        </Card>
                        
                        <Card className="p-6 bg-gray-800 border-gray-700">
                          <h3 className="text-xl font-semibold mb-4">AI Video Avatar</h3>
                          <p className="text-gray-400 mb-4">
                            Talk to our AI research agent through video interaction for a more immersive experience.
                          </p>
                          <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center border border-gray-700">
                            <div className="text-center">
                              <Bot className="h-12 w-12 text-primary/50 mx-auto mb-2" />
                              <p className="text-sm text-gray-400">AI Video Avatar Coming Soon</p>
                              <p className="text-xs text-gray-500 mt-1">Available for Gold Tier stakers</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full border-gray-700 text-gray-300 hover:bg-gray-700"
                          >
                            Stake More to Unlock Video Avatar
                          </Button>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </Reveal>
                </>
              ) : (
                <>
                  <Reveal>
                    <h2 className="text-3xl font-bold mb-6 text-center">
                      The $PRSNA Token Ecosystem
                    </h2>
                  </Reveal>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section, index) => (
                      <Reveal key={section.id} delay={100 * index}>
                        <Card className="h-full bg-gray-800 border-gray-700 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                          <div className="flex items-start mb-4">
                            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/20 mr-4">
                              {section.icon}
                            </div>
                            <h3 className="text-xl font-bold">{section.title}</h3>
                          </div>
                          <p className="text-gray-400 mb-6">{section.description}</p>
                          <a href={`#${section.id}-details`} className="inline-flex items-center text-primary font-medium">
                            Learn more
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Card>
                      </Reveal>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Section>
        
        {/* Staking Dashboard Preview (shown when wallet not connected) */}
        {!isWalletConnected && (
          <Section className="bg-gray-800">
            <div className="container px-4 mx-auto">
              <div className="max-w-5xl mx-auto text-center">
                <Reveal>
                  <h2 className="text-3xl font-bold mb-6">
                    Stake $PRSNA to Access AI Research
                  </h2>
                </Reveal>
                
                <Reveal delay={100}>
                  <p className="text-gray-400 max-w-2xl mx-auto mb-10">
                    Stake your $PRSNA tokens to earn rewards and access exclusive research insights.
                    The longer you stake, the greater your research access and benefits.
                  </p>
                </Reveal>
                
                <Reveal delay={200}>
                  <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 p-8 mb-8 relative overflow-hidden">
                    <img 
                      src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" 
                      alt="Staking Dashboard Preview" 
                      className="rounded-lg w-full h-auto max-h-[400px] object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                      <h3 className="text-xl font-bold mb-2">AI Research Access Tiers</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-2 bg-gray-800/80 rounded-lg border border-gray-700">
                          <p className="font-semibold text-primary">Bronze</p>
                          <p className="text-xs text-gray-400">Basic AI insights</p>
                        </div>
                        <div className="p-2 bg-gray-800/80 rounded-lg border border-primary/50">
                          <p className="font-semibold text-primary">Silver</p>
                          <p className="text-xs text-gray-400">Advanced research</p>
                        </div>
                        <div className="p-2 bg-gray-800/80 rounded-lg border border-gray-700">
                          <p className="font-semibold text-primary">Gold</p>
                          <p className="text-xs text-gray-400">Premium AI features</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
                
                <Reveal delay={300}>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="group bg-gradient-to-r from-primary to-primary/80 border-none" 
                    onClick={connectWallet}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                  </Button>
                </Reveal>
              </div>
            </div>
          </Section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PRSNAEcosystem;
