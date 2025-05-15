
import React from 'react';
import { Persona } from '@/services/persona/types';

interface PersonaDemographicsCardProps {
  persona: Persona;
}

const PersonaDemographicsCard: React.FC<PersonaDemographicsCardProps> = ({ persona }) => {
  return (
    <div className="mt-3">
      <h4 className="text-sm font-medium mb-1">Demographics</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="font-medium">Age</p>
          <p>{persona.metadata?.age || 'N/A'}</p>
        </div>
        <div>
          <p className="font-medium">Gender</p>
          <p>{persona.metadata?.gender || 'N/A'}</p>
        </div>
        <div>
          <p className="font-medium">Occupation</p>
          <p>{persona.metadata?.occupation || 'N/A'}</p>
        </div>
        <div>
          <p className="font-medium">Region</p>
          <p>{persona.metadata?.region || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonaDemographicsCard;
