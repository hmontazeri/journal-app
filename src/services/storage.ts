import { get } from '@tauri-apps/plugin-fs';
import { VaultConfig, JournalData } from '../types';

const VAULT_CONFIG_KEY = 'journal_vault_config';
const JOURNAL_DATA_KEY = 'journal_data';

/**
 * Storage service for local data
 * Uses localStorage for now (can be upgraded to secure storage later)
 */

export async function getVaultConfig(): Promise<VaultConfig | null> {
  const stored = localStorage.getItem(VAULT_CONFIG_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as VaultConfig;
  } catch {
    return null;
  }
}

export async function saveVaultConfig(config: VaultConfig): Promise<void> {
  localStorage.setItem(VAULT_CONFIG_KEY, JSON.stringify(config));
}

export async function getLocalJournalData(): Promise<JournalData | null> {
  const stored = localStorage.getItem(JOURNAL_DATA_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as JournalData;
  } catch {
    return null;
  }
}

export async function saveLocalJournalData(data: JournalData): Promise<void> {
  localStorage.setItem(JOURNAL_DATA_KEY, JSON.stringify(data));
}

export async function clearLocalData(): Promise<void> {
  localStorage.removeItem(VAULT_CONFIG_KEY);
  localStorage.removeItem(JOURNAL_DATA_KEY);
}
