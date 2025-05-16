
import { ImageIcon } from "lucide-react";
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
  // Don't show if not visible or if there's already an image
  if (!isVisible || (hasImage && !isGenerating)) return null;
  
  const buttonText = hasImage ? "Regenerate Profile Image" : "Generate Profile Image";
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onGenerate}
      disabled={isGenerating}
      className="mt-2 flex items-center gap-2"
    >
      <ImageIcon className="h-4 w-4" />
      {buttonText}
    </Button>
  );
}
