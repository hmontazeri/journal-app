import { formatDateForDisplay, formatDateForSidebar, getTodayDateString, isToday, parseDateString, formatDateString } from '../utils/date';

interface DateNavigationProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  hasEntry: (date: string) => boolean;
  onDateClick?: () => void;
}

export function DateNavigation({ currentDate, onDateChange, hasEntry, onDateClick }: DateNavigationProps) {
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

      <style>{`
        .date-navigation {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          padding: 1.5rem 0;
          background: var(--bg-primary);
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
      `}</style>
    </div>
  );
}
