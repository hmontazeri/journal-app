import { useState } from 'react';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('user_api_key') || import.meta.env.VITE_API_KEY || '';
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('user_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Reload the page to pick up the new API key
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleClear = () => {
    localStorage.removeItem('user_api_key');
    setApiKey('');
  };

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
              Enter your Cloudflare Worker API key to enable cloud sync.
            </p>

            <div className="form-group">
              <label htmlFor="apiKey">API Key</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
              <small>
                Don't have an API key? 
                <a 
                  href="https://github.com/hmontazeri/journal-app/blob/main/cloudflare-worker/SECURITY_SETUP.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {' '}Setup instructions
                </a>
              </small>
            </div>

            <div className="button-group">
              <button className="primary-button" onClick={handleSave}>
                {saved ? '✓ Saved!' : 'Save API Key'}
              </button>
              {apiKey && (
                <button className="secondary-button" onClick={handleClear}>
                  Clear API Key
                </button>
              )}
            </div>

            {!apiKey && (
              <div className="info-box">
                <strong>Note:</strong> Without an API key, the app will work in offline-only mode. 
                Your journal entries will be stored locally but won't sync to the cloud.
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
      `}</style>
    </div>
  );
}
