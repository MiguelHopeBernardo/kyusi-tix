
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Edit, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Department } from '@/models';
import { Textarea } from '@/components/ui/textarea';

const Departments = () => {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useData();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [head, setHead] = useState('');
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setHead('');
  };
  
  const openAddDepartmentDialog = () => {
    resetForm();
    setEditingDepartment(null);
    setDepartmentDialogOpen(true);
  };
  
  const openEditDepartmentDialog = (department: Department) => {
    setName(department.name);
    setDescription(department.description);
    setHead(department.head || '');
    setEditingDepartment(department);
    setDepartmentDialogOpen(true);
  };
  
  const confirmDelete = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDepartment = () => {
    if (departmentToDelete) {
      deleteDepartment(departmentToDelete.id);
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const departmentData = {
      name,
      description,
      head: head || undefined,
      members: editingDepartment?.members || 0,
    };
    
    if (editingDepartment) {
      updateDepartment(editingDepartment.id, departmentData);
    } else {
      addDepartment(departmentData);
    }
    
    setDepartmentDialogOpen(false);
    resetForm();
  };
  
  // Filter departments
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.head && dept.head.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">
            Manage university departments
          </p>
        </div>
        
        <Button onClick={openAddDepartmentDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>
      
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search departments..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredDepartments.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden sm:table-cell">Head</TableHead>
                <TableHead className="hidden lg:table-cell">Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="line-clamp-2">{dept.description}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{dept.head || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{dept.members || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDepartmentDialog(dept)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmDelete(dept)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex justify-center items-center p-8 border rounded-md">
          <p className="text-muted-foreground">No departments found</p>
        </div>
      )}
      
      {/* Add/Edit Department Dialog */}
      <Dialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computer Science"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Department description"
                required
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="head">Department Head</Label>
              <Input
                id="head"
                value={head}
                onChange={(e) => setHead(e.target.value)}
                placeholder="e.g. Dr. Juan Dela Cruz"
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setDepartmentDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingDepartment ? 'Update Department' : 'Add Department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {departmentToDelete?.name} department.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDepartment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Departments;
