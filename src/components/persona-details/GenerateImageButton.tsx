
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateImageButtonProps {
  isVisible: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function GenerateImageButton({
  isVisible,
  isGenerating,
  onGenerate
}: GenerateImageButtonProps) {
  if (!isVisible) return null;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onGenerate}
      disabled={isGenerating}
      className="mt-2 flex items-center gap-2"
    >
      <ImageIcon className="h-4 w-4" />
      Generate Profile Image
    </Button>
  );
}
