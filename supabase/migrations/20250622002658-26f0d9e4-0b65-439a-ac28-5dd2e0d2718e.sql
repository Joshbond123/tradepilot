
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.deposits CASCADE;
DROP TABLE IF EXISTS public.user_investments CASCADE;
DROP TABLE IF EXISTS public.referral_earnings CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.investment_plans CASCADE;
DROP TABLE IF EXISTS public.wallet_addresses CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS public.crypto_type CASCADE;
DROP TYPE IF EXISTS public.deposit_status CASCADE;
DROP TYPE IF EXISTS public.withdrawal_status CASCADE;
DROP TYPE IF EXISTS public.plan_status CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;
DROP TYPE IF EXISTS public.message_type CASCADE;

-- Create enums for status tracking
CREATE TYPE public.crypto_type AS ENUM ('BTC', 'ETH', 'USDT');
CREATE TYPE public.deposit_status AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.plan_status AS ENUM ('active', 'inactive');
CREATE TYPE public.ticket_status AS ENUM ('open', 'replied', 'closed');
CREATE TYPE public.message_type AS ENUM ('system', 'admin', 'support');

-- User profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    balance DECIMAL(20,8) DEFAULT 0.00000000,
    referral_code TEXT NOT NULL UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    referral_earnings DECIMAL(20,8) DEFAULT 0.00000000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Admin users table
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Investment plans table
CREATE TABLE public.investment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    min_amount DECIMAL(20,8) NOT NULL,
    max_amount DECIMAL(20,8) NOT NULL,
    profit_percentage DECIMAL(5,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    exchange_logos TEXT[],
    status public.plan_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User investments table
CREATE TABLE public.user_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.investment_plans(id),
    amount DECIMAL(20,8) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    profit_earned DECIMAL(20,8) DEFAULT 0.00000000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wallet addresses for deposits
CREATE TABLE public.wallet_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crypto_type public.crypto_type NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Deposits table
CREATE TABLE public.deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    crypto_type public.crypto_type NOT NULL,
    wallet_address TEXT NOT NULL,
    transaction_hash TEXT,
    status public.deposit_status DEFAULT 'pending',
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Withdrawals table
CREATE TABLE public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    crypto_type public.crypto_type NOT NULL,
    destination_address TEXT NOT NULL,
    status public.withdrawal_status DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Messages system
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.message_type NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Support tickets
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    admin_reply TEXT,
    status public.ticket_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referral earnings tracking
CREATE TABLE public.referral_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System settings
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data access
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own investments" ON public.user_investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own investments" ON public.user_investments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own referral earnings" ON public.referral_earnings FOR SELECT USING (auth.uid() = referrer_id);

-- Public read access for investment plans and wallet addresses
CREATE POLICY "Anyone can view active investment plans" ON public.investment_plans FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can view active wallet addresses" ON public.wallet_addresses FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view system settings" ON public.system_settings FOR SELECT USING (true);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_code_generated TEXT;
BEGIN
  -- Generate unique referral code
  referral_code_generated := UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
  
  -- Insert new profile
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    referral_code_generated
  );
  
  -- Send welcome message
  INSERT INTO public.messages (user_id, type, subject, content)
  VALUES (
    NEW.id,
    'system',
    'Welcome to TradePilot AI!',
    'Welcome to TradePilot AI! Your account has been successfully created. Start exploring our AI-powered arbitrage trading opportunities and begin your journey to automated crypto profits.'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to credit daily profits
CREATE OR REPLACE FUNCTION public.credit_daily_profits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  investment_record RECORD;
  daily_profit DECIMAL(20,8);
BEGIN
  -- Loop through all active investments
  FOR investment_record IN 
    SELECT ui.*, ip.profit_percentage, ip.duration_days
    FROM public.user_investments ui
    JOIN public.investment_plans ip ON ui.plan_id = ip.id
    WHERE ui.is_active = true 
    AND ui.end_date > NOW()
  LOOP
    -- Calculate daily profit
    daily_profit := (investment_record.amount * investment_record.profit_percentage / 100) / investment_record.duration_days;
    
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
$$;

-- Insert sample investment plans
INSERT INTO public.investment_plans (name, description, min_amount, max_amount, profit_percentage, duration_days, exchange_logos) VALUES
('Starter AI Plan', 'Perfect for beginners. AI analyzes top exchanges for optimal arbitrage opportunities.', 50.00000000, 999.99999999, 1.5, 30, ARRAY['binance', 'coinbase', 'kraken']),
('Professional AI Plan', 'Advanced AI strategies across multiple exchanges with higher returns.', 1000.00000000, 9999.99999999, 2.2, 45, ARRAY['binance', 'coinbase', 'kraken', 'huobi', 'okx']),
('Premium AI Plan', 'Institutional-grade AI with access to premium exchanges and DeFi protocols.', 10000.00000000, 99999.99999999, 3.1, 60, ARRAY['binance', 'coinbase', 'kraken', 'huobi', 'okx', 'ftx']),
('Elite AI Plan', 'Maximum returns with cutting-edge AI and exclusive exchange access.', 100000.00000000, 999999.99999999, 4.5, 90, ARRAY['binance', 'coinbase', 'kraken', 'huobi', 'okx', 'ftx', 'bitstamp']);

-- Insert sample wallet addresses
INSERT INTO public.wallet_addresses (crypto_type, address) VALUES
('BTC', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'),
('ETH', '0x742d35cc6634c0532925a3b8d2b6df09c8e16cf8'),
('USDT', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');

-- Insert sample system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('platform_name', '"TradePilot AI"', 'Platform display name'),
('min_withdrawal', '10.0', 'Minimum withdrawal amount'),
('referral_commission', '0.1', 'Referral commission percentage'),
('maintenance_mode', 'false', 'Platform maintenance status');
