/**
 * Google Drive Integration Service
 * Handles file uploads and folder management in Google Drive
 */

import type {
  IntegrationEvent,
  GoogleDriveCredentials,
  SendNotificationResult,
  TestConnectionResult,
} from '@/types/integrationTypes';
import type {
  GoogleDriveSettings,
  UploadFileResult,
  CreateFolderResult,
  GoogleDriveListResponse,
} from './googleDriveTypes';
import { googleDriveFormatter } from './googleDriveFormatter';

const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

class GoogleDriveService {
  /**
   * Handle integration event - creates folders or uploads files
   */
  async sendNotification(
    credentials: GoogleDriveCredentials,
    event: IntegrationEvent,
    settings?: GoogleDriveSettings
  ): Promise<SendNotificationResult> {
    const startTime = Date.now();

    try {
      const driveSettings: GoogleDriveSettings = settings || {
        events: [],
        sync_enabled: true,
        auto_create_folders: true,
      };

      // Format event for Google Drive
      const driveFile = googleDriveFormatter.formatEvent(event, driveSettings);

      if (!driveFile) {
        return {
          success: true,
          statusCode: 200,
          duration: Date.now() - startTime,
        };
      }

      // Ensure we have a valid access token
      const validCredentials = await this.ensureValidToken(credentials);

      // Create folder or upload file based on type
      let result;
      if (driveFile.mimeType === 'application/vnd.google-apps.folder') {
        result = await this.createFolder(
          validCredentials.accessToken,
          driveFile.name,
          driveSettings.folder_id
        );
      } else {
        result = await this.uploadFile(
          validCredentials.accessToken,
          driveFile,
          driveSettings.folder_id
        );
      }

      return {
        success: result.success,
        statusCode: result.success ? 200 : 500,
        duration: Date.now() - startTime,
        error: result.error,
      };
    } catch (error: any) {
      console.error('[GoogleDriveService] Failed to sync:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Create a folder in Google Drive
   */
  async createFolder(
    accessToken: string,
    folderName: string,
    parentFolderId?: string
  ): Promise<CreateFolderResult> {
    try {
      const metadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (parentFolderId) {
        metadata.parents = [parentFolderId];
      }

      const response = await fetch(`${GOOGLE_DRIVE_API_BASE}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GoogleDriveService] Create folder failed:', error);
        return {
          success: false,
          error: `Failed to create folder: ${response.statusText}`,
        };
      }

      const folder = await response.json();

      return {
        success: true,
        folderId: folder.id,
        folderLink: folder.webViewLink,
      };
    } catch (error: any) {
      console.error('[GoogleDriveService] Create folder error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create folder',
      };
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(
    accessToken: string,
    file: { name: string; mimeType: string; description?: string },
    parentFolderId?: string
  ): Promise<UploadFileResult> {
    try {
      const metadata: any = {
        name: file.name,
        mimeType: file.mimeType,
        description: file.description,
      };

      if (parentFolderId) {
        metadata.parents = [parentFolderId];
      }

      const response = await fetch(`${GOOGLE_DRIVE_API_BASE}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GoogleDriveService] Upload file failed:', error);
        return {
          success: false,
          error: `Failed to upload file: ${response.statusText}`,
        };
      }

      const uploadedFile = await response.json();

      return {
        success: true,
        fileId: uploadedFile.id,
        webViewLink: uploadedFile.webViewLink,
      };
    } catch (error: any) {
      console.error('[GoogleDriveService] Upload file error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }
  }

  /**
   * Test connection by listing user's Drive files
   */
  async testConnection(credentials: GoogleDriveCredentials): Promise<TestConnectionResult> {
    try {
      const validCredentials = await this.ensureValidToken(credentials);

      const response = await fetch(
        `${GOOGLE_DRIVE_API_BASE}/files?pageSize=1&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${validCredentials.accessToken}`,
          },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: 'Failed to connect to Google Drive',
          details: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        message: 'Google Drive connected successfully',
      };
    } catch (error: any) {
      console.error('[GoogleDriveService] Test connection failed:', error);
      return {
        success: false,
        message: 'Connection test failed',
        details: error.message,
      };
    }
  }

  /**
   * Ensure access token is valid, refresh if needed
   */
  private async ensureValidToken(
    credentials: GoogleDriveCredentials
  ): Promise<GoogleDriveCredentials> {
    const expiresAt = new Date(credentials.expiresAt);
    const now = new Date();

    // If token expires in less than 5 minutes, refresh it
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      return await this.refreshToken(credentials);
    }

    return credentials;
  }

  /**
   * Refresh the OAuth access token
   */
  private async refreshToken(
    credentials: GoogleDriveCredentials
  ): Promise<GoogleDriveCredentials> {
    try {
      const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          refresh_token: credentials.refreshToken,
          grant_type: 'refresh_token',
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      return {
        ...credentials,
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      };
    } catch (error: any) {
      console.error('[GoogleDriveService] Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * List folders in Google Drive
   */
  async listFolders(
    credentials: GoogleDriveCredentials,
    pageToken?: string
  ): Promise<GoogleDriveListResponse> {
    try {
      const validCredentials = await this.ensureValidToken(credentials);

      const params = new URLSearchParams({
        q: "mimeType='application/vnd.google-apps.folder'",
        fields: 'files(id,name,mimeType,webViewLink),nextPageToken',
        pageSize: '50',
      });

      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      const response = await fetch(`${GOOGLE_DRIVE_API_BASE}/files?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${validCredentials.accessToken}`,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`Failed to list folders: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[GoogleDriveService] List folders failed:', error);
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
