import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Edit2, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  deliverable_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  is_mentor?: boolean;
}

interface DeliverableCommentsProps {
  deliverableId: string;
  organizationId: string | null; // Nullable for individual users
  itemType?: 'deliverable' | 'resource'; // Type of item being commented on
}

const DeliverableComments: React.FC<DeliverableCommentsProps> = ({
  deliverableId,
  organizationId,
  itemType = 'deliverable' // Default to 'deliverable' for backward compatibility
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 DeliverableComments mounted/updated:', { deliverableId, organizationId });
    
    if (!deliverableId) {
      console.log('⚠️ No deliverableId provided, skipping fetch');
      setLoading(false);
      return;
    }

    fetchComments();
    getCurrentUser();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`${itemType}_comments_${deliverableId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliverable_comments',
          filter: `deliverable_id=eq.${deliverableId},item_type=eq.${itemType}`,
        },
        (payload) => {
          console.log('🔔 Real-time comment update:', payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up comments subscription');
      supabase.removeChannel(channel);
    };
  }, [deliverableId, organizationId, itemType]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching comments for deliverable:', deliverableId);
      console.log('🏢 Organization ID (optional):', organizationId || 'none');
      
      // Fetch comments with user profile information
      // NOTE: We query by deliverable_id AND item_type - RLS policies handle access control
      const { data: commentsData, error: commentsError } = await (supabase as any)
        .from('deliverable_comments')
        .select(`
          *,
          profiles!deliverable_comments_user_id_fkey(
            id,
            email,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('deliverable_id', deliverableId)
        .eq('item_type', itemType)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('❌ Error fetching comments:', commentsError);
        console.error('❌ Error details:', {
          code: commentsError.code,
          message: commentsError.message,
          details: commentsError.details,
          hint: commentsError.hint
        });
        throw commentsError;
      }

      console.log('✅ Fetched comments:', commentsData?.length || 0, 'comments found');
      console.log('📋 Comments data:', commentsData);

      // Check which users are mentors based on the comment's organization_id OR the deliverable's organization_id
      let mentorUserIds = new Set<string>();
      
      // Get unique organization IDs from comments (might be null for some)
      const orgIds = new Set<string>();
      if (organizationId) {
        orgIds.add(organizationId);
      }
      commentsData?.forEach((c: any) => {
        if (c.organization_id) {
          orgIds.add(c.organization_id);
        }
      });

      if (orgIds.size > 0) {
        console.log('🎓 Checking for mentors in organizations:', Array.from(orgIds));
        const userIds = commentsData?.map((c: any) => c.user_id) || [];
        
        if (userIds.length > 0) {
          const { data: mentorsData } = await (supabase as any)
            .from('mentors')
            .select('user_id, organization_id')
            .in('organization_id', Array.from(orgIds))
            .eq('status', 'active')
            .in('user_id', userIds);

          mentorUserIds = new Set(mentorsData?.map((m: any) => m.user_id) || []);
          console.log('🎓 Found mentors:', Array.from(mentorUserIds));
        }
      }

      // Map comments with mentor status
      const mappedComments: Comment[] = (commentsData || []).map((comment: any) => ({
        id: comment.id,
        deliverable_id: comment.deliverable_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        is_edited: comment.is_edited,
        user: comment.profiles,
        is_mentor: mentorUserIds.has(comment.user_id)
      }));

      console.log('💬 Setting comments state with', mappedComments.length, 'comments');
      setComments(mappedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('📤 Submitting comment:', {
        deliverable_id: deliverableId,
        organization_id: organizationId || null,
        user_id: currentUserId,
        item_type: itemType,
        content_length: newComment.trim().length
      });

      // organization_id can be null for individual users - that's OK!
      const { error } = await (supabase as any)
        .from('deliverable_comments')
        .insert({
          deliverable_id: deliverableId,
          organization_id: organizationId || null, // Explicitly set to null if undefined
          user_id: currentUserId,
          item_type: itemType,
          content: newComment.trim(),
        });

      if (error) {
        console.error('❌ Error inserting comment:', error);
        throw error;
      }

      console.log('✅ Comment submitted successfully');
      setNewComment('');
      toast({
        title: "Succès",
        description: "Commentaire ajouté avec succès.",
      });
      
      // Refresh comments to show the new one
      await fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingContent.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('✏️ Updating comment:', editingCommentId);
      
      const { error } = await (supabase as any)
        .from('deliverable_comments')
        .update({ 
          content: editingContent.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCommentId);

      if (error) {
        console.error('❌ Error updating comment:', error);
        throw error;
      }

      console.log('✅ Comment updated successfully');
      setEditingCommentId(null);
      setEditingContent('');
      toast({
        title: "Succès",
        description: "Commentaire modifié avec succès.",
      });
      
      // Refresh comments to show the updated one
      await fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le commentaire.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      console.log('🗑️ Deleting comment:', commentToDelete);
      
      const { error } = await (supabase as any)
        .from('deliverable_comments')
        .delete()
        .eq('id', commentToDelete);

      if (error) {
        console.error('❌ Error deleting comment:', error);
        throw error;
      }

      console.log('✅ Comment deleted successfully');
      toast({
        title: "Succès",
        description: "Commentaire supprimé avec succès.",
      });
      
      // Refresh comments to remove the deleted one
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const getUserInitials = (user?: Comment['user']) => {
    if (!user) return '?';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  const getUserName = (user?: Comment['user']) => {
    if (!user) return 'Utilisateur inconnu';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.email) return user.email.split('@')[0];
    return 'Utilisateur';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-lg">
          Commentaires {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun commentaire pour l'instant</p>
            <p className="text-gray-400 text-xs mt-1">Soyez le premier à commenter ce livrable</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={comment.user?.avatar_url} alt={getUserName(comment.user)} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-400 text-white text-sm font-semibold">
                    {getUserInitials(comment.user)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">
                      {getUserName(comment.user)}
                    </span>
                    {comment.is_mentor && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                        Mentor
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                    {comment.is_edited && (
                      <span className="text-xs text-gray-400 italic">(modifié)</span>
                    )}
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2 mt-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[80px] text-sm"
                        placeholder="Modifier votre commentaire..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="bg-gradient-primary hover:opacity-90"
                        >
                          Enregistrer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent('');
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  )}
                </div>

                {comment.user_id === currentUserId && editingCommentId !== comment.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditComment(comment.id, comment.content)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCommentToDelete(comment.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="min-h-[100px] resize-none"
          disabled={submitting}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
            className="bg-gradient-primary hover:opacity-90"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le commentaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le commentaire sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeliverableComments;
