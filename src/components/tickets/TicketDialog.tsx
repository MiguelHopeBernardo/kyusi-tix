
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, TicketPriority } from '@/models';
import FileUploadField from '@/components/tickets/FileUploadField';

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTicket?: Ticket | null;
}

const TicketDialog: React.FC<TicketDialogProps> = ({ 
  open, 
  onOpenChange,
  editingTicket = null,
}) => {
  const { user } = useAuth();
  const { addTicket, updateTicket, departments } = useData();
  
  const [title, setTitle] = useState(editingTicket?.title || '');
  const [description, setDescription] = useState(editingTicket?.description || '');
  const [priority, setPriority] = useState<TicketPriority>(editingTicket?.priority || 'medium');
  const [department, setDepartment] = useState<string | undefined>(editingTicket?.department || undefined);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (editingTicket) {
      updateTicket(editingTicket.id, {
        title,
        description,
        priority: priority as any,
        department: department === 'none' ? undefined : department,
      }, selectedFiles);
    } else {
      addTicket({
        title,
        description,
        status: 'open',
        priority: priority as any,
        createdBy: user.id,
        creatorName: user.name,
        creatorAvatar: user.avatar,
        creatorRole: user.role,
        department: department === 'none' ? undefined : department,
      }, selectedFiles);
    }
    
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
    if (!editingTicket) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDepartment(undefined);
      setSelectedFiles([]);
    } else {
      setTitle(editingTicket.title);
      setDescription(editingTicket.description);
      setPriority(editingTicket.priority);
      setDepartment(editingTicket.department);
      setSelectedFiles([]);
    }
  };
  
  // Handle department change
  const handleDepartmentChange = (value: string) => {
    setDepartment(value === 'none' ? undefined : value);
  };
  
  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the issue"
              rows={5}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={priority} 
                onValueChange={(value: TicketPriority) => setPriority(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={department !== undefined ? department : 'none'} 
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <FileUploadField onFilesSelected={handleFilesSelected} maxFiles={3} />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingTicket ? 'Update Ticket' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDialog;
