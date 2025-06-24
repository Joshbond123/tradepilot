
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Wallet, Settings, TrendingUp, ArrowLeft, LogOut, Database, DollarSign, MessageSquare, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminEnhancedUserManagement } from './AdminEnhancedUserManagement';
import { AdminEnhancedPlanManagement } from './AdminEnhancedPlanManagement';
import { AdminTransactionManagement } from './AdminTransactionManagement';
import { AdminEnhancedSystemSettings } from './AdminEnhancedSystemSettings';
import { AdminSupportTickets } from './AdminSupportTickets';

export const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

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

  const { data: supportTickets } = useQuery({
    queryKey: ['admin-support-tickets-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: platformStats } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      const [usersResult, depositsResult, withdrawalsResult, investmentsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('deposits').select('amount, status'),
        supabase.from('withdrawals').select('amount, status'),
        supabase.from('user_investments').select('amount, is_active')
      ]);

      const totalUsers = usersResult.count || 0;
      const totalDeposits = depositsResult.data?.filter(d => d.status === 'confirmed')
        .reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const totalWithdrawals = withdrawalsResult.data?.filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const activeInvestments = investmentsResult.data?.filter(i => i.is_active).length || 0;
      const totalInvestmentAmount = investmentsResult.data?.filter(i => i.is_active)
        .reduce((sum, i) => sum + Number(i.amount), 0) || 0;

      return {
        totalUsers,
        totalDeposits,
        totalWithdrawals,
        activeInvestments,
        totalInvestmentAmount,
        pendingWithdrawals: withdrawalsResult.data?.filter(w => w.status === 'pending').length || 0,
        pendingDeposits: depositsResult.data?.filter(d => d.status === 'pending').length || 0,
        openTickets: supportTickets?.filter(t => t.status === 'open').length || 0
      };
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
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
              <span className="text-xl font-bold text-white">TradePilot Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-red-600/20 text-red-400">
              Administrator
            </Badge>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{platformStats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-yellow-400">{platformStats?.pendingWithdrawals || 0}</p>
              </div>
              <Download className="h-8 w-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Deposits</p>
                <p className="text-2xl font-bold text-orange-400">{platformStats?.pendingDeposits || 0}</p>
              </div>
              <Upload className="h-8 w-8 text-orange-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Open Tickets</p>
                <p className="text-2xl font-bold text-red-400">{platformStats?.openTickets || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">${(platformStats?.totalDeposits || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Investments</p>
                <p className="text-2xl font-bold text-purple-400">{platformStats?.activeInvestments || 0}</p>
                <p className="text-xs text-gray-500">${(platformStats?.totalInvestmentAmount || 0).toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Enhanced Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Overview</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">Users</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600">Transactions</TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-blue-600">Plans</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-blue-600">Support</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">New User Registration</p>
                      <p className="text-xs text-gray-400">5 minutes ago</p>
                    </div>
                    <Badge className="bg-green-600/20 text-green-400">New</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">Withdrawal Request</p>
                      <p className="text-xs text-gray-400">15 minutes ago</p>
                    </div>
                    <Badge className="bg-yellow-600/20 text-yellow-400">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">Investment Created</p>
                      <p className="text-xs text-gray-400">1 hour ago</p>
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-400">Active</Badge>
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Users className="h-4 w-4 mr-2" />
                    View Users
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Wallet className="h-4 w-4 mr-2" />
                    Transactions
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Manage Plans
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <AdminEnhancedUserManagement />
          </TabsContent>

          {/* Transactions Management */}
          <TabsContent value="transactions">
            <AdminTransactionManagement />
          </TabsContent>

          {/* Plans Management */}
          <TabsContent value="plans">
            <AdminEnhancedPlanManagement />
          </TabsContent>

          {/* Support Tickets */}
          <TabsContent value="support">
            <AdminSupportTickets />
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings">
            <AdminEnhancedSystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
