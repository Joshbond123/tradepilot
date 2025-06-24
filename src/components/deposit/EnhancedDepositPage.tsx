
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Copy, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const EnhancedDepositPage = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [depositAmount, setDepositAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: walletAddresses } = useQuery({
    queryKey: ['deposit-wallet-addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const walletsObj: any = {};
      data.forEach((wallet: any) => {
        walletsObj[wallet.crypto_type] = wallet.address;
      });
      
      return walletsObj;
    },
  });

  const { data: systemSettings } = useQuery({
    queryKey: ['deposit-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('setting_key', ['deposit_confirmation_required']);
      
      if (error) throw error;
      
      const settings: any = {};
      data.forEach((setting: any) => {
        settings[setting.setting_key] = setting.setting_value;
      });
      
      return settings;
    },
  });

  const { data: deposits } = useQuery({
    queryKey: ['user-deposits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const submitDepositMutation = useMutation({
    mutationFn: async (depositData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: depositData.amount,
          crypto_type: depositData.crypto_type,
          wallet_address: depositData.wallet_address,
          transaction_hash: depositData.transaction_hash || null,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-deposits'] });
      toast({
        title: "Deposit Submitted",
        description: "Your deposit has been submitted and is being processed.",
      });
      setDepositAmount('');
      setTxHash('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitDeposit = () => {
    const walletAddress = walletAddresses?.[selectedCrypto];
    
    if (!walletAddress) {
      toast({
        title: "Wallet Not Available",
        description: "Wallet address for this cryptocurrency is not available.",
        variant: "destructive",
      });
      return;
    }

    if (systemSettings?.deposit_confirmation_required === 'true' && !depositAmount) {
      toast({
        title: "Amount Required",
        description: "Please enter the amount you sent.",
        variant: "destructive",
      });
      return;
    }

    submitDepositMutation.mutate({
      amount: depositAmount || '0',
      crypto_type: selectedCrypto,
      wallet_address: walletAddress,
      transaction_hash: txHash
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/20 text-yellow-400';
      case 'confirmed': return 'bg-green-600/20 text-green-400';
      case 'failed': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const currentWalletAddress = walletAddresses?.[selectedCrypto];
  const confirmationRequired = systemSettings?.deposit_confirmation_required === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Deposit Funds</h1>
          <p className="text-gray-400">
            Send cryptocurrency to the address below to fund your account.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Upload className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Deposit Instructions</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Select Cryptocurrency</Label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 mt-2"
                  >
                    <option value="USDT">USDT (TRC20)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                  </select>
                </div>

                {currentWalletAddress && (
                  <div>
                    <Label className="text-gray-300">Deposit Address</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={currentWalletAddress}
                        readOnly
                        className="bg-gray-700/50 border-gray-600 text-white font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(currentWalletAddress)}
                        className="border-gray-600 text-gray-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {confirmationRequired && (
                  <div>
                    <Label className="text-gray-300">Amount Sent (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount you sent"
                      className="bg-gray-700/50 border-gray-600 text-white mt-2"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Please enter the USD value of the amount you sent
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-gray-300">Transaction Hash (Optional)</Label>
                  <Input
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Enter transaction hash"
                    className="bg-gray-700/50 border-gray-600 text-white font-mono mt-2"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Providing the transaction hash helps speed up confirmation
                  </p>
                </div>

                <Button
                  onClick={handleSubmitDeposit}
                  disabled={submitDepositMutation.isPending || !currentWalletAddress}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {submitDepositMutation.isPending ? 'Submitting...' : 'Confirm Deposit'}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
                <h4 className="text-blue-400 font-semibold mb-2">Important Notes:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Only send {selectedCrypto} to this address</li>
                  <li>• Minimum deposit may apply</li>
                  <li>• Deposits are usually confirmed within 30 minutes</li>
                  <li>• Do not send from exchanges directly</li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Deposit History</h3>
              
              {deposits && deposits.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Crypto</TableHead>
                        <TableHead className="text-gray-300">Transaction</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deposits.map((deposit: any) => (
                        <TableRow key={deposit.id} className="border-gray-700">
                          <TableCell>
                            <p className="text-white font-semibold">${deposit.amount}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600/20 text-blue-400">
                              {deposit.crypto_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {deposit.transaction_hash ? (
                              <p className="text-gray-400 font-mono text-sm">
                                {deposit.transaction_hash.slice(0, 10)}...
                              </p>
                            ) : (
                              <p className="text-gray-500 text-sm">Not provided</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(deposit.status)}>
                              {getStatusIcon(deposit.status)}
                              <span className="ml-1 capitalize">{deposit.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(deposit.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No deposits yet</p>
                  <p className="text-sm">Your deposit history will appear here</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
