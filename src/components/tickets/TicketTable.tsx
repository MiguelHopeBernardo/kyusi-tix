
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { getPriorityBadge } from '@/components/tickets/TicketPriorityBadge';
import { Ticket } from '@/models';

interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
  emptyMessage?: string;
  showSearch?: boolean;
}

const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  onViewTicket,
  emptyMessage = "No tickets found",
  showSearch = true,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ticket.department && ticket.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    ticket.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ticket.assigneeName && ticket.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="space-y-4">
      {showSearch && (
        <div>
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      
      {filteredTickets.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead className="hidden md:table-cell">Requester</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                <TableHead className="hidden sm:table-cell">Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="font-medium">
                      {ticket.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      #{ticket.id.split('-')[1]}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{ticket.creatorName}</TableCell>
                  <TableCell className="hidden md:table-cell">{ticket.department || '-'}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{ticket.assigneeName || '-'}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {getRelativeTime(ticket.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewTicket(ticket)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex justify-center items-center p-8 border rounded-md">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TicketTable;
