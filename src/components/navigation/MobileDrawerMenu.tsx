
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { X, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MobileDrawerMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileDrawerMenu = ({ open, onOpenChange }: MobileDrawerMenuProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const handleLogout = () => {
    signOut();
    onOpenChange(false);
  };
  
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
          {navigationMenuItems.map((item) => {
            const isActive = location.pathname === item.url || 
                            (item.url !== "/" && location.pathname.startsWith(item.url));
            
            return (
              <Link 
                key={item.title} 
                to={item.url} 
                onClick={() => onOpenChange(false)}
                className="block w-full"
              >
                <Button 
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3 px-4 py-4 text-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
                >
                  <item.icon className="h-6 w-6" />
                  <span>{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </div>
        <DrawerFooter className="border-t border-gray-200 bg-gray-100 pt-4 flex flex-col gap-3">
          {user && (
            <>
              <Link to="/profile" onClick={() => onOpenChange(false)} className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                >
                  <UserRound className="h-5 w-5" />
                  <span>Your Profile</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 border-red-200 hover:bg-red-50 text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </>
          )}
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
