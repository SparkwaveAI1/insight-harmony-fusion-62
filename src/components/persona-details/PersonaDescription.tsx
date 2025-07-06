
interface PersonaDescriptionProps {
  description?: string;
  personaName: string;
}

const PersonaDescription = ({ description, personaName }: PersonaDescriptionProps) => {
  if (!description) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 mb-8 border border-gray-200">
        <div className="text-center text-gray-500">
          <p className="text-sm">No description available for {personaName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-100">
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 leading-relaxed text-base mb-0">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PersonaDescription;
