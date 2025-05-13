
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import TicketTable from '@/components/tickets/TicketTable';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, TicketStatus } from '@/models';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { tickets } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState<{ name: string, value: number, color: string }[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [resolvedTodayCount, setResolvedTodayCount] = useState(0);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    if (!user) return; // Safety check
    
    // Filter tickets based on user role
    const userTickets = user?.role === 'admin' 
      ? tickets 
      : tickets.filter(ticket => 
          ticket.createdBy === user?.id || 
          ticket.assignedTo === user?.id
        );
    
    // Calculate status data for pie chart (admin only)
    if (user?.role === 'admin') {
      const statusCounts: Record<string, number> = {};
      userTickets.forEach(ticket => {
        statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
      });
      
      const data = Object.entries(statusCounts).map(([status, count], index) => ({
        name: formatStatus(status as TicketStatus),
        value: count,
        color: COLORS[index % COLORS.length]
      }));
      
      setStatusData(data);
    }
    
    // Calculate card metrics
    setOpenCount(userTickets.filter(ticket => 
      ['open', 'in_progress'].includes(ticket.status)).length);
    
    setUrgentCount(userTickets.filter(ticket => 
      ticket.priority === 'urgent').length);
    
    // Get tickets resolved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setResolvedTodayCount(userTickets.filter(ticket => {
      const updatedAt = new Date(ticket.updatedAt);
      return ticket.status === 'resolved' && 
        updatedAt >= today;
    }).length);
    
    // Get recent tickets sorted by priority
    const sortedTickets = [...userTickets].sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setRecentTickets(sortedTickets.slice(0, 5));
    
    // Set my tickets
    setMyTickets(tickets.filter(ticket => ticket.createdBy === user?.id));
    
    // Set assigned tickets
    setAssignedTickets(tickets.filter(ticket => ticket.assignedTo === user?.id));
    
  }, [tickets, user]);
  
  const formatStatus = (status: TicketStatus): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // IMPORTANT: Move this conditional render after all hooks have been called
  if (!user) {
    return null; // Safety check
  }

  // For non-admin users, redirect is handled in AppLayout's useEffect
  // Don't return early here to avoid hook issues
  
  // Admin Dashboard
  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}
        </p>
      </div>
      
      {user?.role === 'admin' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Ticket Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div style={{ width: '100%', height: 200 }}>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No ticket data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{openCount}</CardTitle>
                <CardDescription>Open Tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tickets that need attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{urgentCount}</CardTitle>
                <CardDescription>Urgent Tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  High priority issues
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{resolvedTodayCount}</CardTitle>
                <CardDescription>Resolved Today</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Issues fixed today
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Sorted by priority</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketTable 
                tickets={recentTickets} 
                showSearch={false}
                emptyMessage="No tickets to display"
                hideActionColumn={true}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
