import React from "react";
import { EmotionalTriggers } from "@/services/persona/types";

interface PersonaEmotionalTriggersProps {
  emotionalTriggers?: EmotionalTriggers;
}

const PersonaEmotionalTriggers = ({ emotionalTriggers }: PersonaEmotionalTriggersProps) => {
  if (!emotionalTriggers || (!emotionalTriggers.positive_triggers && !emotionalTriggers.negative_triggers)) {
    return (
      <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Emotional Triggers</h3>
        <p className="text-gray-500">
          This persona does not have any defined emotional triggers.
        </p>
      </div>
    );
  }

  const renderTriggers = (triggers: any[], type: string) => {
    if (!triggers || triggers.length === 0) {
      return null;
    }

    return (
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2 capitalize">{type} Triggers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {triggers.map((trigger, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <h5 className="font-semibold text-gray-700">{trigger.emotion_type}</h5>
              <p className="text-gray-600 text-sm">{trigger.description}</p>
              <div className="mt-2">
                <span className="font-semibold text-gray-700 text-sm">Keywords:</span>
                <p className="text-gray-600 text-xs">{trigger.keywords.join(', ')}</p>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Intensity Multiplier: {trigger.intensity_multiplier}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderTriggers(emotionalTriggers?.positive_triggers || [], 'positive')}
      {renderTriggers(emotionalTriggers?.negative_triggers || [], 'negative')}
    </div>
  );
};

export default PersonaEmotionalTriggers;
