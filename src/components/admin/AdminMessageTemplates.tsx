
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const AdminMessageTemplates = () => {
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['admin-message-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_message_templates')
        .select('*')
        .order('message_type');
      
      if (error) throw error;
      return data;
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('admin_message_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-message-templates'] });
      toast({ title: "Template Updated", description: "Message template has been updated successfully." });
      setEditingTemplate(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const { error } = await supabase
        .from('admin_message_templates')
        .insert(templateData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-message-templates'] });
      toast({ title: "Template Created", description: "New message template has been created successfully." });
      setNewTemplate(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('admin_message_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-message-templates'] });
      toast({ title: "Template Deleted", description: "Message template has been deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveTemplate = (template: any) => {
    updateTemplateMutation.mutate({
      id: template.id,
      updates: {
        subject: template.subject,
        content: template.content,
        is_active: template.is_active
      }
    });
  };

  const handleCreateTemplate = () => {
    if (newTemplate && newTemplate.message_type && newTemplate.subject && newTemplate.content) {
      createTemplateMutation.mutate(newTemplate);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Type, Subject, Content).",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Message Templates</h2>
        </div>
        <Button
          onClick={() => setNewTemplate({ message_type: 'general', subject: '', content: '', is_active: true })}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 p-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading templates...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Subject</TableHead>
                  <TableHead className="text-gray-300 hidden md:table-cell">Content Preview</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newTemplate && (
                  <TableRow className="border-gray-700 bg-blue-500/10">
                    <TableCell>
                      <select
                        value={newTemplate.message_type}
                        onChange={(e) => setNewTemplate({ ...newTemplate, message_type: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white rounded px-2 py-1 w-full"
                      >
                        <option value="registration">Registration</option>
                        <option value="withdrawal">Withdrawal</option>
                        <option value="deposit">Deposit</option>
                        <option value="plan_activation">Plan Activation</option>
                        <option value="general">General</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Subject"
                      />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Textarea
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Message content"
                        rows={2}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-600/20 text-green-400">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={handleCreateTemplate}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setNewTemplate(null)}
                          className="border-gray-600 text-gray-400"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {templates?.map((template: any) => (
                  <TableRow key={template.id} className="border-gray-700">
                    <TableCell>
                      <Badge className="bg-blue-600/20 text-blue-400 capitalize">
                        {template.message_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingTemplate?.id === template.id ? (
                        <Input
                          value={editingTemplate.subject}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      ) : (
                        <p className="text-white font-semibold">{template.subject}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {editingTemplate?.id === template.id ? (
                        <Textarea
                          value={editingTemplate.content}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          rows={3}
                        />
                      ) : (
                        <p className="text-gray-400 text-sm truncate max-w-xs">
                          {template.content.substring(0, 100)}...
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={template.is_active ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingTemplate?.id === template.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveTemplate(editingTemplate)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTemplate(null)}
                              className="border-gray-600 text-gray-400"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTemplate({ ...template })}
                              className="border-gray-600 text-gray-400 hover:text-white"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="border-red-600 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
