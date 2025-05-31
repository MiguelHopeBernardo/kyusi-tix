
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Filter, FileText, MessageSquare, UserCheck, Edit, Plus } from 'lucide-react';

interface LogEntry {
  id: string;
  ticketId: string;
  ticketTitle: string;
  action: 'created' | 'updated' | 'commented' | 'assigned' | 'status_changed' | 'auto_routed' | 'manual_routed';
  userName: string;
  userRole: string;
  timestamp: string;
  details: string;
  department?: string;
}

const Logs = () => {
  const { user } = useAuth();
  const { tickets } = useData();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  
  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Generate logs from tickets and comments
    const generatedLogs: LogEntry[] = [];
    
    tickets.forEach(ticket => {
      // Log ticket creation
      generatedLogs.push({
        id: `${ticket.id}-created`,
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        action: 'created',
        userName: ticket.creatorName,
        userRole: 'student', // Assuming ticket creators are students
        timestamp: ticket.createdAt,
        details: `Created ticket "${ticket.title}" with ${ticket.priority} priority`,
        department: ticket.department
      });

      // Log assignment if exists
      if (ticket.assignedTo && ticket.assigneeName) {
        generatedLogs.push({
          id: `${ticket.id}-assigned`,
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          action: 'assigned',
          userName: 'System', // Could be improved to track who assigned
          userRole: 'admin',
          timestamp: ticket.updatedAt,
          details: `Assigned to ${ticket.assigneeName} in ${ticket.department || 'Unknown'} department`,
          department: ticket.department
        });
      }

      // Log comments
      ticket.comments.forEach(comment => {
        const action = comment.isInternal ? 
          (comment.content.includes('automatically routed') ? 'auto_routed' :
           comment.content.includes('manually routed') ? 'manual_routed' : 'commented') 
          : 'commented';
          
        generatedLogs.push({
          id: `${ticket.id}-comment-${comment.id}`,
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          action: action,
          userName: comment.userName,
          userRole: comment.userRole || 'unknown',
          timestamp: comment.createdAt,
          details: comment.isInternal ? 
            `Internal note: ${comment.content.substring(0, 100)}...` : 
            `Comment: ${comment.content.substring(0, 100)}...`,
          department: ticket.department
        });
      });
    });

    // Sort logs by timestamp (newest first)
    generatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setLogs(generatedLogs);
  }, [tickets]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.ticketTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="h-4 w-4" />;
      case 'updated': return <Edit className="h-4 w-4" />;
      case 'commented': return <MessageSquare className="h-4 w-4" />;
      case 'assigned': return <UserCheck className="h-4 w-4" />;
      case 'auto_routed':
      case 'manual_routed': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, string> = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      commented: 'bg-purple-100 text-purple-800',
      assigned: 'bg-orange-100 text-orange-800',
      auto_routed: 'bg-cyan-100 text-cyan-800',
      manual_routed: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <Badge className={variants[action] || 'bg-gray-100 text-gray-800'}>
        <div className="flex items-center gap-1">
          {getActionIcon(action)}
          {action.replace('_', ' ')}
        </div>
      </Badge>
    );
  };

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Activity Logs</h2>
        <p className="text-muted-foreground">
          Monitor all ticket-related activities in the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterAction('all')}>
                  All Actions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterAction('created')}>
                  Ticket Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterAction('updated')}>
                  Ticket Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterAction('commented')}>
                  Comments Added
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterAction('assigned')}>
                  Ticket Assigned
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterAction('auto_routed')}>
                  Auto Routed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterAction('manual_routed')}>
                  Manual Routed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.ticketTitle}</div>
                          <div className="text-xs text-muted-foreground">#{log.ticketId.split('-')[1]}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-xs text-muted-foreground">{log.userRole}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm truncate">{log.details}</p>
                      </TableCell>
                      <TableCell>{log.department || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getRelativeTime(log.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex justify-center items-center p-8 border rounded-md">
              <p className="text-muted-foreground">No logs found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
