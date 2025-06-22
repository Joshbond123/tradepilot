
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Wallet, DollarSign, Globe } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminSystemSettings = () => {
  const [settings, setSettings] = useState<any>({});
  const [walletAddresses, setWalletAddresses] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemSettings } = useQuery({
    queryKey: ['admin-system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      
      const settingsObj: any = {};
      data.forEach((setting: any) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      
      setSettings(settingsObj);
      return data;
    },
  });

  const { data: walletData } = useQuery({
    queryKey: ['admin-wallet-addresses'],
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
      
      setWalletAddresses(walletsObj);
      return data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update, { onConflict: 'setting_key' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully.",
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

  const updateWalletsMutation = useMutation({
    mutationFn: async (newWallets: any) => {
      for (const [cryptoType, address] of Object.entries(newWallets)) {
        const { error } = await supabase
          .from('wallet_addresses')
          .upsert({
            crypto_type: cryptoType,
            address: address,
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'crypto_type' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-addresses'] });
      toast({
        title: "Wallets Updated",
        description: "Wallet addresses have been updated successfully.",
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

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSaveWallets = () => {
    updateWalletsMutation.mutate(walletAddresses);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Platform Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Platform Name</Label>
              <Input
                value={settings.platform_name || ''}
                onChange={(e) => setSettings({...settings, platform_name: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Minimum Withdrawal Amount ($)</Label>
              <Input
                type="number"
                value={settings.min_withdrawal || ''}
                onChange={(e) => setSettings({...settings, min_withdrawal: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Referral Commission (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={settings.referral_commission || ''}
                onChange={(e) => setSettings({...settings, referral_commission: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.maintenance_mode === 'true'}
                onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked ? 'true' : 'false'})}
                className="rounded border-gray-600"
              />
              <Label className="text-gray-300">Maintenance Mode</Label>
            </div>
          </div>
          <Button
            onClick={handleSaveSettings}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Platform Settings
          </Button>
        </Card>

        {/* Wallet Settings */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wallet className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Deposit Wallet Addresses</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Bitcoin (BTC) Address</Label>
              <Input
                value={walletAddresses.BTC || ''}
                onChange={(e) => setWalletAddresses({...walletAddresses, BTC: e.target.value})}
                placeholder="bc1..."
                className="bg-gray-700/50 border-gray-600 text-white font-mono"
              />
            </div>
            <div>
              <Label className="text-gray-300">Ethereum (ETH) Address</Label>
              <Input
                value={walletAddresses.ETH || ''}
                onChange={(e) => setWalletAddresses({...walletAddresses, ETH: e.target.value})}
                placeholder="0x..."
                className="bg-gray-700/50 border-gray-600 text-white font-mono"
              />
            </div>
            <div>
              <Label className="text-gray-300">USDT (TRC20) Address</Label>
              <Input
                value={walletAddresses.USDT || ''}
                onChange={(e) => setWalletAddresses({...walletAddresses, USDT: e.target.value})}
                placeholder="TR..."
                className="bg-gray-700/50 border-gray-600 text-white font-mono"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveWallets}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Wallet Addresses
          </Button>
        </Card>
      </div>

      {/* Statistics Card */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-bold text-white">Platform Statistics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">Loading...</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Total Deposits</p>
            <p className="text-2xl font-bold text-green-400">Loading...</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Total Withdrawals</p>
            <p className="text-2xl font-bold text-red-400">Loading...</p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Active Investments</p>
            <p className="text-2xl font-bold text-blue-400">Loading...</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
