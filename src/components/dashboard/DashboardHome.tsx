
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Users, ArrowUpRight, Bot, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const DashboardHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

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

  const { data: investments } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_plans (name, profit_percentage)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: arbitrageData } = useQuery({
    queryKey: ['arbitrage-feed'],
    queryFn: async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false');
      return response.json();
    },
    refetchInterval: 4000,
  });

  const displayName = profile?.username || profile?.full_name || user?.email || 'User';

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900/50 to-green-900/50 rounded-xl p-6 border border-blue-500/30">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome back, {displayName}!
        </h1>
        <p className="text-gray-300">
          Access your portfolio insights and recent activity below.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <p className="text-2xl font-bold text-white">
                ${profile?.balance ? Number(profile.balance).toFixed(2) : '0.00'}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Investments</p>
              <p className="text-2xl font-bold text-white">{investments?.length || 0}</p>
              <p className="text-blue-400 text-sm">AI Trading Plans</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Referral Earnings</p>
              <p className="text-2xl font-bold text-white">
                ${profile?.referral_earnings ? Number(profile.referral_earnings).toFixed(2) : '0.00'}
              </p>
              <p className="text-purple-400 text-sm">10% Commission</p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">AI Status</p>
              <p className="text-2xl font-bold text-green-400">Active</p>
              <p className="text-gray-400 text-sm">24/7 Trading</p>
            </div>
            <Bot className="h-8 w-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          onClick={() => navigate('/deposit')}
          className="bg-green-600 hover:bg-green-700 text-white p-6 h-auto flex flex-col items-center space-y-2"
        >
          <Wallet className="h-6 w-6" />
          <span>Deposit</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/withdraw')}
          className="bg-red-600 hover:bg-red-700 text-white p-6 h-auto flex flex-col items-center space-y-2"
        >
          <ArrowUpRight className="h-6 w-6" />
          <span>Withdraw</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/plans')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 h-auto flex flex-col items-center space-y-2"
        >
          <TrendingUp className="h-6 w-6" />
          <span>Invest</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/arbitrage')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 h-auto flex flex-col items-center space-y-2"
        >
          <Zap className="h-6 w-6" />
          <span>Live Feed</span>
        </Button>
      </div>

      {/* Live Arbitrage Preview */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Live Arbitrage Opportunities</h2>
          <Button 
            onClick={() => navigate('/arbitrage')}
            variant="outline" 
            size="sm"
            className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
          >
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {arbitrageData?.slice(0, 3).map((coin: any) => (
            <div key={coin.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div>
                  <p className="font-semibold text-white">{coin.name}</p>
                  <p className="text-sm text-gray-400">{coin.symbol.toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">${coin.current_price.toFixed(2)}</p>
                <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Active Investments */}
      {investments && investments.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Active AI Trading Plans</h2>
          <div className="space-y-3">
            {investments.map((investment: any) => (
              <div key={investment.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-semibold text-white">{investment.investment_plans?.name}</p>
                  <p className="text-sm text-gray-400">
                    ${Number(investment.amount).toFixed(2)} invested
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">
                    {investment.investment_plans?.profit_percentage}% Monthly
                  </p>
                  <p className="text-sm text-gray-400">
                    Earned: ${Number(investment.profit_earned || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
