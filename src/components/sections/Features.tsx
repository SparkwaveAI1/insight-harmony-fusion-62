
import { SearchIcon, PieChart, Lightbulb, TrendingUp, UsersRound, BarChart3 } from "lucide-react";
import Section from "../ui-custom/Section";
import Card from "../ui-custom/Card";
import Reveal from "../ui-custom/Reveal";

const features = [
  {
    icon: <SearchIcon className="h-6 w-6 text-primary" />,
    title: "Qualitative Analysis",
    description: "Analyze interviews, focus groups, and open-ended responses with powerful natural language processing."
  },
  {
    icon: <PieChart className="h-6 w-6 text-primary" />,
    title: "Data Visualization",
    description: "Transform complex data into intuitive visualizations that reveal insights at a glance."
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    title: "Pattern Recognition",
    description: "Uncover hidden patterns and relationships within your qualitative data sets."
  },
  {
    icon: <Lightbulb className="h-6 w-6 text-primary" />,
    title: "Insight Generation",
    description: "Generate actionable insights and recommendations based on comprehensive analysis."
  },
  {
    icon: <UsersRound className="h-6 w-6 text-primary" />,
    title: "Collaborative Workspace",
    description: "Work seamlessly with your team to analyze, annotate, and share findings."
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    title: "Report Creation",
    description: "Create beautiful, presentation-ready reports with just a few clicks."
  }
];

const Features = () => {
  return (
    <Section id="features" className="bg-secondary/50">
      <div className="container px-4 mx-auto">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
              Key Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Designed for Qualitative Excellence
            </h2>
            <p className="text-muted-foreground text-pretty">
              Our platform combines powerful analysis tools with an intuitive interface, making qualitative research more efficient and insightful.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Reveal key={index} delay={100 * index}>
              <Card className="h-full">
                <div className="p-2 bg-primary/10 rounded-lg inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Features;
