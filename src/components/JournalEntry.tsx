import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { JournalEntry } from '../types';
import { formatDateForDisplay } from '../utils/date';

interface JournalEntryProps {
  entry: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  onSync?: () => void;
}

const MOOD_SCALES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function JournalEntryComponent({ entry, onSave, onSync }: JournalEntryProps) {
  const [title, setTitle] = useState(entry.title);
  const [tags, setTags] = useState<string[]>(entry.tags);
  const [tagInput, setTagInput] = useState('');
  const [moodScale, setMoodScale] = useState(entry.mood.scale);
  const [energyDrained, setEnergyDrained] = useState(entry.energyDrained || '');
  const [energyGained, setEnergyGained] = useState(entry.energyGained || '');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your thoughts...',
      }),
    ],
    content: entry.content,
    onUpdate: ({ editor }) => {
      // Auto-save on content change (debounced) - sync on text input
      handleSave({
        ...entry,
        title,
        content: editor.getHTML(),
        tags,
        mood: { scale: moodScale },
        energyDrained,
        energyGained,
      }, true); // Sync on text input
    },
  });

  // Debounced save function - only syncs on user input
  const handleSave = useCallback(
    (updatedEntry: JournalEntry, shouldSync = false) => {
      const timeoutId = setTimeout(() => {
        onSave(updatedEntry);
        setLastSaved(new Date());
        // Only sync when explicitly requested (user typing, tags, etc.)
        if (shouldSync && onSync) {
          onSync();
        }
      }, 2000); // 2 second debounce

      return () => clearTimeout(timeoutId);
    },
    [onSave, onSync]
  );

  useEffect(() => {
    if (editor && entry.content !== editor.getHTML()) {
      editor.commands.setContent(entry.content);
    }
    setTitle(entry.title);
    setTags(entry.tags);
    setMoodScale(entry.mood.scale);
    setEnergyDrained(entry.energyDrained || '');
    setEnergyGained(entry.energyGained || '');
  }, [entry.id, editor]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    handleSave({
      ...entry,
      title: newTitle,
      content: editor?.getHTML() || '',
      tags,
      mood: { scale: moodScale },
      energyDrained,
      energyGained,
    }, true); // Sync on title change
  };

  const handleMoodScaleChange = (scale: number) => {
    setMoodScale(scale);
    handleSave({
      ...entry,
      title,
      content: editor?.getHTML() || '',
      tags,
      mood: { scale },
      energyDrained,
      energyGained,
    }, true); // Sync on mood change
  };

  const handleEnergyDrainedChange = (value: string) => {
    setEnergyDrained(value);
    handleSave({
      ...entry,
      title,
      content: editor?.getHTML() || '',
      tags,
      mood: { scale: moodScale },
      energyDrained: value,
      energyGained,
    }, true); // Sync on energy field change
  };

  const handleEnergyGainedChange = (value: string) => {
    setEnergyGained(value);
    handleSave({
      ...entry,
      title,
      content: editor?.getHTML() || '',
      tags,
      mood: { scale: moodScale },
      energyDrained,
      energyGained: value,
    }, true); // Sync on energy field change
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...tags, tagInput.trim()].filter(
        (tag, index, self) => self.indexOf(tag) === index
      );
      setTags(newTags);
      setTagInput('');
      handleSave({
        ...entry,
        title,
        content: editor?.getHTML() || '',
        tags: newTags,
        mood: { scale: moodScale },
        energyDrained,
        energyGained,
      }, true); // Sync on tag creation
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    handleSave({
      ...entry,
      title,
      content: editor?.getHTML() || '',
      tags: newTags,
      mood: { scale: moodScale },
      energyDrained,
      energyGained,
    }, true); // Sync on tag removal
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="journal-entry">
      <div className="entry-header">
        <h2 className="entry-date">{formatDateForDisplay(entry.date)}</h2>
        {lastSaved && (
          <span className="save-indicator">Saved {lastSaved.toLocaleTimeString()}</span>
        )}
      </div>

      <div className="entry-content">
        <input
          type="text"
          className="entry-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Entry title..."
        />

        <div className="editor-container">
          <EditorContent editor={editor} />
        </div>

        <div className="entry-meta">
          <div className="mood-section">
            <label>Mood</label>
            <div className="mood-controls">
              <div className="mood-scale">
                {MOOD_SCALES.map((scale) => (
                  <button
                    key={scale}
                    className={`mood-scale-btn ${moodScale === scale ? 'active' : ''}`}
                    onClick={() => handleMoodScaleChange(scale)}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="energy-section">
            <div className="energy-item">
              <label>What drained my energy?</label>
              <textarea
                value={energyDrained}
                onChange={(e) => handleEnergyDrainedChange(e.target.value)}
                placeholder="Reflect on what took energy away..."
                rows={2}
                className="energy-input"
              />
            </div>
            <div className="energy-item">
              <label>What energized me?</label>
              <textarea
                value={energyGained}
                onChange={(e) => handleEnergyGainedChange(e.target.value)}
                placeholder="Reflect on what gave you energy..."
                rows={2}
                className="energy-input"
              />
            </div>
          </div>

          <div className="tags-section">
            <label>Tags</label>
            <div className="tags-container">
              {tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
              <input
                type="text"
                className="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag (press Enter)"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .journal-entry {
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem;
          background: var(--bg-primary);
          box-sizing: border-box;
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .entry-date {
          font-size: 1.5rem;
          font-weight: 400;
          font-family: var(--font-serif);
          letter-spacing: -0.01em;
          color: var(--text-primary);
          margin: 0;
        }

        .save-indicator {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .entry-title {
          width: 100%;
          font-size: 1.5rem;
          font-weight: 400;
          font-family: var(--font-serif);
          letter-spacing: -0.01em;
          border: none;
          border-bottom: 2px solid var(--border);
          padding: 0.5rem 0;
          margin-bottom: 1.5rem;
          background: transparent;
          color: var(--text-primary);
        }

        .entry-title:focus {
          outline: none;
          border-bottom-color: var(--accent);
        }

        .entry-title::placeholder {
          color: var(--text-secondary);
        }

        .editor-container {
          min-height: 400px;
          margin-bottom: 2rem;
        }

        .editor-container .ProseMirror {
          min-height: 400px;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 1rem;
          line-height: 1.75;
          font-family: var(--font-sans);
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .editor-container .ProseMirror:focus {
          outline: none;
          border-color: var(--accent);
        }

        .editor-container .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-secondary);
          pointer-events: none;
          height: 0;
        }

        .entry-meta {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }

        .mood-section label,
        .energy-section label,
        .tags-section label {
          display: block;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .mood-controls {
          display: flex;
        }

        .mood-scale {
          display: flex;
          gap: 0.5rem;
          width: 100%;
        }

        .energy-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .energy-item {
          display: flex;
          flex-direction: column;
        }

        .energy-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.9375rem;
          font-family: var(--font-sans);
          line-height: 1.5;
          background: var(--bg-primary);
          color: var(--text-primary);
          resize: vertical;
          transition: border-color 0.2s;
        }

        .energy-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .energy-input::placeholder {
          color: var(--text-secondary);
        }

        .mood-scale-btn {
          flex: 1;
          padding: 0.5rem;
          border: 2px solid var(--border);
          background: var(--bg-primary);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .mood-scale-btn:hover {
          border-color: var(--accent);
        }

        .mood-scale-btn.active {
          background: var(--accent);
          color: var(--bg-primary);
          border-color: var(--accent);
        }


        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: var(--bg-secondary);
          border-radius: 20px;
          font-size: 0.875rem;
          font-family: var(--font-sans);
          color: var(--text-primary);
        }

        .tag button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1;
          padding: 0;
        }

        .tag button:hover {
          color: #c53030;
        }

        .tag-input {
          border: 2px dashed var(--border);
          border-radius: 20px;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          font-family: var(--font-sans);
          min-width: 150px;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .tag-input:focus {
          outline: none;
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}
