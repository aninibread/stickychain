'use client';

import { useState, useEffect } from 'react';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Address,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import StickyNote from './components/StickyNote';
import StickyNoteContract from './components/StickyNoteContract';
import Onboarding from './components/Onboarding';
import { useStickyNotes } from './hooks/useStickyNotes';

const colors = ['yellow', 'pink', 'blue', 'green', 'purple'];

export default function App() {
  const { address, isConnected } = useAccount();
  const { notes, addNote } = useStickyNotes();
  const [hasMounted, setHasMounted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', color: 'yellow' });
  const [placementMode, setPlacementMode] = useState(false);
  const [pendingNote, setPendingNote] = useState<{ content: string; color: string; x: number; y: number } | null>(null);
  const [showTransaction, setShowTransaction] = useState(false);
  
  // Camera controls for pan and zoom
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const handleCreateNote = () => {
    setIsCreating(true);
    setNewNote({ content: '', color: 'yellow' });
  };

  const handleOnboardingComplete = () => {
    // Onboarding complete - no state needed since we removed the modal
  };

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Show loading state during hydration
  if (!hasMounted) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-black mb-3 tracking-tight">
            StickyChain
          </h1>
          <p className="text-gray-500 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if wallet not connected
  if (!isConnected) {
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

  // Camera and interaction handlers
  const screenToWorld = (screenX: number, screenY: number) => {
    return {
      x: (screenX - camera.x) / camera.zoom,
      y: (screenY - camera.y) / camera.zoom
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, camera.zoom * zoomFactor));
    
    // Zoom towards mouse position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setCamera(prev => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / prev.zoom),
      y: mouseY - (mouseY - prev.y) * (newZoom / prev.zoom),
      zoom: newZoom
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (placementMode && pendingNote) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const worldPos = screenToWorld(screenX, screenY);
      
      setPendingNote({ ...pendingNote, x: worldPos.x, y: worldPos.y });
      setPlacementMode(false);
      setShowTransaction(true);
      return;
    }

    // Start panning with any mouse button when not in placement mode
    if (e.button === 0) {
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setCamera(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
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


  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-10 p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                StickyChain
              </h1>
              <p className="text-sm text-gray-500 font-medium">Permanent notes on the blockchain</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateNote}
              className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
            <Wallet>
              <ConnectWallet className="border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 transition-colors bg-white">
                <div className="flex items-center gap-2 text-black">
                  <Avatar className="h-5 w-5 border border-gray-300 rounded-full bg-gray-100" />
                  <Name className="text-black font-medium" />
                </div>
              </ConnectWallet>
              <WalletDropdown className="bg-transparent border-none shadow-none rounded-none overflow-visible min-w-[320px]">
                <div className="p-6 border-b border-gray-700">
                  {address && (
                    <div className="flex items-center gap-3 w-full">
                      <Avatar 
                        address={address}
                        chain={baseSepolia}
                        className="h-12 w-12 border-2 border-gray-600 rounded-full" 
                      />
                      <div className="flex-1 min-w-0">
                        <Name 
                          address={address}
                          chain={baseSepolia}
                          className="text-lg font-bold text-white block truncate"
                        />
                        <Address 
                          address={address}
                          className="text-sm text-gray-300 font-mono block truncate" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-gray-800 text-white hover:text-blue-300 font-semibold flex items-center gap-3 px-6 py-3 transition-colors border-b border-gray-700"
                >
                  Manage Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect className="hover:bg-gray-800 text-red-300 hover:text-red-200 font-semibold flex items-center gap-3 px-6 py-3 transition-colors" />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </header>

      <main className="pt-20 h-screen relative bg-gradient-to-br from-gray-50 to-gray-100">
        <div 
          className={`w-full h-full relative overflow-hidden ${placementMode ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          
          {placementMode && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-xl z-30 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Click anywhere to place your note</span>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {notes.length === 0 && !placementMode && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No notes yet</h3>
                <p className="text-gray-600 leading-relaxed">Create your first permanent sticky note on the blockchain. Once created, it will live here forever.</p>
              </div>
            </div>
          )}
          
          {/* Camera transform container */}
          <div 
            style={{
              transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
          >
            {/* Grid background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: `${50 * camera.zoom}px ${50 * camera.zoom}px`,
                backgroundPosition: `${camera.x % (50 * camera.zoom)}px ${camera.y % (50 * camera.zoom)}px`
              }}
            />
            
            {notes.map((note) => (
              <StickyNote
                key={note.id}
                id={note.id}
                content={note.content}
                x={note.x}
                y={note.y}
                author={note.author}
                color={note.color}
              />
            ))}
          </div>
          
          {isCreating && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 w-[480px] max-w-[90vw]">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Create New Note</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Color</label>
                  <div className="flex gap-3 justify-center">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewNote({ ...newNote, color })}
                        className={`w-12 h-12 rounded-xl border-3 transition-all duration-200 transform hover:scale-110 ${
                          newNote.color === color ? 'border-gray-800 scale-110 shadow-lg' : 'border-gray-300 hover:border-gray-500'
                        } ${
                          color === 'yellow' ? 'bg-yellow-300 shadow-yellow-200/50' :
                          color === 'pink' ? 'bg-pink-300 shadow-pink-200/50' :
                          color === 'blue' ? 'bg-blue-300 shadow-blue-200/50' :
                          color === 'green' ? 'bg-green-300 shadow-green-200/50' :
                          'bg-purple-300 shadow-purple-200/50'
                        }`}
                        title={`${color.charAt(0).toUpperCase() + color.slice(1)} note`}
                      >
                        {newNote.color === color && (
                          <svg className="w-6 h-6 text-gray-800 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Your Message</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Write your permanent message here..."
                    className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-gray-800 transition-colors text-gray-900 placeholder-gray-500 font-medium leading-relaxed"
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      ⚠️ This note will be permanent on the blockchain
                    </span>
                    <span className="text-xs text-gray-400">
                      {newNote.content.length}/280
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center gap-2"
                    disabled={!newNote.content.trim()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Place Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTransaction && pendingNote && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 w-[480px] max-w-[90vw]">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Confirm Blockchain Transaction</h3>
                
                <div className="mb-6">
                  <div className="flex justify-center">
                    <div className={`p-4 rounded-xl shadow-xl border-2 max-w-xs ${
                      pendingNote.color === 'yellow' ? 'bg-yellow-300 border-yellow-400 shadow-yellow-200/50' :
                      pendingNote.color === 'pink' ? 'bg-pink-300 border-pink-400 shadow-pink-200/50' :
                      pendingNote.color === 'blue' ? 'bg-blue-300 border-blue-400 shadow-blue-200/50' :
                      pendingNote.color === 'green' ? 'bg-green-300 border-green-400 shadow-green-200/50' :
                      'bg-purple-300 border-purple-400 shadow-purple-200/50'
                    }`} style={{ 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap mb-3 font-medium leading-relaxed">
                        {pendingNote.content}
                      </div>
                      <div className="text-xs text-gray-600 font-mono bg-black/5 px-2 py-1 rounded-md">
                        by {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <StickyNoteContract
                  content={pendingNote.content}
                  x={Math.round(pendingNote.x)}
                  y={Math.round(pendingNote.y)}
                  color={pendingNote.color}
                  onSuccess={handleTransactionSuccess}
                  onError={handleTransactionError}
                />
                <button
                  onClick={() => setShowTransaction(false)}
                  className="w-full mt-4 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel Transaction
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
