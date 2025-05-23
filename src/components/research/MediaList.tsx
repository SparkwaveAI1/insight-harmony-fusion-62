
import React from "react";
import { ResearchMedia } from "@/services/research";
import {
  FileText,
  FileImage,
  File,
  Trash2,
  ExternalLink,
  Calendar,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { deleteResearchMedia } from "@/services/research/mediaService";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface MediaListProps {
  media: ResearchMedia[];
  projectId: string;
  isLoading: boolean;
  onDeleteComplete: () => void;
}

export default function MediaList({
  media,
  projectId,
  isLoading,
  onDeleteComplete
}: MediaListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedMedia, setSelectedMedia] = React.useState<ResearchMedia | null>(null);

  const handleDeleteClick = (mediaItem: ResearchMedia) => {
    setSelectedMedia(mediaItem);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedia) return;
    
    const success = await deleteResearchMedia(selectedMedia.id, projectId);
    if (success) {
      onDeleteComplete();
    }
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse space-y-2 w-full">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-md w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-10">
        <File className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-semibold">No files yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload files to your research project to get started
        </p>
      </div>
    );
  }

  const getFileIcon = (mediaItem: ResearchMedia) => {
    if (mediaItem.file_type.startsWith('image/')) {
      return <FileImage className="h-10 w-10 text-blue-500" />;
    }
    if (mediaItem.file_type.includes('pdf') || 
        mediaItem.file_type.includes('docx') || 
        mediaItem.file_type.includes('text/plain')) {
      return <FileText className="h-10 w-10 text-indigo-500" />;
    }
    return <File className="h-10 w-10 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {media.map((mediaItem) => (
        <div 
          key={mediaItem.id}
          className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
        >
          {getFileIcon(mediaItem)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {mediaItem.original_name}
              </h3>
              {mediaItem.is_processed && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Indexed
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(mediaItem.created_at), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {formatFileSize(mediaItem.file_size)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a 
                href={mediaItem.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only md:not-sr-only md:inline-block">View</span>
              </a>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(mediaItem)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:inline-block">Delete</span>
            </Button>
          </div>
        </div>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this file from your research project.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
