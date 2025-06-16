
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Trash2, Plus, File, Image, FileSpreadsheet } from 'lucide-react';
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

    if (!content.trim() && !file) {
      toast.error('Please provide either content or upload a file');
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

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-5 w-5 text-blue-500" />;
    
    if (fileType.includes('image/')) {
      return <Image className="h-5 w-5 text-green-500" />;
    }
    if (fileType.includes('spreadsheet') || fileType.includes('csv') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    }
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getAcceptedFileTypes = () => {
    return '.pdf,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.md';
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
                <Label htmlFor="content">Content (Optional if uploading file)</Label>
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
                  accept={getAcceptedFileTypes()}
                />
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>Supported formats:</p>
                  <p>• Documents: PDF, DOC, DOCX, TXT, MD</p>
                  <p>• Images: JPG, PNG, GIF, WEBP</p>
                  <p>• Data: CSV, XLS, XLSX</p>
                  <p>• Max size: 50MB</p>
                </div>
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
                  {getFileIcon(doc.file_type)}
                  <div>
                    <h4 className="font-medium">{doc.title}</h4>
                    {doc.content && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {doc.content.substring(0, 100)}...
                      </p>
                    )}
                    <div className="text-xs text-gray-500 space-x-2 mt-1">
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      {doc.file_size && (
                        <span>• {formatFileSize(doc.file_size)}</span>
                      )}
                      {doc.file_type && (
                        <span>• {doc.file_type.split('/')[1]?.toUpperCase()}</span>
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
                      title="Open file"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-2">No documents uploaded yet.</p>
            <p className="text-xs text-gray-400">Upload documents to build your project's knowledge base</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectKnowledgeBase;
