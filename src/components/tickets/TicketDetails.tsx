
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
import FileAttachmentDisplay from '@/components/tickets/FileAttachmentDisplay';
import { RotateCw } from 'lucide-react';
import { toast } from "@/components/ui/sonner";

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
  const { updateTicket, addTicketComment, users, assignTicket, deleteAttachment } = useData();
  
  const [comment, setComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [status, setStatus] = useState<TicketStatus>(ticket?.status || 'open');
  const [selectedAssignee, setSelectedAssignee] = useState(ticket?.assignedTo || 'unassigned');
  const [isRouting, setIsRouting] = useState(false);
  
  const adminsAndFaculty = users.filter(u => u.role === 'admin' || u.role === 'faculty');
  
  const handleSaveStatus = () => {
    if (!ticket) return;
    updateTicket(ticket.id, { status });
  };
  
  const handleAssign = () => {
    if (!ticket) return;
    
    // If unassigned, clear the assignment
    if (selectedAssignee === 'unassigned') {
      updateTicket(ticket.id, { 
        assignedTo: undefined,
        assigneeName: undefined,
        assigneeAvatar: undefined
      });
      return;
    }
    
    assignTicket(ticket.id, selectedAssignee);
  };
  
  const handleAddComment = () => {
    if (!ticket || !comment.trim()) return;
    addTicketComment(ticket.id, comment, isInternalNote);
    setComment('');
  };
  
  const handleDeleteAttachment = (attachmentId: string) => {
    if (!ticket) return;
    deleteAttachment(ticket.id, attachmentId);
  };
  
  const handleAutoRoute = () => {
    if (!ticket) return;
    setIsRouting(true);
    
    // In a real implementation, this would call the API
    // For now we'll simulate with a timeout
    setTimeout(() => {
      // Auto-assign based on keywords in the description
      let department: string | undefined = undefined;
      let assigneeId: string | undefined = undefined;
      
      const descriptionLower = ticket.description.toLowerCase();
      const titleLower = ticket.title.toLowerCase();
      
      // Rule 1: Enrollment-related issues go to Registrar
      if (
        descriptionLower.includes('enroll') || 
        descriptionLower.includes('registration') ||
        titleLower.includes('enroll')
      ) {
        department = 'Registrar';
        // Find a staff in this department
        const registrarStaff = users.find(u => 
          u.department === 'Registrar' && 
          (u.role === 'admin' || u.role === 'faculty')
        );
        if (registrarStaff) assigneeId = registrarStaff.id;
      }
      
      // Rule 2: Grade-related issues go to Academic Affairs
      else if (
        descriptionLower.includes('grade') || 
        descriptionLower.includes('academic') ||
        descriptionLower.includes('class')
      ) {
        department = 'Academic Affairs';
        // Find faculty or staff in this department
        const academicStaff = users.find(u => 
          u.department === 'Academic Affairs' && 
          (u.role === 'admin' || u.role === 'faculty')
        );
        if (academicStaff) assigneeId = academicStaff.id;
      }
      
      // Rule 3: IT problems
      else if (
        descriptionLower.includes('password') || 
        descriptionLower.includes('login') ||
        descriptionLower.includes('account') ||
        descriptionLower.includes('system') ||
        descriptionLower.includes('technical') ||
        descriptionLower.includes('error')
      ) {
        department = 'IT';
        const itStaff = users.find(u => 
          u.department === 'IT' && 
          (u.role === 'admin' || u.role === 'faculty')
        );
        if (itStaff) assigneeId = itStaff.id;
      }
      
      // Rule 4: Financial concerns
      else if (
        descriptionLower.includes('payment') || 
        descriptionLower.includes('fee') ||
        descriptionLower.includes('tuition') ||
        descriptionLower.includes('financial') ||
        descriptionLower.includes('money')
      ) {
        department = 'Finance';
        const financeStaff = users.find(u => 
          u.department === 'Finance' && 
          (u.role === 'admin' || u.role === 'faculty')
        );
        if (financeStaff) assigneeId = financeStaff.id;
      }
      
      // Apply the changes
      let updates: any = {};
      let assigneeName = 'No one';
      
      if (department && department !== ticket.department) {
        updates.department = department;
      }
      
      if (assigneeId) {
        const assignee = users.find(u => u.id === assigneeId);
        if (assignee) {
          updates.assignedTo = assignee.id;
          updates.assigneeName = assignee.name;
          updates.assigneeAvatar = assignee.avatar;
          updates.status = 'in_progress';
          assigneeName = assignee.name;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        updateTicket(ticket.id, updates);
        
        // Add a comment about the auto-routing
        const routingNote = `Ticket was automatically routed to department: ${department || 'None'}, assignee: ${assigneeName}.`;
        addTicketComment(ticket.id, routingNote, true);
        
        toast.success("Ticket auto-routed successfully");
        
        // Update local state
        if (updates.assignedTo) setSelectedAssignee(updates.assignedTo);
        if (updates.status) setStatus(updates.status);
      } else {
        toast.info("No routing changes were necessary");
      }
      
      setIsRouting(false);
    }, 1000);
  };
  
  // Update local state when ticket changes
  React.useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setSelectedAssignee(ticket.assignedTo || 'unassigned');
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
                canDelete={canManageTicket || ticket.createdBy === user?.id} 
                onDelete={handleDeleteAttachment}
              />
            )}
          </div>
          
          <Separator />
          
          {/* Actions section (for admins and assignees) */}
          {canManageTicket && (
            <div className="space-y-4">
              <h3 className="font-medium">Ticket Management</h3>
              
              {/* Auto-routing button for admins */}
              {user?.role === 'admin' && (
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={handleAutoRoute}
                    disabled={isRouting}
                  >
                    <RotateCw className={cn("mr-2 h-4 w-4", isRouting && "animate-spin")} />
                    Auto-route Ticket
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyze ticket content and automatically assign to appropriate department and staff.
                  </p>
                </div>
              )}
              
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
                      <SelectItem value="unassigned">Unassigned</SelectItem>
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
                    disabled={selectedAssignee === ticket.assignedTo || (selectedAssignee === 'unassigned' && !ticket.assignedTo)}
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
