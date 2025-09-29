import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Zap, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CreditGateProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  creditsRequired?: number;
}

export const CreditGate: React.FC<CreditGateProps> = ({
  isOpen,
  onClose,
  feature,
  creditsRequired = 1
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">
            Credits Required
          </DialogTitle>
          <DialogDescription className="text-center">
            You need {creditsRequired} {creditsRequired === 1 ? 'credit' : 'credits'} to use {feature}.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Get started with credits</p>
                <p className="text-xs text-muted-foreground">Purchase credit packs to unlock all features</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link to="/pricing" onClick={onClose}>
                <Button className="w-full group" variant="outline">
                  View Pricing Plans
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link to="/dashboard/billing" onClick={onClose}>
                <Button className="w-full group">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Buy Credits Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Credits are used to power AI processing for persona creation and research
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};