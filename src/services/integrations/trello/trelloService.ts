/**
 * Trello Integration Service
 * Handles syncing Aurentia events to Trello boards
 */

import type {
  IntegrationEvent,
  TrelloCredentials,
  SendNotificationResult,
  TestConnectionResult,
} from '@/types/integrationTypes';
import type {
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloSettings,
  CreateCardRequest,
  UpdateCardRequest,
  SyncCardResult,
} from './trelloTypes';
import { trelloFormatter } from './trelloFormatter';

const TRELLO_API_BASE = 'https://api.trello.com/1';
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

class TrelloService {
  /**
   * Sync an Aurentia event to Trello
   * This is called from the main integration service
   */
  async sendNotification(
    credentials: TrelloCredentials,
    event: IntegrationEvent,
    settings?: TrelloSettings
  ): Promise<SendNotificationResult> {
    const startTime = Date.now();

    try {
      // Default settings if not provided
      const trelloSettings: TrelloSettings = settings || {
        events: [],
        board_id: null,
        sync_enabled: true,
        create_cards_for: ['deliverable.submitted'],
      };

      // Validate board_id
      if (!trelloSettings.board_id) {
        return {
          success: false,
          error: 'No Trello board configured',
          duration: Date.now() - startTime,
        };
      }

      // Get default list (first list on the board)
      const lists = await this.getLists(credentials, trelloSettings.board_id);
      if (lists.length === 0) {
        return {
          success: false,
          error: 'No lists found on Trello board',
          duration: Date.now() - startTime,
        };
      }

      const defaultListId = lists[0].id;

      // Format event for Trello
      const cardRequest = trelloFormatter.formatEvent(event, trelloSettings, defaultListId);

      if (!cardRequest) {
        // Event type not configured to create Trello cards
        return {
          success: true,
          statusCode: 200,
          duration: Date.now() - startTime,
        };
      }

      // Create Trello card
      const result = await this.createCard(credentials, cardRequest);

      return {
        success: result.success,
        statusCode: result.success ? 200 : 500,
        duration: Date.now() - startTime,
        error: result.error,
      };
    } catch (error: any) {
      console.error('[TrelloService] Failed to sync event:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Create a card on a Trello board
   */
  async createCard(
    credentials: TrelloCredentials,
    cardRequest: CreateCardRequest
  ): Promise<SyncCardResult> {
    try {
      const params = new URLSearchParams({
        key: credentials.apiKey,
        token: credentials.token,
        name: cardRequest.name,
        idList: cardRequest.idList,
      });

      // Add optional fields
      if (cardRequest.desc) params.append('desc', cardRequest.desc);
      if (cardRequest.pos) params.append('pos', String(cardRequest.pos));
      if (cardRequest.due) params.append('due', cardRequest.due);
      if (cardRequest.urlSource) params.append('urlSource', cardRequest.urlSource);
      if (cardRequest.idMembers) {
        cardRequest.idMembers.forEach((id) => params.append('idMembers', id));
      }
      if (cardRequest.idLabels) {
        cardRequest.idLabels.forEach((id) => params.append('idLabels', id));
      }

      const response = await fetch(`${TRELLO_API_BASE}/cards?${params.toString()}`, {
        method: 'POST',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Trello API error: ${response.status} - ${errorData}`);
      }

      const card: TrelloCard = await response.json();

      return {
        success: true,
        cardId: card.id,
        cardUrl: card.url,
      };
    } catch (error: any) {
      console.error('[TrelloService] Failed to create card:', error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test Trello connection
   */
  async testConnection(credentials: TrelloCredentials): Promise<TestConnectionResult> {
    try {
      // Try to list boards (simple API call to test connection)
      const params = new URLSearchParams({
        key: credentials.apiKey,
        token: credentials.token,
      });

      const response = await fetch(
        `${TRELLO_API_BASE}/members/me/boards?${params.toString()}`,
        {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            message: 'Token invalide',
            details: 'Veuillez reconnecter votre compte Trello.',
          };
        }

        return {
          success: false,
          message: `Erreur Trello: ${response.status}`,
          details: 'Vérifiez vos identifiants Trello.',
        };
      }

      const boards: TrelloBoard[] = await response.json();
      const boardCount = boards.length;

      return {
        success: true,
        message: `Connexion réussie! ${boardCount} tableau(x) disponible(s).`,
      };
    } catch (error: any) {
      console.error('[TrelloService] Connection test failed:', error);

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return {
          success: false,
          message: "Délai d'attente dépassé",
          details: 'La connexion à Trello a pris trop de temps.',
        };
      }

      return {
        success: false,
        message: 'Erreur lors du test',
        details: error.message || 'Une erreur inconnue s\'est produite',
      };
    }
  }

  /**
   * List boards for the authenticated user
   * Used in the UI to let user select which board to sync to
   */
  async listBoards(credentials: TrelloCredentials): Promise<TrelloBoard[]> {
    const params = new URLSearchParams({
      key: credentials.apiKey,
      token: credentials.token,
    });

    const response = await fetch(
      `${TRELLO_API_BASE}/members/me/boards?${params.toString()}`,
      {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list boards: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get lists on a board
   */
  async getLists(credentials: TrelloCredentials, boardId: string): Promise<TrelloList[]> {
    const params = new URLSearchParams({
      key: credentials.apiKey,
      token: credentials.token,
    });

    const response = await fetch(
      `${TRELLO_API_BASE}/boards/${boardId}/lists?${params.toString()}`,
      {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get lists: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update a Trello card
   * For future bidirectional sync
   */
  async updateCard(
    credentials: TrelloCredentials,
    cardId: string,
    updates: UpdateCardRequest
  ): Promise<SyncCardResult> {
    try {
      const params = new URLSearchParams({
        key: credentials.apiKey,
        token: credentials.token,
      });

      // Add update fields
      if (updates.name) params.append('name', updates.name);
      if (updates.desc !== undefined) params.append('desc', updates.desc);
      if (updates.closed !== undefined) params.append('closed', String(updates.closed));
      if (updates.idList) params.append('idList', updates.idList);
      if (updates.due !== undefined) params.append('due', updates.due);
      if (updates.dueComplete !== undefined) params.append('dueComplete', String(updates.dueComplete));

      const response = await fetch(
        `${TRELLO_API_BASE}/cards/${cardId}?${params.toString()}`,
        {
          method: 'PUT',
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        throw new Error(`Trello API error: ${response.status}`);
      }

      const card: TrelloCard = await response.json();

      return {
        success: true,
        cardId: card.id,
        cardUrl: card.url,
      };
    } catch (error: any) {
      console.error('[TrelloService] Failed to update card:', error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a Trello card
   * For future bidirectional sync
   */
  async deleteCard(credentials: TrelloCredentials, cardId: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        key: credentials.apiKey,
        token: credentials.token,
      });

      const response = await fetch(
        `${TRELLO_API_BASE}/cards/${cardId}?${params.toString()}`,
        {
          method: 'DELETE',
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('[TrelloService] Failed to delete card:', error);
      return false;
    }
  }
}

export const trelloService = new TrelloService();
