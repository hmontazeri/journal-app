import { useState, useEffect } from 'react';
import { getVaultConfig, saveVaultConfig } from '../services/storage';
import { VaultConfig } from '../types';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [backendUrl, setBackendUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const config = await getVaultConfig();
      if (config) {
        setBackendUrl(config.backendUrl || '');
        setApiKey(config.apiKey || '');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');

    // Validate only if user is enabling cloud sync
    if (backendUrl.trim() || apiKey.trim()) {
      if (!backendUrl.trim()) {
        setError('Backend URL is required when using cloud sync');
        return;
      }

      try {
        new URL(backendUrl);
      } catch {
        setError('Invalid URL format');
        return;
      }

      if (!apiKey.trim()) {
        setError('API Key is required when using cloud sync');
        return;
      }
    }

    try {
      const config = await getVaultConfig();
      if (!config) {
        setError('No vault configuration found');
        return;
      }

      const updatedConfig: VaultConfig = {
        ...config,
        // Remove backend config if both fields are empty (disable cloud sync)
        ...(backendUrl.trim() && apiKey.trim() 
          ? { backendUrl, apiKey }
          : { backendUrl: undefined, apiKey: undefined }
        ),
      };

      await saveVaultConfig(updatedConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      // Reload the page to pick up the new configuration
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Save error:', err);
    }
  };

  if (loading) {
    return (
      <div className="settings-overlay">
        <div className="settings-dialog">
          <div className="settings-content">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-overlay">
      <div className="settings-dialog">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h3>Cloud Sync Configuration</h3>
            <p className="setting-description">
              {backendUrl && apiKey 
                ? 'Cloud sync is enabled. Your journal syncs across devices.'
                : 'Cloud sync is disabled. Your journal is stored locally only.'
              }
            </p>

            <div className="form-group">
              <label htmlFor="backendUrl">Backend URL (Optional)</label>
              <input
                id="backendUrl"
                type="url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://your-worker.workers.dev"
              />
              <small>Your Cloudflare Worker URL</small>
            </div>

            <div className="form-group">
              <label htmlFor="apiKey">API Key (Optional)</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
              <small>
                From your Cloudflare Worker dashboard.{' '}
                <a 
                  href="https://github.com/hmontazeri/journal-app/blob/main/cloudflare-worker/SECURITY_SETUP.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Setup instructions
                </a>
              </small>
            </div>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            <div className="button-group">
              <button className="primary-button" onClick={handleSave}>
                {saved ? '✓ Saved!' : backendUrl && apiKey ? 'Update Settings' : 'Enable Cloud Sync'}
              </button>
              {backendUrl && apiKey && (
                <button 
                  className="secondary-button" 
                  onClick={() => {
                    setBackendUrl('');
                    setApiKey('');
                  }}
                >
                  Disable Cloud Sync
                </button>
              )}
            </div>

            {!backendUrl || !apiKey ? (
              <div className="info-box">
                <strong>Local Only Mode:</strong> Your journal is stored only on this device. 
                Enable cloud sync to access your entries across multiple devices.
              </div>
            ) : (
              <div className="warning-box">
                <strong>Note:</strong> Changing these settings will require restarting the app to take effect.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .settings-dialog {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px var(--shadow);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .settings-header h2 {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--text-primary);
        }

        .close-button {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .settings-content {
          padding: 1.5rem;
        }

        .setting-section {
          margin-bottom: 2rem;
        }

        .setting-section h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .setting-description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.9375rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--border);
          border-radius: 8px;
          font-size: 1rem;
          font-family: var(--font-sans);
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .form-group small {
          display: block;
          margin-top: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .form-group small a {
          color: var(--accent);
          text-decoration: none;
        }

        .form-group small a:hover {
          text-decoration: underline;
        }

        .button-group {
          display: flex;
          gap: 1rem;
        }

        .primary-button {
          flex: 1;
          padding: 0.875rem;
          background: var(--accent);
          color: var(--bg-primary);
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .primary-button:hover {
          opacity: 0.9;
        }

        .secondary-button {
          padding: 0.875rem 1.5rem;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-button:hover {
          color: var(--text-primary);
          border-color: var(--accent);
          background: var(--bg-secondary);
        }

        .info-box {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(var(--accent-rgb), 0.1);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          border-radius: 8px;
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .info-box strong {
          color: var(--accent);
        }

        .error-box {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.3);
          border-radius: 8px;
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .warning-box {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 149, 0, 0.1);
          border: 1px solid rgba(255, 149, 0, 0.3);
          border-radius: 8px;
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .warning-box strong {
          color: #ff9500;
        }
      `}</style>
    </div>
  );
}
