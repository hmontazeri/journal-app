import { useJournal } from '../../hooks/useJournal';
import { formatDateForDisplay } from '../../utils/date';

export function InsightsView() {
  const { journalData } = useJournal();

  if (!journalData) {
    return <div>No data available</div>;
  }

  const entries = Object.values(journalData.entries);
  const totalEntries = entries.length;
  
  // Calculate mood statistics
  const moods = entries.map(e => e.mood.scale).filter(m => m > 0);
  const avgMood = moods.length > 0 
    ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1)
    : 'N/A';
  const moodDistribution = Array.from({ length: 10 }, (_, i) => {
    const count = moods.filter(m => m === i + 1).length;
    return { scale: i + 1, count, percentage: moods.length > 0 ? (count / moods.length) * 100 : 0 };
  });

  // Most common tags
  const tagCounts: Record<string, number> = {};
  entries.forEach(entry => {
    entry.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Energy patterns
  const energyDrainedCount = entries.filter(e => e.energyDrained && e.energyDrained.trim()).length;
  const energyGainedCount = entries.filter(e => e.energyGained && e.energyGained.trim()).length;

  // Recent entries
  const recentEntries = entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Date range
  const dates = entries.map(e => e.date).sort();
  const firstDate = dates[0] ? formatDateForDisplay(dates[0]) : 'N/A';
  const lastDate = dates[dates.length - 1] ? formatDateForDisplay(dates[dates.length - 1]) : 'N/A';

  return (
    <div className="insights-view">
      <h1 className="insights-title">Journal Insights</h1>

      <div className="insights-grid">
        <div className="insight-card">
          <h2>Overview</h2>
          <div className="stat-item">
            <span className="stat-label">Total Entries</span>
            <span className="stat-value">{totalEntries}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Date Range</span>
            <span className="stat-value-small">{firstDate} - {lastDate}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Mood</span>
            <span className="stat-value">{avgMood}/10</span>
          </div>
        </div>

        <div className="insight-card">
          <h2>Mood Distribution</h2>
          <div className="mood-bars">
            {moodDistribution.map(({ scale, count, percentage }) => (
              <div key={scale} className="mood-bar-item">
                <div className="mood-bar-label">{scale}</div>
                <div className="mood-bar-container">
                  <div 
                    className="mood-bar" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mood-bar-count">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <h2>Top Tags</h2>
          {topTags.length > 0 ? (
            <div className="tags-list">
              {topTags.map(([tag, count]) => (
                <div key={tag} className="tag-stat">
                  <span className="tag-name">{tag}</span>
                  <span className="tag-count">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No tags yet</p>
          )}
        </div>

        <div className="insight-card">
          <h2>Energy Tracking</h2>
          <div className="stat-item">
            <span className="stat-label">Entries with energy drained</span>
            <span className="stat-value">{energyDrainedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Entries with energy gained</span>
            <span className="stat-value">{energyGainedCount}</span>
          </div>
        </div>

        <div className="insight-card full-width">
          <h2>Recent Entries</h2>
          <div className="recent-entries">
            {recentEntries.map(entry => (
              <div key={entry.id} className="recent-entry">
                <div className="recent-entry-date">{formatDateForDisplay(entry.date)}</div>
                <div className="recent-entry-title">{entry.title || 'Untitled'}</div>
                <div className="recent-entry-mood">Mood: {entry.mood.scale}/10</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .insights-view {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem;
          background: var(--bg-primary);
          box-sizing: border-box;
        }

        .insights-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 400;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .insight-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .insight-card.full-width {
          grid-column: 1 / -1;
        }

        .insight-card h2 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 400;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
        }

        .stat-item:last-child {
          border-bottom: none;
        }

        .stat-label {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
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
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .mood-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mood-bar-item {
          display: grid;
          grid-template-columns: 30px 1fr 40px;
          align-items: center;
          gap: 0.75rem;
        }

        .mood-bar-label {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .mood-bar-container {
          height: 20px;
          background: var(--bg-primary);
          border-radius: 10px;
          overflow: hidden;
        }

        .mood-bar {
          height: 100%;
          background: var(--accent);
          transition: width 0.3s;
        }

        .mood-bar-count {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-align: right;
        }

        .tags-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tag-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: var(--bg-primary);
          border-radius: 6px;
        }

        .tag-name {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .tag-count {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .empty-state {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          color: var(--text-secondary);
          font-style: italic;
        }

        .recent-entries {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recent-entry {
          padding: 1rem;
          background: var(--bg-primary);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .recent-entry-date {
          font-family: var(--font-serif);
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .recent-entry-title {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .recent-entry-mood {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
