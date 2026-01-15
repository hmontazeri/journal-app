import { useState, useEffect } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { VaultConfig } from '../types';
import { useJournal } from '../hooks/useJournal';
import { syncFromCloud, deleteFromCloud } from '../services/sync';
import { formatDateForDisplay } from '../utils/date';

interface UserInfoDialogProps {
  vaultConfig: VaultConfig | null;
  onClose: () => void;
  onDeleteServerData?: () => void;
}

export function UserInfoDialog({ vaultConfig, onClose, onDeleteServerData }: UserInfoDialogProps) {
  const { journalData } = useJournal();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion('Unknown'));
  }, []);

  const handleCopyVaultId = async () => {
    if (vaultConfig?.vaultId) {
      try {
        await navigator.clipboard.writeText(vaultConfig.vaultId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDeleteServerData = async () => {
    if (!vaultConfig || !window.confirm('Are you sure you want to delete all data from the server? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await deleteFromCloud(vaultConfig.vaultId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete server data');
      }

      if (onDeleteServerData) {
        onDeleteServerData();
      }
      alert('Server data deleted successfully.');
      onClose();
    } catch (err) {
      console.error('Failed to delete server data:', err);
      alert('Failed to delete server data. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (!vaultConfig) {
    return null;
  }

  const entries = journalData ? Object.values(journalData.entries) : [];
  const totalEntries = entries.length;
  
  // Calculate date range
  const dates = entries.map(e => e.date).sort();
  const firstDate = dates[0] ? formatDateForDisplay(dates[0]) : 'N/A';
  const lastDate = dates[dates.length - 1] ? formatDateForDisplay(dates[dates.length - 1]) : 'N/A';
  
  // Calculate mood average
  const moods = entries.map(e => e.mood.scale).filter(m => m > 0);
  const avgMood = moods.length > 0 
    ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1)
    : 'N/A';

  // Total tags
  const allTags = new Set<string>();
  entries.forEach(entry => {
    entry.tags.forEach(tag => allTags.add(tag));
  });

  return (
    <>
      <div className="user-dialog-backdrop" onClick={onClose} />
      <div className="user-dialog">
        <div className="user-dialog-header">
          <h2>Account Information</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="user-dialog-content">
          <div className="info-section">
            <h3>Statistics</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-label">Total Entries</span>
                <span className="stat-value">{totalEntries}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Mood</span>
                <span className="stat-value">{avgMood}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Tags</span>
                <span className="stat-value">{allTags.size}</span>
              </div>
              <div className="stat-item full-width">
                <span className="stat-label">Date Range</span>
                <span className="stat-value-small">{firstDate} - {lastDate}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Vault Information</h3>
            <div className="vault-id-container">
              <label>Vault ID</label>
              <div className="vault-id-input-group">
                <input
                  type="text"
                  value={vaultConfig.vaultId}
                  readOnly
                  className="vault-id-input"
                />
                <button
                  onClick={handleCopyVaultId}
                  className="copy-button"
                  title="Copy vault ID"
                >
                  {copied ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="2" 
                      stroke="currentColor"
                      className="copy-icon"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="1.5" 
                      stroke="currentColor"
                      className="copy-icon"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                  )}
                </button>
              </div>
              <small>Share this ID with your other devices to sync your journal</small>
            </div>
            <div className="vault-meta">
              <div className="meta-item">
                <span className="meta-label">Created</span>
                <span className="meta-value">
                  {new Date(vaultConfig.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>About</h3>
            <div className="vault-meta">
              <div className="meta-item">
                <span className="meta-label">App Version</span>
                <span className="meta-value">{appVersion}</span>
              </div>
            </div>
          </div>

          <div className="info-section danger-section">
            <h3>Danger Zone</h3>
            <div className="danger-actions">
              <p className="danger-warning">
                Permanently delete all your journal data from the server. This will not affect your local data.
              </p>
              <button
                onClick={handleDeleteServerData}
                className="danger-button"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete All Server Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .user-dialog-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .user-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          background: var(--bg-primary);
          border-radius: 16px;
          box-shadow: 0 20px 60px var(--shadow);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .user-dialog-header h2 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--text-primary);
          margin: 0;
        }

        .close-button {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          font-size: 1.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          line-height: 1;
        }

        .close-button:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .user-dialog-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .info-section {
          margin-bottom: 2rem;
        }

        .info-section:last-child {
          margin-bottom: 0;
        }

        .info-section h3 {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          font-weight: 400;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-item.full-width {
          grid-column: 1 / -1;
        }

        .stat-label {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--text-primary);
        }

        .stat-value-small {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .vault-id-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .vault-id-container label {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .vault-id-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .vault-id-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.875rem;
          font-family: var(--font-sans);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .copy-button {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
          min-width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .copy-button:hover {
          border-color: var(--accent);
          background: var(--bg-secondary);
        }

        .copy-icon {
          width: 18px;
          height: 18px;
        }

        .vault-id-container small {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .vault-meta {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .meta-label {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .meta-value {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .danger-section {
          border-top: 2px solid rgba(197, 48, 48, 0.2);
          padding-top: 1.5rem;
        }

        .danger-section h3 {
          color: #c53030;
          border-bottom-color: rgba(197, 48, 48, 0.2);
        }

        .danger-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .danger-warning {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .danger-button {
          padding: 0.75rem 1rem;
          border: 1px solid #c53030;
          border-radius: 8px;
          background: transparent;
          color: #c53030;
          cursor: pointer;
          font-size: 0.9375rem;
          font-weight: 500;
          font-family: var(--font-sans);
          transition: all 0.2s;
        }

        .danger-button:hover:not(:disabled) {
          background: rgba(197, 48, 48, 0.1);
        }

        .danger-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
