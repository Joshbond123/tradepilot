
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
  Target,
  Clock,
  RotateCcw
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
    const interval = setInterval(fetchCryptoPrices, 30000);
    
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

  const getNextProfitTime = () => {
    const now = new Date();
    const nextProfit = new Date(now);
    nextProfit.setDate(nextProfit.getDate() + 1);
    nextProfit.setHours(0, 0, 0, 0);
    
    const diff = nextProfit.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getElapsedDays = (startDate: string, totalDays: number) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const elapsed = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.min(elapsed, totalDays);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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

        {/* Active AI Trading Plans and Live Crypto Prices */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Active AI Trading Plans</h3>
            
            {investments && investments.length > 0 ? (
              <div className="space-y-6">
                {investments.map((investment: any) => {
                  const elapsedDays = getElapsedDays(investment.start_date, investment.investment_plans?.duration_days || 30);
                  const totalDays = investment.investment_plans?.duration_days || 30;
                  
                  return (
                    <div key={investment.id} className="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/20">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-white font-bold text-lg">
                              🪪 {investment.investment_plans?.name} ({formatCurrency(Number(investment.amount))} Plan)
                            </h4>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-green-600/20 text-green-400 animate-pulse">
                              ● Active Trading
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-gray-400">📅 Start Date:</span>
                            <span className="text-white font-semibold">
                              Started on: {new Date(investment.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-gray-400">⏳ Plan Duration:</span>
                            <span className="text-white font-semibold">{totalDays} Days</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-gray-400">💰 Daily ROI:</span>
                            <span className="text-green-400 font-bold">
                              {investment.investment_plans?.daily_profit_percentage}% Daily
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RotateCcw className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-gray-400">🔄 Profit Cycle:</span>
                            <span className="text-white font-semibold">Every 24 hours</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-gray-400">📈 Total Earned So Far:</span>
                            <span className="text-purple-400 font-bold">
                              {formatCurrency(Number(investment.profit_earned))}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-orange-400" />
                            <span className="text-sm text-gray-400">💸 Next Profit Time:</span>
                            <span className="text-orange-400 font-semibold">
                              In {getNextProfitTime()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-gray-400">📆 Days Remaining:</span>
                            <span className="text-blue-400 font-bold">
                              {elapsedDays} of {totalDays} Days
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{Math.round(getProgress(investment))}%</span>
                        </div>
                        <Progress value={getProgress(investment)} className="h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ArrowUpDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active investments</p>
                <p className="text-sm">Start your first AI trading plan to see your investments here</p>
              </div>
            )}
          </Card>

          {/* Live Crypto Prices */}
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
