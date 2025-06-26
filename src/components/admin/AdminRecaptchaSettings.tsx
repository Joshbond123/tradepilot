
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe, Save, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminRecaptchaSettings = () => {
  const [settings, setSettings] = useState<any>({});
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
        setSettings(data);
        return data;
      }
      
      // Create default settings if none exist
      const defaultSettings = {
        site_key: '',
        secret_key: '',
        is_enabled: false
      };
      setSettings(defaultSettings);
      return defaultSettings;
    },
  });

  const updateRecaptchaMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const { error } = await supabase
        .from('recaptcha_settings')
        .upsert({
          ...newSettings,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recaptcha-settings'] });
      toast({ title: "reCAPTCHA Settings Updated", description: "reCAPTCHA settings have been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveSettings = () => {
    updateRecaptchaMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Globe className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">reCAPTCHA Settings</h2>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Switch
              checked={settings.is_enabled || false}
              onCheckedChange={(checked) => setSettings({...settings, is_enabled: checked})}
            />
            <Label className="text-gray-300">Enable reCAPTCHA v2</Label>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300">Site Key</Label>
              <Input
                value={settings.site_key || ''}
                onChange={(e) => setSettings({...settings, site_key: e.target.value})}
                placeholder="Enter your reCAPTCHA site key"
                className="bg-gray-700/50 border-gray-600 text-white mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                This key is used in the HTML code on your site
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
              />
              <p className="text-xs text-gray-500 mt-1">
                This key is used for server-side validation
              </p>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <h4 className="text-blue-400 font-semibold">How to get reCAPTCHA keys:</h4>
            </div>
            <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://www.google.com/recaptcha" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google reCAPTCHA</a></li>
              <li>Click "v3 Admin Console" or register a new site</li>
              <li>Add your domain (e.g., yourdomain.com)</li>
              <li>Select reCAPTCHA v2 "I'm not a robot" Checkbox</li>
              <li>Copy the Site Key and Secret Key</li>
            </ol>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              <strong>Note:</strong> When reCAPTCHA is enabled, it will appear on the Login and Register pages. 
              Make sure to test the functionality after saving these settings.
            </p>
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
