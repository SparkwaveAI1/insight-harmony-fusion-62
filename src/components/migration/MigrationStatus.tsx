import React, { useState, useEffect } from 'react';
import { migrationService } from '@/services/persona/migration/migrationService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface MigrationStatusProps {
  personaId?: string;
  showCandidates?: boolean;
}

export function MigrationStatus({ personaId, showCandidates = false }: MigrationStatusProps) {
  const [status, setStatus] = useState<'v1' | 'v2' | 'not_found' | 'loading'>('loading');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personaId) {
      checkPersonaStatus();
    } else if (showCandidates) {
      loadCandidates();
    }
  }, [personaId, showCandidates]);

  const checkPersonaStatus = async () => {
    if (!personaId) return;
    
    setLoading(true);
    try {
      const result = await migrationService.checkMigrationStatus(personaId);
      setStatus(result);
    } catch (error) {
      console.error('Error checking migration status:', error);
      setStatus('not_found');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const result = await migrationService.getMigrationCandidates();
      setCandidates(result);
    } catch (error) {
      console.error('Error loading migration candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'v2':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            PersonaV2
          </Badge>
        );
      case 'v1':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Needs Migration
          </Badge>
        );
      case 'not_found':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Found
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Checking...
          </Badge>
        );
    }
  };

  if (personaId) {
    return (
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
      </div>
    );
  }

  if (showCandidates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Migration Candidates
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadCandidates}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="text-muted-foreground">No personas need migration!</div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {candidates.length} persona(s) can be migrated to PersonaV2:
              </div>
              {candidates.slice(0, 5).map((candidate) => (
                <div key={candidate.persona_id} className="flex items-center justify-between text-sm">
                  <span>{candidate.name}</span>
                  <Badge variant="outline" className="text-xs">V1</Badge>
                </div>
              ))}
              {candidates.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  And {candidates.length - 5} more...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}