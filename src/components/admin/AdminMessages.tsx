
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Send, Plus, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [newMessage, setNewMessage] = useState({ user_id: '', subject: '', content: '' });
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (email, full_name, username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users-for-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, username')
        .order('email');
      
      if (error) throw error;
      return data;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: messageData.user_id,
          subject: messageData.subject,
          content: messageData.content,
          type: 'admin'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({ title: "Message Sent", description: "Message has been sent successfully." });
      setNewMessage({ user_id: '', subject: '', content: '' });
      setShowNewMessageForm(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.user_id && newMessage.subject && newMessage.content) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Messages</h2>
        </div>
        <Button
          onClick={() => setShowNewMessageForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* New Message Form */}
      {showNewMessageForm && (
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Send New Message</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Select User</Label>
              <select
                value={newMessage.user_id}
                onChange={(e) => setNewMessage({ ...newMessage, user_id: e.target.value })}
                className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2 mt-2"
              >
                <option value="">Select a user...</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username || 'Unnamed'} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Subject</Label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                className="bg-gray-700/50 border-gray-600 text-white mt-2"
                placeholder="Message subject"
              />
            </div>
            <div>
              <Label className="text-gray-300">Content</Label>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                className="bg-gray-700/50 border-gray-600 text-white mt-2"
                placeholder="Message content"
                rows={4}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.user_id || !newMessage.subject || !newMessage.content}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewMessageForm(false);
                  setNewMessage({ user_id: '', subject: '', content: '' });
                }}
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Messages List */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading messages...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Subject</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages?.map((message: any) => (
                  <TableRow key={message.id} className="border-gray-700">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-white">
                          {message.profiles?.full_name || message.profiles?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-400">{message.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-white font-semibold">{message.subject}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        message.type === 'admin' ? 'bg-blue-600/20 text-blue-400' : 
                        message.type === 'system' ? 'bg-green-600/20 text-green-400' : 
                        'bg-gray-600/20 text-gray-400'
                      }>
                        {message.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={message.is_read ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}>
                        {message.is_read ? 'Read' : 'Unread'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(message.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMessage(message)}
                        className="border-gray-600 text-gray-400 hover:text-white"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Message Details</h3>
              <Button
                variant="ghost"
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-300"><strong>From:</strong> {selectedMessage.profiles?.full_name || selectedMessage.profiles?.username} ({selectedMessage.profiles?.email})</p>
                <p className="text-gray-300"><strong>Subject:</strong> {selectedMessage.subject}</p>
                <p className="text-gray-300"><strong>Type:</strong> {selectedMessage.type}</p>
                <p className="text-gray-300"><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-gray-300"><strong>Content:</strong></p>
                <p className="text-white mt-2 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
