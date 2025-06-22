
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../ui-custom/Section";
import Button from "../ui-custom/Button";
import Reveal from "../ui-custom/Reveal";

const CharacterSection = () => {
  return (
    <Section className="bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center justify-center bg-purple-100 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">New Feature</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Custom Characters
            </h2>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-gray-600 text-pretty mb-8 max-w-2xl mx-auto text-lg">
              Create and manage your own custom characters for storytelling, creative projects, 
              and interactive experiences. Build unique personalities with detailed backstories 
              and traits.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-center mb-6">
                <Users className="h-16 w-16 text-purple-600" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Character Dashboard</h3>
              <p className="text-gray-600 mb-6">
                Design characters with unique personalities, appearances, and backstories. 
                Perfect for writers, game developers, and creative professionals.
              </p>
              
              <Link to="/characters">
                <Button 
                  variant="primary" 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Characters
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default CharacterSection;
