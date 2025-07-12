import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { importPersonaFromJSON } from "@/services/persona/operations/importPersona";

interface JSONImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JSONImportDialog = ({ open, onOpenChange }: JSONImportDialogProps) => {
  const [jsonText, setJsonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImport = async () => {
    if (!jsonText.trim()) {
      toast.error("Please paste the persona JSON data");
      return;
    }

    setIsLoading(true);
    
    try {
      // Parse and validate JSON
      let personaData;
      try {
        personaData = JSON.parse(jsonText);
      } catch (parseError) {
        toast.error("Invalid JSON format. Please check your data and try again.");
        setIsLoading(false);
        return;
      }

      // Import the persona
      const persona = await importPersonaFromJSON(personaData);
      
      if (persona) {
        console.log("✅ Persona imported successfully:", persona.name);
        toast.success(`Persona "${persona.name}" imported successfully!`);
        
        // Navigate to the persona completion page with success state
        navigate("/persona-creation/complete", {
          state: {
            personaId: persona.persona_id,
            personaName: persona.name,
            error: false,
            imported: true
          },
          replace: true
        });
        
        onOpenChange(false);
        setJsonText("");
      } else {
        toast.error("Failed to import persona. Please check the JSON format.");
      }
    } catch (error: any) {
      console.error("❌ Error importing persona:", error);
      toast.error(`Import failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith('.json')) {
      toast.error("Please select a JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Persona from JSON
          </DialogTitle>
          <DialogDescription>
            Import a persona by pasting JSON data or uploading a JSON file. The persona will be created with all the original characteristics and traits.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload JSON File</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="json-file-input"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('json-file-input')?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Choose JSON File
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste JSON Data</label>
            <Textarea
              placeholder="Paste your persona JSON data here..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="min-h-48 font-mono text-sm resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || !jsonText.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Persona
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JSONImportDialog;