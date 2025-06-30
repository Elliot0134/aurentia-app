-- Migration pour le système de conversation du chatbot
-- A exécuter sur votre base de données Supabase

-- 1. Supprimer les anciennes tables qui ont une structure incorrecte
DROP TABLE IF EXISTS public.conversation CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;

-- 2. Créer la nouvelle table conversation
CREATE TABLE public.conversation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Nouvelle conversation',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversation_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT conversation_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE CASCADE
);

-- 3. Créer la nouvelle table messages
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'bot')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversation(id) ON DELETE CASCADE
);

-- 4. Créer des index pour améliorer les performances
CREATE INDEX idx_conversation_user_project ON public.conversation(user_id, project_id);
CREATE INDEX idx_conversation_created_at ON public.conversation(created_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at ASC);

-- 5. Activer RLS (Row Level Security) pour la sécurité
ALTER TABLE public.conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS
-- Conversation : les utilisateurs ne peuvent voir que leurs propres conversations
CREATE POLICY "Users can view their own conversations" ON public.conversation
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON public.conversation
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.conversation
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON public.conversation
  FOR DELETE USING (auth.uid() = user_id);

-- Messages : les utilisateurs ne peuvent voir que les messages de leurs conversations
CREATE POLICY "Users can view messages from their conversations" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversation WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversation WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their conversations" ON public.messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM public.conversation WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their conversations" ON public.messages
  FOR DELETE USING (
    conversation_id IN (
      SELECT id FROM public.conversation WHERE user_id = auth.uid()
    )
  ); 