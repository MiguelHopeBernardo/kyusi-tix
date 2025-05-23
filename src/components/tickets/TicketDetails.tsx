import React, { useState, useEffect } from 'react';
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
import { Ticket, TicketStatus, TicketComment } from '@/models';
import { cn } from '@/lib/utils';
import FileAttachmentDisplay from '@/components/tickets/FileAttachmentDisplay';
import { Paperclip, RotateCw } from 'lucide-react';
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
  const { updateTicket, addTicketComment, users, assignTicket, deleteAttachment, tickets } = useData();
  
  const [comment, setComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [status, setStatus] = useState<TicketStatus>(ticket?.status || 'open');
  const [selectedAssignee, setSelectedAssignee] = useState(ticket?.assignedTo || 'unassigned');
  const [isRouting, setIsRouting] = useState(false);
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(ticket);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const adminsAndFaculty = users.filter(u => u.role === 'admin' || u.role === 'faculty');

  // Keep the current ticket state updated with the latest data from the tickets array
  useEffect(() => {
    if (ticket && tickets) {
      const updatedTicket = tickets.find(t => t.id === ticket.id);
      if (updatedTicket) {
        setCurrentTicket(updatedTicket);
      }
    } else {
      setCurrentTicket(null);
    }
  }, [ticket, tickets]);
  
  const handleSaveStatus = () => {
    if (!currentTicket) return;
    updateTicket(currentTicket.id, { status });
  };
  
  const handleAssign = () => {
    if (!currentTicket) return;
    
    // If unassigned, clear the assignment
    if (selectedAssignee === 'unassigned') {
      updateTicket(currentTicket.id, { 
        assignedTo: undefined,
        assigneeName: undefined,
        assigneeAvatar: undefined
      });
      return;
    }
    
    assignTicket(currentTicket.id, selectedAssignee);
  };
  
  const handleAddComment = () => {
    if (!currentTicket || !comment.trim()) return;
    
    // Sanitize the comment to prevent XSS
    const sanitizedComment = comment.trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    
    // Add the comment
    addTicketComment(currentTicket.id, sanitizedComment, isInternalNote, commentFile);
    
    // Auto-update ticket to in_progress status when new comment is added
    if (currentTicket.status === 'open') {
      updateTicket(currentTicket.id, { status: 'in_progress' });
      // Update the local status state as well
      setStatus('in_progress');
    }
    
    setComment('');
    setCommentFile(null);
  };
  
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
  
  const handleDeleteAttachment = (attachmentId: string) => {
    if (!currentTicket) return;
    deleteAttachment(currentTicket.id, attachmentId);
  };
  
  const handleAutoRoute = () => {
    if (!currentTicket) return;
    setIsRouting(true);
    
    // In a real implementation, this would call the API
    // For now we'll simulate with a timeout
    setTimeout(() => {
      // Auto-assign based on keywords in the description
      let department: string | undefined = undefined;
      let assigneeId: string | undefined = undefined;
      
      const descriptionLower = currentTicket.description.toLowerCase();
      const titleLower = currentTicket.title.toLowerCase();
      
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
      
      if (department && department !== currentTicket.department) {
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
        updateTicket(currentTicket.id, updates);
        
        // Add a comment about the auto-routing
        const routingNote = `Ticket was automatically routed to department: ${department || 'None'}, assignee: ${assigneeName}.`;
        addTicketComment(currentTicket.id, routingNote, true);
        
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
  
  if (!currentTicket) return null;
  
  const canManageTicket = user?.role === 'admin' || currentTicket.assignedTo === user?.id;
  const canAddFileToComment = user?.role === 'admin' || user?.role === 'faculty';
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">{currentTicket.title}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Ticket details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="space-x-2">
                {getStatusBadge(currentTicket.status)}
                {getPriorityBadge(currentTicket.priority)}
              </div>
              <div className="text-sm text-muted-foreground">
                Ticket #{currentTicket.id.split('-')[1]}
              </div>
            </div>
            
            <div className="pt-2 space-y-1">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentTicket.creatorAvatar} />
                  <AvatarFallback>{currentTicket.creatorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  Created by <strong>{currentTicket.creatorName}</strong> ({currentTicket.creatorRole})
                </span>
              </div>
              
              {currentTicket.assigneeName && (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={currentTicket.assigneeAvatar} />
                    <AvatarFallback>{currentTicket.assigneeName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    Assigned to <strong>{currentTicket.assigneeName}</strong>
                  </span>
                </div>
              )}
              
              {currentTicket.department && (
                <div className="text-sm">
                  Department: <strong>{currentTicket.department}</strong>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                Created: {new Date(currentTicket.createdAt).toLocaleString()}
              </div>
              {currentTicket.updatedAt !== currentTicket.createdAt && (
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date(currentTicket.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 border rounded-md bg-muted/50">
              <p className="whitespace-pre-wrap">{currentTicket.description}</p>
            </div>
            
            {/* Display attachments if any */}
            {currentTicket.attachments && currentTicket.attachments.length > 0 && (
              <FileAttachmentDisplay 
                attachments={currentTicket.attachments} 
                canDelete={canManageTicket || currentTicket.createdBy === user?.id} 
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
                    disabled={status === currentTicket.status}
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
                    disabled={selectedAssignee === currentTicket.assignedTo || (selectedAssignee === 'unassigned' && !currentTicket.assignedTo)}
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
              {currentTicket.comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {currentTicket.comments.map(comment => {
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
              </div>
              
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
