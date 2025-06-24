
-- Create comprehensive database schema for the entire website

-- Create additional enums
CREATE TYPE public.message_status AS ENUM ('unread', 'read');
CREATE TYPE public.admin_message_type AS ENUM ('registration', 'withdrawal', 'deposit', 'general');

-- Create admin settings table
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin messages templates table
CREATE TABLE public.admin_message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_type public.admin_message_type NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create exchange logos table
CREATE TABLE public.exchange_logos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update investment_plans to reference exchange logos
ALTER TABLE public.investment_plans 
DROP COLUMN IF EXISTS exchange_logos;

-- Create junction table for investment plans and exchange logos
CREATE TABLE public.plan_exchange_logos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.investment_plans(id) ON DELETE CASCADE,
    exchange_logo_id UUID NOT NULL REFERENCES public.exchange_logos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(plan_id, exchange_logo_id)
);

-- Update support tickets to include priority
ALTER TABLE public.support_tickets 
ADD COLUMN priority TEXT DEFAULT 'normal',
ADD COLUMN assigned_admin_id UUID,
ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;

-- Create admin activity logs
CREATE TABLE public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user notifications table
CREATE TABLE public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recaptcha settings table
CREATE TABLE public.recaptcha_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_key TEXT,
    secret_key TEXT,
    is_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add minimum withdrawal amount to system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('min_withdrawal_amount', '10.0', 'Minimum withdrawal amount in USD'),
('deposit_confirmation_required', 'false', 'Whether users need to confirm deposit amounts'),
('recaptcha_enabled', 'false', 'Whether reCAPTCHA is enabled for login/registration')
ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value,
updated_at = now();

-- Insert default admin message templates
INSERT INTO public.admin_message_templates (message_type, subject, content) VALUES
('registration', 'Welcome to TradePilot AI!', 'Welcome to TradePilot AI! Your account has been successfully created. Start exploring our AI-powered arbitrage trading opportunities and begin your journey to automated crypto profits.'),
('withdrawal', 'Withdrawal Request Received', 'Your withdrawal request has been received and is being processed. You will be notified once it has been approved and processed.'),
('deposit', 'Deposit Confirmation', 'Your deposit has been confirmed and your balance has been updated. Thank you for using TradePilot AI!'),
('general', 'TradePilot AI Notification', 'This is a general notification from TradePilot AI.')
ON CONFLICT DO NOTHING;

-- Insert exchange logos
INSERT INTO public.exchange_logos (name, logo_url) VALUES
('Binance', 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'),
('Coinbase', 'https://cryptologos.cc/logos/coinbase-coin-logo.png'),
('Kraken', 'https://cryptologos.cc/logos/kraken-krn-logo.png'),
('Huobi', 'https://cryptologos.cc/logos/huobi-token-ht-logo.png'),
('OKX', 'https://cryptologos.cc/logos/okb-okb-logo.png'),
('KuCoin', 'https://cryptologos.cc/logos/kucoin-shares-kcs-logo.png'),
('Bitfinex', 'https://cryptologos.cc/logos/bitfinex-leo-logo.png'),
('Gate.io', 'https://cryptologos.cc/logos/gate-io-gt-logo.png'),
('Bybit', 'https://cryptologos.cc/logos/bybit-bit-logo.png'),
('Bitstamp', 'https://cryptologos.cc/logos/bitstamp-bstp-logo.png')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('default_admin_password', '"admin123"', 'Default admin password (will be hidden after first change)'),
('password_changed', 'false', 'Whether the default password has been changed'),
('platform_commission', '0.05', 'Platform commission percentage'),
('auto_approve_deposits', 'false', 'Whether to auto-approve deposits'),
('auto_approve_withdrawals', 'false', 'Whether to auto-approve withdrawals'),
('maintenance_mode', 'false', 'Whether the platform is in maintenance mode')
ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value,
updated_at = now();

-- Create function to send notifications to users
CREATE OR REPLACE FUNCTION public.send_user_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.user_notifications (user_id, title, message, type)
    VALUES (p_user_id, p_title, p_message, p_type)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Create function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity(
    p_admin_username TEXT,
    p_action TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.admin_activity_logs (admin_username, action, target_type, target_id, details, ip_address)
    VALUES (p_admin_username, p_action, p_target_type, p_target_id, p_details, p_ip_address)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Update the handle_new_user function to use admin message templates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_code_generated TEXT;
  welcome_template RECORD;
BEGIN
  -- Generate unique referral code
  referral_code_generated := UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
  
  -- Insert new profile
  INSERT INTO public.profiles (id, email, referral_code, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    referral_code_generated,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Get welcome message template
  SELECT subject, content INTO welcome_template
  FROM public.admin_message_templates
  WHERE message_type = 'registration' AND is_active = true
  LIMIT 1;
  
  -- Send welcome message using template or default
  INSERT INTO public.messages (user_id, type, subject, content)
  VALUES (
    NEW.id,
    'system',
    COALESCE(welcome_template.subject, 'Welcome to TradePilot AI!'),
    COALESCE(welcome_template.content, 'Welcome to TradePilot AI! Your account has been successfully created.')
  );
  
  -- Send welcome notification
  PERFORM public.send_user_notification(
    NEW.id,
    'Welcome to TradePilot AI!',
    'Your account has been successfully created. Start exploring our platform!',
    'success'
  );
  
  RETURN NEW;
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_exchange_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recaptcha_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for exchange logos
CREATE POLICY "Anyone can view active exchange logos" ON public.exchange_logos FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view plan exchange logos" ON public.plan_exchange_logos FOR SELECT USING (true);

-- Public read access for admin settings (limited)
CREATE POLICY "Anyone can view certain admin settings" ON public.admin_settings FOR SELECT USING (
  setting_key IN ('platform_name', 'maintenance_mode', 'recaptcha_enabled')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
