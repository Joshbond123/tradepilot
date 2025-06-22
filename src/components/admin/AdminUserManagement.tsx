
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Edit, Trash2, UserPlus, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_investments (
            id,
            amount,
            profit_earned,
            is_active,
            investment_plans (name)
          ),
          deposits (
            id,
            amount,
            status,
            created_at
          ),
          withdrawals (
            id,
            amount,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-detailed'] });
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUpdateUser = (updates: any) => {
    if (editingUser) {
      updateUserMutation.mutate({ userId: editingUser.id, updates });
    }
  };

  const getTotalInvestments = (user: any) => {
    return user.user_investments?.reduce((total: number, inv: any) => total + Number(inv.amount), 0) || 0;
  };

  const getTotalDeposits = (user: any) => {
    return user.deposits?.filter((d: any) => d.status === 'confirmed')
      .reduce((total: number, dep: any) => total + Number(dep.amount), 0) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">User Management</h2>
        </div>
        <Badge className="bg-blue-600/20 text-blue-400">
          {users?.length || 0} Total Users
        </Badge>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700/50 border-gray-600 text-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Balance</TableHead>
                  <TableHead className="text-gray-300">Investments</TableHead>
                  <TableHead className="text-gray-300">Deposits</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Joined</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-gray-700">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-white">{user.full_name || 'Not provided'}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-semibold">
                          ${Number(user.balance || 0).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white">${getTotalInvestments(user).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">
                          {user.user_investments?.filter((inv: any) => inv.is_active).length || 0} active
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white">${getTotalDeposits(user).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">
                          {user.deposits?.length || 0} total
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.is_active ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                          className="border-gray-600 text-gray-400 hover:text-white"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Full Name</Label>
                <Input
                  defaultValue={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Balance</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  defaultValue={editingUser.balance || 0}
                  onChange={(e) => setEditingUser({...editingUser, balance: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})}
                  className="rounded border-gray-600"
                />
                <Label className="text-gray-300">Active Account</Label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="flex-1 border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateUser({
                  full_name: editingUser.full_name,
                  balance: editingUser.balance,
                  is_active: editingUser.is_active,
                  updated_at: new Date().toISOString()
                })}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
