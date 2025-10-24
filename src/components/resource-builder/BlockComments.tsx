import React, { useState } from 'react';
import { MessageSquare, Send, Check, X, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BlockComment {
  id: string;
  resource_id: string;
  block_id: string;
  user_id: string;
  organization_id: string;
  comment_text: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

interface BlockCommentsProps {
  resourceId: string;
  blockId: string;
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BlockComments({ resourceId, blockId, organizationId, isOpen, onClose }: BlockCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch comments for this block
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['block-comments', resourceId, blockId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('block_comments')
        .select(`
          *,
          user:user_id(email, full_name:raw_user_meta_data->full_name)
        `)
        .eq('resource_id', resourceId)
        .eq('block_id', blockId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as BlockComment[];
    },
    enabled: isOpen
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('block_comments')
        .insert({
          resource_id: resourceId,
          block_id: blockId,
          user_id: user.id,
          organization_id: organizationId,
          comment_text: commentText
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block-comments', resourceId, blockId] });
      setNewComment('');
      toast({ title: 'Commentaire ajouté' });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter le commentaire', variant: 'destructive' });
    }
  });

  // Resolve comment mutation
  const resolveCommentMutation = useMutation({
    mutationFn: async ({ commentId, resolved }: { commentId: string; resolved: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData: any = { resolved };
      if (resolved) {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user.id;
      } else {
        updateData.resolved_at = null;
        updateData.resolved_by = null;
      }

      const { error } = await supabase
        .from('block_comments')
        .update(updateData)
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block-comments', resourceId, blockId] });
      toast({ title: 'Commentaire mis à jour' });
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('block_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block-comments', resourceId, blockId] });
      toast({ title: 'Commentaire supprimé' });
    }
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await addCommentMutation.mutateAsync(newComment.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const unresolvedCount = comments.filter(c => !c.resolved).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 w-80 bg-white border-2 border-primary rounded-lg shadow-xl z-50 max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">
            Commentaires ({unresolvedCount})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="text-center text-sm text-gray-500 py-4">Chargement...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Aucun commentaire
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                'p-3 rounded-lg border',
                comment.resolved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              )}
            >
              {/* Comment header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">
                      {comment.user?.full_name || comment.user?.email || 'Utilisateur'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(comment.created_at), 'Pp', { locale: fr })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </button>
              </div>

              {/* Comment text */}
              <p className="text-sm text-gray-700 mb-2">{comment.comment_text}</p>

              {/* Resolve button */}
              <button
                onClick={() => resolveCommentMutation.mutate({
                  commentId: comment.id,
                  resolved: !comment.resolved
                })}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                  comment.resolved
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Check className="w-3 h-3" />
                {comment.resolved ? 'Résolu' : 'Marquer comme résolu'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <div className="p-3 border-t bg-gray-50">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="min-h-[60px] mb-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) {
              handleSubmit();
            }
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim() || isSubmitting}
          size="sm"
          className="w-full"
        >
          <Send className="w-3 h-3 mr-2" />
          Envoyer
        </Button>
        <div className="text-xs text-gray-400 text-center mt-1">
          Cmd+Entrée pour envoyer
        </div>
      </div>
    </div>
  );
}

export default BlockComments;
