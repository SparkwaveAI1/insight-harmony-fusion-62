import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Trash2, Plus, Download, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  uploadKnowledgeBaseDocument, 
  getProjectDocuments, 
  deleteKnowledgeBaseDocument,
  KnowledgeBaseDocument 
} from '@/services/collections';
import { extractTextFromFile, getExtractionRecommendation } from '@/services/collections/textExtractionService';
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
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [fileRecommendation, setFileRecommendation] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    console.log('Loading documents for project:', projectId);
    const docs = await getProjectDocuments(projectId);
    setDocuments(docs);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setExtractedContent('');
    setFileRecommendation(null);

    if (selectedFile) {
      setUploadProgress('Analyzing file...');
      
      // Try to extract text content
      const extractedText = await extractTextFromFile(selectedFile);
      
      if (extractedText) {
        setExtractedContent(extractedText);
        // Auto-populate content if it's empty
        if (!content.trim()) {
          setContent(extractedText);
        }
        toast.success('Text content extracted from file!');
      } else {
        // Show recommendation for manual content entry
        const recommendation = getExtractionRecommendation(selectedFile.type);
        setFileRecommendation(recommendation);
      }
      
      setUploadProgress('');
    }
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

    // Warn if file is uploaded but no content is provided
    if (file && !content.trim()) {
      const proceed = window.confirm(
        'You have uploaded a file but no content has been extracted or entered. Research participants will only see the file title and metadata, not the actual content. Do you want to proceed anyway?'
      );
      if (!proceed) return;
    }

    setIsLoading(true);
    setUploadProgress('Preparing upload...');
    
    try {
      if (file) {
        setUploadProgress('Uploading file...');
      }
      
      const document = await uploadKnowledgeBaseDocument(
        projectId,
        title.trim(),
        content.trim() || undefined,
        file || undefined
      );

      if (document) {
        setUploadProgress('Refreshing document list...');
        await loadDocuments();
        setIsDialogOpen(false);
        resetForm();
        setUploadProgress('');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      setUploadProgress('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${documentTitle}"? This action cannot be undone.`)) {
      const success = await deleteKnowledgeBaseDocument(documentId);
      if (success) {
        await loadDocuments();
      }
    }
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFile(null);
    setUploadProgress('');
    setExtractedContent('');
    setFileRecommendation(null);
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

  const getFileTypeIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-5 w-5 text-blue-500" />;
    
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (fileType.includes('text')) return <FileText className="h-5 w-5 text-gray-500" />;
    
    return <FileText className="h-5 w-5 text-blue-500" />;
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
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="file-upload">File (Optional)</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: PDF, DOC, DOCX, TXT, MD, CSV, XLSX files (max 5MB)
                </p>
              </div>

              {fileRecommendation && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {fileRecommendation}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="content">
                  Content {file ? '(Optional - will be available to research participants)' : '*'}
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Document content that research participants can access..."
                  rows={6}
                  className={content.trim() ? 'border-green-300' : ''}
                />
                {file && !content.trim() && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ No content provided - research participants will only see file metadata
                  </p>
                )}
                {file && content.trim() && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Content available to research participants
                  </p>
                )}
              </div>

              {uploadProgress && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadProgress}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Uploading...' : 'Add Document'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isLoading}
                >
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
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  {getFileTypeIcon(doc.file_type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{doc.title}</h4>
                      {doc.content ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Content Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                          Metadata Only
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 space-x-2 flex flex-wrap">
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      {doc.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                        </>
                      )}
                      {doc.file_type && (
                        <>
                          <span>•</span>
                          <span>{doc.file_type.split('/')[1]?.toUpperCase()}</span>
                        </>
                      )}
                    </div>
                    {doc.content && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {doc.content.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {doc.file_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadFile(doc.file_url!, doc.title)}
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id, doc.title)}
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm mb-2">No documents uploaded yet.</p>
            <p className="text-xs text-gray-400">
              Upload documents to create a knowledge base for this project.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectKnowledgeBase;
