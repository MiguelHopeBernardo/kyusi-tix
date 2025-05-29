
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TicketComment } from '@/models';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: TicketComment;
  userRole?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, userRole }) => {
  const isStaffComment = comment.userRole === 'admin' || comment.userRole === 'faculty';
  
  // Don't show internal notes to non-staff
  if (comment.isInternal && userRole !== 'admin' && userRole !== 'faculty') {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "p-3 rounded-md",
        comment.isInternal 
          ? "bg-accent/20 border border-accent/30" 
          : isStaffComment 
            ? "bg-muted border"
            : "bg-background border"
      )}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={comment.userAvatar} />
          <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{comment.userName}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
        {comment.isInternal && (
          <span className="text-xs bg-yellow-500 text-white px-1 rounded">
            Internal Note
          </span>
        )}
      </div>
      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      
      {/* Display comment attachment if exists */}
      {comment.attachment && (
        <div className="mt-3 p-2 bg-background rounded border">
          <div className="flex items-center">
            {comment.attachment.fileType.includes('image') ? (
              <div>
                <a href={comment.attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={comment.attachment.fileUrl} 
                    alt={comment.attachment.filename}
                    className="max-h-32 rounded"
                  />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium truncate">{comment.attachment.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {comment.attachment.fileSize < 1024 
                      ? `${comment.attachment.fileSize} B`
                      : comment.attachment.fileSize < 1048576
                        ? `${(comment.attachment.fileSize / 1024).toFixed(1)} KB`
                        : `${(comment.attachment.fileSize / 1048576).toFixed(1)} MB`}
                  </p>
                  <a 
                    href={comment.attachment.fileUrl}
                    download={comment.attachment.filename}
                    className="text-xs text-primary hover:underline"
                  >
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
