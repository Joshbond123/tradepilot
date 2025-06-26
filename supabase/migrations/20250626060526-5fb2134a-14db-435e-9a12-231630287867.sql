
-- Create admin activity logs table if not exists
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin message templates table if not exists
CREATE TABLE IF NOT EXISTS public.admin_message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin settings table if not exists
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recaptcha settings table if not exists
CREATE TABLE IF NOT EXISTS public.recaptcha_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_key TEXT,
    secret_key TEXT,
    is_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin users table if not exists
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default admin user if not exists
INSERT INTO public.admin_users (username, password_hash)
SELECT 'admin', crypt('admin123', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.admin_users WHERE username = 'admin');

-- Insert default admin settings if not exists
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES 
    ('default_admin_password', '"admin123"', 'Default admin password')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default message templates if not exists
INSERT INTO public.admin_message_templates (message_type, subject, content)
VALUES 
    ('registration', 'Welcome to TradePilot AI!', 'Welcome to our platform! Your account has been successfully created.'),
    ('withdrawal', 'Withdrawal Request Processed', 'Your withdrawal request has been processed successfully.'),
    ('deposit', 'Deposit Confirmed', 'Your deposit has been confirmed and added to your balance.'),
    ('general', 'Important Notice', 'This is a general message from the admin team.')
ON CONFLICT DO NOTHING;

-- Create function to update user balance
CREATE OR REPLACE FUNCTION public.update_user_balance(
    p_user_id UUID,
    p_amount DECIMAL,
    p_operation TEXT -- 'add' or 'remove'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance DECIMAL;
BEGIN
    -- Get current balance
    SELECT balance INTO current_balance 
    FROM public.profiles 
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update balance based on operation
    IF p_operation = 'add' THEN
        UPDATE public.profiles 
        SET balance = balance + p_amount,
            updated_at = now()
        WHERE id = p_user_id;
    ELSIF p_operation = 'remove' THEN
        IF current_balance >= p_amount THEN
            UPDATE public.profiles 
            SET balance = balance - p_amount,
                updated_at = now()
            WHERE id = p_user_id;
        ELSE
            RETURN FALSE; -- Insufficient balance
        END IF;
    ELSE
        RETURN FALSE; -- Invalid operation
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Create function to approve/reject deposits
CREATE OR REPLACE FUNCTION public.process_deposit(
    p_deposit_id UUID,
    p_action TEXT, -- 'approve' or 'reject'
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deposit_record RECORD;
BEGIN
    -- Get deposit details
    SELECT * INTO deposit_record 
    FROM public.deposits 
    WHERE id = p_deposit_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF p_action = 'approve' THEN
        -- Update deposit status
        UPDATE public.deposits 
        SET status = 'confirmed',
            confirmed_at = now()
        WHERE id = p_deposit_id;
        
        -- Add amount to user balance
        UPDATE public.profiles 
        SET balance = balance + deposit_record.amount,
            updated_at = now()
        WHERE id = deposit_record.user_id;
        
    ELSIF p_action = 'reject' THEN
        -- Update deposit status
        UPDATE public.deposits 
        SET status = 'rejected'
        WHERE id = p_deposit_id;
        
    ELSE
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Create function to approve/reject withdrawals
CREATE OR REPLACE FUNCTION public.process_withdrawal(
    p_withdrawal_id UUID,
    p_action TEXT, -- 'approve' or 'reject'
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    withdrawal_record RECORD;
BEGIN
    -- Get withdrawal details
    SELECT * INTO withdrawal_record 
    FROM public.withdrawals 
    WHERE id = p_withdrawal_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF p_action = 'approve' THEN
        -- Update withdrawal status
        UPDATE public.withdrawals 
        SET status = 'approved',
            processed_at = now(),
            admin_notes = p_admin_notes
        WHERE id = p_withdrawal_id;
        
    ELSIF p_action = 'reject' THEN
        -- Update withdrawal status
        UPDATE public.withdrawals 
        SET status = 'rejected',
            admin_notes = p_admin_notes
        WHERE id = p_withdrawal_id;
        
        -- Return amount to user balance
        UPDATE public.profiles 
        SET balance = balance + withdrawal_record.amount,
            updated_at = now()
        WHERE id = withdrawal_record.user_id;
        
    ELSE
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;
