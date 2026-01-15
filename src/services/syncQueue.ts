/**
 * Sync Queue Service
 * Batches multiple sync requests to reduce API calls
 */

interface QueuedSync {
  vaultId: string;
  encryptedData: string;
  timestamp: number;
}

class SyncQueue {
  private queue: QueuedSync[] = [];
  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private readonly DEBOUNCE_MS = 5000; // 5 seconds
  private readonly MAX_BATCH_SIZE = 1; // Only keep latest sync (most efficient)

  /**
   * Add a sync request to the queue
   * If there's already a pending sync, it will be replaced with the latest data
   */
  enqueue(vaultId: string, encryptedData: string): void {
    // Remove any existing sync for this vault (we only need the latest)
    this.queue = this.queue.filter(item => item.vaultId !== vaultId);
    
    // Add the new sync
    this.queue.push({
      vaultId,
      encryptedData,
      timestamp: Date.now(),
    });

    // Clear existing timer
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    // Set new timer to batch syncs
    this.syncTimer = setTimeout(() => {
      this.processQueue();
    }, this.DEBOUNCE_MS);
  }

  /**
   * Process the sync queue
   */
  private async processQueue(): Promise<void> {
    if (this.isSyncing || this.queue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      // Process all queued syncs (though we typically only have one due to batching)
      const syncs = [...this.queue];
      this.queue = [];

      // Import sync function dynamically to avoid circular dependencies
      const { syncToCloud } = await import('./sync');

      // Process syncs (usually just one)
      for (const sync of syncs) {
        try {
          await syncToCloud(sync.vaultId, sync.encryptedData);
        } catch (error) {
          console.error('Sync failed:', error);
          // Re-queue failed syncs for retry
          this.queue.push(sync);
        }
      }
    } finally {
      this.isSyncing = false;
      
      // If there are more items queued (from retries), process them
      if (this.queue.length > 0) {
        this.syncTimer = setTimeout(() => {
          this.processQueue();
        }, this.DEBOUNCE_MS);
      }
    }
  }

  /**
   * Force immediate sync (bypasses queue)
   */
  async flush(): Promise<void> {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    await this.processQueue();
  }

  /**
   * Clear the queue
   */
  clear(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    this.queue = [];
  }

  /**
   * Get queue status
   */
  getStatus(): { queued: number; isSyncing: boolean } {
    return {
      queued: this.queue.length,
      isSyncing: this.isSyncing,
    };
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();
