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

  const createVault = async (backendUrl?: string, apiKey?: string): Promise<VaultConfig> => {
    const newConfig: VaultConfig = {
      vaultId: generateUUID(),
      createdAt: new Date().toISOString(),
      ...(backendUrl && apiKey ? { backendUrl, apiKey } : {}),
    };
    await saveVaultConfig(newConfig);
    setVaultConfig(newConfig);
    
    // Clear temporary storage
    localStorage.removeItem('temp_backend_url');
    localStorage.removeItem('temp_api_key');
    
    return newConfig;
  };

  const setupExistingVault = async (vaultId: string, backendUrl?: string, apiKey?: string): Promise<void> => {
    const config: VaultConfig = {
      vaultId,
      createdAt: new Date().toISOString(), // We don't know the real creation date
      ...(backendUrl && apiKey ? { backendUrl, apiKey } : {}),
    };
    await saveVaultConfig(config);
    setVaultConfig(config);
    
    // Clear temporary storage
    localStorage.removeItem('temp_backend_url');
    localStorage.removeItem('temp_api_key');
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
