
import React, { useState } from "react";
import { Button } from "./ui/button";
import { clearApiKeys, saveApiKey } from "@/services/utils/apiKeyUtils";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface ApiKeyManagerProps {
  onApiKeyUpdate: (apiKey: string | null) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyUpdate }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);

  const handleSaveApiKey = async () => {
    if (apiKey) {
      saveApiKey(apiKey, "openai");
      setIsApiKeyValid(true);
      onApiKeyUpdate(apiKey);
      toast.success("API Key saved successfully!");
    } else {
      toast.error("API Key cannot be empty.");
    }
  };

  const handleClearApiKey = () => {
    clearApiKeys();
    setIsApiKeyValid(false);
    onApiKeyUpdate(null);
    toast.success("API Key cleared successfully!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="password"
          placeholder="Enter your API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isApiKeyValid}
        />
        <Button onClick={handleSaveApiKey} disabled={isApiKeyValid}>
          Save API Key
        </Button>
      </div>
      {isApiKeyValid && (
        <div className="text-green-500">API Key is valid.</div>
      )}
      <Button variant="destructive" onClick={handleClearApiKey}>
        Clear API Key
      </Button>
    </div>
  );
};

export default ApiKeyManager;
