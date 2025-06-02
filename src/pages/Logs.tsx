
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Download } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";

const Logs = () => {
  const { user } = useAuth();
  const { logs } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  
  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return <Navigate to="/tickets" replace />;
  }
  
  // Filter logs based on search term and action filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });
  
  const handleExportLogs = () => {
    if (filteredLogs.length === 0) {
      toast.error("No logs to export");
      return;
    }
    
    // Create CSV headers
    const headers = ['Timestamp', 'User', 'Action', 'Ticket ID', 'Description'];
    
    // Create CSV rows
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.action,
      log.ticketId,
      `"${log.description.replace(/"/g, '""')}"` // Escape quotes
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Logs exported successfully");
  };
  
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'ticket_created':
        return 'default';
      case 'comment_added':
        return 'secondary';
      case 'status_changed':
        return 'outline';
      case 'assigned':
        return 'destructive';
      case 'unassigned':
        return 'destructive';
      case 'auto_routed':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'ticket_created':
        return 'Created';
      case 'comment_added':
        return 'Comment';
      case 'status_changed':
        return 'Status';
      case 'assigned':
        return 'Assigned';
      case 'unassigned':
        return 'Unassigned';
      case 'auto_routed':
        return 'Auto-routed';
      default:
        return action;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
          <p className="text-muted-foreground">
            Monitor all ticket activities and user actions
          </p>
        </div>
        
        <Button onClick={handleExportLogs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="ticket_created">Ticket Created</SelectItem>
                <SelectItem value="comment_added">Comment Added</SelectItem>
                <SelectItem value="status_changed">Status Changed</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="auto_routed">Auto-routed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Activity Log ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No logs found matching your criteria
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={log.userAvatar} />
                    <AvatarFallback>{log.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{log.userName}</span>
                      <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                        {getActionLabel(log.action)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Ticket #{log.ticketId}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {log.description}
                    </p>
                    
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
