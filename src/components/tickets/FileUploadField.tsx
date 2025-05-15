
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileImage, FileText, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface FileUploadFieldProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  onFilesSelected,
  maxFiles = 5,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(file => {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error(`File "${file.name}" is not supported. Only JPEG, PNG, and PDF files are allowed.`);
        return false;
      }
      
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the maximum file size of 10MB.`);
        return false;
      }
      
      return true;
    });

    // Check max files limit
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} files.`);
      return;
    }

    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    onFilesSelected([...selectedFiles, ...validFiles]);
    
    // Reset the input value so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-24 border-dashed flex flex-col gap-2"
        >
          <span>Add Attachments</span>
          <span className="text-xs text-muted-foreground">
            JPEG, PNG, or PDF (Max {maxFiles} files, 10MB each)
          </span>
        </Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="border rounded-md p-3">
          <p className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length}/{maxFiles})</p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index}>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(file)}
                    <div className="truncate">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
                {index < selectedFiles.length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadField;
