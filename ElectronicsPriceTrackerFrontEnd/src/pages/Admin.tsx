
import { useState, useEffect } from 'react';
import { Shield, Trash, Lock, Check, UserCog, MoreHorizontal, UserX, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/auth';
import { UserWithRole } from '@/contexts/auth/types';
import { Button } from '@/components/ui/button';
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

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, getUserList, deleteUser, blockUser, assignRole, removeRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [actionType, setActionType] = useState<'assign' | 'remove'>('assign');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('admin');

  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      navigate('/');
    }

    // Load users
    const loadUsers = async () => {
      try {
        setLoading(true);
        const userList = await getUserList();
        setUsers(userList);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) {
      loadUsers();
    }
  }, [user, isAdmin, navigate, getUserList]);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      // Remove user from the list
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    
    const isBlocked = !isUserBlocked(selectedUser);
    
    try {
      await blockUser(selectedUser.id, isBlocked);
      // Update user status in the list
      setUsers(users.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            blocked: isBlocked
          };
        }
        return u;
      }));
      setShowBlockDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
    }
  };

  const handleRoleAction = async () => {
    if (!selectedUser) return;
    
    try {
      if (actionType === 'assign') {
        await assignRole(selectedUser.id, selectedRole);
        // Update user roles in the list
        setUsers(users.map(u => {
          if (u.id === selectedUser.id && !u.roles.includes(selectedRole)) {
            return {
              ...u,
              roles: [...u.roles, selectedRole]
            };
          }
          return u;
        }));
      } else {
        await removeRole(selectedUser.id, selectedRole);
        // Update user roles in the list
        setUsers(users.map(u => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              roles: u.roles.filter(r => r !== selectedRole)
            };
          }
          return u;
        }));
      }
      setShowRoleDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error managing user role:', error);
    }
  };

  const isUserBlocked = (user: UserWithRole) => {
    return user.blocked === true;
  };

  if (!user || loading) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <Button 
              variant="default" 
              onClick={() => navigate('/')}
              className="bg-[#39536f]"
            >
              Go to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Shield className="mr-2 h-7 w-7 text-purple-600" />
          Admin Dashboard
        </h1>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-gray-600">Manage user accounts, permissions, and access</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* This would come from auth.users which we don't display here */}
                      {/* We'd need to add an email field to profiles if needed */}
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span 
                            key={role} 
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isUserBlocked(user) 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isUserBlocked(user) ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                          
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
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

export default Admin;
