
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserDetails, UserRole } from '@/models';
import UserFilter from '@/components/users/UserFilter';
import UserForm from '@/components/users/UserForm';
import UserTable from '@/components/users/UserTable';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';

const Users = () => {
  const { users, departments, addUser, updateUser, deleteUser } = useData();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserDetails | null>(null);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState<string | undefined>(undefined);
  const [position, setPosition] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('student');
    setDepartment(undefined);
    setPosition('');
    setStudentId('');
  };
  
  const openAddUserDialog = () => {
    resetForm();
    setEditingUser(null);
    setUserDialogOpen(true);
  };
  
  const openEditUserDialog = (user: UserDetails) => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role as UserRole);
    setDepartment(user.department);
    setPosition(user.position || '');
    setStudentId(user.studentId || '');
    setEditingUser(user);
    setUserDialogOpen(true);
  };
  
  const confirmDelete = (user: UserDetails) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = {
      name,
      email,
      role,
      department: department === 'none' ? undefined : department,
      position: position || undefined,
      studentId: studentId || undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    
    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }
    
    setUserDialogOpen(false);
    resetForm();
  };
  
  const handleDepartmentChange = (value: string) => {
    setDepartment(value === 'none' ? undefined : value);
  };
  
  // Convert users to UserDetails format
  const userDetails: UserDetails[] = users.map(user => ({
    ...user,
    createdAt: user.createdAt || new Date().toISOString()
  }));
  
  // Filter users
  const filteredUsers = userDetails.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesDepartment = departmentFilter 
      ? departmentFilter === 'none' 
        ? !user.department 
        : user.department === departmentFilter
      : true;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Roles</h2>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        
        <Button onClick={openAddUserDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <UserFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departments={departments}
      />
      
      <UserTable 
        users={filteredUsers}
        onEdit={openEditUserDialog}
        onDelete={confirmDelete}
      />
      
      <UserForm
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        editingUser={editingUser}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        role={role}
        setRole={setRole}
        department={department}
        handleDepartmentChange={handleDepartmentChange}
        position={position}
        setPosition={setPosition}
        studentId={studentId}
        setStudentId={setStudentId}
        resetForm={resetForm}
        departments={departments}
      />
      
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userToDelete={userToDelete}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default Users;
