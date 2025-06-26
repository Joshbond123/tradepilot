
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useNotifications = () => {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Check for new notifications every 5 seconds
  });

  const { data: unreadMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 3000, // Check for new messages every 3 seconds
  });

  const unreadCount = unreadMessages?.length || 0;

  // Show popup for new notifications
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latestNotification = notifications[0];
      if (!latestNotification.is_read) {
        toast({
          title: latestNotification.title,
          description: latestNotification.message,
          duration: 5000,
        });
        
        // Mark as read
        supabase
          .from('user_notifications')
          .update({ is_read: true })
          .eq('id', latestNotification.id)
          .then(() => refetchNotifications());
      }
    }
  }, [notifications, toast, refetchNotifications]);

  return {
    notifications,
    unreadMessages,
    unreadCount,
    refetchNotifications,
    refetchMessages
  };
};
