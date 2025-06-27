
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
  RotateCcw,
  ArrowRight,
  Activity,
  Coins,
  Timer,
  Trophy,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
  price_change_percentage_24h: number;
}

interface ArbitrageOpportunity {
  crypto: CryptoPrice;
  buyFrom: { name: string; logo: string; price: number };
  sellTo: { name: string; logo: string; price: number };
  profitUSD: number;
}

export const DashboardHome = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isLoadingArbitrage, setIsLoadingArbitrage] = useState(true);

  const exchanges = [
    { name: 'Binance', logo: '/lovable-uploads/b7657bba-7cf8-4a24-a064-3f3a59193299.png' },
    { name: 'Coinbase', logo: '/lovable-uploads/e50e50af-d1d9-4edc-abb0-2ed5ddbc145f.png' },
    { name: 'Kraken', logo: '/lovable-uploads/587fa5d4-f7b9-4420-8311-0e79d177af0b.png' },
    { name: 'Huobi', logo: '/lovable-uploads/896ff303-edb2-4659-b66b-cd19fa70a6a7.png' },
    { name: 'OKX', logo: '/lovable-uploads/82036cc7-571a-47d0-ae10-687c051f3b34.png' }
  ];

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

  const fetchArbitrageData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin&order=market_cap_desc&per_page=3&page=1&sparkline=false'
      );
      const data = await response.json();
      
      const opportunities = data.map((crypto: CryptoPrice) => {
        const shuffledExchanges = [...exchanges].sort(() => Math.random() - 0.5);
        const buyExchange = shuffledExchanges[0];
        const sellExchange = shuffledExchanges[1];
        
        const buyPrice = crypto.current_price * (0.98 + Math.random() * 0.02);
        const sellPrice = crypto.current_price * (1.01 + Math.random() * 0.02);
        const profitUSD = sellPrice - buyPrice;
        
        return {
          crypto,
          buyFrom: { ...buyExchange, price: buyPrice },
          sellTo: { ...sellExchange, price: sellPrice },
          profitUSD
        };
      });
      
      setArbitrageOpportunities(opportunities);
      setIsLoadingArbitrage(false);
    } catch (error) {
      console.error('Error fetching arbitrage data:', error);
      setIsLoadingArbitrage(false);
    }
  };

  useEffect(() => {
    fetchArbitrageData();
    const interval = setInterval(fetchArbitrageData, 30000);
    
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

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(days, 0);
  };

  const getElapsedDays = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const isExpired = (endDate: string) => {
    return new Date() > new Date(endDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 pb-20 lg:pb-6">
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

        {/* Active AI Trading Plans and Arbitrage Opportunities */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active AI Trading Plans */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Active AI Trading Plans</h3>
                  <p className="text-sm text-gray-400">Monitor your live investments</p>
                </div>
              </div>
              {investments && investments.length > 0 && (
                <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  {investments.length} Active
                </Badge>
              )}
            </div>
            
            {investments && investments.length > 0 ? (
              <div className="space-y-4">
                {investments.map((investment: any) => {
                  const elapsedDays = getElapsedDays(investment.start_date);
                  const remainingDays = getRemainingDays(investment.end_date);
                  const totalDays = investment.investment_plans?.duration_days || 30;
                  const expired = isExpired(investment.end_date);
                  
                  return (
                    <div key={investment.id} className="relative group">
                      <div className="p-5 bg-gradient-to-br from-gray-700/40 to-gray-800/40 rounded-xl border border-gray-600/50 hover:border-blue-500/50 transition-all duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600/20 rounded-lg">
                              <Zap className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-lg">
                                {investment.investment_plans?.name}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {formatCurrency(Number(investment.amount))} Investment
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {expired ? (
                              <Badge className="bg-red-600/20 text-red-400 border-red-500/30">
                                Expired
                              </Badge>
                            ) : (
                              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                Live Trading
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <div>
                              <p className="text-xs text-gray-400">Daily ROI</p>
                              <p className="text-sm font-bold text-green-400">
                                {investment.investment_plans?.daily_profit_percentage}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg">
                            <Trophy className="h-4 w-4 text-purple-400" />
                            <div>
                              <p className="text-xs text-gray-400">Total Earned</p>
                              <p className="text-sm font-bold text-purple-400">
                                {formatCurrency(Number(investment.profit_earned || 0))}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg">
                            <Timer className="h-4 w-4 text-orange-400" />
                            <div>
                              <p className="text-xs text-gray-400">Next Profit</p>
                              <p className="text-sm font-bold text-orange-400">
                                {expired ? 'Ended' : `In ${getNextProfitTime()}`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-400">Days Left</p>
                              <p className="text-sm font-bold text-blue-400">
                                {expired ? '0' : remainingDays}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                              Progress: {elapsedDays} / {totalDays} days
                            </span>
                            <span className="text-sm font-medium text-white">
                              {Math.round(getProgress(investment))}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                              style={{width: `${getProgress(investment)}%`}}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Expected Return */}
                        <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Coins className="h-4 w-4 text-blue-400" />
                              <span className="text-sm text-gray-300">Expected Total Return</span>
                            </div>
                            <span className="text-sm font-bold text-blue-400">
                              {formatCurrency(Number(investment.amount) * (Number(investment.investment_plans?.daily_profit_percentage) / 100) * totalDays)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-700/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Activity className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">No Active Investments</h4>
                <p className="text-gray-400 mb-4">Start your first AI trading plan to see your investments here</p>
                <Button 
                  onClick={() => navigate('/plans')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Browse AI Plans
                </Button>
              </div>
            )}
          </Card>

          {/* Arbitrage Opportunities */}
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Arbitrage Opportunities</h3>
                  <p className="text-sm text-gray-400">Live profit opportunities</p>
                </div>
              </div>
            </div>
            
            {isLoadingArbitrage ? (
              <div className="text-center py-8 text-gray-400">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                <p>Loading opportunities...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {arbitrageOpportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-green-500/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img src={opportunity.crypto.image} alt={opportunity.crypto.name} className="w-8 h-8" />
                        <div>
                          <h4 className="text-white font-semibold">{opportunity.crypto.name}</h4>
                          <p className="text-gray-400 text-sm">{opportunity.crypto.symbol.toUpperCase()}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400">
                        +${opportunity.profitUSD.toFixed(4)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <img src={opportunity.buyFrom.logo} alt={opportunity.buyFrom.name} className="w-4 h-4" />
                        <span className="text-red-400">Buy: ${opportunity.buyFrom.price.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <img src={opportunity.sellTo.logo} alt={opportunity.sellTo.name} className="w-4 h-4" />
                        <span className="text-green-400">Sell: ${opportunity.sellTo.price.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  onClick={() => navigate('/arbitrage')}
                  variant="outline" 
                  className="w-full border-green-600 text-green-400 hover:bg-green-600/10 mt-4"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View All Opportunities
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
