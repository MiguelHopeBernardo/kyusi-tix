
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { getPriorityBadge } from '@/components/tickets/TicketPriorityBadge';
import { Ticket, TicketStatus } from '@/models';
import { cn } from '@/lib/utils';

interface TicketDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ 
  open, 
  onOpenChange,
  ticket,
}) => {
  const { user } = useAuth();
  const { updateTicket, addTicketComment, users, assignTicket } = useData();
  
  const [comment, setComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [status, setStatus] = useState<TicketStatus>(ticket?.status || 'open');
  const [selectedAssignee, setSelectedAssignee] = useState(ticket?.assignedTo || '');
  
  const adminsAndFaculty = users.filter(u => u.role === 'admin' || u.role === 'faculty');
  
  const handleSaveStatus = () => {
    if (!ticket) return;
    updateTicket(ticket.id, { status });
  };
  
  const handleAssign = () => {
    if (!ticket || !selectedAssignee) return;
    assignTicket(ticket.id, selectedAssignee);
  };
  
  const handleAddComment = () => {
    if (!ticket || !comment.trim()) return;
    addTicketComment(ticket.id, comment, isInternalNote);
    setComment('');
  };
  
  // Update local state when ticket changes
  React.useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setSelectedAssignee(ticket.assignedTo || '');
    }
  }, [ticket]);
  
  if (!ticket) return null;
  
  const canManageTicket = user?.role === 'admin' || ticket.assignedTo === user?.id;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">{ticket.title}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Ticket details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="space-x-2">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
              <div className="text-sm text-muted-foreground">
                Ticket #{ticket.id.split('-')[1]}
              </div>
            </div>
            
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
          </div>
          
          <Separator />
          
          {/* Actions section (for admins and assignees) */}
          {canManageTicket && (
            <div className="space-y-4">
              <h3 className="font-medium">Ticket Management</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as TicketStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    className="w-full mt-1"
                    onClick={handleSaveStatus}
                    disabled={status === ticket.status}
                  >
                    Save Status
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignTo">Assign To</Label>
                  <Select 
                    value={selectedAssignee} 
                    onValueChange={setSelectedAssignee}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {adminsAndFaculty.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    className="w-full mt-1"
                    onClick={handleAssign}
                    disabled={selectedAssignee === ticket.assignedTo}
                  >
                    Assign
                  </Button>
                </div>
              </div>
              
              <Separator />
            </div>
          )}
          
          {/* Comments section */}
          <div className="space-y-4">
            <h3 className="font-medium">Comments</h3>
            
            <div className="space-y-4">
              {ticket.comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {ticket.comments.map(comment => {
                    const isStaffComment = comment.userRole === 'admin' || comment.userRole === 'faculty';
                    
                    // Don't show internal notes to non-staff
                    if (comment.isInternal && user?.role !== 'admin' && user?.role !== 'faculty') {
                      return null;
                    }
                    
                    return (
                      <div 
                        key={comment.id} 
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Add comment form */}
            <div className="space-y-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              
              {/* Only show internal note option for admin/faculty */}
              {(user?.role === 'admin' || user?.role === 'faculty') && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="internal-note"
                    checked={isInternalNote}
                    onCheckedChange={setIsInternalNote}
                  />
                  <Label htmlFor="internal-note">Internal note (only visible to staff)</Label>
                </div>
              )}
              
              <Button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="w-full"
              >
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetails;
