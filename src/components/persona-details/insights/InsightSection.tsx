
import React from "react";
import { LucideIcon } from "lucide-react";

interface InsightSectionProps {
  title: string;
  Icon: LucideIcon;
  insights: string[];
}

const InsightSection = ({ title, Icon, insights }: InsightSectionProps) => {
  return (
    <div className="bg-white/60 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm pl-1">
        {Array.isArray(insights) 
          ? insights.map((item, idx) => <li key={idx}>{item}</li>)
          : <li>{String(insights)}</li>
        }
      </ul>
    </div>
  );
};

export default InsightSection;
