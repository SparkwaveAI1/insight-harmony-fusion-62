import { DbPersona } from "@/services/persona";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PersonaDemographicsV2Props {
  persona: DbPersona;
}

const PersonaDemographicsV2 = ({ persona }: PersonaDemographicsV2Props) => {
  const identity = persona.persona_data?.identity;
  const lifeContext = persona.persona_data?.life_context;

  if (!identity) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No demographic information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Demographics */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core demographic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {identity?.age && (
            <div>
              <span className="font-semibold">Age:</span> {identity.age}
            </div>
          )}
          {identity?.gender && (
            <div>
              <span className="font-semibold">Gender:</span> {identity.gender}
            </div>
          )}
          {identity?.ethnicity && (
            <div>
              <span className="font-semibold">Ethnicity:</span> {identity.ethnicity}
            </div>
          )}
          {identity?.nationality && (
            <div>
              <span className="font-semibold">Nationality:</span> {identity.nationality}
            </div>
          )}
          {identity?.occupation && (
            <div>
              <span className="font-semibold">Occupation:</span> {identity.occupation}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location & Living */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Living</CardTitle>
          <CardDescription>Geographic and living situation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {identity?.location && (
            <div>
              <span className="font-semibold">Location:</span> {identity.location.city}, {identity.location.region}
            </div>
          )}
          {identity?.location?.country && (
            <div>
              <span className="font-semibold">Country:</span> {identity.location.country}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family & Relationships */}
      <Card>
        <CardHeader>
          <CardTitle>Family & Relationships</CardTitle>
          <CardDescription>Relationship status and family structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {identity?.relationship_status && (
            <div>
              <span className="font-semibold">Relationship Status:</span> {identity.relationship_status}
            </div>
          )}
          {identity?.dependents !== undefined && (
            <div>
              <span className="font-semibold">Dependents:</span> {identity.dependents}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Background & Context */}
      <Card>
        <CardHeader>
          <CardTitle>Background & Context</CardTitle>
          <CardDescription>Life context and background information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lifeContext?.lifestyle && (
            <div>
              <span className="font-semibold">Lifestyle:</span> {lifeContext.lifestyle}
            </div>
          )}
          {lifeContext?.background_narrative && (
            <div>
              <span className="font-semibold">Background:</span>
              <p className="mt-2 text-sm text-muted-foreground">
                {lifeContext.background_narrative}
              </p>
            </div>
          )}
          {lifeContext?.current_situation && (
            <div>
              <span className="font-semibold">Current Situation:</span>
              <p className="mt-2 text-sm text-muted-foreground">
                {lifeContext.current_situation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaDemographicsV2;