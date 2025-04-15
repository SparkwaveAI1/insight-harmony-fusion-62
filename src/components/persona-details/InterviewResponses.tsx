
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Card from "@/components/ui-custom/Card";
import { InterviewSection } from "@/services/persona/types";

interface InterviewResponsesProps {
  sections: InterviewSection[];
}

const InterviewResponses = ({ sections }: InterviewResponsesProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-plasmik">Interview Responses</h2>
      
      {sections.map((section, index) => (
        <Card key={index} className="mb-4 overflow-hidden">
          <button
            className="w-full p-4 flex justify-between items-center hover:bg-muted/30 transition-colors"
            onClick={() => toggleSection(section.section)}
          >
            <h3 className="text-lg font-bold">{section.section}</h3>
            {expandedSections[section.section] ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          
          {expandedSections[section.section] && (
            <div className="p-4 pt-0">
              <p className="text-sm text-muted-foreground italic mb-4">{section.notes}</p>
              <div className="space-y-6">
                {section.questions.map((item, qIndex) => {
                  const questionText = typeof item === 'object' ? item.question : item;
                  const response = typeof item === 'object' && item.response 
                    ? item.response 
                    : section.responses && section.responses[qIndex];
                  
                  return (
                    <div key={qIndex}>
                      <p className="font-medium mb-2">Q: {questionText}</p>
                      {response ? (
                        <p className="pl-4 border-l-2 border-primary/30 py-1">
                          {response}
                        </p>
                      ) : (
                        <p className="text-muted-foreground pl-4 border-l-2 border-muted py-1 italic">
                          No response recorded
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default InterviewResponses;
