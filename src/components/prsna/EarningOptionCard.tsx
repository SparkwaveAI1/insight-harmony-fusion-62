
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import { Users, ArrowRight } from "lucide-react";

interface EarningOptionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  buttonText: string;
  link?: string;
  disabled?: boolean;
}

const EarningOptionCard = ({
  icon: Icon,
  title,
  description,
  benefits,
  buttonText,
  link,
  disabled
}: EarningOptionCardProps) => {
  const ButtonContent = (
    <Button variant="secondary" className="w-full" disabled={disabled}>
      <Icon className="h-4 w-4 mr-2" />
      {buttonText}
      {!disabled && <ArrowRight className="w-4 h-4 ml-2" />}
    </Button>
  );

  return (
    <Card className="h-full bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-secondary/10 transition-all">
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
          <Icon className="h-6 w-6 text-secondary" />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-3 mb-6">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <span className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mr-2 mt-0.5">
              <span className="text-xs font-bold text-secondary">✓</span>
            </span>
            <span className="text-gray-300">{benefit}</span>
          </li>
        ))}
      </ul>
      {link ? (
        <Link to={link}>{ButtonContent}</Link>
      ) : (
        ButtonContent
      )}
    </Card>
  );
};

export default EarningOptionCard;
