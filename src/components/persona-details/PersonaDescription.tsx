
interface PersonaDescriptionProps {
  description?: string;
  personaName: string;
}

const PersonaDescription = ({ description, personaName }: PersonaDescriptionProps) => {
  if (!description) {
    return null;
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
