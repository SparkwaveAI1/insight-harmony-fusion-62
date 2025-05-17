
import { ImageIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateImageButtonProps {
  isVisible: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  hasImage: boolean;
}

export default function GenerateImageButton({
  isVisible,
  isGenerating,
  onGenerate,
  hasImage
}: GenerateImageButtonProps) {
  // Remove the condition that hides the button if the persona already has an image
  if (!isVisible) return null;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onGenerate}
      disabled={isGenerating}
      className="mt-2 flex items-center gap-2"
    >
      {isGenerating ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <ImageIcon className="h-4 w-4" />
      )}
      {hasImage ? "Regenerate Image" : "Generate Image"}
    </Button>
  );
}
