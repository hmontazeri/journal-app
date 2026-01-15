import { useState, useEffect, useCallback } from 'react';
import { JournalEntry, JournalData } from '../types';
import { getTodayDateString, formatDateString } from '../utils/date';
import { getLocalJournalData, saveLocalJournalData } from '../services/storage';
import { generateUUID } from '../utils/encryption';

export function useJournal() {
  const [journalData, setJournalData] = useState<JournalData | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [loading, setLoading] = useState(true);

  // Load journal data on mount
  useEffect(() => {
    loadJournalData();
  }, []);

  const loadJournalData = async () => {
    try {
      const data = await getLocalJournalData();
      if (data) {
        setJournalData(data);
      } else {
        // Initialize empty journal
        const newData: JournalData = {
          entries: {},
          metadata: {
            lastSync: new Date().toISOString(),
            version: '1.0',
            deviceId: generateUUID(),
          },
        };
        setJournalData(newData);
        await saveLocalJournalData(newData);
      }
    } catch (error) {
      console.error('Failed to load journal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntry = useCallback(
    (date: string): JournalEntry | null => {
      if (!journalData) return null;
      return journalData.entries[date] || null;
    },
    [journalData]
  );

  const getOrCreateEntry = useCallback(
    (date: string): JournalEntry => {
      if (!journalData) {
        throw new Error('Journal data not loaded');
      }

      const existing = journalData.entries[date];
      if (existing) {
        return existing;
      }

      // Create new entry
      const newEntry: JournalEntry = {
        id: generateUUID(),
        date,
        title: '',
        content: '',
        tags: [],
        mood: {
          scale: 5,
        },
        energyDrained: '',
        energyGained: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return newEntry;
    },
    [journalData]
  );

  const saveEntry = useCallback(
    async (entry: JournalEntry) => {
      if (!journalData) return;

      const updatedEntry = {
        ...entry,
        updatedAt: new Date().toISOString(),
      };

      const updatedData: JournalData = {
        ...journalData,
        entries: {
          ...journalData.entries,
          [entry.date]: updatedEntry,
        },
        metadata: {
          ...journalData.metadata,
          lastSync: new Date().toISOString(),
        },
      };

      setJournalData(updatedData);
      await saveLocalJournalData(updatedData);
    },
    [journalData]
  );

  const getCurrentEntry = useCallback((): JournalEntry => {
    return getOrCreateEntry(currentDate);
  }, [currentDate, getOrCreateEntry]);

  // Auto-scroll to today if it's a new day
  useEffect(() => {
    const today = getTodayDateString();
    if (today !== currentDate) {
      setCurrentDate(today);
    }
  }, []);

  return {
    journalData,
    currentDate,
    setCurrentDate,
    getEntry,
    getOrCreateEntry,
    saveEntry,
    getCurrentEntry,
    loading,
    reload: loadJournalData,
  };
}
