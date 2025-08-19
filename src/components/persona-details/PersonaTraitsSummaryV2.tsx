import { DbPersonaV2 } from "@/services/persona/types/persona-v2-db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PersonaTraitsSummaryV2Props {
  persona: DbPersonaV2;
}

const PersonaTraitsSummaryV2 = ({ persona }: PersonaTraitsSummaryV2Props) => {
  const cognitiveProfile = persona.persona_data?.cognitive_profile;
  const socialCognition = persona.persona_data?.social_cognition;

  if (!cognitiveProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No trait information available</p>
        </CardContent>
      </Card>
    );
  }

  const renderBigFiveTraits = () => {
    const bigFive = cognitiveProfile?.big_five;
    if (!bigFive) return null;

    const traitLabels = {
      openness: 'Openness',
      conscientiousness: 'Conscientiousness', 
      extraversion: 'Extraversion',
      agreeableness: 'Agreeableness',
      neuroticism: 'Neuroticism'
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Personality Traits (Big Five)</CardTitle>
          <CardDescription>Core personality dimensions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(traitLabels).map(([key, label]) => {
            const value = bigFive[key as keyof typeof bigFive];
            if (value === undefined) return null;
            return (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{label}</span>
                  <span className="text-sm text-muted-foreground">{Math.round(value * 100)}%</span>
                </div>
                <Progress value={value * 100} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid gap-6">

      <div className="grid gap-6 md:grid-cols-2">
        {/* Big Five Traits */}
        {renderBigFiveTraits()}

        {/* Decision Making */}
        <Card>
          <CardHeader>
            <CardTitle>Decision Making</CardTitle>
            <CardDescription>How this persona approaches decisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cognitiveProfile?.decision_style && (
              <div>
                <span className="font-semibold">Decision Style:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {cognitiveProfile.decision_style}
                </p>
              </div>
            )}
            {cognitiveProfile?.intelligence && (
              <div>
                <span className="font-semibold">Intelligence:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {cognitiveProfile.intelligence.level} level, {cognitiveProfile.intelligence.type.join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Values & Motivations */}
        <Card>
          <CardHeader>
            <CardTitle>Values & Motivations</CardTitle>
            <CardDescription>Core beliefs and driving forces</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cognitiveProfile?.moral_foundations && (
              <div>
                <span className="font-semibold mb-2 block">Moral Foundations:</span>
                <div className="space-y-2">
                  {Object.entries(cognitiveProfile.moral_foundations).map(([foundation, score]) => (
                    <div key={foundation} className="flex justify-between">
                      <span className="capitalize">{foundation.replace('_', ' ')}</span>
                      <span className="text-sm">{Math.round((score as number) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Behavioral Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Patterns</CardTitle>
            <CardDescription>Common behaviors and tendencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialCognition?.empathy && (
              <div>
                <span className="font-semibold">Empathy:</span>
                <Badge variant="outline" className="ml-2">{socialCognition.empathy}</Badge>
              </div>
            )}
            {socialCognition?.theory_of_mind && (
              <div>
                <span className="font-semibold">Theory of Mind:</span>
                <Badge variant="outline" className="ml-2">{socialCognition.theory_of_mind}</Badge>
              </div>
            )}
            {socialCognition?.trust_baseline && (
              <div>
                <span className="font-semibold">Trust Baseline:</span>
                <Badge variant="outline" className="ml-2">{socialCognition.trust_baseline}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default PersonaTraitsSummaryV2;