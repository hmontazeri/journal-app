import { getVaultConfig } from './storage';

async function getBackendConfig(): Promise<{ url: string; apiKey: string } | null> {
  // Try to get from vault config first
  const vaultConfig = await getVaultConfig();
  if (vaultConfig?.backendUrl && vaultConfig?.apiKey) {
    return {
      url: vaultConfig.backendUrl,
      apiKey: vaultConfig.apiKey
    };
  }

  // Fallback to temporary storage (during setup)
  const tempUrl = localStorage.getItem('temp_backend_url');
  const tempKey = localStorage.getItem('temp_api_key');
  
  if (tempUrl && tempKey) {
    return { url: tempUrl, apiKey: tempKey };
  }

  // No backend configured - offline mode
  return null;
}

function getHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
  };
}

export interface SyncResponse {
  success: boolean;
  data?: string | null;
  timestamp?: string;
  error?: string;
}

/**
 * Sync encrypted journal data to cloud backend
 */
export async function syncToCloud(
  vaultId: string,
  encryptedData: string,
  backendUrl?: string,
  apiKey?: string
): Promise<SyncResponse> {
  try {
    const config = backendUrl && apiKey 
      ? { url: backendUrl, apiKey }
      : await getBackendConfig();

    if (!config) {
      // Offline mode - no backend configured
      return {
        success: true,
        data: null,
        error: 'Offline mode - cloud sync not configured'
      };
    }

    const response = await fetch(`${config.url}/api/sync?vaultId=${vaultId}`, {
      method: 'POST',
      headers: getHeaders(config.apiKey),
      body: JSON.stringify({ data: encryptedData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Sync failed: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync to cloud error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Retrieve encrypted journal data from cloud backend
 */
export async function syncFromCloud(
  vaultId: string,
  backendUrl?: string,
  apiKey?: string
): Promise<SyncResponse> {
  try {
    const config = backendUrl && apiKey 
      ? { url: backendUrl, apiKey }
      : await getBackendConfig();

    if (!config) {
      // Offline mode - no backend configured
      return {
        success: true,
        data: null,
        error: 'Offline mode - cloud sync not configured'
      };
    }

    const response = await fetch(`${config.url}/api/sync?vaultId=${vaultId}`, {
      method: 'GET',
      headers: getHeaders(config.apiKey),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Sync failed: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync from cloud error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete vault data from cloud backend
 */
export async function deleteFromCloud(
  vaultId: string,
  backendUrl?: string,
  apiKey?: string
): Promise<SyncResponse> {
  try {
    const config = backendUrl && apiKey 
      ? { url: backendUrl, apiKey }
      : await getBackendConfig();

    if (!config) {
      // Offline mode - no backend configured
      return {
        success: true,
        data: null,
        error: 'Offline mode - cloud sync not configured'
      };
    }

    const response = await fetch(`${config.url}/api/sync?vaultId=${vaultId}`, {
      method: 'DELETE',
      headers: getHeaders(config.apiKey),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Delete failed: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete from cloud error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
