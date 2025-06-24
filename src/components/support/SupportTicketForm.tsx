
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const SupportTicketForm = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: ticketData.subject,
          message: ticketData.message,
          priority: ticketData.priority,
          status: 'open'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
      toast({
        title: "Ticket Submitted",
        description: "Your support ticket has been submitted successfully. We'll get back to you soon.",
      });
      setFormData({ subject: '', message: '', priority: 'normal' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject && formData.message) {
      createTicketMutation.mutate(formData);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Submit Support Ticket</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-gray-300">Subject</Label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief description of your issue"
            className="bg-gray-700/50 border-gray-600 text-white mt-2"
            required
          />
        </div>
        
        <div>
          <Label className="text-gray-300">Priority</Label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 mt-2"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        <div>
          <Label className="text-gray-300">Message</Label>
          <Textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Please describe your issue in detail..."
            className="bg-gray-700/50 border-gray-600 text-white mt-2 min-h-[120px]"
            rows={6}
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={!formData.subject || !formData.message || createTicketMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {createTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </form>
    </Card>
  );
};
