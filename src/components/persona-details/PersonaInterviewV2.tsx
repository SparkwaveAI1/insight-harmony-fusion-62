import { DbPersonaV2 } from "@/services/persona/types/persona-v2-db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PersonaInterviewV2Props {
  persona: DbPersonaV2;
}

const PersonaInterviewV2 = ({ persona }: PersonaInterviewV2Props) => {
  // V2 personas don't have interview_sections in the same format
  // We'll show a placeholder for now
  const interviewSections: any[] = [];

  if (!interviewSections || !Array.isArray(interviewSections) || interviewSections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interview Responses</CardTitle>
          <CardDescription>No interview data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This persona doesn't have interview responses yet. Interview data provides valuable insights 
            into how this persona thinks and responds to different topics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Interview Responses</h2>
        <p className="text-muted-foreground">
          Detailed responses showing how {persona.name} thinks and communicates
        </p>
        <div className="flex gap-2 mt-4">
          <Badge variant="secondary">{interviewSections.length} sections</Badge>
          <Badge variant="outline">
            {interviewSections.reduce((total, section) => 
              total + (Array.isArray(section.responses) ? section.responses.length : 0), 0
            )} responses
          </Badge>
        </div>
      </div>

      {interviewSections.map((section, sectionIndex) => {
        if (!section || typeof section !== 'object') return null;
        
        const sectionTitle = section.section_title || `Section ${sectionIndex + 1}`;
        const responses = Array.isArray(section.responses) ? section.responses : [];

        return (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{sectionTitle}</CardTitle>
              <CardDescription>
                {responses.length} response{responses.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {responses.map((response, responseIndex) => {
                if (!response || typeof response !== 'object') return null;
                
                const question = response.question || `Question ${responseIndex + 1}`;
                const answer = response.answer || 'No response provided';

                return (
                  <div key={responseIndex} className="border-l-2 border-primary/20 pl-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      {question}
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {answer}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PersonaInterviewV2;