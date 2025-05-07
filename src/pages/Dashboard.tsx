
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TicketStatus, TicketPriority } from '@/models';
import TicketTable from '@/components/tickets/TicketTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    tickets, 
    getTicketStatsCounts, 
    getMyTickets, 
    getAssignedToMeTickets,
    getOpenTickets
  } = useData();
  
  const isAdmin = user?.role === 'admin';
  
  // Get ticket stats
  const stats = getTicketStatsCounts();
  
  // Generate data for pie chart
  const statusData = Object.entries(stats.statusCounts).map(([key, value]) => ({
    name: key,
    value,
  }));
  
  // Colors for pie chart
  const STATUS_COLORS: Record<TicketStatus, string> = {
    open: '#f97316',
    in_progress: '#3b82f6',
    on_hold: '#f59e0b',
    resolved: '#10b981',
    closed: '#6b7280',
  };
  
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}!
          </p>
        </div>
        
        {/* Stats and Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ticket Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry) => (
                        <Cell 
                          key={entry.name} 
                          fill={STATUS_COLORS[entry.name as TicketStatus] || '#888888'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <CardDescription>
                Tickets that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Urgent Tickets</CardTitle>
              <CardDescription>
                High priority items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.urgent}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CardDescription>
                Completed tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedToday}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Tickets */}
        <div>
          <h3 className="text-lg font-medium mb-4">Recent Tickets</h3>
          <TicketTable 
            tickets={getOpenTickets().sort((a, b) => {
              const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority as TicketPriority] - priorityOrder[b.priority as TicketPriority];
            }).slice(0, 5)}
            showSearch={false}
            emptyMessage="No recent tickets"
          />
        </div>
      </div>
    );
  } else {
    // Dashboard for non-admin users (Faculty, Student, Alumni)
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}!
          </p>
        </div>
        
        {/* Stats for non-admin users */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">My Tickets</CardTitle>
              <CardDescription>
                Tickets you've created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMyTickets().length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Assigned To Me</CardTitle>
              <CardDescription>
                Tickets requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAssignedToMeTickets().length}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Ticket Tabs */}
        <Tabs defaultValue="my">
          <TabsList>
            <TabsTrigger value="my">My Tickets</TabsTrigger>
            <TabsTrigger value="assigned">Assigned To Me</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my" className="mt-4">
            <TicketTable 
              tickets={getMyTickets().slice(0, 5)}
              showSearch={false}
              emptyMessage="You haven't created any tickets"
            />
          </TabsContent>
          
          <TabsContent value="assigned" className="mt-4">
            <TicketTable 
              tickets={getAssignedToMeTickets().slice(0, 5)}
              showSearch={false}
              emptyMessage="No tickets assigned to you"
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
};

export default Dashboard;
