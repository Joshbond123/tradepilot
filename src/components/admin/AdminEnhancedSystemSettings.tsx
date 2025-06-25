import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Eye, EyeOff, Wallet, DollarSign, Globe, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AdminMessageTemplates } from './AdminMessageTemplates';
import { AdminRecaptchaSettings } from './AdminRecaptchaSettings';
import type { Json } from '@/integrations/supabase/types';

export const AdminEnhancedSystemSettings = () => {
  const [settings, setSettings] = useState<any>({});
  const [adminSettings, setAdminSettings] = useState<any>({});
  const [walletAddresses, setWalletAddresses] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemSettings } = useQuery({
    queryKey: ['admin-enhanced-system-settings'],
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

  const { data: adminSettingsData } = useQuery({
    queryKey: ['admin-settings-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');
      
      if (error) throw error;
      
      const settingsObj: any = {};
      data.forEach((setting: any) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      
      setAdminSettings(settingsObj);
      setPasswordChanged(settingsObj.password_changed === true);
      return data;
    },
  });

  const { data: walletData } = useQuery({
    queryKey: ['admin-wallet-addresses'],
    queryFn: async () => {
      console.log('Fetching wallet addresses...');
      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching wallets:', error);
        throw error;
      }
      
      console.log('Fetched wallet data:', data);
      const walletsObj: any = {};
      data.forEach((wallet: any) => {
        walletsObj[wallet.crypto_type] = wallet.address;
      });
      
      console.log('Processed wallet addresses:', walletsObj);
      setWalletAddresses(walletsObj);
      return data;
    },
  });

  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value as Json,
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
      queryClient.invalidateQueries({ queryKey: ['admin-enhanced-system-settings'] });
      toast({ title: "Settings Updated", description: "System settings have been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAdminSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value as Json,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings-data'] });
      toast({ title: "Admin Settings Updated", description: "Admin settings have been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateWalletsMutation = useMutation({
    mutationFn: async (newWallets: any) => {
      console.log('Updating wallets with:', newWallets);
      
      for (const [cryptoType, address] of Object.entries(newWallets)) {
        if (!address || address === '') {
          console.log(`Skipping empty address for ${cryptoType}`);
          continue;
        }
        
        console.log(`Updating ${cryptoType} with address: ${address}`);
        
        // First, deactivate existing addresses for this crypto type
        const { error: deactivateError } = await supabase
          .from('wallet_addresses')
          .update({ is_active: false })
          .eq('crypto_type', cryptoType);
        
        if (deactivateError) {
          console.error(`Error deactivating ${cryptoType}:`, deactivateError);
          throw deactivateError;
        }
        
        // Then insert/update the new address
        const { error: upsertError } = await supabase
          .from('wallet_addresses')
          .upsert({
            crypto_type: cryptoType as 'BTC' | 'ETH' | 'USDT',
            address: address as string,
            is_active: true,
            updated_at: new Date().toISOString()
          });
        
        if (upsertError) {
          console.error(`Error upserting ${cryptoType}:`, upsertError);
          throw upsertError;
        }
        
        console.log(`Successfully updated ${cryptoType}`);
      }
    },
    onSuccess: () => {
      console.log('Wallet update successful');
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-addresses'] });
      toast({
        title: "Wallets Updated",
        description: "Wallet addresses have been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Wallet update failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet addresses",
        variant: "destructive",
      });
    },
  });

  const handleSaveSystemSettings = () => {
    updateSystemSettingsMutation.mutate(settings);
  };

  const handleSaveAdminSettings = () => {
    const updatedSettings = { ...adminSettings };
    if (adminSettings.new_password) {
      updatedSettings.default_admin_password = adminSettings.new_password;
      updatedSettings.password_changed = true;
      setPasswordChanged(true);
      delete updatedSettings.new_password;
    }
    updateAdminSettingsMutation.mutate(updatedSettings);
  };

  const handleSaveWallets = () => {
    console.log('Saving wallets:', walletAddresses);
    updateWalletsMutation.mutate(walletAddresses);
  };

  const handleWalletChange = (cryptoType: string, value: string) => {
    console.log(`Wallet change: ${cryptoType} = ${value}`);
    setWalletAddresses(prev => ({
      ...prev,
      [cryptoType]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Enhanced System Settings</h2>
      </div>

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="platform" className="data-[state=active]:bg-blue-600">Platform</TabsTrigger>
          <TabsTrigger value="admin" className="data-[state=active]:bg-purple-600">Admin</TabsTrigger>
          <TabsTrigger value="wallets" className="data-[state=active]:bg-green-600">Wallets</TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-orange-600">Messages</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-600">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Platform Settings</h3>
            </div>
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300">Platform Name</Label>
                  <Input
                    value={settings.platform_name || ''}
                    onChange={(e) => setSettings({...settings, platform_name: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Minimum Withdrawal Amount ($)</Label>
                  <Input
                    type="number"
                    value={settings.min_withdrawal_amount || ''}
                    onChange={(e) => setSettings({...settings, min_withdrawal_amount: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Referral Commission (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.referral_commission || ''}
                    onChange={(e) => setSettings({...settings, referral_commission: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Platform Commission (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.platform_commission || ''}
                    onChange={(e) => setSettings({...settings, platform_commission: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white mt-2"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.maintenance_mode === 'true'}
                    onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked ? 'true' : 'false'})}
                  />
                  <Label className="text-gray-300">Maintenance Mode</Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.deposit_confirmation_required === 'true'}
                    onCheckedChange={(checked) => setSettings({...settings, deposit_confirmation_required: checked ? 'true' : 'false'})}
                  />
                  <Label className="text-gray-300">Require User Deposit Confirmation</Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.auto_approve_deposits === 'true'}
                    onCheckedChange={(checked) => setSettings({...settings, auto_approve_deposits: checked ? 'true' : 'false'})}
                  />
                  <Label className="text-gray-300">Auto-Approve Deposits</Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={settings.auto_approve_withdrawals === 'true'}
                    onCheckedChange={(checked) => setSettings({...settings, auto_approve_withdrawals: checked ? 'true' : 'false'})}
                  />
                  <Label className="text-gray-300">Auto-Approve Withdrawals</Label>
                </div>
              </div>
              
              <Button
                onClick={handleSaveSystemSettings}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Platform Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Admin Settings</h3>
            </div>
            <div className="space-y-6">
              <div>
                <Label className="text-gray-300">Change Admin Password</Label>
                <div className="relative mt-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={adminSettings.new_password || ''}
                    onChange={(e) => setAdminSettings({...adminSettings, new_password: e.target.value})}
                    placeholder={passwordChanged ? "Enter new password" : "Current: admin123"}
                    className="bg-gray-700/50 border-gray-600 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {!passwordChanged && (
                  <p className="text-yellow-400 text-sm mt-1">
                    Default password is currently "admin123". Change it for security.
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleSaveAdminSettings}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Admin Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="wallets">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Wallet className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">Deposit Wallet Addresses</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Bitcoin (BTC) Address</Label>
                <Input
                  value={walletAddresses.BTC || ''}
                  onChange={(e) => handleWalletChange('BTC', e.target.value)}
                  placeholder="bc1..."
                  className="bg-gray-700/50 border-gray-600 text-white font-mono mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-300">Ethereum (ETH) Address</Label>
                <Input
                  value={walletAddresses.ETH || ''}
                  onChange={(e) => handleWalletChange('ETH', e.target.value)}
                  placeholder="0x..."
                  className="bg-gray-700/50 border-gray-600 text-white font-mono mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-300">USDT (TRC20) Address</Label>
                <Input
                  value={walletAddresses.USDT || ''}
                  onChange={(e) => handleWalletChange('USDT', e.target.value)}
                  placeholder="TR..."
                  className="bg-gray-700/50 border-gray-600 text-white font-mono mt-2"
                />
              </div>
              <Button
                onClick={handleSaveWallets}
                disabled={updateWalletsMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateWalletsMutation.isPending ? 'Saving...' : 'Save Wallet Addresses'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <AdminMessageTemplates />
        </TabsContent>

        <TabsContent value="security">
          <AdminRecaptchaSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
