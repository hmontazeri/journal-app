import { useEffect } from 'react';
import { JournalData } from '../types';
import { formatDateForDisplay, formatDateString, parseDateString, getTodayDateString, isToday } from '../utils/date';

interface HistoryOverlayProps {
  journalData: JournalData | null;
  currentDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export function HistoryOverlay({ journalData, currentDate, onDateSelect, onClose }: HistoryOverlayProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!journalData) {
    return null;
  }

  // Get all entry dates, sorted by date (newest first)
  const entryDates = Object.keys(journalData.entries)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Group entries by month
  const entriesByMonth: Record<string, string[]> = {};
  entryDates.forEach(date => {
    const dateObj = parseDateString(date);
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    if (!entriesByMonth[monthKey]) {
      entriesByMonth[monthKey] = [];
    }
    entriesByMonth[monthKey].push(date);
  });

  // Format month label
  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleDateClick = (date: string) => {
    onDateSelect(date);
    onClose();
  };

  return (
    <>
      <div className="history-overlay-backdrop" onClick={onClose} />
      <div className="history-overlay">
        <div className="history-overlay-header">
          <h2>Journal History</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="history-overlay-content">
          {entryDates.length === 0 ? (
            <div className="empty-history">
              <p>No journal entries yet</p>
              <p className="empty-hint">Start writing to see your history here</p>
            </div>
          ) : (
            <div className="history-months">
              {Object.entries(entriesByMonth)
                .sort((a, b) => b[0].localeCompare(a[0])) // Sort months newest first
                .map(([monthKey, dates]) => (
                  <div key={monthKey} className="history-month">
                    <h3 className="month-label">{formatMonthLabel(monthKey)}</h3>
                    <div className="month-dates">
                      {dates.map(date => {
                        const entry = journalData.entries[date];
                        const isCurrent = date === currentDate;
                        const isTodayDate = isToday(date);
                        return (
                          <button
                            key={date}
                            className={`date-item ${isCurrent ? 'active' : ''} ${isTodayDate ? 'today' : ''}`}
                            onClick={() => handleDateClick(date)}
                          >
                            <div className="date-item-main">
                              <span className="date-item-day">
                                {parseDateString(date).getDate()}
                              </span>
                              <span className="date-item-weekday">
                                {parseDateString(date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                            </div>
                            {entry.title && (
                              <div className="date-item-title" title={entry.title}>
                                {entry.title}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .history-overlay-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .history-overlay {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          background: var(--bg-primary);
          border-radius: 16px;
          box-shadow: 0 20px 60px var(--shadow);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .history-overlay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .history-overlay-header h2 {
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

        .history-overlay-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .empty-history {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }

        .empty-history p {
          font-family: var(--font-sans);
          margin: 0.5rem 0;
        }

        .empty-hint {
          font-size: 0.875rem;
          font-style: italic;
        }

        .history-months {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .history-month {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .month-label {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          font-weight: 400;
          color: var(--text-primary);
          margin: 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .month-dates {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.75rem;
        }

        .date-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 0.5rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          min-height: 80px;
        }

        .date-item:hover {
          border-color: var(--accent);
          background: var(--bg-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px var(--shadow);
        }

        .date-item.active {
          border-color: var(--accent);
          background: rgba(212, 165, 116, 0.1);
        }

        .date-item.today {
          border-color: var(--accent);
          background: rgba(212, 165, 116, 0.15);
        }

        .date-item.today.active {
          border-color: var(--accent);
          background: rgba(212, 165, 116, 0.2);
        }

        .date-item-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .date-item-day {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 400;
          color: var(--text-primary);
        }

        .date-item-weekday {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .date-item-title {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
      `}</style>
    </>
  );
}
