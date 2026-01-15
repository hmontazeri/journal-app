/**
 * Sync Optimizer
 * Tracks data changes to avoid unnecessary syncs
 */

import { JournalData } from '../types';
import { getLocalJournalData } from './storage';

let lastSyncedHash: string | null = null;

/**
 * Generate a hash of the journal data for comparison
 */
function hashJournalData(data: JournalData): string {
  // Simple hash based on entry count and last updated timestamps
  const entryKeys = Object.keys(data.entries).sort();
  const lastUpdated = entryKeys.map(key => {
    const entry = data.entries[key];
    return `${key}:${entry.updatedAt}`;
  }).join('|');
  
  return `${entryKeys.length}:${lastUpdated}`;
}

/**
 * Check if data has changed since last sync
 */
export async function hasDataChanged(currentData: JournalData): Promise<boolean> {
  const currentHash = hashJournalData(currentData);
  
  // If we don't have a last sync hash, check against stored data
  if (lastSyncedHash === null) {
    const storedData = await getLocalJournalData();
    if (storedData) {
      lastSyncedHash = hashJournalData(storedData);
    } else {
      // First time, mark as changed
      lastSyncedHash = currentHash;
      return true;
    }
  }
  
  const hasChanged = currentHash !== lastSyncedHash;
  
  if (hasChanged) {
    lastSyncedHash = currentHash;
  }
  
  return hasChanged;
}

/**
 * Mark data as synced
 */
export function markAsSynced(data: JournalData): void {
  lastSyncedHash = hashJournalData(data);
}

/**
 * Reset sync tracking (e.g., when vault changes)
 */
export function resetSyncTracking(): void {
  lastSyncedHash = null;
}
