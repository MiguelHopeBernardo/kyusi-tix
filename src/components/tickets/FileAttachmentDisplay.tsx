
import React from 'react';
import { FileAttachment } from '@/models';
import { Card, CardContent } from '@/components/ui/card';
import { FileImage, FileText, File, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface FileAttachmentDisplayProps {
  attachments: FileAttachment[];
  canDelete?: boolean;
  onDelete?: (attachmentId: string) => void;
}

const FileAttachmentDisplay: React.FC<FileAttachmentDisplayProps> = ({ 
  attachments,
  canDelete = false,
  onDelete
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <FileImage className="h-10 w-10 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else {
      return <File className="h-10 w-10 text-gray-500" />;
    }
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

  const handleDelete = (attachmentId: string) => {
    if (onDelete) {
      onDelete(attachmentId);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Attachments ({attachments.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {attachments.map((attachment) => (
          <Card key={attachment.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <a 
                  href={attachment.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:bg-muted p-2 rounded-md transition-colors flex-1"
                >
                  {getFileIcon(attachment.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{attachment.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>
                </a>
                
                {canDelete && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete attachment</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FileAttachmentDisplay;
