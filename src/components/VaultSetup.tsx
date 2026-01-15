import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { syncFromCloud } from '../services/sync';
import { decrypt } from '../utils/encryption';

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
  const [verifying, setVerifying] = useState(false);
  const [vaultVerified, setVaultVerified] = useState(false);
  const [checkingVault, setCheckingVault] = useState(false);

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

  // Step 1: Check if vault exists
  const handleCheckVault = async () => {
    setError('');
    setCheckingVault(true);

    if (!vaultId.trim()) {
      setError('Please enter a vault ID');
      setCheckingVault(false);
      return;
    }

    if (!navigator.onLine) {
      setError('You are offline. Please check your connection and try again.');
      setCheckingVault(false);
      return;
    }

    try {
      // Check if vault exists in R2
      const response = await syncFromCloud(vaultId.trim());
      
      if (!response.success) {
        // Check if it's an authentication error
        if (response.error?.includes('Unauthorized') || response.error?.includes('Invalid or missing API key')) {
          setError('API key not configured. Please check the setup documentation.');
          console.error('API key error:', response.error);
        } else if (response.error?.includes('Rate limit')) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          setError('Failed to check vault. Please check your connection and try again.');
          console.error('Sync error:', response.error);
        }
        setCheckingVault(false);
        return;
      }

      if (response.data === null) {
        // Vault doesn't exist OR vault is empty (new vault)
        // This is actually okay - they might be connecting to a vault that hasn't synced yet
        // Let them proceed to password entry
        console.log('No cloud data found for vault, proceeding to password verification');
        setVaultVerified(true);
        setCheckingVault(false);
        return;
      }

      // Vault exists with data - proceed to password verification
      console.log('Vault found in cloud, proceeding to password verification');
      setVaultVerified(true);
      setCheckingVault(false);
    } catch (err) {
      setError('Failed to check vault. Please try again.');
      console.error('Vault check error:', err);
      setCheckingVault(false);
    }
  };

  // Step 2: Verify password and complete setup
  const handleVerifyPassword = async () => {
    setError('');
    setVerifying(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setVerifying(false);
      return;
    }

    if (!navigator.onLine) {
      setError('You are offline. Please check your connection and try again.');
      setVerifying(false);
      return;
    }

    try {
      // Fetch encrypted data to verify password
      const response = await syncFromCloud(vaultId.trim());
      
      if (!response.success || !response.data) {
        setError('Failed to verify password. Please try again.');
        setVerifying(false);
        return;
      }

      // Try to decrypt with the provided password
      try {
        await decrypt(response.data, password);
        // Password is correct - set up the vault
        await setupExistingVault(vaultId.trim());
        onComplete(vaultId.trim(), password);
      } catch (decryptError) {
        // Password is incorrect
        setError('Incorrect password. Please try again.');
        setVerifying(false);
      }
    } catch (err) {
      setError('Failed to verify password. Please try again.');
      console.error(err);
      setVerifying(false);
    }
  };

  // Reset to vault ID entry
  const handleBackToVaultId = () => {
    setVaultVerified(false);
    setPassword('');
    setError('');
  };

  return (
    <div className="vault-setup">
      <div className="setup-container">
        <h1>Welcome to Journal</h1>
        <p className="subtitle">Create a secure vault to store your journal entries</p>

        <div className="mode-toggle">
          <button
            className={mode === 'new' ? 'active' : ''}
            onClick={() => {
              setMode('new');
              setVaultVerified(false);
              setVaultId('');
              setPassword('');
              setConfirmPassword('');
              setError('');
            }}
          >
            New Vault
          </button>
          <button
            className={mode === 'existing' ? 'active' : ''}
            onClick={() => {
              setMode('existing');
              setVaultVerified(false);
              setVaultId('');
              setPassword('');
              setConfirmPassword('');
              setError('');
            }}
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
            {!vaultVerified ? (
              // Step 1: Check if vault exists
              <>
                <div className="form-group">
                  <label htmlFor="vaultId">Vault ID</label>
                  <input
                    id="vaultId"
                    type="text"
                    value={vaultId}
                    onChange={(e) => setVaultId(e.target.value)}
                    placeholder="Enter your vault ID"
                    autoFocus
                    disabled={checkingVault}
                  />
                  <small>Get this from your other device</small>
                </div>
                {error && <div className="error">{error}</div>}
                <button 
                  onClick={handleCheckVault} 
                  className="primary-button"
                  disabled={checkingVault}
                >
                  {checkingVault ? 'Checking...' : 'Check Vault'}
                </button>
              </>
            ) : (
              // Step 2: Verify password
              <>
                <div className="verification-success">
                  <div className="success-icon">✓</div>
                  <p>Vault found! Please enter your password to continue.</p>
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    disabled={verifying}
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div className="button-group">
                  <button 
                    type="button"
                    onClick={handleBackToVaultId} 
                    className="secondary-button"
                    disabled={verifying}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleVerifyPassword} 
                    className="primary-button"
                    disabled={verifying}
                  >
                    {verifying ? 'Verifying...' : 'Connect to Vault'}
                  </button>
                </div>
              </>
            )}
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

        .verification-success {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(212, 165, 116, 0.1);
          border: 1px solid var(--accent);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .success-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .verification-success p {
          margin: 0;
          color: var(--text-primary);
          font-size: 0.9375rem;
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
        }

        .button-group .primary-button {
          flex: 1;
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

        .secondary-button:hover:not(:disabled) {
          color: var(--text-primary);
          border-color: var(--accent);
          background: var(--bg-secondary);
        }

        .secondary-button:disabled,
        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
