
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
    tickets,
    exportTickets
  } = useData();
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };
  
  const handleExportCSV = async () => {
    try {
      await exportTickets();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  
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
    } else {
      return (
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="my">My Tickets</TabsTrigger>
          <TabsTrigger value="assigned">Assigned To Me</TabsTrigger>
        </TabsList>
      );
    }
  };
  
  // For non-admin users, show statistics at the top
  const renderNonAdminStatsCards = () => {
    if (user?.role === 'admin') return null;
    
    const myTickets = getMyTickets();
    const assignedTickets = getAssignedToMeTickets();
    
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
        <TabsContent value="assigned" className="mt-6">
          <TicketTable 
            tickets={getAssignedToMeTickets()}
            onViewTicket={handleViewTicket}
            emptyMessage="No tickets assigned to you"
          />
        </TabsContent>
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
