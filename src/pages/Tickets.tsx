
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Download } from 'lucide-react';
import TicketTable from '@/components/tickets/TicketTable';
import TicketDialog from '@/components/tickets/TicketDialog';
import TicketDetails from '@/components/tickets/TicketDetails';
import { Ticket } from '@/models';
import { toast } from "@/components/ui/sonner";

const Tickets = () => {
  const { user } = useAuth();
  const { 
    getMyTickets, 
    getAssignedToMeTickets, 
    getOpenTickets, 
    getClosedTickets, 
    tickets 
  } = useData();
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };
  
  const handleExportCSV = () => {
    // Get all tickets
    const allTickets = [...getMyTickets(), ...getAssignedToMeTickets()];
    
    if (allTickets.length === 0) {
      toast.error("No tickets to export");
      return;
    }
    
    // Create CSV headers
    const headers = ['Ticket ID', 'Title', 'Description', 'Status', 'Priority', 'Creator', 'Assignee', 'Department', 'Created At', 'Updated At'];
    
    // Create CSV rows
    const rows = allTickets.map(ticket => [
      ticket.id,
      `"${ticket.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${ticket.description.replace(/"/g, '""')}"`, // Escape quotes
      ticket.status,
      ticket.priority,
      ticket.creatorName,
      ticket.assigneeName || 'Unassigned',
      ticket.department || 'N/A',
      new Date(ticket.createdAt).toLocaleString(),
      new Date(ticket.updatedAt).toLocaleString(),
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Tickets exported successfully");
  };
  
  // Check if user can see assigned tickets (admin, faculty, staff)
  const canViewAssignedTickets = user?.role && ['admin', 'faculty', 'staff'].includes(user.role);
  
  // Only show tabs that are relevant to the user's role
  const renderTabs = () => {
    const isAdmin = user?.role === 'admin';
    
    if (isAdmin) {
      return (
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="open">Open Tickets</TabsTrigger>
          <TabsTrigger value="closed">Closed Tickets</TabsTrigger>
          <TabsTrigger value="my">My Tickets</TabsTrigger>
          <TabsTrigger value="assigned">Assigned To Me</TabsTrigger>
        </TabsList>
      );
    } else if (canViewAssignedTickets) {
      return (
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="my">My Tickets</TabsTrigger>
          <TabsTrigger value="assigned">Assigned To Me</TabsTrigger>
        </TabsList>
      );
    } else {
      // For students and alumni - only show "My Tickets"
      return (
        <TabsList className="grid grid-cols-1">
          <TabsTrigger value="my">My Tickets</TabsTrigger>
        </TabsList>
      );
    }
  };
  
  // For non-admin users, show statistics at the top
  const renderNonAdminStatsCards = () => {
    if (user?.role === 'admin') return null;
    
    const myTickets = getMyTickets();
    const assignedTickets = getAssignedToMeTickets();
    
    if (canViewAssignedTickets) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{myTickets.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">My Tickets</p>
              <p className="text-xs text-muted-foreground">Tickets you've created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{assignedTickets.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Assigned To Me</p>
              <p className="text-xs text-muted-foreground">Tickets requiring your attention</p>
            </CardContent>
          </Card>
        </div>
      );
    } else {
      // For students and alumni - only show "My Tickets" card
      return (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{myTickets.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">My Tickets</p>
              <p className="text-xs text-muted-foreground">Tickets you've created</p>
            </CardContent>
          </Card>
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tickets</h2>
          <p className="text-muted-foreground">
            Manage support requests and track issues
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportCSV} 
            variant="outline"
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          
          <Button onClick={() => setNewTicketDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>
      
      {/* Non-admin stat cards */}
      {renderNonAdminStatsCards()}
      
      <Tabs defaultValue={user?.role === 'admin' ? 'open' : 'my'}>
        {renderTabs()}
        
        {/* Admin tabs */}
        {user?.role === 'admin' && (
          <>
            <TabsContent value="open" className="mt-6">
              <TicketTable 
                tickets={getOpenTickets()}
                onViewTicket={handleViewTicket}
                emptyMessage="No open tickets"
              />
            </TabsContent>
            <TabsContent value="closed" className="mt-6">
              <TicketTable 
                tickets={getClosedTickets()}
                onViewTicket={handleViewTicket}
                emptyMessage="No closed tickets"
              />
            </TabsContent>
          </>
        )}
        
        {/* Common tabs */}
        <TabsContent value="my" className="mt-6">
          <TicketTable 
            tickets={getMyTickets()}
            onViewTicket={handleViewTicket}
            emptyMessage="You haven't created any tickets"
          />
        </TabsContent>
        
        {/* Assigned to me tab - only for admin, faculty, and staff */}
        {canViewAssignedTickets && (
          <TabsContent value="assigned" className="mt-6">
            <TicketTable 
              tickets={getAssignedToMeTickets()}
              onViewTicket={handleViewTicket}
              emptyMessage="No tickets assigned to you"
            />
          </TabsContent>
        )}
      </Tabs>
      
      {/* Ticket creation dialog */}
      <TicketDialog 
        open={newTicketDialogOpen}
        onOpenChange={setNewTicketDialogOpen}
      />
      
      {/* Ticket details sheet */}
      <TicketDetails 
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default Tickets;
