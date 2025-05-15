
import React from 'react';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Department } from '@/models';

interface UserFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string | null;
  setRoleFilter: (role: string | null) => void;
  departmentFilter: string | null;
  setDepartmentFilter: (department: string | null) => void;
  departments: Department[];
}

const UserFilter: React.FC<UserFilterProps> = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  departmentFilter,
  setDepartmentFilter,
  departments
}) => {
  const resetFilters = () => {
    setRoleFilter(null);
    setDepartmentFilter(null);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {(roleFilter || departmentFilter) && (
                  <Badge variant="secondary" className="ml-2 rounded-sm px-1">
                    {(roleFilter ? 1 : 0) + (departmentFilter ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Role</DropdownMenuLabel>
                <DropdownMenuItem 
                  className={!roleFilter ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setRoleFilter(null)}
                >
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={roleFilter === "admin" ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setRoleFilter("admin")}
                >
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={roleFilter === "faculty" ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setRoleFilter("faculty")}
                >
                  Faculty
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={roleFilter === "student" ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setRoleFilter("student")}
                >
                  Student
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={roleFilter === "alumni" ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setRoleFilter("alumni")}
                >
                  Alumni
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Department</DropdownMenuLabel>
                <DropdownMenuItem 
                  className={!departmentFilter ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setDepartmentFilter(null)}
                >
                  All Departments
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={departmentFilter === "none" ? "bg-accent text-accent-foreground" : ""}
                  onClick={() => setDepartmentFilter("none")}
                >
                  No Department
                </DropdownMenuItem>
                {departments.map((dept) => (
                  <DropdownMenuItem
                    key={dept.id}
                    className={departmentFilter === dept.name ? "bg-accent text-accent-foreground" : ""}
                    onClick={() => setDepartmentFilter(dept.name)}
                  >
                    {dept.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-center"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Show active filters as badges */}
      {(roleFilter || departmentFilter) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {roleFilter && (
            <Badge variant="outline" className="flex items-center gap-1">
              Role: {roleFilter}
              <button 
                className="ml-1 rounded-full hover:bg-accent p-0.5" 
                onClick={() => setRoleFilter(null)}
              >
                <span className="sr-only">Remove filter</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 4L4 8M4 4L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </Badge>
          )}
          
          {departmentFilter && (
            <Badge variant="outline" className="flex items-center gap-1">
              Department: {departmentFilter === 'none' ? 'None' : departmentFilter}
              <button 
                className="ml-1 rounded-full hover:bg-accent p-0.5" 
                onClick={() => setDepartmentFilter(null)}
              >
                <span className="sr-only">Remove filter</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 4L4 8M4 4L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs" 
            onClick={resetFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </>
  );
};

export default UserFilter;
