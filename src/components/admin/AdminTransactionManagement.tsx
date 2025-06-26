
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminTransactionManagement = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deposits } = useQuery({
    queryKey: ['admin-deposits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles (email, full_name, username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: withdrawals } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles (email, full_name, username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const processDepositMutation = useMutation({
    mutationFn: async ({ depositId, action, notes }: { depositId: string; action: string; notes?: string }) => {
      const { data, error } = await supabase.rpc('process_deposit', {
        p_deposit_id: depositId,
        p_action: action,
        p_admin_notes: notes
      });
      
      if (error) throw error;
      if (!data) throw new Error('Deposit processing failed');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      toast({ 
        title: "Deposit Processed", 
        description: `Deposit has been ${variables.action}d successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, action, notes }: { withdrawalId: string; action: string; notes?: string }) => {
      const { data, error } = await supabase.rpc('process_withdrawal', {
        p_withdrawal_id: withdrawalId,
        p_action: action,
        p_admin_notes: notes
      });
      
      if (error) throw error;
      if (!data) throw new Error('Withdrawal processing failed');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      toast({ 
        title: "Withdrawal Processed", 
        description: `Withdrawal has been ${variables.action}d successfully.` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleProcessDeposit = (depositId: string, action: string) => {
    processDepositMutation.mutate({ depositId, action });
  };

  const handleProcessWithdrawal = (withdrawalId: string, action: string) => {
    processWithdrawalMutation.mutate({ withdrawalId, action });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-600/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'confirmed':
      case 'approved':
        return <Badge className="bg-green-600/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600/20 text-red-400"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{status}</Badge>;
    }
  };

  const filteredDeposits = deposits?.filter(deposit => {
    const matchesSearch = deposit.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || deposit.status === filter;
    return matchesSearch && matchesFilter;
  }) || [];

  const filteredWithdrawals = withdrawals?.filter(withdrawal => {
    const matchesSearch = withdrawal.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || withdrawal.status === filter;
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Transaction Management</h2>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <Input
          placeholder="Search by user email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-gray-700/50 border-gray-600 text-white"
        />
      </div>

      <Tabs defaultValue="deposits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="deposits" className="data-[state=active]:bg-green-600">
            Deposits ({deposits?.filter(d => d.status === 'pending').length || 0} pending)
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="data-[state=active]:bg-blue-600">
            Withdrawals ({withdrawals?.filter(w => w.status === 'pending').length || 0} pending)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Crypto</TableHead>
                    <TableHead className="text-gray-300">Wallet Address</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeposits.map((deposit: any) => (
                    <TableRow key={deposit.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-white">{deposit.profiles?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-400">{deposit.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-400 font-semibold">${Number(deposit.amount).toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-600/20 text-orange-400">{deposit.crypto_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-400">{deposit.wallet_address.slice(0, 20)}...</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                      <TableCell>
                        <span className="text-gray-400">{new Date(deposit.created_at).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell>
                        {deposit.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleProcessDeposit(deposit.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleProcessDeposit(deposit.id, 'reject')}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Crypto</TableHead>
                    <TableHead className="text-gray-300">Destination</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal: any) => (
                    <TableRow key={withdrawal.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-white">{withdrawal.profiles?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-400">{withdrawal.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-400 font-semibold">${Number(withdrawal.amount).toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-600/20 text-orange-400">{withdrawal.crypto_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-400">{withdrawal.destination_address.slice(0, 20)}...</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>
                        <span className="text-gray-400">{new Date(withdrawal.created_at).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleProcessWithdrawal(withdrawal.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleProcessWithdrawal(withdrawal.id, 'reject')}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
