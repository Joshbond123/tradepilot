
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe, Save, Shield, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminRecaptchaSettings = () => {
  const [settings, setSettings] = useState<any>({
    site_key: '',
    secret_key: '',
    is_enabled: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recaptchaSettings } = useQuery({
    queryKey: ['admin-recaptcha-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recaptcha_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.log('No reCAPTCHA settings found, using defaults');
        return {
          site_key: '',
          secret_key: '',
          is_enabled: false
        };
      }
      
      return data || {
        site_key: '',
        secret_key: '',
        is_enabled: false
      };
    },
  });

  useEffect(() => {
    if (recaptchaSettings) {
      setSettings(recaptchaSettings);
    }
  }, [recaptchaSettings]);

  const updateRecaptchaMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('recaptcha_settings')
        .select('id')
        .limit(1)
        .single();

      if (existingSettings) {
        // Update existing
        const { error } = await supabase
          .from('recaptcha_settings')
          .update({
            site_key: newSettings.site_key,
            secret_key: newSettings.secret_key,
            is_enabled: newSettings.is_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('recaptcha_settings')
          .insert({
            site_key: newSettings.site_key,
            secret_key: newSettings.secret_key,
            is_enabled: newSettings.is_enabled
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recaptcha-settings'] });
      queryClient.invalidateQueries({ queryKey: ['recaptcha-settings'] });
      toast({ 
        title: "reCAPTCHA Settings Updated", 
        description: "reCAPTCHA settings have been updated successfully. Changes will take effect immediately."
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveSettings = () => {
    if (settings.is_enabled && (!settings.site_key || !settings.secret_key)) {
      toast({
        title: "Validation Error",
        description: "Both Site Key and Secret Key are required when enabling reCAPTCHA.",
        variant: "destructive"
      });
      return;
    }
    updateRecaptchaMutation.mutate(settings);
  };

  const handleToggleEnabled = (checked: boolean) => {
    setSettings({...settings, is_enabled: checked});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Globe className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">reCAPTCHA Settings</h2>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-400" />
              <div>
                <Label className="text-blue-400 font-semibold">Enable reCAPTCHA v2</Label>
                <p className="text-sm text-gray-400">Protect your login and registration forms from bots</p>
              </div>
            </div>
            <Switch
              checked={settings.is_enabled || false}
              onCheckedChange={handleToggleEnabled}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300">Site Key</Label>
              <Input
                value={settings.site_key || ''}
                onChange={(e) => setSettings({...settings, site_key: e.target.value})}
                placeholder="Enter your reCAPTCHA site key"
                className="bg-gray-700/50 border-gray-600 text-white mt-2"
                disabled={!settings.is_enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                This key is used in the HTML code on your site (public key)
              </p>
            </div>
            
            <div>
              <Label className="text-gray-300">Secret Key</Label>
              <Input
                type="password"
                value={settings.secret_key || ''}
                onChange={(e) => setSettings({...settings, secret_key: e.target.value})}
                placeholder="Enter your reCAPTCHA secret key"
                className="bg-gray-700/50 border-gray-600 text-white mt-2"
                disabled={!settings.is_enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                This key is used for server-side validation (private key)
              </p>
            </div>
          </div>

          {settings.is_enabled && (
            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <h4 className="text-green-400 font-semibold">reCAPTCHA is Active</h4>
              </div>
              <p className="text-gray-300 text-sm">
                reCAPTCHA v2 will appear on the Login and Registration pages. 
                Users will need to complete the "I'm not a robot" challenge to proceed.
              </p>
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <h4 className="text-blue-400 font-semibold">How to get reCAPTCHA keys:</h4>
            </div>
            <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://www.google.com/recaptcha" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google reCAPTCHA Console</a></li>
              <li>Click "v3 Admin Console" or register a new site</li>
              <li>Add your domain (e.g., yourdomain.com)</li>
              <li>Select reCAPTCHA v2 "I'm not a robot" Checkbox</li>
              <li>Copy the Site Key and Secret Key</li>
              <li>Paste them in the fields above and enable reCAPTCHA</li>
            </ol>
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={updateRecaptchaMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateRecaptchaMutation.isPending ? 'Saving...' : 'Save reCAPTCHA Settings'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
