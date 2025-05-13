
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/components/ui/sonner";

const Profile = () => {
  const { user } = useAuth();
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile saved successfully");
  };
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">
          Manage your account details and preferences
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="space-y-2 text-center">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" disabled>
                      Change Photo
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="py-2">
                  <Badge className="capitalize">{user.role}</Badge>
                </div>
              </div>
              
              {user.department && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue={user.department} readOnly />
                </div>
              )}
              
              {user.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" defaultValue="2023-12345" readOnly />
                </div>
              )}
              
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Password</h3>
                <p className="text-muted-foreground text-sm">Change your account password</p>
              </div>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                
                <Button 
                  type="button" 
                  className="w-full"
                  onClick={() => toast.success("Password updated successfully")}
                >
                  Update Password
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
