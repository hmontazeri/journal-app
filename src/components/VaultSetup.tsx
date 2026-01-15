import { useState } from 'react';
import { useVault } from '../hooks/useVault';

interface VaultSetupProps {
  onComplete: (vaultId: string, password: string) => void;
}

export function VaultSetup({ onComplete }: VaultSetupProps) {
  const { createVault, setupExistingVault } = useVault();
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vaultId, setVaultId] = useState('');
  const [error, setError] = useState('');

  const handleCreateVault = async () => {
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('Creating vault...');
      const config = await createVault();
      console.log('Vault created:', config);
      console.log('Calling onComplete...');
      onComplete(config.vaultId, password);
      console.log('onComplete called');
    } catch (err) {
      setError('Failed to create vault. Please try again.');
      console.error('Vault creation error:', err);
    }
  };

  const handleSetupExisting = async () => {
    setError('');

    if (!vaultId.trim()) {
      setError('Please enter a vault ID');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await setupExistingVault(vaultId.trim());
      onComplete(vaultId.trim(), password);
    } catch (err) {
      setError('Failed to setup vault. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="vault-setup">
      <div className="setup-container">
        <h1>Welcome to Journal</h1>
        <p className="subtitle">Create a secure vault to store your journal entries</p>

        <div className="mode-toggle">
          <button
            className={mode === 'new' ? 'active' : ''}
            onClick={() => setMode('new')}
          >
            New Vault
          </button>
          <button
            className={mode === 'existing' ? 'active' : ''}
            onClick={() => setMode('existing')}
          >
            Existing Vault
          </button>
        </div>

        {mode === 'new' ? (
          <div className="setup-form">
            <div className="form-group">
              <label htmlFor="password">Create Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button onClick={handleCreateVault} className="primary-button">
              Create Vault
            </button>
          </div>
        ) : (
          <div className="setup-form">
            <div className="form-group">
              <label htmlFor="vaultId">Vault ID</label>
              <input
                id="vaultId"
                type="text"
                value={vaultId}
                onChange={(e) => setVaultId(e.target.value)}
                placeholder="Enter your vault ID"
                autoFocus
              />
              <small>Get this from your other device</small>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button onClick={handleSetupExisting} className="primary-button">
              Connect to Vault
            </button>
          </div>
        )}
      </div>

      <style>{`
        .vault-setup {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 2rem;
        }

        .setup-container {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 3rem;
          max-width: 500px;
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
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .mode-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: var(--bg-secondary);
          padding: 0.25rem;
          border-radius: 8px;
        }

        .mode-toggle button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .mode-toggle button.active {
          background: var(--bg-primary);
          box-shadow: 0 1px 3px var(--shadow);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
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
          margin-top: 0.25rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
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

        .error {
          background: rgba(197, 48, 48, 0.1);
          color: #c53030;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          border: 1px solid rgba(197, 48, 48, 0.2);
        }
      `}</style>
    </div>
  );
}
