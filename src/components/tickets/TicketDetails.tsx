import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Ticket, TicketStatus } from '@/models';
import { toast } from "@/components/ui/sonner";
import TicketHeader from './TicketHeader';
import TicketInfo from './TicketInfo';
import TicketManagement from './TicketManagement';
import TicketComments from './TicketComments';

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
        <TicketHeader ticket={currentTicket} />
        
        <div className="space-y-6">
          <TicketInfo 
            ticket={currentTicket} 
            canManageTicket={canManageTicket}
            onDeleteAttachment={handleDeleteAttachment}
            userId={user?.id}
          />
          
          <Separator />
          
          {/* Actions section (for admins and assignees) */}
          {canManageTicket && (
            <>
              <TicketManagement
                ticket={currentTicket}
                status={status}
                setStatus={setStatus}
                selectedAssignee={selectedAssignee}
                setSelectedAssignee={setSelectedAssignee}
                adminsAndFaculty={adminsAndFaculty}
                isRouting={isRouting}
                userRole={user?.role}
                onSaveStatus={handleSaveStatus}
                onAssign={handleAssign}
                onAutoRoute={handleAutoRoute}
              />
              <Separator />
            </>
          )}
          
          {/* Comments section */}
          <TicketComments
            ticket={currentTicket}
            comment={comment}
            setComment={setComment}
            isInternalNote={isInternalNote}
            setIsInternalNote={setIsInternalNote}
            commentFile={commentFile}
            setCommentFile={setCommentFile}
            fileInputRef={fileInputRef}
            canAddFileToComment={canAddFileToComment}
            userRole={user?.role}
            onAddComment={handleAddComment}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetails;
