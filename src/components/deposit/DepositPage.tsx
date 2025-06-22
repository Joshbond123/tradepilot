
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, QrCode, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const DepositPage = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'USDT'>('BTC');
  const [amount, setAmount] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const { toast } = useToast();

  const { data: walletAddresses } = useQuery({
    queryKey: ['wallet-addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });

  const currentWallet = walletAddresses?.find(w => w.crypto_type === selectedCrypto);

  const cryptoOptions = [
    { id: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-400' },
    { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-blue-400' },
    { id: 'USDT', name: 'Tether (TRC-20)', icon: '₮', color: 'text-green-400' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const submitDeposit = async () => {
    if (!amount || !transactionHash) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user!.id,
          amount: parseFloat(amount),
          crypto_type: selectedCrypto,
          wallet_address: currentWallet?.address || '',
          transaction_hash: transactionHash,
        });

      if (error) throw error;

      toast({
        title: "Deposit Submitted",
        description: "Your deposit has been submitted and is being processed.",
      });

      setAmount('');
      setTransactionHash('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Deposit Funds</h1>
        <p className="text-gray-400">Fund your AI trading account with cryptocurrency</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Crypto Selection */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Select Cryptocurrency</h2>
          <div className="space-y-3">
            {cryptoOptions.map((crypto) => (
              <button
                key={crypto.id}
                onClick={() => setSelectedCrypto(crypto.id as any)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedCrypto === crypto.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl ${crypto.color}`}>{crypto.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-white">{crypto.name}</p>
                    <p className="text-sm text-gray-400">{crypto.id}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Deposit Details */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Deposit Information</h2>
          
          {currentWallet && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Wallet Address</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    value={currentWallet.address}
                    readOnly
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                  <Button
                    onClick={() => copyToClipboard(currentWallet.address)}
                    variant="outline"
                    size="icon"
                    className="border-gray-600 text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <QrCode className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-semibold mb-1">Important Instructions:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Send only {selectedCrypto} to this address</li>
                      <li>• Minimum deposit: $50 USD equivalent</li>
                      <li>• Deposits are processed within 2-6 confirmations</li>
                      <li>• Save your transaction hash for reference</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Deposit Confirmation */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Confirm Your Deposit</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">Amount ({selectedCrypto})</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount sent"
              className="bg-gray-700/50 border-gray-600 text-white"
              step="0.00000001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="txHash" className="text-gray-300">Transaction Hash</Label>
            <Input
              id="txHash"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="Enter transaction hash"
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>
        </div>
        
        <Button
          onClick={submitDeposit}
          className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Submit Deposit
        </Button>
      </Card>

      {/* Recent Deposits */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Deposits</h2>
        <div className="text-center py-8 text-gray-400">
          <p>Your recent deposits will appear here</p>
        </div>
      </Card>
    </div>
  );
};
