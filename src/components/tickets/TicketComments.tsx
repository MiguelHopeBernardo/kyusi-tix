
import React from 'react';
import { Ticket } from '@/models';
import CommentItem from './CommentItem';
import AddCommentForm from './AddCommentForm';

interface TicketCommentsProps {
  ticket: Ticket;
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

const TicketComments: React.FC<TicketCommentsProps> = ({
  ticket,
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
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Comments</h3>
      
      <div className="space-y-4">
        {ticket.comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {ticket.comments.map(commentItem => (
              <CommentItem 
                key={commentItem.id} 
                comment={commentItem} 
                userRole={userRole}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Add comment form */}
      <AddCommentForm
        comment={comment}
        setComment={setComment}
        isInternalNote={isInternalNote}
        setIsInternalNote={setIsInternalNote}
        commentFile={commentFile}
        setCommentFile={setCommentFile}
        fileInputRef={fileInputRef}
        canAddFileToComment={canAddFileToComment}
        userRole={userRole}
        onAddComment={onAddComment}
      />
    </div>
  );
};

export default TicketComments;
