
import React from 'react';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { getPriorityBadge } from '@/components/tickets/TicketPriorityBadge';
import { Ticket } from '@/models';

interface TicketHeaderProps {
  ticket: Ticket;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({ ticket }) => {
  return (
    <SheetHeader className="pb-4">
      <SheetTitle className="text-xl">{ticket.title}</SheetTitle>
      <div className="flex justify-between">
        <div className="space-x-2">
          {getStatusBadge(ticket.status)}
          {getPriorityBadge(ticket.priority)}
        </div>
        <div className="text-sm text-muted-foreground">
          Ticket #{ticket.id.split('-')[1]}
        </div>
      </div>
    </SheetHeader>
  );
};

export default TicketHeader;
