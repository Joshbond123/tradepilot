
-- Update investment_plans table to support daily profit percentage
ALTER TABLE public.investment_plans 
ADD COLUMN daily_profit_percentage NUMERIC(5,2) DEFAULT 0.00;

-- Update existing plans to have daily profit (convert monthly to daily)
UPDATE public.investment_plans 
SET daily_profit_percentage = profit_percentage / 30 
WHERE daily_profit_percentage = 0.00;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_investment_plans_status ON public.investment_plans(status);
CREATE INDEX IF NOT EXISTS idx_user_investments_active ON public.user_investments(is_active, end_date);

-- Update the credit_daily_profits function to use daily_profit_percentage
CREATE OR REPLACE FUNCTION public.credit_daily_profits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  investment_record RECORD;
  daily_profit DECIMAL(20,8);
BEGIN
  -- Loop through all active investments
  FOR investment_record IN 
    SELECT ui.*, ip.daily_profit_percentage, ip.duration_days
    FROM public.user_investments ui
    JOIN public.investment_plans ip ON ui.plan_id = ip.id
    WHERE ui.is_active = true 
    AND ui.end_date > NOW()
  LOOP
    -- Calculate daily profit using daily_profit_percentage
    daily_profit := investment_record.amount * investment_record.daily_profit_percentage / 100;
    
    -- Credit profit to user balance
    UPDATE public.profiles 
    SET balance = balance + daily_profit
    WHERE id = investment_record.user_id;
    
    -- Update investment profit earned
    UPDATE public.user_investments
    SET profit_earned = profit_earned + daily_profit
    WHERE id = investment_record.id;
  END LOOP;
END;
$function$
