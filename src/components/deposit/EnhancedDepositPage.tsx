
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

    if (!depositAmount) {
      toast({
        title: "Amount Required",
        description: "Please enter the amount you sent.",
        variant: "destructive",
      });
      return;
    }

    submitDepositMutation.mutate({
      amount: depositAmount,
      crypto_type: selectedCrypto,
      wallet_address: walletAddress
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

  const confirmationRequired = systemSettings?.deposit_confirmation_required === 'true';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Deposit Funds</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Fund your account with cryptocurrency
          </p>
        </div>

        {confirmationRequired ? (
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Upload className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Deposit Instructions</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Select Cryptocurrency</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {cryptoOptions.map((crypto) => (
                      <button
                        key={crypto.value}
                        onClick={() => setSelectedCrypto(crypto.value)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          selectedCrypto === crypto.value
                            ? 'border-green-500 bg-green-600/10'
                            : 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50'
                        }`}
                      >
                        <img src={crypto.icon} alt={crypto.label} className="w-6 h-6" />
                        <span className="text-white font-medium">{crypto.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {walletAddresses?.[selectedCrypto] && (
                  <div>
                    <Label className="text-gray-300">Deposit Address</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={walletAddresses[selectedCrypto]}
                        readOnly
                        className="bg-gray-700/50 border-gray-600 text-white font-mono text-xs sm:text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(walletAddresses[selectedCrypto])}
                        className="border-gray-600 text-gray-400 hover:text-white shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

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
                </div>

                <Button
                  onClick={handleSubmitDeposit}
                  disabled={submitDepositMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {submitDepositMutation.isPending ? 'Submitting...' : 'Confirm Deposit'}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
                <p className="text-blue-400 text-sm">
                  Copy the wallet address, send your deposit, and enter the amount you sent. The AI will automatically detect and confirm the deposit via blockchain. Deposits are credited instantly after blockchain confirmation.
                </p>
              </div>
            </Card>

            {deposits && deposits.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700 p-4 sm:p-6">
                <h3 className="text-lg font-bold text-white mb-4">Deposit History</h3>
                
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
              </Card>
            )}
          </div>
        ) : (
          <Card className="bg-gray-800/50 border-gray-700 p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Upload className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">Available Cryptocurrencies</h3>
            </div>

            <div className="space-y-4">
              {cryptoOptions.map((crypto) => {
                const address = walletAddresses?.[crypto.value];
                return address ? (
                  <div key={crypto.value} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img src={crypto.icon} alt={crypto.label} className="w-8 h-8" />
                        <div>
                          <h4 className="text-white font-semibold">{crypto.label}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={address}
                        readOnly
                        className="bg-gray-800/50 border-gray-600 text-white font-mono text-xs sm:text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(address)}
                        className="border-gray-600 text-gray-400 hover:text-white shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null;
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
              <p className="text-blue-400 text-sm">
                Copy the wallet address and send the correct cryptocurrency. Deposits will be automatically credited to your dashboard once the transaction is confirmed on the blockchain. If you don't receive your deposit within a few hours, please contact support. Deposits are processed instantly once confirmed.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
