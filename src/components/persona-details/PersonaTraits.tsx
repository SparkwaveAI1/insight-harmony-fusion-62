
interface PersonaTraitsProps {
  traitProfile: Record<string, any>;
}

const PersonaTraits = ({ traitProfile }: PersonaTraitsProps) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-3">Traits Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(traitProfile).map(([category, traits]) => (
          <div key={category} className="bg-muted/30 p-4 rounded-md">
            <h3 className="font-medium mb-2 capitalize">{category.replace(/_/g, ' ')}</h3>
            {Object.entries(traits as Record<string, any>).length > 0 ? (
              <ul className="space-y-1 text-sm">
                {Object.entries(traits as Record<string, any>).map(([trait, value]) => (
                  <li key={trait} className="flex justify-between">
                    <span className="capitalize">{trait.replace(/_/g, ' ')}:</span>
                    <span className="font-medium">{value}</span>
                  </li>
                ))}
              </ul>
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
