
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ArrowUpDown,
  Eye,
  EyeOff,
  Calendar,
  Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
  price_change_percentage_24h: number;
}

export const DashboardHome = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: investments } = useQuery({
    queryKey: ['user-investments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_plans(name, daily_profit_percentage, duration_days)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin&order=market_cap_desc&per_page=3&page=1&sparkline=false&price_change_percentage=24h'
      );
      const data = await response.json();
      setCryptoPrices(data);
      setIsLoadingPrices(false);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      setIsLoadingPrices(false);
    }
  };

  useEffect(() => {
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const totalProfit = investments?.reduce((sum, inv) => sum + Number(inv.profit_earned), 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getProgress = (investment: any) => {
    const startDate = new Date(investment.start_date);
    const endDate = new Date(investment.end_date);
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(days, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header - Removed Invest button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {profile?.username || profile?.full_name || 'Trader'}!
            </h1>
            <p className="text-gray-400 mt-1">
              Track your AI trading performance and manage your investments
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Balance</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-green-400">
                    {showBalance ? formatCurrency(Number(profile?.balance || 0)) : '••••••'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-gray-400 hover:text-white"
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Invested</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Profit</p>
                <p className="text-2xl font-bold text-purple-400">
                  {formatCurrency(totalProfit)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Referral Earnings</p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(Number(profile?.referral_earnings || 0))}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-400" />
            </div>
          </Card>
        </div>

        {/* Active Investments and Live Crypto Prices */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Active AI Trading Plans</h3>
            
            {investments && investments.length > 0 ? (
              <div className="space-y-4">
                {investments.map((investment: any) => (
                  <div key={investment.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{investment.investment_plans?.name}</h4>
                        <p className="text-gray-400 text-sm">
                          Invested: {formatCurrency(Number(investment.amount))}
                        </p>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400">
                        {investment.investment_plans?.daily_profit_percentage}% Daily
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{Math.round(getProgress(investment))}%</span>
                      </div>
                      <Progress value={getProgress(investment)} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          Profit: {formatCurrency(Number(investment.profit_earned))}
                        </span>
                        <span className="text-sm text-blue-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {getRemainingDays(investment.end_date)} days left
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ArrowUpDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active investments</p>
                <p className="text-sm">Start your first AI trading plan to see your investments here</p>
              </div>
            )}
          </Card>

          {/* Live Crypto Prices - Replaced Available Plans section */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Live Crypto Prices</h3>
            
            {isLoadingPrices ? (
              <div className="text-center py-8 text-gray-400">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                <p>Loading prices...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cryptoPrices.map((crypto) => (
                  <div key={crypto.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                        <div>
                          <h4 className="text-white font-semibold">{crypto.name}</h4>
                          <p className="text-gray-400 text-sm">{crypto.symbol.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">
                          {formatCurrency(crypto.current_price)}
                        </p>
                        <Badge className={crypto.price_change_percentage_24h >= 0 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}>
                          {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={() => navigate('/arbitrage')}
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10"
                >
                  View All
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
