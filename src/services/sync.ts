const SYNC_API_URL = 'https://journal-sync.mvlab.workers.dev';

function getApiKey(): string {
  // Priority: User-provided key > Embedded key > Empty
  const userKey = localStorage.getItem('user_api_key');
  const embeddedKey = import.meta.env.VITE_API_KEY || '';
  return userKey || embeddedKey;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const apiKey = getApiKey();
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  
  return headers;
}

export interface SyncResponse {
  success: boolean;
  data?: string | null;
  timestamp?: string;
  error?: string;
}

/**
 * Sync encrypted journal data to Cloudflare Worker
 */
export async function syncToCloud(
  vaultId: string,
  encryptedData: string
): Promise<SyncResponse> {
  try {
    const response = await fetch(`${SYNC_API_URL}/api/sync`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        vaultId,
        data: encryptedData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Retrieve encrypted journal data from Cloudflare Worker
 */
export async function syncFromCloud(
  vaultId: string
): Promise<SyncResponse> {
  try {
    const response = await fetch(
      `${SYNC_API_URL}/api/sync?vaultId=${encodeURIComponent(vaultId)}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Sync failed: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // If not JSON, use the text
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
 * Delete vault data from Cloudflare Worker
 */
export async function deleteFromCloud(
  vaultId: string
): Promise<SyncResponse> {
  try {
    const response = await fetch(
      `${SYNC_API_URL}/api/sync?vaultId=${encodeURIComponent(vaultId)}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Delete failed: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // If not JSON, use the text
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
