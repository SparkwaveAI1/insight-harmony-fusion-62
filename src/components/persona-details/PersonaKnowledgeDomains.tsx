
import { PersonaMetadata } from "@/services/persona/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

interface PersonaKnowledgeDomainsProps {
  metadata: PersonaMetadata;
}

const PersonaKnowledgeDomains = ({ metadata }: PersonaKnowledgeDomainsProps) => {
  const knowledgeDomains = metadata.knowledge_domains;
  
  if (!knowledgeDomains || Object.keys(knowledgeDomains).length === 0) {
    return null;
  }
  
  // Group knowledge domains by category
  const domainCategories = {
    finance: ["finance_basics", "crypto_blockchain", "economics"],
    politics: ["world_politics", "national_politics", "news_literacy"],
    technology: ["basic_technology", "deep_technology"],
    health: ["health_medicine", "advanced_medical"],
    science: ["science_concepts", "environmental_issues"],
    culture: ["pop_culture", "cultural_history", "art_literature"],
    lifestyle: ["food_cooking", "travel_geography", "home_improvement", "gaming", "sports"],
    humanities: ["religion_spirituality", "law_legal", "psychology_social_science"],
    practical: ["parenting_childcare", "business_entrepreneurship"]
  };
  
  // Format domain name for display
  const formatDomainName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
        Knowledge Profile
      </h2>
      
      <Accordion type="multiple" defaultValue={["finance"]}>
        {Object.entries(domainCategories).map(([category, domains]) => {
          const categoryDomains = domains.filter(domain => knowledgeDomains[domain] !== undefined);
          
          if (categoryDomains.length === 0) {
            return null;
          }
          
          return (
            <AccordionItem key={category} value={category} className="border-0 mb-2">
              <AccordionTrigger className="text-lg font-semibold py-2 px-3 bg-green-50/50 rounded-md hover:bg-green-50 transition-colors">
                {category.charAt(0).toUpperCase() + category.slice(1)} Knowledge
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  {categoryDomains.map(domain => {
                    const level = knowledgeDomains[domain];
                    let expertise = "";
                    let color = "";
                    
                    switch(level) {
                      case 1:
                        expertise = "Minimal Awareness";
                        color = "bg-red-200";
                        break;
                      case 2:
                        expertise = "Basic Understanding";
                        color = "bg-orange-200";
                        break;
                      case 3:
                        expertise = "Moderately Knowledgeable";
                        color = "bg-yellow-200";
                        break;
                      case 4:
                        expertise = "Highly Knowledgeable";
                        color = "bg-blue-200";
                        break;
                      case 5:
                        expertise = "Expert";
                        color = "bg-green-300";
                        break;
                      default:
                        expertise = "Unknown";
                        color = "bg-gray-200";
                    }
                    
                    return (
                      <div key={domain} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{formatDomainName(domain)}</span>
                          <span className="text-sm text-muted-foreground">{expertise}</span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={(level / 5) * 100} 
                            className={`h-2 ${color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default PersonaKnowledgeDomains;
