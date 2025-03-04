
import React, { useState, useEffect } from "react";
import { saveApiKey, clearApiKey, hasApiKey } from "@/services/utils/apiKeyUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "sonner";

const ApiKeyManager = () => {
  const [open, setOpen] = useState(false);
  const [newsApiKey, setNewsApiKey] = useState("");
  const [hasNewsKey, setHasNewsKey] = useState(false);
  const [twitterApiKey, setTwitterApiKey] = useState("");
  const [hasTwitterKey, setHasTwitterKey] = useState(false);
  
  // Check for existing API keys
  useEffect(() => {
    setHasNewsKey(hasApiKey("newsApi"));
    setHasTwitterKey(hasApiKey("twitter"));
  }, [open]);
  
  const handleSaveNewsKey = () => {
    if (newsApiKey.trim()) {
      saveApiKey("newsApi", newsApiKey.trim());
      setNewsApiKey("");
      setHasNewsKey(true);
    } else {
      toast.error("Please enter a valid News API key");
    }
  };
  
  const handleClearNewsKey = () => {
    clearApiKey("newsApi");
    setHasNewsKey(false);
  };
  
  const handleSaveTwitterKey = () => {
    if (twitterApiKey.trim()) {
      saveApiKey("twitter", twitterApiKey.trim());
      setTwitterApiKey("");
      setHasTwitterKey(true);
    } else {
      toast.error("Please enter a valid Twitter API key");
    }
  };
  
  const handleClearTwitterKey = () => {
    clearApiKey("twitter");
    setHasTwitterKey(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings size={16} />
          API Keys
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage API Keys</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label htmlFor="newsApiKey" className="text-base">News API Key</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Get your free News API key at <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">newsapi.org</a>
            </p>
            <div className="flex gap-2">
              <Input
                id="newsApiKey"
                value={newsApiKey}
                onChange={(e) => setNewsApiKey(e.target.value)}
                placeholder={hasNewsKey ? "••••••••••••••••••••" : "Enter News API key"}
                type="password"
                className="flex-grow"
              />
              {hasNewsKey ? (
                <Button variant="destructive" onClick={handleClearNewsKey} type="button">
                  Clear
                </Button>
              ) : (
                <Button variant="default" onClick={handleSaveNewsKey} type="button">
                  Save
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="twitterApiKey" className="text-base">Twitter API Key</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Requires a Twitter developer account. <a href="https://developer.twitter.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Learn more</a>
            </p>
            <div className="flex gap-2">
              <Input
                id="twitterApiKey"
                value={twitterApiKey}
                onChange={(e) => setTwitterApiKey(e.target.value)}
                placeholder={hasTwitterKey ? "••••••••••••••••••••" : "Enter Twitter API key"}
                type="password"
                className="flex-grow"
              />
              {hasTwitterKey ? (
                <Button variant="destructive" onClick={handleClearTwitterKey} type="button">
                  Clear
                </Button>
              ) : (
                <Button variant="default" onClick={handleSaveTwitterKey} type="button">
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyManager;
