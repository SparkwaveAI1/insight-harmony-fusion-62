
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Card from "@/components/ui-custom/Card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Users } from "lucide-react";

const PersonaProfile = () => {
  // Since this is a hard-coded component for demonstration purposes,
  // we'll update it to use Alina R's insights for consistency

  return (
    <Card className="p-6 sticky top-24">
      <div className="flex flex-col">
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mb-4 mx-auto">
            <AvatarImage src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold mb-2">Alina R - Financial Analyst</h2>
          <p className="text-muted-foreground">32-year-old analyst focused on sustainable investing</p>
        </div>
        
        <div className="space-y-6">
          {/* Persona Traits section */}
          <div>
            <h3 className="text-base font-semibold mb-3">Persona Traits</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">Financial Expert</span>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">Master's Degree</span>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">Analytical</span>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">Tech-Savvy</span>
              </div>
            </div>
          </div>
          
          {/* Key Information section */}
          <div>
            <h3 className="text-base font-semibold mb-3">Key Information</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">32</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Occupation:</span>
                <span className="font-medium">Financial Analyst</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Region:</span>
                <span className="font-medium">New York</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Education:</span>
                <span className="font-medium">Master's Degree</span>
              </li>
            </ul>
          </div>
          
          {/* Decisions section - Updated for Alina R */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Decisions</h3>
            </div>
            <ul className="space-y-2 text-sm pl-1">
              <li>Relies on data visualization tools for complex financial decisions</li>
              <li>Balances risk and reward through multi-scenario modeling</li>
            </ul>
          </div>
          
          {/* Drivers section - Updated for Alina R */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Drivers</h3>
            </div>
            <ul className="space-y-2 text-sm pl-1">
              <li>Motivated by sustainable growth and ethical investing principles</li>
              <li>Values work-life integration and financial security</li>
            </ul>
          </div>
          
          {/* Persuasion section - Updated for Alina R */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Discussion & Persuasion</h3>
            </div>
            <ul className="space-y-2 text-sm pl-1">
              <li>Responds to evidence-based arguments with practical applications</li>
              <li>Appreciates detailed analysis backed by real-world examples</li>
            </ul>
          </div>
          
          {/* Interest Areas */}
          <div>
            <h3 className="text-base font-semibold mb-3">Interest Areas</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary/10">Sustainable Finance</Badge>
              <Badge variant="outline" className="bg-primary/10">ESG Investing</Badge>
              <Badge variant="outline" className="bg-primary/10">Financial Technology</Badge>
              <Badge variant="outline" className="bg-primary/10">Data Analytics</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaProfile;
