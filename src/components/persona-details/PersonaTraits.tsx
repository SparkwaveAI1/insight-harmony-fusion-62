
import { Fragment } from 'react';

interface PersonaTraitsProps {
  traitProfile: Record<string, any>;
}

const PersonaTraits = ({ traitProfile }: PersonaTraitsProps) => {
  // Helper function to render nested objects
  const renderNestedObject = (obj: Record<string, any>, depth = 0) => {
    return Object.entries(obj).map(([key, value]) => {
      // Skip empty objects
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
        return null;
      }
      
      // Format the key for display
      const formattedKey = key.replace(/_/g, ' ');
      
      if (typeof value === 'object' && value !== null) {
        return (
          <Fragment key={key}>
            <div className={`font-medium mt-2 ${depth > 0 ? 'text-sm' : ''}`}>
              {formattedKey}:
            </div>
            <div className={`pl-4 ${depth > 0 ? 'border-l-2 border-muted/50' : ''}`}>
              {renderNestedObject(value, depth + 1)}
            </div>
          </Fragment>
        );
      } else {
        return (
          <div key={key} className="flex justify-between text-sm py-1">
            <span className="capitalize">{formattedKey}:</span>
            <span className="font-medium">{String(value)}</span>
          </div>
        );
      }
    });
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-3">Traits Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(traitProfile).map(([category, traits]) => (
          <div key={category} className="bg-muted/30 p-4 rounded-md">
            <h3 className="font-medium mb-2 capitalize">{category.replace(/_/g, ' ')}</h3>
            {typeof traits === 'object' && traits !== null && Object.keys(traits).length > 0 ? (
              <div className="space-y-1">
                {renderNestedObject(traits as Record<string, any>)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No details available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonaTraits;
