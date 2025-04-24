
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Card from "@/components/ui-custom/Card";

const PersonaProfile = () => {
  return (
    <Card className="p-6 sticky top-24">
      <div className="flex flex-col">
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mb-4 mx-auto">
            <AvatarImage src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold mb-2">Gen Z Investor Persona</h2>
          <p className="text-muted-foreground">25-year-old tech-savvy investor focused on sustainable growth</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold mb-3">Persona Traits</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">Urban Millennial</span>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">College Educated</span>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">Tech-Savvy</span>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <span className="text-xs font-medium">Mobile-First</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaProfile;
