import { formatDateForDisplay, formatDateForSidebar, getTodayDateString, isToday, parseDateString, formatDateString } from '../utils/date';

interface DateNavigationProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  hasEntry: (date: string) => boolean;
  onDateClick?: () => void;
  onSignOut?: () => void;
  onUserInfo?: () => void;
}

export function DateNavigation({ currentDate, onDateChange, hasEntry, onDateClick, onSignOut, onUserInfo }: DateNavigationProps) {
  const goToPreviousDay = () => {
    const targetDate = parseDateString(currentDate);
    targetDate.setDate(targetDate.getDate() - 1);
    onDateChange(formatDateString(targetDate));
  };

  const goToNextDay = () => {
    const targetDate = parseDateString(currentDate);
    targetDate.setDate(targetDate.getDate() + 1);
    onDateChange(formatDateString(targetDate));
  };

  const goToToday = () => {
    onDateChange(getTodayDateString());
  };

  return (
    <div className="date-navigation">
      <div className="nav-controls">
        <button onClick={goToPreviousDay} className="nav-button" title="Previous day">
          ↑
        </button>
        <div className="date-display">
          <button 
            onClick={onDateClick || goToToday} 
            className="date-button" 
            title={onDateClick ? "Open date history" : "Go to today"}
          >
            <div className="date-text">{formatDateForSidebar(currentDate)}</div>
            {hasEntry(currentDate) && <span className="entry-indicator">●</span>}
          </button>
        </div>
        <button 
          onClick={goToNextDay} 
          className="nav-button"
          disabled={isToday(currentDate)}
          title={isToday(currentDate) ? "Already on today" : "Next day"}
        >
          ↓
        </button>
      </div>

      {(onUserInfo || onSignOut) && (
        <div className="sidebar-footer">
          {onUserInfo && (
            <button 
              onClick={onUserInfo} 
              className="user-button"
              title="Account information"
            >
              <svg 
                className="user-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}
          {onSignOut && (
            <button 
              onClick={onSignOut} 
              className="sign-out-button"
              title="Sign out / Change vault"
            >
              <svg 
                className="sign-out-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      )}

      <style>{`
        .date-navigation {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 0;
          background: var(--bg-primary);
        }

        .nav-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
          justify-content: center;
        }

        .nav-button {
          width: 36px;
          height: 36px;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          border-radius: 50%;
          cursor: pointer;
          font-weight: 300;
          font-family: var(--font-sans);
          font-size: 1.25rem;
          color: var(--text-secondary);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .nav-button:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--bg-secondary);
        }

        .nav-button:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .date-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .date-button {
          padding: 0.5rem;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 400;
          font-family: var(--font-serif);
          letter-spacing: -0.01em;
          color: var(--text-primary);
          text-align: center;
          line-height: 1.4;
          transition: color 0.2s;
        }

        .date-button:hover {
          color: var(--accent);
        }

        .date-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          white-space: nowrap;
        }

        .entry-indicator {
          color: var(--accent);
          font-size: 0.5rem;
          display: block;
          margin-top: 0.25rem;
        }

        .sidebar-footer {
          width: 100%;
          padding: 1rem 0;
          border-top: 1px solid var(--border);
          margin-top: auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
        }

        .user-button,
        .sign-out-button {
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid var(--border);
          background: var(--bg-primary);
          border-radius: 50%;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-button:hover,
        .sign-out-button:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--bg-secondary);
        }

        .user-icon,
        .sign-out-icon {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
}
