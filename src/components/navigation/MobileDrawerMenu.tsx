
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { navigationMenuItems } from "@/components/layout/config/navigationConfig";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MobileDrawerMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileDrawerMenu = ({ open, onOpenChange }: MobileDrawerMenuProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="text-center">PersonaAI Navigation</DrawerTitle>
          <DrawerClose className="absolute right-4 top-4">
            <X size={20} />
          </DrawerClose>
        </DrawerHeader>
        <div className="flex flex-col gap-2 p-4">
          {navigationMenuItems.map((item) => (
            <Link 
              key={item.title} 
              to={item.url} 
              onClick={() => onOpenChange(false)}
            >
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 px-3"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Button>
            </Link>
          ))}
        </div>
        <DrawerFooter className="border-t">
          <Link to="/dashboard" onClick={() => onOpenChange(false)} className="w-full">
            <Button variant="default" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawerMenu;
