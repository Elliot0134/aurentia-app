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

  // Create a new conversation
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

  // Add message to conversation
  addMessage(conversationId: string, sender: 'user' | 'bot', text: string): Message | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    const message: Message = {
      id: this.generateId(),
      sender,
      text,
      timestamp: new Date()
    };

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    // Auto-update conversation title based on first user message
    if (sender === 'user' && conversation.messages.filter(m => m.sender === 'user').length === 1) {
      conversation.title = this.generateConversationTitle(text);
    }

    this.saveConversationsToStorage();
    return message;
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