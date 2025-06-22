
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Send, MessageSquare, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const SupportPage = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { data: tickets, refetch } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const submitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user!.id,
          subject: subject.trim(),
          message: message.trim(),
        });

      if (error) throw error;

      toast({
        title: "Ticket Submitted",
        description: "Your support ticket has been submitted successfully. We'll get back to you soon!",
      });

      setSubject('');
      setMessage('');
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-600/20 text-yellow-400';
      case 'replied': return 'bg-blue-600/20 text-blue-400';
      case 'closed': return 'bg-gray-600/20 text-gray-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return '🟡';
      case 'replied': return '🔵';
      case 'closed': return '⚫';
      default: return '⚪';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
        <p className="text-gray-400">Need help? Submit a support ticket and our team will assist you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Submit New Ticket */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <HelpCircle className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Submit New Ticket</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-gray-300">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="bg-gray-700/50 border-gray-600 text-white"
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-300">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={6}
                className="bg-gray-700/50 border-gray-600 text-white resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400">
                {message.length}/1000 characters
              </p>
            </div>
            
            <Button
              onClick={submitTicket}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Ticket
            </Button>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-4">
              <h3 className="font-semibold text-white mb-2">How do AI trading plans work?</h3>
              <p className="text-gray-400 text-sm">
                Our AI algorithms scan multiple cryptocurrency exchanges to identify arbitrage opportunities. When you invest in a plan, your funds are used to execute these trades automatically.
              </p>
            </div>
            
            <div className="border-b border-gray-700 pb-4">
              <h3 className="font-semibold text-white mb-2">When will I receive my profits?</h3>
              <p className="text-gray-400 text-sm">
                Profits are distributed daily and automatically added to your account balance. You can track your earnings in real-time through your dashboard.
              </p>
            </div>
            
            <div className="border-b border-gray-700 pb-4">
              <h3 className="font-semibold text-white mb-2">How long do withdrawals take?</h3>
              <p className="text-gray-400 text-sm">
                Withdrawal requests are processed within 24-48 hours after admin approval. The time may vary depending on network congestion.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">Is my investment safe?</h3>
              <p className="text-gray-400 text-sm">
                We use bank-level security measures including multi-signature wallets and cold storage for fund protection. All trades are executed on regulated exchanges.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Support Tickets History */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Your Support Tickets</h2>
        
        <div className="space-y-4">
          {tickets && tickets.length > 0 ? (
            tickets.map((ticket: any) => (
              <div key={ticket.id} className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getStatusIcon(ticket.status)}</span>
                      <h3 className="font-semibold text-white">{ticket.subject}</h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      Ticket #{ticket.id.slice(0, 8)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-300 text-sm">{ticket.message}</p>
                </div>
                
                {ticket.admin_reply && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-semibold">Admin Reply</span>
                    </div>
                    <p className="text-blue-300 text-sm">{ticket.admin_reply}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No support tickets yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
