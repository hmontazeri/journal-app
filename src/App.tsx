import { useState, useEffect, useCallback } from 'react';
import { useVault } from './hooks/useVault';
import { useJournal } from './hooks/useJournal';
import { VaultSetup } from './components/VaultSetup';
import { PasswordUnlock } from './components/PasswordUnlock';
import { JournalEntryComponent } from './components/JournalEntry';
import { DateNavigation } from './components/DateNavigation';
import { InsightsView } from './components/Stats/InsightsView';
import { HistoryOverlay } from './components/HistoryOverlay';
import { syncToCloud, syncFromCloud } from './services/sync';
import { encrypt, decrypt } from './utils/encryption';
import { getLocalJournalData, saveLocalJournalData } from './services/storage';
import { JournalData } from './types';
import './App.css';

function App() {
  const { vaultConfig, loading: vaultLoading, isUnlocked, unlock, reload: reloadVault } = useVault();
  const { journalData, currentDate, setCurrentDate, getCurrentEntry, getEntry, saveEntry, loading: journalLoading, reload } = useJournal();
  const [password, setPassword] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [view, setView] = useState<'journal' | 'insights'>('journal');
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);

  // Check if vault exists and is unlocked
  const needsVaultSetup = !vaultConfig && !vaultLoading;
  const needsUnlock = vaultConfig && !isUnlocked && !vaultLoading;

  // Handle vault setup completion
  const handleVaultSetup = async (vaultId: string, userPassword: string) => {
    console.log('handleVaultSetup called with vaultId:', vaultId);
    setPassword(userPassword);
    // Reload vault config to pick up the newly created vault
    await reloadVault();
    unlock();
    console.log('Unlocked, reloading journal data...');
    // Reload journal data after vault is created
    await reload();
    console.log('Journal data reloaded');
  };

  // Handle password unlock
  const handleUnlock = async (userPassword: string) => {
    setUnlockError('');
    setPassword(userPassword);
    unlock();
    
    // Try to sync from cloud
    if (vaultConfig) {
      await syncJournalData(userPassword, true);
    }
  };

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync journal data to/from cloud
  const syncJournalData = useCallback(async (userPassword: string, fromCloud = false) => {
    if (!vaultConfig || !journalData) return;
    if (!navigator.onLine) {
      setSyncError('Offline - changes will sync when online');
      return;
    }

    setSyncError(null);
    try {
      if (fromCloud) {
        // Sync from cloud
        const response = await syncFromCloud(vaultConfig.vaultId);
        if (response.success && response.data) {
          try {
            const decrypted = await decrypt(response.data, userPassword);
            const cloudData: JournalData = JSON.parse(decrypted);
            
            // Merge with local data (newer wins)
            const localData = await getLocalJournalData();
            if (localData) {
              const mergedEntries = { ...cloudData.entries };
              Object.keys(localData.entries).forEach((date) => {
                const localEntry = localData.entries[date];
                const cloudEntry = cloudData.entries[date];
                
                if (!cloudEntry || new Date(localEntry.updatedAt) > new Date(cloudEntry.updatedAt)) {
                  mergedEntries[date] = localEntry;
                }
              });
              
              const mergedData: JournalData = {
                entries: mergedEntries,
                metadata: {
                  ...cloudData.metadata,
                  lastSync: new Date().toISOString(),
                },
              };
              
              await saveLocalJournalData(mergedData);
              reload();
              setSyncError(null); // Clear any previous errors
            } else {
              await saveLocalJournalData(cloudData);
              reload();
              setSyncError(null); // Clear any previous errors
            }
          } catch (error) {
            console.error('Failed to decrypt cloud data:', error);
            setUnlockError('Failed to decrypt data. Wrong password?');
            unlock(); // Lock again
          }
        } else {
          setSyncError(null); // Clear errors if no data to sync
        }
      } else {
        // Sync to cloud
        const encrypted = await encrypt(JSON.stringify(journalData), userPassword);
        const response = await syncToCloud(vaultConfig.vaultId, encrypted);
        if (response.success) {
          console.log('Synced to cloud successfully');
          setSyncError(null); // Clear any previous errors
        } else {
          setSyncError('Sync failed - please try again');
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError('Sync failed - please try again');
    }
  }, [vaultConfig, journalData, reload, unlock]);

  // Don't auto-sync on every change - only sync on explicit user actions
  // This is handled in the JournalEntry component

  // Show loading state
  if (vaultLoading || journalLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show vault setup
  if (needsVaultSetup) {
    return <VaultSetup onComplete={handleVaultSetup} />;
  }

  // Show password unlock
  if (needsUnlock) {
    return <PasswordUnlock onUnlock={handleUnlock} error={unlockError} />;
  }

  // Show journal entry
  const currentEntry = getCurrentEntry();
  const hasEntry = (date: string) => {
    return journalData?.entries[date] !== undefined;
  };

  return (
    <div className="app">
      {(syncError || isOffline) && (
        <div className={`sync-status ${isOffline ? 'offline' : 'error'}`}>
          {isOffline ? 'Offline - changes will sync when online' : syncError}
        </div>
      )}
      
      <div className="sidebar">
        <DateNavigation
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          hasEntry={hasEntry}
          onDateClick={() => setShowHistoryOverlay(true)}
        />
      </div>

      <main className="main-content">
        <div className="view-toggle">
          <button
            className={view === 'journal' ? 'active' : ''}
            onClick={() => setView('journal')}
          >
            Journal
          </button>
          <button
            className={view === 'insights' ? 'active' : ''}
            onClick={() => setView('insights')}
          >
            Insights
          </button>
        </div>

        {view === 'journal' ? (
          <JournalEntryComponent
            entry={currentEntry}
            onSave={saveEntry}
            onSync={() => password && syncJournalData(password)}
          />
        ) : (
          <InsightsView />
          )}
        </main>

        {showHistoryOverlay && (
          <HistoryOverlay
            journalData={journalData}
            currentDate={currentDate}
            onDateSelect={setCurrentDate}
            onClose={() => setShowHistoryOverlay(false)}
          />
        )}
      </div>
    );
  }

export default App;
