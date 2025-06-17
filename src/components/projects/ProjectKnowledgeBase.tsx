
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Trash2, Plus } from 'lucide-react';
import { 
  uploadKnowledgeBaseDocument, 
  getProjectDocuments, 
  deleteKnowledgeBaseDocument,
  KnowledgeBaseDocument 
} from '@/services/collections';
import { toast } from 'sonner';

interface ProjectKnowledgeBaseProps {
  projectId: string;
}

const ProjectKnowledgeBase: React.FC<ProjectKnowledgeBaseProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    const docs = await getProjectDocuments(projectId);
    setDocuments(docs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please provide a title for the document');
      return;
    }

    setIsLoading(true);
    try {
      const document = await uploadKnowledgeBaseDocument(
        projectId,
        title.trim(),
        content.trim() || undefined,
        file || undefined
      );

      if (document) {
        await loadDocuments();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const success = await deleteKnowledgeBaseDocument(documentId);
      if (success) {
        await loadDocuments();
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Knowledge Base</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Knowledge Base Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Content (Optional)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Document content or notes..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="file-upload">File (Optional)</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: PDF, DOC, DOCX, TXT, MD files
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Uploading...' : 'Add Document'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{doc.title}</h4>
                    <div className="text-xs text-gray-500 space-x-2">
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      {doc.file_size && (
                        <span>• {formatFileSize(doc.file_size)}</span>
                      )}
                      {doc.file_type && (
                        <span>• {doc.file_type}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {doc.file_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.file_url!, '_blank')}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectKnowledgeBase;
