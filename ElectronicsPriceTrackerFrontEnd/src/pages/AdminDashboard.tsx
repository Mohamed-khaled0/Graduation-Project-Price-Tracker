import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { UserWithRole } from '@/contexts/auth/types';
import { getUserList, deleteUser, blockUser, assignRole, removeRole } from '@/contexts/auth/authUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Shield, Trash, Lock, Check, UserCog, MoreHorizontal, UserX, User, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type UserWithRoleWithEmail = UserWithRole & { email?: string };

const AdminDashboard = () => {
  const { user, userRoles } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRoleWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRoleWithEmail | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [actionType, setActionType] = useState<'assign' | 'remove'>('assign');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('admin');

  useEffect(() => {
    // Redirect if not admin
    if (!userRoles?.includes('admin')) {
      navigate('/');
      return;
    }

    loadUsers();
  }, [userRoles]);

  const loadUsers = async () => {
    try {
      const userList = await getUserList();
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      await loadUsers(); // Reload the list
      setShowDeleteDialog(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    
    const isBlocked = !isUserBlocked(selectedUser);
    
    try {
      await blockUser(selectedUser.id, isBlocked);
      await loadUsers(); // Reload the list
      setShowBlockDialog(false);
      setSelectedUser(null);
      toast.success(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast.error(`Failed to ${isBlocked ? 'block' : 'unblock'} user`);
    }
  };

  const handleRoleAction = async () => {
    if (!selectedUser) return;
    
    try {
      if (actionType === 'assign') {
        await assignRole(selectedUser.id, selectedRole);
        toast.success(`${selectedRole} role assigned successfully`);
      } else {
        await removeRole(selectedUser.id, selectedRole);
        toast.success(`${selectedRole} role removed successfully`);
      }
      await loadUsers(); // Reload the list
      setShowRoleDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error managing user role:', error);
      toast.error(`Failed to ${actionType} role`);
    }
  };

  const isUserBlocked = (user: UserWithRoleWithEmail) => {
    return user.blocked === true;
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="mr-2 h-7 w-7 text-purple-600" />
            Admin Dashboard
          </h1>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-500">Manage user accounts, roles, and access</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username || 'User'} className="h-10 w-10 rounded-full" />
                        ) : (
                          <span className="text-lg font-medium text-gray-500">
                            {(user.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.roles.includes('admin') ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.roles.includes('admin') ? 'admin' : 'user'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isUserBlocked(user) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {isUserBlocked(user) ? 'Blocked' : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('assign');
                            setSelectedRole('admin');
                            setShowRoleDialog(true);
                          }}
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          <span>Assign Role</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('remove');
                            setSelectedRole('admin');
                            setShowRoleDialog(true);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Remove Role</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBlockDialog(true);
                          }}
                        >
                          {isUserBlocked(user) ? (
                            <>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>Unblock User</span>
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4 text-amber-500" />
                              <span>Block User</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      <Footer />

      {/* Block/Unblock Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser && isUserBlocked(selectedUser) ? 'Unblock User' : 'Block User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && isUserBlocked(selectedUser) 
                ? 'Are you sure you want to unblock this user? They will regain access to the system.'
                : 'Are you sure you want to block this user? They will no longer be able to access the system.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            {selectedUser && isUserBlocked(selectedUser) ? (
              <Button variant="default" className="bg-green-600" onClick={handleBlockUser}>
                <Check className="mr-2 h-4 w-4" />
                Unblock User
              </Button>
            ) : (
              <Button variant="default" className="bg-amber-600" onClick={handleBlockUser}>
                <Lock className="mr-2 h-4 w-4" />
                Block User
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'assign' ? 'Assign Role' : 'Remove Role'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'assign'
                ? 'Select a role to assign to this user.'
                : 'Select a role to remove from this user.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 my-4">
            <Button
              variant={selectedRole === 'admin' ? 'default' : 'outline'}
              className={selectedRole === 'admin' ? 'bg-purple-600' : ''}
              onClick={() => setSelectedRole('admin')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Role
            </Button>
            <Button
              variant={selectedRole === 'user' ? 'default' : 'outline'}
              className={selectedRole === 'user' ? 'bg-blue-600' : ''}
              onClick={() => setSelectedRole('user')}
            >
              <User className="mr-2 h-4 w-4" />
              User Role
            </Button>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleAction}>
              {actionType === 'assign' ? (
                <>
                  <UserCog className="mr-2 h-4 w-4" />
                  Assign Role
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Remove Role
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard; 