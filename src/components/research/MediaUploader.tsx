
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Check,
  File,
  Image,
  Loader2,
  UploadCloud,
  X
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { uploadResearchMedia, ALLOWED_FILE_TYPES } from "@/services/research/mediaService";

interface MediaUploaderProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export default function MediaUploader({
  projectId,
  open,
  onOpenChange,
  onUploadComplete
}: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        setError("File type not supported. Please upload a PDF, DOCX, TXT, PNG, JPG, or WEBP file.");
        return;
      }
      
      // Validate file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum size is 10MB.");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      const result = await uploadResearchMedia(projectId, file);
      
      if (result) {
        onUploadComplete();
        onOpenChange(false);
        setFile(null);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    if (file.type.startsWith("image/")) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else {
      return <File className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload documents or images to your research project. 
            Supported formats: PDF, DOCX, TXT, PNG, JPG, WEBP.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!file ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-muted-foreground/40 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop your file, or click to browse
                </p>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                />
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="mt-2"
                >
                  Select File
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-md bg-muted/40">
              <div className="flex items-center gap-3">
                {getFileIcon()}
                <div className="text-sm">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
