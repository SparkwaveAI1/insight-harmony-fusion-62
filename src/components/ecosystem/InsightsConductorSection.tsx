
import { ArrowRight, Lightbulb, BarChart3, PieChart } from "lucide-react";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import { Link } from "react-router-dom";

const InsightsConductorSection = () => {
  return (
    <Section className="bg-muted/30 py-12">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik">
                Insights Conductor
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our advanced AI-powered research platform helps organizations extract valuable insights 
                through qualitative analysis of conversations across social media, news, and forums.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Reveal delay={100}>
              <div className="bg-card border shadow-sm rounded-xl p-6 h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Qualitative Insights</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Transform unstructured data into actionable intelligence with our AI-powered analysis tools.
                </p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Theme identification and pattern recognition
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Sentiment analysis and emotion detection
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Discover hidden correlations and insights
                  </li>
                </ul>
                <a href="#insights-generator">
                  <Button 
                    variant="secondary" 
                    className="group mt-auto"
                  >
                    Try It Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                  </Button>
                </a>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="bg-card border shadow-sm rounded-xl p-6 h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Market Research</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Gain deeper understanding of your market and customers through AI-powered research tools.
                </p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Automated focus group analysis
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Customer preference modeling
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Competitor strategy assessment
                  </li>
                </ul>
                <a href="#insights-generator">
                  <Button 
                    variant="secondary" 
                    className="group mt-auto"
                  >
                    Explore Research Tools
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                  </Button>
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={300}>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 md:p-8 border">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-7/12">
                  <h3 className="text-2xl font-bold mb-4">Power Your Research with $PRSNA</h3>
                  <p className="text-muted-foreground mb-6">
                    Stake $PRSNA tokens to access premium research features and generate deeper insights from your qualitative data.
                  </p>
                  <div className="flex gap-4">
                    <a href="#insights-generator">
                      <Button 
                        variant="primary" 
                        className="group"
                      >
                        Start Analysis
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                      </Button>
                    </a>
                    <Link to="/earn-prsna">
                      <Button 
                        variant="secondary" 
                        className="group"
                      >
                        Staking Benefits
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex-shrink-0 flex justify-center md:w-5/12">
                  <div className="relative w-40 h-40 md:w-48 md:h-48">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
                    <div className="absolute inset-4 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PieChart className="w-20 h-20 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default InsightsConductorSection;
