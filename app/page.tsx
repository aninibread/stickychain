'use client';

import { useState } from 'react';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import StickyNote from './components/StickyNote';
import StickyNoteContract from './components/StickyNoteContract';
import Onboarding from './components/Onboarding';
import { useStickyNotes } from './hooks/useStickyNotes';

const colors = ['yellow', 'pink', 'blue', 'green', 'purple'];

export default function App() {
  const { address, isConnected } = useAccount();
  const { notes, isLoading, addNote, updateNote, deleteNote } = useStickyNotes();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', color: 'yellow' });
  const [placementMode, setPlacementMode] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ content: string; color: string; x: number; y: number } | null>(null);
  const [showTransaction, setShowTransaction] = useState(false);

  const handleCreateNote = () => {
    setIsCreating(true);
    setNewNote({ content: '', color: 'yellow' });
  };

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  // Show onboarding if wallet not connected or onboarding not complete
  if (!isConnected || !onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const handleSaveNote = () => {
    if (newNote.content.trim()) {
      setPendingNote({
        content: newNote.content,
        color: newNote.color,
        x: 0,
        y: 0
      });
      setIsCreating(false);
      setPlacementMode(true);
    }
  };

  const handlePlaceNote = (e: React.MouseEvent) => {
    if (placementMode && pendingNote) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPendingNote({ ...pendingNote, x, y });
      setPlacementMode(false);
      setShowTransaction(true);
    }
  };

  const handleTransactionSuccess = () => {
    if (pendingNote) {
      addNote({
        content: pendingNote.content,
        x: pendingNote.x,
        y: pendingNote.y,
        color: pendingNote.color,
        author: address || 'Unknown'
      });
    }
    setPendingNote(null);
    setShowTransaction(false);
    setNewNote({ content: '', color: 'yellow' });
  };

  const handleTransactionError = () => {
    setShowTransaction(false);
    setPlacementMode(true); // Allow user to try placing again
  };

  const handleUpdateNote = (id: string, updates: { content?: string; x?: number; y?: number }) => {
    updateNote(id, updates);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-10 p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-black">
              StickyChain
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNote}
              className="bg-black hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Note
            </button>
            <Wallet>
              <ConnectWallet className="border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 transition-colors bg-white">
                <div className="flex items-center gap-2 text-black">
                  <Avatar className="h-5 w-5 border border-gray-300 rounded-full bg-gray-100" />
                  <Name className="text-black font-medium" />
                </div>
              </ConnectWallet>
              <WalletDropdown className="bg-white border border-gray-200 shadow-lg rounded-lg">
                <Identity className="px-4 py-3" hasCopyAddressOnClick>
                  <Avatar className="mb-2" />
                  <Name className="text-black font-semibold text-base block mb-1" />
                  <Address className="text-gray-500 text-sm block mb-1" />
                  <EthBalance className="text-gray-500 text-sm block" />
                </Identity>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-gray-50 text-black font-medium block px-4 py-2"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect className="hover:bg-red-50 text-red-600 font-medium block px-4 py-2" />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </header>

      <main className="pt-16 h-screen relative bg-gray-50">
        <div 
          className={`w-full h-full relative ${placementMode ? 'cursor-crosshair' : 'cursor-default'}`}
          onClick={handlePlaceNote}
        >
          {isLoading && (
            <div className="absolute top-4 left-4 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg shadow-sm z-30">
              Loading...
            </div>
          )}
          
          {placementMode && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg z-30">
              Click to place
            </div>
          )}
          
          {notes.map((note) => (
            <StickyNote
              key={note.id}
              id={note.id}
              content={note.content}
              x={note.x}
              y={note.y}
              author={note.author}
              color={note.color}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))}
          
          {isCreating && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4 text-black">New Note</h3>
                
                <div className="mb-4">
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewNote({ ...newNote, color })}
                        className={`w-6 h-6 rounded border-2 transition-all ${
                          newNote.color === color ? 'border-black scale-110' : 'border-gray-300 hover:border-gray-400'
                        } ${
                          color === 'yellow' ? 'bg-yellow-200' :
                          color === 'pink' ? 'bg-pink-200' :
                          color === 'blue' ? 'bg-blue-200' :
                          color === 'green' ? 'bg-green-200' :
                          'bg-purple-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="What's on your mind?"
                  className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-black transition-colors text-gray-900 placeholder-gray-500"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50"
                    disabled={!newNote.content.trim()}
                  >
                    Place
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTransaction && pendingNote && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4 text-black">Post Onchain</h3>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className={`p-3 rounded text-sm text-gray-900 ${
                    pendingNote.color === 'yellow' ? 'bg-yellow-200' :
                    pendingNote.color === 'pink' ? 'bg-pink-200' :
                    pendingNote.color === 'blue' ? 'bg-blue-200' :
                    pendingNote.color === 'green' ? 'bg-green-200' :
                    'bg-purple-200'
                  }`}>
                    {pendingNote.content}
                  </div>
                </div>
                
                <StickyNoteContract
                  content={pendingNote.content}
                  x={pendingNote.x}
                  y={pendingNote.y}
                  color={pendingNote.color}
                  onSuccess={handleTransactionSuccess}
                  onError={handleTransactionError}
                />
                <button
                  onClick={() => setShowTransaction(false)}
                  className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
