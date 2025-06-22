
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingDown, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type WithdrawalStatus = Database['public']['Enums']['withdrawal_status'];

export const AdminTransactionManagement = () => {
  const [processingWithdrawal, setProcessingWithdrawal] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: withdrawals } = useQuery({
    queryKey: ['admin-withdrawals-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles (email, full_name, balance)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: deposits } = useQuery({
    queryKey: ['admin-deposits-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles (email, full_name, balance)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, status, notes }: { withdrawalId: string; status: WithdrawalStatus; notes: string }) => {
      const { error } = await supabase
        .from('withdrawals')
        .update({
          status,
          admin_notes: notes,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);
      
      if (error) throw error;

      // If approved, deduct from user balance
      if (status === 'approved') {
        const withdrawal = withdrawals?.find(w => w.id === withdrawalId);
        if (withdrawal) {
          const newBalance = Number(withdrawal.profiles.balance) - Number(withdrawal.amount);
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({
              balance: newBalance
            })
            .eq('id', withdrawal.user_id);
          
          if (balanceError) throw balanceError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-detailed'] });
      toast({
        title: "Withdrawal Processed",
        description: "The withdrawal request has been processed successfully.",
      });
      setProcessingWithdrawal(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const confirmDepositMutation = useMutation({
    mutationFn: async ({ depositId, userId, amount }: { depositId: string; userId: string; amount: number }) => {
      // Update deposit status
      const { error: depositError } = await supabase
        .from('deposits')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', depositId);
      
      if (depositError) throw depositError;

      // Get current balance and add new amount
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;

      const newBalance = Number(profile.balance) + amount;
      
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: newBalance
        })
        .eq('id', userId);
      
      if (balanceError) throw balanceError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deposits-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-detailed'] });
      toast({
        title: "Deposit Confirmed",
        description: "The deposit has been confirmed and balance updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/20 text-yellow-400';
      case 'approved': case 'confirmed': return 'bg-green-600/20 text-green-400';
      case 'rejected': case 'failed': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Wallet className="h-6 w-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Transaction Management</h2>
      </div>

      <Tabs defaultValue="withdrawals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="withdrawals" className="data-[state=active]:bg-red-600">
            <TrendingDown className="h-4 w-4 mr-2" />
            Withdrawals ({withdrawals?.filter(w => w.status === 'pending').length || 0})
          </TabsTrigger>
          <TabsTrigger value="deposits" className="data-[state=active]:bg-green-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Deposits ({deposits?.filter(d => d.status === 'pending').length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Withdrawal Requests</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Address</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals?.map((withdrawal: any) => (
                    <TableRow key={withdrawal.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-white">
                            {withdrawal.profiles?.full_name || 'Not provided'}
                          </p>
                          <p className="text-sm text-gray-400">{withdrawal.profiles?.email}</p>
                          <p className="text-xs text-gray-500">
                            Balance: ${Number(withdrawal.profiles?.balance || 0).toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white font-semibold">
                            {withdrawal.amount} {withdrawal.crypto_type}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-gray-400 font-mono text-sm break-all">
                          {withdrawal.destination_address}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {getStatusIcon(withdrawal.status)}
                          <span className="ml-1">{withdrawal.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => setProcessingWithdrawal(withdrawal)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Process
                          </Button>
                        )}
                        {withdrawal.admin_notes && (
                          <p className="text-xs text-gray-400 mt-1">
                            Notes: {withdrawal.admin_notes}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Deposit History</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Transaction Hash</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits?.map((deposit: any) => (
                    <TableRow key={deposit.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-white">
                            {deposit.profiles?.full_name || 'Not provided'}
                          </p>
                          <p className="text-sm text-gray-400">{deposit.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white font-semibold">
                            {deposit.amount} {deposit.crypto_type}
                          </p>
                          <p className="text-xs text-gray-400">
                            To: {deposit.wallet_address.slice(0, 10)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {deposit.transaction_hash ? (
                          <p className="text-gray-400 font-mono text-sm break-all">
                            {deposit.transaction_hash.slice(0, 10)}...
                          </p>
                        ) : (
                          <p className="text-gray-500 text-sm">Not provided</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(deposit.status)}>
                          {getStatusIcon(deposit.status)}
                          <span className="ml-1">{deposit.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {deposit.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => confirmDepositMutation.mutate({
                                depositId: deposit.id,
                                userId: deposit.user_id,
                                amount: Number(deposit.amount)
                              })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm
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

      {/* Process Withdrawal Modal */}
      {processingWithdrawal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Process Withdrawal</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-300">User: {processingWithdrawal.profiles?.full_name}</p>
                <p className="text-gray-300">Amount: {processingWithdrawal.amount} {processingWithdrawal.crypto_type}</p>
                <p className="text-gray-300">User Balance: ${Number(processingWithdrawal.profiles?.balance || 0).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-gray-300">Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this transaction..."
                  className="bg-gray-700/50 border-gray-600 text-white"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setProcessingWithdrawal(null)}
                className="flex-1 border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={() => processWithdrawalMutation.mutate({
                  withdrawalId: processingWithdrawal.id,
                  status: 'rejected' as WithdrawalStatus,
                  notes: adminNotes
                })}
                variant="destructive"
                className="flex-1"
              >
                Reject
              </Button>
              <Button
                onClick={() => processWithdrawalMutation.mutate({
                  withdrawalId: processingWithdrawal.id,
                  status: 'approved' as WithdrawalStatus,
                  notes: adminNotes
                })}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
