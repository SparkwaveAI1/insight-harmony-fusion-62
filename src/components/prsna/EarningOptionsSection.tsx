
import { FileText, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/ui-custom/Reveal";
import { Button } from "@/components/ui/button";

const EarningOptionsSection = () => {
  return (
    <div className="container px-4 mx-auto">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h2 className="text-3xl font-bold mb-4 text-center">$PRSNA — The First Behavioral Asset Class</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            $PRSNA is tied to the emergence of a new onchain asset class: behavioral agents. As thousands of ERC-6551 personas enter the ecosystem, each with deep trait structures and unique behavioral value, $PRSNA becomes the economic layer connecting their creation, licensing, and marketplace activity.
          </p>
        </Reveal>


        {/* Buttons with improved visibility */}
        <Reveal delay={200}>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <Link to="/prsna/whitepaper">
              <Button 
                variant="outline" 
                className="text-gray-900 bg-white border-white hover:bg-white hover:bg-opacity-80 min-w-32 font-medium"
                size="lg"
              >
                <FileText className="mr-2 h-4 w-4" />
                White Paper
              </Button>
            </Link>
            
            <Link to="/prsna/roadmap">
              <Button 
                variant="outline" 
                className="text-gray-900 bg-white border-white hover:bg-white hover:bg-opacity-80 min-w-32 font-medium"
                size="lg"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Road Map
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default EarningOptionsSection;
