
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Card from "@/components/ui-custom/Card";

interface InterviewResponse {
  question: string;
  answer: string;
}

interface InterviewSection {
  section_title: string;
  responses: InterviewResponse[];
}

interface InterviewResponsesProps {
  sections: InterviewSection[];
}

const InterviewResponses: React.FC<InterviewResponsesProps> = ({ sections }) => {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 shadow-md bg-white border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
        Interview Responses
      </h2>

      <Accordion type="multiple" defaultValue={[`section-0`]}>
        {sections.map((section, sectionIndex) => (
          <AccordionItem 
            key={`section-${sectionIndex}`} 
            value={`section-${sectionIndex}`}
            className="border-0 mb-2"
          >
            <AccordionTrigger 
              className={`text-lg font-semibold py-2 px-3 bg-indigo-50/40 rounded-md hover:bg-indigo-50 transition-colors`}
            >
              {section.section_title || `Interview Section ${sectionIndex + 1}`}
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {section.responses.map((response, responseIndex) => (
                <div key={`response-${sectionIndex}-${responseIndex}`} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800 mb-2">{response.question}</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{response.answer}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};

export default InterviewResponses;
