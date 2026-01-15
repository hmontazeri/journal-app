export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string; // WYSIWYG HTML
  tags: string[];
  mood: {
    scale: number; // 1-10
  };
  energyDrained: string; // What drained my energy
  energyGained: string; // What gave me energy
  createdAt: string;
  updatedAt: string;
}

export interface JournalData {
  entries: Record<string, JournalEntry>;
  metadata: {
    lastSync: string;
    version: string;
    deviceId: string;
  };
}

export interface VaultConfig {
  vaultId: string;
  createdAt: string;
  backendUrl?: string;  // Optional - for cloud sync
  apiKey?: string;      // Optional - for cloud sync
}
