
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ticket } from '@/models';
import FileAttachmentDisplay from '@/components/tickets/FileAttachmentDisplay';

interface TicketInfoProps {
  ticket: Ticket;
  canManageTicket: boolean;
  onDeleteAttachment: (attachmentId: string) => void;
  userId?: string;
}

const TicketInfo: React.FC<TicketInfoProps> = ({ 
  ticket, 
  canManageTicket, 
  onDeleteAttachment,
  userId 
}) => {
  return (
    <div className="space-y-2">
      <div className="pt-2 space-y-1">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={ticket.creatorAvatar} />
            <AvatarFallback>{ticket.creatorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">
            Created by <strong>{ticket.creatorName}</strong> ({ticket.creatorRole})
          </span>
        </div>
        
        {ticket.assigneeName && (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={ticket.assigneeAvatar} />
              <AvatarFallback>{ticket.assigneeName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">
              Assigned to <strong>{ticket.assigneeName}</strong>
            </span>
          </div>
        )}
        
        {ticket.department && (
          <div className="text-sm">
            Department: <strong>{ticket.department}</strong>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Created: {new Date(ticket.createdAt).toLocaleString()}
        </div>
        {ticket.updatedAt !== ticket.createdAt && (
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(ticket.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
      
      <div className="mt-4 p-3 border rounded-md bg-muted/50">
        <p className="whitespace-pre-wrap">{ticket.description}</p>
      </div>
      
      {/* Display attachments if any */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <FileAttachmentDisplay 
          attachments={ticket.attachments} 
          canDelete={canManageTicket || ticket.createdBy === userId} 
          onDelete={onDeleteAttachment}
        />
      )}
    </div>
  );
};

export default TicketInfo;
