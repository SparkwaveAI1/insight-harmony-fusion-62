
import { LucideIcon } from "lucide-react";

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const BenefitCard = ({ icon: Icon, title, description }: BenefitCardProps) => {
  return (
    <div className="bg-gray-700/50 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all border border-gray-700">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mx-auto mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-center mb-3">{title}</h3>
      <p className="text-gray-400 text-center text-sm">
        {description}
      </p>
    </div>
  );
};

export default BenefitCard;
