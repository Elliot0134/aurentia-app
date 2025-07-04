import { supabase } from '@/integrations/supabase/client';

export type KanbanCard = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  priority: 'faible' | 'moyenne' | 'haute';
  tags: string[];
  status: 'todo' | 'inprogress' | 'done';
  project_id: string;
};

export type KanbanComment = {
  id: string;
  card_id: string;
  author: string;
  comment: string;
  created_at: string;
};

export const getCards = async (projectId: string) => {
  const { data, error } = await supabase
    .from('kanban_card')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as KanbanCard[];
};

export const addCard = async (card: Partial<KanbanCard>) => {
  const { data, error } = await supabase
    .from('kanban_card')
    .insert([card])
    .select()
    .single();
  if (error) throw error;
  return data as KanbanCard;
};

export const updateCard = async (card: Partial<KanbanCard> & { id: string }) => {
  const { data, error } = await supabase
    .from('kanban_card')
    .update(card)
    .eq('id', card.id)
    .select()
    .single();
  if (error) throw error;
  return data as KanbanCard;
};

export const deleteCard = async (cardId: string) => {
  const { error } = await supabase
    .from('kanban_card')
    .delete()
    .eq('id', cardId);
  if (error) throw error;
};

export const getComments = async (cardId: string) => {
  const { data, error } = await supabase
    .from('kanban_comment')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as KanbanComment[];
};

export const addComment = async (comment: Partial<KanbanComment>) => {
  const { data, error } = await supabase
    .from('kanban_comment')
    .insert([comment])
    .select()
    .single();
  if (error) throw error;
  return data as KanbanComment;
};

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('kanban_comment')
    .delete()
    .eq('id', commentId);
  if (error) throw error;
}; 