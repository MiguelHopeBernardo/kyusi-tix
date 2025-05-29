
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Ticket, TicketStatus, UserDetails } from '@/models';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketManagementProps {
  ticket: Ticket;
  status: TicketStatus;
  setStatus: (status: TicketStatus) => void;
  selectedAssignee: string;
  setSelectedAssignee: (assignee: string) => void;
  adminsAndFaculty: UserDetails[];
  isRouting: boolean;
  userRole?: string;
  onSaveStatus: () => void;
  onAssign: () => void;
  onAutoRoute: () => void;
}

const TicketManagement: React.FC<TicketManagementProps> = ({
  ticket,
  status,
  setStatus,
  selectedAssignee,
  setSelectedAssignee,
  adminsAndFaculty,
  isRouting,
  userRole,
  onSaveStatus,
  onAssign,
  onAutoRoute
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Ticket Management</h3>
      
      {/* Auto-routing button for admins */}
      {userRole === 'admin' && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={onAutoRoute}
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
            onClick={onSaveStatus}
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
            onClick={onAssign}
            disabled={selectedAssignee === ticket.assignedTo || (selectedAssignee === 'unassigned' && !ticket.assignedTo)}
          >
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketManagement;
