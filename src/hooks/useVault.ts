import { useState, useEffect } from 'react';
import { VaultConfig } from '../types';
import { getVaultConfig, saveVaultConfig, clearLocalData } from '../services/storage';
import { generateUUID } from '../utils/encryption';

export function useVault() {
  const [vaultConfig, setVaultConfig] = useState<VaultConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    loadVaultConfig();
  }, []);

  const loadVaultConfig = async () => {
    try {
      const config = await getVaultConfig();
      setVaultConfig(config);
      // If no vault exists, user needs to create one
      if (!config) {
        setIsUnlocked(false);
      }
    } catch (error) {
      console.error('Failed to load vault config:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVault = async (): Promise<VaultConfig> => {
    const newConfig: VaultConfig = {
      vaultId: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    await saveVaultConfig(newConfig);
    setVaultConfig(newConfig);
    return newConfig;
  };

  const setupExistingVault = async (vaultId: string): Promise<void> => {
    const config: VaultConfig = {
      vaultId,
      createdAt: new Date().toISOString(), // We don't know the real creation date
    };
    await saveVaultConfig(config);
    setVaultConfig(config);
  };

  const unlock = () => {
    setIsUnlocked(true);
  };

  const lock = () => {
    setIsUnlocked(false);
  };

  const resetVault = async () => {
    await clearLocalData();
    setVaultConfig(null);
    setIsUnlocked(false);
  };

  return {
    vaultConfig,
    loading,
    isUnlocked,
    createVault,
    setupExistingVault,
    unlock,
    lock,
    resetVault,
    reload: loadVaultConfig,
  };
}
