
import { PersonaMetadata } from "@/services/persona/types";

interface PersonaDemographicsProps {
  metadata: PersonaMetadata;
}

const PersonaDemographics = ({ metadata }: PersonaDemographicsProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-bold mb-3">Demographics</h2>
        <ul className="space-y-2">
          <li className="flex">
            <span className="font-medium w-32">Age:</span>
            <span>{metadata.age}</span>
          </li>
          <li className="flex">
            <span className="font-medium w-32">Gender:</span>
            <span>{metadata.gender}</span>
          </li>
          <li className="flex">
            <span className="font-medium w-32">Location:</span>
            <span>{metadata.region}</span>
          </li>
          <li className="flex">
            <span className="font-medium w-32">Grew up in:</span>
            <span>{metadata.location_history?.grew_up_in}</span>
          </li>
          <li className="flex">
            <span className="font-medium w-32">Current home:</span>
            <span>{metadata.location_history?.current_residence}</span>
          </li>
        </ul>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-3">Background</h2>
        <ul className="space-y-2">
          <li className="flex">
            <span className="font-medium w-32">Occupation:</span>
            <span>{metadata.occupation}</span>
          </li>
          <li className="flex">
            <span className="font-medium w-32">Education:</span>
            <span>{metadata.education_level}</span>
          </li>
          <li className="flex">
            <span className="font-medium w-32">Income:</span>
            <span>{metadata.income_level}</span>
          </li>
          <li className="flex">
            <span className="font-medium w-32">Relationship:</span>
            <span>{metadata.relationship_status}</span>
          </li>
          <li className="flex">
            <span className="font-medium w-32">Culture:</span>
            <span>{metadata.cultural_background}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PersonaDemographics;
