
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProfitGeneration = () => {
  const { toast } = useToast();

  const activatePlan = async (planId: string, amount: number, userId: string) => {
    try {
      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      // Create investment record
      const { data: investment, error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: userId,
          plan_id: planId,
          amount: amount,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
          profit_earned: 0
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      // Deduct amount from user balance
      const { error: balanceError } = await supabase
        .rpc('update_user_balance', {
          p_user_id: userId,
          p_amount: amount,
          p_operation: 'remove'
        });

      if (balanceError) throw balanceError;

      // Start profit generation immediately
      await generateDailyProfit(investment.id, amount, plan.daily_profit_percentage);

      toast({
        title: "Plan Activated Successfully!",
        description: `Your ${plan.name} plan has been activated. Profits will be credited daily.`,
      });

      return investment;
    } catch (error) {
      console.error('Error activating plan:', error);
      toast({
        title: "Activation Failed",
        description: "Failed to activate plan. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateDailyProfit = async (investmentId: string, amount: number, dailyProfitPercentage: number) => {
    try {
      const dailyProfit = (amount * dailyProfitPercentage) / 100;

      // Get investment details
      const { data: investment, error: investmentError } = await supabase
        .from('user_investments')
        .select('*, investment_plans(*)')
        .eq('id', investmentId)
        .single();

      if (investmentError) throw investmentError;

      // Update profit earned
      const { error: updateError } = await supabase
        .from('user_investments')
        .update({
          profit_earned: (Number(investment.profit_earned) + dailyProfit)
        })
        .eq('id', investmentId);

      if (updateError) throw updateError;

      // Credit profit to user balance
      const { error: balanceError } = await supabase
        .rpc('update_user_balance', {
          p_user_id: investment.user_id,
          p_amount: dailyProfit,
          p_operation: 'add'
        });

      if (balanceError) throw balanceError;

      // Send notification about profit credit
      await supabase.rpc('send_user_notification', {
        p_user_id: investment.user_id,
        p_title: 'Daily Profit Credited',
        p_message: `$${dailyProfit.toFixed(2)} profit has been credited to your account from ${investment.investment_plans.name}`,
        p_type: 'success'
      });

    } catch (error) {
      console.error('Error generating daily profit:', error);
    }
  };

  // Auto-generate profits for active investments
  useEffect(() => {
    const generateProfitsForActiveInvestments = async () => {
      try {
        const { data: investments, error } = await supabase
          .from('user_investments')
          .select('*, investment_plans(*)')
          .eq('is_active', true)
          .lt('end_date', new Date().toISOString());

        if (error) throw error;

        for (const investment of investments || []) {
          await generateDailyProfit(
            investment.id,
            Number(investment.amount),
            Number(investment.investment_plans.daily_profit_percentage)
          );
        }
      } catch (error) {
        console.error('Error generating profits:', error);
      }
    };

    // Generate profits immediately and then every 24 hours
    generateProfitsForActiveInvestments();
    const interval = setInterval(generateProfitsForActiveInvestments, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { activatePlan };
};
