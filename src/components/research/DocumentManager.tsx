import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Trash2, Plus, Check, X, File } from 'lucide-react';
import { 
  uploadKnowledgeBaseDocument, 
  getProjectDocuments, 
  deleteKnowledgeBaseDocument,
  KnowledgeBaseDocument 
} from '@/services/collections';
import { extractTextFromFile } from '@/services/collections/textExtractionService';
import { toast } from 'sonner';

interface DocumentManagerProps {
  projectId?: string;
  selectedDocuments: KnowledgeBaseDocument[];
  onDocumentsChange: (documents: KnowledgeBaseDocument[]) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ 
  projectId, 
  selectedDocuments, 
  onDocumentsChange 
}) => {
  const [projectDocuments, setProjectDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectDocuments();
    }
  }, [projectId]);

  const loadProjectDocuments = async () => {
    if (!projectId) return;
    
    try {
      const docs = await getProjectDocuments(projectId);
      setProjectDocuments(docs);
    } catch (error) {
      console.error('Error loading project documents:', error);
      toast.error('Failed to load project documents');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      
      setIsExtracting(true);
      try {
        const extractedText = await extractTextFromFile(selectedFile);
        if (extractedText) {
          setContent(extractedText);
          toast.success('Text extracted successfully from file');
        } else {
          setContent('');
          toast.info('Could not extract text from this file type. You can add content manually.');
        }
      } catch (error) {
        console.error('Error extracting text:', error);
        setContent('');
        toast.error('Failed to extract text from file');
      } finally {
        setIsExtracting(false);
      }
    } else {
      setTitle('');
      setContent('');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    if (!projectId) {
      toast.error('Project must be selected to upload documents');
      return;
    }

    setIsUploading(true);
    try {
      const document = await uploadKnowledgeBaseDocument(
        projectId,
        title.trim(),
        content.trim() || undefined,
        file || undefined
      );

      if (document) {
        setProjectDocuments(prev => [document, ...prev]);
        onDocumentsChange([...selectedDocuments, document]);
        toast.success('Document uploaded successfully');
        resetForm();
        setIsUploadDialogOpen(false);
      } else {
        toast.error('Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFile(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const toggleDocumentSelection = (document: KnowledgeBaseDocument) => {
    const isSelected = selectedDocuments.some(doc => doc.id === document.id);
    
    if (isSelected) {
      onDocumentsChange(selectedDocuments.filter(doc => doc.id !== document.id));
    } else {
      onDocumentsChange([...selectedDocuments, document]);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${documentTitle}"? This action cannot be undone.`)) {
      const success = await deleteKnowledgeBaseDocument(documentId);
      if (success) {
        // Remove from project documents list
        setProjectDocuments(prev => prev.filter(doc => doc.id !== documentId));
        // Remove from selected documents if it was selected
        onDocumentsChange(selectedDocuments.filter(doc => doc.id !== documentId));
      }
    }
  };

  const getFileTypeIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="w-4 h-4" />;
    
    if (fileType.includes('image/')) return <File className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    if (fileType.includes('text/')) return <FileText className="w-4 h-4" />;
    
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Research Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload new documents or select from existing project knowledge base
            </p>
          </div>
          
          {projectId && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Choose File (Optional)</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.txt,.csv,.doc,.docx,.png,.jpg,.jpeg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported: PDF, TXT, CSV, DOC, DOCX, Images
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="doc-title">Document Title</Label>
                    <Input
                      id="doc-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter document title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="doc-content">Content</Label>
                    <Textarea
                      id="doc-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter document content or it will be extracted from the uploaded file"
                      rows={10}
                      disabled={isExtracting}
                    />
                    {isExtracting && (
                      <p className="text-sm text-blue-600 mt-1">
                        Extracting text from file...
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!projectId ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a project to access and upload documents</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Documents */}
            {selectedDocuments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Selected Documents ({selectedDocuments.length})</h4>
                <div className="space-y-2">
                  {selectedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getFileTypeIcon(doc.file_type)}
                        <div>
                          <div className="font-medium text-sm">{doc.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {doc.file_size ? formatFileSize(doc.file_size) : 'Text content'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDocumentSelection(doc)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Project Documents */}
            <div>
              <h4 className="font-medium text-sm mb-2">Project Knowledge Base</h4>
              {projectDocuments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No documents in project knowledge base</p>
                  <p className="text-xs">Upload documents to get started</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {projectDocuments.map((doc) => {
                    const isSelected = selectedDocuments.some(selected => selected.id === doc.id);
                    
                     return (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => toggleDocumentSelection(doc)}
                        >
                          {getFileTypeIcon(doc.file_type)}
                          <div>
                            <div className="font-medium text-sm">{doc.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.file_size ? formatFileSize(doc.file_size) : 'Text content'} • {new Date(doc.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div 
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}
                            onClick={() => toggleDocumentSelection(doc)}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentManager;