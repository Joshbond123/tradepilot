
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle, Star, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const PlansPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

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

  const investInPlan = async () => {
    if (!selectedPlan || !investmentAmount) {
      toast({
        title: "Error",
        description: "Please select a plan and enter an investment amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(investmentAmount);
    const userBalance = profile?.balance ? Number(profile.balance) : 0;

    if (amount < selectedPlan.min_amount) {
      toast({
        title: "Amount Too Low",
        description: `Minimum investment for this plan is $${selectedPlan.min_amount}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > selectedPlan.max_amount) {
      toast({
        title: "Amount Too High",
        description: `Maximum investment for this plan is $${selectedPlan.max_amount}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this investment",
        variant: "destructive",
      });
      return;
    }

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.duration_days);

      const { error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user!.id,
          plan_id: selectedPlan.id,
          amount: amount,
          end_date: endDate.toISOString(),
        });

      if (investmentError) throw investmentError;

      // Deduct amount from user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: userBalance - amount })
        .eq('id', user!.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Investment Successful!",
        description: `Successfully invested $${amount} in ${selectedPlan.name}`,
      });

      setSelectedPlan(null);
      setInvestmentAmount('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Starter')) return '🌟';
    if (planName.includes('Professional')) return '💼';
    if (planName.includes('Premium')) return '💎';
    if (planName.includes('Elite')) return '👑';
    return '🚀';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Investment Plans</h1>
        <p className="text-gray-400">Choose from our AI-powered trading plans to start earning passive income</p>
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
        {plans?.map((plan: any) => (
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
                {plan.profit_percentage}% Monthly
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
                <span className="text-gray-300 text-sm">Daily Profits</span>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

            {plan.exchange_logos && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Supported Exchanges:</p>
                <div className="flex flex-wrap gap-1">
                  {plan.exchange_logos.map((exchange: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {exchange}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setSelectedPlan(plan)}
              variant={selectedPlan?.id === plan.id ? "default" : "outline"}
              className={`w-full ${
                selectedPlan?.id === plan.id 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'border-gray-600 text-gray-400 hover:text-white'
              }`}
            >
              {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
            </Button>
          </Card>
        ))}
      </div>

      {/* Investment Form */}
      {selectedPlan && (
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Invest in {selectedPlan.name}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Investment Amount (USD)</label>
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder={`Min: $${selectedPlan.min_amount}`}
                  className="bg-gray-700/50 border-gray-600 text-white"
                  min={selectedPlan.min_amount}
                  max={selectedPlan.max_amount}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Range: ${Number(selectedPlan.min_amount).toLocaleString()} - ${Number(selectedPlan.max_amount).toLocaleString()}
                </p>
              </div>
              
              <Button
                onClick={investInPlan}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Bot className="h-4 w-4 mr-2" />
                Start AI Trading
              </Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Investment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Return:</span>
                  <span className="text-green-400">{selectedPlan.profit_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{selectedPlan.duration_days} days</span>
                </div>
                {investmentAmount && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Profit:</span>
                      <span className="text-green-400">
                        ${((parseFloat(investmentAmount) * selectedPlan.profit_percentage / 100) / selectedPlan.duration_days).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Return:</span>
                      <span className="text-green-400">
                        ${(parseFloat(investmentAmount) * (1 + selectedPlan.profit_percentage / 100)).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

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
