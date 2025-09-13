import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

class ChatbotService {
  private conversations: Map<string, Conversation> = new Map();
  private currentConversationId: string | null = null;

  constructor() {
    this.loadConversationsFromStorage();
  }

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // === MÉTHODES DE PERSISTENCE EN BASE DE DONNÉES ===

  // Créer une conversation en DB
  async createConversationInDB(
    userId: string,
    projectId: string,
    title?: string
  ): Promise<string | null> {
    try {
      console.log('Attempting to create conversation in DB with:', { userId, projectId, title });
      const { data, error } = await supabase
        .from('conversation')
        .insert({
          user_id: userId,
          project_id: projectId,
          title: title || 'Nouvelle conversation'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erreur création conversation DB:', error.message, error.details, error.hint);
        return null;
      }

      console.log('Conversation created in DB:', data.id);
      return data.id;
    } catch (error: any) {
      console.error('Erreur création conversation DB (catch):', error.message);
      return null;
    }
  }

  // Charger une conversation depuis la DB
  async loadConversationFromDB(conversationId: string): Promise<Conversation | null> {
    try {
      // Charger la conversation
      const { data: convData, error: convError } = await supabase
        .from('conversation')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError || !convData) {
        console.error('Conversation non trouvée:', convError);
        return null;
      }

      // Charger les messages de cette conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Erreur chargement messages:', messagesError);
        return null;
      }

      // Convertir en format local
      const conversation: Conversation = {
        id: convData.id,
        title: convData.title,
        userId: convData.user_id,
        projectId: convData.project_id,
        createdAt: new Date(convData.created_at),
        updatedAt: new Date(convData.updated_at),
        messages: (messagesData || []).map(msg => ({
          id: msg.id,
          sender: msg.sender as 'user' | 'bot',
          text: msg.content,
          timestamp: new Date(msg.created_at)
        }))
      };

      return conversation;
    } catch (error) {
      console.error('Erreur chargement conversation DB:', error);
      return null;
    }
  }

  // Sauvegarder un message en DB
  async saveMessageToDB(conversationId: string, sender: 'user' | 'bot', content: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender,
          content
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erreur sauvegarde message DB:', error);
        return null;
      }

      // Mettre à jour le timestamp de la conversation
      await supabase
        .from('conversation')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data.id;
    } catch (error) {
      console.error('Erreur sauvegarde message DB:', error);
      return null;
    }
  }

  // Lister les conversations d'un utilisateur pour un projet ou une entité spécifique
  async getUserConversationsFromDB(
    userId: string,
    projectId: string
  ): Promise<Conversation[]> {
    try {
      let query = supabase
        .from('conversation')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId);

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement conversations DB:', error);
        return [];
      }

      return (data || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        userId: conv.user_id,
        projectId: conv.project_id,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        messages: [] // Les messages seront chargés séparément si nécessaire
      }));
    } catch (error) {
      console.error('Erreur chargement conversations DB:', error);
      return [];
    }
  }

  // Mettre à jour le titre d'une conversation en DB
  async updateConversationTitleInDB(conversationId: string, title: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversation')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        console.error('Erreur mise à jour titre DB:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur mise à jour titre DB:', error);
      return false;
    }
  }

  // Supprimer une conversation de la DB
  async deleteConversationFromDB(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversation')
        .delete()
        .eq('id', conversationId);

      if (error) {
        console.error('Erreur suppression conversation DB:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur suppression conversation DB:', error);
      return false;
    }
  }

  // Mettre à jour un message en DB
  async updateMessageInDB(messageId: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur mise à jour message DB:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur mise à jour message DB:', error);
      return false;
    }
  }

  // Load conversations from localStorage as fallback
  private loadConversationsFromStorage(): void {
    try {
      const stored = localStorage.getItem('aurentia_conversations');
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((conv: any) => {
          const conversation: Conversation = {
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          };
          this.conversations.set(conversation.id, conversation);
        });
      }
    } catch (error) {
      console.error('Error loading conversations from storage:', error);
    }
  }

  // Save conversations to localStorage
  private saveConversationsToStorage(): void {
    try {
      const data = Array.from(this.conversations.values());
      localStorage.setItem('aurentia_conversations', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving conversations to storage:', error);
    }
  }

  // Create a new conversation (LEGACY - utilise localStorage)
  createConversation(userId: string, projectId?: string): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
      title: 'Nouvelle conversation',
      userId,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };

    this.conversations.set(conversation.id, conversation);
    this.currentConversationId = conversation.id;
    this.saveConversationsToStorage();
    
    return conversation;
  }

  // Créer une nouvelle conversation avec persistence DB
  async createNewConversation(
    userId: string,
    projectId: string
  ): Promise<Conversation | null> {
    try {
      // Créer en DB d'abord
      const dbConversationId = await this.createConversationInDB(userId, projectId);
      if (!dbConversationId) {
        console.error('Échec création conversation en DB');
        return null;
      }

      // Créer l'objet conversation sans le stocker localement
      const conversation: Conversation = {
        id: dbConversationId,
        title: 'Nouvelle conversation',
        userId,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      };

      // Stocker localement seulement après création (pour permettre l'usage)
      this.conversations.set(conversation.id, conversation);
      this.currentConversationId = conversation.id;
      // Ne pas sauvegarder en localStorage pour éviter la persistence locale

      console.log('✅ Conversation créée avec succès:', dbConversationId);
      return conversation;
    } catch (error) {
      console.error('❌ Erreur création conversation:', error);
      return null;
    }
  }

  // Get conversation by ID
  getConversation(conversationId: string): Conversation | null {
    return this.conversations.get(conversationId) || null;
  }

  // Get all conversations for a user
  getUserConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Add message to conversation (LEGACY - localStorage uniquement)
  addMessage(conversationId: string, sender: 'user' | 'bot', text: string): Message | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    const message: Message = {
      id: this.generateId(),
      sender,
      text,
      timestamp: new Date()
    };

    // Vérifier qu'il n'y a pas déjà un message avec le même ID
    const existingMessageIndex = conversation.messages.findIndex(m => m.id === message.id);
    if (existingMessageIndex === -1) {
      conversation.messages.push(message);
      conversation.updatedAt = new Date();

      // Auto-update conversation title based on first user message
      if (sender === 'user' && conversation.messages.filter(m => m.sender === 'user').length === 1) {
        conversation.title = this.generateConversationTitle(text);
      }
    } else {
      console.warn('⚠️ Message avec ID existant ignoré:', message.id);
      return conversation.messages[existingMessageIndex]; // Retourner le message existant
    }

    this.saveConversationsToStorage();
    return message;
  }

  // Ajouter un message avec persistence DB
  async addMessageWithDB(conversationId: string, sender: 'user' | 'bot', text: string): Promise<Message | null> {
    try {
      // Sauvegarder en DB d'abord
      const dbMessageId = await this.saveMessageToDB(conversationId, sender, text);
      if (!dbMessageId) {
        console.error('Échec sauvegarde message en DB');
        return null;
      }

      // Ajouter localement avec l'ID de la DB
      const conversation = this.conversations.get(conversationId);
      if (!conversation) {
        console.error('Conversation non trouvée localement:', conversationId);
        return null;
      }

      const message: Message = {
        id: dbMessageId,
        sender,
        text,
        timestamp: new Date()
      };

      // Vérifier qu'il n'y a pas déjà un message avec le même ID
      const existingMessageIndex = conversation.messages.findIndex(m => m.id === message.id);
      if (existingMessageIndex === -1) {
        conversation.messages.push(message);
        conversation.updatedAt = new Date();
      } else {
        console.warn('⚠️ Message avec ID existant ignoré:', message.id);
        return conversation.messages[existingMessageIndex]; // Retourner le message existant
      }

      // Auto-update conversation title based on first user message
      if (sender === 'user' && conversation.messages.filter(m => m.sender === 'user').length === 1) {
        const newTitle = this.generateConversationTitle(text);
        conversation.title = newTitle;
        // Mettre à jour aussi en DB
        await this.updateConversationTitleInDB(conversationId, newTitle);
        
        // Déclencher un événement pour notifier le changement de titre
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('conversationTitleChanged', { 
            detail: { conversationId, newTitle } 
          }));
        }
      }

      // Ne pas sauvegarder en localStorage pour les nouvelles conversations
      // this.saveConversationsToStorage();

      console.log('✅ Message ajouté avec succès:', { conversationId, sender, messageId: dbMessageId });
      return message;
    } catch (error) {
      console.error('❌ Erreur ajout message:', error);
      return null;
    }
  }

  // Update an existing message (LEGACY - localStorage uniquement)
  updateMessage(conversationId: string, messageId: string, text: string): Message | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      text,
      timestamp: new Date()
    };

    conversation.updatedAt = new Date();
    this.saveConversationsToStorage();
    return conversation.messages[messageIndex];
  }

  // Mettre à jour un message avec persistence DB
  async updateMessageWithDB(conversationId: string, messageId: string, text: string): Promise<Message | null> {
    try {
      // Mettre à jour en DB d'abord
      const dbSuccess = await this.updateMessageInDB(messageId, text);
      if (!dbSuccess) {
        console.error('Échec mise à jour message en DB');
        return null;
      }

      // Mettre à jour localement
      const conversation = this.conversations.get(conversationId);
      if (!conversation) {
        console.error('Conversation non trouvée localement:', conversationId);
        return null;
      }

      const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        console.error('Message non trouvé localement:', messageId);
        return null;
      }

      conversation.messages[messageIndex] = {
        ...conversation.messages[messageIndex],
        text,
        timestamp: new Date()
      };

      conversation.updatedAt = new Date();
      this.saveConversationsToStorage();

      console.log('✅ Message mis à jour avec succès:', { conversationId, messageId });
      return conversation.messages[messageIndex];
    } catch (error) {
      console.error('❌ Erreur mise à jour message:', error);
      return null;
    }
  }

  // Generate conversation title from first message
  private generateConversationTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  }

  // Update conversation title
  updateConversationTitle(conversationId: string, title: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    conversation.title = title;
    conversation.updatedAt = new Date();
    this.saveConversationsToStorage();
    return true;
  }

  // Delete conversation
  deleteConversation(conversationId: string): boolean {
    const deleted = this.conversations.delete(conversationId);
    if (deleted) {
      this.saveConversationsToStorage();
      if (this.currentConversationId === conversationId) {
        this.currentConversationId = null;
      }
    }
    return deleted;
  }

  // Generate bot response
  async generateBotResponse(conversationId: string, userMessage: string, projectId?: string): Promise<string> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return "Je ne trouve pas cette conversation.";

    // Get project context if available
    let projectContext = "";
    if (projectId) {
      projectContext = await this.getProjectContext(projectId);
    }

    // Analyze user message for intent
    const intent = this.analyzeUserIntent(userMessage);
    
    // Generate contextual response
    const response = this.generateContextualResponse(userMessage, intent, projectContext, conversation.messages);
    
    return response;
  }

  // Analyze user intent
  private analyzeUserIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('concurrence') || lowerMessage.includes('concurrent')) {
      return 'competition_analysis';
    }
    if (lowerMessage.includes('marché') || lowerMessage.includes('market')) {
      return 'market_analysis';
    }
    if (lowerMessage.includes('proposition') || lowerMessage.includes('valeur')) {
      return 'value_proposition';
    }
    if (lowerMessage.includes('risque') || lowerMessage.includes('risk')) {
      return 'risk_analysis';
    }
    if (lowerMessage.includes('business model') || lowerMessage.includes('modèle')) {
      return 'business_model';
    }
    if (lowerMessage.includes('persona') || lowerMessage.includes('client')) {
      return 'customer_analysis';
    }
    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return 'help';
    }
    
    return 'general';
  }

  // Generate contextual response
  private generateContextualResponse(userMessage: string, intent: string, projectContext: string, conversationHistory: Message[]): string {
    const responses = {
      competition_analysis: [
        `Excellente question sur l'analyse concurrentielle ! ${projectContext ? 'En me basant sur votre projet, ' : ''}je peux vous aider à :

• Identifier vos concurrents directs et indirects
• Analyser leurs forces et faiblesses
• Définir votre avantage concurrentiel
• Élaborer une stratégie de différenciation

${projectContext ? `Voici ce que je sais de votre projet :\n${projectContext}\n\n` : ''}Quelle est votre principale préoccupation concernant la concurrence ?`,

        `L'analyse de la concurrence est cruciale pour votre succès ! Voici comment procéder :

1. **Concurrence directe** : Qui propose exactement la même solution ?
2. **Concurrence indirecte** : Qui résout le même problème différemment ?
3. **Concurrence potentielle** : Qui pourrait entrer sur votre marché ?

${projectContext ? `Pour votre projet :\n${projectContext}\n\n` : ''}Souhaitez-vous que nous analysions un concurrent spécifique ?`
      ],
      
      market_analysis: [
        `Parfait ! L'analyse de marché est fondamentale. ${projectContext ? 'Avec votre projet, ' : ''}nous pouvons explorer :

• La taille et la croissance du marché
• Les tendances et opportunités
• La segmentation client
• Les barrières à l'entrée

${projectContext ? `Contexte de votre projet :\n${projectContext}\n\n` : ''}Quel aspect du marché vous intéresse le plus ?`,

        `Excellente initiative d'analyser votre marché ! Voici les étapes clés :

1. **Taille du marché** : TAM, SAM, SOM
2. **Dynamiques** : Croissance, maturité, disruption
3. **Segments** : Qui sont vos clients idéaux ?
4. **Opportunités** : Niches inexploitées

${projectContext ? `Pour votre contexte :\n${projectContext}\n\n` : ''}Sur quel segment souhaitez-vous vous concentrer ?`
      ],

      value_proposition: [
        `La proposition de valeur est le cœur de votre projet ! ${projectContext ? 'Avec votre solution, ' : ''}définissons :

• Le problème que vous résolvez
• Votre solution unique
• Les bénéfices pour vos clients
• Votre différenciation

${projectContext ? `Votre projet :\n${projectContext}\n\n` : ''}Quel est le principal problème que vous résolvez ?`,

        `Créons ensemble une proposition de valeur percutante ! Structure recommandée :

"Pour [client cible] qui [problème/besoin], notre [solution] offre [bénéfice clé] contrairement à [alternative]"

${projectContext ? `Contexte :\n${projectContext}\n\n` : ''}Commençons par identifier votre client cible idéal ?`
      ],

      risk_analysis: [
        `L'analyse des risques est essentielle ! ${projectContext ? 'Pour votre projet, ' : ''}identifions :

• Risques techniques et opérationnels
• Risques de marché et concurrentiels  
• Risques financiers et réglementaires
• Plans de mitigation

${projectContext ? `Votre contexte :\n${projectContext}\n\n` : ''}Quel type de risque vous préoccupe le plus ?`,

        `Anticipons les défis ensemble ! Catégories de risques à évaluer :

1. **Techniques** : Faisabilité, complexité
2. **Marché** : Adoption, concurrence
3. **Financiers** : Financement, rentabilité
4. **Opérationnels** : Équipe, ressources

${projectContext ? `Pour votre situation :\n${projectContext}\n\n` : ''}Voulez-vous approfondir une catégorie spécifique ?`
      ],

      help: [
        `Je suis Aurentia, votre assistant IA spécialisé dans l'analyse de projets entrepreneuriaux ! Je peux vous aider avec :

🎯 **Analyse stratégique**
• Étude de marché et concurrence
• Proposition de valeur
• Business model

📊 **Analyse opérationnelle**  
• Personas clients
• Analyse des risques
• Ressources nécessaires

💡 **Conseils personnalisés**
• Recommandations adaptées
• Stratégies de développement

${projectContext ? `Je connais déjà votre projet :\n${projectContext}\n\n` : ''}Que souhaitez-vous explorer en premier ?`,

        `Ravi de vous accompagner ! Voici mes domaines d'expertise :

• **Stratégie** : Positionnement, différenciation
• **Marché** : Opportunités, segments, tendances  
• **Clients** : Personas, besoins, comportements
• **Concurrence** : Forces, faiblesses, stratégies
• **Risques** : Identification, évaluation, mitigation

${projectContext ? `Votre projet :\n${projectContext}\n\n` : ''}Par quoi commençons-nous ?`
      ],

      general: [
        `Merci pour votre question ! ${projectContext ? 'En considérant votre projet, ' : ''}je peux vous aider à :

• Analyser votre marché et la concurrence
• Développer votre proposition de valeur
• Identifier vos clients cibles
• Évaluer les risques et opportunités

${projectContext ? `Contexte de votre projet :\n${projectContext}\n\n` : ''}Pouvez-vous préciser ce qui vous intéresse le plus ?`,

        `Excellente question ! En tant qu'expert en analyse entrepreneuriale, je peux vous accompagner sur :

📈 Stratégie et positionnement
🎯 Analyse client et personas
⚖️ Évaluation risques/opportunités
💼 Modèles économiques

${projectContext ? `Pour votre projet :\n${projectContext}\n\n` : ''}Quel aspect souhaitez-vous approfondir ?`
      ]
    };

    const intentResponses = responses[intent as keyof typeof responses] || responses.general;
    const randomResponse = intentResponses[Math.floor(Math.random() * intentResponses.length)];
    
    return randomResponse;
  }

  // Get project context from Supabase (placeholder for when DB access is available)
  private async getProjectContext(projectId: string): Promise<string> {
    try {
      // This would query the actual project data when Supabase access is available
      // For now, return a placeholder context
      return `Projet ID: ${projectId}`;
    } catch (error) {
      console.error('Error fetching project context:', error);
      return "";
    }
  }

  // Set current conversation
  setCurrentConversation(conversationId: string): void {
    this.currentConversationId = conversationId;
  }

  // Get current conversation
  getCurrentConversation(): Conversation | null {
    return this.currentConversationId ? this.getConversation(this.currentConversationId) : null;
  }
}

export const chatbotService = new ChatbotService();
