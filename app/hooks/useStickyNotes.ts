'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';

interface OnchainStickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  author: string;
  color: string;
  timestamp: number;
}

const STICKY_NOTES_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;
const STICKY_NOTES_ABI = [
  {
    inputs: [],
    name: 'getNotes',
    outputs: [
      {
        components: [
          { name: 'content', type: 'string' },
          { name: 'x', type: 'uint256' },
          { name: 'y', type: 'uint256' },
          { name: 'color', type: 'string' },
          { name: 'author', type: 'address' },
          { name: 'timestamp', type: 'uint256' }
        ],
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'noteId', type: 'uint256' },
      { indexed: true, name: 'author', type: 'address' }
    ],
    name: 'NoteCreated',
    type: 'event'
  }
] as const;

export function useStickyNotes() {
  const { address, isConnected, chain } = useAccount();
  const [notes, setNotes] = useState<OnchainStickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug wallet connection
  console.log('=== WALLET STATUS ===');
  console.log('- Connected:', isConnected);
  console.log('- Address:', address);
  console.log('- Chain ID:', chain?.id);
  console.log('- Chain Name:', chain?.name);
  console.log('- Expected Chain ID: 84532 (Base Sepolia)');
  console.log('====================');

  // Read notes from contract - always call this hook with fallback address
  const { data: contractNotes, error, refetch } = useReadContract({
    address: STICKY_NOTES_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: STICKY_NOTES_ABI,
    functionName: 'getNotes',
    query: {
      enabled: !!STICKY_NOTES_CONTRACT_ADDRESS && isConnected && (chain?.id === 84532 || chain?.id === 8453),
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false, // Don't retry failed calls
    }
  });

  // Debug contract call details
  console.log('=== CONTRACT CALL DETAILS ===');
  console.log('- Address:', STICKY_NOTES_CONTRACT_ADDRESS);
  console.log('- Address valid:', STICKY_NOTES_CONTRACT_ADDRESS?.startsWith('0x'));
  console.log('- Address length:', STICKY_NOTES_CONTRACT_ADDRESS?.length);
  console.log('- Query enabled conditions:');
  console.log('  - Has address:', !!STICKY_NOTES_CONTRACT_ADDRESS);
  console.log('  - Is connected:', isConnected);
  console.log('  - On Base network:', chain?.id === 84532 || chain?.id === 8453);
  console.log('  - Overall enabled:', !!STICKY_NOTES_CONTRACT_ADDRESS && isConnected && (chain?.id === 84532 || chain?.id === 8453));
  console.log('=============================');

  // Watch for new notes being created - always call this hook with fallback address
  useWatchContractEvent({
    address: STICKY_NOTES_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: STICKY_NOTES_ABI,
    eventName: 'NoteCreated',
    onLogs() {
      // Refetch notes when new ones are created
      if (STICKY_NOTES_CONTRACT_ADDRESS) {
        refetch();
      }
    },
  });

  // Process contract data when it changes - PURE BLOCKCHAIN READING ONLY
  useEffect(() => {
    console.log('=== BLOCKCHAIN READ STATUS ===');
    console.log('🔗 READING FROM BLOCKCHAIN - NO SESSION/LOCALSTORAGE');
    console.log('Contract address:', STICKY_NOTES_CONTRACT_ADDRESS);
    console.log('Contract notes data:', contractNotes);
    console.log('Contract error:', error);
    console.log('Error type:', error?.name);
    console.log('Error message:', error?.message);
    console.log('Data source: BLOCKCHAIN ONLY');

    if (STICKY_NOTES_CONTRACT_ADDRESS) {
      if (contractNotes && Array.isArray(contractNotes)) {
        console.log('✅ BLOCKCHAIN READ SUCCESS:', contractNotes.length, 'notes from smart contract');
        console.log('📦 Raw blockchain data:', contractNotes);
        
        // Transform contract data to our format - DIRECT FROM BLOCKCHAIN
        const transformedNotes: OnchainStickyNote[] = contractNotes.map((note, index) => {
          console.log(`🔗 Processing blockchain note ${index}:`, {
            content: note.content,
            x: note.x.toString(),
            y: note.y.toString(),
            color: note.color,
            author: note.author,
            timestamp: note.timestamp.toString()
          });
          return {
            id: index.toString(),
            content: note.content,
            x: Number(note.x),
            y: Number(note.y),
            color: note.color,
            author: note.author,
            timestamp: Number(note.timestamp)
          };
        });
        
        console.log('✅ FINAL BLOCKCHAIN NOTES TO DISPLAY:', transformedNotes);
        console.log('🚫 NO SESSION/LOCALSTORAGE USED - PURE ONCHAIN DATA');
        setNotes(transformedNotes);
        setIsLoading(false);
      } else if (error) {
        console.log('❌ BLOCKCHAIN READ FAILED:', error);
        console.log('This likely means:');
        console.log('1. Contract not deployed at this address');
        console.log('2. Contract missing getNotes function'); 
        console.log('3. Wrong network (need Base Sepolia or Base Mainnet)');
        console.log('4. Network connection issue');
        setNotes([]); // Empty array - no fallback to session storage
        setIsLoading(false);
      } else if (contractNotes === undefined) {
        console.log('⏳ BLOCKCHAIN READ IN PROGRESS...');
        console.log('🔗 Waiting for smart contract response...');
        // Still loading, keep isLoading true
      } else {
        console.log('⚠️ UNEXPECTED BLOCKCHAIN RESPONSE:', contractNotes);
        setNotes([]);
        setIsLoading(false);
      }
    } else {
      console.log('❌ NO CONTRACT ADDRESS - CANNOT READ FROM BLOCKCHAIN');
      console.log('🚫 NO FALLBACK TO SESSION - ONCHAIN ONLY MODE');
      setNotes([]);
      setIsLoading(false);
    }
  }, [contractNotes, error]);

  const addNote = (note: Omit<OnchainStickyNote, 'id' | 'timestamp'>) => {
    // 🔗 ONCHAIN ONLY - Notes are added via blockchain transaction only
    // The actual addition happens in the smart contract
    // The contract event will trigger a refetch from blockchain
    console.log('🔗 addNote called - ONCHAIN TRANSACTION ONLY');
    console.log('🚫 NO SESSION/LOCALSTORAGE - BLOCKCHAIN ONLY');
    console.log('📝 Note will be added via smart contract transaction');
  };

  const updateNote = (id: string, updates: Partial<OnchainStickyNote>) => {
    // 🔗 ONCHAIN ONLY - Updates require separate smart contract function
    // For now, we'll update locally as a temporary preview
    // The next blockchain refetch will restore the true state
    console.log('🔗 updateNote called - TEMPORARY LOCAL UPDATE');
    console.log('📝 True state comes from blockchain only');
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    );
    setNotes(updatedNotes);
  };

  const deleteNote = (id: string) => {
    // 🔗 ONCHAIN ONLY - Deletes require separate smart contract function
    // For now, we'll delete locally as a temporary preview
    // The next blockchain refetch will restore the true state
    console.log('🔗 deleteNote called - TEMPORARY LOCAL DELETE');
    console.log('📝 True state comes from blockchain only');
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
  };

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    isOnchain: !!STICKY_NOTES_CONTRACT_ADDRESS
  };
}