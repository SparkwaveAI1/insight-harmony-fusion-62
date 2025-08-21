import { useState } from "react";
import { PersonaV3 } from "@/types/persona-v3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  Users, 
  Trash2, 
  Eye,
  Loader2
} from "lucide-react";
import { deleteV3Persona } from "@/services/persona/v3Operations/deleteV3Persona";
import { useToast } from "@/hooks/use-toast";

interface V3PersonaCardProps {
  persona: PersonaV3;
  onDeleted?: (personaId: string) => void;
}

export function V3PersonaCard({ persona, onDeleted }: V3PersonaCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteV3Persona(persona.persona_id);
      if (result.success) {
        onDeleted?.(persona.persona_id);
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('❌ V3-Clean: Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete persona",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const identity = persona.identity;
  const cognitive = persona.cognitive_profile;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">
            {persona.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            V3-Clean
          </Badge>
        </div>
        {persona.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {persona.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {identity && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{identity.age} years old</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{identity.occupation}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{identity.location.city}, {identity.location.country}</span>
            </div>
            
            {identity.dependents > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{identity.dependents} dependent{identity.dependents !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}

        {cognitive && (
          <div className="flex flex-wrap gap-1">
            {cognitive.big_five.extraversion > 0.6 && (
              <Badge variant="outline" className="text-xs">Outgoing</Badge>
            )}
            {cognitive.big_five.extraversion < 0.4 && (
              <Badge variant="outline" className="text-xs">Introverted</Badge>
            )}
            {cognitive.big_five.openness > 0.6 && (
              <Badge variant="outline" className="text-xs">Creative</Badge>
            )}
            {cognitive.big_five.conscientiousness > 0.6 && (
              <Badge variant="outline" className="text-xs">Organized</Badge>
            )}
            {cognitive.big_five.agreeableness > 0.6 && (
              <Badge variant="outline" className="text-xs">Cooperative</Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Created {formatDate(persona.created_at)}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                // TODO: Implement view detail functionality
                toast({
                  title: "Coming Soon",
                  description: "Detailed view will be available soon",
                });
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Persona</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{persona.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}