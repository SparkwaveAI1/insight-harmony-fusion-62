import { useState, useEffect } from "react";
import { Copy, Check, Key, Code, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const API_BASE_URL = "https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function MaskedKey({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false);
  const masked = value.slice(0, 12) + "••••••••••••••••••••••••••••••••••••••••" + value.slice(-8);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <code className="text-xs bg-muted px-2 py-1.5 rounded font-mono truncate flex-1">
        {revealed ? value : masked}
      </code>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setRevealed(!revealed)}
        className="shrink-0 text-xs text-muted-foreground"
      >
        {revealed ? "Hide" : "Show"}
      </Button>
    </div>
  );
}

export function ApiAccessContent() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadToken = async (showToast = false) => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
      if (showToast) toast.success("Token refreshed");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadToken();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await supabase.auth.refreshSession();
    await loadToken(true);
  };

  const exampleSnippet = `curl -X POST "${API_BASE_URL}/acp-job-execute" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "apikey: ${ANON_KEY.slice(0, 40)}..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "job_id": "my-job-001",
    "research_query": "How do millennials feel about AI?",
    "persona_criteria": "millennials aged 25-35",
    "questions": ["What is your view on AI in daily life?"],
    "num_personas": 5
  }'`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-muted-foreground">Loading API credentials…</span>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <Alert>
        <AlertDescription>
          You must be signed in to view your API credentials.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">API Access</h1>
        <div className="w-32 h-1 bg-accent mb-6" />
        <p className="text-muted-foreground max-w-2xl">
          Use these credentials to call PersonaAI programmatically. Your access token authenticates
          your requests to the PersonaAI edge functions API.
        </p>
      </div>

      {/* Credentials */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Your API Credentials</CardTitle>
          </div>
          <CardDescription>
            Use these in your API requests. Your access token is tied to your account session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* API Base URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">API Base URL</label>
              <Badge variant="secondary" className="text-xs">Public</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1.5 rounded font-mono flex-1 truncate">
                {API_BASE_URL}
              </code>
              <CopyButton value={API_BASE_URL} label="API Base URL" />
            </div>
          </div>

          {/* Access Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Access Token
                <span className="ml-2 text-xs text-muted-foreground font-normal">(Authorization: Bearer)</span>
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  Keep private
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-6 gap-1 text-xs text-muted-foreground"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MaskedKey value={accessToken} />
              <CopyButton value={accessToken} label="Access token" />
            </div>
            <p className="text-xs text-muted-foreground">
              This token expires periodically. Click Refresh to get a new one, or use the Supabase
              client SDK to auto-refresh in your application.
            </p>
          </div>

          {/* Anon Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Anon Key
                <span className="ml-2 text-xs text-muted-foreground font-normal">(apikey header)</span>
              </label>
              <Badge variant="secondary" className="text-xs">Public</Badge>
            </div>
            <div className="flex items-center gap-2">
              <MaskedKey value={ANON_KEY} />
              <CopyButton value={ANON_KEY} label="Anon key" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick-start */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>Quick Start</CardTitle>
          </div>
          <CardDescription>
            Run an ACP research job with a single API call.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
              {exampleSnippet}
            </pre>
            <CopyButton value={exampleSnippet} label="Code snippet" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <a
              href="/docs"
              className="hover:text-primary underline underline-offset-4 transition-colors"
            >
              View full API documentation →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Security note */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Security:</strong> Never expose your Access Token in client-side code or public
          repositories. For server-to-server integrations, store it as an environment variable and
          refresh it programmatically using the Supabase auth SDK.
        </AlertDescription>
      </Alert>
    </div>
  );
}
