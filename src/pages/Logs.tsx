
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Filter, FileText, MessageSquare, Edit, UserPlus, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface LogEntry {
  id: string;
  action: 'ticket_created' | 'ticket_updated' | 'comment_added' | 'status_changed' | 'assignment_changed' | 'priority_changed';
  ticketId: string;
  ticketTitle: string;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  timestamp: Date;
  metadata?: any;
}

const Logs = () => {
  const { user } = useAuth();
  const { tickets } = useData();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Generate mock logs based on existing tickets data
  useEffect(() => {
    const generateLogs = () => {
      const mockLogs: LogEntry[] = [];
      
      tickets.forEach(ticket => {
        // Ticket creation log
        mockLogs.push({
          id: `log-${ticket.id}-created`,
          action: 'ticket_created',
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          userId: ticket.createdBy,
          userName: ticket.creatorName,
          userRole: 'student', // Mock role
          details: `Created ticket "${ticket.title}" with ${ticket.priority} priority`,
          timestamp: new Date(ticket.createdAt),
          metadata: { priority: ticket.priority, department: ticket.department }
        });

        // Status change logs (mock some status changes)
        if (ticket.status !== 'open') {
          mockLogs.push({
            id: `log-${ticket.id}-status`,
            action: 'status_changed',
            ticketId: ticket.id,
            ticketTitle: ticket.title,
            userId: ticket.assignedTo || 'admin-001',
            userName: ticket.assigneeName || 'System Admin',
            userRole: 'admin',
            details: `Changed status from "open" to "${ticket.status}"`,
            timestamp: new Date(ticket.updatedAt),
            metadata: { oldStatus: 'open', newStatus: ticket.status }
          });
        }

        // Assignment logs
        if (ticket.assignedTo) {
          mockLogs.push({
            id: `log-${ticket.id}-assigned`,
            action: 'assignment_changed',
            ticketId: ticket.id,
            ticketTitle: ticket.title,
            userId: 'admin-001',
            userName: 'System Admin',
            userRole: 'admin',
            details: `Assigned ticket to ${ticket.assigneeName}`,
            timestamp: new Date(ticket.updatedAt),
            metadata: { assignedTo: ticket.assigneeName }
          });
        }

        // Mock some comment logs
        if (Math.random() > 0.5) {
          mockLogs.push({
            id: `log-${ticket.id}-comment`,
            action: 'comment_added',
            ticketId: ticket.id,
            ticketTitle: ticket.title,
            userId: ticket.assignedTo || ticket.createdBy,
            userName: ticket.assigneeName || ticket.creatorName,
            userRole: ticket.assignedTo ? 'admin' : 'student',
            details: `Added a comment to the ticket`,
            timestamp: new Date(ticket.updatedAt),
            metadata: { commentType: 'public' }
          });
        }
      });

      // Sort by timestamp (newest first)
      mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
    };

    generateLogs();
  }, [tickets]);

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.ticketTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(log => log.timestamp >= cutoffDate);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, dateFilter]);

  const getActionIcon = (action: LogEntry['action']) => {
    switch (action) {
      case 'ticket_created':
        return <FileText className="h-4 w-4" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4" />;
      case 'ticket_updated':
      case 'status_changed':
      case 'priority_changed':
        return <Edit className="h-4 w-4" />;
      case 'assignment_changed':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: LogEntry['action']) => {
    switch (action) {
      case 'ticket_created':
        return 'bg-blue-500';
      case 'comment_added':
        return 'bg-green-500';
      case 'status_changed':
        return 'bg-yellow-500';
      case 'assignment_changed':
        return 'bg-purple-500';
      case 'priority_changed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatAction = (action: LogEntry['action']) => {
    switch (action) {
      case 'ticket_created':
        return 'Ticket Created';
      case 'comment_added':
        return 'Comment Added';
      case 'ticket_updated':
        return 'Ticket Updated';
      case 'status_changed':
        return 'Status Changed';
      case 'assignment_changed':
        return 'Assignment Changed';
      case 'priority_changed':
        return 'Priority Changed';
      default:
        return 'Unknown Action';
    }
  };

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
          <p className="text-muted-foreground">
            Monitor all ticket-related activities and system events
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="ticket_created">Ticket Created</SelectItem>
                  <SelectItem value="comment_added">Comment Added</SelectItem>
                  <SelectItem value="status_changed">Status Changed</SelectItem>
                  <SelectItem value="assignment_changed">Assignment Changed</SelectItem>
                  <SelectItem value="priority_changed">Priority Changed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tickets Created</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.action === 'ticket_created').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comments Added</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.action === 'comment_added').length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status Changes</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.action === 'status_changed').length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No logs found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full ${getActionColor(log.action)} text-white`}>
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {formatAction(log.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Ticket #{log.ticketId.slice(-6)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(log.timestamp, 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    <h4 className="font-medium mt-1 truncate">
                      {log.ticketTitle}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.details}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        <strong>User:</strong> {log.userName}
                      </span>
                      <span>
                        <strong>Role:</strong> {log.userRole}
                      </span>
                    </div>
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
