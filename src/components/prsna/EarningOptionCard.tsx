
import { LucideIcon } from "lucide-react";
import Card from "@/components/ui-custom/Card";

interface EarningOptionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
}

const EarningOptionCard = ({
  icon: Icon,
  title,
  description,
  benefits
}: EarningOptionCardProps) => {
  return (
    <Card className="h-full bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-secondary/10 transition-all">
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
          <Icon className="h-6 w-6 text-secondary" />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <span className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mr-2 mt-0.5">
              <span className="text-xs font-bold text-secondary">✓</span>
            </span>
            <span className="text-gray-300">{benefit}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default EarningOptionCard;
