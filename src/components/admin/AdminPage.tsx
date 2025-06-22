
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Wallet, Settings, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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
          profiles (email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: deposits } = useQuery({
    queryKey: ['admin-deposits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles (email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-400" />
              <span className="text-xl font-bold text-white">TradePilot Admin</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-red-600/20 text-red-400">
            Administrator
          </Badge>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-white">
                  {withdrawals?.filter(w => w.status === 'pending').length || 0}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Plans</p>
                <p className="text-2xl font-bold text-white">
                  {plans?.filter(p => p.status === 'active').length || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Deposits</p>
                <p className="text-2xl font-bold text-white">{deposits?.length || 0}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">Users</TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-blue-600">Withdrawals</TabsTrigger>
            <TabsTrigger value="deposits" className="data-[state=active]:bg-blue-600">Deposits</TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-blue-600">Plans</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
              <div className="space-y-3">
                {users?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{user.full_name || user.email}</p>
                      <p className="text-sm text-gray-400">Balance: ${Number(user.balance || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={user.is_active ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        Referrals: {user.referral_earnings || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Withdrawals Management */}
          <TabsContent value="withdrawals">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Withdrawal Requests</h2>
              <div className="space-y-3">
                {withdrawals?.map((withdrawal: any) => (
                  <div key={withdrawal.id} className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white">
                          {withdrawal.profiles?.full_name || withdrawal.profiles?.email}
                        </p>
                        <p className="text-sm text-gray-400">
                          {withdrawal.amount} {withdrawal.crypto_type}
                        </p>
                      </div>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>To: {withdrawal.destination_address}</p>
                      <p>Date: {new Date(withdrawal.created_at).toLocaleDateString()}</p>
                      {withdrawal.admin_notes && (
                        <p>Notes: {withdrawal.admin_notes}</p>
                      )}
                    </div>
                    
                    {withdrawal.status === 'pending' && (
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Deposits Management */}
          <TabsContent value="deposits">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Deposit History</h2>
              <div className="space-y-3">
                {deposits?.map((deposit: any) => (
                  <div key={deposit.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">
                        {deposit.profiles?.full_name || deposit.profiles?.email}
                      </p>
                      <p className="text-sm text-gray-400">
                        {deposit.amount} {deposit.crypto_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(deposit.status)}>
                        {deposit.status}
                      </Badge>
                      {deposit.transaction_hash && (
                        <p className="text-xs text-gray-400 mt-1">
                          TX: {deposit.transaction_hash.slice(0, 10)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Plans Management */}
          <TabsContent value="plans">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Investment Plans</h2>
              <div className="space-y-3">
                {plans?.map((plan: any) => (
                  <div key={plan.id} className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{plan.name}</h3>
                      <Badge className={plan.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}>
                        {plan.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2">{plan.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Min Amount</p>
                        <p className="text-white">${Number(plan.min_amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Max Amount</p>
                        <p className="text-white">${Number(plan.max_amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Profit</p>
                        <p className="text-green-400">{plan.profit_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="text-white">{plan.duration_days} days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
