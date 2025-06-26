
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Download, Upload, MessageSquare, Database, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AdminOverview = () => {
  const { data: platformStats } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      const [usersResult, depositsResult, withdrawalsResult, investmentsResult, supportResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('deposits').select('amount, status'),
        supabase.from('withdrawals').select('amount, status'),
        supabase.from('user_investments').select('amount, is_active'),
        supabase.from('support_tickets').select('status')
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
        openTickets: supportResult.data?.filter(t => t.status === 'open').length || 0
      };
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const [recentUsers, recentDeposits, recentWithdrawals] = await Promise.all([
        supabase.from('profiles').select('email, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('deposits').select('amount, created_at, profiles(email)').order('created_at', { ascending: false }).limit(3),
        supabase.from('withdrawals').select('amount, created_at, profiles(email)').order('created_at', { ascending: false }).limit(3)
      ]);

      return {
        users: recentUsers.data || [],
        deposits: recentDeposits.data || [],
        withdrawals: recentWithdrawals.data || []
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Admin Overview</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">${(platformStats?.totalDeposits || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">From confirmed deposits</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Investments</p>
              <p className="text-2xl font-bold text-purple-400">{platformStats?.activeInvestments || 0}</p>
              <p className="text-xs text-gray-500">${(platformStats?.totalInvestmentAmount || 0).toLocaleString()} total</p>
            </div>
            <Database className="h-8 w-8 text-purple-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Withdrawals</p>
              <p className="text-2xl font-bold text-blue-400">${(platformStats?.totalWithdrawals || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Approved withdrawals</p>
            </div>
            <Download className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent User Registrations</h3>
          <div className="space-y-3">
            {recentActivity?.users.map((user: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="text-white font-semibold">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-green-600/20 text-green-400">New</Badge>
              </div>
            ))}
            {(!recentActivity?.users || recentActivity.users.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent registrations</p>
            )}
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentActivity?.deposits.slice(0, 2).map((deposit: any, index: number) => (
              <div key={`deposit-${index}`} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="text-white font-semibold">Deposit: ${Number(deposit.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{deposit.profiles?.email}</p>
                </div>
                <Badge className="bg-green-600/20 text-green-400">Deposit</Badge>
              </div>
            ))}
            {recentActivity?.withdrawals.slice(0, 1).map((withdrawal: any, index: number) => (
              <div key={`withdrawal-${index}`} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="text-white font-semibold">Withdrawal: ${Number(withdrawal.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{withdrawal.profiles?.email}</p>
                </div>
                <Badge className="bg-yellow-600/20 text-yellow-400">Withdrawal</Badge>
              </div>
            ))}
            {(!recentActivity?.deposits?.length && !recentActivity?.withdrawals?.length) && (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
