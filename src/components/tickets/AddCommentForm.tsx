
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Paperclip } from 'lucide-react';
import { toast } from "@/components/ui/sonner";

interface AddCommentFormProps {
  comment: string;
  setComment: (comment: string) => void;
  isInternalNote: boolean;
  setIsInternalNote: (isInternal: boolean) => void;
  commentFile: File | null;
  setCommentFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  canAddFileToComment: boolean;
  userRole?: string;
  onAddComment: () => void;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({
  comment,
  setComment,
  isInternalNote,
  setIsInternalNote,
  commentFile,
  setCommentFile,
  fileInputRef,
  canAddFileToComment,
  userRole,
  onAddComment
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }
    
    setCommentFile(file);
    
    // Reset the input value so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
      />
      
      <div className="flex flex-col gap-3">
        {/* File attachment for admin/faculty */}
        {canAddFileToComment && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!commentFile ? (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Attach File
              </Button>
            ) : (
              <div className="flex items-center justify-between p-2 border rounded bg-muted/30">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{commentFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {commentFile.size < 1024 
                      ? `${commentFile.size} B` 
                      : commentFile.size < 1048576 
                        ? `${(commentFile.size/1024).toFixed(1)} KB` 
                        : `${(commentFile.size/1048576).toFixed(1)} MB`}
                  </span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCommentFile(null)}
                >
                  &times;
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Internal note option for admin/faculty */}
        {(userRole === 'admin' || userRole === 'faculty') && (
          <div className="flex items-center space-x-2">
            <Switch
              id="internal-note"
              checked={isInternalNote}
              onCheckedChange={setIsInternalNote}
            />
            <Label htmlFor="internal-note">Internal note (only visible to staff)</Label>
          </div>
        )}
      </div>
      
      <Button
        onClick={onAddComment}
        disabled={!comment.trim()}
        className="w-full"
      >
        Add Comment
      </Button>
    </div>
  );
};

export default AddCommentForm;
