
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Database, FileText, Plus, Trash2, Upload, Download, Search } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  content?: string;
  source: 'uploaded' | 'chat' | 'project';
}

interface ConversationKnowledgeBaseProps {
  sessionId: string | null;
  projectId?: string | null;
}

export const ConversationKnowledgeBase = ({ sessionId, projectId }: ConversationKnowledgeBaseProps) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<KnowledgeDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setDocuments([
      {
        id: "1",
        name: "User Research Brief.pdf",
        type: "application/pdf",
        size: 245760,
        uploadedAt: new Date(Date.now() - 3600000),
        source: "uploaded"
      },
      {
        id: "2",
        name: "Competitive Analysis.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 156340,
        uploadedAt: new Date(Date.now() - 7200000),
        source: "chat"
      }
    ]);

    if (projectId) {
      setProjectDocuments([
        {
          id: "p1",
          name: "Project Requirements.pdf",
          type: "application/pdf",
          size: 512000,
          uploadedAt: new Date(Date.now() - 86400000),
          source: "project"
        },
        {
          id: "p2",
          name: "Market Research Data.xlsx",
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: 789120,
          uploadedAt: new Date(Date.now() - 172800000),
          source: "project"
        }
      ]);
    }
  }, [projectId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload - in real implementation, this would upload to storage
      const newDocument: KnowledgeDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        source: "uploaded"
      };

      setDocuments(prev => [newDocument, ...prev]);
      toast.success(`${file.name} uploaded to knowledge base`);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast.success('Document removed from knowledge base');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('image')) return '🖼️';
    return '📄';
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'uploaded':
        return <Badge variant="outline" className="text-xs">Uploaded</Badge>;
      case 'chat':
        return <Badge variant="secondary" className="text-xs">From Chat</Badge>;
      case 'project':
        return <Badge variant="default" className="text-xs">Project</Badge>;
      default:
        return null;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjectDocuments = projectDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Knowledge Base</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Reference documents for this research session
        </p>
      </div>

      <div className="p-4 border-b">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Upload button */}
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,image/*"
              className="hidden"
              id="knowledge-upload"
              disabled={isUploading}
            />
            <Button
              onClick={() => document.getElementById('knowledge-upload')?.click()}
              disabled={isUploading}
              size="sm"
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Add Document'}
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Session Documents */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Session Documents</h3>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents in this session</p>
                <p className="text-xs">Upload files or attach them in chat</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-lg flex-shrink-0">
                          {getFileIcon(doc.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium truncate">{doc.name}</h4>
                            {getSourceBadge(doc.source)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Project Documents */}
          {projectId && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Project Documents</h3>
              {filteredProjectDocuments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No project documents found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProjectDocuments.map((doc) => (
                    <Card key={doc.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-lg flex-shrink-0">
                            {getFileIcon(doc.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium truncate">{doc.name}</h4>
                              {getSourceBadge(doc.source)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
