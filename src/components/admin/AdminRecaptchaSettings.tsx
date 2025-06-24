
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Save, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminRecaptchaSettings = () => {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [settings, setSettings] = useState({
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
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          site_key: data.site_key || '',
          secret_key: data.secret_key || '',
          is_enabled: data.is_enabled
        });
      }
      
      return data;
    },
  });

  const updateRecaptchaMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      // First, try to update existing record
      const { data: existing } = await supabase
        .from('recaptcha_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('recaptcha_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recaptcha_settings')
          .insert({
            ...newSettings,
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }

      // Also update system settings for global access
      const { error: systemError } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'recaptcha_enabled',
          setting_value: newSettings.is_enabled,
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (systemError) throw systemError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recaptcha-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
      toast({
        title: "reCAPTCHA Settings Updated",
        description: "reCAPTCHA settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateRecaptchaMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">reCAPTCHA Settings</h2>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Switch
              checked={settings.is_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, is_enabled: checked })}
            />
            <Label className="text-gray-300 text-lg">Enable reCAPTCHA</Label>
          </div>

          {settings.is_enabled && (
            <div className="space-y-4 border-t border-gray-700 pt-6">
              <div>
                <Label className="text-gray-300">Site Key (Public)</Label>
                <Input
                  value={settings.site_key}
                  onChange={(e) => setSettings({ ...settings, site_key: e.target.value })}
                  placeholder="Enter your reCAPTCHA site key"
                  className="bg-gray-700/50 border-gray-600 text-white mt-2"
                />
                <p className="text-gray-500 text-sm mt-1">
                  This key is visible to users and used in the frontend
                </p>
              </div>

              <div>
                <Label className="text-gray-300">Secret Key (Private)</Label>
                <div className="relative mt-2">
                  <Input
                    type={showSecretKey ? "text" : "password"}
                    value={settings.secret_key}
                    onChange={(e) => setSettings({ ...settings, secret_key: e.target.value })}
                    placeholder="Enter your reCAPTCHA secret key"
                    className="bg-gray-700/50 border-gray-600 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  This key is kept secret and used for server-side verification
                </p>
              </div>

              <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">How to get reCAPTCHA keys:</h4>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. Go to <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google reCAPTCHA Admin Console</a></li>
                  <li>2. Click "Create" to add a new site</li>
                  <li>3. Choose "reCAPTCHA v2" → "I'm not a robot" Checkbox</li>
                  <li>4. Add your domain(s)</li>
                  <li>5. Copy the Site Key and Secret Key here</li>
                </ol>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-700">
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
              disabled={settings.is_enabled && (!settings.site_key || !settings.secret_key)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">reCAPTCHA Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`text-lg font-bold ${settings.is_enabled ? 'text-green-400' : 'text-red-400'}`}>
              {settings.is_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Site Key</p>
            <p className="text-lg font-bold text-white">
              {settings.site_key ? 'Configured' : 'Not Set'}
            </p>
          </div>
          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Secret Key</p>
            <p className="text-lg font-bold text-white">
              {settings.secret_key ? 'Configured' : 'Not Set'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
