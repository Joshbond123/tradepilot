
-- Add username column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text;

-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  referral_code_generated TEXT;
BEGIN
  -- Generate unique referral code
  referral_code_generated := UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
  
  -- Insert new profile
  INSERT INTO public.profiles (id, email, referral_code, username)
  VALUES (
    NEW.id,
    NEW.email,
    referral_code_generated,
    NEW.raw_user_meta_data ->> 'username'
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
$function$
