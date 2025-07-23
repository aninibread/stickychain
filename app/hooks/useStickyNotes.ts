'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface OnchainStickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  author: string;
  color: string;
  timestamp: number;
}

// const STICKY_NOTES_CONTRACT_ADDRESS = '0x123...'; // This would be the deployed contract address
// const STICKY_NOTES_ABI = [...] // Contract ABI would go here for production

export function useStickyNotes() {
  const { address } = useAccount();
  const [notes, setNotes] = useState<OnchainStickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real implementation, this would read from the blockchain
  // For now, we'll simulate it with localStorage for demo purposes
  useEffect(() => {
    const loadNotes = () => {
      try {
        const stored = localStorage.getItem('stickyNotes');
        if (stored) {
          const parsedNotes = JSON.parse(stored);
          setNotes(parsedNotes);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadNotes();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addNote = (note: Omit<OnchainStickyNote, 'id' | 'timestamp'>) => {
    const newNote: OnchainStickyNote = {
      ...note,
      id: Date.now().toString(),
      timestamp: Date.now(),
      author: address || 'Unknown'
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    
    // In a real implementation, this would be stored onchain
    // For demo, we'll use localStorage
    try {
      localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'stickyNotes',
        newValue: JSON.stringify(updatedNotes)
      }));
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const updateNote = (id: string, updates: Partial<OnchainStickyNote>) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    );
    setNotes(updatedNotes);
    
    try {
      localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'stickyNotes',
        newValue: JSON.stringify(updatedNotes)
      }));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    try {
      localStorage.setItem('stickyNotes', JSON.stringify(updatedNotes));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'stickyNotes',
        newValue: JSON.stringify(updatedNotes)
      }));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote
  };
}