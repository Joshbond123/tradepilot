
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle, Star, TrendingUp, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const PlansPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: plans } = useQuery({
    queryKey: ['investment-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active')
        .order('min_amount');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userInvestments } = useQuery({
    queryKey: ['user-investments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_plans (name)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const activatePlanMutation = useMutation({
    mutationFn: async (plan: any) => {
      const userBalance = profile?.balance ? Number(profile.balance) : 0;
      const planMaxAmount = Number(plan.max_amount);
      
      if (userBalance < Number(plan.min_amount)) {
        throw new Error(`Insufficient balance. Minimum deposit required: $${plan.min_amount}, Maximum: $${plan.max_amount}`);
      }
      
      const investmentAmount = Math.min(userBalance, planMaxAmount);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      const { error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user!.id,
          plan_id: plan.id,
          amount: investmentAmount,
          end_date: endDate.toISOString(),
        });

      if (investmentError) throw investmentError;

      // Deduct amount from user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: userBalance - investmentAmount })
        .eq('id', user!.id);

      if (balanceError) throw balanceError;

      return { investmentAmount, planName: plan.name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-investments'] });
      toast({
        title: "Plan Activated Successfully!",
        description: `Successfully activated ${data.planName} with $${data.investmentAmount}`,
      });
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Alpha')) return '🤖';
    if (planName.includes('Neural')) return '🧠';
    if (planName.includes('Quantum')) return '⚡';
    if (planName.includes('Titan')) return '👑';
    return '🚀';
  };

  const canActivatePlan = (plan: any) => {
    const userBalance = profile?.balance ? Number(profile.balance) : 0;
    return userBalance >= Number(plan.min_amount);
  };

  const getBalanceStatus = (plan: any) => {
    const userBalance = profile?.balance ? Number(profile.balance) : 0;
    const minAmount = Number(plan.min_amount);
    const maxAmount = Number(plan.max_amount);
    
    if (userBalance < minAmount) {
      return {
        canActivate: false,
        message: `Insufficient balance. Min: $${minAmount.toLocaleString()}, Max: $${maxAmount.toLocaleString()}`
      };
    }
    
    return {
      canActivate: true,
      message: `Ready to activate with up to $${Math.min(userBalance, maxAmount).toLocaleString()}`
    };
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Investment Plans</h1>
        <p className="text-gray-400">Professional AI-powered trading strategies for automated profits</p>
      </div>

      {/* Available Balance */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-green-900/50 border-blue-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Available Balance</h2>
            <p className="text-3xl font-bold text-green-400">
              ${profile?.balance ? Number(profile.balance).toFixed(2) : '0.00'}
            </p>
          </div>
          <DollarSign className="h-12 w-12 text-green-400" />
        </div>
      </Card>

      {/* Investment Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans?.map((plan: any) => {
          const balanceStatus = getBalanceStatus(plan);
          return (
            <Card 
              key={plan.id} 
              className={`bg-gray-800/50 border-gray-700 p-6 cursor-pointer transition-all ${
                selectedPlan?.id === plan.id 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'hover:border-gray-600'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{getPlanIcon(plan.name)}</div>
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <Badge 
                  variant="secondary" 
                  className="bg-green-600/20 text-green-400 border-green-500/30"
                >
                  {plan.daily_profit_percentage || (plan.profit_percentage / 30).toFixed(2)}% Daily
                </Badge>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">
                    ${Number(plan.min_amount).toLocaleString()} - ${Number(plan.max_amount).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">{plan.duration_days} Days</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Auto Daily Profits</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

              {plan.exchange_logos && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Supported Exchanges:</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.exchange_logos.map((exchange: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <img 
                          src="/placeholder.svg" 
                          alt={exchange}
                          className="w-4 h-4 mr-1 object-contain"
                        />
                        <Badge variant="outline" className="text-xs">
                          {exchange}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                {balanceStatus.canActivate ? (
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {balanceStatus.message}
                  </div>
                ) : (
                  <div className="flex items-center text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {balanceStatus.message}
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  if (balanceStatus.canActivate) {
                    activatePlanMutation.mutate(plan);
                  }
                }}
                disabled={!balanceStatus.canActivate || activatePlanMutation.isPending}
                className={`w-full ${
                  balanceStatus.canActivate 
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                <Bot className="h-4 w-4 mr-2" />
                {activatePlanMutation.isPending ? 'Activating...' : 
                 balanceStatus.canActivate ? 'Activate Plan' : 'Insufficient Balance'}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Active Investments */}
      {userInvestments && userInvestments.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Active Investments</h2>
          <div className="space-y-3">
            {userInvestments.map((investment: any) => (
              <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-semibold text-white">{investment.investment_plans?.name}</p>
                  <p className="text-sm text-gray-400">
                    Invested: ${Number(investment.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Started: {new Date(investment.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">
                    Earned: ${Number(investment.profit_earned || 0).toFixed(2)}
                  </p>
                  <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
