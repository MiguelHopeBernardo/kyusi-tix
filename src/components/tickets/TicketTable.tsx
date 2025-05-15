
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
import { Ticket, TicketPriority, TicketStatus } from '@/models';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ArrowDownUp, Filter } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket?: (ticket: Ticket) => void;
  emptyMessage?: string;
  showSearch?: boolean;
  hideActionColumn?: boolean;
}

const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  onViewTicket,
  emptyMessage = "No tickets found",
  showSearch = true,
  hideActionColumn = false,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [sortField, setSortField] = useState<'updatedAt' | 'id' | 'priority'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: 'updatedAt' | 'id' | 'priority') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const filteredTickets = tickets.filter(ticket => {
    // Text search filter
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.department && ticket.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.assigneeName && ticket.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Priority filter
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });
  
  // Sort the tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortField === 'id') {
      return sortDirection === 'asc' 
        ? a.id.localeCompare(b.id)
        : b.id.localeCompare(a.id);
    } else if (sortField === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return sortDirection === 'asc'
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    } else {
      // Default sort by updatedAt
      return sortDirection === 'asc'
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
  
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {showSearch && (
          <div className="flex-1">
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('open')}>
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('in_progress')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('on_hold')}>
                On Hold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('resolved')}>
                Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('closed')}>
                Closed
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterPriority('all')}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('urgent')}>
                Urgent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('high')}>
                High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('medium')}>
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority('low')}>
                Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowDownUp className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort('updatedAt')}>
                Last Updated {sortField === 'updatedAt' && (sortDirection === 'asc' ? '(Oldest)' : '(Newest)')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('id')}>
                Ticket Number {sortField === 'id' && (sortDirection === 'asc' ? '(A-Z)' : '(Z-A)')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('priority')}>
                Priority {sortField === 'priority' && (sortDirection === 'asc' ? '(Low to High)' : '(High to Low)')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {sortedTickets.length > 0 ? (
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
                {!hideActionColumn && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTickets.map((ticket) => (
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
                  {!hideActionColumn && (
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewTicket && onViewTicket(ticket)}
                      >
                        View
                      </Button>
                    </TableCell>
                  )}
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
