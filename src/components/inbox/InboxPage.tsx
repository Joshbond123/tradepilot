import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MailOpen, Trash2, Star, Archive } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

export const InboxPage = () => {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { refetchMessages } = useNotifications();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { data: messages, refetch } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      refetch();
      refetchMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      toast({
        title: "Message Deleted",
        description: "Message has been deleted successfully",
      });
      
      setSelectedMessage(null);
      refetch();
      refetchMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-600/20 text-blue-400';
      case 'admin': return 'bg-purple-600/20 text-purple-400';
      case 'support': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return '🤖';
      case 'admin': return '👨‍💼';
      case 'support': return '🎧';
      default: return '📧';
    }
  };

  const unreadCount = messages?.filter(m => !m.is_read).length || 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inbox</h1>
          <p className="text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
          {messages?.length || 0} Total Messages
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="md:col-span-1 space-y-3">
          <Card className="bg-gray-800/50 border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Messages</h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages && messages.length > 0 ? (
                messages.map((message: any) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.is_read) {
                        markAsRead(message.id);
                      }
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedMessage?.id === message.id
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-gray-700/30 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMessageTypeIcon(message.type)}</span>
                        {!message.is_read && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <Badge className={getMessageTypeColor(message.type)}>
                        {message.type}
                      </Badge>
                    </div>
                    
                    <h3 className={`font-semibold text-sm mb-1 ${
                      message.is_read ? 'text-gray-300' : 'text-white'
                    }`}>
                      {message.subject}
                    </h3>
                    
                    <p className="text-xs text-gray-400 truncate">
                      {message.content.substring(0, 60)}...
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Message Content */}
        <div className="md:col-span-2">
          {selectedMessage ? (
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getMessageTypeIcon(selectedMessage.type)}</span>
                    <Badge className={getMessageTypeColor(selectedMessage.type)}>
                      {selectedMessage.type}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {selectedMessage.subject}
                  </h1>
                  <p className="text-gray-400">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => markAsRead(selectedMessage.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:text-white"
                    disabled={selectedMessage.is_read}
                  >
                    {selectedMessage.is_read ? (
                      <MailOpen className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>
              
              {selectedMessage.type === 'system' && (
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 font-semibold">System Message</span>
                  </div>
                  <p className="text-sm text-blue-300 mt-1">
                    This is an automated message from the TradePilot AI system.
                  </p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <div className="text-center py-12">
                <Mail className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-400 mb-2">
                  Select a Message
                </h2>
                <p className="text-gray-500">
                  Choose a message from your inbox to read its content
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
