
import { Mail, FileText, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface IntegrationStatus {
  email: boolean;
  docs: boolean;
  notion: boolean;
}

const IntegrationPanel = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    email: false,
    docs: false,
    notion: false
  });
  const { toast } = useToast();

  const handleIntegrationConnect = (type: keyof IntegrationStatus) => {
    toast({
      title: "Integration coming soon",
      description: `The ${type} integration is currently under development.`,
    });
    
    if (type === 'email' && emailAddress) {
      setIntegrationStatus(prev => ({...prev, email: true}));
      toast({
        title: "Email connected",
        description: `Email connected to ${emailAddress}`,
      });
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold mb-3">Integrations</h3>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="docs">Google Docs</TabsTrigger>
          <TabsTrigger value="notion">Notion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="mt-4 space-y-3">
          {!integrationStatus.email ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
              <Button 
                size="sm" 
                className="w-full" 
                onClick={() => handleIntegrationConnect('email')}
                disabled={!emailAddress}
              >
                <Mail className="mr-2 h-4 w-4" />
                Connect Email
              </Button>
            </>
          ) : (
            <div className="p-3 bg-primary/10 rounded-md text-center">
              <p className="text-sm">Connected to: {emailAddress}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => setIntegrationStatus(prev => ({...prev, email: false}))}
              >
                Disconnect
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="docs" className="mt-4">
          <div className="p-4 border border-dashed rounded-md bg-muted/30 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Google Docs integration coming soon</p>
            <Button 
              size="sm" 
              disabled
              onClick={() => handleIntegrationConnect('docs')}
            >
              Connect to Google Docs
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="notion" className="mt-4">
          <div className="p-4 border border-dashed rounded-md bg-muted/30 text-center">
            <Save className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Notion integration coming soon</p>
            <Button 
              size="sm" 
              disabled
              onClick={() => handleIntegrationConnect('notion')}
            >
              Connect to Notion
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationPanel;
