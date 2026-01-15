import { useState } from 'react';

interface PasswordUnlockProps {
  onUnlock: (password: string) => Promise<void>;
  onResetVault?: () => void;
  error?: string;
}

export function PasswordUnlock({ onUnlock, onResetVault, error }: PasswordUnlockProps) {
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && !isUnlocking) {
      setIsUnlocking(true);
      try {
        await onUnlock(password);
      } finally {
        setIsUnlocking(false);
      }
    }
  };

  return (
    <div className="password-unlock">
      <div className="unlock-container">
        <h1>Journal</h1>
        <p className="subtitle">Enter your password to unlock</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="primary-button" disabled={isUnlocking}>
            {isUnlocking ? 'Loading your journal...' : 'Unlock'}
          </button>
        </form>

        {onResetVault && (
          <div className="vault-actions">
            <button 
              type="button" 
              className="secondary-button"
              onClick={onResetVault}
            >
              Change Vault
            </button>
          </div>
        )}
      </div>

      <style>{`
        .password-unlock {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .unlock-container {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 3rem;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px var(--shadow);
        }

        h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 400;
          font-family: var(--font-serif);
          letter-spacing: -0.02em;
          color: var(--text-primary);
          text-align: center;
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          text-align: center;
        }

        .form-group {
          margin-bottom: 1.5rem;
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

        .primary-button {
          width: 100%;
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

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          background: rgba(197, 48, 48, 0.1);
          color: #c53030;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          border: 1px solid rgba(197, 48, 48, 0.2);
        }

        .vault-actions {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .secondary-button {
          width: 100%;
          padding: 0.875rem;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.9375rem;
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
      `}</style>
    </div>
  );
}
