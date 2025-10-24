/**
 * Google Drive Integration Types
 */

export interface GoogleDriveSettings {
  events?: string[];
  folder_id?: string; // Root folder for Aurentia files
  sync_enabled?: boolean;
  auto_create_folders?: boolean; // Auto-create project folders
}

export interface GoogleDriveFile {
  name: string;
  mimeType: string;
  parents?: string[]; // Folder IDs
  description?: string;
}

export interface GoogleDriveFolderResponse {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
}

export interface UploadFileResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  error?: string;
}

export interface CreateFolderResult {
  success: boolean;
  folderId?: string;
  folderLink?: string;
  error?: string;
}

export interface GoogleDriveListResponse {
  files: Array<{
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
  }>;
  nextPageToken?: string;
}
