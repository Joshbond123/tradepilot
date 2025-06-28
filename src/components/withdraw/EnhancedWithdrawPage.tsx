
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const EnhancedWithdrawPage = () => {
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    crypto_type: 'USDT',
    destination_address: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: systemSettings } = useQuery({
    queryKey: ['withdrawal-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('setting_key', ['min_withdrawal_amount']);
      
      if (error) throw error;
      
      const settings: any = {};
      data.forEach((setting: any) => {
        settings[setting.setting_key] = setting.setting_value;
      });
      
      return settings;
    },
  });

  const { data: withdrawals } = useQuery({
    queryKey: ['user-withdrawals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: withdrawalData.amount,
          crypto_type: withdrawalData.crypto_type,
          destination_address: withdrawalData.destination_address,
          status: 'pending'
        });
      
      if (error) throw error;

      const { data: template } = await supabase
        .from('admin_message_templates')
        .select('subject, content')
        .eq('message_type', 'withdrawal')
        .eq('is_active', true)
        .single();

      if (template) {
        await supabase.from('messages').insert({
          user_id: user.id,
          type: 'system',
          subject: template.subject,
          content: template.content
        });

        await supabase.from('user_notifications').insert({
          user_id: user.id,
          title: template.subject,
          message: template.content,
          type: 'info'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted and is being processed.",
      });
      setWithdrawForm({ amount: '', crypto_type: 'USDT', destination_address: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawForm.amount);
    const minWithdrawal = parseFloat(String(systemSettings?.min_withdrawal_amount || '10'));
    const userBalance = parseFloat(String(profile?.balance || '0'));

    if (amount < minWithdrawal) {
      toast({
        title: "Invalid Amount",
        description: `Minimum withdrawal amount is $${minWithdrawal}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawForm.destination_address) {
      toast({
        title: "Missing Address",
        description: "Please enter the destination wallet address.",
        variant: "destructive",
      });
      return;
    }

    createWithdrawalMutation.mutate(withdrawForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/20 text-yellow-400';
      case 'approved': return 'bg-green-600/20 text-green-400';
      case 'rejected': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const cryptoOptions = [
    { 
      value: 'BTC', 
      label: 'Bitcoin (BTC)', 
      icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
    },
    { 
      value: 'ETH', 
      label: 'Ethereum (ETH)', 
      icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
    },
    { 
      value: 'USDT', 
      label: 'USDT (TRC20)', 
      icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Withdraw your funds to your crypto wallet.
          </p>
        </div>

        {/* Main Content - Fixed spacing and structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Withdrawal Form */}
          <Card className="bg-gray-800/50 border-gray-700 p-4 sm:p-6 h-fit">
            <div className="flex items-center space-x-2 mb-6">
              <Download className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-bold text-white">Withdrawal Request</h3>
            </div>

            {/* Available Balance */}
            <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Available Balance:</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                ${Number(profile?.balance || 0).toLocaleString()}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Enter Amount in $ USD</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="bg-gray-700/50 border-gray-600 text-white"
                  required
                />
                <p className="text-gray-500 text-sm">
                  Minimum: ${systemSettings?.min_withdrawal_amount || '10.00'}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300">Cryptocurrency</Label>
                <div className="grid grid-cols-1 gap-2">
                  {cryptoOptions.map((crypto) => (
                    <button
                      key={crypto.value}
                      type="button"
                      onClick={() => setWithdrawForm({ ...withdrawForm, crypto_type: crypto.value })}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        withdrawForm.crypto_type === crypto.value
                          ? 'border-red-500 bg-red-600/10'
                          : 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50'
                      }`}
                    >
                      <img src={crypto.icon} alt={crypto.label} className="w-6 h-6" />
                      <span className="text-white font-medium">{crypto.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Destination Wallet Address</Label>
                <Input
                  value={withdrawForm.destination_address}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, destination_address: e.target.value })}
                  placeholder="Enter wallet address"
                  className="bg-gray-700/50 border-gray-600 text-white font-mono text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={createWithdrawalMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-2" />
                {createWithdrawalMutation.isPending ? 'Processing...' : 'Request Withdrawal'}
              </Button>
            </form>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
              <p className="text-blue-400 text-sm">
                Withdrawals are processed within 0–3 minutes. If you don't receive your funds within a few hours, please contact support. Ensure the wallet address you provide is correct — funds sent to a wrong address are unrecoverable.
              </p>
            </div>
          </Card>

          {/* Withdrawal History */}
          <Card className="bg-gray-800/50 border-gray-700 p-4 sm:p-6 h-fit">
            <h3 className="text-lg font-bold text-white mb-4">Withdrawal History</h3>
            
            {withdrawals && withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Crypto</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal: any) => (
                      <TableRow key={withdrawal.id} className="border-gray-700">
                        <TableCell>
                          <p className="text-white font-semibold">${withdrawal.amount}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-600/20 text-purple-400">
                            {withdrawal.crypto_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(withdrawal.status)}>
                            {getStatusIcon(withdrawal.status)}
                            <span className="ml-1 capitalize">{withdrawal.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No withdrawals yet</p>
                <p className="text-sm">Your withdrawal history will appear here</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
