
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
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from "@/components/ui/sonner";

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
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Sanitize inputs to prevent XSS
    const sanitizedTitle = title.trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    
    const sanitizedDescription = description.trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    
    // Validate inputs
    const errors: string[] = [];
    
    if (sanitizedTitle.length < 5) {
      errors.push("Ticket title must be at least 5 characters long");
    }
    
    if (sanitizedTitle.length > 64) {
      errors.push("Ticket title cannot exceed 64 characters");
    }
    
    if (sanitizedDescription.length < 15) {
      errors.push("Ticket description must be at least 15 characters long");
    }
    
    if (sanitizedDescription.length > 300) {
      errors.push("Ticket description cannot exceed 300 characters");
    }
    
    // If there are validation errors, show them and don't submit
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationAlert(true);
      return;
    }
    
    if (editingTicket) {
      updateTicket(editingTicket.id, {
        title: sanitizedTitle,
        description: sanitizedDescription,
        priority: priority as any,
        department: department === 'none' ? undefined : department,
      }, selectedFiles);
    } else {
      addTicket({
        title: sanitizedTitle,
        description: sanitizedDescription,
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
    setValidationErrors([]);
  };
  
  // Handle department change
  const handleDepartmentChange = (value: string) => {
    setDepartment(value === 'none' ? undefined : value);
  };
  
  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  // Handle title change with validation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow typing but truncate at max length
    if (value.length <= 64) {
      setTitle(value);
    }
  };
  
  // Handle description change with validation
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Allow typing but truncate at max length
    if (value.length <= 300) {
      setDescription(value);
    } else {
      toast.info("Maximum character limit (300) reached");
    }
  };
  
  return (
    <>
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
                onChange={handleTitleChange}
                placeholder="Brief description of the issue"
                required
                className={title.length < 5 && title.length > 0 ? "border-red-500" : ""}
              />
              {title.length > 0 && (
                <div className="flex justify-between text-xs">
                  <span className={title.length < 5 ? "text-red-500" : "text-muted-foreground"}>
                    Minimum 5 characters
                  </span>
                  <span className={title.length > 64 ? "text-red-500" : "text-muted-foreground"}>
                    {title.length}/64 characters
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Detailed description of the issue"
                rows={5}
                required
                className={description.length < 15 && description.length > 0 ? "border-red-500" : ""}
              />
              {description.length > 0 && (
                <div className="flex justify-between text-xs">
                  <span className={description.length < 15 ? "text-red-500" : "text-muted-foreground"}>
                    Minimum 15 characters
                  </span>
                  <span className={description.length > 300 ? "text-red-500" : "text-muted-foreground"}>
                    {description.length}/300 characters
                  </span>
                </div>
              )}
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

      {/* Validation Alert Dialog */}
      <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Please fix the following issues:</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <p>{error}</p>
                </div>
              ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>
              Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TicketDialog;
