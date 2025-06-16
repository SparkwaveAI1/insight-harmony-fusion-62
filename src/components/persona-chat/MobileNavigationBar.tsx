
import React from 'react';
import { Menu, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface MobileNavigationBarProps {
  onToggleMenu: () => void;
  personaName?: string;
}

const MobileNavigationBar: React.FC<MobileNavigationBarProps> = ({
  onToggleMenu,
  personaName
}) => {
  return (
    <div className="flex items-center justify-between md:hidden mb-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={onToggleMenu}
        className="h-10 w-10"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>
      
      <h3 className="font-medium">
        {personaName || 'Chat'}
      </h3>
      
      <Link to="/dashboard">
        <Button variant="outline" size="icon" className="h-10 w-10">
          <LayoutDashboard className="h-5 w-5" />
          <span className="sr-only">Dashboard</span>
        </Button>
      </Link>
    </div>
  );
};

export default MobileNavigationBar;
