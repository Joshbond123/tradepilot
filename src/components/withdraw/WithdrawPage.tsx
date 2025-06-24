
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const WithdrawPage = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: withdrawals } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const cryptoOptions = [
    { 
      id: 'BTC', 
      name: 'Bitcoin', 
      min: 10,
      icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579'
    },
    { 
      id: 'ETH', 
      name: 'Ethereum', 
      min: 10,
      icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880'
    },
    { 
      id: 'USDT', 
      name: 'Tether (TRC-20)', 
      min: 10,
      icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png?1668148663'
    },
  ];

  const submitWithdrawal = async () => {
    if (!amount || !address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    const userBalance = profile?.balance ? Number(profile.balance) : 0;

    if (withdrawAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    const minAmount = cryptoOptions.find(c => c.id === selectedCrypto)?.min || 0;
    if (withdrawAmount < minAmount) {
      toast({
        title: "Amount Too Low",
        description: `Minimum withdrawal amount is $${minAmount} USD`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user!.id,
          amount: withdrawAmount,
          crypto_type: selectedCrypto,
          destination_address: address,
        });

      if (error) throw error;

      toast({
        title: "Withdrawal Submitted",
        description: "Your withdrawal request has been submitted for admin approval.",
      });

      setAmount('');
      setAddress('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
        <p className="text-gray-400">Request withdrawal from your AI trading account</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Withdrawal Form */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Withdrawal Request</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Available Balance</Label>
              <div className="text-2xl font-bold text-green-400 mt-1">
                ${profile?.balance ? Number(profile.balance).toFixed(2) : '0.00'}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Cryptocurrency</Label>
              <Select value={selectedCrypto} onValueChange={(value: any) => setSelectedCrypto(value)}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {cryptoOptions.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id} className="text-white">
                      <div className="flex items-center space-x-2">
                        <img src={crypto.icon} alt={crypto.name} className="w-5 h-5" />
                        <span>{crypto.name} ({crypto.id})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300">Enter Amount in $ USD</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter withdrawal amount in USD"
                className="bg-gray-700/50 border-gray-600 text-white"
                step="0.01"
              />
              <p className="text-xs text-gray-400">
                Min: ${cryptoOptions.find(c => c.id === selectedCrypto)?.min} USD
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">Destination Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter your ${selectedCrypto} address`}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-300">
                  <p className="font-semibold mb-1">Important Notice:</p>
                  <p className="text-xs mb-2">
                    Withdrawals are processed within 0–3 minutes. If you are not credited within 1 hour after requesting a withdrawal, please contact our support team.
                  </p>
                  <p className="text-xs">
                    Ensure the wallet address you provide is correct. Funds sent to the wrong address cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={submitWithdrawal}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
            >
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Submit Withdrawal Request
            </Button>
          </div>
        </Card>

        {/* Withdrawal History */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Withdrawal History</h2>
          
          <div className="space-y-3">
            {withdrawals && withdrawals.length > 0 ? (
              withdrawals.map((withdrawal: any) => (
                <div key={withdrawal.id} className="p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">
                        ${withdrawal.amount} USD ({withdrawal.crypto_type})
                      </p>
                      <p className="text-sm text-gray-400">
                        To: {withdrawal.destination_address.slice(0, 10)}...{withdrawal.destination_address.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold capitalize ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                      {withdrawal.admin_notes && (
                        <p className="text-xs text-gray-400 mt-1">{withdrawal.admin_notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No withdrawal history yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
