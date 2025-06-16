
import { toast } from 'sonner';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ProcessedFile {
  base64Data: string;
  type: string;
  name: string;
  size: number;
}

export class FileHandlingService {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  
  private static readonly ALLOWED_TYPES = [
    'application/pdf',
    'text/csv',
    'text/plain',
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/markdown'
  ];

  static validateFile(file: File): FileValidationResult {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: "File is too large. Maximum size is 50MB."
      };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: "File type not supported. Please use PDF, images, text files, or Office documents."
      };
    }

    return { isValid: true };
  }

  static async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  static async processFile(file: File): Promise<ProcessedFile> {
    const validation = this.validateFile(file);
    
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const base64Data = await this.convertToBase64(file);
    
    return {
      base64Data,
      type: file.type,
      name: file.name,
      size: file.size
    };
  }

  static getFileIcon(file: File): 'image' | 'document' {
    return file.type.startsWith('image/') ? 'image' : 'document';
  }

  static formatFileSize(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  static getAcceptedFileTypes(): string {
    return '.pdf,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.md';
  }
}
