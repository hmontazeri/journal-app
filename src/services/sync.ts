const SYNC_API_URL = 'https://journal-sync.mvlab.workers.dev';
const API_KEY = import.meta.env.VITE_API_KEY || '';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
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
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
