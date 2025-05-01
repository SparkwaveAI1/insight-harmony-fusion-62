
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
      <DrawerContent className="max-h-[85vh] bg-gray-100 border border-gray-200 pb-safe">
        <DrawerHeader className="border-b border-gray-200">
          <DrawerTitle className="text-center text-gray-800 font-bold text-xl">Navigation Menu</DrawerTitle>
          <DrawerClose className="absolute right-4 top-4 text-gray-800">
            <X size={24} />
          </DrawerClose>
        </DrawerHeader>
        <div className="flex flex-col gap-3 p-6">
          {navigationMenuItems.map((item) => (
            <Link 
              key={item.title} 
              to={item.url} 
              onClick={() => onOpenChange(false)}
              className="block w-full"
            >
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 px-4 py-4 text-gray-800 text-lg font-bold hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                <item.icon className="h-6 w-6 text-gray-800" />
                <span>{item.title}</span>
              </Button>
            </Link>
          ))}
        </div>
        <DrawerFooter className="border-t border-gray-200 bg-gray-100 pt-4">
          <Link to="/dashboard" onClick={() => onOpenChange(false)} className="w-full">
            <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold">
              Back to Dashboard
            </Button>
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawerMenu;
